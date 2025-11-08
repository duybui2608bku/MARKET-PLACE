# Worker Profile Setup Flow - Implementation Guide

## Overview

A complete 3-step onboarding flow for workers to set up their profile after registration. The flow includes personal information, service selection with gallery upload, and pricing configuration with auto-calculated rates.

## Date Implemented
November 7, 2025

---

## Database Changes

### New Migrations

1. **`005_extend_worker_profiles.sql`** - Extends worker_profiles table with:
   - Personal info: age, height, weight, zodiac_sign, hobbies, lifestyle, favorite_quote, introduction
   - Service info: service_type, service_category, service_level, service_languages
   - Images: gallery_images[], service_images[]
   - Pricing: currency, hourly_rate, min_booking_hours, daily_rate, monthly_rate
   - Setup tracking: setup_step, setup_completed
   - Auto-calculation trigger for rates

2. **`006_setup_storage_galleries.sql`** - Creates storage buckets:
   - `galleries` bucket for personal photos (3-10 images)
   - `services` bucket for service illustration images
   - RLS policies for upload, read, update, delete

### Running Migrations

```bash
# Connect to your Supabase project
supabase db push

# Or run manually in Supabase SQL Editor
# Copy and execute 005_extend_worker_profiles.sql
# Copy and execute 006_setup_storage_galleries.sql
```

---

## Components Created

### 1. `MultiImageUpload.tsx`
Reusable component for uploading multiple images with:
- Drag & drop support
- Image preview
- Progress indicator
- Validation (file type, size)
- Auto-cleanup on remove
- Configurable min/max images

**Usage:**
```tsx
<MultiImageUpload
  bucket="galleries"
  images={images}
  onImagesChange={(urls) => setImages(urls)}
  minImages={3}
  maxImages={10}
  label="Upload gallery ảnh cá nhân"
  description="Upload 3-10 ảnh minh họa"
/>
```

### 2. `worker-onboarding/page.tsx`
Main onboarding page with 3 steps:
- Step 1: Personal Information
- Step 2: Service Selection & Gallery
- Step 3: Pricing Setup

---

## Flow Description

### Step 1: Personal Information

**Fields:**
- Avatar upload (using existing AvatarUpload component)
- Full name* (required)
- Age* (18-100, required)
- Height (100-250 cm, optional)
- Weight (30-300 kg, optional)
- Zodiac sign (dropdown, optional)
- Hobbies (tag input, optional)
- Lifestyle (textarea, optional)
- Favorite quote (text, optional)
- Introduction (textarea, optional)
- Skills (tag input, optional)
- Experience (textarea, optional)
- Availability status (toggle: Sẵn sàng / Tạm khóa)

**Validation:**
- Full name and age are required
- Age must be between 18-100
- Height must be between 100-250 cm
- Weight must be between 30-300 kg

**Database Tables Updated:**
- `users`: full_name
- `worker_profiles`: age, height, weight, zodiac_sign, hobbies, lifestyle, favorite_quote, introduction, skills, bio (experience), available, setup_step

---

### Step 2: Service Selection & Gallery Upload

**Fields:**

1. **Gallery Upload* (required)**
   - 3-10 personal photos
   - Stored in `galleries` bucket
   - Drag & drop or click to upload
   - Max 5MB per image
   - Formats: JPG, PNG, WebP

2. **Service Type* (required)**
   - Assistance (Hỗ trợ)
   - Companionship (Đồng hành)

3. **If Assistance Selected:**
   - **Category* (required):**
     - Personal Assist (Hỗ trợ cá nhân)
     - Professional On-site Assist (Hỗ trợ chuyên nghiệp tại chỗ)
     - Virtual Assist (Hỗ trợ từ xa)
     - Tour Guide (Hướng dẫn viên du lịch)
     - Translator (Phiên dịch)
   
   - **If Translator:**
     - Languages (tag input): Add languages you can translate

4. **If Companionship Selected:**
   - **Level* (required):**
     - Level 1: Không tiếp xúc cơ thể, không yêu cầu trò chuyện trí tuệ, trang phục thường ngày
     - Level 2: Không tiếp xúc cơ thể, có trò chuyện trí tuệ, trang phục bán trang trọng
     - Level 3: Có tiếp xúc cơ thể (không thân mật), có trò chuyện trí tuệ, trang phục trang trọng

**Validation:**
- At least 3 gallery images required
- Service type must be selected
- If assistance: category must be selected
- If companionship: level must be selected

