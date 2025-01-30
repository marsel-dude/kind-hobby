-- Update admin user if needed
DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- Get the admin user
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'darko@kindhobby.com';

  -- If admin exists, ensure their password is updated
  IF admin_id IS NOT NULL THEN
    -- Update password in auth.users
    UPDATE auth.users
    SET encrypted_password = crypt('Darko123', gen_salt('bf'))
    WHERE id = admin_id;

    -- Ensure admin flag is set in users table
    UPDATE users
    SET is_admin = true
    WHERE id = admin_id;
  ELSE
    -- Create new admin user if doesn't exist
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
    ) RETURNING id INTO admin_id;

    -- Insert into users table
    INSERT INTO users (
      id,
      email,
      username,
      display_name,
      is_admin,
      created_at
    ) VALUES (
      admin_id,
      'darko@kindhobby.com',
      'Darko',
      'Darko',
      true,
      now()
    );
  END IF;
END $$;