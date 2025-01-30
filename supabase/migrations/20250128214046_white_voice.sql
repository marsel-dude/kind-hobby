/*
  # Add INSERT policy for users table

  1. Changes
    - Add INSERT policy for authenticated users
    - Allow users to insert their own data only

  2. Security
    - Users can only insert rows where their auth.uid matches the id
*/

-- Add INSERT policy for users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;