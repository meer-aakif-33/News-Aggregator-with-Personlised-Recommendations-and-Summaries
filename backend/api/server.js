import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import pg from "pg";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret"; 
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// PostgreSQL client
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render DB URL
  ssl: { rejectUnauthorized: false }         // Required on Render
});

// Root
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// News API route
app.get("/api/news", async (req, res) => {
  const query = req.query.q || "Science+Health+education";
  const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("News API error:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};
// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });
  
  try {
    // Check existing user
    const existing = await pool.query('SELECT * FROM "users-table" WHERE email = $1', [email]);
    console.log("Connecting to DB...");
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO "users-table" (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    console.log("Inserting user:", { name, email });

    
    const newUser = result.rows[0];
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });
    
    res.status(201).json({ token, name: newUser.name, email: newUser.email });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  
  try {
    const userRes = await pool.query('SELECT * FROM "users-table" WHERE email = $1', [email]);
    const user = userRes.rows[0];
    
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ token, name: user.name, email: user.email });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Scrape route (protected)
app.get("/scrape", authMiddleware, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL parameter is required." });

  try {
    const response = await axios.get(url);
    const { JSDOM } = await import("jsdom");
    const { Readability } = await import("@mozilla/readability");
    
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (article?.textContent) res.json({ content: article.textContent });
    else res.status(400).json({ error: "Unable to extract article content." });
  } catch (error) {
    console.error("Scrape error:", error);
    res.status(500).json({ error: "Failed to load article." });
  }
});

// Summarization Endpoint (No Authentication Required)
app.post("/summarize", async (req, res) => {
  const { text } = req.body;
  
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Valid text parameter is required." });
  }
  
  try {
    const pythonResponse = await axios.post(
      "http://localhost:5002/summarize",
      { text },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );    

    if (pythonResponse.data.summary) {
      res.json({ summary: pythonResponse.data.summary });
    } else {
      res.status(500).json({ error: "Failed to generate summary." });
    }
  } catch (error) {
    console.error("Error during summarization:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});

//NewsAPI Route
app.post("/get-recommendations", async (req, res) => {
  try {
    //console.log("🔍 Incoming Request Body:", JSON.stringify(req.body, null, 2));
    
    const { articles, title } = req.body;
    
    if (!articles || !title) {
      return res.status(400).json({ error: "Missing articles or title" });
    }
    
    //console.log("📤 Sending to Python API:", JSON.stringify({ articles, title }, null, 2));
    
    const response = await axios.post("http://localhost:5001/recommend", { articles, title });
    
    // console.log("✅ Response from Python API:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get recommendations", details: error.response?.data });
  }
  

});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// === "users-table" file helpers ===
// const read"users-table" = () => {
//   try {
//     const data = fs.readFileSync(""users-table".json", "utf8");
//     return data ? JSON.parse(data) : [];
//   } catch {
//     return [];
//   }
// };
// const write"users-table" = ("users-table") => {
//   fs.writeFileSync(""users-table".json", JSON.stringify("users-table", null, 2));
// };


// Signup
// app.post("/signup", (req, res) => {
//   const { name, email, password } = req.body;
//   let "users-table" = read"users-table"();

//   if (!name || !email || !password) {
//     return res.status(400).json({ error: "All fields are required" });
//   }
//   if ("users-table".find((u) => u.email === email)) {
//     return res.status(400).json({ error: "User already exists" });
//   }

//   const newUser = { id: "users-table".length + 1, name, email, password };
//   "users-table".push(newUser);
//   write"users-table"("users-table");

//   const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });
//   res.status(201).json({ token });
// });

// // Login
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;
//   let "users-table" = read"users-table"();

//   const user = "users-table".find((u) => u.email === email && u.password === password);
//   if (!user) {
//     return res.status(401).json({ error: "Invalid email or password" });
//   }

//   const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
//   res.json({ token, name: user.name, email: user.email });
// });

// 🚀 Export ONLY the app (no app.listen!)
//export default app;

// import express from "express";
// import axios from "axios";
// import cors from "cors";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken"; // Import JWT for token verification
// import fs from "fs"
// import serverless from "serverless-http";

// dotenv.config();

// const app = express();
// const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret"; 
// const NEWS_API_KEY = process.env.NEWS_API_KEY;
// app.use(cors());
// //console.log("JWT_SECRET:", JWT_SECRET);

// app.get("/", (req, res) => {
//   res.send("Backend is running ✅");
// });

// app.get("/api/news", async (req, res) => {
//   //const apiKey = "01b9aacf474d4fd789819e84da3a815b"; // Replace with your News API key
//   const query = req.query.q || "Science+Health+education"; // default if nothing passed

//   const url = query
//     ? `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`
//     : `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

//   try {
//     const response = await axios.get(url);
//     const data = response.data; 
//     res.json(data);
//   } catch (error) {
//     console.error("News API error:", error);
//     res.status(500).json({ error: "Failed to fetch news" });
//   }
// });


// app.use(express.json());
// // Function to read "users-table" from file
// const read"users-table" = () => {
//   try {
//     const data = fs.readFileSync(""users-table".json", "utf8");
//     return data ? JSON.parse(data) : [];
//   } catch (error) {
//     console.error("Error reading "users-table".json:", error);
//     return []; // Ensure an empty array is returned if file is missing/corrupt
//   }
// };


// // Function to write "users-table" to file
// const write"users-table" = ("users-table") => {
//   try {
//     fs.writeFileSync(""users-table".json", JSON.stringify("users-table", null, 2));
//     console.log("Updated "users-table".json successfully");
//   } catch (error) {
//     console.error("Error writing to "users-table".json:", error);
//   }
// };

// app.post("/signup", (req, res) => {
//   //console.log("Received data:", req.body);

//   try {
//     const { name, email, password } = req.body;
//     let "users-table" = read"users-table"();

//     // console.log("Current "users-table" in File:", "users-table");

//     if (!name || !email || !password) {
//       console.log("Validation Failed: Missing fields");
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const existingUser = "users-table".find((u) => u.email === email);
//     if (existingUser) {
//       console.log("User already exists:", existingUser);
//       return res.status(400).json({ error: "User already exists" });
//     }

//     const newUser = {
//       id: "users-table".length + 1,
//       name,
//       email,
//       password, // In production, hash the password before storing
//     };

//     "users-table".push(newUser);
//     write"users-table"("users-table");

//     console.log("New user added:", newUser);
//     // console.log(""users-table" after adding new user:", "users-table");

//     const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });

//     res.status(201).json({ token });
//   } catch (error) {
//     console.error("Signup Error:", error.message);
//     res.status(500).json({ error: "Internal Server Error", details: error.message });
//   }
// });


// app.post("/login", (req, res) => {
//   //console.log("Login request received:", req.body);

//   try {
//     const { email, password } = req.body;
//     let "users-table" = read"users-table"();

//     const user = "users-table".find((u) => u.email === email && u.password === password);
//     if (!user) {
//       console.log("Invalid credentials");
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     console.log("User found:", user);

//     const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

//     res.status(200).json({ 
//       token,
//       name: user.name,
//       email: user.email });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Authentication Middleware
// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader) {
//     return res.status(401).json({ error: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1]; // Extract token

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ error: "Invalid token" });
//     }
//     req.user = decoded; // Attach user info to request
//     next();
//   });
// };


// // Secure Scrape Endpoint (Requires Authentication)
// app.get("/scrape", authMiddleware, async (req, res) => {
//   const { url } = req.query;

//   if (!url) {
//     return res.status(400).json({ error: "URL parameter is required." });
//   }

//   try {
//     const response = await axios.get(url);
//     const html = response.data;
//     // console.log("DEBUG: Raw HTML response:", html.slice(0, 500)); // Print first 500 characters

//     const { JSDOM } = await import("jsdom");
//     const dom = new JSDOM(html, { url });
//     const document = dom.window.document;

//     const { Readability } = await import("@mozilla/readability");
//     const reader = new Readability(document);
//     const articleContent = reader.parse();

//     if (articleContent?.textContent) {
//       res.json({ content: articleContent.textContent });
//     } else {
//       res.status(400).json({ error: "Unable to extract article content." });
//     }
//   } catch (error) {
//     console.error("Error fetching or parsing the article:", error);
//     res.status(500).json({ error: "Failed to load the full article content." });
//   }
// });



// // Local dev only 
// if (process.env.NODE_ENV !== "production") {
//     app.listen(PORT, () => {
//         console.log(`Server running at http://localhost:${PORT}`);
//     });
// }

// // Local dev only
// // if (process.env.NODE_ENV !== "production") {
// //     app.listen(PORT, () => {
// //         console.log(`Server running at http://localhost:${PORT}`);
// //     });
// // }

// // Export Express app wrapped for Vercel serverless
// module.exports = app; // no app.listen()
