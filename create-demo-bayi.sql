-- Demo bayi kullanıcısı için auth user oluştur
-- Bu SQL Supabase Dashboard'da çalıştırılmalı

-- Önce mevcut kullanıcıyı kontrol et
SELECT id, email FROM auth.users WHERE email = 'abc@oyuncak.com';

-- Eğer kullanıcı yoksa, şu adımları takip et:
-- 1. Supabase Dashboard → Authentication → Users → Create User
--    Email: abc@oyuncak.com
--    Password: DemoB@yi123
--    Confirm Email: ✓ (otomatik onaylı)

-- 2. Kullanıcı oluşturulduktan sonra, user_id'yi al ve aşağıdaki SQL'i çalıştır:

-- Profile güncelle (USER_ID_BURAYA yerine gerçek user_id'yi koy)
UPDATE profiles 
SET 
    customer_type = 'B2B',
    dealer_company_name = 'ABC Oyuncak',
    dealer_approved = true,
    dealer_approval_date = NOW(),
    balance = 2450.00,
    vip_level = 3,
    loyalty_points = 750,
    full_name = 'ABC Oyuncak Bayisi',
    phone = '0 (555) 123 45 67',
    city = 'İstanbul',
    address = 'Merkez Mahallesi, Ticaret Caddesi No: 123'
WHERE user_id = 'USER_ID_BURAYA';

-- Demo işlemler ekle
INSERT INTO balance_transactions (user_id, transaction_type, amount, description, balance_after)
VALUES 
    ('USER_ID_BURAYA', 'deposit', 5000.00, 'İlk bakiye yüklemesi', 5000.00),
    ('USER_ID_BURAYA', 'purchase', -2550.00, 'Ocak 2025 toptan alımı', 2450.00)
ON CONFLICT DO NOTHING;

-- Sonuç kontrolü
SELECT 
    p.full_name,
    p.dealer_company_name,
    p.balance,
    p.vip_level,
    p.loyalty_points,
    p.customer_type,
    p.dealer_approved
FROM profiles p
WHERE p.user_id = 'USER_ID_BURAYA';
