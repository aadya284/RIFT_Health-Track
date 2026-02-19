from pydantic import BaseModel
from typing import List

class Variant(BaseModel):
    rsid: str
    gene: str
    genotype: str
    risk_level: str
    cpic_guideline: str

class Explanation(BaseModel):
    summary: str
    mechanism: str
    recommendation: str

class FinalResponse(BaseModel):
    drug: str
    patient_id: str
    variants: List[Variant]
    overall_risk: str
    explanation: Explanation
    confidence_score: float