**Database Tables Updated:**
- `worker_profiles`: gallery_images, service_type, service_category, service_level, service_languages, setup_step

---

### Step 3: Pricing Setup

**Fields:**

1. **Currency* (required)**
   - USD - US Dollar ($)
   - VND - Vietnamese Dong (₫)
   - EUR - Euro (€)
   - JPY - Japanese Yen (¥)
   - KRW - Korean Won (₩)
   - CNY - Chinese Yuan (¥)

2. **Hourly Rate* (required)**
   - Decimal input
   - Must be greater than 0

3. **Minimum Booking Hours* (required)**
   - Dropdown: 2, 3, 4, 5, 6, 8 hours

4. **Auto-Calculated Rates (read-only)**
   - Daily Rate = Hourly Rate × 8
   - Monthly Rate = Hourly Rate × 160

5. **Service Images (optional)**
   - 0-5 images
   - Stored in `services` bucket

**Validation:**
- Hourly rate must be greater than 0
- Minimum booking hours must be selected

**Database Tables Updated:**
- `worker_profiles`: currency, hourly_rate, min_booking_hours, service_images, setup_step, setup_completed

**Important Note:**
The pricing info box shows: "Lưu ý: Khách hàng đặt nhiều dịch vụ sẽ được tính theo giá cao nhất của bạn."

---

## User Experience Flow

### 1. New Worker Registration

**Email Registration:**
```
User selects "Worker" → Fills registration form → Submit
→ Success message → Auto-redirect to /worker-onboarding (after 2s)
```

**OAuth Registration (Google):**
```
User selects "Worker" → Click "Continue with Google" → OAuth flow
→ Auth callback checks role → New worker → Redirect to /worker-onboarding
```

### 2. Existing Worker Login

```
Worker logs in → Auth callback checks setup_completed
→ If false: Redirect to /worker-onboarding
→ If true: Redirect to home
```

### 3. Onboarding Flow

```
Step 1 (Personal Info) → Fill form → Click "Tiếp theo"
→ Save to DB, set setup_step = 2

Step 2 (Service & Gallery) → Upload images, select service → Click "Tiếp theo"
→ Save to DB, set setup_step = 3

Step 3 (Pricing) → Set rates → Click "Hoàn tất"
→ Save to DB, set setup_step = 4, setup_completed = true
→ Redirect to /profile/worker
```

### 4. Progress Indicator

- Shows current step: 1/3, 2/3, 3/3
- Displays completion percentage: 33%, 67%, 100%
- Visual progress bar with colored dots
- Step labels: Personal Info, Service, Rates

---

## File Structure

```
app/
  [locale]/
    (auth)/
      worker-onboarding/
        page.tsx          # Main onboarding page (3 steps)
      register/
        page.tsx          # Updated: redirect workers to onboarding
      auth-callback/
        page.tsx          # Updated: check setup_completed

components/
  MultiImageUpload.tsx    # Multi-image upload component
  AvatarUpload.tsx        # Existing: used in step 1

supabase/
  migrations/
    005_extend_worker_profiles.sql    # New fields + trigger
    006_setup_storage_galleries.sql   # Storage buckets + policies
```

---

## Key Features

### Progress Persistence
- Each step saves to database immediately
- `setup_step` tracks current progress (0-4)
- Users can resume from where they left off
- No data loss on browser close/refresh

### Image Management
- Automatic file cleanup on delete
- Unique file names: `{user_id}/{timestamp}-{random}.{ext}`
- RLS policies ensure users can only manage their own images
- Public read access for gallery display

### Rate Auto-Calculation
- Database trigger automatically calculates daily/monthly rates
- Trigger runs on INSERT or UPDATE of hourly_rate
- Formula:
  - daily_rate = hourly_rate × 8
  - monthly_rate = hourly_rate × 160

### Form Validation
- Client-side validation before submission
- Server-side validation in database (check constraints)
- Clear error messages
- Required fields marked with *

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly controls
- Optimized image previews

---

## Testing Checklist

### Step 1: Personal Info
- [ ] Can upload avatar
- [ ] Required fields (name, age) enforce validation
- [ ] Can add/remove hobbies
- [ ] Can add/remove skills
- [ ] Availability toggle works
- [ ] Form saves to database
- [ ] Redirects to step 2

### Step 2: Service & Gallery
- [ ] Can upload 3-10 gallery images
- [ ] Can delete gallery images
- [ ] Service type selection works
- [ ] Assistance categories show when type is assistance
- [ ] Companionship levels show when type is companionship
- [ ] Translator languages work for translator category
- [ ] Validation prevents < 3 images
- [ ] Form saves to database
- [ ] Back button returns to step 1
- [ ] Next button goes to step 3

