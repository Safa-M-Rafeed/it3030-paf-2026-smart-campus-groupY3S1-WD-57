import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function RoleHomeRedirect() {
  const { user } = useContext(AuthContext);

  switch (user?.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'TECHNICIAN':
      return <Navigate to="/technician/dashboard" replace />;
    case 'MANAGER':
      return <Navigate to="/manager/dashboard" replace />;
    default:
      return <Navigate to="/user/dashboard" replace />;
  }
}
