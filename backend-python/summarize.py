from flask import Blueprint, request, jsonify
import os
import requests

summarize_bp = Blueprint("summarize", __name__)
HF_API_KEY = os.getenv("HF_API_KEY")

API_URL = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6"
HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

@summarize_bp.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text")

    if not text or not isinstance(text, str):
        return jsonify({"error": "Valid text parameter is required."}), 400

    try:
        payload = {"inputs": text, "parameters": {"max_length": 130, "min_length": 60}}
        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
        response.raise_for_status()
        summary = response.json()[0]["summary_text"]
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": f"Summarization failed: {str(e)}"}), 500
