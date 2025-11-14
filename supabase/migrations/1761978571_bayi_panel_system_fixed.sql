-- Migration: bayi_panel_system_fixed
-- Created at: 1761978571

-- Migration: BAYİ PANELİ SİSTEMİ - Düzeltilmiş
-- Created at: 1762000001

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

-- 3. RLS Politikaları - Bayi paneli için
ALTER TABLE bayi_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bayi kendi siparişlerini görebilir"
ON bayi_orders FOR SELECT
TO authenticated
USING (auth.uid() = bayi_id);

CREATE POLICY "Servis rolü tüm bayi siparişlerini yönetebilir"
ON bayi_orders FOR ALL
TO service_role
USING (true);

-- 4. İndeksler
CREATE INDEX IF NOT EXISTS idx_bayi_orders_bayi_id ON bayi_orders(bayi_id);
CREATE INDEX IF NOT EXISTS idx_bayi_orders_created_at ON bayi_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_bayi_code ON profiles(bayi_code);
CREATE INDEX IF NOT EXISTS idx_profiles_is_bayi ON profiles(is_bayi);;