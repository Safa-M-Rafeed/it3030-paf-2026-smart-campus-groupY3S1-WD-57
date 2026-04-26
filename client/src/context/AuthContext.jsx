import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set the base URL for your Spring Boot backend
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Added loading state

  // On app load, fetch current user if token exists
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
      }

      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (isMounted) {
          // Match the ApiResponse structure from your Spring Boot Backend
          setUser(res.data.data);
        }
      } catch (err) {
        console.error("Auth failed:", err);
        if (isMounted) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setLoading(true);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
}