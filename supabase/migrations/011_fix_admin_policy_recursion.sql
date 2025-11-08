-- Fix infinite recursion in admin policies
-- This migration fixes the "infinite recursion detected in policy for relation users" error

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Create a function to check admin role with SECURITY DEFINER
-- This bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Recreate admin policies using the function
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any user"
  ON public.users
  FOR UPDATE
  USING (public.is_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS 'Check if current user has admin role. Uses SECURITY DEFINER to bypass RLS.';
