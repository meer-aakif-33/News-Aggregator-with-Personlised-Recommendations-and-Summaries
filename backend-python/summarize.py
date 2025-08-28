from flask import Blueprint, request, jsonify
from transformers import pipeline

summarize_bp = Blueprint("summarize", __name__)

# Smaller model for lightweight deployment
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

@summarize_bp.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text")

    if not text or not isinstance(text, str):
        return jsonify({"error": "Valid text parameter is required."}), 400

    try:
        summary_result = summarizer(text, max_length=130, min_length=60, do_sample=False)
        return jsonify({"summary": summary_result[0]["summary_text"]})
    except Exception as e:
        return jsonify({"error": f"Summarization failed: {str(e)}"}), 500
