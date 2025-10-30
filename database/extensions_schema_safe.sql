-- ============================================
-- 1. KULLANICI YÖNETİMİ GENİŞLETMELERİ
-- ============================================

-- Users tablosuna yeni sütunlar ekle (güvenli yöntem)
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_type ENUM('B2C', 'B2B', 'wholesale') DEFAULT 'B2C';
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_level_id INT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reward_points INT DEFAULT 0;

-- Mevcut kolonları kontrol et
SHOW COLUMNS FROM users LIKE 'customer_type';

-- Eğer kolonlar yoksa ekle
SET @sql = CONCAT('ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_type ENUM(''B2C'', ''B2B'', ''wholesale'') DEFAULT ''B2C''',
                 ', ADD COLUMN IF NOT EXISTS vip_level_id INT NULL',
                 ', ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0',
                 ', ADD COLUMN IF NOT EXISTS reward_points INT DEFAULT 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. MÜŞTERİ TİPLERİ YÖNETİMİ
-- ============================================

-- Customer types tablosu
CREATE TABLE IF NOT EXISTS customer_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code ENUM('B2C', 'B2B', 'wholesale') NOT NULL,
    price_multiplier DECIMAL(5,2) DEFAULT 1.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Mevcut müşteri tipleri ekle
INSERT IGNORE INTO customer_types (name, code, price_multiplier, discount_percentage) VALUES
('Bireysel Müşteri', 'B2C', 1.00, 0),
('İşletme Müşterisi', 'B2B', 0.70, 5),
('Toptan Müşteri', 'wholesale', 0.60, 10);

-- ============================================
-- 3. FİYAT LİSTESİ YÖNETİMİ
-- ============================================

-- Price lists tablosu
CREATE TABLE IF NOT EXISTS price_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    customer_type_code ENUM('B2C', 'B2B', 'wholesale') NOT NULL,
    product_id INT NOT NULL,
    special_price DECIMAL(10,2) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_customer_product (customer_type_code, product_id),
    INDEX idx_active (is_active),
    INDEX idx_validity (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================
-- 4. İNDİRİM KURALLARI
-- ============================================

-- Discount rules tablosu
CREATE TABLE IF NOT EXISTS discount_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    rule_type ENUM('category', 'product', 'customer_type', 'order_amount') NOT NULL,
    target_id INT NULL, -- category_id, product_id veya customer_type için
    customer_type_code ENUM('B2C', 'B2B', 'wholesale') NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    min_quantity INT DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_rule_type (rule_type),
    INDEX idx_target (target_id),
    INDEX idx_customer_type (customer_type_code),
    INDEX idx_active_dates (is_active, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Örnek indirim kuralı
INSERT IGNORE INTO discount_rules (name, rule_type, customer_type_code, discount_type, discount_value, min_order_amount, is_active, start_date, end_date) VALUES
('Tüm B2B Müşterilere İndirim', 'customer_type', 'B2B', 'percentage', 5.00, 100.00, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
('Toptan Müşteri İndirimi', 'customer_type', 'wholesale', 'percentage', 10.00, 500.00, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59');

-- ============================================
-- 5. BAYİ BAKİYE SİSTEMİ
-- ============================================

-- Balance accounts tablosu
CREATE TABLE IF NOT EXISTS balance_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_balance DECIMAL(10,2) DEFAULT 0,
    credit_limit DECIMAL(10,2) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_balance (user_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Balance transactions tablosu
CREATE TABLE IF NOT EXISTS balance_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    balance_account_id INT NOT NULL,
    transaction_type ENUM('load', 'deduct', 'transfer_in', 'transfer_out', 'refund') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    order_id INT NULL,
    transfer_to_user_id INT NULL,
    transfer_from_user_id INT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (balance_account_id) REFERENCES balance_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (transfer_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (transfer_from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_order (order_id),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ============================================
-- 6. ÖDÜL PUAN SİSTEMİ
-- ============================================

-- Reward points tablosu
CREATE TABLE IF NOT EXISTS reward_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points INT NOT NULL,
    transaction_type ENUM('earned', 'spent', 'bonus', 'expired', 'admin_adjustment') NOT NULL,
    order_id INT NULL,
    description TEXT,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_expires (expires_at),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- VIP levels tablosu
CREATE TABLE IF NOT EXISTS vip_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL,
    min_points INT DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    special_privileges TEXT,
    color VARCHAR(7) DEFAULT '#000000', -- Hex renk kodu
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code),
    INDEX idx_min_points (min_points),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- VIP seviyeleri ekle
INSERT IGNORE INTO vip_levels (name, code, min_points, discount_percentage, special_privileges, color) VALUES
('Bronz Üye', 'bronze', 0, 0, 'Temel avantajlar', '#CD7F32'),
('Gümüş Üye', 'silver', 100, 2, 'Ek %2 indirim + özel kampanyalar', '#C0C0C0'),
('Altın Üye', 'gold', 500, 5, 'Ek %5 indirim + hızlı kargo + özel kampanyalar', '#FFD700'),
('Platin Üye', 'platinum', 1000, 10, 'Ek %10 indirim + ücretsiz kargo + kişisel destek', '#E5E4E2');

-- ============================================
-- 7. TRIGGER'LAR VE FONKSİYONLAR
-- ============================================

-- Otomatik bakiye hesabı oluşturma trigger'ı
DELIMITER //
CREATE TRIGGER IF NOT EXISTS create_balance_account 
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'dealer' THEN
        INSERT IGNORE INTO balance_accounts (user_id, current_balance, credit_limit) 
        VALUES (NEW.id, 0, 5000);
    END IF;
END //

-- Ödül puanı hesaplama fonksiyonu
DELIMITER //
CREATE FUNCTION IF NOT EXISTS calculate_reward_points(amount DECIMAL(10,2))
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE points INT DEFAULT 0;
    SET points = FLOOR(amount / 10); -- Her 10 TL için 1 puan
    RETURN points;
END //

-- Kullanıcı puanını güncelleyen trigger
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_user_reward_points
AFTER INSERT ON reward_points
FOR EACH ROW
BEGIN
    IF NEW.transaction_type = 'earned' THEN
        UPDATE users SET reward_points = reward_points + NEW.points WHERE id = NEW.user_id;
    ELSEIF NEW.transaction_type = 'spent' THEN
        UPDATE users SET reward_points = reward_points - NEW.points WHERE id = NEW.user_id;
    END IF;
END //
DELIMITER ;

-- ============================================
-- 8. İNDEXLER VE İYİLEŞTİRMELER
-- ============================================

-- Users tablosuna ek indexler
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_customer_type (customer_type);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_vip_level (vip_level_id);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_reward_points (reward_points);

-- Products tablosuna ek indexler
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_is_featured (is_featured);
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_discount (discount_percentage);

-- Orders tablosuna ek indexler
ALTER TABLE orders ADD INDEX IF NOT EXISTS idx_user_order (user_id, created_at);

-- Tüm trigger'ları listele
SHOW TRIGGERS LIKE 'users';

-- İşlem tamamlandı
SELECT 'Extensions schema başarıyla uygulandı!' as message;