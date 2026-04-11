import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set the base URL for your Spring Boot backend
axios.defaults.baseURL = 'http://localhost:8080';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Added loading state

  // On app load, fetch current user if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Match the ApiResponse structure from your Spring Boot Backend
          setUser(res.data.data);
        } catch (err) {
          console.error("Auth failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
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