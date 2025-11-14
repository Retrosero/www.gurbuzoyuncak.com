-- Fix RLS policies for brand-logos storage bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "brand_logos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "brand_logos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "brand_logos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "brand_logos_delete_policy" ON storage.objects;

-- Create comprehensive RLS policies for brand-logos bucket
-- Public can view brand logos
CREATE POLICY "brand_logos_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'brand-logos');

-- Authenticated users can upload brand logos
CREATE POLICY "brand_logos_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'brand-logos' AND 
    auth.role() = 'authenticated'
  );

-- Authenticated users can update brand logos
CREATE POLICY "brand_logos_update_policy" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'brand-logos' AND 
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'brand-logos' AND 
    auth.role() = 'authenticated'
  );

-- Authenticated users can delete brand logos
CREATE POLICY "brand_logos_delete_policy" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'brand-logos' AND 
    auth.role() = 'authenticated'
  );

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- Also ensure service role can do everything
CREATE POLICY "brand_logos_service_role_policy" ON storage.objects
  FOR ALL
  USING (bucket_id = 'brand-logos' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'brand-logos' AND auth.role() = 'service_role');