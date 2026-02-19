"""
VCF Parser Module - Parses VCF v4.2 files and extracts pharmacogenomic variants.
Pure Python implementation without external dependencies.
"""

import logging
from collections import defaultdict
from typing import Dict, List, Optional

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
    """Parse VCF files and extract pharmacogenomic variants."""
    
    def __init__(self, vcf_file_path: str):
        """Initialize VCF parser with file path."""
        self.vcf_file_path = vcf_file_path
    
    def parse(self) -> Dict[str, List[Dict]]:
        """
        Parse VCF file and extract variants for target genes.
        Uses defaultdict for efficient variant collection.
        
        Returns:
            Dictionary mapping gene names to list of variant records
        """
        variants_by_gene = defaultdict(list)
        logger.info(f"Starting VCF parse: {self.vcf_file_path}")
        
        try:
            with open(self.vcf_file_path, 'r') as f:
                for line in f:
                    # Skip header and comment lines (early return)
                    if line[0] == '#':
                        continue
                    
                    # Parse variant line - split once for efficiency
                    parts = line.rstrip('\n').split('\t')
                    if len(parts) < 8:
                        continue
                    
                    chrom, pos, vid, ref, alt, qual, filt, info = parts[:8]
                    
                    # Fast path: check target genes first
                    gene = self._extract_gene_from_info(info)
                    if gene not in TARGET_GENES:
                        continue
                    
                    # Extract rsID efficiently
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
            
            # Convert defaultdict to regular dict for consistent return type
            result = dict(variants_by_gene)
            # Ensure all genes present (even if empty)
            for gene in TARGET_GENES:
                result.setdefault(gene, [])
            
            total_variants = sum(len(v) for v in result.values())
            logger.info(f"VCF parse complete: {total_variants} variants found")
            return result
            
        except FileNotFoundError:
            logger.error(f"VCF file not found: {self.vcf_file_path}")
            return variants_by_gene
        except Exception as e:
            logger.error(f"Error parsing VCF: {e}")
            return variants_by_gene
    
    @staticmethod
    def _extract_gene_from_info(info: str) -> Optional[str]:
        """Extract gene name from INFO field with optimized lookups."""
        # Early exit for empty/null INFO
        if not info or info == ".":
            return None
        
        # Single pass through INFO fields
        for field in info.split(';'):
            if '=' not in field:
                continue
            
            key, _, value = field.partition('=')
            
            # Fast path checks
            if key == "GENE":
                return value.split(',')[0] if value else None
            
            if key == "GENENAMES":
                return value.split(',')[0] if value else None
            
            # VEP annotation
            if key == "ANN" and len(value) > 3:
                parts = value.split('|')
                if len(parts) > 3 and parts[3]:
                    return parts[3]
        
        return None
    
    @staticmethod
    def _extract_rsid(vid: str) -> Optional[str]:
        """Extract rsID from variant ID field with optimized string operations."""
        if not vid or vid == ".":
            return None
        
        # Fast path: single rsID (most common)
        if ',' not in vid:
            if vid.startswith("rs") and len(vid) > 2 and vid[2:].isdigit():
                return vid
            return None
        
        # Multiple IDs - find first rsID
        for id_str in vid.split(','):
            if id_str.startswith("rs") and len(id_str) > 2:
                if id_str[2:].isdigit():
                    return id_str
        
        return None
    
    def get_rsids_for_gene(self, gene: str) -> List[str]:
        """Get all rsIDs found for a specific gene from parsed VCF."""
        variants = self.parse()
        rsids = [v["rsid"] for v in variants.get(gene, []) if v["rsid"]]
        return rsids
