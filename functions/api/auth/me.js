import jwt from 'jsonwebtoken';

export async function onRequestGet(context) {
  const { env, request } = context;
  const JWT_SECRET = env.JWT_SECRET || 'dev_secret_change_me';
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return json({ error: 'Missing token' }, 401);
    
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await env.DB.prepare('SELECT id, name, email, phone, socials FROM users WHERE id = ?')
      .bind(payload.sub)
      .first();
    
    if (!user) return json({ error: 'User not found' }, 404);
    
    const socials = user.socials ? JSON.parse(user.socials) : {};
    
    return json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone || '', 
        socials 
      } 
    });
  } catch (e) {
    return json({ error: 'Invalid token' }, 401);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
