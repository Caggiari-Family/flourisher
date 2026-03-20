const BASE = '/api';

/**
 * Creates an HTTP client that attaches a JWT Bearer token to every request.
 * On 401 it clears the stored token and reloads the page to force re-login.
 *
 * @param {string} token  JWT access token
 */
export function createApiClient(token) {
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  async function request(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      localStorage.removeItem('flourisher_token');
      window.location.reload();
      return;
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(`API ${method} ${path} → ${res.status}: ${errorBody}`);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
  };
}
