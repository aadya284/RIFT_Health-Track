"""
Pharmacogenomic Service Module - Main analysis orchestrator.
Requirement #8: analyze(vcf_file_path: str, drug_name: str)
Requirement #9: Returns exactly 6 keys per specification
"""

import logging
from typing import Dict, Any
from .vcf_parser import VCFParser
from .phenotype_engine import PhenotypeEngine
from .risk_engine import RiskEngine

logger = logging.getLogger(__name__)

# Cache for VCF parsing to optimize batch operations
_VCF_CACHE: Dict[str, Dict] = {}


class VCFCache:
    """Context manager for VCF caching during batch operations."""
    
    def __init__(self, enable: bool = False):
        """Initialize cache context manager."""
        self.enable = enable
        self.original_cache = None
    
    def __enter__(self):
        """Enable caching on entry."""
        if self.enable:
            _VCF_CACHE.clear()
            logger.debug("VCF cache enabled")
        return self
    
    def __exit__(self, *args):
        """Clear cache on exit."""
        if self.enable:
            _VCF_CACHE.clear()
            logger.debug("VCF cache cleared")


def configure_logging(level: str = "INFO") -> None:
    """
    Configure logging for pharmacogenomic analysis.
    
    Args:
        level: Logging level - "DEBUG", "INFO", "WARNING", or "ERROR"
    
    Example:
        configure_logging("DEBUG")
        result = analyze("patient.vcf", "Warfarin")
    """
    log_level = getattr(logging, level.upper(), logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create console handler
    handler = logging.StreamHandler()
    handler.setLevel(log_level)
    handler.setFormatter(formatter)
    
    # Configure root logger and module loggers
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(handler)
    
    # Also configure module loggers
    for module_name in ["vcf_parser", "phenotype_engine", "risk_engine", __name__]:
        mod_logger = logging.getLogger(module_name)
        mod_logger.setLevel(log_level)
        if not mod_logger.handlers:
            mod_logger.addHandler(handler)




def _get_confidence_score(phenotype: str, inferred_nm: bool = False) -> float:
    """
    Get confidence score based on phenotype and evidence (CPIC-aligned).
    
    - Genotype-confirmed PM/URM (high clinical impact): 0.95
    - IM (dose/adjust): 0.85
    - Genotype-confirmed NM (tested, normal): 0.75
    - Inferred NM (no variants detected, assumed wild-type): 0.60
    - Unknown (unmapped variant or no call): 0.0
    """
    if inferred_nm:
        return 0.60  # Lower confidence when we infer NM from absence of variants
    phenotype_confidence = {
        "PM": 0.95,
        "URM": 0.95,
        "IM": 0.85,
        "NM": 0.75,
        "Unknown": 0.0
    }
    return phenotype_confidence.get(phenotype, 0.0)


def analyze(vcf_file_path: str, drug_name: str) -> Dict[str, Any]:
    """
    Analyze pharmacogenomic variants for a drug.
    
    Args:
        vcf_file_path: Path to VCF file containing patient variants
        drug_name: Name of drug to analyze (case-insensitive)
    
    Returns:
        Dictionary with exactly these 6 keys:
        - primary_gene: str or None - Gene responsible for drug metabolism
        - detected_rsid: str or None - rsID found in VCF for this gene
        - phenotype: str - Phenotype classification (PM, IM, NM, URM, Unknown)
        - risk_label: str - One of: Safe, Adjust Dosage, Toxic, Ineffective, Unknown
        - severity: str - One of: none, low, moderate, high, critical
        - confidence_score: float - Confidence in the analysis (0.0-1.0)
    """
    # Normalize to canonical drug key (uppercase + alias resolution) so primary_gene is correct
    canonical_drug = RiskEngine.normalize_drug(drug_name)
    if not canonical_drug:
        logger.warning("Empty drug name")
        return {
            "primary_gene": None,
            "detected_rsid": None,
            "phenotype": "Unknown",
            "risk_label": "Unknown",
            "severity": "none",
            "confidence_score": 0.0
        }
    logger.info(f"Starting analysis: vcf_file_path={vcf_file_path}, drug={canonical_drug}")
    
    # Fast path: validate drug first (O(1) frozenset lookup on canonical key)
    if not RiskEngine.is_known_drug(canonical_drug):
        logger.warning(f"Unknown drug: {drug_name} (canonical: {canonical_drug})")
        return {
            "primary_gene": None,
            "detected_rsid": None,
            "phenotype": "Unknown",
            "risk_label": "Unknown",
            "severity": "none",
            "confidence_score": 0.0
        }
    
    # Primary gene comes only from drug→gene mapping (never from VCF/variants)
    primary_gene = RiskEngine.get_gene_for_drug(canonical_drug)
    
    # Parse VCF (cached if VCFCache context is active)
    if vcf_file_path in _VCF_CACHE:
        logger.debug(f"Using cached VCF: {vcf_file_path}")
        variants_by_gene = _VCF_CACHE[vcf_file_path]
    else:
        parser = VCFParser(vcf_file_path)
        variants_by_gene = parser.parse()
        if _VCF_CACHE is not None:  # Cache if context manager active
            _VCF_CACHE[vcf_file_path] = variants_by_gene
    
    # Get variants for primary gene
    gene_variants = variants_by_gene.get(primary_gene, [])
    
    # Default values
    detected_rsid = None
    phenotype = "Unknown"
    confidence_score = 0.0
    
    # Infer phenotype from variant combination (CPIC diplotype logic)
    inferred_nm = False
    if gene_variants:
        rsids = [v.get("rsid") for v in gene_variants if v.get("rsid")]
        phenotype, detected_rsid = PhenotypeEngine.infer_phenotype_from_variants(primary_gene, rsids)
        if not detected_rsid and rsids:
            detected_rsid = rsids[0]
        # If all variants unmapped, phenotype is Unknown
        logger.debug(f"Inferred phenotype: {phenotype} from {len(rsids)} variants for {primary_gene}")
    else:
        phenotype = "NM"
        inferred_nm = True
    
    # Get confidence score: lower for inferred NM, higher for genotype-confirmed
    confidence_score = _get_confidence_score(phenotype, inferred_nm=inferred_nm)
    
    # Get risk and severity from canonical drug and phenotype
    risk_label, severity = RiskEngine.get_risk_and_severity(canonical_drug, phenotype)
    
    # RETURN EXACTLY 6 KEYS AS PER HACKATHON SPEC
    result = {
        "primary_gene": primary_gene,
        "detected_rsid": detected_rsid,
        "phenotype": phenotype,
        "risk_label": risk_label,
        "severity": severity,
        "confidence_score": float(confidence_score)
    }
    
    logger.info(f"Analysis complete: {canonical_drug} -> gene={primary_gene} -> {risk_label} ({severity}), confidence={confidence_score}")
    return result
