-- Migration: add_campaign_features
-- Created at: 1761930513

-- Campaign title kolonu ekle
ALTER TABLE time_limited_discounts 
ADD COLUMN IF NOT EXISTS campaign_title TEXT;

-- Banner tablosu oluştur
CREATE TABLE IF NOT EXISTS campaign_banners (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    discount_percentage NUMERIC,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    link_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banner RLS policies
ALTER TABLE campaign_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active banners"
ON campaign_banners FOR SELECT
TO public
USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

CREATE POLICY "Authenticated users can manage banners"
ON campaign_banners FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_time_limited_discounts_active 
ON time_limited_discounts(product_id, is_active, end_date) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_campaign_banners_active
ON campaign_banners(is_active, display_order, start_date, end_date)
WHERE is_active = true;

COMMENT ON TABLE campaign_banners IS 'Ana sayfa kampanya banner yönetimi için tablo';;