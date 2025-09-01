// components/pages/LoginSignupPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function LoginSignupPage({ setIsAuthenticated }) {
  console.log("setIsAuthenticated type:", typeof setIsAuthenticated);

  const navigate = useNavigate();
  const [isSignupMode, setIsSignupMode] = useState(true);
  const [name, setName] = useState(localStorage.getItem("userName") || ""); // Persist name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch name from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setName(storedName);  
    }
  }, []);

const handleSignup = async (event) => {
  event.preventDefault();

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  setIsLoading(true); // ✅ start loading
  try {
    const response = await fetch("https://news-aggregator-with-personlised-qq5i.onrender.com/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, preferences: [] }),
    });

    const contentType = response.headers.get("content-type") || "";
    let data = {};
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      console.error("Server returned non-JSON response:", await response.text());
      return;
    }

    if (!response.ok) {
      alert(data.error || "Signup failed");
      console.error("Signup failed:", data.error || data);
      return;
    }

    // Save token and user info
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userId", data.id);
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem(
      `preferences_${data.id}`,
      JSON.stringify(data.preferences || [])
    );

    if (typeof setIsAuthenticated === "function") {
      setIsAuthenticated(true);
      navigate("/preferences");
    }
  } catch (error) {
    console.error("Signup error:", error);
    alert("Something went wrong during signup");
  } finally {
    setIsLoading(false); // ✅ stop loading
  }
};

const handleLogin = async (event) => {
  event.preventDefault();
  setIsLoading(true); // ✅ start loading
  try {
    const response = await fetch("https://news-aggregator-with-personlised-qq5i.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error("Login failed: HTTP", response.status);
      return;
    }

    const data = await response.json();
    console.log("Server response:", data);

    if (!data.name || !data.email) {
      console.error("Missing user details in response:", data);
      return;
    }

    // Save to localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userId", data.id);
    localStorage.setItem("userEmail", data.email);
    localStorage.setItem(
      `preferences_${data.id}`,
      JSON.stringify(data.preferences || [])
    );

    if (data.preferences && data.preferences.length > 0) {
      localStorage.setItem(`hasPreferences_${data.id}`, "true");
    }
    // console.log("Current userId:", localStorage.getItem("userId"));
    // console.log("Current preferences:", localStorage.getItem(`preferences_${localStorage.getItem("userId")}`));
    // console.log("All localStorage keys:", Object.keys(localStorage));

    if (typeof setIsAuthenticated === "function") {
      setIsAuthenticated(true);
      if (data.preferences && data.preferences.length > 0) {
        navigate("/mainNews", { state: { selectedGenres: data.preferences } });
      }
    } else {
      console.error("setIsAuthenticated is not a function");
    }
  } catch (error) {
    console.error("Login error:", error);
  } finally {
    setIsLoading(false); // ✅ stop loading
  }
};
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-6 bg-gradient-to-br from-blue-100 via-pink-100 to-purple-200">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl">
        
        {/* Left Side */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-10 text-white">
          <div className="text-center max-w-md">
            <h2 className="text-4xl font-bold mb-4">Welcome!</h2>
            <p className="text-lg opacity-90">
              {isSignupMode
                ? "Create your account to explore personalized news & updates tailored just for you."
                : "Login to continue exploring your personalized feed and stay updated effortlessly."}
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 md:p-12">
          {isSignupMode ? (
            <form onSubmit={handleSignup} className="space-y-6">
              <h1 className="text-3xl font-bold text-center text-gray-700">Sign Up</h1>

              {/* Inputs */}
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 px-4 py-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-300 px-4 py-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 px-4 py-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />

              {/* Button with Spinner */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex justify-center items-center"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  "Sign Up"
                )}
              </button>

              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer font-medium hover:underline"
                  onClick={() => setIsSignupMode(false)}
                >
                  Sign In
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <h1 className="text-3xl font-bold text-center text-gray-700">Sign In</h1>

              {/* Login Inputs */}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 px-4 py-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 px-4 py-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />

              {/* Button with Spinner */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex justify-center items-center"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  "Login"
                )}
              </button>

              <p className="text-center text-gray-600">
                Don’t have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer font-medium hover:underline"
                  onClick={() => setIsSignupMode(true)}
                >
                  Sign Up
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

