# Hướng Dẫn Sửa Lỗi "Không Vào Được /vi/admin"

## Các Bước Kiểm Tra và Sửa Lỗi

### Bước 1: Kiểm tra Development Server
```bash
# Nếu server chưa chạy, start nó:
npm run dev
# hoặc
yarn dev
```

### Bước 2: Chạy Database Migrations
**QUAN TRỌNG**: Bạn cần chạy migrations trên Supabase Dashboard

1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy và chạy 2 file migrations sau **THEO THỨ TỰ**:

#### Migration 1: `009_create_admin_settings.sql`
```sql
-- Paste toàn bộ nội dung file supabase/migrations/009_create_admin_settings.sql vào đây và chạy
```

#### Migration 2: `010_add_admin_role.sql`
```sql
-- Paste toàn bộ nội dung file supabase/migrations/010_add_admin_role.sql vào đây và chạy
```

### Bước 3: Tạo Tài Khoản Admin

#### Option 1: Tạo tài khoản mới và set admin role
```sql
-- Chạy trong Supabase SQL Editor

-- Tìm user ID của bạn (thay email của bạn vào đây)
SELECT id, email, role FROM public.users WHERE email = 'your-email@example.com';

-- Update role thành admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, role FROM public.users WHERE email = 'your-email@example.com';
```

#### Option 2: Nếu chưa có tài khoản
1. Truy cập `/vi/register`
2. Đăng ký tài khoản mới
3. Sau đó chạy SQL ở Option 1 để set role admin

### Bước 4: Test Lại
1. Logout nếu đang login
2. Login lại với tài khoản đã được set admin
3. Truy cập `/vi/admin`
4. Bạn sẽ thấy trang Admin Panel

## Debug - Kiểm tra User Role

Thêm code này vào `app/[locale]/admin/page.tsx` để debug (tạm thời):

```typescript
// Thêm vào sau dòng 41 trong function checkAuth()
console.log('Current user:', userData);
console.log('User role:', userData?.role);
console.log('Is admin?', userData?.role === 'admin');
```

Sau đó mở Developer Console (F12) và xem logs.

## Common Issues

### Issue 1: "Cannot GET /vi/admin"
**Nguyên nhân**: Development server chưa chạy hoặc chưa restart
**Giải pháp**:
```bash
# Stop server (Ctrl+C) và restart
npm run dev
```

### Issue 2: Redirect về trang chủ
**Nguyên nhân**: User không có role admin
**Giải pháp**: Chạy lại Bước 3 để set admin role

### Issue 3: "Database error"
**Nguyên nhân**: Migrations chưa chạy
**Giải pháp**: Chạy lại Bước 2

### Issue 4: Blank page / Loading forever
**Nguyên nhân**: Supabase credentials chưa đúng
**Giải pháp**: Kiểm tra file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Quick Fix Script

Tạo file `scripts/create-admin.sql` với nội dung:

```sql
-- Thay 'YOUR_EMAIL_HERE' bằng email của bạn
DO $$
DECLARE
    user_email TEXT := 'YOUR_EMAIL_HERE';
BEGIN
    -- Check if user exists
    IF EXISTS (SELECT 1 FROM public.users WHERE email = user_email) THEN
        -- Update to admin
        UPDATE public.users SET role = 'admin' WHERE email = user_email;
        RAISE NOTICE 'User % is now an admin', user_email;
    ELSE
        RAISE EXCEPTION 'User with email % not found. Please register first.', user_email;
    END IF;
END $$;

-- Verify
SELECT id, email, role, created_at
FROM public.users
WHERE role = 'admin';
```

Chạy script này trong Supabase SQL Editor.
