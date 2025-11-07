-- =============================================
-- Migration: Create Users Table & Auto-Insert Trigger
-- Description: Tạo bảng users và tự động insert khi user đăng ký
-- =============================================

-- 1. Enable UUID extension (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo bảng users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('worker', 'employer')),
  phone TEXT,
  preferred_language TEXT DEFAULT 'vi',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 4. Tạo function để auto-insert user sau khi signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, phone, preferred_language, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employer'), -- Default là employer nếu không có role
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'vi'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), -- Dùng email làm tên tạm nếu chưa có
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    preferred_language = EXCLUDED.preferred_language,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Tạo trigger để tự động gọi function khi có user mới
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Setup Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users có thể đọc thông tin của chính họ
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users có thể update thông tin của chính họ
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Service role có thể làm mọi thứ
CREATE POLICY "Service role can do everything"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Cho phép đọc public profile (cần cho marketplace)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users
  FOR SELECT
  USING (true);

-- 7. Tạo function để update timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Tạo trigger để tự động update timestamp
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Tạo view để dễ query
CREATE OR REPLACE VIEW public.workers AS
SELECT * FROM public.users WHERE role = 'worker';

CREATE OR REPLACE VIEW public.employers AS
SELECT * FROM public.users WHERE role = 'employer';

-- 10. Grant permissions
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.workers TO authenticated;
GRANT SELECT ON public.employers TO authenticated;

-- =============================================
-- COMMENTS - Giải thích từng phần
-- =============================================

COMMENT ON TABLE public.users IS 'Bảng chứa thông tin user, tự động sync từ auth.users';
COMMENT ON COLUMN public.users.role IS 'Vai trò: worker (người lao động) hoặc employer (người thuê)';
COMMENT ON COLUMN public.users.phone IS 'Số điện thoại (optional)';
COMMENT ON COLUMN public.users.preferred_language IS 'Ngôn ngữ ưa thích: vi, en, zh, ko';
COMMENT ON FUNCTION public.handle_new_user() IS 'Tự động tạo user record khi có user mới đăng ký';

