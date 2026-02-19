# Vercel Deployment Guide - Frontend + Backend

## ✅ Current Configuration

### Project Structure
```
RIFT_Health-Track-1/
├── api/
│   ├── index.py              # Vercel serverless function (FastAPI entry point)
│   └── requirements.txt      # Python deps (backup)
├── backend/
│   ├── main.py               # FastAPI application
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── dist/                 # Build output (generated)
│   ├── src/
│   └── package.json
├── vercel.json               # Vercel configuration
├── pyproject.toml            # Python project config (FastAPI entrypoint)
├── requirements.txt          # Python dependencies (root - for Vercel)
├── .python-version           # Python 3.11.9
└── package.json              # Root package.json (for Vercel detection)
```

### Key Files

1. **`vercel.json`** - Routes API calls to backend, serves frontend
2. **`api/index.py`** - Serverless function entry point (imports FastAPI app)
3. **`pyproject.toml`** - Tells Vercel where to find the FastAPI app
4. **`requirements.txt`** (root) - Python dependencies for Vercel
5. **`.python-version`** - Python 3.11.9 runtime

## 🚀 Deployment Steps

### Option 1: Vercel Dashboard (Recommended)

1. **Go to https://vercel.com**
2. **Click "Add New Project"**
3. **Import your Git repository**
4. **Vercel will auto-detect:**
   - ✅ Frontend: React/Vite (from `vercel.json` build command)
   - ✅ Backend: Python/FastAPI (from `api/index.py` + `pyproject.toml`)
5. **Configure Project Settings:**
   - **Framework Preset**: Other (or Vite if available)
   - **Root Directory**: Leave as root (`.`)
   - **Build Command**: `cd frontend && npm install && npm run build` (auto-detected)
   - **Output Directory**: `frontend/dist` (auto-detected)
   - **Install Command**: Leave empty (handled in build command)
6. **Add Environment Variable:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
7. **Click "Deploy"**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (will prompt for configuration)
vercel

# Add environment variable
vercel env add GEMINI_API_KEY
# Enter your API key when prompted

# Deploy to production
vercel --prod
```

## 🔧 How It Works

### Frontend Build
1. Vercel runs: `cd frontend && npm install && npm run build`
2. Outputs static files to `frontend/dist/`
3. Serves via CDN

### Backend Function
1. Vercel detects `api/index.py` as a Python serverless function
2. Reads `pyproject.toml` to find FastAPI app (`api.index:app`)
3. Installs Python dependencies from `requirements.txt` (root)
4. Routes API requests (`/analyze`, `/health`, `/docs`) to `/api/index`

### Routing
- `/api/*` → Backend (FastAPI)
- `/analyze` → Backend (FastAPI)
- `/health` → Backend (FastAPI)
- `/docs` → Backend (FastAPI docs)
- `/openapi.json` → Backend (OpenAPI schema)
- `/*` (everything else) → Frontend (`/index.html`)

## ✅ Verification

After deployment, test:

1. **Frontend**: `https://your-project.vercel.app/`
2. **Backend Health**: `https://your-project.vercel.app/health`
3. **API Docs**: `https://your-project.vercel.app/docs`
4. **Analyze Endpoint**: Use the frontend form to upload VCF and test

## 🐛 Troubleshooting

### Error: "No fastapi entrypoint found"
- ✅ **Fixed**: Added `pyproject.toml` with `[project.scripts] app = "api.index:app"`

### Error: "Python dependencies not found"
- Ensure `requirements.txt` exists in root directory
- Check `.python-version` is set to `3.11.9`

### Error: "Frontend build failed"
- Check `frontend/package.json` has correct build script
- Verify `vite` is installed in `devDependencies`

### Error: "API routes not working"
- Check `vercel.json` rewrites are correct
- Verify `api/index.py` properly imports and exports `app`
- Check Vercel function logs in dashboard

### Button not working after deployment
- Check browser console for errors
- Verify API calls use relative URLs in production
- Check `frontend/src/config/api.js` uses empty string for `API_BASE_URL` in production

## 📝 Environment Variables

Required:
- `GEMINI_API_KEY` - Your Google Gemini API key

Add in Vercel Dashboard → Project Settings → Environment Variables

## 📚 Additional Resources

- [Vercel FastAPI Docs](https://vercel.com/docs/frameworks/backend/fastapi)
- [Vercel Configuration](https://vercel.com/docs/project-configuration)
