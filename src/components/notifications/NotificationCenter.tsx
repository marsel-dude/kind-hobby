import React from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Link } from 'react-router-dom';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {unreadCount > 0 && (
        <div className="p-4 bg-gray-50">
          <button
            onClick={() => markAllAsRead()}
            className="text-sm text-primary hover:text-primary/80"
          >
            Mark all as read
          </button>
        </div>
      )}

      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 hover:bg-gray-50 transition-colors ${
            !notification.read ? 'bg-primary/5' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{notification.title}</p>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
                {notification.link && (
                  <Link
                    to={notification.link}
                    className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-primary transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => deleteNotification(notification.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}