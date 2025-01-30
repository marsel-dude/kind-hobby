import React from 'react';
import { Shield, Mail, MapPin, Link, User } from 'lucide-react';

interface PrivacySettingsProps {
  settings: {
    showEmail: boolean;
    showLocation: boolean;
    showSocial: boolean;
    showFullName: boolean;
  };
  onChange: (settings: any) => void;
  disabled?: boolean;
}

export function PrivacySettings({ settings, onChange, disabled = false }: PrivacySettingsProps) {
  const toggleSetting = (key: keyof typeof settings) => {
    onChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const options = [
    {
      key: 'showEmail',
      label: 'Show Email Address',
      description: 'Allow others to see your email address',
      icon: Mail
    },
    {
      key: 'showLocation',
      label: 'Show Location',
      description: 'Display your location on your profile',
      icon: MapPin
    },
    {
      key: 'showSocial',
      label: 'Show Social Links',
      description: 'Display your social media profiles',
      icon: Link
    },
    {
      key: 'showFullName',
      label: 'Show Full Name',
      description: 'Display your full name instead of username',
      icon: User
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-gray-700">
        <Shield className="w-5 h-5" />
        <h3 className="font-medium">Privacy Settings</h3>
      </div>

      <div className="space-y-3">
        {options.map(({ key, label, description, icon: Icon }) => (
          <label
            key={key}
            className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            <input
              type="checkbox"
              checked={settings[key as keyof typeof settings]}
              onChange={() => toggleSetting(key as keyof typeof settings)}
              disabled={disabled}
              className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{label}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}