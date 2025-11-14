-- Migration: fix_product_images_rls
-- Created at: 1762196492

-- Admin kullanıcılar ve edge function'lar için product_images INSERT
CREATE POLICY "Admin can insert product_images" ON product_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.customer_type = 'Admin'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Admin kullanıcılar için UPDATE
CREATE POLICY "Admin can update product_images" ON product_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.customer_type = 'Admin'
    )
  );

-- Admin kullanıcılar için DELETE
CREATE POLICY "Admin can delete product_images" ON product_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.customer_type = 'Admin'
    )
  );

-- product_files için edge function desteği ekle
DROP POLICY IF EXISTS "product_files_insert_policy" ON product_files;

CREATE POLICY "product_files_insert_policy" ON product_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.customer_type = 'Admin'
    )
    OR auth.role() IN ('anon', 'service_role')
  );;