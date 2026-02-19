# Deploy Backend to Render

## ⚠️ Important: Use Web Service, NOT Static Site

The error **"Publish directory dist does not exist!"** means the service is configured as a **Static Site**. The backend must be a **Web Service**.

---

## Option A: Deploy from Blueprint (render.yaml)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your repo
4. Render will read `render.yaml` and create a **Web Service** (Python)
5. Add `GEMINI_API_KEY` in Environment variables
6. Deploy

---

## Option B: Create Web Service Manually

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service** (NOT Static Site)
3. Connect your repository
4. Configure:
   - **Name**: rift-health-track-api
   - **Region**: Oregon (or your choice)
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variable: `GEMINI_API_KEY` = your API key
6. Click **Create Web Service**

---

## If You Already Have a Static Site

1. Go to your service → **Settings**
2. You cannot change Static Site → Web Service
3. **Delete the service** and create a new **Web Service** (Option B above)
