import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem('gitinsight_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('gitinsight_token') || null);
  const [loading, setLoading] = useState(() => !localStorage.getItem('gitinsight_token'));

  // Verify session in background on initial load
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('gitinsight_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('gitinsight_user', JSON.stringify(response.data.user));
          setToken(storedToken);
        }
      } catch (error) {
        // Only invalidate if the server explicitly responded with 401 Unauthorized
        if (error.response?.status === 401) {
          console.warn('Session expired or invalid token:', error.customMessage);
          localStorage.removeItem('gitinsight_token');
          localStorage.removeItem('gitinsight_user');
          setUser(null);
          setToken(null);
        } else {
          console.warn('Could not reach server to verify token, preserving cached session:', error.customMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register action
  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('gitinsight_token', response.data.token);
      localStorage.setItem('gitinsight_user', JSON.stringify(response.data.user));
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  // Login action
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('gitinsight_token', response.data.token);
      localStorage.setItem('gitinsight_user', JSON.stringify(response.data.user));
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('gitinsight_token');
    localStorage.removeItem('gitinsight_user');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user || !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
