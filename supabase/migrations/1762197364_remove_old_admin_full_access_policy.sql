-- Migration: remove_old_admin_full_access_policy
-- Created at: 1762197364


-- Remove old "Admin full access" policy that checks customer_type
DROP POLICY IF EXISTS "Admin full access to products" ON products;

-- Verify remaining policies use role field
COMMENT ON POLICY "Admin users can insert products" ON products IS 'Uses role=admin field';
COMMENT ON POLICY "Admin users can update products" ON products IS 'Uses role=admin field';
COMMENT ON POLICY "Admin users can delete products" ON products IS 'Uses role=admin field';
;