import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import newsImage from "../../assests/images/blob.jpg";

export default function TrendingNewsPage() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        const backendUrl = "https://news-aggregator-with-personlised-qq5i.onrender.com";
        const apiUrl = `${backendUrl}/api/trending-news`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.articles) {
          setNewsData(data.articles);
        } else {
          setError("No trending articles found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingNews();
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
