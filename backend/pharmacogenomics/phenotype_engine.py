"""
Phenotype Engine Module - Maps rsIDs to pharmacogenomic phenotypes.
Optimized for fast lookups with cached data structures.
"""

import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


# Phenotype mappings: gene -> rsID -> phenotype
PHENOTYPE_MAPPINGS: Dict[str, Dict[str, str]] = {
    "CYP2D6": {
        "rs1065852": "PM",
        "rs1080985": "IM",
        "rs16947": "NM",
        "rs5030655": "URM",
    },
    "CYP2C9": {
        "rs1057910": "PM",
        "rs1799853": "IM",
        "rs9332131": "NM",
        "rs28365065": "URM",
    },
    "CYP2C19": {
        "rs4986893": "PM",
        "rs4244285": "IM",
        "rs12248560": "NM",
        "rs662": "URM",
    },
    "SLCO1B1": {
        "rs11045879": "PM",
        "rs4149056": "IM",
        "rs2306283": "NM",
        "rs11045878": "URM",
    },
    "TPMT": {
        "rs1800462": "PM",
        "rs1800460": "IM",
        "rs1799853": "NM",
        "rs1800464": "URM",
    },
    "DPYD": {
        "rs3918290": "PM",
        "rs55886062": "IM",
        "rs1801158": "NM",
        "rs75017182": "URM",
    },
}

# Cached phenotype descriptions (O(1) lookup)
_PHENOTYPE_DESCRIPTIONS = {
    "PM": "Poor Metabolizer",
    "IM": "Intermediate Metabolizer",
    "NM": "Normal Metabolizer",
    "URM": "Ultra-Rapid Metabolizer",
}

# Cached set of known genes (frozenset for O(1) lookup)
_KNOWN_GENES = frozenset(PHENOTYPE_MAPPINGS.keys())


class PhenotypeEngine:
    """Map rsIDs to pharmacogenomic phenotypes with optimized lookups."""
    
    @staticmethod
    def get_phenotype(gene: str, rsid: Optional[str]) -> str:
        """
        Get phenotype for a given gene and rsID (O(1) lookup).
        
        Args:
            gene: Gene name (CYP2D6, CYP2C9, etc.)
            rsid: rsID identifier
        
        Returns:
            Phenotype: "PM", "IM", "NM", or "URM"
        """
        # Early exit for invalid input
        if not rsid or gene not in _KNOWN_GENES:
            logger.debug(f"No rsID or unmapped gene {gene}, defaulting to NM")
            return "NM"
        
        # Direct dictionary lookup (O(1))
        phenotype = PHENOTYPE_MAPPINGS[gene].get(rsid, "NM")
        logger.debug(f"Phenotype lookup: {gene} + {rsid} = {phenotype}")
        return phenotype
    
    @staticmethod
    def get_phenotype_description(phenotype: str) -> str:
        """Get human-readable description of phenotype (O(1) lookup)."""
        return _PHENOTYPE_DESCRIPTIONS.get(phenotype, phenotype)
    
    @staticmethod
    def get_genes_with_phenotypes() -> Dict[str, list]:
        """Get all genes and their mapped phenotypes."""
        return {
            gene: list(mappings.keys())
            for gene, mappings in PHENOTYPE_MAPPINGS.items()
        }
