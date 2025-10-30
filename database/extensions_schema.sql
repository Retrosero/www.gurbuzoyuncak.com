-- Gürbüz Oyuncak - Kampanya, Kupon, Bakiye ve Ödül Sistemleri
-- Bu dosya mevcut veritabanına yeni sistemler ekler

USE gurbuz_oyuncak;

-- ============================================
-- 1. KULLANICI YÖNETİMİ GENİŞLETMELERİ
-- ============================================

-- Users tablosuna yeni sütunlar ekle
ALTER TABLE users 
ADD COLUMN customer_type ENUM('B2C', 'B2B', 'wholesale') DEFAULT 'B2C' AFTER role,
ADD COLUMN vip_level_id INT NULL AFTER customer_type,
ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0 AFTER vip_level_id,
ADD COLUMN reward_points INT DEFAULT 0 AFTER total_spent;

-- ============================================
-- 2. VIP SEVİYE SİSTEMİ
-- ============================================

CREATE TABLE IF NOT EXISTS vip_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_points INT NOT NULL,
    max_points INT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    free_shipping TINYINT(1) DEFAULT 0,
    priority_support TINYINT(1) DEFAULT 0,
    special_offers TINYINT(1) DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#000000',
    icon_name VARCHAR(50),
    description TEXT,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_points_range (min_points, max_points),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Varsayılan VIP seviyeleri
INSERT INTO vip_levels (name, min_points, max_points, discount_percentage, free_shipping, color_code, icon_name, description, display_order) VALUES
('Standart', 0, 100, 0, 0, '#6B7280', 'user', 'Hoş geldiniz! Alışverişlerinizle puan kazanın.', 1),
('Bronz', 101, 500, 5, 0, '#CD7F32', 'award', '101 puana ulaştınız! %5 indirim kazandınız.', 2),
('Gümüş', 501, 1000, 10, 1, '#C0C0C0', 'star', '501 puana ulaştınız! %10 indirim ve ücretsiz kargo.', 3),
('Altın', 1001, 2000, 15, 1, '#FFD700', 'crown', '1001 puana ulaştınız! %15 indirim ve özel fırsatlar.', 4),
('Platin', 2001, NULL, 20, 1, '#E5E4E2', 'gem', '2001+ puan! %20 indirim ve tüm ayrıcalıklar.', 5);

-- Users tablosuna foreign key ekle
ALTER TABLE users 
ADD CONSTRAINT fk_users_vip_level 
FOREIGN KEY (vip_level_id) REFERENCES vip_levels(id) ON DELETE SET NULL;

-- ============================================
-- 3. ÖDÜL SİSTEMİ
-- ============================================

CREATE TABLE IF NOT EXISTS reward_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_type ENUM('earn', 'spend', 'expire', 'adjustment') NOT NULL,
    points INT NOT NULL,
    balance_after INT NOT NULL,
    source_type ENUM('purchase', 'review', 'referral', 'social_share', 'birthday', 'admin_adjustment', 'reward_spend') NOT NULL,
    source_id INT NULL COMMENT 'order_id, review_id vs.',
    description VARCHAR(500),
    expires_at TIMESTAMP NULL,
    is_expired TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (transaction_type),
    INDEX idx_source (source_type, source_id),
    INDEX idx_created (created_at),
    INDEX idx_expires (expires_at, is_expired)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Ödül kazanma kuralları
