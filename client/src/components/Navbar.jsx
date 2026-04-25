import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './nav-theme.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null; // Don't show navbar on login page

  const dashboardPath = user.role === 'ADMIN'
    ? '/admin/dashboard'
    : user.role === 'TECHNICIAN'
      ? '/technician/dashboard'
      : user.role === 'MANAGER'
        ? '/manager/dashboard'
        : '/user/dashboard';

  return (
    <nav className="sc-nav">
      <div className="sc-nav-left">
        <Link to={dashboardPath} className="sc-nav-brand">Smart Campus Hub</Link>
        <Link className="sc-nav-link" to={dashboardPath}>Dashboard</Link>
        <Link className="sc-nav-link" to="/facilities">Facilities</Link>
        <Link className="sc-nav-link" to="/bookings">Bookings</Link>
        <Link className="sc-nav-link" to="/tickets">Tickets</Link>
        {user.role === 'ADMIN' && <Link className="sc-nav-link" to="/admin/users">Users</Link>}
      </div>
      
      <div className="sc-nav-right">
        <NotificationBell />
        <span className="sc-role-badge">{user.role}</span>
        <span className="sc-user-email">{user.email}</span>
        <button onClick={logout} className="sc-logout-btn">Logout</button>
      </div>
    </nav>
  );
}