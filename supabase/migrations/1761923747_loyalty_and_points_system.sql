-- Migration: loyalty_and_points_system
-- Created at: 1761923747

-- Ödül ve Puan Sistemi
-- Kapsamlı sadakat programı implementasyonu

-- 1. Puan işlem türleri enum
DO $$ BEGIN
    CREATE TYPE point_transaction_type AS ENUM (
        'purchase',          -- Alışveriş
        'review',           -- Ürün değerlendirme
        'comment',          -- Ürün yorumu
        'social_share',     -- Sosyal medya paylaşımı
        'birthday_bonus',   -- Doğum günü bonusu
        'first_order',      -- İlk sipariş bonusu
        'admin_bonus',      -- Admin tarafından eklenen
        'redemption'        -- Puan kullanımı (negatif)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Puan işlemleri geçmişi tablosu
CREATE TABLE IF NOT EXISTS point_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type point_transaction_type NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    reference_id TEXT,  -- İlgili varlığın ID'si (ürün ID, yorum ID vs.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VIP seviye tanımları tablosu
CREATE TABLE IF NOT EXISTS vip_tiers (
    id SERIAL PRIMARY KEY,
    tier_name TEXT NOT NULL UNIQUE,
    tier_level INTEGER NOT NULL UNIQUE,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2),
    perks JSONB DEFAULT '[]'::jsonb,
    badge_color TEXT,
    icon_emoji TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (min_points >= 0),
    CHECK (max_points IS NULL OR max_points > min_points)
);

