import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';

interface Notification {
  id: string;
  type: 'NEW_ISSUE' | 'STAFF_ASSIGNED' | 'STATUS_UPDATED' | 'COMMENT_ADDED';
  message: string;
  issueId: string;
  issueTitle: string;
  read: boolean;
  timestamp: Date;
}

const TYPE_ICONS: Record<Notification['type'], string> = {
  NEW_ISSUE: '🆕',
  STAFF_ASSIGNED: '👤',
  STATUS_UPDATED: '🔄',
  COMMENT_ADDED: '💬',
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Listen for notification events from the server
  const handleNotification = useCallback(
    (payload: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
      setNotifications((prev) => {
        // Limit to last 10 in memory
        const next: Notification[] = [
          {
            ...payload,
            id: `${Date.now()}-${Math.random()}`,
            read: false,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 10);
        return next;
      });
    },
    []
  );

  useSocket<Omit<Notification, 'id' | 'read' | 'timestamp'>>('notification', handleNotification);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleView = (n: Notification) => {
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
    );
    setOpen(false);
    navigate(`/issue/${n.issueId}`);
  };

  const timeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative p-2 rounded-lg hover:bg-indigo-50 transition-colors text-gray-600 hover:text-indigo-600"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-indigo-50/50 transition-colors ${
                    !n.read ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg leading-none mt-0.5">{TYPE_ICONS[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-gray-400">{timeAgo(n.timestamp)}</span>
                        <button
                          onClick={() => handleView(n)}
                          className="text-[11px] text-indigo-600 font-medium hover:underline"
                        >
                          View Issue →
                        </button>
                      </div>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
