UPDATE auth.users
SET encrypted_password = crypt('Chi@9280', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'chirayu.26cse@bmu.edu.in';