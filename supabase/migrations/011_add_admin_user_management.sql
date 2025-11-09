-- Migration: Add Admin User Management Features
-- Adds status fields, reports, and admin action logging

-- ============================================
-- 1. Add status fields to users table
-- ============================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned', 'pending_verification'));

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES public.users(id);

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.users(id);

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- ============================================
-- 2. Add approval status to worker_profiles
-- ============================================

ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);

ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.worker_profiles
ADD COLUMN IF NOT EXISTS profile_status TEXT DEFAULT 'draft' CHECK (profile_status IN ('draft', 'active', 'inactive', 'suspended'));

-- ============================================
-- 3. Create reports/disputes table
-- ============================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reporter info
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reporter_role TEXT NOT NULL CHECK (reporter_role IN ('worker', 'employer', 'admin')),

  -- Reported entity
  reported_type TEXT NOT NULL CHECK (reported_type IN ('worker', 'employer', 'booking', 'review')),
  reported_id UUID NOT NULL, -- ID of worker, employer, booking, or review
  reported_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- User being reported

  -- Report details
  category TEXT NOT NULL CHECK (category IN ('inappropriate_behavior', 'fraud', 'spam', 'harassment', 'poor_service', 'payment_issue', 'fake_review', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Screenshots, documents

  -- Status & resolution
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  assigned_to UUID REFERENCES public.users(id), -- Admin handling the case
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),

  -- Actions taken
  action_taken TEXT, -- Description of action
  warning_issued BOOLEAN DEFAULT FALSE,
  account_suspended BOOLEAN DEFAULT FALSE,
  account_banned BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for reports
CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX idx_reports_reported_type_id ON public.reports(reported_type, reported_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

-- ============================================
-- 4. Create admin action log table
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Admin who performed the action
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,

  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'approve_worker', 'reject_worker',
    'suspend_user', 'unsuspend_user',
    'ban_user', 'unban_user',
    'update_user_info', 'update_worker_profile', 'update_employer_profile',
    'delete_review', 'hide_review', 'unhide_review',
    'assign_report', 'resolve_report', 'dismiss_report',
    'update_booking_status',
    'other'
  )),

  -- Target of action
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'worker_profile', 'employer_profile', 'booking', 'review', 'report')),
  target_id UUID NOT NULL,
  target_name TEXT, -- Display name for logs

  -- Changes made
  changes JSONB, -- Before/after values
  reason TEXT,
  notes TEXT,

  -- Metadata
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for admin actions
CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_action_type ON public.admin_actions(action_type);
CREATE INDEX idx_admin_actions_target_type_id ON public.admin_actions(target_type, target_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at DESC);

-- ============================================
-- 5. Update reviews table to support hiding
-- ============================================

ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS hidden_by UUID REFERENCES public.users(id);

ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

-- ============================================
-- 6. Add admin notes to users
-- ============================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;

-- ============================================
-- 7. Update trigger for updated_at
-- ============================================

-- Trigger function for reports
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- ============================================
-- 8. Create views for admin dashboard
-- ============================================

-- View: Pending worker approvals
CREATE OR REPLACE VIEW public.pending_worker_approvals AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.avatar_url,
  u.created_at as user_created_at,
  wp.bio,
  wp.service_type,
  wp.service_categories,
  wp.hourly_rate,
  wp.city,
  wp.district,
  wp.approval_status,
  wp.created_at as profile_created_at,
  wp.setup_completed
FROM public.users u
INNER JOIN public.worker_profiles wp ON u.id = wp.id
WHERE u.role = 'worker'
  AND wp.approval_status = 'pending'
  AND wp.setup_completed = TRUE
ORDER BY wp.created_at DESC;

-- View: Active workers with stats
CREATE OR REPLACE VIEW public.active_workers_stats AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.avatar_url,
  u.account_status,
  wp.bio,
  wp.service_type,
  wp.hourly_rate,
  wp.rating,
  wp.total_reviews,
  wp.completed_jobs,
  wp.total_jobs,
  wp.city,
  wp.approval_status,
  wp.profile_status,
  wp.created_at
FROM public.users u
INNER JOIN public.worker_profiles wp ON u.id = wp.id
WHERE u.role = 'worker'
ORDER BY wp.created_at DESC;

-- View: All employers with stats
CREATE OR REPLACE VIEW public.employers_stats AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.avatar_url,
  u.phone,
  u.account_status,
  u.created_at,
  ep.company_name,
  ep.industry,
  ep.company_size,
  ep.city,
  ep.total_jobs_posted,
  ep.total_hires,
  ep.is_verified
FROM public.users u
INNER JOIN public.employer_profiles ep ON u.id = ep.id
WHERE u.role = 'employer'
ORDER BY u.created_at DESC;

-- View: Recent reports
CREATE OR REPLACE VIEW public.recent_reports_view AS
SELECT
  r.id,
  r.reporter_id,
  reporter.full_name as reporter_name,
  reporter.email as reporter_email,
  r.reported_type,
  r.reported_id,
  r.reported_user_id,
  reported.full_name as reported_user_name,
  reported.email as reported_user_email,
  r.category,
  r.title,
  r.status,
  r.priority,
  r.assigned_to,
  admin.full_name as assigned_admin_name,
  r.created_at,
  r.updated_at
FROM public.reports r
LEFT JOIN public.users reporter ON r.reporter_id = reporter.id
LEFT JOIN public.users reported ON r.reported_user_id = reported.id
LEFT JOIN public.users admin ON r.assigned_to = admin.id
ORDER BY r.created_at DESC;

-- ============================================
-- 9. Row Level Security (RLS) Policies
-- ============================================

-- Reports table policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can do everything
CREATE POLICY "Service role can manage reports"
  ON public.reports FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admin actions table policies
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin actions
CREATE POLICY "Admins can view admin actions"
  ON public.admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can create admin actions
CREATE POLICY "Admins can create admin actions"
  ON public.admin_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can do everything
CREATE POLICY "Service role can manage admin actions"
  ON public.admin_actions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 10. Comments and documentation
-- ============================================

COMMENT ON TABLE public.reports IS 'Stores user reports and disputes for admin review';
COMMENT ON TABLE public.admin_actions IS 'Audit log of all admin actions for compliance';
COMMENT ON COLUMN public.users.account_status IS 'User account status: active, suspended, banned, pending_verification';
COMMENT ON COLUMN public.worker_profiles.approval_status IS 'Worker profile approval status: pending, approved, rejected';
COMMENT ON COLUMN public.worker_profiles.profile_status IS 'Worker profile visibility: draft, active, inactive, suspended';
