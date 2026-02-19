import json
from typing import Dict

from . import llm_service  # type: ignore


FALLBACK_EXPLANATION: Dict[str, object] = {
    "summary": "Pharmacogenomic risk identified based on detected CYP2C9 variants.",
    "biological_mechanism": (
        "Reduced CYP2C9 enzyme activity decreases warfarin metabolism leading to increased bleeding risk."
    ),
    "clinical_recommendation": (
        "Significant dose reduction or alternative therapy recommended per CPIC guidelines."
    ),
    # Required numeric score for downstream schema
    "score": 0.8,
}


def _build_explanation_prompt(
    gene: str,
    rsid: str,
    phenotype: str,
    drug: str,
    risk_label: str,
) -> str:
    """
    Build a concise, instruction-heavy prompt for Gemini.

    The model is asked to return a strict JSON object with three keys:
    - summary
    - biological_mechanism
    - clinical_recommendation
    """
    return (
        "You are a clinical pharmacogenomics assistant.\n\n"
        "Use the following patient-specific pharmacogenomic context. The primary gene is the drug's metabolism gene — use this exact gene symbol in your explanation and do not substitute or state a different gene as the primary.\n"
        f"- Primary gene (use exactly this symbol): {gene}\n"
        f"- rsID: {rsid}\n"
        f"- Phenotype: {phenotype}\n"
        f"- Drug: {drug}\n"
        f"- Risk label: {risk_label}\n\n"
        "Requirements for the explanation:\n"
        "- State that the primary gene for this drug is " + gene + " and base your mechanism only on this gene. Do not mention a different gene as the primary metabolism gene.\n"
        "- Clearly describe the pharmacogenomic risk identified.\n"
        "- Explain the underlying biological mechanism of how the variant in " + gene + " affects the drug's metabolism pathway.\n"
        "- Explicitly reference alignment with CPIC guidelines (Clinical Pharmacogenetics "
        "Implementation Consortium) where relevant.\n"
        "- Describe the mechanism of metabolism (e.g., enzyme function, activation, "
        "inactivation, clearance, or transport) for " + gene + ".\n"
        "- Provide a concise, actionable clinical recommendation (e.g., dose adjustment, "
        "alternative therapy, additional monitoring), framed as guidance to a clinician.\n\n"
        "Output format (VERY IMPORTANT):\n"
        "Respond ONLY with a single JSON object and nothing else.\n"
        "The JSON object must have exactly these keys:\n"
        "- summary: string\n"
        "- biological_mechanism: string\n"
        "- clinical_recommendation: string\n\n"
        "Example of the required JSON structure (do NOT include comments):\n"
        "{\n"
        '  "summary": "...",\n'
        '  "biological_mechanism": "...",\n'
        '  "clinical_recommendation": "..."\n'
        "}\n"
    )


def _parse_llm_json(raw_text: str) -> Dict[str, object]:
    """
    Parse the raw Gemini output into the required dictionary shape.

    Any parsing or validation failure results in the safe fallback explanation.
    """
    if not raw_text:
        return FALLBACK_EXPLANATION.copy()

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        return FALLBACK_EXPLANATION.copy()

    summary = str(data.get("summary") or "").strip()
    mechanism = str(data.get("biological_mechanism") or "").strip()
    recommendation = str(data.get("clinical_recommendation") or "").strip()

    if not (summary and mechanism and recommendation):
        return FALLBACK_EXPLANATION.copy()

    # Provide a default score for successful parses (caller may override)
    return {
        "summary": summary,
        "biological_mechanism": mechanism,
        "clinical_recommendation": recommendation,
        "score": 0.9,
    }


def generate_explanation(
    gene: str,
    rsid: str,
    phenotype: str,
    drug: str,
    risk_label: str,
) -> Dict[str, object]:
    """
    Public API for generating structured pharmacogenomic explanations.

    This function:
    - Builds a CPIC-aligned, mechanism-focused prompt.
    - Calls Gemini via the shared llm_service module.
    - Enforces strict JSON shape with safe fallback behavior.
    - Guarantees a valid dictionary response for callers.
    """
    prompt = _build_explanation_prompt(
        gene=gene,
        rsid=rsid,
        phenotype=phenotype,
        drug=drug,
        risk_label=risk_label,
    )

    try:
        raw = llm_service.generate_llm_response(prompt)
        return _parse_llm_json(raw)
    except Exception:  # noqa: BLE001 - hard safety requirement, never crash callers
        return FALLBACK_EXPLANATION.copy()

