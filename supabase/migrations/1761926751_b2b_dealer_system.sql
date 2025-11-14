-- Migration: b2b_dealer_system
-- Created at: 1761926751

-- B2B Bayi Panel Sistemi Database Şeması

-- 1. Bakiye işlem tipleri enum
DO $$ BEGIN
    CREATE TYPE balance_transaction_type AS ENUM (
        'deposit',
        'purchase',
        'payment',
        'refund',
        'transfer',
        'adjustment',
        'bonus'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Bakiye işlemleri tablosu
CREATE TABLE IF NOT EXISTS balance_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type balance_transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Profiles tablosuna bayi bilgileri ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dealer_company_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dealer_company_name TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dealer_approved'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dealer_approved BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dealer_application_date'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dealer_application_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dealer_approval_date'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dealer_approval_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. RLS Politikaları
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi bakiye geçmişlerini görebilir"
ON balance_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Servis rolü tüm işlemleri yapabilir - balance"
ON balance_transactions FOR ALL
TO service_role
USING (true);

-- 5. İndeksler
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(transaction_type);;