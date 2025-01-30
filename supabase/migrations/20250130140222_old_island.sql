/*
  # Fix Admin Login Verification

  1. Changes
    - Update verify_admin_credentials function to properly check credentials
    - Add better error handling and logging
    - Fix password verification logic

  2. Security
    - Maintain security by using secure password comparison
    - Keep function as SECURITY DEFINER
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS verify_admin_credentials(text, text);

-- Create improved verification function
CREATE OR REPLACE FUNCTION verify_admin_credentials(
  admin_username text,
  admin_password text
)
RETURNS boolean AS $$
DECLARE
  user_exists boolean;
  is_admin_user boolean;
BEGIN
  -- Check if user exists and is admin
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN auth.users au ON au.id = u.id
    WHERE 
      u.username = admin_username
      AND u.is_admin = true
      AND au.encrypted_password = crypt(admin_password, au.encrypted_password)
  ) INTO user_exists;

  -- Log attempt (in production you'd want to log failed attempts)
  INSERT INTO admin_logs (
    admin_id,
    action_type,
    resource_type,
    resource_id,
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