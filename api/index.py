"""
Vercel serverless function entry point for RIFT Health-Track API
FastAPI app exported for Vercel
"""
import sys
import os
from pathlib import Path

# Get the project root directory (parent of api/)
project_root = Path(__file__).parent.parent
backend_path = project_root / "backend"

# Add backend to Python path
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))
    sys.path.insert(0, str(project_root))

# Change to backend directory for imports
original_cwd = os.getcwd()
try:
    os.chdir(str(backend_path))
    # Import the FastAPI app from backend/main.py
    from main import app
finally:
    os.chdir(original_cwd)

# Vercel auto-detects FastAPI when 'app' is exported
# The app variable is what Vercel looks for
