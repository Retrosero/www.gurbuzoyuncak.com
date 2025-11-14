-- Migration: fix_products_rls_for_xml_sync
-- Created at: 1762255251

-- Products tablosu için RLS politikaları düzelt
-- Mevcut politikaları sil ve yeniden oluştur

DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "Service role full access" ON products;

-- Public okuma (aktif ürünler)
CREATE POLICY "Public can view active products" ON products
    FOR SELECT
    USING (is_active = true OR auth.role() IN ('anon', 'service_role', 'authenticated'));

-- Admin ve service role tam erişim
CREATE POLICY "Admin and service role full access" ON products
    FOR ALL
    USING (auth.role() IN ('anon', 'service_role', 'authenticated'))
    WITH CHECK (auth.role() IN ('anon', 'service_role', 'authenticated'));;