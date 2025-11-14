-- Migration: add_pdf_to_orders_and_admin_policies
-- Created at: 1762201325

-- Orders tablosuna PDF field'ları ekle
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pdf_name TEXT;

-- Admin kullanıcılar için orders RLS policies
DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;
CREATE POLICY "Admin users can view all orders"
ON orders FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin users can update orders" ON orders;
CREATE POLICY "Admin users can update orders"
ON orders FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Comment
COMMENT ON COLUMN orders.pdf_url IS 'PDF fiş URL (e-ticaret müşterileri için)';
COMMENT ON COLUMN orders.pdf_name IS 'PDF fiş dosya adı';;