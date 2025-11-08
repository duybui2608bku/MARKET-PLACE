-- Migration 008: Update worker_profiles_with_user view to include new columns
-- This recreates the view to pick up new columns added in migration 005

-- Drop and recreate the view
DROP VIEW IF EXISTS public.worker_profiles_with_user;

CREATE OR REPLACE VIEW public.worker_profiles_with_user AS
SELECT 
  wp.*,
  u.email,
  u.phone,
  u.full_name,
  u.avatar_url,
  u.preferred_language
FROM public.worker_profiles wp
JOIN public.users u ON wp.id = u.id;

-- Ensure permissions are set
GRANT SELECT ON public.worker_profiles_with_user TO authenticated;
GRANT SELECT ON public.worker_profiles_with_user TO anon;

-- Add helpful comment
COMMENT ON VIEW public.worker_profiles_with_user IS 
'View combining worker_profiles with user data. Recreated to include new columns: age, height, weight, zodiac_sign, hobbies, lifestyle, favorite_quote, introduction, gallery_images, service_type, etc.';

