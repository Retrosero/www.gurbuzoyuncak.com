-- Migration: add_bayi_functions_and_views
-- Created at: 1761979683

-- Bakiye güncelleme fonksiyonu
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

-- Bayi istatistikleri view'i
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

-- Bayi ürün fiyat hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION get_bayi_price(p_product_id UUID, p_user_id UUID) 
RETURNS DECIMAL AS $$
DECLARE
    v_base_price DECIMAL(10,2);
    v_discount_percentage DECIMAL(5,2) DEFAULT 0;
    v_final_price DECIMAL(10,2);
BEGIN
    -- 1. Ürün temel fiyatını al
    SELECT price INTO v_base_price FROM products WHERE id = p_product_id;
    
    -- 2. Kullanıcının indirim yüzdesini al
    SELECT COALESCE(bayi_discount_percentage, 0) INTO v_discount_percentage 
    FROM profiles WHERE user_id = p_user_id;
    
    -- 3. İndirimli fiyatı hesapla
    v_final_price := v_base_price * (1 - v_discount_percentage / 100);
    
    RETURN ROUND(v_final_price, 2);
END;
$$ LANGUAGE plpgsql;;