### Step 3: Pricing
- [ ] Currency selector works
- [ ] Hourly rate input accepts decimals
- [ ] Min booking hours selector works
- [ ] Daily rate auto-calculates correctly
- [ ] Monthly rate auto-calculates correctly
- [ ] Can upload 0-5 service images
- [ ] Back button returns to step 2
- [ ] Complete button saves and redirects
- [ ] Redirects to /profile/worker

### Integration
- [ ] New worker email registration redirects to onboarding
- [ ] New worker OAuth registration redirects to onboarding
- [ ] Existing worker with incomplete setup redirects to onboarding
- [ ] Existing worker with complete setup goes to home
- [ ] Can access /worker-onboarding directly if incomplete
- [ ] Cannot access /worker-onboarding if already completed (redirects to profile)

---

## Database Schema Reference

### worker_profiles (New/Updated Fields)

```sql
-- Personal Information
age INTEGER,                    -- 18-100
height INTEGER,                 -- 100-250 cm
weight DECIMAL(5, 2),          -- 30-300 kg
zodiac_sign TEXT,              -- Aries, Taurus, etc.
hobbies TEXT[],                -- Array of hobbies
lifestyle TEXT,                -- Lifestyle description
favorite_quote TEXT,           -- Favorite quote
introduction TEXT,             -- Self introduction

-- Service Information
service_type TEXT,             -- 'assistance' or 'companionship'
service_category TEXT,         -- Specific category (for assistance)
service_level INTEGER,         -- 1, 2, or 3 (for companionship)
service_languages TEXT[],      -- Languages (for translator)

-- Images
gallery_images TEXT[],         -- 3-10 personal photos
service_images TEXT[],         -- 0-5 service images

-- Pricing
currency TEXT DEFAULT 'VND',   -- USD, VND, EUR, JPY, KRW, CNY
hourly_rate DECIMAL(10, 2),    -- User-defined
min_booking_hours INTEGER DEFAULT 2,
daily_rate DECIMAL(10, 2),     -- Auto-calculated: hourly × 8
monthly_rate DECIMAL(10, 2),   -- Auto-calculated: hourly × 160

-- Setup Tracking
setup_step INTEGER DEFAULT 0,  -- 0-4
setup_completed BOOLEAN DEFAULT false
```

---

## API Endpoints

### Image Upload
- Upload handled by Supabase Storage SDK
- No custom API endpoints needed
- Uses existing storage policies

### Profile Update
- Direct Supabase client calls from frontend
- RLS policies ensure security
- Auto-triggers calculate rates

---

## Security

### Row Level Security (RLS)
- Users can only update their own profile
- Users can only upload images to their own folder
- Public read access for gallery images
- Service role has full access

### Image Upload Validation
- File type: JPG, PNG, WebP only
- File size: Max 5MB per image
- Path format enforces user isolation
- RLS policies prevent unauthorized access

### Form Validation
- Client-side: immediate feedback
- Server-side: database constraints
- Type checking: TypeScript
- SQL constraints: age, height, weight, service_level, currency

---

## Troubleshooting

### Images not uploading?
1. Check Supabase Storage is enabled
2. Verify buckets exist: `galleries`, `services`
3. Check storage policies are applied
4. Verify user is authenticated
5. Check browser console for errors

### Step progress not saving?
1. Check database connection
2. Verify RLS policies allow UPDATE
3. Check user is authenticated
3. Look for SQL errors in logs

### Rates not calculating?
1. Verify trigger `calculate_worker_rates()` exists
2. Check trigger is attached to table
3. Ensure hourly_rate is valid number
4. Check database logs for errors

### Redirect not working?
1. Verify locale is correct
2. Check router.push() calls
3. Ensure setup_completed is updating
4. Check auth state is valid

---

## Future Enhancements

### Potential Additions
- [ ] Availability calendar integration
- [ ] Video profile upload
- [ ] Portfolio/work samples upload
- [ ] Certification document upload
- [ ] Multi-language translations
- [ ] Email confirmation after setup
- [ ] Profile preview before completion
- [ ] Social media import
- [ ] Background check integration
- [ ] Real-time profile completeness indicator

---

## Support

For issues or questions:
1. Check Supabase logs
2. Check browser console
3. Verify database schema
4. Test with sample data
5. Review this guide

---

**Last Updated:** November 7, 2025

