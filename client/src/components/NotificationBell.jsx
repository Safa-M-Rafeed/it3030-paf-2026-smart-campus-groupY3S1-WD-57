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
    <div className="relative">
      {/* The Bell Icon / Button */}
      <button 
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* The Notification Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="font-semibold text-gray-700 text-sm">Notifications</span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => !n.read && markRead(n.id)}
                  className={`p-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}
                >
                  <p className={`text-sm ${!n.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                    {n.message}
                  </p>
                  <span className="text-[10px] text-gray-400">
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