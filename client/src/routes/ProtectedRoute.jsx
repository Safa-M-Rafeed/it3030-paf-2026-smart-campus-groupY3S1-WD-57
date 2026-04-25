import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * @param {{ children: React.ReactNode, requiredRole?: string }} props
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token, loading } = useContext(AuthContext);

  // 1. Wait for the AuthProvider to finish checking the token with the backend
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 2. If there's no token at all, send them to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. If a specific role is required (like 'ADMIN') and the user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Everything is fine, show the protected page
  return children;
}