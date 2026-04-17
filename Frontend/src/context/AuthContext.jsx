import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'pm_token';
const USER_KEY = 'pm_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) setAuthToken(t);
    setBootstrapping(false);
  }, []);

  const persistSession = useCallback((nextUser, nextToken) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      setAuthToken(nextToken);
      setTokenState(nextToken);
    }
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setLoading(false);
      return;
    }
    const stored = readStoredUser();
    const id = stored?._id;
    if (!id) {
      clearSession();
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setAuthToken(t);
      const { data } = await api.get(`/users/${id}`);
      if (data.success && data.data?.user) {
        persistSession(data.data.user, t);
      }
    } catch {
      clearSession();
      toast.error('Session expired. Please sign in again.');
    } finally {
      setLoading(false);
    }
  }, [persistSession, clearSession]);

  useEffect(() => {
    if (bootstrapping) return;
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [bootstrapping, token, fetchProfile]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post('/auth/login', { email, password });
      if (!data.success) throw new Error(data.message || 'Login failed');
      const { user: u, token: t } = data.data;
      persistSession(u, t);
      toast.success(data.message || 'Welcome back');
      return u;
    },
    [persistSession]
  );

  const register = useCallback(
    async (name, email, password) => {
      const { data } = await api.post('/auth/register', { name, email, password });
      if (!data.success) throw new Error(data.message || 'Registration failed');
      const { user: u, token: t } = data.data;
      persistSession(u, t);
      toast.success(data.message || 'Account created');
      return u;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    clearSession();
    toast.success('Signed out');
  }, [clearSession]);

  const updateLocalUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      fetchProfile,
      updateLocalUser,
    }),
    [user, token, loading, login, register, logout, fetchProfile, updateLocalUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
