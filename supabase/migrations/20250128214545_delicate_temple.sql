/*
  # Add hobby groups column to users table

  1. Changes
    - Add `hobby_groups` column to `users` table
      - Array of strings to store group IDs
      - Nullable since users may not join any groups initially
      - Default to empty array

  2. Notes
    - Uses safe column addition with IF NOT EXISTS check
    - Maintains existing data
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'hobby_groups'
  ) THEN
    ALTER TABLE users ADD COLUMN hobby_groups text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;