-- 4. Puan kazanma kuralları tablosu
CREATE TABLE IF NOT EXISTS point_rules (
    id SERIAL PRIMARY KEY,
    rule_type point_transaction_type NOT NULL UNIQUE,
    points_awarded INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS Politikaları
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi puan geçmişlerini görebilir
CREATE POLICY "Kullanıcılar kendi puan geçmişlerini görebilir"
ON point_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Herkes VIP seviyelerini görebilir
CREATE POLICY "Herkes VIP seviyelerini görebilir"
ON vip_tiers FOR SELECT
TO authenticated, anon
USING (true);

-- Herkes puan kurallarını görebilir
CREATE POLICY "Herkes puan kurallarını görebilir"
ON point_rules FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- Servis rolü tüm işlemleri yapabilir
CREATE POLICY "Servis rolü tüm işlemleri yapabilir - transactions"
ON point_transactions FOR ALL
TO service_role
USING (true);

CREATE POLICY "Servis rolü tüm işlemleri yapabilir - tiers"
ON vip_tiers FOR ALL
TO service_role
USING (true);

CREATE POLICY "Servis rolü tüm işlemleri yapabilir - rules"
ON point_rules FOR ALL
TO service_role
USING (true);

-- 6. VIP Seviye Tanımları Ekle
INSERT INTO vip_tiers (tier_name, tier_level, min_points, max_points, discount_percentage, free_shipping_threshold, perks, badge_color, icon_emoji)
VALUES 
    ('BRONZ', 1, 0, 100, 0, NULL, 
     '["Standart müşteri avantajları", "Tüm kampanyalara erişim"]'::jsonb, 
     '#CD7F32', '🥉'),
    ('GÜMÜŞ', 2, 101, 500, 5, 150, 
     '["₺150+ ücretsiz kargo", "%5 ek indirim", "Özel kampanyalar"]'::jsonb, 
     '#C0C0C0', '🥈'),
    ('ALTIN', 3, 501, 1000, 10, 100, 
     '["₺100+ ücretsiz kargo", "%10 ek indirim", "Öncelikli müşteri hizmetleri", "Erken erişim kampanyaları"]'::jsonb, 
     '#FFD700', '🥇'),
    ('PLATIN', 4, 1001, NULL, 15, 0, 
     '["Tüm siparişlerde ücretsiz kargo", "%15 ek indirim", "VIP müşteri hizmetleri", "Özel VIP kampanyaları", "Doğum günü sürprizi"]'::jsonb, 
     '#E5E4E2', '💎')
ON CONFLICT (tier_name) DO NOTHING;

-- 7. Puan Kazanma Kuralları Ekle
INSERT INTO point_rules (rule_type, points_awarded, description, is_active)
VALUES 
    ('purchase', 1, 'Her ₺10 harcama için 1 puan', true),
    ('review', 5, 'Ürün değerlendirmesi için 5 puan', true),
    ('comment', 3, 'Ürün yorumu için 3 puan', true),
    ('social_share', 10, 'Sosyal medya paylaşımı için 10 puan', true),
    ('birthday_bonus', 50, 'Doğum günü bonusu (yıllık)', true),
    ('first_order', 25, 'İlk sipariş bonusu', true)
ON CONFLICT (rule_type) DO NOTHING;

-- 8. İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_vip_tiers_level ON vip_tiers(tier_level);

-- 9. Puan ekleme ve VIP seviye güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_user_id UUID,
    p_transaction_type point_transaction_type,
    p_points INTEGER,
    p_description TEXT DEFAULT NULL,
    p_order_id BIGINT DEFAULT NULL,
    p_reference_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_new_total INTEGER;
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_new_tier_name TEXT;
    v_level_up BOOLEAN := false;
BEGIN
    -- 1. Puan işlemi kaydet
    INSERT INTO point_transactions (user_id, transaction_type, points, description, order_id, reference_id)
    VALUES (p_user_id, p_transaction_type, p_points, p_description, p_order_id, p_reference_id);
    
    -- 2. Kullanıcının toplam puanını güncelle
    UPDATE profiles 
    SET loyalty_points = COALESCE(loyalty_points, 0) + p_points,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING loyalty_points, vip_level INTO v_new_total, v_old_level;
    
    -- 3. VIP seviyesini hesapla
    SELECT tier_level, tier_name INTO v_new_level, v_new_tier_name
    FROM vip_tiers
    WHERE min_points <= v_new_total 
      AND (max_points IS NULL OR max_points >= v_new_total)
    ORDER BY tier_level DESC
    LIMIT 1;
    
    -- 4. VIP seviyesi değiştiyse güncelle
    IF v_new_level != v_old_level THEN
        UPDATE profiles 
        SET vip_level = v_new_level,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        v_level_up := v_new_level > v_old_level;
    END IF;
    
    -- 5. Sonucu döndür
    RETURN jsonb_build_object(
        'success', true,
        'new_total', v_new_total,
        'points_added', p_points,
        'old_level', v_old_level,
        'new_level', v_new_level,
        'tier_name', v_new_tier_name,
        'level_up', v_level_up
    );
END;
$$ LANGUAGE plpgsql;

-- 10. VIP indirim yüzdesini getiren fonksiyon
CREATE OR REPLACE FUNCTION get_vip_discount(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_discount DECIMAL;
BEGIN
    SELECT vt.discount_percentage INTO v_discount
    FROM profiles p
    JOIN vip_tiers vt ON p.vip_level = vt.tier_level
    WHERE p.user_id = p_user_id;
    
    RETURN COALESCE(v_discount, 0);
END;
$$ LANGUAGE plpgsql;

-- 11. Kullanıcının VIP bilgilerini getiren fonksiyon
CREATE OR REPLACE FUNCTION get_user_vip_info(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'points', COALESCE(p.loyalty_points, 0),
        'tier_level', COALESCE(p.vip_level, 1),
        'tier_name', vt.tier_name,
        'tier_icon', vt.icon_emoji,
        'discount_percentage', vt.discount_percentage,
        'free_shipping_threshold', vt.free_shipping_threshold,
        'perks', vt.perks,
        'next_tier', (
            SELECT jsonb_build_object(
                'name', next_vt.tier_name,
                'min_points', next_vt.min_points,
                'points_needed', next_vt.min_points - COALESCE(p.loyalty_points, 0)
            )
            FROM vip_tiers next_vt
            WHERE next_vt.tier_level = COALESCE(p.vip_level, 1) + 1
        )
    ) INTO v_result
    FROM profiles p
    JOIN vip_tiers vt ON COALESCE(p.vip_level, 1) = vt.tier_level
    WHERE p.user_id = p_user_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;;