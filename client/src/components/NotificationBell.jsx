import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const { token } = useContext(AuthContext);

  // 1. Fetch notifications from the backend
  useEffect(() => {
    if (token) {
      axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        // Backend returns ApiResponse with data field
        setNotifications(res.data.data || []);
      })
      .catch(err => console.error("Failed to fetch notifications", err));
    }
  }, [token]);

  // 2. Filter logic (matching your backend field name 'isRead')
  const unreadCount = notifications.filter(n => !n.read).length;

  // 3. Mark as Read logic
  const markRead = (id) => {
    axios.put(`/api/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    })
    .catch(err => console.error("Update failed", err));
  };

  return (
    <div className="nb-wrap">
      {/* The Bell Icon / Button */}
      <button 
        onClick={() => setOpen(!open)}
        className="nb-btn"
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="nb-count">
            {unreadCount}
          </span>
        )}
      </button>

      {/* The Notification Panel */}
      {open && (
        <div className="nb-panel">
          <div className="nb-header">
            <span>Notifications</span>
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => !n.read && markRead(n.id)}
                  className={`nb-item ${!n.read ? 'unread' : ''}`}
                >
                  <p className="nb-msg">
                    {n.message}
                  </p>
                  <span className="nb-type">
                    {n.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}