// Browser API client for the Cloudflare Worker backend.
// All shoe CRUD goes through our Worker (which talks to D1) — no D1 token
// ever reaches the browser. Same exported names as the old d1.js so call
// sites only change their import path.

const BASE = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function listShoes() {
  return request("/shoes");
}

export async function getShoe(id) {
  return request(`/shoes/${encodeURIComponent(id)}`);
}

export async function insertShoe(shoe) {
  const data = await request("/shoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(shoe),
  });
  return data.id;
}

export async function updateShoe(id, fields) {
  await request(`/shoes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
}

export async function deleteShoes(ids) {
  if (!ids || ids.length === 0) return;
  await request("/shoes", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}
