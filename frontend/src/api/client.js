const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Single place that talks to our backend: sends the wishlist cookie, supports cancellation,
// and turns every failure into an ApiError with a friendly message.
export async function api(path, { method = 'GET', params, body, signal } = {}) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection.');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code || 'ERROR', data?.error?.message || 'Something went wrong');
  }
  return data;
}
