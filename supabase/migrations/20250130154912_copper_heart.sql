-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Only admins can read all logs" ON error_logs;
  DROP POLICY IF EXISTS "Authenticated users can create logs" ON error_logs;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create error_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('ERROR', 'WARNING', 'INFO', 'DEBUG')),
  message text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  context jsonb,
  error_details jsonb,
  user_id uuid REFERENCES auth.users,
  session_id text,
  component text,
  stack_trace text,
  metadata jsonb,
  environment text,
  version text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (after ensuring they don't exist)
CREATE POLICY "Only admins can read all logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create logs"
  ON error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create or replace indexes
DROP INDEX IF EXISTS error_logs_timestamp_idx;
DROP INDEX IF EXISTS error_logs_level_idx;
CREATE INDEX error_logs_timestamp_idx ON error_logs (timestamp DESC);
CREATE INDEX error_logs_level_idx ON error_logs (level);

-- Create or replace cleanup function
CREATE OR REPLACE FUNCTION clean_old_error_logs(days_to_keep integer DEFAULT 30)
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs
  WHERE timestamp < now() - (days_to_keep || ' days')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;