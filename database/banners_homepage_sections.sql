-- Banner ve Ana Sayfa Bölümleri için Veritabanı Şeması
-- Gürbüz Oyuncak E-Ticaret Sistemi

USE gurbuz_oyuncak;

-- Banner'lar tablosu
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT 'Banner başlığı',
    subtitle VARCHAR(300) COMMENT 'Alt başlık',
    image_url VARCHAR(500) NOT NULL COMMENT 'Banner görseli',
    link_url VARCHAR(500) COMMENT 'Tıklanınca gidilecek URL',
    link_text VARCHAR(100) COMMENT 'Link butonu metni',
    background_color VARCHAR(50) DEFAULT '#1E88E5' COMMENT 'Arka plan rengi',
    text_color VARCHAR(50) DEFAULT '#FFFFFF' COMMENT 'Metin rengi',
    display_order INT DEFAULT 0 COMMENT 'Gösterim sırası (küçük önce)',
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Aktif mi?',
    start_date DATETIME COMMENT 'Başlangıç tarihi',
    end_date DATETIME COMMENT 'Bitiş tarihi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Ana sayfa bölümleri tablosu
CREATE TABLE IF NOT EXISTS homepage_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_type VARCHAR(50) NOT NULL COMMENT 'Bölüm türü: populer, yeni_gelenler, sectiklerimiz, indirimli',
    title VARCHAR(200) NOT NULL COMMENT 'Bölüm başlığı',
    subtitle VARCHAR(300) COMMENT 'Bölüm alt başlığı',
    display_order INT DEFAULT 0 COMMENT 'Ana sayfada gösterim sırası',
    max_items INT DEFAULT 8 COMMENT 'Maksimum gösterilecek ürün sayısı',
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Aktif mi?',
    background_color VARCHAR(50) COMMENT 'Arka plan rengi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (section_type),
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Ana sayfa bölümlerindeki ürünler (manuel seçim için)
CREATE TABLE IF NOT EXISTS homepage_section_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL COMMENT 'Bölüm ID',
    product_id INT NOT NULL COMMENT 'Ürün ID',
    display_order INT DEFAULT 0 COMMENT 'Bölüm içindeki sıra',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES homepage_sections(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_section_product (section_id, product_id),
    INDEX idx_section (section_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Demo banner verisi
INSERT INTO banners (title, subtitle, image_url, link_url, link_text, background_color, display_order, is_active) VALUES
('Yeni Sezon Oyuncakları', 'En yeni ve eğlenceli oyuncaklar burada!', '/public/images/banners/banner1.jpg', '/products.html', 'Şimdi Keşfet', '#1E88E5', 1, 1),
('İndirimli Ürünler', '%30\'a varan indirimler - Kaçırmayın!', '/public/images/banners/banner2.jpg', '/products.html?filter=sale', 'İndirimleri Gör', '#C62828', 2, 1),
('Eğitici Oyuncaklar', 'Çocuğunuzun gelişimi için özel seçimler', '/public/images/banners/banner3.jpg', '/products.html?category=egitici', 'Eğitici Oyuncaklar', '#2E7D32', 3, 1);

-- Demo ana sayfa bölümleri
INSERT INTO homepage_sections (section_type, title, subtitle, display_order, max_items, is_active) VALUES
('populer', 'Popüler Ürünler', 'En çok satılan ve beğenilen oyuncaklar', 1, 8, 1),
('yeni_gelenler', 'Yeni Gelen Ürünler', 'Mağazamıza yeni eklenen oyuncaklar', 2, 8, 1),
('sectiklerimiz', 'Bizim Seçtiklerimiz', 'Size özel seçtiğimiz kaliteli ürünler', 3, 8, 1),
('indirimli', 'İndirimli Ürünler', 'Fırsatları kaçırmayın!', 4, 8, 1);
