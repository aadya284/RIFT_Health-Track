def apply_rules(variants, drug_name):
    results = []

    for var in variants:
        if var["rsid"] == "rs9923231" and drug_name.lower() == "warfarin":
            results.append({
                "rsid": var["rsid"],
                "gene": "VKORC1",
                "genotype": "AA",
                "risk_level": "High",
                "cpic_guideline": "Lower starting dose recommended"
            })

    return results
