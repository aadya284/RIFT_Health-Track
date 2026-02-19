"""
RIFT Health-Track - Unified FastAPI Backend
Integrates:
- Pharmacogenomics analysis engine
- LLM-based clinical explanations (Gemini)
- Clinical confidence scoring
- Prompt-based generation
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import tempfile
import logging

# Import pharmacogenomics engine from backend
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
from pharmacogenomics import analyze as pharma_analyze, configure_logging

# Import LLM and utility modules
from llm_explainability.llm_service import generate_llm_response
from llm_explainability.Prompt_builder import build_prompt
from llm_explainability.confidence import calculate_confidence

logger = logging.getLogger(__name__)

# ============================================================================
# RESPONSE MODELS
# ============================================================================

class PharmaAnalysisResult(BaseModel):
    """Pharmacogenomic analysis result"""
    primary_gene: Optional[str]
    detected_rsid: Optional[str]
    phenotype: str
    risk_label: str
    severity: str
    confidence_score: float


class ClinicalExplanation(BaseModel):
    """LLM-generated clinical explanation"""
    clinical_summary: str
    genetic_details: str
    biological_mechanism: str
    drug_metabolism_impact: str
    cpic_alignment: str
    recommendation: str


class AnalysisResponse(BaseModel):
    """Complete analysis response with pharma + LLM explanation"""
    status: str
    message: str
    pharmacogenomic_analysis: PharmaAnalysisResult
    clinical_explanation: Optional[ClinicalExplanation] = None
    enhanced_confidence: Optional[float] = None


# ============================================================================
# INITIALIZE APP
# ============================================================================

app = FastAPI(
    title="RIFT Health-Track API",
    description="Integrated pharmacogenomics with clinical LLM explanations",
    version="2.0.0"
)

# ============================================================================
# CORS CONFIGURATION
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.post("/analyze")
async def analyze_endpoint(
    vcf_file: UploadFile = File(..., description="VCF file with variants"),
    drug_name: str = Form(..., description="Drug name to analyze"),
    generate_explanation: bool = Form(False, description="Generate LLM clinical explanation")
) -> AnalysisResponse:
    """
    Comprehensive pharmacogenomic analysis with optional LLM explanation.
    
    **Parameters:**
    - vcf_file: VCF v4.2 file with GENE field in INFO
    - drug_name: Drug name (Warfarin, Codeine, etc.)
    - generate_explanation: If true, generates LLM clinical explanation
    
    **Returns:**
    - pharmacogenomic_analysis: Core engine results (6 keys)
    - clinical_explanation: LLM-generated explanation (if requested)
    - enhanced_confidence: CPIC-based confidence score
    """
    
    # Validate input
    if not drug_name or not drug_name.strip():
        raise HTTPException(status_code=400, detail="drug_name required")
    
    if not vcf_file or not vcf_file.filename:
        raise HTTPException(status_code=400, detail="VCF file required")
    
    temp_vcf_path = None
    
    try:
        # Save VCF file temporarily
        temp_dir = tempfile.gettempdir()
        temp_vcf_path = os.path.join(
            temp_dir,
            f"pharma_{os.urandom(8).hex()}_{vcf_file.filename}"
        )
        
        contents = await vcf_file.read()
        with open(temp_vcf_path, 'wb') as f:
            f.write(contents)
        
        # Step 1: Core pharmacogenomic analysis
        pharma_result = pharma_analyze(temp_vcf_path, drug_name)
        
        pharma_data = PharmaAnalysisResult(
            primary_gene=pharma_result["primary_gene"],
            detected_rsid=pharma_result["detected_rsid"],
            phenotype=pharma_result["phenotype"],
            risk_label=pharma_result["risk_label"],
            severity=pharma_result["severity"],
            confidence_score=pharma_result["confidence_score"]
        )
        
        # Step 2: Optional LLM clinical explanation
        clinical_exp = None
        enhanced_conf = None
        
        if generate_explanation and pharma_result["primary_gene"]:
            try:
                # Build prompt for LLM
                prompt = build_prompt(
                    gene=pharma_result["primary_gene"],
                    rsid=pharma_result["detected_rsid"] or "Unknown",
                    genotype="Heterozygous",  # Could be inferred from phenotype
                    phenotype=pharma_result["phenotype"],
                    drug=drug_name
                )
                
                # Generate LLM response
                llm_text = generate_llm_response(prompt)
                
                # Parse LLM response (basic parsing)
                sections = llm_text.split("\n")
                clinical_exp = ClinicalExplanation(
                    clinical_summary=sections[0] if len(sections) > 0 else llm_text[:200],
                    genetic_details="See clinical summary",
                    biological_mechanism="See clinical summary",
                    drug_metabolism_impact="See clinical summary",
                    cpic_alignment="See clinical summary",
                    recommendation=sections[-1] if len(sections) > 1 else llm_text[-200:]
                )
                
                # Calculate enhanced confidence using CPIC guidelines
                cpic_level = "B"  # Default; could be enhanced with CPIC API
                phenotype_certainty = "inferred" if pharma_result["detected_rsid"] else "limited"
                enhanced_conf = calculate_confidence(cpic_level, phenotype_certainty)
                
            except Exception as e:
                # Log but don't fail if LLM fails
                print(f"LLM explanation generation failed: {e}")
        
        # Return unified response
        response = AnalysisResponse(
            status="success",
            message="Analysis completed successfully",
            pharmacogenomic_analysis=pharma_data,
            clinical_explanation=clinical_exp,
            enhanced_confidence=enhanced_conf
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Analysis failed",
                "details": str(e)
            }
        )
    
    finally:
        # Cleanup temp file
        if temp_vcf_path and os.path.exists(temp_vcf_path):
            try:
                os.remove(temp_vcf_path)
            except:
                pass


@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "rift-health-track",
        "version": "2.0.0"
    }


@app.get("/")
async def root():
    """API info"""
    return {
        "name": "RIFT Health-Track API",
        "version": "2.0.0",
        "endpoints": {
            "health": "GET /health",
            "analyze": "POST /analyze",
            "docs": "GET /docs"
        },
        "features": [
            "Pharmacogenomic analysis",
            "LLM clinical explanations",
            "CPIC-based confidence scoring"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
