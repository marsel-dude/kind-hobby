/*
  # Add Events Table and Related Features

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `type` (text) - 'spark' or 'hangout'
      - `title` (text)
      - `description` (text)
      - `date` (timestamptz)
      - `location` (text)
      - `max_participants` (integer)
      - `min_participants` (integer)
      - `current_participants` (integer)
      - `status` (text) - 'draft', 'pending', 'active', 'completed', 'cancelled'
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `hobby_category` (text)
      - `experience_level` (text) - for hangout events
      - `cause` (text) - for spark events
      - `price_range` (jsonb) - for spark events
      - `requirements` (text[])
      - `safety_guidelines` (text)
      - `media_policy` (text)
      - `participants` (uuid[])

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('spark', 'hangout')),
  title text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  location text NOT NULL,
  max_participants integer NOT NULL,
  min_participants integer NOT NULL,
  current_participants integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'completed', 'cancelled')),
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  hobby_category text NOT NULL,
  experience_level text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  cause text,
  price_range jsonb,
  requirements text[],
  safety_guidelines text,
  media_policy text,
  participants uuid[] DEFAULT ARRAY[]::uuid[],
  CONSTRAINT valid_participants CHECK (
    current_participants >= 0 AND
    current_participants <= max_participants AND
    min_participants <= max_participants
  )
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active events
CREATE POLICY "Anyone can read active events"
  ON events
  FOR SELECT
  TO public
  USING (status IN ('pending', 'active'));

-- Allow event creators to read their own events
CREATE POLICY "Creators can read own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Allow authenticated users to create events
CREATE POLICY "Users can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow event creators to update their own events
CREATE POLICY "Creators can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Allow event creators to delete their own draft events
CREATE POLICY "Creators can delete own draft events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by AND status = 'draft');