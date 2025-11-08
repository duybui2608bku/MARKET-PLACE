-- Create storage bucket for admin images (logos, og images, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-images', 'admin-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for admin-images bucket
CREATE POLICY IF NOT EXISTS "Anyone can view admin images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'admin-images');

-- Allow authenticated admin users to upload admin images
CREATE POLICY IF NOT EXISTS "Admins can upload admin images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'admin-images'
    AND auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- Allow authenticated admin users to update admin images
CREATE POLICY IF NOT EXISTS "Admins can update admin images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'admin-images'
    AND auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- Allow authenticated admin users to delete admin images
CREATE POLICY IF NOT EXISTS "Admins can delete admin images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'admin-images'
    AND auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );
