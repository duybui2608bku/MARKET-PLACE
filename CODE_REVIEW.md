# 📋 Code Review - Những Nơi Chưa Ổn

## 🔴 Vấn Đề Nghiêm Trọng (Critical Issues)

### 1. **Bảo mật - Missing Input Validation & Sanitization**

#### `/app/api/upload-avatar/route.ts:62-63`
```typescript
const fileExt = file.name.split(".").pop();
const fileName = `${userId}/${Date.now()}.${fileExt}`;
```
**Vấn đề:**
- Không validate extension file => có thể upload file nguy hiểm (.exe, .sh, .bat)
- Không kiểm tra MIME type thực sự (chỉ check `file.type`)
- Attacker có thể fake MIME type để upload malware

**Fix cần thiết:**
```typescript
// Whitelist allowed extensions
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const fileExt = file.name.split(".").pop()?.toLowerCase();

if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
  return NextResponse.json(
    { error: "Invalid file type. Only JPG, PNG, GIF, WebP allowed" },
    { status: 400 }
  );
}

// Verify actual file content, not just MIME type
```

---

### 2. **Bảo mật - Path Traversal Vulnerability**

#### `/app/api/upload-avatar/route.ts:74`
```typescript
const oldPath = userData.avatar_url.split("/avatars/")[1];
```
**Vấn đề:**
- Không validate path => path traversal attack
- Attacker có thể delete bất kỳ file nào trong storage

**Fix cần thiết:**
```typescript
// Sanitize and validate path
const urlParts = userData.avatar_url.split("/avatars/");
if (urlParts.length !== 2) return;

const oldPath = urlParts[1];
// Validate path doesn't contain traversal patterns
if (oldPath.includes("..") || oldPath.includes("//")) {
  console.warn("Path traversal attempt detected");
  return;
}
```

---

### 3. **Bảo mật - Missing Rate Limiting**

#### `/app/api/upload-avatar/route.ts`, `/app/api/auth/create-user-profile/route.ts`
**Vấn đề:**
- Không có rate limiting
- Attacker có thể spam requests => DDoS
- Upload avatar liên tục => waste storage

**Fix cần thiết:**
```typescript
// Implement rate limiting middleware
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});
```

---

### 4. **Bảo mật - Sensitive Data Exposure**

#### `/lib/supabase/server.ts:4`
```typescript
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
```
**Vấn đề:**
- Service role key có full admin access
- Nếu leak => toàn bộ database bị compromise
- Missing .env.example => developers có thể commit .env

**Fix cần thiết:**
```bash
# Create .env.example with placeholders
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Add to .gitignore (already done, but verify)
.env
.env.local
.env.*.local
```

---

## ⚠️ Vấn Đề Quan Trọng (High Priority Issues)

### 5. **Code Quality - Poor Error Handling**

#### `/lib/profiles.ts:86-102`
```typescript
export async function getWorkerProfile(userId: string): Promise<WorkerProfile | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching worker profile:", error);
      return null;  // ❌ Không phân biệt error types
    }
    return data as WorkerProfile;
  } catch (error) {
    console.error("Unexpected error in getWorkerProfile:", error);
    return null;  // ❌ Silent failure
  }
}
```

**Vấn đề:**
- Trả về `null` cho mọi lỗi => caller không biết lỗi gì
- Không phân biệt: "not found" vs "database error" vs "permission denied"
- Debugging khó khăn

**Fix cần thiết:**
```typescript
export type ProfileResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export async function getWorkerProfile(userId: string): Promise<ProfileResult<WorkerProfile>> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: { code: "NOT_FOUND", message: "Profile not found" } };
      }
      return { success: false, error: { code: error.code, message: error.message } };
    }

    return { success: true, data: data as WorkerProfile };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}
```

---

### 6. **Performance - Inefficient Client-Side Supabase Usage**

#### `/lib/profiles.ts:2`
```typescript
import { getSupabaseClient } from "@/lib/supabase/client";
```

**Vấn đề:**
- File này là SERVER-SIDE library nhưng import CLIENT
- `getSupabaseClient()` chỉ hoạt động trong browser
- Sẽ fail khi call từ Server Components

