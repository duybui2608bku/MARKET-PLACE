# Tài liệu Đặc tả Hệ thống Service Marketplace Platform

## 1. Tổng quan dự án

### 1.1 Giới thiệu

Service Marketplace là nền tảng kết nối người cung cấp dịch vụ (Workers) với người thuê dịch vụ (Employers). Hệ thống được thiết kế với giao diện lấy cảm hứng từ Airbnb, tập trung vào trải nghiệm người dùng đơn giản, trực quan và hỗ trợ đa ngôn ngữ.

### 1.2 Mục tiêu chính

- Tạo marketplace tin cậy cho 4 nhóm dịch vụ chính: Chăm sóc nhà, Làm đẹp, Hỗ trợ và Bầu bạn
- Đảm bảo tính minh bạch trong giá cả và chất lượng dịch vụ
- Xây dựng hệ thống đánh giá và review đáng tin cậy
- Hỗ trợ đa ngôn ngữ phục vụ thị trường quốc tế

### 1.3 Technology Stack được đề xuất

- **Database**: Supabase (PostgreSQL + Realtime + Auth)
- **Backend API**: Supabase Edge Functions / Next.js API Routes
- **Frontend Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand hoặc TanStack Query
- **Internationalization**: next-intl
- **Payment Integration**: Stripe / Local payment gateways
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime cho chat và notifications
- **Maps**: Google Maps API / Mapbox

## 2. Phân tích nghiệp vụ chi tiết

### 2.1 Các loại người dùng (User Roles)

#### 2.1.1 Worker (Người cung cấp dịch vụ)

- **Quyền hạn**:

  - Tạo và quản lý profile cá nhân
  - Đăng ký cung cấp MỘT dịch vụ duy nhất
  - Thiết lập giá theo giờ/ngày/tháng
  - Quản lý lịch làm việc
  - Chấp nhận/từ chối booking
  - Nhận và phản hồi reviews
  - Chat với employers
  - Xem thống kê thu nhập

- **Thông tin profile bắt buộc**:
  - Ảnh đại diện (avatar)
  - Họ tên đầy đủ
  - Tuổi (≥18)
  - Chiều cao (cm)
  - Cân nặng (kg)
  - Cung hoàng đạo
  - Sở thích (multiple choices)
  - Lối sống (multiple choices)
  - Châm ngôn sống
  - Giới thiệu bản thân (min 50 từ)

#### 2.1.2 Employer (Người thuê dịch vụ)

- **Quyền hạn**:
  - Tìm kiếm và filter workers
  - Xem chi tiết profiles và reviews
  - Đặt nhiều dịch vụ trong 1 booking
  - Quản lý bookings
  - Viết reviews sau khi hoàn thành dịch vụ
  - Chat với workers
  - Lưu workers yêu thích

#### 2.1.3 Admin (Quản trị viên)

- **Quyền hạn**:
  - Quản lý users (active/suspend/delete)
  - Duyệt profiles và verify workers
  - Xử lý khiếu nại và tranh chấp
  - Quản lý categories và services
  - Xem reports và analytics
  - Cấu hình hệ thống (fees, policies)

### 2.2 Phân loại dịch vụ chi tiết

#### 2.2.1 Homecare (Chăm sóc nhà)

**Hai loại dịch vụ con:**

1. **Logically Arranging (Sắp xếp ngăn nắp)**

   - Dọn dẹp nhà cửa
   - Sắp xếp tủ quần áo
   - Tổ chức không gian làm việc
   - Decluttering
   - Thông tin cần lưu: Diện tích (m²), số phòng

2. **Cooking (Nấu ăn)**
   - Bắt buộc ghi rõ loại ẩm thực:
     - Việt Nam
     - Trung Hoa
     - Âu (Pháp, Ý, etc.)
     - Nhật Bản
     - Hàn Quốc
     - Thái Lan
     - Ấn Độ
     - Chay/Thuần chay
   - Thông tin bổ sung: Số người phục vụ tối đa, chứng chỉ vệ sinh ATTP

#### 2.2.2 Grooming (Làm đẹp)

**Bốn loại dịch vụ con:**

1. **Nails (Móng)**

   - Manicure
   - Pedicure
   - Nail art
   - Gel/Acrylic extensions

2. **Face (Mặt)**

   - Skincare/Facial
   - Makeup
   - Eyebrows/Eyelashes
   - Acne treatment

3. **Body**

   - Massage
   - Body scrub
   - Waxing
   - Slimming treatments

