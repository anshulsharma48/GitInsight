import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gitinsight_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify and fetch current user profile on initial load
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
          setToken(storedToken);
        }
      } catch (error) {
        console.warn('Session expired or invalid token:', error.customMessage);
        localStorage.removeItem('gitinsight_token');
        setUser(null);
        setToken(null);
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
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('gitinsight_token');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
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
