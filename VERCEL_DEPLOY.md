# Deploy Frontend + Backend Together on Vercel

## ✅ What's Configured

- **Frontend**: React/Vite app builds to `frontend/dist/`
- **Backend**: FastAPI Python serverless function at `api/index.py`
- **Routing**: API routes (`/analyze`, `/health`, `/docs`) → Backend, everything else → Frontend

---

## Deployment Steps

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to https://vercel.com**
2. **Click "Add New Project"**
3. **Import your Git repository**
4. **Vercel will auto-detect:**
   - Frontend build (from `vercel.json`)
   - Python backend (from `api/index.py`)
5. **Add Environment Variable:**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
6. **Click "Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

---

## Project Structure

```
RIFT_Health-Track-1/
├── api/
│   └── index.py              # Vercel serverless function (backend entry)
├── backend/
│   ├── main.py               # FastAPI app
│   ├── pharmacogenomics/
│   ├── llm_explainability/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js        # API URL configuration
│   │   └── pages/
│   │       └── Analyze.jsx   # Uses API config
│   ├── package.json
│   └── vite.config.js
├── vercel.json               # Vercel configuration
├── requirements.txt          # Python dependencies (for Vercel)
└── .vercelignore
```

---

## How It Works

1. **Frontend Build**: Vercel runs `cd frontend && npm install && npm run build`
   - Outputs to `frontend/dist/`

2. **Backend Function**: Vercel deploys `api/index.py` as a serverless function
   - Handles `/analyze`, `/health`, `/docs`, `/openapi.json`

3. **Routing**:
   - `/analyze`, `/health`, `/docs` → Python backend
   - All other routes → Frontend React app (handled by React Router)

4. **API Calls**: Frontend uses relative URLs in production
   - Development: `http://localhost:8000/analyze`
   - Production: `/analyze` (Vercel routes to backend)

---

## API Endpoints

After deployment:
- **Frontend**: `https://your-project.vercel.app/`
- **API Health**: `https://your-project.vercel.app/health`
- **API Analyze**: `https://your-project.vercel.app/analyze`
- **API Docs**: `https://your-project.vercel.app/docs`

---

## Environment Variables

Set in Vercel Dashboard → Project → Settings → Environment Variables:
- `GEMINI_API_KEY` (required)

---

## Troubleshooting

- **Frontend not loading**: Check `frontend/dist/` exists after build
- **API 404 errors**: Verify routes in `vercel.json` match your endpoints
- **Import errors**: Ensure `backend/` directory is committed to Git
- **Timeout errors**: Backend has 60s max duration (configured in vercel.json)
