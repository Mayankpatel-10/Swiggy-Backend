import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ShieldAlert, PackageCheck } from 'lucide-react';
import API from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-warm-border pb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-warm-amber" />
          <h1 className="text-2xl font-extrabold text-warm-dark">Notifications Center</h1>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-xs text-warm-olive hover:underline font-semibold flex items-center gap-1"
        >
          <CheckCheck className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-warm-muted">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border transition-all ${
                n.isRead ? 'bg-warm-card border-warm-border/60' : 'bg-warm-beige/40 border-warm-amber/40 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-warm-dark flex items-center gap-2">
                    {n.type === 'FRAUD_ALERT' && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{n.title}</span>
                  </h4>
                  <p className="text-xs text-warm-muted">{n.message}</p>
                  <span className="text-[10px] text-warm-muted/70 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    className="px-3 py-1 bg-warm-dark text-white text-[11px] font-bold rounded-lg shrink-0"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-xs text-warm-muted bg-warm-card rounded-2xl border border-warm-border p-6">
          No notifications yet.
        </div>
      )}
    </div>
  );
}
