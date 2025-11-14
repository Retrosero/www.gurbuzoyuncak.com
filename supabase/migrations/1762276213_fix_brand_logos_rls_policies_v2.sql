-- Migration: fix_brand_logos_rls_policies_v2
-- Created at: 1762276213

-- Brand-logos storage bucket için RLS policy'leri oluştur (düzeltilmiş)
-- INSERT policy - admin kullanıcılar logo yükleyebilir
CREATE POLICY "Allow authenticated users to insert brand logos" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'brand-logos');

-- SELECT policy - herkes logo görebilir (public access)
CREATE POLICY "Allow public read access to brand logos" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'brand-logos');

-- UPDATE policy - sadece kendi yüklediği logoları güncelleyebilir
CREATE POLICY "Allow users to update their own brand logos" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'brand-logos' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'brand-logos');

-- DELETE policy - sadece kendi yüklediği logoları silebilir
CREATE POLICY "Allow users to delete their own brand logos" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'brand-logos' AND auth.uid() = owner);

-- Service role için tam erişim
CREATE POLICY "Allow service role full access to brand logos" 
ON storage.objects 
FOR ALL 
TO service_role
USING (bucket_id = 'brand-logos')
WITH CHECK (bucket_id = 'brand-logos');;