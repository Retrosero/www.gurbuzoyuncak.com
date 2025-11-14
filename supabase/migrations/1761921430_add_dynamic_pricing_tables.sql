-- Migration: add_dynamic_pricing_tables
-- Created at: 1761921430

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
    buy_quantity INTEGER,
    pay_quantity INTEGER,
    
    -- Kategori/Ürün filtreleri
    category_ids JSONB,
    product_ids JSONB,
    brand_ids JSONB,
    
    -- Sepet bazlı kurallar
    min_purchase_amount NUMERIC(10,2),
    min_item_count INTEGER,
    
    -- Müşteri tipi filtreleme
    customer_types JSONB,
    
    -- Tarih ve durum
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. KATEGORİ İNDİRİMLERİ
CREATE TABLE IF NOT EXISTS category_discounts (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    discount_percentage NUMERIC(5,2) NOT NULL,
    customer_types JSONB,
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

-- 5. FİYATLAMA GEÇMİŞİ
CREATE TABLE IF NOT EXISTS pricing_history (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    old_price NUMERIC(10,2),
    new_price NUMERIC(10,2),
    change_reason TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. KAMPANYA KULLANIMI
CREATE TABLE IF NOT EXISTS campaign_usage (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    order_id BIGINT REFERENCES orders(id),
    discount_amount NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- pricing_rules genişletme
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
CREATE INDEX IF NOT EXISTS idx_campaign_usage_campaign ON campaign_usage(campaign_id);;