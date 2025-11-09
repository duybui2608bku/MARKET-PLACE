# Admin Panel Guide / Hướng Dẫn Quản Trị

## English

### Overview
The Admin Panel allows administrators to manage website settings, SEO, branding, header, footer, contact information, and social media links.

### Accessing the Admin Panel
1. You must have an account with `admin` role in the database
2. Login to your admin account
3. Click on your avatar in the header
4. Select "Admin Panel" from the dropdown menu
5. Or navigate directly to `/[locale]/admin` (e.g., `/vi/admin`, `/en/admin`)

### Creating an Admin User

To create an admin user, you need to update the database directly:

```sql
-- First, create a user account normally through the registration page
-- Then update the user role to 'admin' in Supabase

UPDATE public.users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

**Important:** Make sure to run the database migrations first:
```bash
# The migrations should be applied to your Supabase database
# Files are in: supabase/migrations/
# - 009_create_admin_settings.sql
# - 010_add_admin_role.sql
```

### Admin Panel Features

#### 1. SEO Settings
- **Site Title**: The title that appears in browser tabs and search results
- **Site Description**: Meta description for search engines
- **Site Keywords**: Comma-separated keywords for SEO
- **OG Image URL**: Social media preview image

#### 2. Logo & Branding
- **Logo URL**: URL to your logo image
- **Logo Text**: Text alternative if no logo image
- **Favicon URL**: Browser tab icon

#### 3. Header Settings
- **Header Background Color**: Custom background color (hex code)
- **Header Text Color**: Custom text color (hex code)
- **Show Language Switcher**: Toggle language selection dropdown
- **Show Theme Toggle**: Toggle dark/light mode button

#### 4. Footer Settings
- **Enable Footer**: Show/hide footer globally
- **Footer Copyright Text**: Custom copyright message
- **Footer Background Color**: Custom background color
- **Terms of Service URL**: Link to terms page
- **Privacy Policy URL**: Link to privacy page

#### 5. Contact Information
- **Contact Email**: Display email in footer
- **Contact Phone**: Display phone number in footer
- **Contact Address**: Display physical address in footer

#### 6. Social Media Links
Add links to your social media profiles:
- Facebook
- Twitter
- Instagram
- LinkedIn
- YouTube

### How Settings Work

1. **Default Values**: If settings are not configured, the system uses default values
2. **Real-time Updates**: Changes are applied immediately after saving
3. **Multi-language Support**: All labels and UI text support 4 languages (Vietnamese, English, Chinese, Korean)
4. **SEO Integration**: SEO settings automatically update meta tags on all pages

---

## Tiếng Việt

### Tổng Quan
Trang Quản Trị cho phép quản trị viên quản lý cài đặt website, SEO, thương hiệu, header, footer, thông tin liên hệ và liên kết mạng xã hội.

### Truy Cập Trang Quản Trị
1. Bạn phải có tài khoản với role `admin` trong database
2. Đăng nhập vào tài khoản admin của bạn
3. Nhấp vào avatar trong header
4. Chọn "Quản Trị" từ menu thả xuống
5. Hoặc truy cập trực tiếp `/[locale]/admin` (ví dụ: `/vi/admin`, `/en/admin`)

### Tạo Tài Khoản Admin

Để tạo tài khoản admin, bạn cần cập nhật database trực tiếp:

```sql
-- Đầu tiên, tạo tài khoản user bình thường qua trang đăng ký
-- Sau đó cập nhật role thành 'admin' trong Supabase