4. **Hair (Tóc)**
   - **Non-chemical**: Cắt, tạo kiểu, gội đầu
   - **Chemical**: Nhuộm, uốn, duỗi, phục hồi
   - Bắt buộc ghi rõ có sử dụng hóa chất hay không

#### 2.2.3 Assistance (Hỗ trợ)

**Năm loại dịch vụ con:**

1. **Personal Assistant**

   - Quản lý lịch trình cá nhân
   - Mua sắm hộ
   - Chạy việc vặt
   - Đưa đón

2. **Professional On-site Assistant**

   - Hỗ trợ tại văn phòng
   - Trợ lý sự kiện
   - Hỗ trợ kỹ thuật tại chỗ

3. **Virtual Assistant**

   - Quản lý email
   - Data entry
   - Research
   - Social media management

4. **Tour Guide**

   - City tours
   - Food tours
   - Cultural experiences
   - Adventure tours

5. **Translator (Phiên dịch)**
   - Bắt buộc ghi rõ ngôn ngữ:
     - Tiếng Việt
     - Tiếng Anh
     - Tiếng Trung
     - Tiếng Nhật
     - Tiếng Hàn
     - Khác
   - Loại hình: Dịch thuật/Phiên dịch trực tiếp

#### 2.2.4 Companionship (Bầu bạn)

**Ba cấp độ dịch vụ:**

1. **Level 1 - Casual Companion**

   - Không tiếp xúc cơ thể
   - Không yêu cầu trò chuyện trí thức
   - Trang phục thường ngày (casual)
   - Ví dụ: Đi ăn, xem phim, dạo phố

2. **Level 2 - Social Companion**

   - Không tiếp xúc cơ thể
   - YÊU CẦU trò chuyện trí thức
   - Trang phục bán trang trọng (semi-formal)
   - Ví dụ: Dự tiệc, sự kiện networking, business dinner

3. **Level 3 - Premium Companion**
   - Cho phép tiếp xúc cơ thể không thân mật (nắm tay, khoác tay)
   - YÊU CẦU trò chuyện trí thức cao
   - Trang phục trang trọng (formal)
   - Ví dụ: Gala dinner, sự kiện cao cấp, business meeting quan trọng

### 2.3 Quy tắc định giá dịch vụ

#### 2.3.1 Nguyên tắc chung

- Worker chỉ được đăng ký MỘT dịch vụ duy nhất
- Mỗi dịch vụ có 3 mức giá: Theo giờ, theo ngày (8h), theo tháng
- Giá được thiết lập bởi worker, hệ thống chỉ giới hạn min/max

#### 2.3.2 Quy tắc booking nhiều dịch vụ

- Employer CÓ THỂ đặt nhiều dịch vụ từ nhiều workers khác nhau
- Khi đặt nhiều dịch vụ cùng lúc:
  - Phí dịch vụ = Mức giá CAO NHẤT trong các dịch vụ được chọn
  - Ví dụ: Đặt Cooking (200k/h) + Cleaning (100k/h) = Tính 200k/h cho toàn bộ
  - Logic: Đây là để khuyến khích đặt combo và đơn giản hóa thanh toán

#### 2.3.3 Platform fee

- Hệ thống thu 15-20% phí từ worker
- Phí được trừ tự động từ payment
- Worker nhận 80-85% sau khi trừ phí

## 3. User Journey & Workflows

### 3.1 Worker Registration Flow

1. **Sign Up**
   - Email/Phone verification
   - Chọn role: Worker
2. **Complete Profile** (Bắt buộc 100%)
   - Upload avatar + cover photo
   - Điền thông tin cá nhân đầy đủ
   - Viết introduction (min 50 words)
3. **Choose Service** (Chỉ được chọn 1)
   - Select category
   - Fill service-specific details
   - Set pricing (hourly/daily/monthly)
4. **Set Availability**
   - Weekly schedule
   - Block dates
5. **Verification** (Optional nhưng recommended)
   - Upload ID card/passport
   - Background check consent
   - Skill certificates (if any)
6. **Go Live**
   - Profile được publish
   - Bắt đầu nhận bookings

### 3.2 Booking Flow (Employer side)

1. **Search & Discovery**
   - Browse by category hoặc search
   - Apply filters:
     - Service type
     - Location (radius từ user)
     - Price range
     - Availability (specific dates)
     - Rating (≥ 4 stars)
     - Verified workers only
2. **View Worker Profile**
   - Xem đầy đủ thông tin
   - Check availability calendar
   - Read reviews & ratings
   - Xem service details & pricing
