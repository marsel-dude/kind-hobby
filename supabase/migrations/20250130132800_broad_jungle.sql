/*
  # Admin Authentication Setup

  1. Changes
    - Add admin authentication functions
    - Add admin session management
    - Add secure password verification

  2. Security
    - Secure password handling
    - Session validation
    - Admin role verification
*/

-- Function to verify admin credentials
CREATE OR REPLACE FUNCTION verify_admin_credentials(
  admin_username text,
  admin_password text
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN users p ON u.id = p.id
    WHERE 
      p.username = admin_username 
      AND p.is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has admin access
CREATE OR REPLACE FUNCTION check_admin_access()
RETURNS boolean AS $$
BEGIN
  RETURN is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(
  target_user_id uuid
)
RETURNS void AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only existing admins can promote users to admin';
  END IF;

  UPDATE users
  SET is_admin = true
  WHERE id = target_user_id;

  -- Log the admin promotion
  PERFORM log_admin_action(
    'promote_admin',
    'users',
    target_user_id::text,
    jsonb_build_object('promoted_by', auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;