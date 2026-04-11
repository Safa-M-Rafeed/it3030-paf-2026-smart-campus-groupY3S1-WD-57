import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null; // Don't show navbar on login page

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex gap-6">
        <Link to="/" className="font-bold text-blue-600">Smart Campus</Link>
        <Link to="/facilities">Facilities</Link>
        <Link to="/bookings">Bookings</Link>
        {user.role === 'ADMIN' && <Link to="/admin/users">Users</Link>}
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        <span className="text-sm text-gray-500">{user.email}</span>
        <button onClick={logout} className="text-red-500 text-sm">Logout</button>
      </div>
    </nav>
  );
}