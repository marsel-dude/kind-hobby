/*
  # Admin Implementation

  1. New Tables
    - `admin_audit_logs` - Track all admin actions
    - `admin_notifications` - System notifications for admins
    - `admin_metrics` - Store aggregated admin metrics

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin-only access
    - Add functions for secure admin operations

  3. Changes
    - Add admin-specific columns and functions
    - Set up audit logging
    - Create admin metrics tracking
*/

-- Create admin audit logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users NOT NULL,
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create admin metrics table
CREATE TABLE IF NOT EXISTS admin_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  value numeric NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can view audit logs"
  ON admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can insert audit logs"
  ON admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can view notifications"
  ON admin_notifications
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage notifications"
  ON admin_notifications
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can view metrics"
  ON admin_metrics
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Function to log admin audit
CREATE OR REPLACE FUNCTION log_admin_audit(
  action_type text,
  target_type text,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT NULL,
  user_agent text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  INSERT INTO admin_audit_logs (
    admin_id,
    action_type,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    action_type,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin notification
CREATE OR REPLACE FUNCTION create_admin_notification(
  notification_type text,
  title text,
  message text,
  priority text DEFAULT 'low'
)
RETURNS void AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  INSERT INTO admin_notifications (
    type,
    title,
    message,
    priority
  ) VALUES (
    notification_type,
    title,
    message,
    priority
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update admin metrics
CREATE OR REPLACE FUNCTION update_admin_metrics(
  metric_type text,
  value numeric,
  period_start timestamptz,
  period_end timestamptz
)
RETURNS void AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  INSERT INTO admin_metrics (
    metric_type,
    value,
    period_start,
    period_end
  ) VALUES (
    metric_type,
    value,
    period_start,
    period_end
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM users),
    'total_events', (SELECT count(*) FROM events),
    'pending_reports', (SELECT count(*) FROM reports WHERE status = 'pending'),
    'active_users', (
      SELECT count(DISTINCT user_id)
      FROM user_activity
      WHERE created_at > now() - interval '7 days'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;