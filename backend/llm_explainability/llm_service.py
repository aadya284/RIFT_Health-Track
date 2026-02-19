import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-pro")

def generate_llm_response(prompt):
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,  # VERY IMPORTANT
            "top_p": 0.9,
            "max_output_tokens": 2048
        }
    )
    return response.text
