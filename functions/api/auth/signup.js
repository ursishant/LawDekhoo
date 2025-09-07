import jwt from 'jsonwebtoken-edge';

export async function onRequestPost(context) {
  const { env, request } = context;
  const JWT_SECRET = env.JWT_SECRET || 'dev_secret_change_me';
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) return json({ error: 'Name, email and password are required' }, 400);
    const normalizedEmail = String(email).toLowerCase();
    
    // Check if user exists
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(normalizedEmail).first();
    if (existing) return json({ error: 'Account already exists with this email' }, 409);
    
    // Hash password
    const passwordHash = await hash(password);
    
    // Insert user
    const result = await env.DB.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .bind(name, normalizedEmail, passwordHash)
      .run();
    
    const userId = result.meta.last_row_id;
    const token = jwt.sign({ sub: userId, email: normalizedEmail, name }, JWT_SECRET, { expiresIn: '7d' });
    
    return json({ token, user: { id: userId, name, email: normalizedEmail, phone: '', socials: {} } }, 201);
  } catch (e) {
    console.error('Signup error:', e);
    return json({ error: 'Failed to create account' }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function hash(plain) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(plain));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256:${hex}`;
}