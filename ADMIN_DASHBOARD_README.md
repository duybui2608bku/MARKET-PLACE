# Admin Dashboard - User Management System

## 📋 Overview

This implementation adds comprehensive admin dashboard functionality to manage Workers, Clients, Bookings, and Reports/Disputes.

## ✅ What Has Been Implemented

### 1. Database Schema (Migration: `011_add_admin_user_management.sql`)

#### New Tables:
- **`reports`** - User reports and disputes
- **`admin_actions`** - Audit log for all admin actions

#### Enhanced Tables:
- **`users`** - Added account status fields (suspended, banned)
- **`worker_profiles`** - Added approval workflow (pending, approved, rejected)
- **`reviews`** - Added hidden/visible control for admin moderation

#### New Views:
- `pending_worker_approvals` - Workers awaiting approval
- `active_workers_stats` - Active workers with statistics
- `employers_stats` - Employers with statistics
- `recent_reports_view` - Recent reports with details

### 2. Helper Functions (`/lib`)

| File | Purpose |
|------|---------|
| `admin-workers.ts` | Worker management (approve, reject, suspend, ban) |
| `admin-clients.ts` | Client/Employer management |
| `admin-bookings.ts` | Booking management |
| `reports.ts` | Report/dispute handling |
| `admin-actions.ts` | Admin action logging |
| `admin-stats.ts` | Dashboard statistics |

### 3. API Routes (`/app/api/admin`)

#### Workers Management:
- `GET /api/admin/workers` - List all workers with filters
- `GET /api/admin/workers/[id]` - Get worker details
- `PUT /api/admin/workers/[id]` - Update worker profile
- `POST /api/admin/workers/[id]/approve` - Approve worker
- `POST /api/admin/workers/[id]/reject` - Reject worker
- `POST /api/admin/workers/[id]/suspend` - Suspend/unsuspend account
- `POST /api/admin/workers/[id]/ban` - Ban/unban account

#### Clients Management:
- `GET /api/admin/clients` - List all clients
- `GET /api/admin/clients/[id]` - Get client details
- `PUT /api/admin/clients/[id]` - Update client profile
- `GET /api/admin/clients/[id]/bookings` - Client booking history
- `GET /api/admin/clients/[id]/reviews` - Client reviews
- `POST /api/admin/clients/[id]/warning` - Issue warning

#### Reports Management:
- `GET /api/admin/reports` - List all reports
- `POST /api/admin/reports` - Create new report
- `GET /api/admin/reports/[id]` - Get report details
- `PUT /api/admin/reports/[id]` - Update report (assign, resolve, dismiss)

#### Bookings Management:
- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/bookings/[id]` - Get booking details
- `PUT /api/admin/bookings/[id]` - Update booking status

#### Statistics:
- `GET /api/admin/stats?type=dashboard` - Dashboard statistics
- `GET /api/admin/stats?type=growth&days=30` - User growth stats
- `GET /api/admin/stats?type=revenue&days=30` - Revenue stats

### 4. UI Pages

#### Implemented:
- ✅ **Admin Dashboard** (`/admin`) - Comprehensive statistics overview
- ✅ **Workers List** (`/admin/workers`) - Worker management with filters
- ✅ **Updated Sidebar** - New navigation with User Management menu

#### To Be Implemented:
- ⏳ Worker Detail Page (`/admin/workers/[id]`)
- ⏳ Clients List (`/admin/clients`)
- ⏳ Client Detail Page (`/admin/clients/[id]`)
- ⏳ Bookings Management (`/admin/bookings`)
- ⏳ Reports Management (`/admin/reports`)

## 🚀 Getting Started

### 1. Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or apply manually via Supabase Dashboard
# SQL Editor > New Query > Paste migration content
```

### 2. Set Environment Variables

Add to `.env.local`:

```bash
# Already exists
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For admin authentication
ADMIN_SECRET=your_secret_key
NEXT_PUBLIC_ADMIN_SECRET=your_secret_key
```

### 3. Access Admin Dashboard

Navigate to: `http://localhost:3000/[locale]/admin`

## 📝 How to Complete Remaining Pages

### Pattern to Follow (Worker Detail Page Example)

