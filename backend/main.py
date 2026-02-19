"""
FastAPI Backend - Main Application
RIFT Health-Track with Pharmacogenomic Engine Integration
"""

from fastapi import FastAPI

# Import the pharmacogenomics module
from pharmacogenomics import analyze, configure_logging

app = FastAPI(
    title="RIFT Health-Track API",
    description="Health tracking with pharmacogenomic analysis",
    version="1.0.0"
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "rift-health-track",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """API information"""
    return {
        "name": "RIFT Health-Track API",
        "version": "1.0.0",
        "endpoints": {
            "health": "GET /health",
            "docs": "GET /docs",
            "redoc": "GET /redoc"
        }
    }


# Example: Direct usage of analyze function
# from pharmacogenomics import analyze
# result = analyze("patient.vcf", "warfarin")
# Returns: {
#     "primary_gene": "CYP2C9",
#     "detected_rsid": "rs1799853",
#     "phenotype": "IM",
#     "risk_label": "Adjust Dosage",
#     "severity": "moderate",
#     "confidence_score": 0.85
# }


if __name__ == "__main__":
    import uvicorn
    
    # Run with: python main.py
    # Or: uvicorn main:app --reload
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
