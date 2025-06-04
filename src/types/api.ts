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

export interface APIErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export interface APIResponse<T = null> {
  data?: T | null;
  error: APIErrorResponse | null;
}

export interface CreateUserData {
  id: string;
  email: string;
  username: string;
  display_name: string;
  privacy: {
    showEmail: boolean;
    showLocation: boolean;
    showSocial: boolean;
    showFullName: boolean;
  };
  social?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface UpdateUserData {
  display_name?: string;
  bio?: string;
  hobbies?: string[];
  skills?: string[];
  teaching_interest?: boolean;
  volunteer_interest?: boolean;
  hobby_groups?: string[];
  privacy?: {
    showEmail: boolean;
    showLocation: boolean;
    showSocial: boolean;
    showFullName: boolean;
  };
  social?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  avatar_url?: string | null;
}

export interface User {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface EventDonation {
  id: string;
  event_id: string;
  user_id: string;
  amount: number;
  message?: string;
  created_at: string;
}
