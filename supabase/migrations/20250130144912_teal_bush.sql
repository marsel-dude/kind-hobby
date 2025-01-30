/*
  # Fix Admin Authentication

  1. Changes
    - Add reports table
    - Add user_activity table
    - Fix admin verification function
    - Add admin session management
*/

-- Create reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('user', 'event', 'content')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  reason text NOT NULL,
  details text,
  reported_id text NOT NULL,
  reported_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  priority text NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high'))
);

-- Create user_activity table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  activity_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Fix admin verification function
CREATE OR REPLACE FUNCTION verify_admin_credentials(
  admin_username text,
  admin_password text
)
RETURNS boolean AS $$
DECLARE
  user_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM users u
    WHERE 
      u.username = admin_username
      AND u.is_admin = true
  ) INTO user_exists;

  -- Log attempt
  INSERT INTO admin_audit_logs (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    COALESCE((SELECT id FROM users WHERE username = admin_username), '00000000-0000-0000-0000-000000000000'::uuid),
    'login_attempt',
    'admin',
    admin_username,
    jsonb_build_object(
      'success', user_exists,
      'timestamp', now()
    )
  );

  RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve admin check function
CREATE OR REPLACE FUNCTION check_admin_access()
RETURNS boolean AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND is_admin = true
  ) INTO is_admin_user;

  -- Log access check
  IF NOT is_admin_user THEN
    INSERT INTO admin_audit_logs (
      admin_id,
      action_type,
      target_type,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      'access_check',
      'admin',
      auth.uid()::text,
      jsonb_build_object(
        'success', false,
        'timestamp', now()
      )
    );
  END IF;

  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;