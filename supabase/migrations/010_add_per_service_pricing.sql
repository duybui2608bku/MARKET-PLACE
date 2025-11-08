-- =============================================
-- Migration: Add Per-Service Pricing Support
-- Description: Add service_pricing JSONB column to store pricing for each service category
-- =============================================

-- 1. Add service_pricing JSONB column
ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS service_pricing JSONB DEFAULT '{}'::jsonb;

-- 2. Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_worker_profiles_service_pricing ON public.worker_profiles USING GIN (service_pricing);

-- 3. Add comment
COMMENT ON COLUMN public.worker_profiles.service_pricing IS 
'JSONB object storing pricing for each service category. Format: {"service_category": {"hourly_rate": number, "daily_rate": number, "monthly_rate": number, "min_booking_hours": number}}';

-- 4. Migrate existing pricing to service_pricing if service_category exists
-- This will create pricing entry for the existing service_category
UPDATE public.worker_profiles
SET service_pricing = jsonb_build_object(
  service_category,
  jsonb_build_object(
    'hourly_rate', hourly_rate,
    'daily_rate', daily_rate,
    'monthly_rate', monthly_rate,
    'min_booking_hours', min_booking_hours
  )
)
WHERE service_category IS NOT NULL 
  AND hourly_rate IS NOT NULL
  AND (service_pricing IS NULL OR service_pricing = '{}'::jsonb);

-- =============================================
-- END MIGRATION
-- =============================================

