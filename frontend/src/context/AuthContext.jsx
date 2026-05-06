import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { decodeJwt, isJwtExpired } from '../utils/jwt';

const TOKEN_KEY = 'ax_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (savedToken && !isJwtExpired(savedToken)) {
      setToken(savedToken);
      setUser(extractUserFromToken(savedToken));
    } else if (savedToken) {
      localStorage.removeItem(TOKEN_KEY);
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);

    const payload = response.data?.data || response.data;
    const newToken = payload?.token;

    if (!newToken) {
      throw new Error('No token received from server.');
    }

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(extractUserFromToken(newToken));

    return payload;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

function extractUserFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;

  return {
    id: payload.userId || payload.id || null,
    username: payload.sub || payload.username,
    role: payload.role || payload.roles?.[0] || 'VIEWER',
    fullName: payload.fullName || payload.name || null,
    email: payload.email || null,
  };
}