**Fix cần thiết:**
```typescript
// Split into 2 files:
// lib/profiles.server.ts - Only use getSupabaseAdmin()
// lib/profiles.client.ts - Only use getSupabaseClient()

// Or use conditional imports:
export async function getCurrentWorkerProfile(): Promise<WorkerProfile | null> {
  if (typeof window === 'undefined') {
    throw new Error('getCurrentWorkerProfile can only be called from client');
  }
  // ... rest of code
}
```

---

### 7. **UX - Missing Loading & Error States**

#### `/components/Header.tsx:241-243`
```typescript
{loading ? (
  <div className="w-24 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
) : user ? (
```

**Tốt!** Nhưng thiếu ở nhiều nơi khác:

#### `/app/[locale]/(auth)/register/page.tsx:56-78`
```typescript
try {
  const response = await fetch("/api/auth/create-user-profile", {
    method: "POST",
    // ...
  });

  const result = await response.json();

  if (!response.ok) {
    // API backup failed but trigger should handle it  ❌ Silent failure
  }
} catch (apiError) {
  // Không throw error nếu API fail vì trigger đã handle  ❌ Assumption nguy hiểm
}
```

**Vấn đề:**
- Assume trigger sẽ tạo user => nếu trigger fail thì user không được tạo
- Không show error cho user
- User nghĩ đăng ký thành công nhưng thực ra failed

**Fix cần thiết:**
```typescript
try {
  const response = await fetch("/api/auth/create-user-profile", {
    method: "POST",
    // ...
  });

  if (!response.ok) {
    const result = await response.json();
    console.warn("Profile creation API failed:", result.error);
    // Show warning but continue
    setMessage(t("Auth.signupSuccessWithWarning"));
  } else {
    setMessage(t("Auth.signupSuccess"));
  }
} catch (apiError) {
  console.error("Profile creation failed:", apiError);
  setError(t("Auth.profileCreationFailed"));
  // Still show success for auth but warn about profile
}
```

---

### 8. **Code Quality - Client-Server Boundary Violation**

#### `/lib/supabase/client.ts:5-6`
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
```

**Vấn đề:**
- `process.env` trong client-side code
- Chỉ hoạt động sau build time => không dynamic
- Nếu thiếu env vars, lỗi runtime khó debug

**Lưu ý:** Đây là OK cho NEXT_PUBLIC_* vars, nhưng cần thêm fallback

**Suggestion:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Show helpful error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`
      Missing Supabase environment variables!

      Please create a .env.local file with:
      NEXT_PUBLIC_SUPABASE_URL=your_url_here
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here

      See .env.example for details.
    `);
  }
  throw new Error(
    "Missing Supabase env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}
```

---

## 🟡 Vấn Đề Trung Bình (Medium Priority Issues)

### 9. **Code Quality - Hardcoded Strings**

#### `/app/[locale]/layout.tsx:18-19`
```typescript
export const metadata: Metadata = {
  title: "Create Next App",  // ❌ Default boilerplate
  description: "Generated by create next app",  // ❌ Không phản ánh dự án
};
```

**Fix:**
```typescript
export const metadata: Metadata = {
  title: "MarketPlace - Service Marketplace Platform",
  description: "Connect with skilled workers or find your next gig. Homecare, grooming, assistance, and companionship services.",
};
```

---

### 10. **Accessibility - Missing ARIA Labels**

#### `/components/AvatarUpload.tsx:169-173`
```tsx
<button
  onClick={handleClick}
  className="absolute inset-0 bg-black/0 hover:bg-black/40..."
  disabled={uploading}
>
```

**Vấn đề:**
- Không có `aria-label` => screen readers không hiểu
- Button không có visible text khi không hover

**Fix:**
```tsx
<button
  onClick={handleClick}
  className="absolute inset-0 bg-black/0 hover:bg-black/40..."
  disabled={uploading}
  aria-label="Change avatar photo"
>
```

---

### 11. **Performance - Missing Memoization**

#### `/components/Header.tsx:110-115`
```tsx
const localeNames: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
  zh: "中文",
  ko: "한국어",
};
```

**Vấn đề:**
- Object literal được tạo mới mỗi lần component re-render
- Không ảnh hưởng performance nhiều nhưng best practice

**Fix:**
```tsx
// Move outside component
const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
  zh: "中文",
  ko: "한국어",
} as const;
```

---

### 12. **Type Safety - Loose Type Assertions**

