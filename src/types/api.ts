// Add to existing types
export interface Notification {
  id: string;
  user_id: string;
  type: 'event' | 'group' | 'system' | 'achievement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  notification_types: {
    events: boolean;
    groups: boolean;
    achievements: boolean;
    system: boolean;
  };
}