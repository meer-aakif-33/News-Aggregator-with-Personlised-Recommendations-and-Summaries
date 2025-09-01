import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import newsImage from "../../assests/images/download.jpg";
import { motion } from "framer-motion";

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
    <div className="px-6 py-12 min-h-screen 
                    bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50
                    bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] 
                    bg-fixed bg-opacity-5">
      <h2 className="text-4xl font-extrabold text-center mb-10 
                     bg-gradient-to-r from-indigo-600 to-purple-600 
                     bg-clip-text text-transparent tracking-wide">
        📰 Latest News
      </h2>

      {/* Responsive Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-10">
        {newsData.slice(0, 40).map((article, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Link
              to={`/news/${index}`}
              state={{ article, allArticles: newsData }}
              className="h-full flex flex-col overflow-hidden 
                        backdrop-blur-md bg-white/70 rounded-2xl 
                        shadow-md hover:shadow-[0_4px_30px_rgba(79,70,229,0.3)] 
                        transition-all duration-500 
                        border border-indigo-200/40 
                        hover:border-indigo-500/80 
                        hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* Image with overlay */}
              <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                <img
                  src={article.urlToImage || newsImage}
                  alt="news"
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Tag */}
                <span className="inline-block px-3 py-1 mb-2 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                  {article.source?.name || "News"}
                </span>

                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm flex-1 line-clamp-3">
                  {article.description}
                </p>

                {/* Read More Button */}
                <span className="mt-4 inline-flex items-center px-3 py-1.5 
                                 text-indigo-600 font-semibold text-sm rounded-full 
                                 border border-indigo-200 
                                 hover:bg-indigo-600 hover:text-white 
                                 transition-all duration-300 self-start">
                  Read More →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
