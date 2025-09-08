// backend/index.js

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

// --- Middlewares ---
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.disable('x-powered-by');
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.options('*', cors());

// --- Simple JSON file DB (⚠ ephemeral on Vercel) ---
const dbDir = path.join(process.env.NODE_ENV === 'production' ? '/tmp' : __dirname, 'data');
const dbFile = path.join(dbDir, 'users.json');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
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

// --- Routes ---
// AI Chat
app.post('/api/chat', async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in .env' });
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
      return res.status(apiResponse.status).json({ error: data.error?.message || 'Gemini API error' });
    }
    res.json(data);
  } catch (err) {
    console.error('Chat Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scraper
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed with status ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    $('script, style').remove();
    const textContent = $('body').text().replace(/\s\s+/g, ' ').trim();

    res.json({ text: textContent });
  } catch (err) {
    console.error('Scraping Error:', err);
    res.status(500).json({ error: `Failed to scrape. ${err.message}` });
  }
});

// Legal Aid Views
app.post('/api/legalaid/view', (req, res) => {
  try {
    const { org } = req.body;
    if (!org || !org.name) return res.status(400).json({ error: 'org is required' });

    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    let userId = null;
    if (token) {
      try {
        const p = jwt.verify(token, JWT_SECRET);
        userId = p.sub;
      } catch (_) {}
    }

    const legalFile = path.join(dbDir, 'legal_aid_views.json');
    if (!fs.existsSync(legalFile)) fs.writeFileSync(legalFile, JSON.stringify({ views: [] }, null, 2));
    const raw = fs.readFileSync(legalFile, 'utf8');
    const data = JSON.parse(raw);
    data.views.push({ userId, org, timestamp: new Date().toISOString() });
    fs.writeFileSync(legalFile, JSON.stringify(data, null, 2));

    res.json({ ok: true });
  } catch (err) {
    console.error('LegalAid Error:', err);
    res.status(500).json({ error: 'Failed to save view' });
  }
});

// Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const normalizedEmail = String(email).toLowerCase();
    const data = readUsers();
    if (data.users.find(u => u.email === normalizedEmail)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: data.nextId++, name, email: normalizedEmail, passwordHash };
    data.users.push(newUser);
    writeUsers(data);

    const token = generateToken({ sub: newUser.id, email: newUser.email, name: newUser.name });
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const normalizedEmail = String(email).toLowerCase();
    const data = readUsers();
    const user = data.users.find(u => u.email === normalizedEmail);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken({ sub: user.id, email: user.email, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Auth: Me
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const store = readUsers();
    const u = store.users.find(x => x.id === payload.sub);
    const user = u
      ? { id: u.id, name: u.name, email: u.email, phone: u.phone || '', socials: u.socials || {} }
      : { id: payload.sub, name: payload.name, email: payload.email };
    res.json({ user });
  } catch (_) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Auth: Profile Update
app.put('/api/auth/profile', handleProfileUpdate);
app.post('/api/auth/profile', handleProfileUpdate);

function handleProfileUpdate(req, res) {
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

  const user = {
    id: data.users[idx].id,
    name: data.users[idx].name,
    email: data.users[idx].email,
    phone: data.users[idx].phone || '',
    socials: data.users[idx].socials || {}
  };
  res.json({ user });
}

// --- Local vs Vercel ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running locally at http://localhost:${PORT}`);
  });
}

module.exports = app; // Needed for Vercel
