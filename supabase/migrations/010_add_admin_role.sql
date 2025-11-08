-- Add 'admin' role to users table
-- This allows certain users to access admin panel

-- Drop the existing constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with admin role
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('worker', 'employer', 'admin'));

-- Create a view for admins
CREATE OR REPLACE VIEW public.admins AS
SELECT * FROM public.users WHERE role = 'admin';

-- Grant permissions
GRANT SELECT ON public.admins TO authenticated;

-- Update comment
COMMENT ON COLUMN public.users.role IS 'Vai trò: worker (người lao động), employer (người thuê), hoặc admin (quản trị viên)';

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update any user
CREATE POLICY "Admins can update any user"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
