const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || res.statusText);
  }
  return res.json();
}

export const api = {
  feed: () => request('/feed'),
  matches: () => request('/matches'),
  swipe: (profileId, action) =>
    request('/swipe', { method: 'POST', body: JSON.stringify({ profileId, action }) }),
  reset: () => request('/reset', { method: 'POST' }),
};
