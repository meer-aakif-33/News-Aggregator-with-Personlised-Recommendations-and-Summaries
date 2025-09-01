// components/pages/ProfilePage.jsx


import React, { useEffect, useState } from "react";
import { User, Mail, Settings, CheckCircle2, Edit3 } from "lucide-react"; // icons

export default function UserProfile() {
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [preferences, setPreferences] = useState([]);
  const [editing, setEditing] = useState(false);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  const genres = [
    "Technology", "Sports", "Politics", "Entertainment",
    "Health", "Science", "Business", "Travel", "Lifestyle",
    "Education", "Food", "Environment"
  ];

  useEffect(() => {
    const loadPrefs = async () => {
      let prefs = [];
      const cached = localStorage.getItem(`preferences_${userId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          prefs = Array.isArray(parsed) ? parsed : [];
        } catch {
          prefs = [];
        }
      }

      if (prefs.length === 0 && token) {
        try {
          const res = await fetch(
            `https://news-aggregator-with-personlised-qq5i.onrender.com/api/get-preferences?userId=${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();

          if (data.preferences) {
            const parsed = Array.isArray(data.preferences)
              ? data.preferences
              : JSON.parse(data.preferences || "[]");

            prefs = Array.isArray(parsed) ? parsed : [];
            localStorage.setItem(`preferences_${userId}`, JSON.stringify(prefs));
          }
        } catch (err) {
          console.error("Error fetching preferences:", err);
        }
      }

      setPreferences(prefs);
    };

    loadPrefs();
  }, [token, userId]);

  const togglePreference = (genre) => {
    setPreferences((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        "https://news-aggregator-with-personlised-qq5i.onrender.com/update-preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, preferences }),
        }
      );

      if (res.ok) {
        localStorage.setItem(
          `preferences_${userId}`,
          JSON.stringify(preferences)
        );
        setEditing(false);
      } else {
        console.error("Failed to update preferences");
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg transition-transform hover:scale-[1.01]">
        
        {/* Profile Info */}
        <div className="flex flex-col items-center">
          <img
            src="https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png"
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-indigo-100 shadow-md object-cover mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> {name}
          </h2>
          <p className="flex items-center gap-2 text-gray-500 mt-1">
            <Mail className="w-4 h-4 text-indigo-500" /> {email}
          </p>
          <p className="mt-2 text-sm text-gray-600 italic">
            Web Developer | Tech Enthusiast | Blogger
          </p>
        </div>

        {/* Preferences */}
        <div className="mt-8 text-left">
          <h3 className="font-semibold text-lg text-gray-700 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" /> Preferences
          </h3>

          {!editing ? (
            <div className="flex flex-wrap gap-2">
              {Array.isArray(preferences) && preferences.length > 0 ? (
                preferences.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium shadow-sm"
                  >
                    {p}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No preferences set</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => togglePreference(genre)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-1 ${
                    preferences.includes(genre)
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {preferences.includes(genre) && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-center">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:from-indigo-600 hover:to-purple-700 transition flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Edit Preferences
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-md hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