CREATE TABLE IF NOT EXISTS reward_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type ENUM('purchase', 'review', 'referral', 'social_share', 'birthday', 'registration') NOT NULL,
    points_amount INT NOT NULL,
    calculation_method ENUM('fixed', 'percentage') DEFAULT 'fixed',
    min_purchase_amount DECIMAL(10,2) NULL,
    max_points_per_action INT NULL,
    expiry_days INT NULL COMMENT 'Puanların kaç gün sonra sona ereceği',
    is_active TINYINT(1) DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (rule_type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Varsayılan ödül kuralları
INSERT INTO reward_rules (rule_name, rule_type, points_amount, calculation_method, min_purchase_amount, expiry_days, description) VALUES
('Alışveriş Puanı', 'purchase', 1, 'percentage', 0, 365, 'Her 1 TL alışverişe 1 puan kazanırsınız'),
('Ürün Yorumu', 'review', 50, 'fixed', NULL, 365, 'Onaylanan her ürün yorumu için 50 puan'),
('Arkadaş Referansı', 'referral', 100, 'fixed', NULL, 365, 'Arkadaşınız ilk alışverişini yaptığında 100 puan'),
('Sosyal Medya Paylaşımı', 'social_share', 25, 'fixed', NULL, 180, 'Sosyal medyada paylaşım için 25 puan'),
('Doğum Günü Hediyesi', 'birthday', 200, 'fixed', NULL, 90, 'Doğum gününüzde 200 puan hediye'),
('Yeni Üyelik', 'registration', 50, 'fixed', NULL, 365, 'Hoş geldiniz! 50 puan hediye');

-- ============================================
-- 4. BAKİYE SİSTEMİ (B2B/Bayi)
-- ============================================

CREATE TABLE IF NOT EXISTS user_balance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    current_balance DECIMAL(10,2) DEFAULT 0,
    total_loaded DECIMAL(10,2) DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    credit_limit DECIMAL(10,2) DEFAULT 0 COMMENT 'Kredi limiti (eksi bakiyeye izin)',
    low_balance_threshold DECIMAL(10,2) DEFAULT 100 COMMENT 'Düşük bakiye uyarı limiti',
    last_notification_sent TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_balance (current_balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS balance_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_type ENUM('load', 'spend', 'refund', 'transfer_in', 'transfer_out', 'adjustment') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    reference_type VARCHAR(50) COMMENT 'order, transfer, manual vs.',
    reference_id INT NULL,
    description VARCHAR(500),
    processed_by INT NULL COMMENT 'Admin user_id for manual operations',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (transaction_type),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================
-- 5. KUPON SİSTEMİ
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed', 'free_shipping') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2) NULL COMMENT 'Maksimum indirim tutarı (yüzde için)',
    usage_limit INT NULL COMMENT 'Toplam kullanım limiti (NULL = sınırsız)',
    usage_limit_per_user INT DEFAULT 1,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    customer_type ENUM('all', 'B2C', 'B2B', 'wholesale') DEFAULT 'all',
    applicable_to ENUM('all', 'categories', 'products') DEFAULT 'all',
    is_active TINYINT(1) DEFAULT 1,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_dates (valid_from, valid_until),
    INDEX idx_customer_type (customer_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Kupon - Kategori ilişkisi
CREATE TABLE IF NOT EXISTS coupon_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_coupon_category (coupon_id, category_id),
    INDEX idx_coupon (coupon_id),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Kupon - Ürün ilişkisi
CREATE TABLE IF NOT EXISTS coupon_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_coupon_product (coupon_id, product_id),
    INDEX idx_coupon (coupon_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Kupon kullanım geçmişi
CREATE TABLE IF NOT EXISTS coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_coupon (coupon_id),
    INDEX idx_user (user_id),
    INDEX idx_order (order_id),
    INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================
-- 6. GELİŞMİŞ KAMPANYA SİSTEMİ
-- ============================================

-- Mevcut campaigns tablosunu güncelle
ALTER TABLE campaigns
ADD COLUMN campaign_type ENUM('general', 'customer_based', 'cart_based', 'buy_x_get_y', 'category_based') DEFAULT 'general' AFTER description,
ADD COLUMN customer_type ENUM('all', 'B2C', 'B2B', 'wholesale') DEFAULT 'all' AFTER campaign_type,
ADD COLUMN min_cart_amount DECIMAL(10,2) NULL AFTER customer_type,
ADD COLUMN min_item_count INT NULL AFTER min_cart_amount,
ADD COLUMN buy_quantity INT NULL COMMENT 'X al Y öde - alınacak miktar' AFTER min_item_count,
ADD COLUMN pay_quantity INT NULL COMMENT 'X al Y öde - ödenecek miktar' AFTER buy_quantity,
ADD COLUMN max_usage_per_user INT NULL AFTER pay_quantity,
ADD COLUMN priority INT DEFAULT 0 COMMENT 'Kampanya önceliği (yüksek önce uygulanır)' AFTER max_usage_per_user;

-- Kampanya - Kategori ilişkisi
CREATE TABLE IF NOT EXISTS campaign_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_campaign_category (campaign_id, category_id),
    INDEX idx_campaign (campaign_id),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Kampanya - Ürün ilişkisi
CREATE TABLE IF NOT EXISTS campaign_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_campaign_product (campaign_id, product_id),
    INDEX idx_campaign (campaign_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Kampanya kullanım takibi
CREATE TABLE IF NOT EXISTS campaign_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_campaign (campaign_id),
    INDEX idx_user (user_id),
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================
-- 7. SİPARİŞ TABLOSU GÜNCELLEMELERİ
-- ============================================

-- Orders tablosuna yeni alanlar ekle
ALTER TABLE orders
ADD COLUMN coupon_id INT NULL AFTER discount,
ADD COLUMN coupon_discount DECIMAL(10,2) DEFAULT 0 AFTER coupon_id,
ADD COLUMN campaign_id INT NULL AFTER coupon_discount,
ADD COLUMN campaign_discount DECIMAL(10,2) DEFAULT 0 AFTER campaign_id,
ADD COLUMN reward_points_used INT DEFAULT 0 AFTER campaign_discount,
ADD COLUMN reward_discount DECIMAL(10,2) DEFAULT 0 AFTER reward_points_used,
ADD COLUMN reward_points_earned INT DEFAULT 0 AFTER reward_discount,
ADD COLUMN balance_used DECIMAL(10,2) DEFAULT 0 AFTER reward_points_earned,
ADD COLUMN vip_discount DECIMAL(10,2) DEFAULT 0 AFTER balance_used,
ADD CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_orders_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;

-- ============================================
-- 8. DEMO VERİLER
-- ============================================

-- Demo kuponlar
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, usage_limit_per_user, valid_from, valid_until, customer_type, is_active) VALUES
('HOSGELDIN50', 'Hoş Geldin Kuponu', 'Yeni müşteriler için 50 TL indirim', 'fixed', 50, 200, NULL, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), 'B2C', 1),
('YAZ25', 'Yaz İndirimi %25', 'Tüm ürünlerde %25 indirim', 'percentage', 25, 300, 150, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 2 MONTH), 'all', 1),
('BAYI40', 'Bayi Özel %40', 'B2B müşteriler için %40 indirim', 'percentage', 40, 1000, NULL, NULL, 5, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), 'B2B', 1),
('KARGOBEDAVA', 'Ücretsiz Kargo', 'Tüm siparişlerde ücretsiz kargo', 'free_shipping', 0, 150, NULL, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'all', 1);

-- Demo kampanyalar
INSERT INTO campaigns (name, description, campaign_type, customer_type, discount_type, discount_value, min_cart_amount, min_item_count, start_date, end_date, priority, is_active) VALUES
('B2B Özel %25 İndirim', 'Bayilerimiz için özel indirim', 'customer_based', 'B2B', 'percentage', 25, 1000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), 10, 1),
('Sepet 200 TL Üzeri %10', 'Minimum 200 TL alışverişe %10 indirim', 'cart_based', 'all', 'percentage', 10, 200, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), 5, 1),
('10 Ürün Al %15 İndirim', 'Minimum 10 ürün alana %15 indirim', 'cart_based', 'all', 'percentage', 15, NULL, 10, NOW(), DATE_ADD(NOW(), INTERVAL 2 MONTH), 7, 1),
('3 Al 2 Öde - Oyuncaklar', 'Oyuncaklarda 3 al 2 öde kampanyası', 'buy_x_get_y', 'all', 'percentage', 33.33, NULL, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 8, 1),
('Toptan Müşteri %40', 'Toptan alımlarda %40 indirim', 'customer_based', 'wholesale', 'percentage', 40, 2000, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 12 MONTH), 15, 1);

-- Son kampanya için buy_x_get_y parametreleri
UPDATE campaigns SET buy_quantity = 3, pay_quantity = 2 WHERE name = '3 Al 2 Öde - Oyuncaklar';

-- Tüm mevcut kullanıcıları Standart VIP seviyesine ata
UPDATE users SET vip_level_id = 1 WHERE vip_level_id IS NULL;

-- Demo B2B kullanıcı oluştur (şifre: test123)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, customer_type, vip_level_id, is_active, email_verified) 
VALUES ('bayi@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'Bayi', '0532 111 2233', 'customer', 'B2B', 1, 1, 1);

-- Demo B2B kullanıcı için bakiye hesabı oluştur
INSERT INTO user_balance (user_id, current_balance, credit_limit, low_balance_threshold) 
SELECT id, 5000, 10000, 500 FROM users WHERE email = 'bayi@test.com';

-- Demo bakiye yükleme işlemi
INSERT INTO balance_transactions (user_id, transaction_type, amount, balance_before, balance_after, description)
SELECT id, 'load', 5000, 0, 5000, 'İlk bakiye yüklemesi - Demo' FROM users WHERE email = 'bayi@test.com';
