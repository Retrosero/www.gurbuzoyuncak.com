-- B2B Bayi Panel Sistemi Database Şeması
-- Bayiler için özel bakiye ve işlem yönetimi

-- 1. Bakiye işlem tipleri enum
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

-- 2. Bakiye işlemleri tablosu
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

-- 3. Profiles tablosuna bayi bilgileri ekle (yoksa)
DO $$
BEGIN
    -- Bayi şirket adı
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dealer_company_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dealer_company_name TEXT;
    END IF;
    
    -- Bayi onay durumu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dealer_approved'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dealer_approved BOOLEAN DEFAULT false;
    END IF;
    
    -- Bayi başvuru tarihi
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dealer_application_date'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dealer_application_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Bayi onay tarihi
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dealer_approval_date'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dealer_approval_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. RLS Politikaları
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi bakiye geçmişlerini görebilir
CREATE POLICY "Kullanıcılar kendi bakiye geçmişlerini görebilir"
ON balance_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Servis rolü tüm işlemleri yapabilir
CREATE POLICY "Servis rolü tüm işlemleri yapabilir - balance"
ON balance_transactions FOR ALL
TO service_role
USING (true);

-- 5. İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(transaction_type);

-- 6. Bakiye güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_user_balance(
    p_user_id UUID,
    p_transaction_type balance_transaction_type,
    p_amount DECIMAL(10,2),
    p_description TEXT DEFAULT NULL,
    p_reference_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_current_balance DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
    v_transaction_id BIGINT;
BEGIN
    -- 1. Mevcut bakiyeyi al
    SELECT COALESCE(balance, 0) INTO v_current_balance
    FROM profiles
    WHERE user_id = p_user_id;
    
    -- 2. Yeni bakiyeyi hesapla
    IF p_transaction_type IN ('deposit', 'refund', 'bonus') THEN
        v_new_balance := v_current_balance + p_amount;
    ELSIF p_transaction_type IN ('purchase', 'payment', 'transfer') THEN
        v_new_balance := v_current_balance - p_amount;
        
        -- Yetersiz bakiye kontrolü
        IF v_new_balance < 0 THEN
            RAISE EXCEPTION 'Yetersiz bakiye. Mevcut: %, Gerekli: %', v_current_balance, p_amount;
        END IF;
    ELSIF p_transaction_type = 'adjustment' THEN
        v_new_balance := v_current_balance + p_amount;  -- Pozitif veya negatif olabilir
    ELSE
        RAISE EXCEPTION 'Geçersiz işlem tipi: %', p_transaction_type;
    END IF;
    
    -- 3. İşlemi kaydet
    INSERT INTO balance_transactions (
        user_id, 
        transaction_type, 
        amount, 
        balance_before, 
        balance_after, 
        description, 
        reference_id,
        status
    )
    VALUES (
        p_user_id,
        p_transaction_type,
        ABS(p_amount),
        v_current_balance,
        v_new_balance,
        p_description,
        p_reference_id,
        'completed'
    )
    RETURNING id INTO v_transaction_id;
    
    -- 4. Kullanıcının bakiyesini güncelle
    UPDATE profiles 
    SET balance = v_new_balance,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- 5. Sonucu döndür
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'balance_before', v_current_balance,
        'balance_after', v_new_balance,
        'amount', ABS(p_amount),
        'transaction_type', p_transaction_type
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Demo bayi hesabı oluştur
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Demo bayi kullanıcısı var mı kontrol et
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'abc@oyuncak.com';
    
    IF v_user_id IS NULL THEN
        -- Kullanıcı yoksa oluştur (manuel oluşturulacak)
        RAISE NOTICE 'Demo bayi kullanıcısı manuel oluşturulmalı: abc@oyuncak.com';
    ELSE
        -- Profile güncelle
        UPDATE profiles 
        SET 
            customer_type = 'B2B',
            dealer_company_name = 'ABC Oyuncak',
            dealer_approved = true,
            dealer_approval_date = NOW(),
            balance = 2450.00,
            vip_level = 3,  -- ALTIN
            loyalty_points = 750,
            full_name = 'ABC Oyuncak Bayisi',
            updated_at = NOW()
        WHERE user_id = v_user_id;
        
        -- Son bakiye yükleme işlemi ekle
        INSERT INTO balance_transactions (
            user_id,
            transaction_type,
            amount,
            balance_before,
            balance_after,
            description,
            status,
            created_at
        ) VALUES (
            v_user_id,
            'deposit',
            5000.00,
            0,
            5000.00,
            'İlk bakiye yükleme',
            'completed',
            '2025-01-15 10:00:00+00'
        );
        
        -- Ocak ayı harcama işlemi
        INSERT INTO balance_transactions (
            user_id,
            transaction_type,
            amount,
            balance_before,
            balance_after,
            description,
            status,
            created_at
        ) VALUES (
            v_user_id,
            'purchase',
            2550.00,
            5000.00,
            2450.00,
            'Ocak 2025 ürün alımları',
            'completed',
            '2025-01-20 14:30:00+00'
        );
        
        RAISE NOTICE 'Demo bayi profili güncellendi: %', v_user_id;
    END IF;
END $$;

-- 8. Bayi istatistikleri view'i
CREATE OR REPLACE VIEW dealer_stats AS
SELECT 
    p.user_id,
    p.dealer_company_name,
    p.balance,
    p.vip_level,
    p.loyalty_points,
    (SELECT COUNT(*) FROM balance_transactions bt WHERE bt.user_id = p.user_id) as total_transactions,
    (SELECT SUM(amount) FROM balance_transactions bt WHERE bt.user_id = p.user_id AND transaction_type = 'deposit') as total_deposits,
    (SELECT SUM(amount) FROM balance_transactions bt WHERE bt.user_id = p.user_id AND transaction_type = 'purchase') as total_purchases,
    (SELECT MAX(created_at) FROM balance_transactions bt WHERE bt.user_id = p.user_id AND transaction_type = 'deposit') as last_deposit_date,
    (SELECT amount FROM balance_transactions bt WHERE bt.user_id = p.user_id AND transaction_type = 'deposit' ORDER BY created_at DESC LIMIT 1) as last_deposit_amount
FROM profiles p
WHERE p.customer_type IN ('B2B', 'Toptan', 'Kurumsal')
  AND p.dealer_approved = true;

COMMENT ON VIEW dealer_stats IS 'Bayi istatistikleri özet görünümü';
