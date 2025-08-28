import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import newsImage from "../../assests/images/download.jpg";

export default function MainNewsPage() {
  const [newsData, setNewsData] = useState([]);
  const location = useLocation();
  const hasFetched = useRef(false); // Prevent multiple API calls

  const storedGenres = JSON.parse(localStorage.getItem("selectedGenres")) || [];
  const selectedGenres = location.state?.selectedGenres || storedGenres;


useEffect(() => {
  if (hasFetched.current) return;

  const fetchNews = async () => {
    try {
      let query = "";

      if (selectedGenres.length > 0) {
        query = selectedGenres.map(keyword => encodeURIComponent(keyword)).join("+");
      }

      const backendUrl = "https://news-aggregator-with-personlised-qq5i.onrender.com"; // replace with real backend URL
      const apiUrl = query
        ? `${backendUrl}/api/news?q=${query}`
        : `${backendUrl}/api/news`;

      

      console.log("Fetching news from backend:", apiUrl);

      const response = await fetch(apiUrl);
      //const text = await response.text();
      
      const data = await response.json();
      console.log("Raw response:", data);

      if (data.articles) {
        setNewsData(data.articles);
        hasFetched.current = true;
      } else {
        console.error("No articles found:", data);
        setNewsData([]);
      }
    } catch (error) {
      console.error("Error fetching news data:", error);
    }
  };

  fetchNews();
}, [selectedGenres]);



  return (
<>
  <div className="news-container">
    {newsData.slice(0, 2).map((article, index) => {
      const globalIndex = index;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(2, 4).map((article, index) => {
      const globalIndex = index + 2;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(4, 6).map((article, index) => {
      const globalIndex = index + 4;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(6, 8).map((article, index) => {
      const globalIndex = index + 6;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(8, 10).map((article, index) => {
      const globalIndex = index + 8;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(10, 12).map((article, index) => {
      const globalIndex = index + 10;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(12, 14).map((article, index) => {
      const globalIndex = index + 12;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(14, 16).map((article, index) => {
      const globalIndex = index + 14;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(16, 18).map((article, index) => {
      const globalIndex = index + 16;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>

  <div className="news-container">
    {newsData.slice(18, 20).map((article, index) => {
      const globalIndex = index + 18;
      return (
        <Link
          to={`/news/${globalIndex}`}
          state={{ article, allArticles: newsData }}
          key={globalIndex}
          className={`newsDiv news-${globalIndex + 1}`}
        >
          <div className="news-content">
            <h3>{article.title}</h3>
            <p>{article.description}</p>
          </div>
          <img
            src={article.urlToImage || newsImage}
            alt="newsImage"
            className="news-img"
          />
        </Link>
      );
    })}
  </div>
</>
  );
};