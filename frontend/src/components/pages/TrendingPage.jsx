import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // ✅ for smooth card animation
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        {/* Beautiful spinner */}
        <div className="w-16 h-16 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 text-xl font-semibold">
        Error: {error}
      </div>
    );

  return (
    <div className="px-6 py-12 min-h-screen 
                    bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50
                    bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] 
                    bg-fixed bg-opacity-5">
      <h2 className="text-4xl font-extrabold text-center mb-10 
                     bg-gradient-to-r from-pink-500 to-indigo-600 
                     bg-clip-text text-transparent tracking-wide">
        🔥 Trending News
      </h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-10">
        {newsData.map((article, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
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
              {/* Image */}
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
                <span className="inline-block px-3 py-1 mb-2 text-xs font-medium text-pink-700 bg-pink-100 rounded-full">
                  {article.source?.name || "Trending"}
                </span>

                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm flex-1 line-clamp-3">
                  {article.description}
                </p>

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
