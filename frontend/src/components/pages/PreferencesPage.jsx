// components/pages/PreferencesPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NewsGenreSelection = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();

  const genres = [
    "Technology", "Sports", "Politics", "Entertainment",
    "Health", "Science", "Business", "Travel", "Lifestyle",
    "Education", "Food", "Environment"
  ];

  const toggleSelection = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleDone = async () => {
    if (selectedGenres.length === 0) {
      toast.error("⚠️ Please select at least one genre!", { duration: 3000 });
      return;
    }

    toast.success("✅ Preferences saved successfully!", { duration: 3000 });

    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    localStorage.setItem(`hasPreferences_${userId}`, "true");
    localStorage.setItem(`preferences_${userId}`, JSON.stringify(selectedGenres));
    localStorage.setItem(`welcomeShown_${userId}`, "false");

    await fetch("https://news-aggregator-with-personlised-qq5i.onrender.com/update-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ preferences: selectedGenres }),
    });

    navigate("/mainNews", { state: { selectedGenres } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          Choose Your Preferred News Genres
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleSelection(genre)}
              className={`cursor-pointer py-3 px-4 md:py-4 md:px-6 rounded-xl font-medium text-white text-sm md:text-base transition-transform transform hover:scale-105 shadow-md ${
                selectedGenres.includes(genre)
                  ? "bg-gradient-to-r from-green-400 to-teal-500"
                  : "bg-gradient-to-r from-pink-500 to-red-500"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <button
          onClick={handleDone}
          className="cursor-pointer mt-8 w-full md:w-1/3 mx-auto py-3 md:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-lg text-lg md:text-xl transition-all duration-300"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default NewsGenreSelection;
