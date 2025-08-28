const express = require("express");
const app = express();

app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("Backend running on Vercel 🚀");
});

// ⚠️ DO NOT use app.listen() here

// Export for Vercel serverless
module.exports = app;
