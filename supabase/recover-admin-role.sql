-- Emergency recovery: restore admin role for a specific user
-- Run in Supabase SQL Editor (as project owner/postgres)

INSERT INTO public.user_roles (user_id, role)
VALUES ('2fdd2831-e7e5-44b9-9b56-47bb9fa93dad', 'admin')
ON CONFLICT (user_id)
DO UPDATE SET role = EXCLUDED.role;

-- Verify role assignment
SELECT user_id, role, created_at
FROM public.user_roles
WHERE user_id = '2fdd2831-e7e5-44b9-9b56-47bb9fa93dad';

-- Optional: verify user exists in auth.users
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE id = '2fdd2831-e7e5-44b9-9b56-47bb9fa93dad';
