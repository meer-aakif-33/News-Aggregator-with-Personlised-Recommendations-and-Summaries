  // components/pages/LoginSignupPage.jsx
  import React, { useState, useEffect } from "react";
  import { toast, ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";

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
      toast.error("All fields are required");
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
        toast.error(data.error || "Signup failed");
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
      localStorage.setItem(`welcomeShown_${data.id}`, "false");

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

      
      const data = await response.json();
      console.log("Server response:", data);
      
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("User does not exist");
          } else if (response.status === 401) {
            toast.error("Invalid password");
          } else {
            toast.error(data.error || "Login failed");
          }
          return;
        }

        if (!data.name || !data.email) {
          toast.error("User data missing in response. Please try again.");
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
      localStorage.setItem(`welcomeShown_${data.id}`, "false");

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
    <div className="flex items-center justify-center min-h-screen px-4 py-6 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="flex flex-col md:flex-row bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

        {/* Left Side - Branding / Info */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-12 text-white relative">
          <div className="text-center max-w-md animate-fade-in">
            <h2 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
              {isSignupMode ? "Join Us" : "Welcome Back"}
            </h2>
            <p className="text-lg opacity-90 leading-relaxed">
              {isSignupMode
                ? "Join us and unlock a world of news curated just for you. Stay informed, stay ahead."
                : "Welcome back! Continue exploring your personalized news feed and never miss an update."}
            </p>
          </div>
          <div className="absolute bottom-6 right-6 text-xs opacity-70">
            Stay Informed ✨
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-10 md:p-14">
          <form
            onSubmit={isSignupMode ? handleSignup : handleLogin}
            className="space-y-6 animate-fade-in"
          >
            <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
              {isSignupMode ? "Create Account" : "Sign In"}
            </h1>

            <div className="flex flex-col gap-4">
              {/* Full Name */}
              {isSignupMode && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 px-4 py-3 w-full rounded-lg shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              )}

              {/* Email */}
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 px-4 py-3 w-full rounded-lg shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 px-4 py-3 w-full rounded-lg shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600
                         text-white font-semibold rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98]
                         transition duration-300 flex justify-center items-center"
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
                isSignupMode ? "Sign Up" : "Login"
              )}
            </button>

            {/* Toggle Mode */}
            <p className="text-center text-gray-600">
              {isSignupMode
                ? "Already have an account?"
                : "Don’t have an account?"}{" "}
              <span
                className="text-indigo-600 cursor-pointer font-medium hover:underline"
                onClick={() => setIsSignupMode(!isSignupMode)}
              >
                {isSignupMode ? "Sign In" : "Sign Up"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>

    );
  }

