# Supabase Database Setup

## 📋 Hướng dẫn Setup Database

### Bước 1: Chạy Migration

Có 3 cách để chạy migration:

#### **Cách 1: Sử dụng Supabase Dashboard (RECOMMENDED) ⭐**

1. Truy cập [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** (icon database bên trái)
4. Click **New Query**
5. Copy toàn bộ nội dung file `migrations/001_create_users_table.sql`
6. Paste vào editor
7. Click **Run** hoặc nhấn `Ctrl+Enter`
8. ✅ Xong! Kiểm tra table `users` đã được tạo

#### **Cách 2: Sử dụng Supabase CLI**

```bash
# Install Supabase CLI nếu chưa có
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Chạy migration
supabase db push
```

#### **Cách 3: Copy-paste SQL trực tiếp**

Nếu không có CLI, bạn có thể:

1. Mở file `migrations/001_create_users_table.sql`
2. Copy toàn bộ nội dung
3. Vào Supabase Dashboard > SQL Editor
4. Paste và Run

---

## 🎯 Migration đã làm gì?

### 1. **Tạo bảng `users`**

```sql
id              | UUID (Primary Key, references auth.users)
email           | TEXT (NOT NULL)
role            | TEXT (worker hoặc employer)
phone           | TEXT (optional)
preferred_language | TEXT (vi, en, zh, ko)
full_name       | TEXT
avatar_url      | TEXT
created_at      | TIMESTAMPTZ
updated_at      | TIMESTAMPTZ
```

### 2. **Tạo Database Trigger**

- Tự động tạo user record trong `public.users` khi có user mới đăng ký
- Đọc `role`, `phone`, `preferred_language` từ `user_metadata`
- Trigger chạy **SAU KHI** user được tạo trong `auth.users`

### 3. **Setup Row Level Security (RLS)**

- ✅ User có thể xem và update profile của chính họ
- ✅ Public có thể xem profile của mọi người (cần cho marketplace)
- ✅ Service role có full access

### 4. **Tạo Views**

- `public.workers` - Chỉ hiện workers
- `public.employers` - Chỉ hiện employers

---

## 🧪 Test Migration

Sau khi chạy migration, test bằng cách:

### **Test 1: Kiểm tra bảng đã tạo**

```sql
-- Chạy trong SQL Editor
SELECT * FROM public.users LIMIT 5;
```

### **Test 2: Kiểm tra trigger function**

```sql
-- Xem trigger có active không
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### **Test 3: Đăng ký user thử**

1. Vào trang `/register`
2. Chọn role (Worker hoặc Employer)
3. Đăng ký với email/password
4. Check trong Dashboard > Authentication > Users
5. Check trong Dashboard > Table Editor > users
6. ✅ Phải thấy user mới với role đúng

---

## 🔧 Cấu trúc Flow

```
User đăng ký
    ↓
Supabase Auth tạo record trong auth.users
    ↓
Trigger "on_auth_user_created" được kích hoạt
    ↓
Function "handle_new_user()" chạy
    ↓
Insert record vào public.users với:
  - id = auth.users.id
  - email = auth.users.email
  - role = user_metadata.role
  - phone = user_metadata.phone
  - preferred_language = user_metadata.preferred_language
    ↓
✅ User có profile đầy đủ
```

---

## 🐛 Troubleshooting

### **Lỗi: Function already exists**

```sql
-- Xóa function cũ và chạy lại
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

### **Lỗi: Table already exists**

```sql
-- Check bảng hiện tại
SELECT * FROM public.users LIMIT 1;

-- Nếu muốn xóa và tạo lại (⚠️ MẤT DATA)
DROP TABLE IF EXISTS public.users CASCADE;
```

### **Trigger không chạy**

```sql
-- Check trigger status
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### **User đăng ký nhưng không có trong bảng users**

1. Check log trong Supabase Dashboard > Logs
2. Check user metadata có role không:

```sql
SELECT raw_user_meta_data FROM auth.users WHERE email = 'test@example.com';
```

3. Nếu không có role, đăng ký lại hoặc update metadata

---

## 📊 Queries hữu ích

### **Đếm số workers và employers**

```sql
SELECT
  role,
  COUNT(*) as count
FROM public.users
GROUP BY role;
```

### **Xem users mới nhất**

```sql
SELECT
  email,
  role,
  phone,
  preferred_language,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
```

### **Xem user metadata**

```sql
SELECT
  u.email,
  u.role as profile_role,
  au.raw_user_meta_data->>'role' as metadata_role,
  au.raw_user_meta_data
FROM public.users u
JOIN auth.users au ON u.id = au.id
LIMIT 5;
```

---

## 🚀 Next Steps

Sau khi migration xong:

1. ✅ Test đăng ký user mới
2. ✅ Verify user có trong bảng `users`
3. ✅ Check role được lưu đúng
4. 🔜 Tạo worker_profiles table
5. 🔜 Tạo employer_profiles table
6. 🔜 Tạo services table

---

## 🐛 Bug Fixes & Updates

### Migration 003: Fix Default Role Issue (November 5, 2025)

**⚠️ CRITICAL BUG FIX**

**Vấn đề:** User chọn "Worker" nhưng bị lưu thành "Employer" trong database.

**Nguyên nhân:** Database trigger có default value `'employer'`:

```sql
COALESCE(NEW.raw_user_meta_data->>'role', 'employer')
```

**Giải pháp:**

- ✅ Migration `003_fix_default_role.sql` - Removes default, adds validation
- ✅ Script `fix_wrong_roles.sql` - Fixes existing users with wrong roles
- ✅ Documentation `FIX_ROLE_BUG.md` - Detailed fix instructions

**Cách chạy fix:**

```bash
# Option 1: CLI
supabase db push

# Option 2: Dashboard
# Copy migrations/003_fix_default_role.sql to SQL Editor and Run
```

**Sau khi chạy migration, nếu có users đã bị lỗi:**

```bash
# Chạy fix script trong SQL Editor
# Copy fix_wrong_roles.sql và Run
```

**Xem chi tiết:** `FIX_ROLE_BUG.md`

---

## 📚 Available Migrations

1. **001_create_users_table.sql** - Creates users table and auto-insert trigger
2. **002_create_profiles_tables.sql** - Creates worker and employer profile tables
3. **003_fix_default_role.sql** - 🐛 Fixes default role = 'employer' issue

---

**Người tạo:** AI Assistant  
**Ngày tạo:** November 5, 2025  
**Cập nhật:** November 5, 2025  
**Migration Version:** 003
