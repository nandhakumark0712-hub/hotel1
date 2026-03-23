import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
  addRealtimeNotification,
} from '../../redux/slices/notificationSlice';

// ── Icon helpers ─────────────────────────────────────────────────────────────
const typeIcon = {
  LOGIN: '🔔',
  PASSWORD_RESET: '🔑',
  BOOKING_CONFIRMED: '🏨',
  PAYMENT_CONFIRMED: '✅',
  BOOKING_CANCELLED: '❌',
  PROMO_OFFER: '🎉',
  SYSTEM: '📢',
};

const typeBadge = {
  LOGIN: '#3B82F6',
  PASSWORD_RESET: '#8B5CF6',
  BOOKING_CONFIRMED: '#4F46E5',
  PAYMENT_CONFIRMED: '#059669',
  BOOKING_CANCELLED: '#DC2626',
  PROMO_OFFER: '#D97706',
  SYSTEM: '#FF5A36',
};

const formatTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ── Socket singleton ─────────────────────────────────────────────────────────
let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || '', {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socketInstance;
};

// ── Component ────────────────────────────────────────────────────────────────
const NotificationBell = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, unreadCount, isLoading } = useSelector((state) => state.notifications);

  const [open, setOpen] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const dropdownRef = useRef(null);

  // ── Fetch on mount when user is authenticated ────────────────────────────
  useEffect(() => {
    if (user?.token) {
      dispatch(fetchNotifications());
    }
  }, [user, dispatch]);

  // ── Socket.io setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.token || !user?._id) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    // Join user-specific room
    socket.emit('join', user._id);

    const handleNotification = (notification) => {
      dispatch(addRealtimeNotification(notification));
      // Animate the bell
      setAnimateBell(true);
      setTimeout(() => setAnimateBell(false), 1000);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [user, dispatch]);

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = useCallback((e, id) => {
    e.stopPropagation();
    dispatch(markNotificationRead(id));
  }, [dispatch]);

  const handleMarkAllRead = useCallback(() => {
    dispatch(markNotificationRead(null));
  }, [dispatch]);

  const handleDelete = useCallback((e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  }, [dispatch]);

  if (!user) return null;

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      {/* ── Bell Button ──────────────────────────────────────────────────── */}
      <button
        id="notification-bell-btn"
        className={`notif-bell-btn${animateBell ? ' notif-bell-ring' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        title="Notifications"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications panel">
          {/* Header */}
          <div className="notif-dropdown-header">
            <div className="notif-dropdown-title">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-unread-pill">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="notif-mark-all-btn"
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="notif-list">
            {isLoading ? (
              <div className="notif-empty">
                <div className="notif-spinner" />
                <p>Loading…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="notif-empty">
                <span className="notif-empty-icon">🔔</span>
                <p>You're all caught up!</p>
                <span className="notif-empty-sub">No notifications yet</span>
              </div>
            ) : (
              items.map((notif) => (
                <div
                  key={notif._id}
                  className={`notif-item${notif.isRead ? '' : ' notif-item--unread'}`}
                  onClick={(e) => !notif.isRead && handleMarkRead(e, notif._id)}
                  role="article"
                  aria-label={`Notification: ${notif.message}`}
                >
                  <div
                    className="notif-type-dot"
                    style={{ background: typeBadge[notif.type] || '#FF5A36' }}
                  />
                  <div className="notif-item-icon">
                    {typeIcon[notif.type] || '📢'}
                  </div>
                  <div className="notif-item-body">
                    <p className="notif-item-msg">{notif.message}</p>
                    <span className="notif-item-time">{formatTime(notif.createdAt)}</span>
                  </div>
                  <div className="notif-item-actions">
                    {!notif.isRead && (
                      <button
                        className="notif-action-btn notif-read-btn"
                        onClick={(e) => handleMarkRead(e, notif._id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="notif-action-btn notif-del-btn"
                      onClick={(e) => handleDelete(e, notif._id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="notif-dropdown-footer">
              <span>{items.length} notification{items.length !== 1 ? 's' : ''} total</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
