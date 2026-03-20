const BASE = '/api';

/**
 * Authenticates against the backend and returns a JWT access token.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ access_token: string }>}
 */
export async function loginRequest(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('Invalid credentials');
  }

  return res.json();
}