3. **Create Booking**
   - Chọn ngày & giờ
   - Select duration (hours/days)
   - Có thể add thêm workers khác
   - Nhập location cho service
   - Add special requests/notes
4. **Review & Pay**
   - Review tổng chi phí
   - Áp dụng promo code (if any)
   - Chọn payment method
   - Confirm & pay
5. **Booking Confirmation**
   - Nhận confirmation email/SMS
   - Worker có 24h để accept/decline
   - Nếu decline → refund 100%
6. **Service Delivery**
   - Chat với worker về details
   - Check-in khi service bắt đầu
   - Check-out khi kết thúc
7. **Post-Service**
   - Thanh toán được release cho worker
   - Viết review (trong 7 ngày)
   - Tip worker (optional)

### 3.3 Messaging System

#### 3.3.1 Chat Features

- Real-time messaging
- Send photos/files
- Voice messages
- Translation button (dịch tin nhắn)
- Block/Report user
- Chat chỉ available sau khi có booking

#### 3.3.2 Notification System

- **Push Notifications cho**:
  - New booking request
  - Booking accepted/declined
  - Payment received
  - New message
  - New review
  - Reminder trước appointment

## 4. Database Design cho Supabase

### 4.1 Core Tables Structure

#### Users Table

```
users
- id (UUID, PK)
- email (unique, not null)
- phone (unique)
- role (enum: worker/employer/admin)
- preferred_language (enum: en/vi/zh)
- is_active (boolean)
- is_verified (boolean)
- created_at
- updated_at
- last_login_at
```

#### Worker Profiles Table

```
worker_profiles
- id (UUID, PK)
- user_id (FK to users)
- full_name
- date_of_birth
- gender
- age
- height (decimal)
- weight (decimal)
- star_sign
- avatar_url
- cover_photo_url
- introduction (text)
- quotes (text)
- hobbies (JSONB array)
- lifestyle (JSONB array)
- languages_spoken (JSONB array)
- city
- district
- full_address
- latitude
- longitude
- rating_average (decimal 0-5)
- total_reviews (integer)
- total_bookings_completed (integer)
- response_rate (percentage)
- response_time (average in minutes)
- is_verified (boolean)
- verification_documents (JSONB)
- background_check_status (enum)
- created_at
- updated_at
```

#### Services Table

```
services
- id (UUID, PK)
- worker_id (FK to worker_profiles)
- category (enum: homecare/grooming/assistance/companionship)
- service_type (string)
- service_details (JSONB)
  * For Homecare: {type, cuisine_types[], specialties[]}
  * For Grooming: {type, chemical, techniques[]}
  * For Assistance: {type, languages[], specializations[]}
  * For Companionship: {level, activities[], topics[]}
- hourly_rate (decimal)
- daily_rate (decimal)
- monthly_rate (decimal)
- minimum_hours (integer)
- instant_booking (boolean)
- cancellation_policy (text)
- is_active (boolean)
- created_at
- updated_at
```

#### Availability Table

```
availability
- id (UUID, PK)
- worker_id (FK)
- type (enum: recurring/specific)
- day_of_week (0-6 for recurring)
- specific_date (date for specific)
- start_time
- end_time
- is_available (boolean)
- created_at
```

#### Bookings Table

```
bookings
- id (UUID, PK)
- booking_code (unique, auto-generated)
- employer_id (FK)
- worker_ids (array of UUIDs)
- primary_service_id (FK - for pricing)
- service_ids (array)
- start_datetime
- end_datetime
- duration_type (enum: hourly/daily/monthly)
- duration_value (integer)
- service_location (text)
- location_details (JSONB: {address, lat, lng, instructions})
- base_amount (decimal)
- platform_fee (decimal)
- tax_amount (decimal)
- total_amount (decimal)
- payment_method (enum)
- payment_status (enum: pending/paid/failed/refunded)
- booking_status (enum: pending/accepted/rejected/ongoing/completed/cancelled)
- employer_notes (text)
- worker_notes (text)
- cancellation_reason (text)
- cancelled_by (FK to users)
- cancelled_at
- accepted_at
- started_at
- completed_at
- created_at
- updated_at
```

#### Reviews Table

```
reviews
- id (UUID, PK)
- booking_id (FK)
- reviewer_id (FK to users)
- reviewed_id (FK to users)
- rating (integer 1-5)
- comment (text)
- service_rating (integer 1-5)
- communication_rating (integer 1-5)
- punctuality_rating (integer 1-5)
- value_rating (integer 1-5)
- photos (array of URLs)
- is_verified_booking (boolean)
- admin_verified (boolean)
- is_visible (boolean)
- created_at
- updated_at
```

