// A simple backend proxy server to securely handle API requests.

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.disable('x-powered-by');
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);
app.use(express.json({ limit: '50mb' }));

// --- Simple JSON file DB ---
const dbDir = path.join(__dirname, 'data');
const dbFile = path.join(dbDir, 'users.json');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ users: [], nextId: 1 }, null, 2));
function readUsers() {
  const raw = fs.readFileSync(dbFile, 'utf8');
  return JSON.parse(raw);
}
function writeUsers(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

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

        $('script, style').remove();
        const textContent = $('body').text().replace(/\s\s+/g, ' ').trim();
        
        res.json({ text: textContent });

    } catch (error) {
        console.error('Scraping Error:', error);
        res.status(500).json({ error: `Failed to scrape the provided URL. ${error.message}` });
    }
});

// --- Legal Aid interaction storage ---
// Save when user views details of a legal aid org
app.post('/api/legalaid/view', (req, res) => {
  try {
    const { org } = req.body; // { name, city, address, phone, services }
    if (!org || !org.name) return res.status(400).json({ error: 'org is required' });
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    let userId = null;
    if (token) {
      try { const p = jwt.verify(token, JWT_SECRET); userId = p.sub; } catch (_) {}
    }
    const legalDir = path.join(__dirname, 'data');
    const legalFile = path.join(legalDir, 'legal_aid_views.json');
    if (!fs.existsSync(legalFile)) fs.writeFileSync(legalFile, JSON.stringify({ views: [] }, null, 2));
    const raw = fs.readFileSync(legalFile, 'utf8');
    const data = JSON.parse(raw);
    data.views.push({ userId, org, timestamp: new Date().toISOString() });
    fs.writeFileSync(legalFile, JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch (e) {
    console.error('LegalAid view error:', e);
    res.status(500).json({ error: 'Failed to save view' });
  }
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    const normalizedEmail = String(email).toLowerCase();
    const data = readUsers();
    const exists = data.users.find(u => u.email === normalizedEmail);
    if (exists) {
      return res.status(409).json({ error: 'Account already exists with this email.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: data.nextId++, name, email: normalizedEmail, passwordHash };
    data.users.push(newUser);
    writeUsers(data);
    const token = generateToken({ sub: newUser.id, email: newUser.email, name: newUser.name });
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = String(email).toLowerCase();
    const data = readUsers();
    const user = data.users.find(u => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = generateToken({ sub: user.id, email: user.email, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// Example protected route
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Pull latest data from store
    const store = readUsers();
    const u = store.users.find(x => x.id === payload.sub);
    const user = u ? { id: u.id, name: u.name, email: u.email, phone: u.phone || '', socials: u.socials || {} } : { id: payload.sub, name: payload.name, email: payload.email };
    res.json({ user });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Update profile (name, phone, socials)
app.put('/api/auth/profile', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  let payload;
  try { payload = jwt.verify(token, JWT_SECRET); } catch (_) { return res.status(401).json({ error: 'Invalid token' }); }

  const { name, phone, socials } = req.body;
  const data = readUsers();
  const idx = data.users.findIndex(u => u.id === payload.sub);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (name) data.users[idx].name = name;
  if (typeof phone === 'string') data.users[idx].phone = phone;
  if (socials && typeof socials === 'object') data.users[idx].socials = socials;
  writeUsers(data);
  const user = { id: data.users[idx].id, name: data.users[idx].name, email: data.users[idx].email, phone: data.users[idx].phone || '', socials: data.users[idx].socials || {} };
  res.json({ user });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running securely on http://localhost:${PORT}`);
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
