import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        // Set the header for all subsequent requests
        api.defaults.headers.common['x-auth-token'] = token;
        try {
          const response = await api.get('/api/auth/user');
          setUser(response.data);
        } catch (error) {
          // If the token is invalid (401), just clear it.
          if (error.response?.status === 401) {
            console.log("Session expired. Logging out...");
          } else {
            console.error("Failed to authenticate with stored token.", error);
          }
          // Clean up on failure
          delete api.defaults.headers.common['x-auth-token'];
          localStorage.removeItem('token'); // Ensure token is cleared
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Global error handler: Logout if user is not found or token is invalid
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || (error.response?.status === 404 && error.response?.data?.message === 'User not found')) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  const login = async (token) => {
    if (!token) {
      console.error("Login failed: No token provided");
      return;
    }
    localStorage.setItem('token', token);
    api.defaults.headers.common['x-auth-token'] = token;
    try {
      const response = await api.get('/api/auth/user');
      setUser(response.data);
      return true; // Indicate success
    } catch (error) {
      console.error("Login failed to fetch user", error);
      // If login fails, clear the auth state completely
      localStorage.removeItem('token');
      delete api.defaults.headers.common['x-auth-token'];
      setUser(null);
      throw error; // Stop the process and let the component know
    }
  };

  const value = { user, setUser, loading, logout, login };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};