#### Messages Table

```
messages
- id (UUID, PK)
- conversation_id (UUID)
- booking_id (FK, nullable)
- sender_id (FK)
- receiver_id (FK)
- message_type (enum: text/image/voice/file)
- content (text)
- media_url (text, nullable)
- is_read (boolean)
- read_at
- is_translated (boolean)
- original_language (string)
- created_at
```

#### Transactions Table

```
transactions
- id (UUID, PK)
- booking_id (FK)
- user_id (FK)
- type (enum: payment/refund/payout/tip)
- amount (decimal)
- currency (string)
- payment_method (string)
- payment_gateway (enum: stripe/paypal/local)
- gateway_transaction_id (string)
- status (enum: pending/processing/success/failed)
- metadata (JSONB)
- processed_at
- created_at
```

#### Favorites Table

```
favorites
- id (UUID, PK)
- user_id (FK)
- worker_id (FK)
- created_at
```

#### Notifications Table

```
notifications
- id (UUID, PK)
- user_id (FK)
- type (enum: booking_request/booking_confirmed/payment/review/message)
- title (text)
- body (text)
- data (JSONB)
- is_read (boolean)
- read_at
- created_at
```

### 4.2 Indexes cần tạo

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Worker Profiles
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_city ON worker_profiles(city);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating_average DESC);
CREATE INDEX idx_worker_profiles_location ON worker_profiles USING GIST(point(longitude, latitude));

-- Services
CREATE INDEX idx_services_worker_id ON services(worker_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);

-- Bookings
CREATE INDEX idx_bookings_employer ON bookings(employer_id);
CREATE INDEX idx_bookings_worker ON bookings USING GIN(worker_ids);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_dates ON bookings(start_datetime, end_datetime);

-- Reviews
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_users ON messages(sender_id, receiver_id);
```

### 4.3 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
-- ... cho tất cả tables

-- Users table policies
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Worker profiles policies
CREATE POLICY "Public can view active worker profiles"
ON worker_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = worker_profiles.user_id
    AND users.is_active = true
  )
);

CREATE POLICY "Workers can update own profile"
ON worker_profiles FOR UPDATE
USING (user_id = auth.uid());

-- Services policies
CREATE POLICY "Public can view active services"
ON services FOR SELECT
USING (is_active = true);

CREATE POLICY "Workers can manage own services"
ON services FOR ALL
USING (
  worker_id IN (
    SELECT id FROM worker_profiles
    WHERE user_id = auth.uid()
  )
);

-- Bookings policies
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (
  employer_id IN (
    SELECT id FROM employer_profiles
    WHERE user_id = auth.uid()
  )
  OR
  auth.uid() = ANY(
    SELECT wp.user_id
    FROM worker_profiles wp
    WHERE wp.id = ANY(bookings.worker_ids)
  )
);

-- Messages policies
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (
  sender_id = auth.uid()
  OR
  receiver_id = auth.uid()
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());
```

## 5. API Endpoints Documentation

### 5.1 Authentication APIs

#### POST /api/auth/register

**Request Body:**

```json
{
  "email": "string",
  "password": "string",
  "phone": "string",
  "role": "worker|employer",
  "preferred_language": "en|vi|zh"
}
```

#### POST /api/auth/login

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

### 5.2 Worker APIs

#### GET /api/workers

**Query Parameters:**

- category: homecare|grooming|assistance|companionship
- city: string
- min_price: number
- max_price: number
- min_rating: number
- available_date: ISO date string
- page: number
- limit: number
- sort: rating|price_asc|price_desc|distance

**Response:**

```json
{
  "workers": [
    {
      "id": "uuid",
      "full_name": "string",
      "avatar_url": "string",
      "rating_average": 4.5,
      "total_reviews": 10,
      "service": {
        "category": "homecare",
        "hourly_rate": 200000
      },
      "distance_km": 2.5
    }
  ],
  "pagination": {
    "page": 1,
    "total_pages": 10,
    "total_items": 100
  }
}
```

#### GET /api/workers/{id}

**Response:**

