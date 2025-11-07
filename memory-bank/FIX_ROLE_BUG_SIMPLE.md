# 🛠️ Hướng Dẫn Fix Role Bug - ĐƠN GIẢN NHẤT

## 🎯 Vấn đề
User chọn **"Worker"** nhưng bị lưu thành **"Employer"** trong database.

---

## ✅ CÁCH FIX - CHỈ 3 BƯỚC

### Bước 1️⃣: Mở Supabase Dashboard

1. Vào: https://app.supabase.com
2. Chọn project của bạn
3. Click **"SQL Editor"** (biểu tượng database bên trái)
4. Click **"New Query"**

---

### Bước 2️⃣: Fix Database Trigger

**Copy đoạn SQL này và Paste vào SQL Editor:**

```sql
-- FIX DATABASE TRIGGER
-- Copy toàn bộ đoạn này và click "Run"

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Bắt buộc phải có role
  IF user_role IS NULL OR user_role NOT IN ('worker', 'employer') THEN
    RAISE EXCEPTION 'Role is required and must be worker or employer';
  END IF;

  -- Insert user với role từ metadata
  INSERT INTO public.users (id, email, role, phone, preferred_language, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    user_role,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'vi'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Sau khi paste xong, click nút "Run" ở góc phải dưới.**

✅ Thấy "Success" là được!

---

### Bước 3️⃣: Fix Users Đã Bị Sai (Nếu có)

**Tạo New Query mới và copy đoạn này:**

```sql
-- FIX USERS ĐÃ BỊ SAI ROLE
-- Copy toàn bộ và click "Run"

-- Sửa role từ metadata
UPDATE public.users u
SET role = au.raw_user_meta_data->>'role',
    updated_at = NOW()
FROM auth.users au
WHERE u.id = au.id 
  AND au.raw_user_meta_data->>'role' IS NOT NULL
  AND u.role != au.raw_user_meta_data->>'role';

-- Xóa profiles sai
DELETE FROM public.worker_profiles
WHERE id IN (SELECT id FROM public.users WHERE role = 'employer');

DELETE FROM public.employer_profiles
WHERE id IN (SELECT id FROM public.users WHERE role = 'worker');

-- Tạo profiles đúng
INSERT INTO public.worker_profiles (id)
SELECT u.id FROM public.users u
LEFT JOIN public.worker_profiles wp ON u.id = wp.id
WHERE u.role = 'worker' AND wp.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.employer_profiles (id)
SELECT u.id FROM public.users u
LEFT JOIN public.employer_profiles ep ON u.id = ep.id
WHERE u.role = 'employer' AND ep.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Kiểm tra kết quả
SELECT 
  email,
  role,
  CASE WHEN EXISTS(SELECT 1 FROM worker_profiles WHERE id = u.id) THEN '✅ Có' ELSE '❌ Không' END as worker_profile,
  CASE WHEN EXISTS(SELECT 1 FROM employer_profiles WHERE id = u.id) THEN '✅ Có' ELSE '❌ Không' END as employer_profile
FROM public.users u
ORDER BY created_at DESC
LIMIT 10;
```

**Click "Run"**

---

## 🧪 Test Xem Đã Fix Chưa

### Test 1: Đăng ký Worker mới

1. Mở browser ẩn danh (Incognito/Private)
2. Vào: `http://localhost:3000/vi/register`
3. Click card **"Tài khoản Người lao động"** (màu xanh)
4. Đăng ký với Google
5. Sau khi đăng ký xong, vào: `http://localhost:3000/vi/debug-role`

**Kết quả đúng:**
- ✅ Role in DB: **worker**
- ✅ Worker Profile: **EXISTS**
- ❌ Employer Profile: **No employer profile**

### Test 2: Kiểm tra trong Database

```sql
-- Xem user vừa tạo
SELECT email, role, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 1;
```

**Kết quả đúng:** role phải là `worker` (không phải `employer`)

---

## ✅ Xong!

Sau khi làm 3 bước trên:
- ✅ Database trigger đã fix
- ✅ Users cũ đã được sửa
- ✅ Đăng ký mới sẽ đúng role

---

## ❓ Nếu Gặp Lỗi

1. Check console logs (F12 > Console)
2. Check Supabase logs (Dashboard > Logs)
3. Chụp màn hình và báo lỗi

---

**Tạo ngày:** 6 Nov 2025  
**Version:** SIMPLE 1.0

