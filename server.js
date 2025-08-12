// server.js — minimal, no Puppeteer
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// serve the /public folder (so / shows public/index.html)
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Bot is running!" });
});

// IMPORTANT: listen on Render's port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
