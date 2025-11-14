-- Migration: BAYİ PANELİ SİSTEMİ
-- Created at: 1762000000

-- BAYİ PANELİ SİSTEMİ - Gelişmiş özellikler

-- 1. Profiles tablosuna bayi-specific alanlar ekle
DO $$
BEGIN
    -- Bayi durumu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_bayi'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_bayi BOOLEAN DEFAULT false;
    END IF;
    
    -- Bayi indirim yüzdesi
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bayi_discount_percentage'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bayi_discount_percentage DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Bayi kodu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bayi_code'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bayi_code VARCHAR(50) UNIQUE;
    END IF;
    
    -- Bayi durumu (active, suspended, pending)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bayi_status'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bayi_status VARCHAR(20) DEFAULT 'active';
    END IF;
    
    -- VIP seviyesi
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'vip_level'
    ) THEN
        ALTER TABLE profiles ADD COLUMN vip_level INTEGER DEFAULT 1;
    END IF;
END $$;

-- 2. Bayi siparişleri tablosu
CREATE TABLE IF NOT EXISTS bayi_orders (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    bayi_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    bayi_discount_percentage DECIMAL(5,2),
    original_total DECIMAL(10,2),
    discounted_total DECIMAL(10,2),
    savings_amount DECIMAL(10,2) GENERATED ALWAYS AS (original_total - discounted_total) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bayi ürünleri view (calculated fiyatlarla)
CREATE OR REPLACE VIEW bayi_products_view AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.original_price,
    p.bayi_price,
    p.category_id,
    p.brand_id,
    p.stock_quantity,
    p.image_urls,
    p.slug,
    p.status,
    c.name as category_name,
    b.name as brand_name,
    -- Bayi indirimli fiyat hesaplama
    CASE 
        WHEN p.bayi_price IS NOT NULL THEN p.bayi_price
        ELSE p.original_price * (1 - (COALESCE(prof.bayi_discount_percentage, 0) / 100))
    END as calculated_bayi_price
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
CROSS JOIN LATERAL (
    SELECT 
        COALESCE(pf.bayi_discount_percentage, 0) as bayi_discount_percentage
    FROM profiles pf
    WHERE pf.is_bayi = true
    LIMIT 1
) prof
WHERE p.status = 'active';

-- 4. RLS Politikaları - Bayi paneli için

-- Bayi siparişleri policy
ALTER TABLE bayi_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bayi kendi siparişlerini görebilir"
ON bayi_orders FOR SELECT
TO authenticated
USING (auth.uid() = bayi_id);

CREATE POLICY "Servis rolü tüm bayi siparişlerini yönetebilir"
ON bayi_orders FOR ALL
TO service_role
USING (true);

-- Bayi products view policy (sadece bayi'ler görebilir)
ALTER VIEW bayi_products_view SET (security_invoker = on);

-- 5. Fonksiyonlar

-- Bayi fiyat hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_bayi_price(product_id INTEGER, discount_percentage DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT original_price * (1 - (discount_percentage / 100))
        FROM products
        WHERE id = product_id
    );
END;
$$ LANGUAGE plpgsql;

-- Bayi sipariş oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_bayi_order(
    p_order_id INTEGER,
    p_bayi_id UUID,
    p_discount_percentage DECIMAL
)
RETURNS TABLE(
    original_total DECIMAL,
    discounted_total DECIMAL,
    savings_amount DECIMAL
) AS $$
DECLARE
    v_original_total DECIMAL;
    v_discounted_total DECIMAL;
BEGIN
    -- Orijinal toplamı hesapla
    SELECT SUM(oi.quantity * oi.price) INTO v_original_total
    FROM order_items oi
    WHERE oi.order_id = p_order_id;
    
    -- İndirimli toplamı hesapla
    v_discounted_total := v_original_total * (1 - (p_discount_percentage / 100));
    
    -- Bayi sipariş kaydı oluştur
    INSERT INTO bayi_orders (order_id, bayi_id, bayi_discount_percentage, original_total, discounted_total)
    VALUES (p_order_id, p_bayi_id, p_discount_percentage, v_original_total, v_discounted_total);
    
    -- Sonucu döndür
    RETURN QUERY
    SELECT v_original_total, v_discounted_total, (v_original_total - v_discounted_total);
END;
$$ LANGUAGE plpgsql;

-- 6. İndeksler
CREATE INDEX IF NOT EXISTS idx_bayi_orders_bayi_id ON bayi_orders(bayi_id);
CREATE INDEX IF NOT EXISTS idx_bayi_orders_created_at ON bayi_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_bayi_code ON profiles(bayi_code);
CREATE INDEX IF NOT EXISTS idx_profiles_is_bayi ON profiles(is_bayi);

-- 7. Trigger - Bayi kodu otomatik oluşturma
CREATE OR REPLACE FUNCTION generate_bayi_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_bayi = true AND NEW.bayi_code IS NULL THEN
        NEW.bayi_code := 'BY' || LPAD(EXTRACT(EPOCH FROM NOW())::BIGINT % 100000, 5, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_bayi_code
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION generate_bayi_code();

-- 8. Örnek bayi kodu güncelleme
UPDATE profiles 
SET 
    is_bayi = true,
    bayi_discount_percentage = 25,
    bayi_status = 'active',
    vip_level = 2,
    dealer_approved = true
WHERE id IN (
    SELECT id FROM profiles 
    WHERE dealer_approved = true 
    LIMIT 5
);