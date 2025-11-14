-- Test Admin Kullanıcısı Oluşturma Scripti
-- Bu script test amaçlı bir admin kullanıcısı oluşturur

-- ÖNCE: Supabase Auth'da bir kullanıcı oluşturulmalı
-- Bu script sadece profile bilgilerini ayarlar

-- Test admin kullanıcısı için profile oluşturma
INSERT INTO profiles (
    user_id, 
    email, 
    full_name, 
    phone,
    role,
    customer_type,
    is_active,
    balance,
    loyalty_points,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), -- user_id buraya auth.users'dan gelen UUID yazılmalı
    'admin@gurbuzoyuncak.com',
    'Test Admin Kullanıcısı',
    '+905551234567',
    'admin',
    'B2B',
    true,
    0,
    0,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    customer_type = EXCLUDED.customer_type,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Örnek yedekleme planları oluşturma
INSERT INTO backup_schedules (
    table_name,
    frequency,
    last_backup,
    next_backup,
    is_active,
    created_at
) VALUES 
    ('profiles', 'daily', NOW(), NOW() + INTERVAL '1 day', true, NOW()),
    ('products', 'daily', NOW(), NOW() + INTERVAL '1 day', true, NOW()),
    ('orders', 'daily', NOW(), NOW() + INTERVAL '1 day', true, NOW()),
    ('categories', 'weekly', NOW(), NOW() + INTERVAL '7 days', true, NOW()),
    ('brands', 'weekly', NOW(), NOW() + INTERVAL '7 days', true, NOW())
ON CONFLICT DO NOTHING;

-- Test aktivite log örnekleri
INSERT INTO user_activities (
    user_id,
    activity_type,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    created_at
) VALUES 
    (gen_random_uuid(), 'login', 'session', gen_random_uuid()::text, '{"method": "email"}', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW()),
    (gen_random_uuid(), 'create_product', 'product', gen_random_uuid()::text, '{"name": "Test Ürün"}', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), 'update_order', 'order', gen_random_uuid()::text, '{"status": "processing"}', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', NOW() - INTERVAL '4 hours');

-- Test güvenlik log örnekleri
INSERT INTO security_logs (
    user_id,
    event_type,
    severity,
    ip_address,
    user_agent,
    details,
    resolved,
    created_at
) VALUES 
    (gen_random_uuid(), 'failed_login', 'medium', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"attempt_count": 3}', false, NOW() - INTERVAL '1 hour'),
    (gen_random_uuid(), 'suspicious_activity', 'high', '192.168.1.101', 'curl/7.68.0', '{"action": "multiple_failed_requests"}', false, NOW() - INTERVAL '30 minutes'),
    (gen_random_uuid(), 'account_locked', 'medium', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"reason": "failed_login_attempts"}', true, NOW() - INTERVAL '2 hours');

-- Test oturum örnekleri
INSERT INTO user_sessions (
    user_id,
    session_token,
    ip_address,
    user_agent,
    is_active,
    expires_at,
    created_at
) VALUES 
    (gen_random_uuid(), gen_random_uuid()::text, '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', true, NOW() + INTERVAL '24 hours', NOW()),
    (gen_random_uuid(), gen_random_uuid()::text, '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', true, NOW() + INTERVAL '12 hours', NOW() - INTERVAL '12 hours');

-- Test için farklı rollerle kullanıcılar oluşturma
INSERT INTO profiles (
    user_id,
    email,
    full_name,
    role,
    customer_type,
    is_active,
    created_at
) VALUES 
    (gen_random_uuid(), 'moderator@gurbuzoyuncak.com', 'Test Moderatör', 'moderator', 'B2B', true, NOW()),
    (gen_random_uuid(), 'editor@gurbuzoyuncak.com', 'Test Editör', 'editor', 'B2C', true, NOW()),
    (gen_random_uuid(), 'bayi@gurbuzoyuncak.com', 'Test Bayi', 'bayi', 'B2B', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- RLS politikalarını test etmek için sample data kontrolü
-- Bu sorgular çalıştırılarak veri doğrulanabilir
/*
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM profiles

UNION ALL

SELECT 
    'user_activities' as table_name,
    COUNT(*) as record_count
FROM user_activities

UNION ALL

SELECT 
    'security_logs' as table_name,
    COUNT(*) as record_count
FROM security_logs

UNION ALL

SELECT 
    'user_sessions' as table_name,
    COUNT(*) as record_count
FROM user_sessions

UNION ALL

SELECT 
    'backup_schedules' as table_name,
    COUNT(*) as record_count
FROM backup_schedules;
*/