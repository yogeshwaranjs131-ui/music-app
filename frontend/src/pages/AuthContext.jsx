import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Token-ஐ API Headers-ல் சேர்க்கிறோம்
        api.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await api.get('/api/auth/user');
          setUser(res.data);
        } catch (err) {
          console.error("Auth check failed", err);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['x-auth-token'];
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        // Login ஆனவுடன் Token-ஐ Headers-ல் இணைக்கிறோம்
        api.defaults.headers.common['x-auth-token'] = res.data.token;
        if (res.data.message) {
          console.log(res.data.message); // Log the success message from backend
        }
        const userRes = await api.get('/api/auth/user');
        setUser(userRes.data);
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};