-- =============================================
-- Migration: Create Worker and Employer Profiles Tables
-- Description: Tạo bảng worker_profiles và employer_profiles với đầy đủ thông tin
-- =============================================

-- 1. Tạo bảng worker_profiles
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Thông tin cơ bản
  bio TEXT,
  skills TEXT[], -- Array các kỹ năng
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10, 2), -- Giá theo giờ
  
  -- Địa chỉ và vị trí
  address TEXT,
  city TEXT,
  district TEXT,
  country TEXT DEFAULT 'Vietnam',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Portfolio và công việc
  portfolio_images TEXT[], -- Array URLs ảnh portfolio
  certifications TEXT[], -- Array chứng chỉ
  languages TEXT[] DEFAULT ARRAY['vi'], -- Ngôn ngữ biết
  
  -- Availability
  available BOOLEAN DEFAULT true,
  available_from TIME,
  available_to TIME,
  working_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri'], -- Ngày làm việc
  
  -- Ratings và stats
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00, -- Rating từ 0.00 đến 5.00
  total_reviews INTEGER DEFAULT 0,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Social links
  facebook_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tạo bảng employer_profiles
CREATE TABLE IF NOT EXISTS public.employer_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Thông tin cơ bản
  company_name TEXT,
  company_description TEXT,
  industry TEXT, -- Ngành nghề
  company_size TEXT, -- small, medium, large
  
  -- Địa chỉ
  address TEXT,
  city TEXT,
  district TEXT,
  country TEXT DEFAULT 'Vietnam',
  
  -- Liên hệ
  company_phone TEXT,
  company_email TEXT,
  website_url TEXT,
  
  -- Stats
  total_jobs_posted INTEGER DEFAULT 0,
  total_hires INTEGER DEFAULT 0,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Company info
  tax_code TEXT, -- Mã số thuế
  business_license TEXT, -- URL giấy phép kinh doanh
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tạo indexes cho performance
-- Worker profiles indexes
CREATE INDEX IF NOT EXISTS idx_worker_profiles_city ON public.worker_profiles(city);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_available ON public.worker_profiles(available);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_rating ON public.worker_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_hourly_rate ON public.worker_profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_skills ON public.worker_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_verified ON public.worker_profiles(is_verified);

-- Employer profiles indexes
CREATE INDEX IF NOT EXISTS idx_employer_profiles_city ON public.employer_profiles(city);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_company ON public.employer_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_verified ON public.employer_profiles(is_verified);

-- 4. Setup Row Level Security (RLS)
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;

-- Worker profiles policies
CREATE POLICY "Worker profiles are viewable by everyone"
  ON public.worker_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Workers can update their own profile"
  ON public.worker_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Workers can insert their own profile"
  ON public.worker_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Employer profiles policies
CREATE POLICY "Employer profiles are viewable by authenticated users"
  ON public.employer_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can update their own profile"
  ON public.employer_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Employers can insert their own profile"
  ON public.employer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role full access
CREATE POLICY "Service role can do everything on worker_profiles"
  ON public.worker_profiles
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on employer_profiles"
  ON public.employer_profiles
  FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Tạo function để auto-update timestamp
CREATE OR REPLACE FUNCTION public.handle_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Tạo triggers để auto-update timestamp
CREATE TRIGGER set_worker_profile_updated_at
  BEFORE UPDATE ON public.worker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated_at();

CREATE TRIGGER set_employer_profile_updated_at
  BEFORE UPDATE ON public.employer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated_at();

-- 7. Tạo function để auto-create empty profile khi user đăng ký
CREATE OR REPLACE FUNCTION public.create_empty_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Nếu user là worker, tạo worker_profile rỗng
  IF NEW.role = 'worker' THEN
    INSERT INTO public.worker_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Nếu user là employer, tạo employer_profile rỗng
  IF NEW.role = 'employer' THEN
    INSERT INTO public.employer_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Tạo trigger để auto-create profile khi user được tạo
DROP TRIGGER IF EXISTS on_user_created_create_profile ON public.users;
CREATE TRIGGER on_user_created_create_profile
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_empty_profile();

-- 9. Tạo views với JOIN user info
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

CREATE OR REPLACE VIEW public.employer_profiles_with_user AS
SELECT 
  ep.*,
  u.email,
  u.phone,
  u.full_name,
  u.avatar_url,
  u.preferred_language
FROM public.employer_profiles ep
JOIN public.users u ON ep.id = u.id;

-- 10. Grant permissions
GRANT SELECT, UPDATE, INSERT ON public.worker_profiles TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.employer_profiles TO authenticated;
GRANT SELECT ON public.worker_profiles_with_user TO authenticated;
GRANT SELECT ON public.employer_profiles_with_user TO authenticated;

-- 11. Backfill: Tạo profiles cho existing users
INSERT INTO public.worker_profiles (id)
SELECT id FROM public.users WHERE role = 'worker'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.employer_profiles (id)
SELECT id FROM public.users WHERE role = 'employer'
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.worker_profiles IS 'Profile chi tiết cho workers';
COMMENT ON TABLE public.employer_profiles IS 'Profile chi tiết cho employers';

COMMENT ON COLUMN public.worker_profiles.skills IS 'Array các kỹ năng của worker';
COMMENT ON COLUMN public.worker_profiles.hourly_rate IS 'Giá thuê theo giờ (VNĐ hoặc USD)';
COMMENT ON COLUMN public.worker_profiles.portfolio_images IS 'Array URLs ảnh portfolio';
COMMENT ON COLUMN public.worker_profiles.working_days IS 'Các ngày trong tuần worker có thể làm việc';

COMMENT ON COLUMN public.employer_profiles.company_size IS 'Quy mô công ty: small (<50), medium (50-500), large (>500)';
COMMENT ON COLUMN public.employer_profiles.tax_code IS 'Mã số thuế doanh nghiệp';

