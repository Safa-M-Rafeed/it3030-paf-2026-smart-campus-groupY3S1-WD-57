import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Extract the token from the URL (e.g., ?token=eyJhbG...)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // 2. Call the login function from AuthContext to save token to localStorage
      login(token);
      
      // 3. Redirect to the main dashboard or home page
      navigate('/'); 
    } else {
      // 4. If no token is found, something went wrong, send back to login
      console.error("No token found in callback URL");
      navigate('/login');
    }
  }, [login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Finalizing your login...</p>
    </div>
  );
}