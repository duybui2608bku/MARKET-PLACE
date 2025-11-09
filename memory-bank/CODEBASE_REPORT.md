# MARKETPLACE CODEBASE - Chi Tiết Khám Phá

**Ngày**: 2025-11-08
**Repository**: /home/user/MARKET-PLACE
**Git Branch**: claude/admin-page-seo-header-footer-011CUvYqYHHAS91fezyp5aC2

---

## 1. FRAMEWORK & CÔNG NGHỆ

### Framework Chính
- **Next.js**: v16.0.1 (App Router)
- **React**: v19.2.0
- **TypeScript**: v5
- **Styling**: Tailwind CSS v4 + PostCSS v4

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **ORM/Client**: @supabase/supabase-js v2.79.0, @supabase/ssr v0.7.0
- **Authentication**: Supabase Auth (Email/OAuth - Google)

### UI & Icons
- **Lucide React**: v0.553.0 (Icon library)
- **Custom Icons**: SVG inline components

### Internationalization (i18n)
- **Library**: i18n v0.15.3
- **Supported Languages**: 4 locales
  - Vietnamese (vi) - DEFAULT
  - English (en)
  - Chinese (zh)
  - Korean (ko)

---

## 2. CẤU TRÚC THƯ MỤC

```
/home/user/MARKET-PLACE/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Root redirect
│   ├── [locale]/                 # i18n routing (en, vi, zh, ko)
│   │   ├── layout.tsx            # Main layout với Header & I18nProvider
│   │   ├── page.tsx              # Homepage
│   │   ├── (auth)/               # Authentication pages (route group)
│   │   │   ├── login/page.tsx    # Login page
│   │   │   ├── register/page.tsx # Register page
│   │   │   ├── auth-callback/page.tsx # OAuth callback handler
│   │   │   └── worker-onboarding/page.tsx # Worker setup (3 steps)
│   │   ├── profile/              # User profiles
│   │   │   ├── worker/page.tsx   # Worker profile page
│   │   │   └── employer/page.tsx # Employer profile page
│   │   └── worker/
│   │       └── [id]/page.tsx     # Worker detail page
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── user/route.ts     # GET: Current user via Bearer token
│   │   │   └── create-user-profile/route.ts # POST/GET: Create/check user profile
│   │   ├── upload-avatar/route.ts # Avatar upload
│   │   └── admin/
│   │       └── users/route.ts    # GET: Admin list all users
│   ├── globals.css               # Global styles
│   └── favicon.ico
│
├── components/                   # Reusable React components
│   ├── Header.tsx               # Main navigation header (responsive)
│   ├── AvailabilityCalendar.tsx # Calendar for booking availability
│   ├── AvatarUpload.tsx         # Avatar image upload
│   ├── MultiImageUpload.tsx     # Multiple image upload
│   └── ReviewsSection.tsx       # Worker reviews display
│
├── lib/                          # Utilities & business logic
│   ├── types.ts                 # Result pattern, error types
│   ├── users.ts                 # User queries (getCurrentUser, etc.)
│   ├── profiles.ts              # Profile queries (730 lines)
│   └── supabase/
│       ├── client.ts            # Browser Supabase client (SSR)
│       └── server.ts            # Server-side admin client
│
├── i18n/                         # Internationalization
│   ├── config.ts                # Locale constants
│   └── provider.tsx             # I18nProvider & hooks (useT, useLocale)
│
├── messages/                     # Translation files
│   ├── vi.json                  # Vietnamese translations
│   ├── en.json                  # English translations
│   ├── zh.json                  # Chinese translations
│   └── ko.json                  # Korean translations
│
├── supabase/                     # Database migrations
│   ├── migrations/
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_profiles_tables.sql
│   │   ├── 004_setup_storage_avatars.sql
│   │   ├── 005_extend_worker_profiles.sql
│   │   ├── 006_setup_storage_galleries.sql
│   │   ├── 007_create_reviews_ratings.sql
│   │   └── 008_update_worker_profiles_view.sql
│   └── README.md
│
├── public/                       # Static assets
│   ├── next.svg
│   ├── vercel.svg
│   └── ...
│
├── middleware.ts                 # Next.js middleware (i18n routing)
├── next.config.js              # Next.js config (image optimization)
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── eslint.config.mjs           # ESLint config
├── postcss.config.mjs          # PostCSS config
└── .gitignore                  # Git ignore rules
```

