-- Migration: add_bayi_columns_and_table_fixed
-- Created at: 1761979666

-- B2B Bayi Panel için gerekli kolonlar ve tablo ekleme
-- 1. Profiles tablosuna bayi özel kolonları ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_bayi BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bayi_discount_percentage DECIMAL(5,2) DEFAULT 0;

-- 2. Bakiye işlem tipleri enum (yoksa)
DO $$ BEGIN
    CREATE TYPE balance_transaction_type AS ENUM (
        'deposit',          -- Bakiye yükleme
        'purchase',         -- Ürün alımı
        'payment',          -- Ödeme
        'refund',           -- İade
        'transfer',         -- Transfer
        'adjustment',       -- Düzeltme
        'bonus'             -- Bonus
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Bakiye işlemleri tablosu (yoksa)
CREATE TABLE IF NOT EXISTS balance_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type balance_transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id TEXT,  -- İlgili sipariş ID veya referans
    status TEXT DEFAULT 'completed',  -- completed, pending, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bayi siparişleri tablosu (yoksa)
CREATE TABLE IF NOT EXISTS bayi_orders (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    bayi_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS Politikaları
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bayi_orders ENABLE ROW LEVEL SECURITY;

-- Policy'leri önce drop et sonra oluştur
DROP POLICY IF EXISTS "Kullanıcılar kendi bakiye geçmişlerini görebilir" ON balance_transactions;
DROP POLICY IF EXISTS "Bayiler sadece kendi siparişlerini görebilir" ON bayi_orders;
DROP POLICY IF EXISTS "Servis rolü tüm işlemleri yapabilir - balance" ON balance_transactions;
DROP POLICY IF EXISTS "Servis rolü tüm işlemleri yapabilir - bayi_orders" ON bayi_orders;

-- Policy'leri oluştur
CREATE POLICY "Kullanıcılar kendi bakiye geçmişlerini görebilir"
ON balance_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Bayiler sadece kendi siparişlerini görebilir"
ON bayi_orders FOR SELECT
TO authenticated
USING (auth.uid() = bayi_id);

CREATE POLICY "Servis rolü tüm işlemleri yapabilir - balance"
ON balance_transactions FOR ALL
TO service_role
USING (true);

CREATE POLICY "Servis rolü tüm işlemleri yapabilir - bayi_orders"
ON bayi_orders FOR ALL
TO service_role
USING (true);

-- 6. İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_bayi_orders_bayi_id ON bayi_orders(bayi_id);
CREATE INDEX IF NOT EXISTS idx_bayi_orders_order_id ON bayi_orders(order_id);;