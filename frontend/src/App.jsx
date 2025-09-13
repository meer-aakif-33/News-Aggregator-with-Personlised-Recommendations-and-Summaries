import { jwtDecode } from "jwt-decode"; // ✅ fixed import
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
import ProtectedRoute from "./components/common/ProtectedRoute";
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

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token); // always sync state with localStorage
  }, []);

  return (
    <>
      {isAuthenticated && <Header onLogout={handleLogout} />}

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              !localStorage.getItem(`hasPreferences_${localStorage.getItem("userId")}`)
                ? <Navigate to="/preferences" replace />
                : <Navigate to="/mainNews" replace />
            ) : (
              <LoginSignupPage setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />

        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <PreferencesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mainNews"
          element={
            <ProtectedRoute>
              <MainNewsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trending"
          element={
            <ProtectedRoute>
              <TrendingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/news/:id"
          element={
            <ProtectedRoute>
              <NewsArticlePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
