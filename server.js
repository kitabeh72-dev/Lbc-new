const express = require('express');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 8080;

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Bot is running!' });
});

// Example repost route
app.post('/api/repost', async (req, res) => {
  const { url } = req.body;
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.leboncoin.fr');
    // TODO: Implement login and repost logic here
    await browser.close();
    res.json({ success: true, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
