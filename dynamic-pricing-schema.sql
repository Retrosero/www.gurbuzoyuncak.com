-- ============================================
-- DİNAMİK FİYATLAMA VE İNDİRİM SİSTEMİ
-- ============================================

-- 1. KAMPANYALAR (Zamanlanmış kampanyalar)
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('seasonal', 'category', 'product', 'cart', 'x_for_y')),
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'x_for_y')),
    discount_value NUMERIC(10,2),
    
    -- X Al Y Öde kuralları
    buy_quantity INTEGER, -- 3 al 2 öde için: 3
    pay_quantity INTEGER, -- 3 al 2 öde için: 2
    
    -- Kategori/Ürün filtreleri
    category_ids JSONB, -- [1, 2, 3]
    product_ids JSONB,  -- [10, 20, 30]
    brand_ids JSONB,    -- [1, 5]
    
    -- Sepet bazlı kurallar
    min_purchase_amount NUMERIC(10,2),
    min_item_count INTEGER,
    
    -- Müşteri tipi filtreleme
    customer_types JSONB, -- ["B2C", "B2B"]
    
    -- Tarih ve durum
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Çakışan kampanyalarda öncelik
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. KATEGORİ İNDİRİMLERİ
CREATE TABLE IF NOT EXISTS category_discounts (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    discount_percentage NUMERIC(5,2) NOT NULL,
    customer_types JSONB, -- Hangi müşteri tiplerinde geçerli
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ÜRÜN İNDİRİMLERİ
CREATE TABLE IF NOT EXISTS product_discounts (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    discount_percentage NUMERIC(5,2) NOT NULL,
    customer_types JSONB,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. KULLANICI FAVORİ ÜRÜNLERİ
CREATE TABLE IF NOT EXISTS user_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 5. FİYATLAMA GEÇMİŞİ (Raporlama için)
CREATE TABLE IF NOT EXISTS pricing_history (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    old_price NUMERIC(10,2),
    new_price NUMERIC(10,2),
    change_reason TEXT, -- 'manual', 'campaign', 'seasonal'
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. KAMPANYA KULLANIMI (İstatistikler)
CREATE TABLE IF NOT EXISTS campaign_usage (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    order_id BIGINT REFERENCES orders(id),
    discount_amount NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MÜŞTERİ TİPİ FİYATLAMA (pricing_rules'u güncelle)
-- pricing_rules tablosu zaten var, sadece genişletiyoruz
ALTER TABLE pricing_rules 
ADD COLUMN IF NOT EXISTS applies_to_categories JSONB,
ADD COLUMN IF NOT EXISTS applies_to_brands JSONB,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- İNDEXLER
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_category_discounts_active ON category_discounts(is_active, category_id);
CREATE INDEX IF NOT EXISTS idx_product_discounts_active ON product_discounts(is_active, product_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_campaign_usage_campaign ON campaign_usage(campaign_id);

-- RLS POLİTİKALARI

-- campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes kampanyaları görebilir" ON campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Admin kampanyaları yönetebilir" ON campaigns FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND customer_type = 'Admin')
);

-- user_favorites
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcı kendi favorilerini görebilir" ON user_favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Kullanıcı favori ekleyebilir" ON user_favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Kullanıcı favori silebilir" ON user_favorites FOR DELETE USING (user_id = auth.uid());

-- category_discounts
ALTER TABLE category_discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes kategori indirimlerini görebilir" ON category_discounts FOR SELECT USING (is_active = true);

-- product_discounts
ALTER TABLE product_discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes ürün indirimlerini görebilir" ON product_discounts FOR SELECT USING (is_active = true);

-- ÖRNEK VERİLER

-- Müşteri tipi fiyatlandırma kuralları
INSERT INTO pricing_rules (name, customer_type, discount_percentage, is_active, priority) VALUES
('B2C Standart', 'B2C', 0, true, 1),
('B2B Bayi İndirimi', 'B2B', 30, true, 2),
('Toptan İndirimi', 'Toptan', 40, true, 3),
('Kurumsal İndirimi', 'Kurumsal', 35, true, 2)
ON CONFLICT DO NOTHING;

-- Örnek kampanya: Yılbaşı
INSERT INTO campaigns (
    name, 
    description, 
    campaign_type, 
    discount_type, 
    discount_value,
    customer_types,
    start_date, 
    end_date,
    is_active,
    priority
) VALUES (
    'Yılbaşı Kampanyası',
    'Tüm kategorilerde %25 indirim',
    'seasonal',
    'percentage',
    25,
    '["B2C", "B2B"]',
    '2025-12-15 00:00:00+03',
    '2026-01-05 23:59:59+03',
    true,
    10
) ON CONFLICT DO NOTHING;

-- Örnek kampanya: 3 Al 2 Öde
INSERT INTO campaigns (
    name,
    description,
    campaign_type,
    discount_type,
    buy_quantity,
    pay_quantity,
    start_date,
    end_date,
    is_active,
    priority
) VALUES (
    '3 Al 2 Öde',
    'Bebek oyuncaklarında 3 al 2 öde',
    'x_for_y',
    'x_for_y',
    3,
    2,
    '2025-11-01 00:00:00+03',
    '2025-12-31 23:59:59+03',
    true,
    5
) ON CONFLICT DO NOTHING;

-- Örnek kampanya: Sepet bazlı
INSERT INTO campaigns (
    name,
    description,
    campaign_type,
    discount_type,
    discount_value,
    min_purchase_amount,
    min_item_count,
    customer_types,
    start_date,
    end_date,
    is_active,
    priority
) VALUES (
    '200 TL Üzeri Kargo Bedava + %10 İndirim',
    'Minimum 200 TL ve 10 ürün alımlarında %10 indirim',
    'cart',
    'percentage',
    10,
    200,
    10,
    '["B2C"]',
    '2025-11-01 00:00:00+03',
    '2025-12-31 23:59:59+03',
    true,
    3
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE campaigns IS 'Tüm kampanya türlerini yöneten merkezi tablo';
COMMENT ON TABLE category_discounts IS 'Kategori bazlı otomatik indirimler';
COMMENT ON TABLE product_discounts IS 'Ürün bazlı otomatik indirimler';
COMMENT ON TABLE user_favorites IS 'Kullanıcıların favori ürünleri';
COMMENT ON TABLE pricing_history IS 'Fiyat değişiklik geçmişi';
COMMENT ON TABLE campaign_usage IS 'Kampanya kullanım istatistikleri';
