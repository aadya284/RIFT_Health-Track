from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from schema import FinalResponse
from vcf_parser import parse_vcf
from rule_engine import apply_rules
from llm_module import generate_explanation

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok", "message": "Pharma backend running"}

@app.post("/analyze", response_model=FinalResponse)
async def analyze(
    vcf_file: UploadFile = File(...),
    drug_name: str = Form(...)
):
    try:
        content = await vcf_file.read()

        if not vcf_file.filename.endswith(".vcf"):
            raise HTTPException(status_code=400, detail="Invalid file format")

        variants = parse_vcf(content)
        rule_output = apply_rules(variants, drug_name)
        explanation = generate_explanation(rule_output)

        return {
            "drug": drug_name,
            "patient_id": "P001",
            "variants": rule_output,
            "overall_risk": "High" if rule_output else "Low",
            "explanation": explanation,
            "confidence_score": 0.90
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
