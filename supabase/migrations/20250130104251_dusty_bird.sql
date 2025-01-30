/*
  # Add Username and Privacy Settings

  1. Changes
    - Add unique username column
    - Add privacy settings JSON column
    - Add social links JSON column
    - Add constraints and indexes

  2. Security
    - Maintain existing RLS policies
    - Add validation for username format
*/

-- Add username column with uniqueness constraint
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Add check constraint for username format
ALTER TABLE users ADD CONSTRAINT valid_username 
  CHECK (username ~* '^[a-zA-Z0-9_-]{3,20}$');

-- Add privacy settings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'privacy'
  ) THEN
    ALTER TABLE users ADD COLUMN privacy jsonb DEFAULT jsonb_build_object(
      'showEmail', false,
      'showLocation', true,
      'showSocial', true,
      'showFullName', false
    );
  END IF;
END $$;

-- Add social links if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'social'
  ) THEN
    ALTER TABLE users ADD COLUMN social jsonb DEFAULT jsonb_build_object(
      'twitter', null,
      'instagram', null,
      'linkedin', null,
      'website', null
    );
  END IF;
END $$;

-- Create index for username searches
CREATE INDEX IF NOT EXISTS users_username_idx ON users (username);