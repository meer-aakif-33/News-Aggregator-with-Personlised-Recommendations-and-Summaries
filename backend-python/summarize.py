from flask import Blueprint, request, jsonify
from transformers import pipeline, BartTokenizer
from concurrent.futures import ThreadPoolExecutor
import torch
import traceback

summarize_bp = Blueprint("summarize", __name__)

# Load summarizer pipeline with GPU if available
device = 0 if torch.cuda.is_available() else -1
summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device=device)
tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")

def split_into_chunks(text, max_chunk_length=512):
    input_ids = summarizer.tokenizer.encode(text, return_tensors="pt", truncation=False)[0]
    chunks = [input_ids[i:i + max_chunk_length] for i in range(0, len(input_ids), max_chunk_length)]
    return [summarizer.tokenizer.decode(chunk, skip_special_tokens=True) for chunk in chunks]

def summarize_chunk_safe(chunk):
    try:
        result = summarizer(chunk, max_length=125, min_length=75, do_sample=False)
        return result[0]["summary_text"]
    except Exception as e:
        print(f"Chunk summarization failed: {e}")
        return "[Summary failed for this part]"

@summarize_bp.route("/summarize", methods=["POST"])
def summarize():
    try:
        data = request.get_json()
        text = data.get("text")

        if not text or not isinstance(text, str):
            return jsonify({"error": "Valid text parameter is required."}), 400

        chunks = split_into_chunks(text)
        with ThreadPoolExecutor() as executor:
            summaries = list(executor.map(summarize_chunk_safe, chunks))

        combined_summary = " ".join(summaries)
        return jsonify({"summary": combined_summary})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "An unexpected error occurred."}), 500
