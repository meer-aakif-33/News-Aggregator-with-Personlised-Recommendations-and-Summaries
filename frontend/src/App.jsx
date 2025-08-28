import {jwtDecode} from "jwt-decode";
import './App.css';
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import NewsArticlePage from "./components/pages/NewsArticlepage";
import MainNewsPage from "./components/pages/MainNewsPage";
import ProfilePage from "./components/pages/ProfilePage";
import PreferencesPage from "./components/pages/PreferencesPage";
import TrendingPage from "./components/pages/TrendingPage";
import Header from "./components/common/Header";
import LoginSignupPage from './components/pages/LoginPage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    navigate("/");
  };


  useEffect(() => {
    if (!isAuthenticated) return;
  
    const token = localStorage.getItem("authToken");
    let hasPreferences = null;
  
    if (token) {
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.email; // Extract unique identifier
  
      hasPreferences = localStorage.getItem(`hasPreferences_${userId}`);
    }
  
    if (location.pathname === "/" || location.pathname === "/login") {
      navigate(hasPreferences ? "/mainNews" : "/preferences", { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);
  
  return (
    <>
      {isAuthenticated && <Header onLogout={handleLogout} />}

      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              (!localStorage.getItem("hasPreferences") ? <Navigate to="/preferences" replace /> : <Navigate to="/mainNews" replace />) 
              : <LoginSignupPage setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route path="/preferences" element={isAuthenticated ? <PreferencesPage /> : <Navigate to="/" replace />} />
        <Route path="/mainNews" element={isAuthenticated ? <MainNewsPage /> : <Navigate to="/" replace />} />
        <Route path="/trending" element={isAuthenticated ? <TrendingPage /> : <Navigate to="/" replace />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" replace />} />
        <Route path="/news/:id" element={isAuthenticated ? <NewsArticlePage /> : <Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