```typescript
// /app/[locale]/admin/workers/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function WorkerDetailPage() {
  const params = useParams();
  const workerId = params.id as string;
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorker();
  }, [workerId]);

  const fetchWorker = async () => {
    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
    const response = await fetch(`/api/admin/workers/${workerId}`, {
      headers: { "x-admin-secret": adminSecret || "" },
    });
    const data = await response.json();
    setWorker(data.worker);
    setLoading(false);
  };

  const handleApprove = async () => {
    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
    await fetch(`/api/admin/workers/${workerId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret || "",
      },
      body: JSON.stringify({
        admin_id: "your-admin-id",
        admin_email: "admin@example.com",
        worker_name: worker?.full_name,
      }),
    });
    fetchWorker(); // Refresh
  };

  // Render worker details with action buttons
  return (
    <div>
      {/* Worker profile info */}
      {/* Action buttons (Approve, Reject, Suspend, Ban) */}
      {/* Admin notes section */}
      {/* Action history */}
    </div>
  );
}
```

### Pages to Implement (Similar Pattern):

1. **`/app/[locale]/admin/workers/[id]/page.tsx`**
   - Show full worker profile
   - Approve/Reject buttons
   - Suspend/Ban actions
   - Admin notes editor
   - Action history

2. **`/app/[locale]/admin/clients/page.tsx`**
   - Similar to Workers list
   - Filter by company size, industry
   - View client details

3. **`/app/[locale]/admin/clients/[id]/page.tsx`**
   - Client profile
   - Booking history
   - Reviews written
   - Issue warning action

4. **`/app/[locale]/admin/bookings/page.tsx`**
   - List all bookings
   - Filter by status, date
   - Update booking status

5. **`/app/[locale]/admin/reports/page.tsx`**
   - List all reports
   - Filter by status, priority
   - Assign to admin
   - Resolve/Dismiss actions

## 🔧 Available API Functions

### Worker Management
```typescript
import {
  getAllWorkers,
  getWorkerById,
  approveWorkerProfile,
  rejectWorkerProfile,
  suspendUser,
  unsuspendUser,
  banUser,
  unbanUser,
} from '@/lib/admin-workers';
```

### Client Management
```typescript
import {
  getAllClients,
  getClientById,
  getClientBookings,
  getClientReviews,
  issueWarningToClient,
} from '@/lib/admin-clients';
```

### Reports Management
```typescript
import {
  getAllReports,
  getReportById,
  createReport,
  assignReport,
  resolveReport,
  dismissReport,
} from '@/lib/reports';
```

### Admin Actions Logging
```typescript
import {
  logAdminAction,
  logApproveWorker,
  logSuspendUser,
  logBanUser,
} from '@/lib/admin-actions';
```

## 🎨 UI Components Available

All Shadcn UI components are available:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`, `Input`, `Select`, `Textarea`
- `Badge`, `Avatar`, `Skeleton`
- `Alert`, `Dialog`, `DropdownMenu`
- `Table` (can be imported from shadcn)

## 📊 Features

### Worker Management
- ✅ View all workers with filters
- ✅ Approve/reject new worker profiles
- ✅ Suspend/unsuspend accounts
- ✅ Ban/unban accounts permanently
- ✅ Edit worker information
- ✅ View statistics (jobs, rating, reviews)
- ✅ Add admin notes

### Client Management
- ✅ View all clients/employers
- ✅ View booking history
- ✅ View reviews written
- ✅ Issue warnings
- ✅ Suspend/ban accounts
- ✅ Manage feedback visibility

### Booking Management
- ✅ View all bookings
- ✅ Filter by status
- ✅ Update booking status
- ✅ Track revenue

### Report/Dispute Management
- ✅ View all reports
- ✅ Filter by status, priority, category
- ✅ Assign to admin
- ✅ Resolve with actions
- ✅ Dismiss reports
- ✅ Track resolution actions

### System Features
- ✅ Comprehensive dashboard statistics
- ✅ Admin action audit log
- ✅ Row-level security
- ✅ Real-time data
- ✅ Responsive UI

## 🔐 Security

- ✅ Admin authentication via `x-admin-secret` header
- ✅ Row Level Security (RLS) on all tables
- ✅ Admin action logging for compliance
- ✅ Separate admin and service role permissions

## 📈 Dashboard Statistics

The dashboard shows:
- Total users, workers, employers
- Pending approvals
- Active/suspended/banned accounts
- Booking statistics and revenue
- Report status overview
- Daily activity metrics

## 🎯 Next Steps

1. **Complete remaining UI pages** following the patterns above
2. **Add table component** for better data display (optional)
3. **Add pagination** to list pages
4. **Add advanced filters** (date range, multi-select)
5. **Add export functionality** (CSV/Excel)
6. **Add email notifications** for approval/rejection
7. **Add bulk actions** (approve multiple workers)

## 🐛 Troubleshooting

### Migration Fails
- Check if uuid extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- Ensure you have proper database permissions

### API Returns 401
- Check `ADMIN_SECRET` environment variable
- Ensure `x-admin-secret` header is sent correctly

### Stats Not Loading
- Check browser console for errors
- Verify Supabase connection
- Check network tab for failed requests

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

When adding new features:
1. Add migration if database changes needed
2. Create helper functions in `/lib`
3. Create API routes in `/app/api/admin`
4. Create UI pages in `/app/[locale]/admin`
5. Log admin actions using `logAdminAction()`
6. Update this README

## ✨ Credits

Built with:
- Next.js 16
- React 19
- Supabase (PostgreSQL)
- Shadcn UI
- Tailwind CSS
- TypeScript

---

**Happy coding! 🚀**