UPDATE public.users
SET role = 'admin'
WHERE email = 'email-admin-cua-ban@example.com';
```

**Quan trọng:** Đảm bảo chạy các migration database trước:
```bash
# Các migration cần được áp dụng vào Supabase database của bạn
# Các file nằm ở: supabase/migrations/
# - 009_create_admin_settings.sql
# - 010_add_admin_role.sql
```

### Tính Năng Trang Quản Trị

#### 1. Cài Đặt SEO
- **Tiêu Đề Trang**: Tiêu đề xuất hiện trên tab trình duyệt và kết quả tìm kiếm
- **Mô Tả Trang**: Meta description cho công cụ tìm kiếm
- **Từ Khóa Trang**: Các từ khóa phân cách bằng dấu phẩy cho SEO
- **URL Ảnh OG**: Ảnh preview trên mạng xã hội

#### 2. Logo & Thương Hiệu
- **URL Logo**: URL đến hình ảnh logo của bạn
- **Văn Bản Logo**: Văn bản thay thế nếu không có ảnh logo
- **URL Favicon**: Icon trên tab trình duyệt

#### 3. Cài Đặt Header
- **Màu Nền Header**: Màu nền tùy chỉnh (mã hex)
- **Màu Chữ Header**: Màu chữ tùy chỉnh (mã hex)
- **Hiển Thị Chuyển Đổi Ngôn Ngữ**: Bật/tắt menu chọn ngôn ngữ
- **Hiển Thị Chuyển Đổi Giao Diện**: Bật/tắt nút chế độ sáng/tối

#### 4. Cài Đặt Footer
- **Bật Footer**: Hiện/ẩn footer trên toàn bộ trang
- **Văn Bản Bản Quyền Footer**: Thông báo bản quyền tùy chỉnh
- **Màu Nền Footer**: Màu nền tùy chỉnh
- **URL Điều Khoản Dịch Vụ**: Link đến trang điều khoản
- **URL Chính Sách Bảo Mật**: Link đến trang chính sách

#### 5. Thông Tin Liên Hệ
- **Email Liên Hệ**: Hiển thị email trong footer
- **Điện Thoại Liên Hệ**: Hiển thị số điện thoại trong footer
- **Địa Chỉ Liên Hệ**: Hiển thị địa chỉ vật lý trong footer

#### 6. Liên Kết Mạng Xã Hội
Thêm link đến các trang mạng xã hội của bạn:
- Facebook
- Twitter
- Instagram
- LinkedIn
- YouTube

### Cách Hoạt Động Của Cài Đặt

1. **Giá Trị Mặc Định**: Nếu chưa cấu hình, hệ thống sử dụng giá trị mặc định
2. **Cập Nhật Thời Gian Thực**: Thay đổi được áp dụng ngay sau khi lưu
3. **Hỗ Trợ Đa Ngôn Ngữ**: Tất cả label và text UI hỗ trợ 4 ngôn ngữ (Tiếng Việt, Tiếng Anh, Tiếng Trung, Tiếng Hàn)
4. **Tích Hợp SEO**: Cài đặt SEO tự động cập nhật meta tag trên tất cả các trang

---

## Technical Details

### Files Created

**Database Migrations:**
- `supabase/migrations/009_create_admin_settings.sql` - Admin settings table
- `supabase/migrations/010_add_admin_role.sql` - Add admin role to users

**Backend:**
- `lib/admin-settings.ts` - Admin settings functions
- `app/api/admin/settings/route.ts` - API endpoints (GET, POST, PATCH)

**Frontend:**
- `app/[locale]/admin/page.tsx` - Admin panel UI
- `components/Footer.tsx` - Footer component with dynamic settings

**Translations:**
- `messages/vi.json` - Vietnamese translations
- `messages/en.json` - English translations
- `messages/zh.json` - Chinese translations
- `messages/ko.json` - Korean translations

### API Endpoints

**GET `/api/admin/settings`**
- Public endpoint
- Returns current admin settings
- No authentication required

**POST `/api/admin/settings`**
- Protected endpoint (admin only)
- Updates admin settings
- Requires admin authentication

**PATCH `/api/admin/settings`**
- Protected endpoint (admin only)
- Partial update of settings
- Returns updated settings
- Requires admin authentication

### Security

- Only users with `role = 'admin'` can update settings
- Settings are readable by everyone (for public display)
- Row Level Security (RLS) policies enforce access control
- Authentication is verified on every API request

### Database Schema

```sql
admin_settings (
  id UUID PRIMARY KEY,
  site_title VARCHAR(200),
  site_description TEXT,
  site_keywords TEXT,
  og_image_url TEXT,
  logo_url TEXT,
  logo_text VARCHAR(100),
  favicon_url TEXT,
  header_bg_color VARCHAR(50),
  header_text_color VARCHAR(50),
  show_language_switcher BOOLEAN DEFAULT true,
  show_theme_toggle BOOLEAN DEFAULT true,
  footer_enabled BOOLEAN DEFAULT true,
  footer_text TEXT,
  footer_bg_color VARCHAR(50),
  footer_text_color VARCHAR(50),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  social_facebook VARCHAR(255),
  social_twitter VARCHAR(255),
  social_instagram VARCHAR(255),
  social_linkedin VARCHAR(255),
  social_youtube VARCHAR(255),
  terms_url TEXT,
  privacy_url TEXT,
  about_url TEXT,
  custom_footer_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
)
```