```json
{
  "id": "uuid",
  "profile": {
    "full_name": "string",
    "age": 25,
    "height": 165,
    "weight": 55,
    "star_sign": "Leo",
    "introduction": "text",
    "hobbies": ["reading", "yoga"],
    "lifestyle": ["healthy", "active"]
  },
  "service": {
    "category": "homecare",
    "details": {},
    "hourly_rate": 200000,
    "daily_rate": 1500000,
    "monthly_rate": 30000000
  },
  "availability": [
    {
      "date": "2024-01-15",
      "slots": ["09:00-12:00", "14:00-18:00"]
    }
  ],
  "reviews": [
    {
      "rating": 5,
      "comment": "Excellent service",
      "reviewer_name": "John D.",
      "created_at": "2024-01-10"
    }
  ],
  "stats": {
    "response_rate": 95,
    "response_time": 30,
    "total_bookings": 50
  }
}
```

#### POST /api/workers/services

**Request Body:**

```json
{
  "category": "homecare",
  "service_type": "cooking",
  "service_details": {
    "cuisine_types": ["vietnamese", "chinese"],
    "max_people": 10
  },
  "hourly_rate": 200000,
  "daily_rate": 1500000,
  "monthly_rate": 30000000,
  "instant_booking": false
}
```

#### PUT /api/workers/availability

**Request Body:**

```json
{
  "recurring": [
    {
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "17:00"
    }
  ],
  "blocked_dates": ["2024-01-20", "2024-01-21"]
}
```

### 5.3 Booking APIs

#### POST /api/bookings

**Request Body:**

```json
{
  "worker_ids": ["uuid1", "uuid2"],
  "service_ids": ["uuid1", "uuid2"],
  "start_datetime": "2024-01-15T09:00:00Z",
  "end_datetime": "2024-01-15T17:00:00Z",
  "location": {
    "address": "123 Street, District 1",
    "lat": 10.7769,
    "lng": 106.7009,
    "instructions": "Gate code: 1234"
  },
  "notes": "Please bring cleaning supplies",
  "payment_method": "credit_card"
}
```

#### PUT /api/bookings/{id}/status

**Request Body:**

```json
{
  "status": "accepted|rejected|cancelled",
  "reason": "string (for rejection/cancellation)"
}
```

#### GET /api/bookings/{id}

**Response:**

```json
{
  "id": "uuid",
  "booking_code": "BK20240115001",
  "workers": [
    {
      "id": "uuid",
      "name": "Worker Name",
      "service": "Cooking"
    }
  ],
  "status": "confirmed",
  "payment_status": "paid",
  "start_datetime": "2024-01-15T09:00:00Z",
  "end_datetime": "2024-01-15T17:00:00Z",
  "location": {},
  "total_amount": 1500000,
  "can_cancel": true,
  "can_review": false
}
```

### 5.4 Review APIs

#### POST /api/reviews

**Request Body:**

```json
{
  "booking_id": "uuid",
  "rating": 5,
  "comment": "Excellent service",
  "service_rating": 5,
  "communication_rating": 5,
  "punctuality_rating": 5,
  "value_rating": 4,
  "photos": ["url1", "url2"]
}
```

### 5.5 Search APIs

#### GET /api/search

**Query Parameters:**

- q: search query
- type: workers|services
- filters: JSON object with filter criteria

**Response:**

```json
{
  "results": [],
  "facets": {
    "categories": [{ "value": "homecare", "count": 25 }],
    "price_ranges": [{ "min": 0, "max": 500000, "count": 30 }]
  }
}
```

## 6. Frontend Implementation với Next.js

### 6.1 Project Structure

```
/src
  /app
    /[locale]
      layout.tsx
      page.tsx
      /auth
        /login
        /register
        /forgot-password
      /workers
        page.tsx (list)
        /[id]
          page.tsx (detail)
      /dashboard
        /worker
          /profile
          /services
          /bookings
          /earnings
        /employer
          /bookings
          /favorites
      /bookings
        /new
        /[id]
      /messages
      /settings
  /components
    /common
      Header.tsx
      Footer.tsx
      LanguageSwitcher.tsx
    /auth
      LoginForm.tsx
      RegisterForm.tsx
    /worker
      WorkerCard.tsx
      WorkerProfile.tsx
      ServiceForm.tsx
    /booking
      BookingForm.tsx
      BookingCard.tsx
    /ui
      Button.tsx
      Input.tsx
      Modal.tsx
      Calendar.tsx
  /hooks
    useAuth.ts
    useWorkers.ts
    useBookings.ts
  /lib
    /supabase
      client.ts
      server.ts
    /utils
      formatters.ts
      validators.ts
  /locales
    /en
    /vi
    /zh
  /types
    index.ts
```

