-- Migration: fix_products_rls_admin_access
-- Created at: 1762196459

-- Admin kullanıcılar için tam erişim politikası
CREATE POLICY "Admin full access to products" ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.customer_type = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.customer_type = 'Admin'
    )
  );

-- Anon ve authenticated kullanıcılar için SELECT (tüm ürünler)
CREATE POLICY "Authenticated users can view all products" ON products
  FOR SELECT
  USING (auth.role() IN ('anon', 'authenticated'));

-- Edge function'lar için INSERT/UPDATE izni (anon role ile)
CREATE POLICY "Edge functions can insert products" ON products
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Edge functions can update products" ON products
  FOR UPDATE
  USING (auth.role() IN ('anon', 'service_role'))
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Eski "Public can read products" politikasını sil (conflict oluşturuyor)
DROP POLICY IF EXISTS "Public can read products" ON products;;