/*
  # Add social and privacy columns to users table

  1. Changes
    - Add social column (JSONB) to store social media links
    - Add privacy column (JSONB) to store privacy settings
  
  2. Details
    - social: Stores Facebook, Instagram, and Discord links
    - privacy: Stores user privacy preferences for email, location, and social links visibility
*/

DO $$ 
BEGIN
  -- Add social column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'social'
  ) THEN
    ALTER TABLE users ADD COLUMN social jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add privacy column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'privacy'
  ) THEN
    ALTER TABLE users ADD COLUMN privacy jsonb DEFAULT '{"showEmail": true, "showLocation": true, "showSocial": true}'::jsonb;
  END IF;
END $$;