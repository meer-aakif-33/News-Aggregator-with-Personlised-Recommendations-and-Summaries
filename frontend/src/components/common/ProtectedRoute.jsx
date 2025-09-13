import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");
  const hasPreferences = localStorage.getItem(`hasPreferences_${userId}`);
  const location = useLocation();

  if (!token) {
    // not logged in → go to login
    return <Navigate to="/" replace />;
  }

  if (location.pathname === "/preferences" && hasPreferences === "true") {
    // 🚫 already has preferences → block access to /preferences
    return <Navigate to="/mainNews" replace />;
  }

  return children;
}
