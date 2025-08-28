import {jwtDecode} from "jwt-decode";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const handleDone = () => {
    if (selectedGenres.length > 0) {
      alert("You selected the following genres: " + selectedGenres.join(", "));
  
      const token = localStorage.getItem("authToken");
      if (token) {
        const decoded = jwtDecode(token);
        const userId = decoded.userId || decoded.email; // Use unique user info
        
        localStorage.setItem(`hasPreferences_${userId}`, "true");
      }
  
      // ✅ Store selected genres in localStorage
      localStorage.setItem("selectedGenres", JSON.stringify(selectedGenres));
  
      navigate("/mainNews", { state: { selectedGenres } });
    } else {
      alert("Please select at least one genre before proceeding.");
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
