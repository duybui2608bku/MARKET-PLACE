-- =============================================
-- Migration: Setup Storage for Worker Galleries
-- Description: Create storage buckets for gallery and service images
-- =============================================

-- 1. Create bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('galleries', 'galleries', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('services', 'services', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for galleries bucket
-- Policy: Anyone can view gallery images
CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'galleries');

-- Policy: Authenticated users can upload their own gallery images
CREATE POLICY "Users can upload their own gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'galleries' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own gallery images
CREATE POLICY "Users can update their own gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'galleries'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'galleries'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own gallery images
CREATE POLICY "Users can delete their own gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'galleries'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Storage policies for services bucket
-- Policy: Anyone can view service images
CREATE POLICY "Service images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'services');

-- Policy: Authenticated users can upload their own service images
CREATE POLICY "Users can upload their own service images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'services' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own service images
CREATE POLICY "Users can update their own service images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own service images
CREATE POLICY "Users can delete their own service images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration';

-- =============================================
-- END MIGRATION
-- =============================================