#### `/lib/profiles.ts:99`
```typescript
return data as WorkerProfile;
```

**Vấn đề:**
- Type assertion không validate runtime data
- Nếu database schema thay đổi => runtime error

**Fix:**
```typescript
// Create Zod schema for validation
import { z } from 'zod';

const WorkerProfileSchema = z.object({
  id: z.string().uuid(),
  bio: z.string().nullable(),
  skills: z.array(z.string()).nullable(),
  experience_years: z.number(),
  hourly_rate: z.number().nullable(),
  // ... rest of fields
});

// Validate before returning
const validated = WorkerProfileSchema.safeParse(data);
if (!validated.success) {
  console.error("Invalid worker profile data:", validated.error);
  return null;
}
return validated.data;
```

---

### 13. **Missing Environment Variable Documentation**

**Vấn đề:** Không có `.env.example`

**Fix cần thiết:** Create `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ⚠️ CRITICAL: Service Role Key (Server-side only)
# DO NOT expose this in client code!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Rate Limiting (if using Upstash)
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=
```

---

## 🔵 Vấn Đề Nhỏ (Low Priority Issues)

### 14. **Code Cleanup - Unused Comments**

#### `/app/[locale]/(auth)/login/page.tsx:44-46`
```typescript
// Google OAuth đã bị XÓA khỏi trang login
// Lý do: Login không có role selection, nên không thể dùng OAuth
// User cần đăng ký qua /register (có chọn role) nếu muốn dùng Google
```

**Vấn đề:**
- Comment dài giải thích code đã xóa
- Nên dùng Git history thay vì comment

**Fix:** Remove comment or make it more concise

---

### 15. **UX - Hardcoded Vietnamese Messages**

#### `/components/AvatarUpload.tsx:33, 39, 77-78`
```typescript
onUploadError?.("Vui lòng chọn file ảnh (JPG, PNG, GIF)");
onUploadError?.("Kích thước file không được vượt quá 5MB");
```

**Vấn đề:**
- Hardcoded Vietnamese => không i18n
- Inconsistent với phần còn lại của app

**Fix:**
```typescript
// Add to i18n messages
onUploadError?.(t("AvatarUpload.invalidFileType"));
onUploadError?.(t("AvatarUpload.fileTooLarge"));
```

---

### 16. **Missing Responsive Breakpoint**

#### `/components/Header.tsx:209`
```tsx
<span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
  {locale?.toUpperCase() || "EN"}
</span>
```

**OK** nhưng có thể improve:
```tsx
{/* Show full name on larger screens */}
<span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
  {localeNames[locale || 'en']}
</span>
{/* Show code on small screens */}
<span className="text-sm font-medium text-gray-700 dark:text-gray-300 inline md:hidden">
  {locale?.toUpperCase() || "EN"}
</span>
```

---

## 📊 Tổng Kết

| Mức Độ | Số Lượng | Ưu Tiên |
|--------|----------|---------|
| 🔴 Critical | 4 | Phải fix ngay |
| ⚠️ High | 4 | Fix trong sprint này |
| 🟡 Medium | 6 | Fix khi có thời gian |
| 🔵 Low | 3 | Nice to have |

---

## 🎯 Action Items (Ưu Tiên)

### Sprint 1 (Tuần này)
1. ✅ Fix upload avatar validation (Critical #1)
2. ✅ Fix path traversal vulnerability (Critical #2)
3. ✅ Create .env.example (Critical #4)
4. ✅ Implement better error handling (High #5)
5. ✅ Fix register page error handling (High #7)

### Sprint 2 (Tuần sau)
6. Add rate limiting (Critical #3)
7. Split server/client code (High #6)
8. Add Zod validation (Medium #12)
9. Update metadata (Medium #9)
10. Add i18n for error messages (Low #15)

---

## 🛠️ Tools Khuyến Nghị

1. **Security Scanning:**
   ```bash
   npm install --save-dev @next/eslint-plugin-next
   npm audit
   ```

2. **Type Safety:**
   ```bash
   npm install zod
   ```

3. **Rate Limiting:**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

4. **Code Quality:**
   ```bash
   npm install --save-dev prettier eslint-config-prettier
   ```

---

**Review Date:** 2025-11-08
**Reviewer:** Claude Code AI
**Next Review:** After fixing Critical & High priority issues
