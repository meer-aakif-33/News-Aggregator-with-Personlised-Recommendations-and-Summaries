// components/pages/PreferencesPage.jsx


import {jwtDecode} from "jwt-decode";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    setSelectedGenres((prevGenres) => 
      prevGenres.includes(genre) 
        ? prevGenres.filter(item => item !== genre) 
        : [...prevGenres, genre]
    );
  };

const handleDone = async () => {
  if (selectedGenres.length > 0) {
      toast.success("✅ Preferences saved successfully!", { duration: 3000 });

    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    // Save locally
    localStorage.setItem(`hasPreferences_${userId}`, "true");
    localStorage.setItem(`preferences_${userId}`, JSON.stringify(selectedGenres));

    // Save in DB
    await fetch("https://news-aggregator-with-personlised-qq5i.onrender.com/update-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ preferences: selectedGenres }),
    });
    setTimeout(() => {
      localStorage.setItem(`welcomeShown_${userId}`, "false"); // ✅ mark as NOT shown yet
      navigate("/mainNews", { state: { selectedGenres } }); // ❌ removed fromAuth
    }, 500);
    } else {
      toast.error("⚠️ Please select at least one genre!", { duration: 3000 });
    }
  };
  
  return (
    <div style={styles.container}>
      <h2>Choose Your Preferred News Genre</h2>
      <br />
      <div style={styles.buttonsContainer}>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleSelection(genre)}
            style={{
              ...styles.genreButton,
              background: selectedGenres.includes(genre)
                ? 'linear-gradient(45deg, #1d976c, #93f9b9)' 
                : 'linear-gradient(45deg, #ff416c, #ff4b2b)',
            }}
          >
            {genre}
          </button>
        ))}
      </div>
      <button onClick={handleDone} style={styles.doneButton}>Done</button>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#121212',
    color: 'white',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  buttonsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '15px',
  },
  genreButton: {
    border: 'none',
    padding: '15px 30px',
    fontSize: '18px',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '25px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  doneButton: {
    marginTop: '20px',
    background: 'linear-gradient(45deg, #2193b0, #6dd5ed)',
    border: 'none',
    padding: '15px 30px',
    fontSize: '18px',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '25px',
  },
};

export default NewsGenreSelection;
