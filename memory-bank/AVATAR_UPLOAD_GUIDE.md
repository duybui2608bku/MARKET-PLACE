# 🖼️ Hướng Dẫn Upload Avatar - HOÀN THÀNH

## ✅ Đã Hoàn Thành

Tính năng upload avatar đã được thêm vào hệ thống với các chức năng:

1. ✅ **Supabase Storage Bucket** - Lưu trữ avatars
2. ✅ **Component AvatarUpload** - Upload với preview
3. ✅ **API Route** - Xử lý upload server-side
4. ✅ **Header Avatar** - Hiển thị avatar trong header
5. ✅ **Profile Pages** - Upload avatar trong trang profile

---

## 📋 Bước 1: Chạy Migration (BẮT BUỘC!)

**Trước khi sử dụng, phải chạy migration để tạo Storage bucket:**

### Option A: Supabase Dashboard

1. Mở https://app.supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy nội dung file: `supabase/migrations/004_setup_storage_avatars.sql`
5. Paste vào SQL Editor
6. Click **Run**

### Option B: Supabase CLI

```bash
cd E:\MARKET-PLACE
supabase db push
```

**Migration này sẽ:**
- ✅ Tạo bucket `avatars` (public)
- ✅ Setup storage policies (upload/update/delete chỉ avatar của mình)
- ✅ Cập nhật trigger để hỗ trợ OAuth avatars

---

## 🎨 Cách Sử Dụng

### 1. Upload Avatar trong Profile

**Worker Profile:** `/{locale}/profile/worker`
**Employer Profile:** `/{locale}/profile/employer`

**Các cách upload:**
- 🖱️ **Click vào avatar** → Chọn file
- 📁 **Click nút "Tải ảnh lên"** → Chọn file
- 🖱️ **Drag & Drop** → Kéo ảnh vào avatar

**Yêu cầu:**
- ✅ File type: JPG, PNG, GIF
- ✅ Max size: 5MB
- ✅ Tự động resize và crop

### 2. Xem Avatar

Avatar sẽ hiển thị ở:
- ✅ **Header** (góc phải trên)
- ✅ **Profile Page** (to hơn)
- ✅ **User Menu Dropdown**

---

## 🏗️ Cấu Trúc Files

```
E:\MARKET-PLACE\
│
├── supabase/
│   └── migrations/
│       └── 004_setup_storage_avatars.sql  # Migration setup storage
│
├── components/
│   └── AvatarUpload.tsx                    # Component upload avatar
│
├── app/
│   ├── api/
│   │   └── upload-avatar/
│   │       └── route.ts                    # API endpoint upload
│   │
│   └── [locale]/
│       └── profile/
│           ├── worker/page.tsx             # Có AvatarUpload
│           └── employer/page.tsx           # Có AvatarUpload
│
└── lib/
    └── users.ts                            # Có updateCurrentUserProfile()
```

---

## 🔧 Component API

### AvatarUpload Props

```typescript
interface AvatarUploadProps {
  currentAvatarUrl?: string | null;      // URL avatar hiện tại
  onUploadComplete: (avatarUrl: string) => void;  // Callback khi upload xong
  onUploadError?: (error: string) => void;        // Callback khi có lỗi
  size?: "sm" | "md" | "lg";              // Kích thước (default: "md")
}
```

### Sizes

- `sm`: 64px (w-16 h-16)
- `md`: 96px (w-24 h-24)  
- `lg`: 128px (w-32 h-32)

---

## 📡 API Endpoint

### POST /api/upload-avatar

**Headers:**
- Authorization: Bearer token (tự động)

**Body (FormData):**
- `file`: File ảnh

**Response:**
```json
{
  "success": true,
  "avatarUrl": "https://.../avatars/user_id/timestamp.jpg",
  "message": "Avatar uploaded successfully"
}
```

---

## 🗂️ Storage Structure

Avatars được lưu trong bucket `avatars`:

```
avatars/
├── {user_id_1}/
│   └── 1730880000000.jpg
├── {user_id_2}/
│   └── 1730881111111.png
└── ...
```

**Format URL:**
```
https://{project_ref}.supabase.co/storage/v1/object/public/avatars/{user_id}/{timestamp}.{ext}
```

---

## 🔒 Security

### Storage Policies

1. **Public Read** - Anyone có thể xem avatars
2. **Authenticated Upload** - Chỉ logged-in users có thể upload
3. **Own Files Only** - Users chỉ upload vào folder của mình
4. **Auto Delete Old** - Avatar cũ tự động xóa khi upload mới

### Validation

- ✅ File type check (image/*)
- ✅ File size limit (5MB)
- ✅ Authentication required
- ✅ User ownership check

---

## 🐛 Troubleshooting

### Lỗi: "Failed to upload file"

**Nguyên nhân:**
- Chưa chạy migration
- Storage bucket chưa được tạo

**Giải pháp:**
1. Chạy migration `004_setup_storage_avatars.sql`
2. Check Supabase Dashboard > Storage > Buckets
3. Verify bucket `avatars` exists và public = true

### Lỗi: "File size must be less than 5MB"

**Giải pháp:**
- Resize ảnh trước khi upload
- Sử dụng ảnh chất lượng thấp hơn
- Convert sang JPG (nhỏ hơn PNG)

### Lỗi: "Unauthorized"

**Nguyên nhân:**
- User chưa đăng nhập
- Session expired

**Giải pháp:**
- Đăng nhập lại
- Refresh page

### Avatar không hiển thị

**Kiểm tra:**
1. Mở Console (F12) → Network tab
2. Check request đến avatar URL
3. Verify URL format đúng
4. Check storage policies

---

## 🎯 Features Nâng Cao (Tương lai)

Có thể thêm:
- [ ] Image cropper tool
- [ ] Multiple image upload (gallery)
- [ ] Avatar từ URL
- [ ] Webcam capture
- [ ] Filters & effects
- [ ] Auto compress images

---

## ✅ Testing Checklist

- [x] Upload JPG avatar
- [x] Upload PNG avatar  
- [x] Upload GIF avatar
- [x] Drag & drop upload
- [x] File size validation
- [x] File type validation
- [x] Avatar hiển thị trong Header
- [x] Avatar hiển thị trong Profile
- [x] Replace avatar cũ
- [x] OAuth avatar preservation

---

## 📝 Notes

- Avatar URLs là permanent (không expire)
- Old avatars tự động bị xóa khi upload mới
- OAuth providers (Google, Facebook) avatars được preserve
- Component responsive trên mobile

---

**Ngày tạo:** 6 Nov 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready

