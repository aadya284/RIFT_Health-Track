"""
Vercel serverless function entry point for RIFT Health-Track API
"""
import sys
import os

# Add backend directory to Python path for Vercel
# When running on Vercel, the working directory is the project root
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if os.path.exists(backend_path):
    sys.path.insert(0, backend_path)
    sys.path.insert(0, os.path.dirname(__file__))

# Change to backend directory so relative imports work
original_cwd = os.getcwd()
if os.path.exists(backend_path):
    os.chdir(backend_path)

try:
    # Import the FastAPI app from backend/main.py
    from main import app
finally:
    # Restore original working directory
    os.chdir(original_cwd)

# Export the app for Vercel
handler = app
