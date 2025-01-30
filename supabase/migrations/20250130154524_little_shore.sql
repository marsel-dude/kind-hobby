/*
  # Create Error Logs Table

  1. New Tables
    - `error_logs`
      - `id` (uuid, primary key)
      - `level` (text) - ERROR, WARNING, INFO, DEBUG
      - `message` (text)
      - `timestamp` (timestamptz)
      - `context` (jsonb)
      - `error_details` (jsonb)
      - `user_id` (uuid)
      - `session_id` (text)
      - `component` (text)
      - `stack_trace` (text)
      - `metadata` (jsonb)
      - `environment` (text)
      - `version` (text)

  2. Security
    - Enable RLS on `error_logs` table
    - Add policy for admins to read all logs
    - Add policy for authenticated users to create logs
*/

-- Create error_logs table
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

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create index for timestamp and level
CREATE INDEX error_logs_timestamp_idx ON error_logs (timestamp DESC);
CREATE INDEX error_logs_level_idx ON error_logs (level);

-- Create function to clean old logs
CREATE OR REPLACE FUNCTION clean_old_error_logs(days_to_keep integer DEFAULT 30)
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs
  WHERE timestamp < now() - (days_to_keep || ' days')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;