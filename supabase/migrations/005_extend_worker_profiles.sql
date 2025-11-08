-- =============================================
-- Migration: Extend Worker Profiles for 3-Step Setup
-- Description: Add fields for personal info, services, gallery, and pricing
-- =============================================

-- 1. Add personal information fields
ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER, -- in cm
ADD COLUMN IF NOT EXISTS weight DECIMAL(5, 2), -- in kg
ADD COLUMN IF NOT EXISTS zodiac_sign TEXT,
ADD COLUMN IF NOT EXISTS hobbies TEXT[],
ADD COLUMN IF NOT EXISTS lifestyle TEXT,
ADD COLUMN IF NOT EXISTS favorite_quote TEXT,
ADD COLUMN IF NOT EXISTS introduction TEXT;

-- 2. Add service-related fields
ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS service_type TEXT, -- 'assistance', 'companionship'
ADD COLUMN IF NOT EXISTS service_category TEXT, -- specific category within type
ADD COLUMN IF NOT EXISTS service_level INTEGER, -- for companionship: 1, 2, or 3
ADD COLUMN IF NOT EXISTS service_description TEXT,
ADD COLUMN IF NOT EXISTS service_languages TEXT[]; -- for translator service

-- 3. Add gallery and images
ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS gallery_images TEXT[], -- 3-10 personal photos
ADD COLUMN IF NOT EXISTS service_images TEXT[]; -- service-related images

-- 4. Add pricing fields
ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'VND',
ADD COLUMN IF NOT EXISTS min_booking_hours INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10, 2), -- auto-calculated: hourly_rate * 8
ADD COLUMN IF NOT EXISTS monthly_rate DECIMAL(10, 2); -- auto-calculated: hourly_rate * 160

-- 5. Add profile setup tracking
ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS setup_step INTEGER DEFAULT 0, -- 0: not started, 1-3: current step, 4: completed
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false;

-- 6. Create function to auto-calculate rates
CREATE OR REPLACE FUNCTION public.calculate_worker_rates()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate daily rate (8 hours)
  IF NEW.hourly_rate IS NOT NULL THEN
    NEW.daily_rate = NEW.hourly_rate * 8;
    NEW.monthly_rate = NEW.hourly_rate * 160;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to auto-calculate rates
DROP TRIGGER IF EXISTS calculate_rates_on_update ON public.worker_profiles;
CREATE TRIGGER calculate_rates_on_update
  BEFORE INSERT OR UPDATE OF hourly_rate ON public.worker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_worker_rates();

-- 8. Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_worker_profiles_service_type ON public.worker_profiles(service_type);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_service_category ON public.worker_profiles(service_category);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_setup_completed ON public.worker_profiles(setup_completed);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_age ON public.worker_profiles(age);

-- 9. Add check constraints
ALTER TABLE public.worker_profiles
DROP CONSTRAINT IF EXISTS check_age_range,
ADD CONSTRAINT check_age_range CHECK (age IS NULL OR (age >= 18 AND age <= 100));

ALTER TABLE public.worker_profiles
DROP CONSTRAINT IF EXISTS check_height_range,
ADD CONSTRAINT check_height_range CHECK (height IS NULL OR (height >= 100 AND height <= 250));

ALTER TABLE public.worker_profiles
DROP CONSTRAINT IF EXISTS check_weight_range,
ADD CONSTRAINT check_weight_range CHECK (weight IS NULL OR (weight >= 30 AND weight <= 300));

ALTER TABLE public.worker_profiles
DROP CONSTRAINT IF EXISTS check_service_level,
ADD CONSTRAINT check_service_level CHECK (service_level IS NULL OR service_level IN (1, 2, 3));

ALTER TABLE public.worker_profiles
DROP CONSTRAINT IF EXISTS check_min_booking_hours,
ADD CONSTRAINT check_min_booking_hours CHECK (min_booking_hours IS NULL OR min_booking_hours >= 1);

ALTER TABLE public.worker_profiles
DROP CONSTRAINT IF EXISTS check_currency,
ADD CONSTRAINT check_currency CHECK (currency IN ('VND', 'USD', 'EUR', 'JPY', 'KRW', 'CNY'));

-- 10. Add comments
COMMENT ON COLUMN public.worker_profiles.age IS 'Worker age (18-100)';
COMMENT ON COLUMN public.worker_profiles.height IS 'Height in cm';
COMMENT ON COLUMN public.worker_profiles.weight IS 'Weight in kg';
COMMENT ON COLUMN public.worker_profiles.zodiac_sign IS 'Zodiac sign (Aries, Taurus, etc.)';
COMMENT ON COLUMN public.worker_profiles.hobbies IS 'Array of hobbies/interests';
COMMENT ON COLUMN public.worker_profiles.lifestyle IS 'Lifestyle description';
COMMENT ON COLUMN public.worker_profiles.favorite_quote IS 'Favorite quote or motto';
COMMENT ON COLUMN public.worker_profiles.gallery_images IS '3-10 personal photos for profile gallery';
COMMENT ON COLUMN public.worker_profiles.service_type IS 'Main service type: assistance or companionship';
COMMENT ON COLUMN public.worker_profiles.service_category IS 'Specific category within service type';
COMMENT ON COLUMN public.worker_profiles.service_level IS 'Companionship level: 1, 2, or 3';
COMMENT ON COLUMN public.worker_profiles.service_images IS 'Images illustrating the service';
COMMENT ON COLUMN public.worker_profiles.currency IS 'Currency for pricing';
COMMENT ON COLUMN public.worker_profiles.min_booking_hours IS 'Minimum booking hours required';
COMMENT ON COLUMN public.worker_profiles.daily_rate IS 'Auto-calculated: hourly_rate * 8';
COMMENT ON COLUMN public.worker_profiles.monthly_rate IS 'Auto-calculated: hourly_rate * 160';
COMMENT ON COLUMN public.worker_profiles.setup_step IS 'Current setup step (0-4)';
COMMENT ON COLUMN public.worker_profiles.setup_completed IS 'Whether profile setup is completed';

-- =============================================
-- END MIGRATION
-- =============================================

