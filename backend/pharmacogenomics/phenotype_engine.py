"""
Phenotype Engine Module - Maps rsIDs to allele function and infers phenotypes.
CPIC-aligned: phenotype from diplotype (combination of allele functions).
Uses allele function (No_function, Decreased, Normal, Increased) for accurate inference.
"""

import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Allele function: CPIC/PharmGKB nomenclature
# No_function = absent/non-functional (e.g. *3, *4)
# Decreased = reduced activity (e.g. *2, *8)
# Normal = wild-type activity
# Increased = gene duplication / enhanced (e.g. *1xN, *17)
ALLELE_FUNCTION = "No_function"
ALLELE_DECREASED = "Decreased"
ALLELE_NORMAL = "Normal"
ALLELE_INCREASED = "Increased"

# Allele function per rsID (CPIC/PharmGKB): gene -> rsID -> function
# One variant = at least one copy of that allele. Phenotype inferred from combination.
ALLELE_FUNCTION_MAPPINGS: Dict[str, Dict[str, str]] = {
    "CYP2D6": {
        "rs1065852": ALLELE_FUNCTION,   # *4 - splice defect, no function
        "rs1080985": ALLELE_DECREASED,  # *10 - decreased
        "rs16947": ALLELE_NORMAL,        # *1 (synonymous) - normal
        "rs5030655": ALLELE_INCREASED,   # *1xN - gene duplication, increased
        "rs28371725": ALLELE_FUNCTION,   # *5 - gene deletion
        "rs3892097": ALLELE_FUNCTION,    # *4 (alternate)
    },
    "CYP2C9": {
        "rs1057910": ALLELE_FUNCTION,   # *3 - no function
        "rs1799853": ALLELE_DECREASED,  # *2 - decreased
        "rs9332131": ALLELE_NORMAL,
        "rs28365065": ALLELE_INCREASED,
        "rs28371686": ALLELE_DECREASED,  # *8 - decreased
    },
    "CYP2C19": {
        "rs4986893": ALLELE_FUNCTION,   # *3 - no function
        "rs4244285": ALLELE_FUNCTION,   # *2 - no function
        "rs12248560": ALLELE_INCREASED,  # *17 - increased
        "rs662": ALLELE_INCREASED,       # *17 LD
    },
    "SLCO1B1": {
        "rs11045879": ALLELE_DECREASED,
        "rs4149056": ALLELE_DECREASED,   # *5 - decreased
        "rs2306283": ALLELE_NORMAL,      # *1b - normal
        "rs11045878": ALLELE_DECREASED,
        "rs4149043": ALLELE_DECREASED,   # decreased function
    },
    "TPMT": {
        "rs1800462": ALLELE_DECREASED,   # *2 - decreased
        "rs1800460": ALLELE_DECREASED,   # *3C - decreased
        "rs1800464": ALLELE_DECREASED,
        "rs1142345": ALLELE_FUNCTION,    # *3A - no function
    },
    "DPYD": {
        "rs3918290": ALLELE_FUNCTION,   # *2A - no function
        "rs55886062": ALLELE_FUNCTION,   # *13 - no function
        "rs1801158": ALLELE_NORMAL,
        "rs75017182": ALLELE_DECREASED,
        "rs67376798": ALLELE_DECREASED,  # HapB3 tag - decreased, carrier
    },
}

# Legacy: gene -> rsID -> phenotype (for backward compat / quick lookup when single variant)
# Used only when we need direct phenotype for a known single-variant case
PHENOTYPE_MAPPINGS: Dict[str, Dict[str, str]] = {
    gene: {} for gene in ALLELE_FUNCTION_MAPPINGS
}
# Populate from allele function for single-variant conservative calls
for gene, mappings in ALLELE_FUNCTION_MAPPINGS.items():
    for rsid, func in mappings.items():
        if func == ALLELE_FUNCTION:
            PHENOTYPE_MAPPINGS[gene][rsid] = "IM"  # 1 no-func allele -> IM conservatively
        elif func == ALLELE_DECREASED:
            PHENOTYPE_MAPPINGS[gene][rsid] = "IM"
        elif func == ALLELE_INCREASED:
            PHENOTYPE_MAPPINGS[gene][rsid] = "URM"
        else:
            PHENOTYPE_MAPPINGS[gene][rsid] = "NM"

