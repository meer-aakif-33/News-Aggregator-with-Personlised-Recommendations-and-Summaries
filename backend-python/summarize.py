# from flask import Blueprint, request, jsonify
# import os
# import requests

# summarize_bp = Blueprint("summarize", __name__)
# HF_API_KEY = os.getenv("HF_API_KEY")
# print("API_KEY_IS:", HF_API_KEY)
# API_URL = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6"
# HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

# @summarize_bp.route("/summarize", methods=["POST"])
# def summarize():
#     data = request.get_json()
#     text = data.get("text")

#     if not text or not isinstance(text, str):
#         return jsonify({"error": "Valid text parameter is required."}), 400

#     try:
#         payload = {"inputs": text, "parameters": {"max_length": 130, "min_length": 60}}
#         response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
#         response.raise_for_status()
#         summary = response.json()[0]["summary_text"]
#         return jsonify({"summary": summary})
#     except Exception as e:
#         return jsonify({"error": f"Summarization failed: {str(e)}"}), 500


from flask import Blueprint, request, jsonify
import os
from google import genai
from dotenv import load_dotenv

summarize_bp = Blueprint("summarize", __name__)

# Load .env file into environment variables
load_dotenv()

# Get API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is missing! Please check your .env file or Render environment variables.")

# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

@summarize_bp.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text")

    if not text or not isinstance(text, str):
        return jsonify({"error": "Valid text parameter is required."}), 400

    try:
        # Send text to Gemini (same format as Hugging Face payload)
        prompt = f"Summarize the following text in 130 words or less:\n\n{text}"

        response = client.models.generate_content(
            model="gemini-2.5-flash",  # Fast model for summarization
            contents=prompt,
        )

        summary = response.text.strip()
        print("✅ Summary:", summary)  # Log in console (shows up in Render logs)
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": f"Summarization failed: {str(e)}"}), 500
