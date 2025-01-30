/*
  # Add avatar URL to users table

  1. Changes
    - Add `avatar_url` column to `users` table to store user avatar URLs
    
  2. Notes
    - Uses text type for storing URLs
    - Column is nullable since not all users will have an avatar
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
  END IF;
END $$;