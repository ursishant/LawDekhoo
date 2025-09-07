export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured: GEMINI_API_KEY missing' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    const payload = await request.json();
    const modelName = 'gemini-2.5-flash-preview-05-20';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || 'Gemini API error' }), { status: resp.status, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}


