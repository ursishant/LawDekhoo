// A simple backend proxy server to securely handle API requests.

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio'); // Import cheerio for web scraping
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Endpoint for the AI chat
app.post('/api/chat', async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY") {
      return res.status(500).json({ error: 'API key not configured on the server. Please check your .env file.' });
    }
    const payload = req.body;
    const modelName = 'gemini-2.5-flash-preview-05-20';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await apiResponse.json();
    if (!apiResponse.ok) {
        console.error('Gemini API Error:', data);
        return res.status(apiResponse.status).json({ error: `Gemini API error: ${data.error.message}` });
    }
    res.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// --- NEW: Endpoint for scraping judgment details from a URL ---
app.post('/api/scrape', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL with status: ${response.status}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract text from the body, removing script and style content
        $('script, style').remove();
        const textContent = $('body').text().replace(/\s\s+/g, ' ').trim();
        
        res.json({ text: textContent });

    } catch (error) {
        console.error('Scraping Error:', error);
        res.status(500).json({ error: `Failed to scrape the provided URL. ${error.message}` });
    }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running securely on http://localhost:${PORT}`);
});
