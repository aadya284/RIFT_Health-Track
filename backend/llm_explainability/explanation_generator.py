import json
from typing import Dict

from . import llm_service  # type: ignore


FALLBACK_EXPLANATION: Dict[str, str] = {
    "summary": "Pharmacogenomic risk identified based on detected variant.",
    "biological_mechanism": "Variant affects drug metabolism pathway.",
    "clinical_recommendation": "Refer to CPIC guidelines for dosing adjustments.",
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


def _parse_llm_json(raw_text: str) -> Dict[str, str]:
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

    return {
        "summary": summary,
        "biological_mechanism": mechanism,
        "clinical_recommendation": recommendation,
    }


def generate_explanation(
    gene: str,
    rsid: str,
    phenotype: str,
    drug: str,
    risk_label: str,
) -> Dict[str, str]:
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

