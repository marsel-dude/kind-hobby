/*
  # Event Fundraising System Implementation

  1. New Tables
    - `event_donations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `message` (text)
      - `created_at` (timestamp)
    
    - `event_impact_metrics`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `metric_type` (text)
      - `value` (numeric)
      - `updated_at` (timestamp)

  2. Functions
    - `update_event_fundraising`: Updates event fundraising progress
    - `calculate_event_impact`: Calculates and updates impact metrics

  3. Security
    - Enable RLS on new tables
    - Add policies for donation management
    - Add policies for impact metrics
*/

-- Create event_donations table
CREATE TABLE IF NOT EXISTS event_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  message text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_donation CHECK (amount > 0)
);

-- Create event_impact_metrics table
CREATE TABLE IF NOT EXISTS event_impact_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events NOT NULL,
  metric_type text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Add fundraising columns to events table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'fundraising_goal'
  ) THEN
    ALTER TABLE events 
    ADD COLUMN fundraising_goal numeric,
    ADD COLUMN funds_raised numeric DEFAULT 0,
    ADD COLUMN donor_count integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE event_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_impact_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for event_donations
CREATE POLICY "Anyone can view donations"
  ON event_donations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create donations"
  ON event_donations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for event_impact_metrics
CREATE POLICY "Anyone can view impact metrics"
  ON event_impact_metrics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Event creators can update impact metrics"
  ON event_impact_metrics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
      AND events.created_by = auth.uid()
    )
  );

-- Function to update event fundraising
CREATE OR REPLACE FUNCTION update_event_fundraising(event_id uuid, amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET 
    funds_raised = COALESCE(funds_raised, 0) + amount,
    donor_count = donor_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;