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
      console.error("All fields are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5003/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("User already exists, please try different credentials ");
        console.error("Signup failed:", data.message || "Unknown error");
        return;
      }

      console.log("Server response:", data); // Debugging line

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userName", name); // Store name
      localStorage.setItem("userEmail", email); // Store email

      if (typeof setIsAuthenticated === "function") {
        setIsAuthenticated(true);
        navigate("/preferences");
      } else {
        console.error("setIsAuthenticated is not a function");
      }
    } catch (error) {
      alert("User already exists");
      console.error("Signup error:", error);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5003/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error("Login failed: HTTP", response.status);
        return;
      }

      // Ensure response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Server did not return JSON. Check server logs.");
        return;
      }

      const data = await response.json(); // Parse JSON response
      console.log("Server response:", data); // Debugging line

      // Ensure `name` and `email` exist in response
      if (!data.name || !data.email) {
        console.error("Missing user details in response:", data);
        return;
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userName", data.name); // Store name from server
      localStorage.setItem("userEmail", data.email); // Store email from server

      setName(data.name); // Update state with name from server
      setEmail(data.email);

      if (typeof setIsAuthenticated === "function") {
        setIsAuthenticated(true);
        navigate("/preferences");
      } else {
        console.error("setIsAuthenticated is not a function");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{
        background: "linear-gradient(135deg,rgb(165, 176, 189),rgb(247, 188, 209))",
      }}
    >
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-2xl">
        {isSignupMode ? (
          <form onSubmit={handleSignup}>
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Sign Up</h1>

            {/* Row-wise Inputs */}
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-3 w-full md:w-[48%] rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 w-full md:w-[48%] rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white text-lg w-full py-3 mt-6 rounded-lg hover:bg-blue-600 transition"
            >
              Sign Up
            </button>

            <p className="text-center mt-4 text-gray-600">
              Already have an account?{" "}
              <span className="text-blue-500 cursor-pointer font-medium" onClick={() => setIsSignupMode(false)}>
                Sign In
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Sign In</h1>

            {/* Login Inputs */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-3 w-full mt-4 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="bg-blue-500 text-white text-lg w-full py-3 mt-6 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>

            <p className="text-center mt-4 text-gray-600">
              Don't have an account?{" "}
              <span className="text-blue-500 cursor-pointer font-medium" onClick={() => setIsSignupMode(true)}>
                Sign Up
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// // components/pages/LoginSignupPage.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function LoginSignupPage({ setIsAuthenticated }) {
//   console.log("setIsAuthenticated type:", typeof setIsAuthenticated);
//   const navigate = useNavigate();
//   const [isSignupMode, setIsSignupMode] = useState(true);
//   const [name, setName] = useState(localStorage.getItem("userName") || ""); // Persist name
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignup = async (event) => {
//     event.preventDefault();
  
//     if (!name || !email || !password) {
//       console.error("All fields are required");
//       return;
//     }
  
//     try {
//       const response = await fetch("http://localhost:5003/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password }),
//       });
  
//       const data = await response.json();
  
//       if (!response.ok) {
//         console.error("Signup failed:", data.message || "Unknown error");
//         return;
//       }
  
//       console.log("Server response:", data);  // Debugging line
  
//       localStorage.setItem("authToken", data.token);
//       localStorage.setItem("userName", name);   // Store name
//       localStorage.setItem("userEmail", email); // Store email
//       if (typeof setIsAuthenticated === "function") {
//         setIsAuthenticated(true);
//         navigate("/mainNews");
//       } else {
//         console.error("setIsAuthenticated is not a function");
//       }
//     } catch (error) {
//       console.error("Signup error:", error);
//     }
//   };
  
//   const handleLogin = async (event) => {
//     event.preventDefault();
//     try {
//       const response = await fetch("http://localhost:5003/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
  
//       if (!response.ok) {
//         console.error("Login failed: HTTP", response.status);
//         return;
//       }
  
//       // Check if response is JSON
//       const contentType = response.headers.get("content-type");
//       if (!contentType || !contentType.includes("application/json")) {
//         console.error("Server did not return JSON. Check server logs.");
//         return;
//       }
  
//       const data = await response.json(); // Now safely parse JSON
  
//       console.log("Server response:", data); // Debugging line
  
//       localStorage.setItem("authToken", data.token);
//       localStorage.setItem("userName", data.name);   // Store name from server
//       localStorage.setItem("userEmail", data.email); // Store email from server


//       setName(data.name); // Update state

//       if (typeof setIsAuthenticated === "function") {
//         setIsAuthenticated(true);
//         navigate("/mainNews");
//       } else {
//         console.error("setIsAuthenticated is not a function");
//       }
//       navigate("/mainNews");
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };
//     return (
//       <div
//         className="flex items-center justify-center min-h-screen px-4"
//         style={{
//           background: "linear-gradient(135deg,rgb(165, 176, 189),rgb(247, 188, 209))",
//         }}
//       >
//         <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-2xl">
//           {isSignupMode ? (
//             <form onSubmit={handleSignup}>
//               <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Sign Up</h1>
  
//               {/* Row-wise Inputs */}
//               <div className="flex flex-wrap gap-4">
//                 <input
//                   type="text"
//                   placeholder="Full Name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="border p-3 w-full md:w-[48%] rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//                 />
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="border p-3 w-full md:w-[48%] rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200"
//                 />
//                 <input
//                   type="password"
//                   placeholder="Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="border p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//                 />
//               </div>
  
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white text-lg w-full py-3 mt-6 rounded-lg hover:bg-blue-600 transition"
//               >
//                 Sign Up
//               </button>
  
//               <p className="text-center mt-4 text-gray-600">
//                 Already have an account?{" "}
//                 <span className="text-blue-500 cursor-pointer font-medium" onClick={() => setIsSignupMode(false)}>
//                   Sign In
//                 </span>
//               </p>
//             </form>
//           ) : (
//             <form onSubmit={handleLogin}>
//               <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Sign In</h1>
  
//               {/* Login Inputs */}
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="border p-3 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="border p-3 w-full mt-4 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
//               />
  
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white text-lg w-full py-3 mt-6 rounded-lg hover:bg-blue-600 transition"
//               >
//                 Login
//               </button>
  
//               <p className="text-center mt-4 text-gray-600">
//                 Don't have an account?{" "}
//                 <span className="text-blue-500 cursor-pointer font-medium" onClick={() => setIsSignupMode(true)}>
//                   Sign Up
//                 </span>
//               </p>
//             </form>
//           )}
//         </div>
//       </div>
//     );
//   }
  