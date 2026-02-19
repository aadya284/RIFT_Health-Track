def generate_explanation(rule_output):
    if rule_output:
        return {
            "summary": "Patient has increased sensitivity.",
            "mechanism": "Genetic variant affects drug metabolism.",
            "recommendation": "Consider lower starting dose."
        }
    else:
        return {
            "summary": "No significant risk detected.",
            "mechanism": "No high-risk variants found.",
            "recommendation": "Standard dosing can be used."
        }
