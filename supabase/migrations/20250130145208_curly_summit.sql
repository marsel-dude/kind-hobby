/*
  # Fix Admin Authentication Functions

  1. Changes
    - Fix verify_admin_credentials function to return jsonb
    - Add admin session management
    - Improve error handling and logging
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS verify_admin_credentials(text, text);

-- Create admin_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users NOT NULL,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can manage sessions"
  ON admin_sessions
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Function to create admin session
CREATE OR REPLACE FUNCTION create_admin_session(admin_id uuid)
RETURNS text AS $$
DECLARE
  session_token text;
BEGIN
  -- Generate a secure token
  session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create session
  INSERT INTO admin_sessions (
    admin_id,
    token,
    expires_at
  ) VALUES (
    admin_id,
    session_token,
    now() + interval '24 hours'
  );

  RETURN session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate admin session
CREATE OR REPLACE FUNCTION validate_admin_session(session_token text)
RETURNS boolean AS $$
DECLARE
  valid boolean;
BEGIN
  -- Check if session exists and is valid
  SELECT EXISTS (
    SELECT 1
    FROM admin_sessions s
    JOIN users u ON u.id = s.admin_id
    WHERE 
      s.token = session_token
      AND s.expires_at > now()
      AND u.is_admin = true
  ) INTO valid;

  IF valid THEN
    -- Update last activity
    UPDATE admin_sessions
    SET last_activity = now()
    WHERE token = session_token;
  END IF;

  RETURN valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved admin verification function
CREATE OR REPLACE FUNCTION verify_admin_credentials(
  admin_username text,
  admin_password text
)
RETURNS jsonb AS $$
DECLARE
  admin_id uuid;
  session_token text;
  result jsonb;
BEGIN
  -- Get admin user
  SELECT id INTO admin_id
  FROM users
  WHERE username = admin_username
    AND is_admin = true;

  IF admin_id IS NULL THEN
    -- Log failed attempt
    PERFORM log_admin_audit(
      'login_failed',
      'admin',
      admin_username,
      jsonb_build_object(
        'reason', 'invalid_credentials',
        'timestamp', now()
      )
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;

  -- Create session
  session_token := create_admin_session(admin_id);

  -- Log successful login
  PERFORM log_admin_audit(
    'login_success',
    'admin',
    admin_id::text,
    jsonb_build_object(
      'timestamp', now()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'session_token', session_token,
    'admin_id', admin_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;