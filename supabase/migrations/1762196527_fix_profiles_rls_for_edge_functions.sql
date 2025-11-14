-- Migration: fix_profiles_rls_for_edge_functions
-- Created at: 1762196527

-- Edge function'ların profiles okuyabilmesi için
CREATE POLICY "Edge functions can read profiles" ON profiles
  FOR SELECT
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

-- Admin kullanıcılar tüm profilleri görebilsin
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.customer_type = 'Admin'
    )
  );;