import {jwtDecode} from "jwt-decode"; // ✅ fixed import
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
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    navigate("/");
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("authToken");
    let decoded = null;
    let userId = null;
    let hasPreferences = null;

    if (token) {
      try {
        decoded = jwtDecode(token);
        userId = decoded.id;
        hasPreferences = localStorage.getItem(`hasPreferences_${userId}`);
      } catch (err) {
        console.error("Failed to decode JWT:", err);
      }
    }

    // console.log("==== Auth Check ====");
    // console.log("Token:", token);
    // console.log("Decoded:", decoded);
    // console.log("UserId:", userId);
    // console.log("Has Preferences:", hasPreferences);
    // console.log("===================");

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
            (() => {
              const token = localStorage.getItem("authToken");
              const userId = localStorage.getItem("userId");
              const hasPreferences = localStorage.getItem(`hasPreferences_${userId}`);

              // console.log("==== Route / Check ====");
              // console.log("Token:", token);
              // console.log("UserId:", userId);
              // console.log("Has Preferences:", hasPreferences);
              // console.log("======================");

              if (isAuthenticated) {
                return !hasPreferences ? <Navigate to="/preferences" replace /> : <Navigate to="/mainNews" replace />;
              } else {
                return <LoginSignupPage setIsAuthenticated={setIsAuthenticated} />;
              }
            })()
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
