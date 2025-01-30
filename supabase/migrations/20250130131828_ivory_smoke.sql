/*
  # Admin System Implementation

  1. New Tables
    - `admin_logs`
      - Tracks all admin actions for auditing
      - Records action type, admin user, affected resource, timestamp
    - `admin_settings`
      - Stores global admin configuration
      - Includes settings for notifications, reports, etc.

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin-only access
    - Add admin-specific functions and triggers

  3. Changes
    - Add admin activity tracking
    - Add admin settings management
*/

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users NOT NULL,
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin logs policies
CREATE POLICY "Only admins can view logs"
  ON admin_logs
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can insert logs"
  ON admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admin settings policies
CREATE POLICY "Only admins can view settings"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can modify settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type text,
  resource_type text,
  resource_id text,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  INSERT INTO admin_logs (
    admin_id,
    action_type,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    action_type,
    resource_type,
    resource_id,
    details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description)
VALUES
  ('notification_settings', 
   '{"email_notifications": true, "report_threshold": 3}'::jsonb,
   'Global notification settings for admin alerts'),
  ('moderation_settings',
   '{"auto_flag_threshold": 5, "require_approval": true}'::jsonb,
   'Content moderation and approval settings'),
  ('security_settings',
   '{"max_login_attempts": 5, "session_timeout": 3600}'::jsonb,
   'Security and authentication settings')
ON CONFLICT (key) DO NOTHING;

-- Function to update admin settings
CREATE OR REPLACE FUNCTION update_admin_setting(
  setting_key text,
  new_value jsonb
)
RETURNS void AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  UPDATE admin_settings
  SET 
    value = new_value,
    updated_by = auth.uid(),
    updated_at = now()
  WHERE key = setting_key;

  -- Log the setting update
  PERFORM log_admin_action(
    'update_setting',
    'admin_settings',
    setting_key,
    jsonb_build_object('new_value', new_value)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;