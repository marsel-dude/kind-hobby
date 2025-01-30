/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `display_name` (text)
      - `bio` (text)
      - `hobbies` (text array)
      - `skills` (text array)
      - `teaching_interest` (boolean)
      - `volunteer_interest` (boolean)
      - `completed_challenges` (integer)
      - `level` (integer)
      - `badges` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to:
      - Read their own data
      - Update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  display_name text,
  bio text,
  hobbies text[],
  skills text[],
  teaching_interest boolean DEFAULT false,
  volunteer_interest boolean DEFAULT false,
  completed_challenges integer DEFAULT 0,
  level integer DEFAULT 1,
  badges text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);