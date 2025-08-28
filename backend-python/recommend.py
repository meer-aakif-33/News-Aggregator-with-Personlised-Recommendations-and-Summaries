from flask import Blueprint, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

recommend_bp = Blueprint("recommend", __name__)

def compute_recommendations(news_data, article_title, top_n=3):
    df = pd.DataFrame(news_data)

    required_columns = ["title", "description", "content", "urlToImage", "url", "source", "author", "publishedAt"]
    df = df[required_columns].dropna(subset=["title", "description", "content"])

    df["author"] = df["author"].fillna("Unknown")
    df["source"] = df["source"].fillna("Unknown")

    df["publishedAt"] = pd.to_datetime(df["publishedAt"], errors="coerce")
    max_date = df["publishedAt"].max()
    df["recency"] = (max_date - df["publishedAt"]).dt.days
    df["recency"] = df["recency"].fillna(df["recency"].mean())

    df["source"] = df["source"].apply(lambda s: s["name"] if isinstance(s, dict) and "name" in s else str(s))

    df["text"] = (
        df["title"].astype(str) + " " +
        df["description"].astype(str) + " " +
        df["content"].astype(str) + " " +
        df["author"].astype(str) + " " +
        df["source"].astype(str)
    )

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(df["text"])
    similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

    article_title = article_title.strip().lower()
    df["title"] = df["title"].str.strip().str.lower()

    if article_title not in df["title"].values:
        return {"error": "Article not found!"}

    idx = df[df["title"] == article_title].index[0]
    similar_scores = list(enumerate(similarity_matrix[idx]))

    for i, (rec_idx, score) in enumerate(similar_scores):
        if df.iloc[rec_idx]["author"] == df.iloc[idx]["author"]:
            score += 0.1
        if df.iloc[rec_idx]["source"] == df.iloc[idx]["source"]:
            score += 0.02
        recency_score = 1 / (1 + df.iloc[rec_idx]["recency"])
        score += 0.05 * recency_score
        similar_scores[i] = (rec_idx, score)

    similar_scores = sorted(similar_scores, key=lambda x: x[1], reverse=True)[1:top_n + 1]

    recommendations = [
        {
            "title": df.iloc[i[0]]["title"],
            "description": df.iloc[i[0]]["description"],
            "urlToImage": df.iloc[i[0]]["urlToImage"],
            "url": df.iloc[i[0]]["url"],
            "author": df.iloc[i[0]]["author"],
            "publishedAt": df.iloc[i[0]]["publishedAt"].strftime("%Y-%m-%d") if pd.notna(df.iloc[i[0]]["publishedAt"]) else "Invalid Date",
            "source": df.iloc[i[0]]["source"],
        }
        for i in similar_scores
    ]

    return recommendations

@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    articles = data.get("articles", [])
    title = data.get("title", "")

    if not articles or not title:
        return jsonify({"error": "Missing data"}), 400

    recommendations = compute_recommendations(articles, title)
    return jsonify(recommendations)