_PHENOTYPE_DESCRIPTIONS = {
    "PM": "Poor Metabolizer",
    "IM": "Intermediate Metabolizer",
    "NM": "Normal Metabolizer",
    "URM": "Ultra-Rapid Metabolizer",
}

_KNOWN_GENES = frozenset(ALLELE_FUNCTION_MAPPINGS.keys())


def _infer_phenotype_from_allele_functions(functions: List[str]) -> str:
    """
    Infer phenotype from list of allele functions (CPIC diplotype logic).
    Each variant = at least one copy. Without genotype we use variant count as proxy.
    """
    no_func = sum(1 for f in functions if f == ALLELE_FUNCTION)
    decreased = sum(1 for f in functions if f == ALLELE_DECREASED)
    increased = sum(1 for f in functions if f == ALLELE_INCREASED)

    # PM: 2+ no-func, or 1 no-func + 1+ decreased, or 2+ decreased (e.g. *2/*2, *3/*3, *2/*3)
    if no_func >= 2:
        return "PM"
    if no_func >= 1 and decreased >= 1:
        return "PM"
    if decreased >= 2:
        return "PM"

    # IM: 1 no-func or 1 decreased (*1/*2, *1/*3)
    if no_func >= 1 or decreased >= 1:
        return "IM"

    # URM: increased only (*1xN/*1, *17/*1)
    if increased >= 1 and no_func == 0 and decreased == 0:
        return "URM"

    return "NM"


class PhenotypeEngine:
    """Map rsIDs to allele function and infer phenotypes from variant combinations."""

    @staticmethod
    def get_allele_function(gene: str, rsid: Optional[str]) -> Optional[str]:
        """Get allele function for a gene/rsID. Returns None if unmapped."""
        if not rsid or gene not in _KNOWN_GENES:
            return None
        return ALLELE_FUNCTION_MAPPINGS.get(gene, {}).get(rsid)

    @staticmethod
    def infer_phenotype_from_variants(gene: str, rsids: List[str]) -> Tuple[str, Optional[str]]:
        """
        Infer phenotype from list of rsIDs for a gene (CPIC diplotype logic).
        Returns (phenotype, representative_rsid for reporting).
        """
        if not rsids or gene not in _KNOWN_GENES:
            return ("Unknown", None)
        functions = []
        for rsid in rsids:
            func = PhenotypeEngine.get_allele_function(gene, rsid)
            if func:
                functions.append(func)
        if not functions:
            return ("Unknown", rsids[0] if rsids else None)
        phenotype = _infer_phenotype_from_allele_functions(functions)
        return (phenotype, rsids[0])

    @staticmethod
    def get_phenotype(gene: str, rsid: Optional[str]) -> str:
        """
        Legacy: get phenotype for single gene/rsID.
        For single variant, returns conservative phenotype (IM for LOF, etc.)
        """
        if not rsid or gene not in _KNOWN_GENES:
            return "Unknown"
        return PHENOTYPE_MAPPINGS[gene].get(rsid, "Unknown")

    @staticmethod
    def get_phenotype_description(phenotype: str) -> str:
        """Get human-readable description of phenotype."""
        return _PHENOTYPE_DESCRIPTIONS.get(phenotype, phenotype)

    @staticmethod
    def get_genes_with_phenotypes() -> Dict[str, list]:
        """Get all genes and their mapped rsIDs."""
        return {
            gene: list(mappings.keys())
            for gene, mappings in ALLELE_FUNCTION_MAPPINGS.items()
        }
