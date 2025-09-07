import jwt from 'jsonwebtoken-edge';

export async function onRequestPost(context) {
  const { env, request } = context;
  const JWT_SECRET = env.JWT_SECRET || 'dev_secret_change_me';
  try {
    const { org } = await request.json();
    if (!org || !org.name) return json({ error: 'org is required' }, 400);
    
    let userId = null;
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        userId = payload.sub;
      } catch (_) {}
    }
    
    await env.DB.prepare('INSERT INTO legal_aid_views (user_id, org_name, org_city, org_address, org_phone, org_services, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(
        userId,
        org.name,
        org.city || '',
        org.address || '',
        org.phone || '',
        org.services || '',
        new Date().toISOString()
      )
      .run();
    
    return json({ ok: true });
  } catch (e) {
    console.error('Legal aid view error:', e);
    return json({ error: 'Failed to save view' }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}