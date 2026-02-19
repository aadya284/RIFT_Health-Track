"""
VCF Parser Module - Parses VCF v4.2 files and extracts pharmacogenomic variants.
Uses pysam for proper VCF format compliance and safe parsing.
"""

import logging
from collections import defaultdict
from typing import Dict, List, Optional

try:
    import pysam
    HAS_PYSAM = True
except ImportError:
    HAS_PYSAM = False
    # Fallback to manual parsing if pysam not available
    import warnings
    warnings.warn("pysam not installed. Using fallback manual VCF parsing. Install pysam for better reliability.")

logger = logging.getLogger(__name__)


# Target genes for pharmacogenomic analysis (frozenset for O(1) lookup)
TARGET_GENES = frozenset({
    "CYP2D6",
    "CYP2C9",
    "CYP2C19",
    "SLCO1B1",
    "TPMT",
    "DPYD"
})


class VCFParser:
    """Parse VCF v4.2 files and extract pharmacogenomic variants."""
    
    def __init__(self, vcf_file_path: str):
        """Initialize VCF parser with file path."""
        self.vcf_file_path = vcf_file_path
    
    def parse(self) -> Dict[str, List[Dict]]:
        """
        Parse VCF v4.2 file and extract variants for target genes.
        
        Returns:
            Dictionary mapping gene names to list of variant records
        """
        variants_by_gene = defaultdict(list)
        logger.info(f"Starting VCF parse: {self.vcf_file_path}")
        
        try:
            # Use pysam if available for proper VCF compliance
            if HAS_PYSAM:
                return self._parse_with_pysam(variants_by_gene)
            else:
                return self._parse_manual_fallback(variants_by_gene)
            
        except FileNotFoundError:
            logger.error(f"VCF file not found: {self.vcf_file_path}")
            return self._get_empty_result()
        except Exception as e:
            logger.error(f"Error parsing VCF: {e}")
            return self._get_empty_result()
    
    def _parse_with_pysam(self, variants_by_gene: defaultdict) -> Dict[str, List[Dict]]:
        """
        Parse VCF using pysam (industry standard for VCF v4.2).
        Handles all edge cases properly.
        """
        try:
            vcf_file = pysam.VariantFile(self.vcf_file_path)
            
            for record in vcf_file:
                # Safely extract gene from INFO field
                gene = record.info.get("GENE", None) if record.info else None
                
                # Skip if no gene or gene not in target list
                if gene is None:
                    continue
                
                # Handle GENE as list (pysam returns as list for repeated fields)
                if isinstance(gene, (list, tuple)):
                    gene = str(gene[0]) if gene else None
                else:
                    gene = str(gene)
                
                if gene not in TARGET_GENES:
                    continue
                
                # Safely extract rsID (record.id can be None)
                rsid = record.id if record.id else None
                
                # Validate rsID format if present
                if rsid and not (rsid.startswith("rs") and len(rsid) > 2):
                    rsid = None
                
                # Build variant record
                variant = {
                    "rsid": rsid,
                    "chrom": record.chrom,
                    "pos": int(record.pos),
                    "ref": record.ref,
                    "alt": record.alts[0] if record.alts else None,
                    "gene": gene
                }
                
                variants_by_gene[gene].append(variant)
                logger.debug(f"Found variant: {gene} rs={rsid} at {record.chrom}:{record.pos}")
            
            vcf_file.close()
        
        except Exception as e:
            logger.error(f"pysam parsing failed: {e}, falling back to manual parsing")
            return self._parse_manual_fallback(variants_by_gene)
        
        # Ensure all genes present (even if empty)
        result = dict(variants_by_gene)
        for gene in TARGET_GENES:
            result.setdefault(gene, [])
        
        total_variants = sum(len(v) for v in result.values())
        logger.info(f"VCF parse complete: {total_variants} variants found")
        return result
    
    def _parse_manual_fallback(self, variants_by_gene: defaultdict) -> Dict[str, List[Dict]]:
        """
        Fallback manual VCF parsing if pysam unavailable.
        Uses safe INFO field parsing.
        """
        logger.warning("Using fallback manual VCF parsing (pysam recommended)")
        
        with open(self.vcf_file_path, 'r') as f:
            for line in f:
                # Skip header and comment lines
                if line.startswith('#'):
                    continue
                
                # Parse variant line
                parts = line.rstrip('\n').split('\t')
                if len(parts) < 8:
                    continue
                
                chrom, pos, vid, ref, alt, qual, filt, info = parts[:8]
                
                # Safely extract gene from INFO
                gene = self._extract_gene_from_info(info)
                if gene not in TARGET_GENES:
                    continue
                
                # Safely extract rsID
                rsid = self._extract_rsid(vid)
                
                # Build variant record
                try:
                    pos_int = int(pos)
                except ValueError:
                    pos_int = pos
                
                variant = {
                    "rsid": rsid,
                    "chrom": chrom,
                    "pos": pos_int,
                    "ref": ref,
                    "alt": alt,
                    "gene": gene
                }
                
                variants_by_gene[gene].append(variant)
                logger.debug(f"Found variant: {gene} rs={rsid} at {chrom}:{pos}")
        
        # Ensure all genes present
        result = dict(variants_by_gene)
        for gene in TARGET_GENES:
            result.setdefault(gene, [])
        
        total_variants = sum(len(v) for v in result.values())
        logger.info(f"VCF parse complete: {total_variants} variants found")
        return result
    
    @staticmethod
    def _extract_gene_from_info(info: str) -> Optional[str]:
        """
        Safely extract gene name from INFO field.
        Handles missing fields gracefully.
        """
        if not info or info == ".":
            return None
        
        # Single pass through INFO fields
        for field in info.split(';'):
            if '=' not in field:
                continue
            
            key, _, value = field.partition('=')
            
            # Look for GENE field (standard)
            if key == "GENE":
                return value.split(',')[0] if value else None
            
            if key == "GENENAMES":
                return value.split(',')[0] if value else None
        
        return None
    
    @staticmethod
    def _extract_rsid(vid: str) -> Optional[str]:
        """
        Safely extract rsID from variant ID field.
        Returns None if no valid rsID found.
        """
        if not vid or vid == ".":
            return None
        
        # Fast path: single rsID (most common)
        if ',' not in vid:
            if vid.startswith("rs") and len(vid) > 2:
                return vid if vid[2:].isdigit() else None
            return None
        
        # Multiple IDs - find first rsID
        for id_str in vid.split(','):
            if id_str.startswith("rs") and len(id_str) > 2:
                if id_str[2:].isdigit():
                    return id_str
        
        return None
    
    @staticmethod
    def _get_empty_result() -> Dict[str, List[Dict]]:
        """Return empty result with all target genes."""
        return {gene: [] for gene in TARGET_GENES}
    
    def get_rsids_for_gene(self, gene: str) -> List[str]:
        """Get all rsIDs found for a specific gene from parsed VCF."""
        variants = self.parse()
        rsids = [v["rsid"] for v in variants.get(gene, []) if v["rsid"]]
        return rsids

