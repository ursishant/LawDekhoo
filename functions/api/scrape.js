export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { url } = await request.json();
    if (!url) return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400, headers: { 'content-type': 'application/json' } });
    const resp = await fetch(url);
    if (!resp.ok) return new Response(JSON.stringify({ error: `Failed to fetch URL (${resp.status})` }), { status: 500, headers: { 'content-type': 'application/json' } });
    let html = await resp.text();
    // simple strip scripts/styles on edge
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim();
    return new Response(JSON.stringify({ text }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to scrape' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}


