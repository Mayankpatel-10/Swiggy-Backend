import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('swiggy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('swiggy_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('swiggy_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error('Failed to fetch user context:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: authToken, user: userData } = res.data.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('swiggy_token', authToken);
      localStorage.setItem('swiggy_user', JSON.stringify(userData));
    }
    return res.data;
  };

  const register = async (name, email, password, role = 'customer', phone = '') => {
    const res = await API.post('/auth/register', { name, email, password, role, phone });
    if (res.data.success) {
      const { token: authToken, user: userData } = res.data.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('swiggy_token', authToken);
      localStorage.setItem('swiggy_user', JSON.stringify(userData));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('swiggy_token');
    localStorage.removeItem('swiggy_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
