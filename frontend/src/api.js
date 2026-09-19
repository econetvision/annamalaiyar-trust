// In local dev this stays "/api" and goes through the Vite proxy (vite.config.js)
// to the local Flask server. In production, set VITE_API_BASE_URL to the
// deployed backend's URL (e.g. https://<railway-app>.up.railway.app/api).
const BASE = import.meta.env.VITE_API_BASE_URL || "/api";
// Origin to resolve backend-hosted paths (like /api/uploads/...) against.
// "/assets/..." paths are frontend-hosted (bundled with this app) and are
// left alone. Derived from BASE so local dev (relative "/api") is unaffected.
const API_ORIGIN = BASE.replace(/\/api\/?$/, "");

export function resolveImageUrl(url) {
  if (!url) return url;
  return url.startsWith("/api/") ? `${API_ORIGIN}${url}` : url;
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  services: () => fetch(`${BASE}/services`).then(handle),
  products: () => fetch(`${BASE}/products`).then(handle),
  advertisements: () => fetch(`${BASE}/advertisements`).then(handle),
  expo: () => fetch(`${BASE}/expo`).then(handle),
  legacy: () => fetch(`${BASE}/legacy`).then(handle),
  register: (payload) =>
    fetch(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),
  status: (agentCode) => fetch(`${BASE}/status/${encodeURIComponent(agentCode)}`).then(handle),
  adminVerify: (agentCode, adminKey) =>
    fetch(`${BASE}/admin/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
      body: JSON.stringify({ agent_code: agentCode }),
    }).then(handle),
  adminSubscribers: (adminKey, { page = 1, perPage = 50, search = "" } = {}) => {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (search) params.set("search", search);
    return fetch(`${BASE}/admin/subscribers?${params}`, { headers: { "X-Admin-Key": adminKey } }).then(handle);
  },
  adminCreateProduct: (formData, adminKey) =>
    fetch(`${BASE}/admin/products`, {
      method: "POST",
      headers: { "X-Admin-Key": adminKey },
      body: formData,
    }).then(handle),
  adminDeleteProduct: (id, adminKey) =>
    fetch(`${BASE}/admin/products/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Key": adminKey },
    }).then(handle),
  adminCreateAdvertisement: (formData, adminKey) =>
    fetch(`${BASE}/admin/advertisements`, {
      method: "POST",
      headers: { "X-Admin-Key": adminKey },
      body: formData,
    }).then(handle),
  adminDeleteAdvertisement: (id, adminKey) =>
    fetch(`${BASE}/admin/advertisements/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Key": adminKey },
    }).then(handle),
};
