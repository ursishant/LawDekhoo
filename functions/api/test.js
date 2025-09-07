export async function onRequestGet() {
  return new Response(JSON.stringify({ message: 'Cloudflare Pages Functions working!' }), {
    headers: { 'content-type': 'application/json' }
  });
}

export async function onRequestPost() {
  return new Response(JSON.stringify({ message: 'POST to /api/test works!' }), {
    headers: { 'content-type': 'application/json' }
  });
}