### 6.2 Key Components

#### 6.2.1 Worker Search & Filter

- Search bar với autocomplete
- Filter sidebar:
  - Category selector (single)
  - Location (city/district dropdown)
  - Price range slider
  - Rating filter (stars)
  - Availability calendar
  - Verified only toggle
- Sort options: Recommended, Price, Rating, Distance
- Grid/List view toggle
- Pagination hoặc infinite scroll

#### 6.2.2 Worker Profile Page

- Hero section: Cover photo + Avatar
- Basic info card
- Service & Pricing card
- Availability calendar (interactive)
- Reviews section với pagination
- Similar workers suggestion

#### 6.2.3 Booking Flow

- Multi-step form:
  1. Select services & workers
  2. Choose date & time
  3. Enter location details
  4. Review & confirm
  5. Payment
- Real-time price calculation
- Availability checking
- Booking confirmation page

#### 6.2.4 Dashboard Pages

**Worker Dashboard:**

- Today's schedule
- Pending booking requests
- Earnings overview (chart)
- Recent reviews
- Quick actions

**Employer Dashboard:**

- Upcoming bookings
- Favorite workers
- Booking history
- Saved searches

### 6.3 Mobile Responsive Design

- Bottom navigation cho mobile
- Touch-friendly UI elements
- Swipeable cards
- Native app-like interactions
- PWA configuration

## 7. Business Logic & Rules

### 7.1 Booking Rules

#### 7.1.1 Thời gian đặt tối thiểu

- **Hourly booking**: Tối thiểu 2 giờ
- **Daily booking**: Tối thiểu 1 ngày (8 giờ)
- **Monthly booking**: Tối thiểu 1 tháng (26 ngày làm việc)

#### 7.1.2 Advance Booking

- Có thể đặt trước tối đa 90 ngày
- Instant booking: Tối thiểu trước 2 giờ
- Request booking: Tối thiểu trước 24 giờ

#### 7.1.3 Cancellation Policy

**Cho Worker:**

- Hủy > 48h trước: Không phạt
- Hủy 24-48h trước: Phạt 20% booking value
- Hủy < 24h: Phạt 50% booking value
- No-show: Phạt 100% + bad rating

**Cho Employer:**

- Hủy > 48h trước: Hoàn tiền 100%
- Hủy 24-48h trước: Hoàn tiền 80%
- Hủy < 24h: Hoàn tiền 50%
- Sau khi service bắt đầu: Không hoàn tiền

#### 7.1.4 Multi-service Booking Rules

- Tối đa 5 workers trong 1 booking
- Tất cả workers phải available cùng thời gian
- Nếu 1 worker từ chối → Employer có thể:
  - Hủy toàn bộ booking
  - Tiếp tục với các workers đã accept
  - Tìm worker thay thế

### 7.2 Rating & Review System

#### 7.2.1 Review Timeline

- Chỉ được review sau khi service completed
- Deadline review: 7 ngày sau completion
- Không thể edit/delete sau khi post
- Worker có 3 ngày để response

#### 7.2.2 Rating Calculation

```
Overall Rating =
  (Service Rating × 0.4) +
  (Communication × 0.2) +
  (Punctuality × 0.2) +
  (Value × 0.2)
```

#### 7.2.3 Badge System

- **New**: < 10 bookings
- **Rising Star**: 10+ bookings, 4.5+ rating
- **Top Rated**: 50+ bookings, 4.8+ rating
- **Expert**: 100+ bookings, 4.9+ rating
- **Verified**: Đã xác thực identity + background check

### 7.3 Pricing & Payment

#### 7.3.1 Platform Fees

- Service fee (từ employer): 5% của booking value
- Commission (từ worker): 15% của earning
- Payment processing: 2.9% + 30¢ (Stripe)

#### 7.3.2 Payment Flow

1. **Booking created**: Employer pre-authorize payment
2. **Booking accepted**: Charge payment
3. **Service completed**:
   - Hold payment 24h (cho disputes)
   - Release 85% to worker
   - 15% platform commission
4. **Refund cases**:
   - Worker cancels/no-show: 100% refund
   - Employer cancels: Theo cancellation policy
   - Dispute resolution: Case by case

#### 7.3.3 Tip System

- Optional tipping sau service
- 100% tip goes to worker
- Suggested amounts: 10%, 15%, 20% hoặc custom

### 7.4 Trust & Safety

#### 7.4.1 Verification Levels

