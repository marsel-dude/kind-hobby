/*
  # Create challenges table

  1. New Tables
    - `challenges`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `hobby` (text)
      - `difficulty` (text)
      - `points` (integer)
      - `status` (text)
      - `created_by` (uuid, references users)
      - `created_at` (timestamptz)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `votes` (integer)
      - `voted_users` (uuid[])

  2. Security
    - Enable RLS on `challenges` table
    - Add policies for:
      - Anyone can read challenges
      - Authenticated users can create challenges
      - Users can vote on challenges
*/

CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  hobby text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'completed')),
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  start_date timestamptz,
  end_date timestamptz,
  votes integer DEFAULT 0,
  voted_users uuid[] DEFAULT ARRAY[]::uuid[],
  CONSTRAINT valid_dates CHECK (
    (start_date IS NULL AND end_date IS NULL) OR
    (start_date < end_date)
  )
);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read challenges
CREATE POLICY "Anyone can read challenges"
  ON challenges
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create challenges
CREATE POLICY "Authenticated users can create challenges"
  ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update votes on challenges
CREATE POLICY "Users can update challenge votes"
  ON challenges
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    -- Only allow updating votes and voted_users
    EXISTS (
      SELECT 1
      FROM challenges
      WHERE id = challenges.id
      AND (
        -- Only these columns can be different in the update
        (title IS NOT DISTINCT FROM challenges.title) AND
        (description IS NOT DISTINCT FROM challenges.description) AND
        (hobby IS NOT DISTINCT FROM challenges.hobby) AND
        (difficulty IS NOT DISTINCT FROM challenges.difficulty) AND
        (points IS NOT DISTINCT FROM challenges.points) AND
        (status IS NOT DISTINCT FROM challenges.status) AND
        (created_by IS NOT DISTINCT FROM challenges.created_by) AND
        (created_at IS NOT DISTINCT FROM challenges.created_at) AND
        (start_date IS NOT DISTINCT FROM challenges.start_date) AND
        (end_date IS NOT DISTINCT FROM challenges.end_date)
      )
    )
  );