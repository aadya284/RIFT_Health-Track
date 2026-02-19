def calculate_confidence(cpic_level, phenotype_certainty):
    evidence_weight = {
        "A": 1.0,
        "B": 0.8,
        "C": 0.6
    }.get(cpic_level, 0.5)

    phenotype_weight = {
        "direct": 1.0,
        "inferred": 0.7
    }.get(phenotype_certainty, 0.6)

    confidence = (evidence_weight + phenotype_weight) / 2
    return round(confidence, 2)
