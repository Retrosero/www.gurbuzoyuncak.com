-- Migration: add_admin_coupon_policies
-- Created at: 1761925948

-- Admin kullanıcıları için coupons tablosu politikaları

-- INSERT politikası (authenticated kullanıcılar kupon oluşturabilir)
CREATE POLICY "Authenticated users can insert coupons"
ON coupons FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE politikası (authenticated kullanıcılar kupon güncelleyebilir)
CREATE POLICY "Authenticated users can update coupons"
ON coupons FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE politikası (authenticated kullanıcılar kupon silebilir)
CREATE POLICY "Authenticated users can delete coupons"
ON coupons FOR DELETE
TO authenticated
USING (true);

-- SELECT politikası zaten var mı kontrol et, yoksa ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'coupons' AND policyname = 'Authenticated users can select coupons'
    ) THEN
        CREATE POLICY "Authenticated users can select coupons"
        ON coupons FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;;