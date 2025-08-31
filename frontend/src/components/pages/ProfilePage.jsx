import React, { useEffect, useState } from "react";

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
      const res = await fetch("https://news-aggregator-with-personlised-qq5i.onrender.com/update-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, preferences }),
      });

      if (res.ok) {
        localStorage.setItem(`preferences_${userId}`, JSON.stringify(preferences));
        setEditing(false);
      } else {
        console.error("Failed to update preferences");
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg transition-transform hover:scale-[1.01]">
        
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <img
            src="https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png"
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-blue-100 shadow-md object-cover mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <p className="text-gray-500">{email}</p>
          <p className="mt-2 text-sm text-gray-600 italic">
            Web Developer | Tech Enthusiast | Blogger
          </p>
        </div>

        {/* Preferences */}
        <div className="mt-6 text-left">
          <h3 className="font-semibold text-lg text-gray-700 mb-3">Preferences</h3>
          {!editing ? (
            <div className="flex flex-wrap gap-2">
              {Array.isArray(preferences) && preferences.length > 0 ? (
                preferences.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium shadow-sm"
                  >
                    {p}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No preferences set</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => togglePreference(genre)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all shadow-sm ${
                    preferences.includes(genre)
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition"
            >
              Edit Preferences
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium shadow-md hover:bg-green-700 transition"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
