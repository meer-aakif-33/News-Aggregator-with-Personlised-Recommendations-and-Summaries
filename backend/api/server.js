import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sql from './db.js';


dotenv.config();
//console.log("DATABASE_URL",process.env.DATABASE_URL)

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret"; 
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// Root
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});


async function warmUpPythonAPI() {
  const url = "https://news-aggregator-with-personlised-g3ky.onrender.com";
  let attempts = 0;

  while (true) {
    attempts++;
    try {
      const res = await axios.get(url, { timeout: 8000 }); // 5s timeout
      console.log(`🔥 Python API is awake after ${attempts} attempt(s). Status: ${res.status}`);
      break; // exit loop once successful
    } catch (err) {
      console.log(`⏳ Python API not ready yet (attempt ${attempts})...`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s before retry
    }
  }
}

// Call once when Node starts
warmUpPythonAPI();

// Optionally, ping every 10 minutes
//setInterval(warmUpPythonAPI, 10 * 60 * 1000);

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
app.get("/api/news", authMiddleware, async (req, res) => {
  console.log("---- /api/news called ----");
  
  let query = req.query.q;
  console.log("Incoming query param:", query);

  try {
    // If no query from frontend, try user preferences
    if (!query && req.user) {
      console.log("No query param, checking user preferences for user:", req.user.id);
      const user = await sql`SELECT preferences FROM "users-table" WHERE id = ${req.user.id}`;
      console.log("DB result:", user);

      if (user.length > 0 && user[0].preferences) {
        try {
          query = JSON.parse(user[0].preferences).join("+");
          console.log("Query from user preferences:", query);
        } catch (e) {
          console.error("Error parsing preferences from DB:", e);
        }
      } else {
        console.log("No preferences found for user, using default query");
      }
    }

    // Fallback query
    if (!query) query = "Science+Health+education";
    console.log("Final query to use:", query);

    // Check API key
    if (!NEWS_API_KEY) {
      console.error("NEWS_API_KEY is missing! Cannot call NewsAPI.");
      return res.status(500).json({ error: "News API key not configured" });
    } else {
      console.log("NEWS_API_KEY loaded ✅");
    }

    // Build NewsAPI URL
    const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`;
    console.log("Calling NewsAPI with URL:", url);

    // Call NewsAPI
    const response = await axios.get(url);
    console.log("NewsAPI response status:", response.status);
    console.log("Number of articles received:", response.data?.articles?.length);

    res.json(response.data);

  } catch (error) {
    console.error("Error in /api/news route:", error);
    if (error.response) {
      console.error("NewsAPI response error:", error.response.data);
    }
    res.status(500).json({ error: "Failed to fetch news" });
  }
});
// ✅ Get user preferences using postgres.js
app.get("/api/get-preferences", async (req, res) => {
  const { userId } = req.query; // Pass userId as query param
  
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  
  try {
    const users = await sql`
    SELECT preferences FROM "users-table" WHERE id = ${userId}
    `;
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Make sure preferences is always an array
    let prefs = [];
    if (user.preferences) {
      try {
        prefs = Array.isArray(user.preferences)
        ? user.preferences
        : JSON.parse(user.preferences);
      } catch {
        prefs = [];
      }
    }
    
    res.json({ preferences: prefs });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Server error while fetching preferences" });
  }
});

// Trending News API route
app.get("/api/trending-news", async (req, res) => {
  // You can adjust country or category as needed
  const country = req.query.country || "us"; // default to US
  const pageSize = req.query.limit || 30;   // number of articles to return
  
  const url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await axios.get(url);
    res.json(response.data); // send the full response including "articles"
  } catch (error) {
    console.error("Trending News API error:", error.message);
    res.status(500).json({ error: "Failed to fetch trending news" });
  }
});


// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  const { name, email, password, preferences } = req.body;
  
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });
  
  try {
    // Check existing user
    const existing = await sql`
    SELECT * FROM "users-table" WHERE email = ${email}
    `;
    if (existing.length > 0)
      return res.status(400).json({ error: "User already exists" });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user with preferences
    const result = await sql`
    INSERT INTO "users-table" (name, email, password)
    VALUES (${name}, ${email}, ${hashedPassword})
    RETURNING id, name, email, preferences;
    `;
    
    const newUser = result[0];
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    res.status(201).json({
      token,
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      preferences: newUser.preferences
    });
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
    const users = await sql`
    SELECT * FROM "users-table" WHERE email = ${email}
    `;
    const user = users[0];
    
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid email or password" });
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    res.json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      preferences: user.preferences // 👈 return saved preferences
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/update-preferences", async (req, res) => {
  const { preferences } = req.body;
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });
  
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    await sql`
    UPDATE "users-table"
    SET preferences = ${JSON.stringify(preferences)}
    WHERE id = ${decoded.id}
    `;
    
    res.json({ success: true, preferences });
  } catch (error) {
    console.error("Update Preferences Error:", error);
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
  console.log("Node /summarize req.body:", req.body);
  const { text } = req.body;
  
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Valid text parameter is required." });
  }
  
  try {
    const pythonResponse = await axios.post(
      "https://news-aggregator-with-personlised-g3ky.onrender.com",
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
    
    const response = await axios.post("https://news-aggregator-with-personlised-g3ky.onrender.com/recommend", { articles, title });
    
    // console.log("✅ Response from Python API:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get recommendations", details: error.response?.data });
  }
  

});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
