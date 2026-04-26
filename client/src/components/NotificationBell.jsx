import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
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

  const markAllRead = () => {
    axios.put('/api/notifications/read-all', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    })
    .catch(err => console.error("Mark all failed", err));
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
          <div className="nb-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Notifications</span>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  border: '1px solid #d8ccb8',
                  background: '#fff',
                  color: '#6a5746',
                  fontSize: '10px',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  padding: '3px 6px',
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => {
                    if (!n.read) {
                      markRead(n.id);
                    }
                    setActiveNotification(n);
                  }}
                  className={`nb-item ${!n.read ? 'unread' : ''}`}
                >
                  <p className="nb-msg">
                    {n.message}
                  </p>
                  <span className="nb-type">
                    {n.type} {n.createdAt ? ` • ${new Date(n.createdAt).toLocaleString()}` : ''}
                  </span>
                </div>
              ))
            )}
          </div>

          {activeNotification && (
            <div
              style={{
                borderTop: '1px solid #efe4d3',
                background: '#fffaf3',
                padding: '10px 12px',
                textAlign: 'left'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}
              >
                <strong style={{ fontSize: '11px', letterSpacing: '0.8px', color: '#5d4a3a' }}>
                  Full Message
                </strong>
                <button
                  onClick={() => setActiveNotification(null)}
                  style={{
                    border: '1px solid #d8ccb8',
                    background: '#fff',
                    color: '#6a5746',
                    fontSize: '10px',
                    padding: '2px 6px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
              <p style={{ margin: 0, color: '#2e2824', fontSize: '13px', lineHeight: '1.5' }}>
                {activeNotification.message}
              </p>
              <div style={{ marginTop: '6px', color: '#8d7862', fontSize: '10px', letterSpacing: '0.8px' }}>
                {activeNotification.type} {activeNotification.createdAt ? ` • ${new Date(activeNotification.createdAt).toLocaleString()}` : ''}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}