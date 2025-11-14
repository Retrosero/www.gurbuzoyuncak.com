-- Kupon Sistemi Geliştirmeleri
-- Mevcut coupons tablosuna yeni özellikler ekliyoruz

-- 1. coupons tablosuna yeni kolonlar ekle
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS category_ids JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS customer_types JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS per_user_limit INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;

-- 2. Kupon kullanım geçmişi tablosu
CREATE TABLE IF NOT EXISTS coupon_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coupon_id, user_id, order_id)
);

-- 3. RLS politikaları
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi kupon geçmişlerini görebilir
CREATE POLICY "Kullanıcılar kendi kupon geçmişlerini görebilir"
ON coupon_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Servis rolü tüm işlemleri yapabilir
CREATE POLICY "Servis rolü tüm işlemleri yapabilir"
ON coupon_usage FOR ALL
TO service_role
USING (true);

-- 4. Kullanışlı kuponlar ekle
INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, usage_limit, per_user_limit, is_active, start_date, end_date, description, customer_types)
VALUES 
  ('YENI2025', 'percentage', 20, 0, 100, 1, true, NOW(), NOW() + INTERVAL '30 days', 'Yeni üyelere özel %20 indirim', '["B2C"]'::jsonb),
  ('BABY25', 'percentage', 25, 200, NULL, NULL, true, NOW(), NOW() + INTERVAL '60 days', 'Bebek oyuncaklarında %25 indirim', NULL),
  ('WELCOME10', 'percentage', 10, 100, NULL, NULL, true, NOW(), NOW() + INTERVAL '90 days', 'Hoşgeldin kuponu - %10 indirim', NULL),
  ('BIZ30', 'percentage', 30, 1000, 50, NULL, true, NOW(), NOW() + INTERVAL '60 days', 'Toplu alımlarda %30 indirim', '["B2B", "Toptan", "Kurumsal"]'::jsonb),
  ('KASIM25', 'percentage', 25, 500, 200, 2, true, NOW(), NOW() + INTERVAL '30 days', 'Kasım ayı kampanyası', NULL)
ON CONFLICT (code) DO NOTHING;

-- 5. İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- 6. Kupon kullanım sayısını güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE coupons 
    SET used_count = used_count + 1 
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS trigger_update_coupon_usage ON coupon_usage;
CREATE TRIGGER trigger_update_coupon_usage
AFTER INSERT ON coupon_usage
FOR EACH ROW
EXECUTE FUNCTION update_coupon_usage_count();
