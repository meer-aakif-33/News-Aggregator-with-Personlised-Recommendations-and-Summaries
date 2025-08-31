import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import newsImage from "../../assests/images/download.jpg";

export default function MainNewsPage() {
  const [newsData, setNewsData] = useState([]);
  const location = useLocation();
  const hasFetched = useRef(false);

  const userId = localStorage.getItem("userId");

  let storedGenres;
  try {
    const raw = localStorage.getItem(`preferences_${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    storedGenres = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error parsing stored preferences:", e);
    storedGenres = [];
  }

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchNews = async () => {
      try {
        let query = "";

        if (storedGenres.length > 0) {
          query = storedGenres
            .map((keyword) => encodeURIComponent(keyword))
            .join("+");
        }

        const backendUrl = "https://news-aggregator-with-personlised-qq5i.onrender.com";
        const apiUrl = query
          ? `${backendUrl}/api/news?q=${query}`
          : `${backendUrl}/api/news`;

        console.log("Fetching news from backend:", apiUrl);

        const token = localStorage.getItem("authToken");
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, [storedGenres]);

  return (
    <div className="px-4 py-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Latest News
      </h2>

      {/* Responsive Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {newsData.slice(0, 20).map((article, index) => (
          <Link
            to={`/news/${index}`}
            state={{ article, allArticles: newsData }}
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden"
          >
            {/* Image */}
            <div className="h-48 w-full overflow-hidden">
              <img
                src={article.urlToImage || newsImage}
                alt="news"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm flex-1 line-clamp-3">
                {article.description}
              </p>
              <span className="mt-4 text-blue-600 font-medium hover:underline text-sm">
                Read More →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
