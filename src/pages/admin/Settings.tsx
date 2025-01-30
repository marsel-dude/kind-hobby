import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, Shield, Bell, Lock,
  Database, Mail, AlertTriangle, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface AdminSettings {
  notification_settings: {
    email_notifications: boolean;
    report_threshold: number;
  };
  moderation_settings: {
    auto_flag_threshold: number;
    require_approval: boolean;
  };
  security_settings: {
    max_login_attempts: number;
    session_timeout: number;
  };
}

export default function Settings() {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<AdminSettings>({
    notification_settings: {
      email_notifications: true,
      report_threshold: 3,
    },
    moderation_settings: {
      auto_flag_threshold: 5,
      require_approval: true,
    },
    security_settings: {
      max_login_attempts: 5,
      session_timeout: 3600,
    },
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchSettings();
  }, [isAdmin, navigate]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;

      const formattedSettings = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as AdminSettings);

      setSettings(formattedSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category: keyof AdminSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const toastId = toast.loading('Saving settings...');

      // Update each settings category
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase.rpc('update_admin_setting', {
          setting_key: key,
          new_value: value
        });

        if (error) throw error;
      }

      toast.success('Settings saved successfully', { id: toastId });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600">Configure admin dashboard settings</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-8">
          {/* Notification Settings */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Notification Settings</h2>
            </div>
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notification_settings.email_notifications}
                    onChange={(e) => handleSettingChange(
                      'notification_settings',
                      'email_notifications',
                      e.target.checked
                    )}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span>Enable Email Notifications</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Threshold
                </label>
                <input
                  type="number"
                  value={settings.notification_settings.report_threshold}
                  onChange={(e) => handleSettingChange(
                    'notification_settings',
                    'report_threshold',
                    parseInt(e.target.value)
                  )}
                  className="input"
                  min="1"
                />
              </div>
            </div>
          </section>

          {/* Moderation Settings */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Moderation Settings</h2>
            </div>
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.moderation_settings.require_approval}
                    onChange={(e) => handleSettingChange(
                      'moderation_settings',
                      'require_approval',
                      e.target.checked
                    )}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span>Require Approval for New Events</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-Flag Threshold
                </label>
                <input
                  type="number"
                  value={settings.moderation_settings.auto_flag_threshold}
                  onChange={(e) => handleSettingChange(
                    'moderation_settings',
                    'auto_flag_threshold',
                    parseInt(e.target.value)
                  )}
                  className="input"
                  min="1"
                />
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Security Settings</h2>
            </div>
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security_settings.max_login_attempts}
                  onChange={(e) => handleSettingChange(
                    'security_settings',
                    'max_login_attempts',
                    parseInt(e.target.value)
                  )}
                  className="input"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={settings.security_settings.session_timeout}
                  onChange={(e) => handleSettingChange(
                    'security_settings',
                    'session_timeout',
                    parseInt(e.target.value)
                  )}
                  className="input"
                  min="300"
                  step="300"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}