---

## 3. DATABASE SCHEMA

### Database: Supabase PostgreSQL

#### Tables Chính:

**A. `public.users`** (Base user info)
- `id` (UUID, PK) - References auth.users
- `email` (TEXT, NOT NULL)
- `role` (TEXT) - 'worker' | 'employer'
- `phone` (TEXT, nullable)
- `preferred_language` (TEXT) - Default: 'vi'
- `full_name` (TEXT, nullable)
- `avatar_url` (TEXT, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Triggers/Functions**:
- `handle_new_user()` - Auto-create user row when auth.users is created
- `handle_updated_at()` - Auto-update timestamp

**Views**:
- `workers` - SELECT users WHERE role = 'worker'
- `employers` - SELECT users WHERE role = 'employer'

---

**B. `public.worker_profiles`** (Detailed worker info)
- `id` (UUID, PK) - References users(id)
- **Bio & Skills**:
  - `bio` (TEXT)
  - `skills` (TEXT[]) - Array of skills
  - `experience_years` (INTEGER)
  - `languages` (TEXT[]) - Default: ['vi']
  
- **Location**:
  - `address`, `city`, `district`, `country`
  - `latitude`, `longitude` (DECIMAL)
  
- **Pricing**:
  - `hourly_rate` (DECIMAL)
  - `daily_rate` (DECIMAL) - Auto-calculated
  - `monthly_rate` (DECIMAL) - Auto-calculated
  - `currency` (TEXT) - Default: 'VND'
  - `min_booking_hours` (INTEGER) - Default: 2
  
- **Portfolio**:
  - `portfolio_images` (TEXT[])
  - `certifications` (TEXT[])
  - `gallery_images` (TEXT[])
  - `service_images` (TEXT[])
  
- **Availability**:
  - `available` (BOOLEAN)
  - `available_from`, `available_to` (TIME)
  - `working_days` (TEXT[]) - ['mon', 'tue', 'wed', 'thu', 'fri']
  
- **Ratings**:
  - `rating` (DECIMAL 3,2) - 0.00 to 5.00
  - `total_reviews` (INTEGER)
  - `total_jobs`, `completed_jobs` (INTEGER)
  
- **Service Info** (Personal):
  - `age`, `height` (cm), `weight` (kg)
  - `zodiac_sign` (TEXT)
  - `hobbies` (TEXT[])
  - `lifestyle` (TEXT)
  - `favorite_quote` (TEXT)
  - `introduction` (TEXT)
  
- **Service Info** (Professional):
  - `service_type` (TEXT) - 'assistance' | 'companionship'
  - `service_category` (TEXT)
  - `service_level` (INTEGER) - 1, 2, or 3
  - `service_description` (TEXT)
  - `service_languages` (TEXT[])
  
- **Verification**:
  - `is_verified` (BOOLEAN)
  - `verified_at` (TIMESTAMPTZ)
  
- **Social**:
  - `facebook_url`, `linkedin_url`, `website_url` (TEXT)
  
- **Setup Tracking**:
  - `setup_step` (INTEGER) - 0: not started, 1-3: current, 4: completed
  - `setup_completed` (BOOLEAN)
  
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Triggers/Functions**:
- `create_empty_profile()` - Auto-create when user is created
- `calculate_worker_rates()` - Auto-calculate daily/monthly rates from hourly
- `handle_profile_updated_at()` - Auto-update timestamp

---

**C. `public.employer_profiles`** (Employer details)
- `id` (UUID, PK)
- `company_name`, `company_description`
- `industry`, `company_size` (small/medium/large)
- `address`, `city`, `district`, `country`
- `company_phone`, `company_email`, `website_url`
- `total_jobs_posted`, `total_hires`
- `is_verified`, `verified_at`
- `tax_code`, `business_license`
- `created_at`, `updated_at`

---

**D. `public.bookings`** (Job bookings)
- `id` (UUID, PK)
- `worker_id`, `employer_id` (UUID FK)
- `service_type`, `start_date`, `end_date`
- `total_hours`, `hourly_rate`, `total_amount`
- `currency`, `status` (pending/confirmed/completed/cancelled)
- `created_at`, `updated_at`

---

**E. `public.reviews`** (Reviews & ratings)
- `id` (UUID, PK)
- `booking_id` (UUID FK)
- `worker_id`, `employer_id` (UUID FK)
- `rating` (1-5), `title`, `comment`
- `images` (TEXT[])
- `helpful_count`
- `is_verified_purchase`
- `created_at`, `updated_at`

---

#### Indexes:
- workers: role, email, created_at
- worker_profiles: city, available, rating DESC, hourly_rate, skills (GIN), verified
- employer_profiles: city, company_name, verified
- reviews & bookings: Various FKs and status fields

#### Row Level Security (RLS):
- Users can see their own profile
- Users can update their own profile
- Workers/employer profiles are publicly viewable
- Service role (admin) has full access

---

## 4. AUTHENTICATION SYSTEM

### Flow:

**Register Flow**:
1. User selects role (worker/employer) → `/[locale]/register`
2. Choose auth method:
   - Email/Password (form submission)
   - Google OAuth
3. Supabase `auth.signUp()` → Trigger creates user in `public.users`
4. Redirect to `/auth-callback?role={role}`
5. AuthCallbackPage creates/updates user profile
6. Worker → `/worker-onboarding` (3-step setup)
7. Employer → `/` (homepage)

**Login Flow**:
1. User enters email/password → `/[locale]/login`
2. Supabase `auth.signInWithPassword()`
3. Redirect to `/${locale}` or checks worker onboarding status

**OAuth Flow**:
- Google configured in Supabase
- Returns to `/auth-callback` with session
- Role passed via query param
- Auto-creates user profile

### Supabase Configuration:

**Client-side** (Browser):
```typescript
// lib/supabase/client.ts
createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

**Server-side** (Admin operations):
```typescript
// lib/supabase/server.ts
getSupabaseAdmin() // Uses SUPABASE_SERVICE_ROLE_KEY
getSupabaseWithBearer(authToken) // Bearer token auth
```

### API Routes for Auth:

**GET `/api/auth/user`** - Get current user (requires Bearer token)
- Returns authenticated user from auth.users

**POST/GET `/api/auth/create-user-profile`** - Create or check user profile
- POST: Create new user profile
- GET: Check if profile exists
- Used during registration & OAuth callback

**GET `/api/admin/users`** - List all auth users
- Requires: `x-admin-secret` header
- Returns all Supabase auth users

---

## 5. HEADER & LAYOUT

### Header Component (`/components/Header.tsx`)

**Features**:
- Fixed top navigation (z-50)
- Dark/Light theme toggle
- Language switcher (en, vi, zh, ko)
- Responsive design (mobile-friendly)
- User authentication status display

**Sections**:
1. **Logo**: MarketPlace brand with gradient
2. **Theme Toggle**: Sun/Moon icon
3. **Language Switcher**: Dropdown with locale names
4. **Authentication Section**:
   - **Not Logged In**: "Sign In" + "Get Started" buttons
   - **Logged In**: User menu with:
     - Avatar
     - User name
     - Role badge (Worker/Employer)
     - Profile link
     - Logout button

**Styling**:
- Glass morphism effect (backdrop-blur)
- Light: white/80 with gray borders
- Dark: black/80 with gray borders
- Responsive gap and padding

**State Management**:
- Theme (light/dark) from localStorage
- Language: Uses i18n provider + cookie (`NEXT_LOCALE`)
- User: Fetches from `getCurrentUser()` + listens to auth state changes

### Main Layout (`/app/[locale]/layout.tsx`)

**Structure**:
```tsx
<html>
  <body>
    <I18nProvider locale={locale} messages={messages}>
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </I18nProvider>
  </body>
</html>
```

**Features**:
- Loads messages dynamically for each locale
- Applies Google Fonts (Geist Sans/Mono)
- Metadata: Title & description (Generic - needs update)
- Generates static params for all supported locales

---

## ⚠️ MISSING: FOOTER COMPONENT

**Status**: Not yet implemented in this codebase.

**What's Needed**:
1. Create `/components/Footer.tsx`
2. Add to layout after main content
3. Include:
   - Company info/links
   - Sitemap/navigation
   - Social media links
   - Terms/Privacy/Contact
   - Multi-language support using i18n

---

## 6. INTERNATIONALIZATION (i18n)

### Configuration

**File**: `/i18n/config.ts`
```typescript
SUPPORTED_LOCALES = ["en", "vi", "zh", "ko"]
DEFAULT_LOCALE = "vi"
```

### Provider & Hooks

**File**: `/i18n/provider.tsx`
- `I18nProvider`: Context provider
- `useT()`: Hook to translate strings
- `useLocale()`: Hook to get current locale

**Usage**:
```typescript
const t = useT();
const locale = useLocale();
return <h1>{t("Header.title", "Default")}</h1>
```

### Translation Files

**Location**: `/messages/{locale}.json`

**Example** (vi.json - Vietnamese):
```json
{
  "Header": {
    "toggleTheme": "Chuyển đổi chế độ sáng/tối",
    "signIn": "Đăng nhập",
    "getStarted": "Bắt đầu",
    ...
  },
  "Auth": {
    "selectAccountType": "Chọn loại tài khoản",
    ...
  }
}
```

### Middleware for i18n

**File**: `/middleware.ts`

**Features**:
1. Detects locale from:
   - Cookie (`NEXT_LOCALE`)
   - Accept-Language header
   - Falls back to DEFAULT_LOCALE (vi)
2. Redirects requests without locale prefix to `/{locale}/path`
3. Ignores API & static asset routes

**Supported Locales**:
- `en` - English
- `vi` - Vietnamese (default)
- `zh` - Chinese
- `ko` - Korean

---

## 7. KEY COMPONENTS & UTILITIES

### User Management

**`lib/users.ts`** (Server & Client):

**Types**:
```typescript
interface User {
  id: string;
  email: string;
  role: "worker" | "employer";
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}
```

**Functions**:
- `getCurrentUser()` - Get logged-in user from client
- `getUserById(userId)` - Server-side query
- `getUserByEmail(email)` - Server-side query
- `getWorkers(limit)` - List workers
- `getEmployers(limit)` - List employers
- `updateCurrentUserProfile(updates)` - Update own profile
- `updateUserProfile(userId, updates)` - Admin update
- `isWorker()`, `isEmployer()` - Type guards
- `getUserDisplayName()` - Get display name

---

### Profile Management

**`lib/profiles.ts`** (730 lines):

**Types**:
```typescript
interface WorkerProfile {
  id: string;
  bio: string | null;
  skills: string[] | null;
  hourly_rate: number | null;
  rating: number;
  total_reviews: number;
  gallery_images: string[] | null;
  service_type: string | null;
  setup_completed: boolean;
  // ... 50+ fields
}

interface EmployerProfile {
  id: string;
  company_name: string | null;
  company_description: string | null;
  // ... 15+ fields
}
```

**Key Functions**:
- `getCurrentWorkerProfile()`
- `getWorkerProfileById(workerId)`
- `getCurrentEmployerProfile()`
- `getEmployerProfileById(employerId)`
- `updateCurrentWorkerProfile(updates)`
- `updateCurrentEmployerProfile(updates)`
- `getWorkersByCity(city, limit)`
- `getWorkersBySkills(skills, limit)`
- `formatCurrency(amount, currency)`
- `formatRating(rating)`

---

### Error Handling

**`lib/types.ts`**:

**Result Pattern**:
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError }

interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
```

**Error Codes**:
- `USER_NOT_FOUND`
- `PROFILE_NOT_FOUND`
- `DATABASE_ERROR`
- `UNAUTHORIZED`
- `VALIDATION_ERROR`
- `UNKNOWN_ERROR`

**Helpers**:
- `createSuccess(data)`
- `createFailure(error)`
- `createError(code, message, details)`
- `isSuccess(result)` - Type guard
- `isFailure(result)` - Type guard

---

### Components

**1. Header.tsx** (15.5 KB)
- Fixed navigation bar
- Theme toggle
- Language switcher
- User menu with profile/logout
- Responsive design

**2. AvailabilityCalendar.tsx** (7.5 KB)
- Calendar for worker availability
- Clickable date selection
- Time slot availability

**3. AvatarUpload.tsx** (6.6 KB)
- Image upload to Supabase storage
- Avatar preview
- Crop/resize functionality

**4. MultiImageUpload.tsx** (8.7 KB)
- Multiple image uploads
- Progress tracking
- Image preview gallery

**5. ReviewsSection.tsx** (12.5 KB)
- Display worker reviews
- Star ratings
- Helpful votes
- Verified purchase badges

---

## 8. PAGE STRUCTURE

### Public Pages

**`/[locale]`** - Homepage
- Displays default template
- Currently shows Next.js boilerplate

**`/[locale]/login`** - Login page
- Email/Password login
- Google OAuth removed (no role selection)
- Link to register
- i18n support

**`/[locale]/register`** - Register page
- Role selection (worker/employer)
- Account type details with features
- Email/Password form
- Google OAuth button
- Terms acceptance

**`/[locale]/auth-callback`** - OAuth/Auth callback handler
- Handles Supabase redirects
- Creates user profile
- Routes workers to onboarding
- Routes employers to home

**`/[locale]/worker/[id]`** - Worker detail page
- Public worker profile
- Portfolio images
- Ratings/reviews
- Book availability

### Protected Pages (Require Auth)

**`/[locale]/profile/worker`** - Worker profile management
- Personal info
- Skills/experience
- Portfolio
- Availability
- Pricing
- Checks role (redirects employers to employer profile)

**`/[locale]/profile/employer`** - Employer profile management
- Company info
- Contact details
- Job posting history

**`/[locale]/worker-onboarding`** - 3-step worker setup
- Step 1: Personal info (age, bio, photos)
- Step 2: Service details (type, category, level)
- Step 3: Pricing & availability
- Marks `setup_completed = true`

---

## 9. API ROUTES

### Auth Routes

**`POST /api/auth/create-user-profile`**
```typescript
Request body: {
  userId: string;
  email: string;
  role: "worker" | "employer";
  phone?: string;
  preferred_language?: string;
}

Response: {
  success: boolean;
  message: string;
  user: User;
}
```

**`GET /api/auth/create-user-profile?userId={id}`**
```typescript
Response: {
  exists: boolean;
  user?: User;
}
```

**`GET /api/auth/user`**
- Requires: `Authorization: Bearer {token}`
- Returns: Current authenticated user

### Admin Routes

**`GET /api/admin/users`**
- Requires: `x-admin-secret` header
- Returns: All Supabase auth users

### Upload Routes

**`POST /api/upload-avatar`**
- Upload avatar to Supabase storage
- Returns: Avatar URL

---

## 10. CONFIGURATION FILES

### **package.json**
- Dependencies: Supabase, i18n, Tailwind, React, Next.js
- Scripts: dev, build, start, lint

### **tsconfig.json**
- Target: ES2017
- Lib: dom, esnext
- Path alias: `@/*` → root directory
- Strict mode enabled

### **next.config.js**
- Image optimization for Supabase CDN
- Remote patterns:
  - `**.supabase.co/storage/v1/object/public/**`
  - `lh3.googleusercontent.com/**`

### **middleware.ts**
- i18n routing middleware
- Locale detection & redirection
- Matcher: All routes except API, static, hidden

### **globals.css**
- Tailwind imports
- CSS variables for theme
- Dark mode support

---

## 11. DEPLOYMENT & ENVIRONMENT

### Required Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Admin
ADMIN_SECRET=<secret-for-admin-api>
```

### Git Ignore
- node_modules, .pnp
- .next, /out, /build
- .env* (all environment files)
- TypeScript build files

---

## 12. CURRENT STATUS & NEXT STEPS

### Current Features ✅
- Multi-language support (4 languages)
- Supabase authentication (email + Google OAuth)
- User roles (worker/employer)
- Worker profiles with extended info
- Employer profiles
- Responsive header with theme toggle
- Middleware i18n routing
- User profile management pages
- Worker onboarding (3-step setup)
- Reviews & ratings system
- Booking system
- Image uploads (avatar, portfolio, gallery)

### Missing Features ❌
1. **Footer Component** - Not implemented
2. **Admin Dashboard** - Only basic user list API
3. **Job/Service Listings** - No public marketplace page
4. **Messaging System** - No chat between users
5. **Payment Integration** - No payment processing
6. **Notifications** - No notification system
7. **Search/Filter** - Limited search functionality
8. **Email Verification** - Not explicitly handled
9. **Password Reset** - Not implemented
10. **Refund/Dispute System** - Not implemented

### File Counts
- Total TypeScript/JSX files: 23+
- Components: 5
- Pages: 9
- API routes: 6
- Database migrations: 8
- Translation files: 4
- Total lines of code: ~3000+

---

## 13. KEY FILE PATHS (Absolute)

### Configuration
- `/home/user/MARKET-PLACE/package.json`
- `/home/user/MARKET-PLACE/tsconfig.json`
- `/home/user/MARKET-PLACE/next.config.js`
- `/home/user/MARKET-PLACE/middleware.ts`

### Core Components
- `/home/user/MARKET-PLACE/components/Header.tsx`
- `/home/user/MARKET-PLACE/app/[locale]/layout.tsx`

### Authentication
- `/home/user/MARKET-PLACE/app/[locale]/(auth)/login/page.tsx`
- `/home/user/MARKET-PLACE/app/[locale]/(auth)/register/page.tsx`
- `/home/user/MARKET-PLACE/app/[locale]/(auth)/auth-callback/page.tsx`
- `/home/user/MARKET-PLACE/app/api/auth/create-user-profile/route.ts`

### Libraries
- `/home/user/MARKET-PLACE/lib/users.ts`
- `/home/user/MARKET-PLACE/lib/profiles.ts`
- `/home/user/MARKET-PLACE/lib/supabase/client.ts`
- `/home/user/MARKET-PLACE/lib/supabase/server.ts`

### i18n
- `/home/user/MARKET-PLACE/i18n/config.ts`
- `/home/user/MARKET-PLACE/i18n/provider.tsx`
- `/home/user/MARKET-PLACE/messages/vi.json`
- `/home/user/MARKET-PLACE/messages/en.json`

### Database
- `/home/user/MARKET-PLACE/supabase/migrations/001_create_users_table.sql`
- `/home/user/MARKET-PLACE/supabase/migrations/002_create_profiles_tables.sql`
- `/home/user/MARKET-PLACE/supabase/migrations/005_extend_worker_profiles.sql`

---

## Summary

This is a **full-stack marketplace application** built with modern technologies:
- Next.js App Router for routing & SSR
- Supabase for authentication & database
- TypeScript for type safety
- Tailwind CSS for styling
- Multi-language support (i18n)

**Key Architecture**:
1. **Frontend**: React components with client-side state
2. **Backend**: Next.js API routes + Supabase
3. **Database**: PostgreSQL with RLS
4. **Auth**: Supabase (email + Google OAuth)

The project is production-ready but needs footer component and additional features like marketplace listing, messaging, and payments.

