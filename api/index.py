"""
Vercel serverless function entry point for RIFT Health-Track API
FastAPI app exported for Vercel
"""
import sys
from pathlib import Path

# Get the project root directory (parent of api/)
project_root = Path(__file__).parent.parent
backend_path = project_root / "backend"

# Add backend to Python path so we can import from backend/main.py
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Import the FastAPI app from backend/main.py
# This must be at module level for Vercel to detect it
from main import app

# Vercel auto-detects FastAPI when 'app' is exported at module level
