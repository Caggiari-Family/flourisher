import { useState, useCallback } from 'react';
import { loginRequest } from '../infrastructure/api/auth.api';

const TOKEN_KEY = 'flourisher_token';

/**
 * Application-layer hook that manages JWT authentication state.
 * Persists the token to localStorage so sessions survive page reloads.
 */
export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (username, password) => {
    const { access_token } = await loginRequest(username, password);
    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return {
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };
}
