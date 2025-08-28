import os
from flask import Flask
from summarize import summarize_bp
from recommend import recommend_bp

app = Flask(__name__)

app.register_blueprint(summarize_bp)
app.register_blueprint(recommend_bp)

@app.route('/')
def home():
    return "Python backend is running!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use Render's PORT or fallback to 5000
    app.run(host="0.0.0.0", port=port, debug=False)
