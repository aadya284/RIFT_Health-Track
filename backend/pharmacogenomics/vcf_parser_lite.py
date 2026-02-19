"""
Lightweight VCF Parser - Optimized for serverless (no pysam dependency).
Parses VCF v4.2 files with minimal memory footprint.
Only extracts required fields: CHROM, POS, ID, INFO.
"""

import logging
from collections import defaultdict
from typing import Dict, List, Optional, TextIO

logger = logging.getLogger(__name__)

# Target genes for pharmacogenomic analysis
TARGET_GENES = frozenset({
    "CYP2D6",
    "CYP2C9",
    "CYP2C19",
    "SLCO1B1",
    "TPMT",
    "DPYD"
})


class VCFParserLite:
    """Lightweight VCF parser optimized for serverless environments."""
    
    def __init__(self, vcf_file_path: str):
        """Initialize VCF parser with file path."""
        self.vcf_file_path = vcf_file_path
    
    def parse(self) -> Dict[str, List[Dict]]:
        """
        Parse VCF file and extract variants for target genes.
        Streams file line by line (memory efficient).
        
        Returns:
            Dictionary mapping gene names to list of variant records
        """
        variants_by_gene = defaultdict(list)
        
        try:
            with open(self.vcf_file_path, 'r') as vcf_file:
                return self._parse_stream(vcf_file, variants_by_gene)
        
        except FileNotFoundError:
            logger.error(f"VCF file not found: {self.vcf_file_path}")
            return {}
        except Exception as e:
            logger.error(f"Error parsing VCF: {e}")
            return {}
    
    def _parse_stream(self, vcf_file: TextIO, variants_by_gene: dict) -> Dict[str, List[Dict]]:
        """Stream parse VCF file line by line."""
        
        for line in vcf_file:
            # Skip empty lines and comments
            if not line.strip() or line.startswith("##"):
                continue
            
            # Skip header line (column names)
            if line.startswith("#CHROM"):
                continue
            
            # Parse data line
            try:
                variant = self._parse_vcf_line(line.strip())
                if variant:
                    gene = variant.get("gene")
                    if gene and gene in TARGET_GENES:
                        variants_by_gene[gene].append(variant)
            except Exception as e:
                logger.debug(f"Skipping malformed VCF line: {e}")
                continue
        
        return dict(variants_by_gene)
    
    def _parse_vcf_line(self, line: str) -> Optional[Dict]:
        """
        Parse a single VCF data line.
        
        VCF format: CHROM POS ID REF ALT QUAL FILTER INFO ...
        We only need: CHROM (0), POS (1), ID (2), INFO (7)
        """
        if not line or line.startswith("#"):
            return None
        
        fields = line.split("\t")
        
        # Need at least CHROM, POS, ID, INFO columns
        if len(fields) < 8:
            return None
        
        try:
            chrom = fields[0].strip()
            pos = int(fields[1])
            rsid = fields[2].strip() if fields[2] != "." else None
            info = fields[7].strip()
            
            # Validate rsID format
            if rsid:
                if not (rsid.startswith("rs") and len(rsid) > 2):
                    rsid = None
            
            # Extract gene from INFO field
            gene = self._extract_from_info(info, "GENE")
            
            if not gene:
                return None
            
            return {
                "chrom": chrom,
                "pos": pos,
                "rsid": rsid,
                "gene": gene
            }
        
        except (ValueError, IndexError) as e:
            logger.debug(f"Failed to parse VCF line: {e}")
            return None
    
    def _extract_from_info(self, info_string: str, key: str) -> Optional[str]:
        """
        Extract value from INFO field.
        Format: KEY=VALUE;KEY=VALUE...
        """
        if not info_string or not key:
            return None
        
        for field in info_string.split(";"):
            if "=" in field:
                k, v = field.split("=", 1)
                if k.strip() == key:
                    return v.strip()
        
        return None
