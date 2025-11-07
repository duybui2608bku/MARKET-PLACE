-- =============================================
-- Migration: Setup Storage Bucket for Avatars
-- Description: Tạo bucket và policies cho user avatars
-- =============================================

-- 1. Tạo bucket 'avatars' (nếu chưa có)
-- Bucket này sẽ public để có thể truy cập avatar URLs
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies cho bucket 'avatars'

-- Policy: Cho phép users xem tất cả avatars (public read)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Cho phép authenticated users upload avatar của chính họ
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Cho phép users update avatar của chính họ
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Cho phép users xóa avatar của chính họ
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Comment giải thích
COMMENT ON POLICY "Anyone can view avatars" ON storage.objects IS 
'Public read access cho avatars';

COMMENT ON POLICY "Users can upload their own avatar" ON storage.objects IS 
'Users chỉ có thể upload avatar vào folder có tên = user ID của họ';

-- =============================================
-- Helper Function: Get Avatar URL
-- =============================================

-- Function để lấy full URL của avatar
CREATE OR REPLACE FUNCTION public.get_avatar_url(avatar_path TEXT)
RETURNS TEXT AS $$
BEGIN
  IF avatar_path IS NULL OR avatar_path = '' THEN
    RETURN NULL;
  END IF;
  
  -- Trả về full URL từ Supabase Storage
  -- Format: https://{project_ref}.supabase.co/storage/v1/object/public/avatars/{path}
  RETURN avatar_path;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- Update handle_new_user để hỗ trợ avatar từ OAuth
-- =============================================

-- Cập nhật function để lưu avatar từ OAuth providers (Google, Facebook, etc.)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := NEW.raw_user_meta_data->>'role';
  
  IF user_role IS NULL OR user_role NOT IN ('worker', 'employer') THEN
    RAISE EXCEPTION 'Role is required and must be either worker or employer. Got: %', user_role;
  END IF;

  INSERT INTO public.users (id, email, role, phone, preferred_language, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    user_role,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'vi'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Lấy avatar từ OAuth provider nếu có
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    preferred_language = EXCLUDED.preferred_language,
    full_name = EXCLUDED.full_name,
    -- Chỉ update avatar nếu chưa có
    avatar_url = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DONE!
-- =============================================
-- 
-- Sau khi chạy migration này:
-- 1. Bucket 'avatars' đã được tạo và public
-- 2. Users có thể upload/update/delete avatar của mình
-- 3. Avatar URLs format: avatars/{user_id}/{filename}
-- 4. OAuth avatars sẽ được lưu tự động
--

