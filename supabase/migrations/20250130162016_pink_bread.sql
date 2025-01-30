-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('event', 'group', 'system', 'achievement')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  category text NOT NULL CHECK (category IN ('system', 'user', 'security', 'updates')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  snoozed_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  notification_types jsonb DEFAULT '{
    "events": true,
    "groups": true,
    "achievements": true,
    "system": true
  }'::jsonb,
  do_not_disturb jsonb DEFAULT '{
    "enabled": false,
    "start_time": "22:00",
    "end_time": "08:00",
    "timezone": "UTC"
  }'::jsonb,
  retention_days integer DEFAULT 30,
  sound_enabled boolean DEFAULT true,
  vibration_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace indexes
DROP INDEX IF EXISTS notifications_user_id_idx;
DROP INDEX IF EXISTS notifications_created_at_idx;
DROP INDEX IF EXISTS notifications_read_idx;
DROP INDEX IF EXISTS notifications_type_idx;

CREATE INDEX notifications_user_id_idx ON notifications (user_id);
CREATE INDEX notifications_created_at_idx ON notifications (created_at DESC);
CREATE INDEX notifications_read_idx ON notifications (read);
CREATE INDEX notifications_type_idx ON notifications (type);

-- Create or replace notification cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications n
  USING notification_preferences np
  WHERE n.user_id = np.user_id
    AND n.created_at < now() - (COALESCE(np.retention_days, 30) || ' days')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to check if user is in DND mode
CREATE OR REPLACE FUNCTION is_in_dnd_mode(user_id uuid)
RETURNS boolean AS $$
DECLARE
  preferences notification_preferences;
  user_timezone text;
  local_time time;
BEGIN
  -- Get user preferences
  SELECT * INTO preferences
  FROM notification_preferences
  WHERE notification_preferences.user_id = $1;

  IF NOT FOUND OR NOT (preferences.do_not_disturb->>'enabled')::boolean THEN
    RETURN false;
  END IF;

  -- Get user timezone and convert current time
  user_timezone := COALESCE(preferences.do_not_disturb->>'timezone', 'UTC');
  local_time := LOCALTIME AT TIME ZONE 'UTC' AT TIME ZONE user_timezone;
  
  -- Check if current time is within DND period
  RETURN local_time BETWEEN 
    (preferences.do_not_disturb->>'start_time')::time AND 
    (preferences.do_not_disturb->>'end_time')::time;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create or replace function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id uuid,
  p_type text,
  p_category text,
  p_priority text,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
  user_preferences notification_preferences;
BEGIN
  -- Get user preferences
  SELECT * INTO user_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;

  -- Create if not exists
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO user_preferences;
  END IF;

  -- Check if notification type is enabled
  IF NOT (user_preferences.notification_types->>p_type)::boolean THEN
    RETURN NULL;
  END IF;

  -- Check DND mode
  IF is_in_dnd_mode(p_user_id) AND p_priority != 'high' THEN
    RETURN NULL;
  END IF;

  -- Insert notification
  INSERT INTO notifications (
    user_id,
    type,
    category,
    priority,
    title,
    message,
    link
  ) VALUES (
    p_user_id,
    p_type,
    p_category,
    p_priority,
    p_title,
    p_message,
    p_link
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;