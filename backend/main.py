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
from typing import Optional, Dict, Any
import os
import tempfile
import logging
from datetime import datetime

# Import pharmacogenomics engine (run from backend/ as root)
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pharmacogenomics import analyze as pharma_analyze, configure_logging
from pharmacogenomics.vcf_parser import VCFParser
from pharmacogenomics.risk_engine import RiskEngine

# Import LLM and utility modules
from llm_explainability.explanation_generator import generate_explanation
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


def _infer_diplotype_from_phenotype(phenotype: str) -> str:
    """
    Lightweight diplotype heuristic so we don't return 'Unknown'.
    This is NOT a full CPIC diplotype caller, just a readable label.
    """
    mapping = {
        "PM": "*X/*X (poor metabolizer)",
        "IM": "*1/*X (intermediate metabolizer)",
        "NM": "*1/*1 (normal metabolizer)",
        "URM": "*1/*1xN (ultra-rapid metabolizer)",
    }
    return mapping.get(phenotype, "Not determined")

@app.post("/analyze")
async def analyze_endpoint(
    vcf_file: UploadFile = File(..., description="VCF file with variants"),
    drug_name: str = Form(..., description="Drug name to analyze"),
    generate_explanation: bool = Form(False, description="Generate LLM clinical explanation")
) -> Dict[str, Any]:
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

        # Basic VCF quality metrics (computed from uploaded bytes)
        head_text = contents[:8192].decode("utf-8", errors="ignore")
        has_vcf_header = ("##fileformat=VCF" in head_text) or ("\n#CHROM\t" in ("\n" + head_text))
        has_gene_annotation = ("GENE=" in head_text) or ("GENENAMES=" in head_text) or ("ANN=" in head_text)
        variant_line_count = sum(
            1 for line in contents.splitlines()
            if line and not line.startswith(b"#")
        )

        with open(temp_vcf_path, 'wb') as f:
            f.write(contents)
        
        # Normalize drug to canonical key so primary_gene is always correct (alias + case)
        normalized_drug = RiskEngine.normalize_drug(drug_name) or drug_name.strip()
        if not normalized_drug:
            raise HTTPException(status_code=400, detail="drug_name required")

        # Step 1: Core pharmacogenomic analysis (primary_gene from drug→gene mapping only)
        pharma_result = pharma_analyze(temp_vcf_path, normalized_drug)

        # Step 2: Collect ALL detected variants for the primary gene (only those we can accurately assess)
        detected_variants = []
        primary_gene = pharma_result.get("primary_gene")
        
        if primary_gene:
            try:
                from pharmacogenomics.phenotype_engine import PHENOTYPE_MAPPINGS
                parser = VCFParser(temp_vcf_path)
                variants_by_gene = parser.parse()
                gene_variants = variants_by_gene.get(primary_gene, [])
                logger.info(f"Found {len(gene_variants)} variants for gene {primary_gene}")
                
                # Only include variants we have phenotype mappings for (ensures accuracy)
                for variant in gene_variants:
                    rsid = variant.get("rsid")
                    if rsid:
                        # Check if this rsID is in our phenotype mappings (ensures accurate assessment)
                        if primary_gene in PHENOTYPE_MAPPINGS and rsid in PHENOTYPE_MAPPINGS[primary_gene]:
                            detected_variants.append({"rsid": rsid})
                            logger.debug(f"Added mapped variant rsID: {rsid} for gene {primary_gene}")
                        else:
                            logger.debug(f"Skipped unmapped variant rsID: {rsid} for gene {primary_gene} (not in phenotype mappings - ensuring accuracy)")
                        
            except Exception as e:
                logger.error(f"Failed to parse variants for detected_variants: {e}", exc_info=True)
        
        # Always include the detected_rsid from pharma_result if it's a mapped variant
        if pharma_result.get("detected_rsid"):
            rsid_from_result = pharma_result["detected_rsid"]
            if not any(v.get("rsid") == rsid_from_result for v in detected_variants):
                # Verify it's a mapped variant before adding (ensures accuracy)
                from pharmacogenomics.phenotype_engine import PHENOTYPE_MAPPINGS
                primary_gene = pharma_result.get("primary_gene")
                if primary_gene and primary_gene in PHENOTYPE_MAPPINGS:
                    if rsid_from_result in PHENOTYPE_MAPPINGS[primary_gene]:
                        detected_variants.append({"rsid": rsid_from_result})
                        logger.info(f"Added detected_rsid from pharma_result: {rsid_from_result}")
        
        # Log final detected variants for debugging
        logger.info(f"Final detected_variants count: {len(detected_variants)}")
        if detected_variants:
            logger.info(f"Detected rsIDs: {[v.get('rsid') for v in detected_variants]}")

        # Step 3: Optional LLM clinical explanation (structured)
        llm_explanation: Dict[str, str] = {}
        if pharma_result["primary_gene"] and generate_explanation:
            try:
                # Pass exact primary_gene from drug mapping so LLM uses correct gene
                llm_explanation = generate_explanation(
                    gene=pharma_result["primary_gene"],
                    rsid=pharma_result["detected_rsid"] or "Unknown",
                    phenotype=pharma_result["phenotype"],
                    drug=normalized_drug,
                    risk_label=pharma_result["risk_label"],
                )
            except Exception as e:
                # Log but don't fail if LLM fails
                logger.error(f"LLM explanation generation failed: {e}")
                llm_explanation = {}

        # Build unified hackathon response schema
        patient_id = f"PATIENT_{os.urandom(4).hex().upper()}"
        timestamp = datetime.utcnow().isoformat() + "Z"

        risk_assessment = {
            "risk_label": pharma_result["risk_label"],
            "confidence_score": pharma_result["confidence_score"],
            "severity": pharma_result["severity"],
        }

        pharmacogenomic_profile = {
            "primary_gene": pharma_result["primary_gene"],
            "diplotype": _infer_diplotype_from_phenotype(pharma_result["phenotype"]),
            "phenotype": pharma_result["phenotype"],
            "detected_variants": detected_variants,
        }

        llm_summary = None
        if llm_explanation:
            llm_summary = llm_explanation.get("summary")

        clinical_recommendation = {
            "llm_generated_explanation": {
                "summary": llm_summary,
                "score": float(pharma_result["confidence_score"]),
            }
        }

        response: Dict[str, Any] = {
            "patient_id": patient_id,
            "drug": normalized_drug,
            "timestamp": timestamp,
            "risk_assessment": risk_assessment,
            "pharmacogenomic_profile": pharmacogenomic_profile,
            "clinical_recommendation": clinical_recommendation,
            "quality_metrics": {
                "vcf_parsing_success": bool(has_vcf_header),
                "variant_count": int(variant_line_count),
                "has_gene_annotation": bool(has_gene_annotation),
            },
        }

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
