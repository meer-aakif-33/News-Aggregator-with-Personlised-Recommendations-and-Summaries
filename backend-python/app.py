from flask import Flask
from summarize import summarize_bp
from recommend import recommend_bp

app = Flask(__name__)

# Register both blueprints
app.register_blueprint(summarize_bp)
app.register_blueprint(recommend_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