1. **Email verified**: Basic
2. **Phone verified**: +Trust
3. **ID verified**: ++Trust (upload CCCD/Passport)
4. **Background check**: +++Trust
5. **Skill certified**: Profession verified

#### 7.4.2 Safety Features

- **Emergency button** trong active booking
- **Share trip** feature cho employer
- **Check-in/Check-out** system
- **24/7 Support** hotline
- **Insurance coverage** cho damage/injury

#### 7.4.3 Content Moderation

- AI screening cho inappropriate content
- Manual review cho reported profiles
- Automated flag cho suspicious behavior
- Ban/Suspension system với appeals

### 7.5 Matching Algorithm

#### 7.5.1 Ranking Factors

```
Relevance Score =
  (Category Match × 0.3) +
  (Location Distance × 0.2) +
  (Availability Match × 0.2) +
  (Rating Score × 0.15) +
  (Response Rate × 0.1) +
  (Completion Rate × 0.05)
```

#### 7.5.2 Boost Factors

- New workers: 1.2x trong 30 ngày đầu
- Instant booking enabled: 1.1x
- Verified workers: 1.15x
- Premium subscription: 1.3x

## 8. Internationalization (i18n)

### 8.1 Supported Languages

- **English (en)**: Default
- **Tiếng Việt (vi)**: Primary market
- **中文 (zh)**: Simplified Chinese

### 8.2 Translation Strategy

#### 8.2.1 Static Content

- UI labels, buttons, navigation
- Error messages
- Email templates
- Terms & Conditions

#### 8.2.2 Dynamic Content

- Service descriptions: Multi-language input
- Reviews: Show original + translate button
- Messages: Auto-translate option
- Profile info: Store in multiple languages

### 8.3 Localization

#### 8.3.1 Currency

- Default: VND (₫)
- Support: USD ($), CNY (¥)
- Auto-convert based on user location

#### 8.3.2 Date & Time

- Format based on locale
- Timezone: Local timezone display
- Working hours: Local time

#### 8.3.3 Phone Numbers

- Country code selector
- Format validation per country
- SMS support for major carriers

## 9. Notification System

### 9.1 Notification Types

#### 9.1.1 Transactional Notifications

- **Booking requests**: Instant
- **Booking confirmations**: Instant
- **Payment confirmations**: Instant
- **Cancellations**: Instant
- **Review received**: Instant
- **Message received**: Instant

#### 9.1.2 Reminder Notifications

- **Upcoming booking**: 24h, 2h before
- **Review reminder**: 1, 3, 6 days after
- **Profile incomplete**: Weekly
- **Payment pending**: Daily

#### 9.1.3 Marketing Notifications

- **New workers nearby**: Weekly
- **Price drops**: When favorited worker reduces price
- **Promotions**: Bi-weekly max

### 9.2 Notification Channels

- **In-app**: Always on
- **Email**: Configurable
- **SMS**: Important only
- **Push**: Mobile app
- **WhatsApp**: Optional (popular in Vietnam)

### 9.3 Notification Preferences

```json
{
  "transactional": {
    "email": true,
    "sms": true,
    "push": true
  },
  "reminders": {
    "email": true,
    "sms": false,
    "push": true
  },
  "marketing": {
    "email": false,
    "sms": false,
    "push": false
  }
}
```

## 10. Analytics & Reporting

### 10.1 Worker Analytics

#### 10.1.1 Performance Metrics

- **Views**: Profile views (daily/weekly/monthly)
- **Conversion**: Views → Bookings rate
- **Earnings**: Gross/Net income charts
- **Ratings**: Rating trend over time
- **Response Time**: Average response time
- **Acceptance Rate**: Booking acceptance %

#### 10.1.2 Customer Insights

- **Repeat customers**: % and list
- **Popular services**: Most booked
- **Peak hours**: Busy time analysis
- **Geographic distribution**: Customer heatmap

### 10.2 Platform Analytics

#### 10.2.1 Business Metrics

- **GMV**: Gross Merchandise Value
- **Take rate**: Platform revenue %
- **Active users**: DAU/MAU
- **Retention**: Cohort analysis
- **LTV**: Customer lifetime value
- **CAC**: Customer acquisition cost

#### 10.2.2 Operational Metrics

- **Booking volume**: By category/location/time
- **Average booking value**: Trends
- **Service completion rate**
- **Dispute rate**: % of bookings
- **Support tickets**: Volume and resolution time

### 10.3 Reporting Dashboard

#### 10.3.1 Admin Dashboard

- Real-time metrics
- Geographic heatmaps
- Category performance
- Financial reports
- User growth charts
- Fraud detection alerts

