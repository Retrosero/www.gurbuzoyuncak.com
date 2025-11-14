-- Migration: fix_admin_rls_use_role_field
-- Created at: 1762197351


-- Drop old policies that check customer_type='Admin'
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;

-- Create new policies that check role='admin'
CREATE POLICY "Admin users can insert products" ON products
FOR INSERT TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin users can update products" ON products
FOR UPDATE TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin users can delete products" ON products
FOR DELETE TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Same for product_images table
DROP POLICY IF EXISTS "Admin can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Admin can update product_images" ON product_images;
DROP POLICY IF EXISTS "Admin can delete product_images" ON product_images;

CREATE POLICY "Admin users can insert product_images" ON product_images
FOR INSERT TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin users can update product_images" ON product_images
FOR UPDATE TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin users can delete product_images" ON product_images
FOR DELETE TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

COMMENT ON TABLE products IS 'Products table with role-based admin RLS policies';
;