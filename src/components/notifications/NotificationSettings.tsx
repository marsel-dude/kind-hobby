import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Clock, Calendar, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useCache } from '../../hooks/useCache';
import { logger } from '../../services/logger';

const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  notificationTypes: z.object({
    events: z.boolean(),
    groups: z.boolean(),
    achievements: z.boolean(),
    system: z.boolean()
  }),
  doNotDisturb: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    timezone: z.string()
  }),
  retentionDays: z.number().min(1).max(90),
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean()
});

type NotificationSettingsData = z.infer<typeof settingsSchema>;

export function NotificationSettings() {
  const { data: preferences, loading, refresh } = useCache(
    'notification_preferences',
    async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      staleWhileRevalidate: true
    }
  );

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NotificationSettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      notificationTypes: {
        events: true,
        groups: true,
        achievements: true,
        system: true
      },
      doNotDisturb: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      retentionDays: 30,
      soundEnabled: true,
      vibrationEnabled: true
    }
  });

  const onSubmit = async (data: NotificationSettingsData) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          email_notifications: data.emailNotifications,
          push_notifications: data.pushNotifications,
          notification_types: data.notificationTypes,
          do_not_disturb: data.doNotDisturb,
          retention_days: data.retentionDays,
          sound_enabled: data.soundEnabled,
          vibration_enabled: data.vibrationEnabled
        });

      if (error) throw error;
      
      toast.success('Notification settings updated');
      refresh();
    } catch (err) {
      logger.error('Failed to update notification settings:', err as Error);
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* General Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>General Settings</span>
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('emailNotifications')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Email Notifications</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('pushNotifications')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Push Notifications</span>
          </label>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Notification Types</span>
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('notificationTypes.events')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Event Updates</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('notificationTypes.groups')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Group Activity</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('notificationTypes.achievements')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Achievements</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('notificationTypes.system')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>System Updates</span>
          </label>
        </div>
      </div>

      {/* Do Not Disturb */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Do Not Disturb</span>
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('doNotDisturb.enabled')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Enable Do Not Disturb</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                {...register('doNotDisturb.startTime')}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                {...register('doNotDisturb.endTime')}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sound & Vibration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Volume2 className="w-5 h-5" />
          <span>Sound & Vibration</span>
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('soundEnabled')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Enable Sound</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('vibrationEnabled')}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Enable Vibration</span>
          </label>
        </div>
      </div>

      {/* Retention */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification History</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keep notifications for
          </label>
          <select
            {...register('retentionDays', { valueAsNumber: true })}
            className="input"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Settings</span>
          )}
        </button>
      </div>
    </form>
  );
}