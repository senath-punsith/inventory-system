import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'ims_auth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setToken(parsed.token || '');
      setUser(parsed.user || null);
      setAuthToken(parsed.token || '');
    }
    setReady(true);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const payload = {
      token: response.data.token,
      user: response.data.user,
    };

    setToken(payload.token);
    setUser(payload.user);
    setAuthToken(payload.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Ignore network/API logout failures and clear client state anyway.
    }

    setToken('');
    setUser(null);
    setAuthToken('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ token, user, ready, isAuthenticated: Boolean(token), login, logout }),
    [token, user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
