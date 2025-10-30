-- B2B Bayi Sistemi Veritabanı Şeması
-- Gürbüz Oyuncak - Bayi Panel
-- MySQL 5.7+ uyumlu

USE gurbuz_oyuncak;

-- Bayiler ana tablosu
CREATE TABLE IF NOT EXISTS bayiler (
    bayi_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    tax_number VARCHAR(20) UNIQUE,
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(10),
    website VARCHAR(255),
    notes TEXT,
    is_active TINYINT(1) DEFAULT 1,
    email_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_tax_number (tax_number),
    INDEX idx_company (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Bayi profilleri ve bakiye bilgileri
CREATE TABLE IF NOT EXISTS bayi_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    bayi_id INT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('active', 'suspended', 'pending', 'cancelled') DEFAULT 'pending',
    discount_rate DECIMAL(5,2) DEFAULT 0.00,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    payment_terms VARCHAR(100) DEFAULT '30_days',
    last_login TIMESTAMP NULL,
    last_order TIMESTAMP NULL,
    total_orders INT DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bayi_id) REFERENCES bayiler(bayi_id) ON DELETE CASCADE,
    INDEX idx_bayi_id (bayi_id),
    INDEX idx_status (status),
    INDEX idx_balance (balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Bayi bakiye işlemleri geçmişi
CREATE TABLE IF NOT EXISTS bayi_balance_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    bayi_id INT NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'order_payment', 'refund', 'commission', 'adjustment') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    payment_method ENUM('bank_transfer', 'credit_card', 'paytr', 'manual', 'system') DEFAULT 'manual',
    payment_reference VARCHAR(255),
    status ENUM('pending', 'completed', 'cancelled', 'failed') DEFAULT 'pending',
    admin_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bayi_id) REFERENCES bayiler(bayi_id) ON DELETE CASCADE,
    INDEX idx_bayi_id (bayi_id),
    INDEX idx_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Bayi siparişleri tablosu
CREATE TABLE IF NOT EXISTS bayi_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    bayi_id INT NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'partial', 'failed', 'refunded') DEFAULT 'pending',
    total_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    final_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    payment_method ENUM('balance', 'bank_transfer', 'credit_card') DEFAULT 'balance',
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    admin_notes TEXT,
    processed_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bayi_id) REFERENCES bayiler(bayi_id) ON DELETE CASCADE,
    INDEX idx_bayi_id (bayi_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (order_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Bayi sipariş kalemleri
CREATE TABLE IF NOT EXISTS bayi_order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_rate DECIMAL(5,2) DEFAULT 0.00,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES bayi_orders(order_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- PayTR ödeme işlemleri tablosu
CREATE TABLE IF NOT EXISTS bayi_paytr_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bayi_id INT NOT NULL,
    merchant_oid VARCHAR(255) NOT NULL UNIQUE,
    payment_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TL',
    payment_type ENUM('card', 'eft') DEFAULT 'card',
    installment INT DEFAULT 0,
    hash VARCHAR(255) NOT NULL,
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    paytr_token VARCHAR(255),
    paytr_response TEXT,
    callback_received TINYINT(1) DEFAULT 0,
    callback_data TEXT,
    user_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bayi_id) REFERENCES bayiler(bayi_id) ON DELETE CASCADE,
    INDEX idx_bayi_id (bayi_id),
    INDEX idx_merchant_oid (merchant_oid),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Bayi session yönetimi
CREATE TABLE IF NOT EXISTS bayi_sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    bayi_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (bayi_id) REFERENCES bayiler(bayi_id) ON DELETE CASCADE,
    INDEX idx_bayi_id (bayi_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Demo bayi hesabı oluşturma
INSERT INTO bayiler (email, password_hash, company_name, contact_person, phone, address, tax_number, city, district, is_active, email_verified) VALUES
('demo@bayipanel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Bayi Şirketi', 'Ahmet Yılmaz', '0532 123 45 67', 'Demo Mahallesi Demo Sokak No:1', '1234567890', 'İstanbul', 'Kadıköy', 1, 1);

-- Demo bayi profili
INSERT INTO bayi_profiles (bayi_id, balance, credit_limit, status, discount_rate) VALUES
(1, 5000.00, 10000.00, 'active', 5.00);

-- Demo bakiye işlemi
INSERT INTO bayi_balance_transactions (bayi_id, transaction_type, amount, balance_before, balance_after, description, status) VALUES
(1, 'deposit', 5000.00, 0.00, 5000.00, 'İlk bakiye yüklemesi', 'completed');