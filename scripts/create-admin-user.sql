-- Quick script to create admin user
-- Replace 'YOUR_EMAIL_HERE' with your actual email

-- STEP 1: First check if migrations are applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_settings') THEN
        RAISE EXCEPTION 'admin_settings table does not exist. Please run migration 009_create_admin_settings.sql first';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_check'
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%admin%'
    ) THEN
        RAISE EXCEPTION 'Admin role not added to users table. Please run migration 010_add_admin_role.sql first';
    END IF;
END $$;

-- STEP 2: Set your email here
DO $$
DECLARE
    user_email TEXT := 'YOUR_EMAIL_HERE';  -- <-- CHANGE THIS
    user_count INTEGER;
BEGIN
    -- Check if user exists
    SELECT COUNT(*) INTO user_count
    FROM public.users
    WHERE email = user_email;

    IF user_count = 0 THEN
        RAISE EXCEPTION 'User with email % not found. Please register an account first at /vi/register', user_email;
    END IF;

    -- Update to admin
    UPDATE public.users
    SET role = 'admin'
    WHERE email = user_email;

    RAISE NOTICE 'SUCCESS: User % is now an admin!', user_email;
END $$;

-- STEP 3: Verify admin users
SELECT
    id,
    email,
    role,
    full_name,
    created_at
FROM public.users
WHERE role = 'admin'
ORDER BY created_at DESC;
