import concurrent.futures
import logging
import os

from dotenv import load_dotenv
import google.generativeai as genai


load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY_ENV_VAR = "GEMINI_API_KEY"
DEFAULT_TIMEOUT_SECONDS = 15.0


api_key = os.getenv(GEMINI_API_KEY_ENV_VAR)
if api_key:
    genai.configure(api_key=api_key)
else:
    # Log a generic error if the key is missing, without exposing any secrets
    logger.error("Gemini API key is not configured in environment.")


model = genai.GenerativeModel("gemini-1.5-pro")


def _generate_content(prompt: str):
    """Internal helper to call Gemini model."""
    return model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,
            "top_p": 0.9,
            "max_output_tokens": 2048,
        },
    )


def generate_llm_response(prompt: str, timeout: float = DEFAULT_TIMEOUT_SECONDS) -> str:
    """
    Generate a text response from Gemini with basic safety:
    - Uses a timeout to avoid hanging requests.
    - Catches and logs errors without raising them to callers.
    - Never logs or exposes the API key.
    """
    # If API key is missing, return empty string so caller can handle fallback.
    if not os.getenv(GEMINI_API_KEY_ENV_VAR):
        logger.error("Gemini API key not available; returning empty response.")
        return ""

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_generate_content, prompt)
            response = future.result(timeout=timeout)
        text = getattr(response, "text", "") or ""
        return text
    except concurrent.futures.TimeoutError:
        logger.error("Gemini request timed out after %.1f seconds.", timeout)
        return ""
    except Exception as exc:  # noqa: BLE001 - broad to ensure API never crashes caller
        logger.error("Gemini request failed: %s", str(exc))
        return ""
