/**
 * API Configuration
 * Automatically detects if running on Vercel (production) or localhost (development)
 */
const getApiUrl = () => {
  // In production (Vercel), use relative URLs - Vercel routes /analyze, /health, etc. to backend
  if (import.meta.env.PROD) {
    return '' // Relative URLs - Vercel routes API endpoints to backend
  }
  // In development, use localhost
  return 'http://localhost:8000'
}

export const API_BASE_URL = getApiUrl()

export const API_ENDPOINTS = {
  analyze: `${API_BASE_URL}/analyze`,
  health: `${API_BASE_URL}/health`,
  docs: `${API_BASE_URL}/docs`,
}

// Debug logging
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS,
    isProd: import.meta.env.PROD
  })
}