#### 10.3.2 Worker Dashboard

- Earnings summary
- Booking calendar
- Performance scorecard
- Competitor analysis
- Improvement suggestions

## 11. Technical Implementation Details

### 11.1 Supabase Configuration

#### 11.1.1 Authentication Setup

```javascript
// supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

#### 11.1.2 Realtime Subscriptions

```javascript
// Subscribe to booking updates
const bookingSubscription = supabase
  .channel("bookings")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "bookings",
      filter: `employer_id=eq.${userId}`,
    },
    (payload) => {
      handleBookingUpdate(payload.new);
    }
  )
  .subscribe();

// Subscribe to messages
const messageSubscription = supabase
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `receiver_id=eq.${userId}`,
    },
    (payload) => {
      handleNewMessage(payload.new);
    }
  )
  .subscribe();
```

#### 11.1.3 Storage Configuration

```javascript
// Upload avatar
const uploadAvatar = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  return supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl;
};
```

### 11.2 Next.js Implementation

#### 11.2.1 API Route Handler

```typescript
// app/api/workers/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  const supabase = createRouteHandlerClient({ cookies });

  let query = supabase
    .from("worker_profiles")
    .select(
      `
      *,
      services!inner(
        category,
        hourly_rate,
        daily_rate
      ),
      reviews(
        rating
      )
    `
    )
    .eq("is_active", true);

  if (category) {
    query = query.eq("services.category", category);
  }

  if (city) {
    query = query.eq("city", city);
  }

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order("rating_average", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    workers: data,
    pagination: {
      page,
      total_pages: Math.ceil((count || 0) / limit),
      total_items: count,
    },
  });
}
```

#### 11.2.2 Server Component với Data Fetching

```typescript
// app/[locale]/workers/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data: workers } = await supabase
    .from("worker_profiles")
    .select(
      `
      *,
      services(*)
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="container mx-auto px-4">
      <WorkerGrid workers={workers} />
    </div>
  );
}
```

### 11.3 Performance Optimization

#### 11.3.1 Database Optimization

- Composite indexes cho complex queries
- Materialized views cho analytics
- Connection pooling với pgBouncer
- Query result caching với Redis

#### 11.3.2 Frontend Optimization

- Image optimization với Next.js Image
- Lazy loading components
- Code splitting per route
- Service Worker cho offline support
- CDN cho static assets

#### 11.3.3 Caching Strategy

- **Static pages**: ISR với revalidate 3600s
- **API responses**: Cache-Control headers
- **User data**: SWR với revalidation
- **Search results**: 5 phút cache
- **Worker profiles**: 15 phút cache

## 12. Security Considerations

### 12.1 Authentication & Authorization

- JWT tokens với refresh rotation
- Session management với secure cookies
- 2FA cho high-value accounts
- OAuth providers: Google, Facebook
- Rate limiting cho login attempts

### 12.2 Data Protection

- Encryption at rest (Supabase default)
- TLS 1.3 cho data in transit
- PII masking trong logs
- GDPR compliance
- Regular security audits

### 12.3 Payment Security

- PCI DSS compliance qua Stripe
- No credit card storage on platform
- Tokenization cho recurring payments
- Fraud detection rules
- Chargeback handling

### 12.4 Content Security

- XSS prevention với CSP headers
- CSRF protection với tokens
- Input validation & sanitization
- File upload scanning
- Rate limiting cho APIs

## 13. Deployment & DevOps

### 13.1 Infrastructure

- **Hosting**: Vercel (Next.js)
- **Database**: Supabase (PostgreSQL)
- **CDN**: Cloudflare
- **Monitoring**: Sentry, LogRocket
- **Analytics**: Google Analytics, Mixpanel

### 13.3 Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
GOOGLE_MAPS_API_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
SENTRY_DSN=
```

## 15. Future Enhancements

### 15.1 Phase 2 Features

- Video profiles cho workers
- Voice/Video calling
- AR try-on cho beauty services
- AI matching suggestions
- Subscription plans cho workers
- Loyalty program
- Corporate accounts

### 15.2 Phase 3 Features

- Mobile apps (React Native)
- Smart scheduling với AI
- Dynamic pricing
- Blockchain verification
- Insurance partnerships
- Equipment rental
- Training & certification program

### 15.3 Market Expansion

- Additional languages (Thai, Japanese, Korean)
- Regional payment methods
- Local regulations compliance
- Partnership với local businesses
- Franchise model
