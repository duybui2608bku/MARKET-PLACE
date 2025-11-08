-- =============================================
-- Migration: Support Multiple Service Categories
-- Description: Change service_category from TEXT to TEXT[] to allow multiple service selections
-- =============================================

-- 1. Create a new column for service_categories (array)
ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS service_categories TEXT[];

-- 2. Migrate existing data from service_category to service_categories
UPDATE public.worker_profiles
SET service_categories = ARRAY[service_category]
WHERE service_category IS NOT NULL AND service_categories IS NULL;

-- 3. Keep service_category for backward compatibility (can be removed later)
-- For now, we'll keep both fields but use service_categories for new data

-- 4. Add comment
COMMENT ON COLUMN public.worker_profiles.service_categories IS 'Array of service categories that worker can provide (allows multiple selections)';

-- =============================================
-- END MIGRATION
-- =============================================

