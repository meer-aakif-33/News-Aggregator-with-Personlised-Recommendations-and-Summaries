import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import newsImage from "../../assests/images/blob.jpg";

export default function TrendingNewsPage() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl =  
      "https://newsapi.org/v2/top-headlines?country=us&apiKey=6599ec9ad7954716bae76c2c1c52e01d";

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setNewsData(data.articles.slice(0, 30));
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="trend-loading">Loading...</div>;
  if (error) return <div className="trend-error">Error: {error}</div>;

  return (
    <div className="trend-news-container">
      <h3 className="trend-news-heading">Trending News</h3>
      <div className="trend-news-grid">
        {newsData.map((article, index) => (
          <Link to={`/news/${index + 1}`} className="trend-news-card" key={index}>
            <img
              src={article.urlToImage || newsImage}
              alt="news"
              className="trend-news-img"
            />
            <div className="trend-news-content">
              <h3 className="trend-news-title">{article.title}</h3>
              <p className="trend-news-description">{article.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
