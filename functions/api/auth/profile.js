import jwt from 'jsonwebtoken-edge';

export async function onRequestPut(context) {
  return handleProfileUpdate(context);
}

export async function onRequestPost(context) {
  return handleProfileUpdate(context);
}

async function handleProfileUpdate(context) {
  const { env, request } = context;
  const JWT_SECRET = env.JWT_SECRET || 'dev_secret_change_me';
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return json({ error: 'Missing token' }, 401);
    
    const payload = jwt.verify(token, JWT_SECRET);
    const { name, phone, socials } = await request.json();
    
    // Build dynamic update query
    const updates = [];
    const binds = [];
    
    if (name) {
      updates.push('name = ?');
      binds.push(name);
    }
    if (typeof phone === 'string') {
      updates.push('phone = ?');
      binds.push(phone);
    }
    if (socials && typeof socials === 'object') {
      updates.push('socials = ?');
      binds.push(JSON.stringify(socials));
    }
    
    if (updates.length === 0) {
      return json({ error: 'No fields to update' }, 400);
    }
    
    binds.push(payload.sub);
    
    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...binds)
      .run();
    
    // Get updated user
    const user = await env.DB.prepare('SELECT id, name, email, phone, socials FROM users WHERE id = ?')
      .bind(payload.sub)
      .first();
    
    const userSocials = user.socials ? JSON.parse(user.socials) : {};
    
    return json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone || '', 
        socials: userSocials 
      } 
    });
  } catch (e) {
    console.error('Profile update error:', e);
    return json({ error: 'Invalid token' }, 401);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}