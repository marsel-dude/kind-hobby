/*
  # Admin User Setup

  1. Changes
    - Create initial admin user
    - Set admin flag
    - Configure secure credentials

  2. Security
    - Use Supabase auth for password handling
    - Set admin flag in users table
*/

-- Create the admin user if it doesn't exist
DO $$ 
DECLARE
  user_id uuid;
BEGIN
  -- First check if the user already exists
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'darko@kindhobby.com';

  -- If user doesn't exist, create it
  IF user_id IS NULL THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'darko@kindhobby.com',
      crypt('Darko123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"username": "Darko"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO user_id;

    -- Insert into users table
    INSERT INTO users (
      id,
      email,
      username,
      display_name,
      is_admin,
      created_at
    ) VALUES (
      user_id,
      'darko@kindhobby.com',
      'Darko',
      'Darko',
      true,
      now()
    );
  ELSE
    -- If user exists, ensure they are an admin
    UPDATE users
    SET is_admin = true
    WHERE id = user_id;
  END IF;
END $$;