🧬 PharmaGuard – AI-Powered Pharmacogenomic Risk Analysis Engine

A full-stack precision medicine platform that analyzes patient VCF genomic data to generate drug-specific pharmacogenomic risk assessments and AI-powered clinical explanations.

🌐 Live Demo

🔗 Live Application:
👉 [<LIVE_URL>](https://rift-health-track.vercel.app/)

🎥 Demo Video (LinkedIn Submission):
👉 [<LINKEDIN_VIDEO_URL>](https://www.linkedin.com/posts/aparna-singh-2b364431b_rift2026-pharmaguard-pharmacogenomics-activity-7430407882615205888-7LZs?utm_source=share&utm_medium=member_android&rcm=ACoAAFETGKcBcSRDNR9VMDQWoCgYjkdTu3EUt3U)

📌 Project Overview

PharmaGuard is a pharmacogenomic decision-support system that:

Parses real-world VCF v4.2 genomic data

Detects clinically significant variants

Infers metabolizer phenotype

Maps drug-specific risk using CPIC-aligned logic

Generates AI-powered explainability via Gemini

Produces structured JSON for evaluation compliance

The system bridges deterministic genomic logic with LLM-based clinical interpretation.

🧠 Problem Statement

Adverse drug reactions caused by genetic variation lead to:

Increased hospitalization

Higher treatment costs

Drug toxicity

Ineffective therapies

PharmaGuard enables precision dosing decisions using patient-specific genomic data.

🏗 Architecture Overview
Frontend (Vite + React)
        ↓
FastAPI Backend (Serverless / Web Service)
        ↓
Pharmacogenomic Engine
        ↓
LLM Explainability (Gemini API)
        ↓
Structured JSON Output
Backend Modules

pharmacogenomics/

vcf_parser.py

phenotype_engine.py

risk_engine.py

pharmacogenomic_service.py

explainability/

llm_service.py

explanation_generator.py

api/index.py (Vercel entry)

🧬 Supported Drugs & Genes
Drug	Primary Gene
Warfarin	CYP2C9
Clopidogrel	CYP2C19
Codeine	CYP2D6
Simvastatin	SLCO1B1
Azathioprine	TPMT
5-Fluorouracil	DPYD
⚙ Tech Stack
🔹 Frontend

React (Vite)

Tailwind CSS

Fetch API

Render / Vercel Hosting

🔹 Backend

FastAPI

Pydantic

Lightweight VCF Parsing

CPIC-aligned Rule Engine

Structured JSON Schema

🔹 AI Layer

Google Gemini API

Prompt-engineered clinical explanations

Fallback-safe LLM wrapper

🔹 Deployment

Vercel (Frontend)

Vercel / Render / Railway (Backend)

📊 Core Features

✔ VCF v4.2 Compatibility
✔ 6 Gene Support
✔ Worst-case phenotype prioritization
✔ CPIC-aligned risk classification
✔ Structured JSON output
✔ AI-based explanation layer
✔ Safe fallback handling
✔ Case-insensitive drug input
✔ Hackathon-compliant response schema

📦 Installation Instructions
1️⃣ Clone Repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
2️⃣ Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

Run locally:

uvicorn main:app --reload
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
🔑 Environment Variables

Create .env in backend:

GEMINI_API_KEY=your_api_key_here

For frontend:

VITE_API_URL=https://rift-health-track.vercel.app/

Accepts:

vcf_file (UploadFile)

drug_name (string)

Example Request
curl -X POST \
  -F "vcf_file=@patient.vcf" \
  -F "drug_name=warfarin" \
  http://localhost:8000/analyze
📄 Example Response
{
  "patient_id": "PATIENT_001",
  "drug": "WARFARIN",
  "risk_assessment": {
    "risk_label": "Toxic",
    "confidence_score": 0.95,
    "severity": "critical"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2C9",
    "diplotype": "*2/*3",
    "phenotype": "PM",
    "detected_variants": [
      { "rsid": "rs1057910" },
      { "rsid": "rs1799853" }
    ]
  },
  "clinical_recommendation": {
    "llm_generated_explanation": {
      "summary": "Patient carries CYP2C9 reduced-function alleles increasing bleeding risk.",
      "biological_mechanism": "Reduced CYP2C9 activity decreases warfarin metabolism.",
      "clinical_recommendation": "Significant dose reduction recommended per CPIC.",
      "score": 0.95
    }
  }
}
🛡 Risk Classification Logic
Phenotype	Risk	Severity
PM	Toxic / Ineffective	critical
IM	Adjust Dosage	moderate
NM	Safe	none
URM	Toxic / Adjust Dosage	high
🧪 Quality Metrics

VCF parsing validation

Variant count tracking

Gene annotation presence

Safe fallback behavior

No null outputs

👥 Team Members

Member 1: Aadya Paradkar

Member 2: Priyanshu Mahobia

Member 3: Aparna Singh

Member 4: Ansh Kumar Singh


🏆 Hackathon Compliance

✔ Structured JSON schema
✔ No crashes
✔ Safe fallback
✔ Exact risk labels
✔ VCF v4.2 compatible
✔ AI explanation layer
✔ Modular architecture

📜 License

This project was developed for hackathon evaluation and educational purposes.
