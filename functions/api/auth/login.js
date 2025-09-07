import jwt from 'jsonwebtoken';

export async function onRequestPost(context) {
  const { env, request } = context;
  const JWT_SECRET = env.JWT_SECRET || 'dev_secret_change_me';
  try {
    const { email, password } = await request.json();
    if (!email || !password) return json({ error: 'Missing credentials' }, 400);
    
    const normalizedEmail = String(email).toLowerCase();
    const user = await env.DB.prepare('SELECT id, name, email, password_hash, phone, socials FROM users WHERE email = ?')
      .bind(normalizedEmail)
      .first();
    
    if (!user) return json({ error: 'Invalid credentials' }, 401);
    
    const ok = await compare(password, user.password_hash);
    if (!ok) return json({ error: 'Invalid credentials' }, 401);
    
    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    const socials = user.socials ? JSON.parse(user.socials) : {};
    
    return json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone || '', 
        socials 
      } 
    });
  } catch (e) {
    console.error('Login error:', e);
    return json({ error: 'Failed to login' }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function compare(plain, hash) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(plain));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  return (`sha256:${hex}`) === hash;
}
