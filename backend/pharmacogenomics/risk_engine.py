"""
Risk Engine Module - Maps drug/phenotype combinations to risk levels and severity.
Optimized with cached lookup structures.
"""

import logging
from typing import Dict, Tuple, FrozenSet

logger = logging.getLogger(__name__)


# Drug to gene mappings using uppercase canonical keys (for case-insensitive matching)
# Primary gene is determined solely by this mapping - one gene per drug.
DRUG_GENE_MAPPING: Dict[str, str] = {
    "WARFARIN": "CYP2C9",
    "CLOPIDOGREL": "CYP2C19",
    "CODEINE": "CYP2D6",
    "SIMVASTATIN": "SLCO1B1",
    "AZATHIOPRINE": "TPMT",
    "5-FLUOROURACIL": "DPYD",
}

# Aliases: map alternate names/spellings to canonical drug key (uppercase).
# Ensures primary_gene is correct regardless of how the user enters the drug name.
DRUG_ALIASES: Dict[str, str] = {
    "5-FU": "5-FLUOROURACIL",
    "5FU": "5-FLUOROURACIL",
    "FLUOROURACIL": "5-FLUOROURACIL",
    "FLUOROURACIL 5": "5-FLUOROURACIL",
    "CAPECITABINE": "5-FLUOROURACIL",  # prodrug of 5-FU, same DPYD gene
}

# Cached frozenset of known drugs for O(1) lookup (canonical keys only)
_KNOWN_DRUGS: FrozenSet[str] = frozenset(DRUG_GENE_MAPPING.keys())

# Risk mapping: (drug, phenotype) -> (risk_label, severity)
# risk_label: "Safe", "Adjust Dosage", "Toxic", "Ineffective", "Unknown"
# severity: "none", "low", "moderate", "high", "critical"
RISK_MAPPINGS: Dict[Tuple[str, str], Tuple[str, str]] = {
    # Warfarin (anticoagulant) + CYP2C9
    ("WARFARIN", "PM"): ("Toxic", "critical"),
    ("WARFARIN", "IM"): ("Adjust Dosage", "moderate"),
    ("WARFARIN", "NM"): ("Safe", "none"),
    ("WARFARIN", "URM"): ("Adjust Dosage", "low"),
    
    # Clopidogrel (antiplatelet) + CYP2C19
    ("CLOPIDOGREL", "PM"): ("Ineffective", "high"),
    ("CLOPIDOGREL", "IM"): ("Adjust Dosage", "moderate"),
    ("CLOPIDOGREL", "NM"): ("Safe", "none"),
    ("CLOPIDOGREL", "URM"): ("Safe", "low"),
    
    # Codeine (opioid) + CYP2D6
    ("CODEINE", "PM"): ("Ineffective", "moderate"),
    ("CODEINE", "IM"): ("Safe", "low"),
    ("CODEINE", "NM"): ("Safe", "none"),
    ("CODEINE", "URM"): ("Toxic", "critical"),
    
    # Simvastatin (statin) + SLCO1B1
    ("SIMVASTATIN", "PM"): ("Toxic", "critical"),
    ("SIMVASTATIN", "IM"): ("Adjust Dosage", "moderate"),
    ("SIMVASTATIN", "NM"): ("Safe", "none"),
    ("SIMVASTATIN", "URM"): ("Safe", "low"),
    
    # Azathioprine (immunosuppressant) + TPMT
    ("AZATHIOPRINE", "PM"): ("Toxic", "critical"),
    ("AZATHIOPRINE", "IM"): ("Adjust Dosage", "moderate"),
    ("AZATHIOPRINE", "NM"): ("Safe", "none"),
    ("AZATHIOPRINE", "URM"): ("Safe", "low"),
    
    # 5-Fluorouracil (chemotherapy) + DPYD
    ("5-FLUOROURACIL", "PM"): ("Toxic", "critical"),
    ("5-FLUOROURACIL", "IM"): ("Adjust Dosage", "moderate"),
    ("5-FLUOROURACIL", "NM"): ("Safe", "none"),
    ("5-FLUOROURACIL", "URM"): ("Safe", "low"),
}


class RiskEngine:
    """Map drug/phenotype combinations to risk levels and severity with optimized lookups."""
    
    @staticmethod
    def get_risk_and_severity(drug: str, phenotype: str) -> Tuple[str, str]:
        """
        Get risk label and severity for drug and phenotype (O(1) lookup).
        
        Args:
            drug: Drug name (uppercase)
            phenotype: Phenotype (PM, IM, NM, URM, Unknown)
        
        Returns:
            Tuple of (risk_label, severity)
            risk_label: Safe, Adjust Dosage, Toxic, Ineffective, Unknown
            severity: none, low, moderate, high, critical
        """
        # Unknown or missing phenotype: no actionable risk (CPIC: insufficient evidence)
        if phenotype == "Unknown" or not phenotype:
            logger.debug(f"Risk lookup: {drug} + Unknown phenotype, returning Unknown/none")
            return ("Unknown", "none")
        
        # Direct tuple lookup in RISK_MAPPINGS (O(1)); severity: none < low < moderate < high < critical
        result = RISK_MAPPINGS.get((drug, phenotype))
        if result:
            risk_label, severity = result
            logger.debug(f"Risk lookup: {drug} + {phenotype} = {risk_label}/{severity}")
            return risk_label, severity
        
        # Unmapped (drug, phenotype) e.g. future "RM" - do not default to Safe
        logger.debug(f"Risk lookup: {drug} + {phenotype} not found, returning Unknown/none")
        return ("Unknown", "none")
    
    @staticmethod
    def normalize_drug(drug: str) -> str:
        """
        Normalize drug name to canonical uppercase key for consistent gene lookup.
        Resolves aliases so primary_gene is always correct.
        """
        if not drug or not isinstance(drug, str):
            return ""
        key = drug.strip().upper()
        return DRUG_ALIASES.get(key, key)

    @staticmethod
    def get_gene_for_drug(drug: str) -> str:
        """
        Get the primary gene for a drug. Uses canonical drug key only (no variant/VCF data).
        
        Args:
            drug: Drug name (will be normalized via normalize_drug before lookup)
        
        Returns:
            Gene symbol (e.g. CYP2C9) or "UNKNOWN" if drug not in mapping
        """
        canonical = RiskEngine.normalize_drug(drug)
        return DRUG_GENE_MAPPING.get(canonical, "UNKNOWN")

    @staticmethod
    def is_known_drug(drug: str) -> bool:
        """Check if drug is in our knowledge base (O(1) frozenset lookup). Uses canonical key."""
        canonical = RiskEngine.normalize_drug(drug)
        return canonical in _KNOWN_DRUGS
    
    @staticmethod
    def get_all_drugs() -> list:
        """Get list of all supported drugs."""
        return list(DRUG_GENE_MAPPING.keys())
