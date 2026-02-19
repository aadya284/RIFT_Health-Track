# PharmaGuard: Pharmacogenomic Analysis Engine

Production-grade pharmacogenomic variant analysis system for RIFT Health-Track hackathon.

## Live Deployment

**Frontend:** [PharmaGuard Web App](http://localhost:3000)  
**Backend API:** `http://localhost:8000`  
**API Documentation:** `http://localhost:8000/docs`

## Installation & Running

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- pip (Python package manager)

### Backend Setup
```bash
# Navigate to project root
cd /Users/priyanshumahobia/Desktop/RIFT_Health-Track

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
# Server starts at http://localhost:8000
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
# Frontend starts at http://localhost:3000
```

### Full Stack Startup (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd /Users/priyanshumahobia/Desktop/RIFT_Health-Track
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd /Users/priyanshumahobia/Desktop/RIFT_Health-Track/frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Architecture Overview

PharmaGuard is a full-stack pharmacogenomic analysis system:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                       │
│  ├─ Home: Project overview                                  │
│  ├─ Analyze: VCF upload & drug selection form              │
│  ├─ Results: Pharmacogenomic report display                │
│  ├─ Documentation: Clinical guidelines reference           │
│  └─ About: Team information                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                   HTTP POST: /analyze
                   (FormData with VCF file)
                             │
┌────────────────────────────▼────────────────────────────────┐
│                Backend (FastAPI + Python)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Pharmacogenomic Analysis Engine             │  │
│  ├─ VCF Parser: Extract variants from patient file    │  │
│  ├─ Phenotype Engine: Map rsIDs to phenotypes         │  │
│  ├─ Risk Engine: Determine drug-phenotype risk        │  │
│  └─ Pharmacogenomic Service: Main orchestrator        │  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    LLM Explainability (Google Gemini Integration)   │  │
│  ├─ Generates clinical summaries for results          │  │
│  └─ Provides variant interpretation                   │  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Response: Structured JSON                 │  │
│  ├─ pharmacogenomic_analysis (gene, phenotype, risk)   │  │
│  └─ clinical_explanation (LLM-generated summary)       │  │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **PostCSS** - CSS transformation

### Backend
- **FastAPI** - Async web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Python Multipart** - File upload handling
- **Google Generative AI** - LLM integration (Gemini)

### Core Analysis
- **Python 3.10+** - Language
- **VCF Parser** - Variant call format parsing
- **Pharmacogenomics Engine** - 4-module system:
  - `vcf_parser.py` - VCF file processing
  - `phenotype_engine.py` - Phenotype classification
  - `risk_engine.py` - Risk determination
  - `pharmacogenomic_service.py` - Orchestration

## Quick Start

### 1. Start Backend
```bash
cd /Users/priyanshumahobia/Desktop/RIFT_Health-Track
python main.py
# Output: INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Start Frontend (New Terminal)
```bash
cd /Users/priyanshumahobia/Desktop/RIFT_Health-Track/frontend
npm run dev
# Output: VITE v... ready in ... ms
#         ➜  Local: http://localhost:3000
```

### 3. Test API
```bash
curl -X POST http://localhost:8000/analyze \
  -F "vcf_file=@sample_test.vcf" \
  -F "drug_name=warfarin"
```

### 4. Use Web Interface
1. Open `http://localhost:3000`
2. Click "Analyze"
3. Upload your VCF file (or use included `sample_test.vcf`)
4. Select drug (Warfarin, Codeine, etc.)
5. Submit for analysis
6. View pharmacogenomic results

## API Reference

### POST /analyze

Analyze a patient's VCF for pharmacogenomic risk with a specific drug.

**Request:**
```
Content-Type: multipart/form-data

vcf_file: <binary VCF file>
drug_name: <string>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "pharmacogenomic_analysis": {
    "primary_gene": "CYP2C9",
    "detected_rsid": "rs1057910",
    "phenotype": "IM",
    "risk_label": "Adjust Dosage",
    "severity": "moderate",
    "confidence_score": 0.95
  },
  "clinical_explanation": {
    "clinical_summary": "Patient has intermediate metabolizer status for CYP2C9..."
  }
}
```

**Supported Drugs (Case-Insensitive):**
- Warfarin → CYP2C9
- Clopidogrel → CYP2C19
- Codeine → CYP2D6
- Simvastatin → SLCO1B1
- Azathioprine → TPMT
- 5-Fluorouracil → DPYD

### GET /docs

Interactive API documentation (Swagger UI)

## Team Members

**PharmaGuard Development Team**
- Priyanshu Mahobia - Full Stack Development (Frontend & Backend)

## Features

### ✅ Core Functionality
- VCF file upload with drag-and-drop support
- Multi-drug analysis in single session
- Structured pharmacogenomic risk assessment
- LLM-powered clinical interpretations
- Downloadable JSON reports

### ✅ User Interface
- Government website styling (USWDS-inspired)
- Responsive design (mobile-friendly)
- Real-time form validation
- Accessibility features (ARIA labels)
- Alert notifications for errors

### ✅ Clinical Features
- 6 supported drug-gene pairs
- CPIC v3.0 guideline compliance
- Phenotype classification (PM, IM, NM, URM)
- Risk stratification (Safe, Adjust Dosage, Toxic, Ineffective, Unknown)
- Confidence scoring (0.0-1.0)

### ✅ Technical Features
- CORS-enabled for frontend communication
- Structured error responses
- FormData file upload support
- Async request handling
- Comprehensive error logging

## Quick Start

```python
from pharmacogenomic_service import analyze

result = analyze(
    vcf_file_path="patient.vcf",
    drug_name="warfarin"  # Case-insensitive
)
print(result)
# {
#     "primary_gene": "CYP2C9",
#     "detected_rsid": "rs1057910",  
#     "phenotype": "IM",
#     "risk_label": "Adjust Dosage",
#     "severity": "moderate",
#     "confidence_score": 0.95
# }
```

## Architecture (4 Modules)

| Module | Purpose |
|--------|---------|
| `vcf_parser.py` | Parse VCF files, extract variants for 6 genes |
| `phenotype_engine.py` | Map rsIDs to phenotypes (PM, IM, NM, URM) |
| `risk_engine.py` | Map drug+phenotype to risk classification |
| `pharmacogenomic_service.py` | Main orchestrator, implements `analyze()` |

## API

### analyze(vcf_file_path: str, drug_name: str) → Dict[str, Any]

**Input:**
- `vcf_file_path` (str): Path to patient's VCF file
- `drug_name` (str): Drug name (case-insensitive, auto-normalized)

**Returns exactly 6 keys:**
- `primary_gene` (str or None): Gene responsible for drug metabolism
- `detected_rsid` (str or None): rsID found in patient VCF
- `phenotype` (str): PM, IM, NM, URM, or "Unknown"
- `risk_label` (str): **Safe** | **Adjust Dosage** | **Toxic** | **Ineffective** | **Unknown**
- `severity` (str): **none** | **low** | **moderate** | **high** | **critical**
- `confidence_score` (float): 0.0-1.0

## Supported Drugs (Case-Insensitive)

```
Warfarin          → CYP2C9
Clopidogrel       → CYP2C19
Codeine           → CYP2D6
Simvastatin       → SLCO1B1
Azathioprine      → TPMT
5-Fluorouracil    → DPYD
```

Input "warfarin", "WARFARIN", or "Warfarin" - all work identically.

## Phenotypes & Risk Labels

### Phenotype Classes
- **PM** (Poor Metabolizer) - Reduced/absent enzyme activity
- **IM** (Intermediate Metabolizer) - Intermediate activity
- **NM** (Normal Metabolizer) - Normal activity
- **URM** (Ultra-Rapid Metabolizer) - Increased activity

### Risk Classifications

| Risk Label | Explanation |
|------------|-------------|
| **Safe** | Normal dose appropriate, no action needed |
| **Adjust Dosage** | Dose adjustment recommended based on phenotype |
| **Toxic** | High risk of toxicity, avoid or reduce dose significantly |
| **Ineffective** | Drug unlikely to be effective at normal doses |
| **Unknown** | Drug not supported or insufficient data |

## Usage Examples

### Single Drug Analysis
```python
from pharmacogenomic_service import analyze

result = analyze("patient.vcf", "Warfarin")
print(f"Risk: {result['risk_label']}")
# Output: Risk: Adjust Dosage
```

### Case-Insensitive Input
```python
# All of these work identically:
analyze("patient.vcf", "warfarin")
analyze("patient.vcf", "WARFARIN")
analyze("patient.vcf", "Warfarin")
```

### With Logging
```python
from pharmacogenomic_service import configure_logging, analyze

configure_logging("DEBUG")  # Options: DEBUG, INFO, WARNING, ERROR
result = analyze("patient.vcf", "Codeine")
```

### Batch Analysis with Caching
```python
from pharmacogenomic_service import analyze, VCFCache
from risk_engine import RiskEngine

with VCFCache(enable=True):  # Cache VCF for multiple lookups
    for drug in RiskEngine.get_all_drugs():
        r = analyze("patient.vcf", drug)
        print(f"{drug}: {r['risk_label']}")
```

### Error Handling
```python
result = analyze("patient.vcf", "UnknownDrug")
# Safe fallback - never crashes:
# {
#     "primary_gene": None,
#     "detected_rsid": None,
#     "phenotype": "Unknown",
#     "risk_label": "Unknown",
#     "severity": "none",
#     "confidence_score": 0.0
# }
```

## Risk Mapping Examples

### Warfarin (CYP2C9 Metabolism)
| Phenotype | Risk | Severity | Note |
|-----------|------|----------|------|
| PM | Toxic | critical | Poor metabolism = bleeding risk |
| IM | Adjust Dosage | moderate | Intermediate = dose adjustment |
| NM | Safe | none | Normal metabolism = standard dose |
| URM | Adjust Dosage | low | Rapid metabolism = higher dose |

### Codeine (CYP2D6 Metabolism)
| Phenotype | Risk | Severity | Note |
|-----------|------|----------|------|
| PM | Ineffective | moderate | No pain relief |
| IM | Safe | low | Adequate effect |
| NM | Safe | none | Standard effect |
| URM | Toxic | critical | Toxicity & overdose risk |

## Implementation Notes

**Simple & Rule-Based:**
- No star allele phasing
- No complex genotype inference  
- Direct phenotype lookup from VCF rsIDs
- Straightforward drug-phenotype-risk mapping

**Performance Optimized:**
- O(1) lookups: frozensets for drugs & genes
- O(1) dict access: direct risk lookups
- VCF caching for batch operations
- Single-pass file parsing

**Hackathon Compliant:**
- Exactly 6 return keys (always)
- Case-insensitive drug input
- Safe fallback for unknown drugs
- No crashes on invalid input
- Proper null handling (None vs "Unknown")

## Requirements

- Python 3.10+
- No external dependencies

## File Structure

```
RIFT_Health-Track/
├── vcf_parser.py                 # VCF parsing module
├── phenotype_engine.py           # Phenotype mapping module
├── risk_engine.py                # Risk determination module
├── pharmacogenomic_service.py    # Main orchestrator
└── README.md                     # This file
```

## Hackathon Compliance

✓ Correct risk labels: Safe, Adjust Dosage, Toxic, Ineffective, Unknown  
✓ Correct severities: none, low, moderate, high, critical  
✓ Case-insensitive drug input with normalization  
✓ Safe fallback for unknown drugs  
✓ Exactly 6 return keys (always)  
✓ Proper null handling in responses  
✓ 4 modular files, clean code
✓ No unnecessary complexity
