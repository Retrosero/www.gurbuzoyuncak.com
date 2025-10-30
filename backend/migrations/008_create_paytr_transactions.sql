-- PayTR Ödeme İşlemleri Tablosu
-- Bayi bakiye yüklemeleri için PayTR entegrasyonu

CREATE TABLE IF NOT EXISTS bayi_paytr_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    bayi_id INT NOT NULL,
    merchant_oid VARCHAR(100) NOT NULL UNIQUE,
    payment_amount DECIMAL(10, 2) NOT NULL,
    hash TEXT,
    user_ip VARCHAR(50),
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    callback_received TINYINT(1) DEFAULT 0,
    callback_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_bayi_id (bayi_id),
    INDEX idx_merchant_oid (merchant_oid),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (bayi_id) REFERENCES bayi(bayi_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
