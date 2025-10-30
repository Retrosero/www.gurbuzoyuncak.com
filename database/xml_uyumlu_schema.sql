-- Gürbüz Oyuncak XML Uyumlu Veritabanı Şeması
-- Tüm alan adları Türkçe, XML feed yapısına uygun
-- MySQL 5.7+ / MariaDB 10.3+ uyumlu

-- Veritabanı oluştur
CREATE DATABASE IF NOT EXISTS gurbuz_oyuncak CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE gurbuz_oyuncak;

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS kategoriler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_adi VARCHAR(200) NOT NULL,
    ust_kategori_id INT NULL,
    xml_kategori_id VARCHAR(50),
    seo_url VARCHAR(200) UNIQUE,
    aciklama TEXT,
    gorsel_url VARCHAR(500),
    sira INT DEFAULT 0,
    aktif TINYINT(1) DEFAULT 1,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ust_kategori_id) REFERENCES kategoriler(id) ON DELETE SET NULL,
    INDEX idx_xml_kategori_id (xml_kategori_id),
    INDEX idx_ust_kategori (ust_kategori_id),
    INDEX idx_aktif (aktif),
    INDEX idx_seo_url (seo_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Markalar tablosu
CREATE TABLE IF NOT EXISTS markalar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marka_adi VARCHAR(200) NOT NULL,
    seo_url VARCHAR(200) UNIQUE,
    logo_url VARCHAR(500),
    aciklama TEXT,
    sira INT DEFAULT 0,
    aktif TINYINT(1) DEFAULT 1,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seo_url (seo_url),
    INDEX idx_aktif (aktif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Ürünler tablosu (XML alanlarıyla tam uyumlu)
CREATE TABLE IF NOT EXISTS urunler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- XML'den gelen temel alanlar
    urun_kodu VARCHAR(100) UNIQUE COMMENT 'Product_code',
    xml_urun_id VARCHAR(100) COMMENT 'Product_id from XML',
    barkod VARCHAR(100) COMMENT 'Barcode',
    mpn VARCHAR(100) COMMENT 'Manufacturer Part Number',
    raf_no VARCHAR(50) COMMENT 'rafno',
    
    -- Ürün bilgileri
    urun_adi VARCHAR(500) NOT NULL COMMENT 'Name',
    alt_baslik VARCHAR(500) COMMENT 'alt_baslik',
    boyut_bilgisi VARCHAR(200) COMMENT 'alt_baslik2 - boyut',
    aciklama TEXT,
    kisa_aciklama TEXT,
    
    -- Kategori bilgileri
    ana_kategori VARCHAR(200) COMMENT 'mainCategory',
    ana_kategori_id_xml VARCHAR(50) COMMENT 'mainCategory_id',
    kategori VARCHAR(200) COMMENT 'category',
    kategori_id_xml VARCHAR(50) COMMENT 'category_id',
    alt_kategori VARCHAR(200) COMMENT 'subCategory',
    alt_kategori_id_xml VARCHAR(50) COMMENT 'subCategory_id',
    kategori_id INT COMMENT 'Internal category ID',
    
    -- Fiyat ve stok
    fiyat DECIMAL(10,2) NOT NULL COMMENT 'Price',
    para_birimi VARCHAR(10) DEFAULT 'TRY' COMMENT 'CurrencyType',
    vergi DECIMAL(5,2) DEFAULT 18.00 COMMENT 'Tax',
    karsilastirma_fiyati DECIMAL(10,2) COMMENT 'Compare at price',
    stok_miktari INT DEFAULT 0 COMMENT 'Stock',
    
    -- Marka ve menşei
    marka VARCHAR(200) COMMENT 'Brand',
    marka_id INT,
    urun_mensei VARCHAR(100) COMMENT 'urun_mensei',
    
    -- Görseller (9 resim desteği)
    gorsel_1 VARCHAR(500) COMMENT 'Image1',
    gorsel_2 VARCHAR(500) COMMENT 'Image2',
    gorsel_3 VARCHAR(500) COMMENT 'Image3',
    gorsel_4 VARCHAR(500) COMMENT 'Image4',
    gorsel_5 VARCHAR(500) COMMENT 'Image5',
    gorsel_6 VARCHAR(500) COMMENT 'Image6',
    gorsel_7 VARCHAR(500) COMMENT 'Image7',
    gorsel_8 VARCHAR(500) COMMENT 'Image8',
    gorsel_9 VARCHAR(500) COMMENT 'Image9',
    ana_gorsel VARCHAR(500),
    
    -- Ölçüler ve ağırlık
    genislik DECIMAL(10,2) COMMENT 'width (cm)',
    yukseklik DECIMAL(10,2) COMMENT 'height (cm)',
    derinlik DECIMAL(10,2) COMMENT 'depth (cm)',
    desi DECIMAL(10,2) COMMENT 'desi',
    agirlik DECIMAL(10,2) COMMENT 'agirlik (kg)',
    
    -- SEO ve durum
    seo_url VARCHAR(500) UNIQUE,
    meta_baslik VARCHAR(200),
    meta_aciklama TEXT,
    anahtar_kelimeler TEXT,
    
    -- Özellikler
    yeni_urun TINYINT(1) DEFAULT 0,
    vitrin_urunu TINYINT(1) DEFAULT 0,
    kampanyali TINYINT(1) DEFAULT 0,
    aktif TINYINT(1) DEFAULT 1,
    
    -- XML import bilgileri
    xml_categories TEXT COMMENT 'Full categories from XML',
    son_xml_import TIMESTAMP NULL,
    
    -- Tarihler
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE SET NULL,
    FOREIGN KEY (marka_id) REFERENCES markalar(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_urun_kodu (urun_kodu),
    INDEX idx_xml_urun_id (xml_urun_id),
    INDEX idx_barkod (barkod),
    INDEX idx_kategori (kategori_id),
    INDEX idx_marka (marka_id),
    INDEX idx_aktif (aktif),
    INDEX idx_fiyat (fiyat),
    INDEX idx_stok (stok_miktari),
    INDEX idx_seo_url (seo_url),
    INDEX idx_yeni (yeni_urun),
    INDEX idx_vitrin (vitrin_urunu),
    INDEX idx_kampanya (kampanyali),
    FULLTEXT INDEX idx_arama (urun_adi, aciklama, anahtar_kelimeler)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS kullanicilar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad VARCHAR(100) NOT NULL,
    soyad VARCHAR(100) NOT NULL,
    eposta VARCHAR(200) NOT NULL UNIQUE,
    sifre VARCHAR(255) NOT NULL,
    telefon VARCHAR(20),
    bakiye DECIMAL(10,2) DEFAULT 0.00,
    puan INT DEFAULT 0,
    aktif TINYINT(1) DEFAULT 1,
    eposta_onaylandi TINYINT(1) DEFAULT 0,
    son_giris TIMESTAMP NULL,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_eposta (eposta),
    INDEX idx_aktif (aktif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Adresler tablosu
CREATE TABLE IF NOT EXISTS adresler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_id INT NOT NULL,
    adres_basligi VARCHAR(100) NOT NULL,
    ad_soyad VARCHAR(200) NOT NULL,
    telefon VARCHAR(20) NOT NULL,
    adres TEXT NOT NULL,
    il VARCHAR(100) NOT NULL,
    ilce VARCHAR(100) NOT NULL,
    posta_kodu VARCHAR(10),
    varsayilan TINYINT(1) DEFAULT 0,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE,
    INDEX idx_kullanici (kullanici_id),
    INDEX idx_varsayilan (varsayilan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Siparişler tablosu
CREATE TABLE IF NOT EXISTS siparisler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siparis_no VARCHAR(50) UNIQUE NOT NULL,
    kullanici_id INT,
    
    -- Müşteri bilgileri
    musteri_adi VARCHAR(200) NOT NULL,
    musteri_eposta VARCHAR(200) NOT NULL,
    musteri_telefon VARCHAR(20) NOT NULL,
    
    -- Teslimat adresi
    teslimat_adresi TEXT NOT NULL,
    teslimat_il VARCHAR(100) NOT NULL,
    teslimat_ilce VARCHAR(100) NOT NULL,
    teslimat_posta_kodu VARCHAR(10),
    
    -- Fiyat bilgileri
    ara_toplam DECIMAL(10,2) NOT NULL,
    vergi_toplami DECIMAL(10,2) DEFAULT 0,
    kargo_ucreti DECIMAL(10,2) DEFAULT 0,
    indirim_tutari DECIMAL(10,2) DEFAULT 0,
    kullanilan_bakiye DECIMAL(10,2) DEFAULT 0,
    kupon_kodu VARCHAR(50),
    toplam_tutar DECIMAL(10,2) NOT NULL,
    
    -- Durum
    durum ENUM('beklemede', 'onaylandi', 'hazirlaniyor', 'kargoda', 'teslim_edildi', 'iptal_edildi') DEFAULT 'beklemede',
    odeme_durumu ENUM('beklemede', 'odendi', 'basarisiz', 'iade') DEFAULT 'beklemede',
    
    -- Notlar
    siparis_notu TEXT,
    admin_notu TEXT,
    
    -- Tarihler
    siparis_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE SET NULL,
    INDEX idx_siparis_no (siparis_no),
    INDEX idx_kullanici (kullanici_id),
    INDEX idx_durum (durum),
    INDEX idx_odeme_durumu (odeme_durumu),
    INDEX idx_siparis_tarihi (siparis_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Sipariş kalemleri tablosu
CREATE TABLE IF NOT EXISTS siparis_kalemleri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siparis_id INT NOT NULL,
    urun_id INT,
    urun_adi VARCHAR(500) NOT NULL,
    urun_kodu VARCHAR(100),
    miktar INT NOT NULL,
    birim_fiyat DECIMAL(10,2) NOT NULL,
    toplam_fiyat DECIMAL(10,2) NOT NULL,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siparis_id) REFERENCES siparisler(id) ON DELETE CASCADE,
    FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE SET NULL,
    INDEX idx_siparis (siparis_id),
    INDEX idx_urun (urun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Kuponlar tablosu
CREATE TABLE IF NOT EXISTS kuponlar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kupon_kodu VARCHAR(50) UNIQUE NOT NULL,
    aciklama TEXT,
    indirim_tipi ENUM('yuzde', 'sabit') NOT NULL,
    indirim_degeri DECIMAL(10,2) NOT NULL,
    minimum_tutar DECIMAL(10,2) DEFAULT 0,
    maksimum_indirim DECIMAL(10,2),
    kullanim_limiti INT,
    kullanim_sayisi INT DEFAULT 0,
    kullanici_basina_limit INT DEFAULT 1,
    baslangic_tarihi DATETIME,
    bitis_tarihi DATETIME,
    aktif TINYINT(1) DEFAULT 1,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kupon_kodu (kupon_kodu),
    INDEX idx_aktif (aktif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Kampanyalar tablosu
CREATE TABLE IF NOT EXISTS kampanyalar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kampanya_adi VARCHAR(200) NOT NULL,
    aciklama TEXT,
    kampanya_tipi ENUM('urun_indirimi', 'kategori_indirimi', 'sepet_indirimi', 'hediye_urun') NOT NULL,
    indirim_tipi ENUM('yuzde', 'sabit'),
    indirim_degeri DECIMAL(10,2),
    minimum_tutar DECIMAL(10,2),
    baslangic_tarihi DATETIME,
    bitis_tarihi DATETIME,
    oncelik INT DEFAULT 0,
    aktif TINYINT(1) DEFAULT 1,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_aktif (aktif),
    INDEX idx_tarih (baslangic_tarihi, bitis_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Bakiye hareketleri tablosu
CREATE TABLE IF NOT EXISTS bakiye_hareketleri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_id INT NOT NULL,
    islem_tipi ENUM('ekleme', 'kullanim', 'iade') NOT NULL,
    tutar DECIMAL(10,2) NOT NULL,
    aciklama TEXT,
    siparis_id INT,
    islem_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE,
    FOREIGN KEY (siparis_id) REFERENCES siparisler(id) ON DELETE SET NULL,
    INDEX idx_kullanici (kullanici_id),
    INDEX idx_islem_tipi (islem_tipi),
    INDEX idx_tarih (islem_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Puan hareketleri tablosu
CREATE TABLE IF NOT EXISTS puan_hareketleri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_id INT NOT NULL,
    islem_tipi ENUM('kazanma', 'kullanim', 'iptal') NOT NULL,
    puan INT NOT NULL,
    aciklama TEXT,
    siparis_id INT,
    islem_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE,
    FOREIGN KEY (siparis_id) REFERENCES siparisler(id) ON DELETE SET NULL,
    INDEX idx_kullanici (kullanici_id),
    INDEX idx_islem_tipi (islem_tipi),
    INDEX idx_tarih (islem_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Banner'lar tablosu
CREATE TABLE IF NOT EXISTS bannerlar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    baslik VARCHAR(200) NOT NULL,
    alt_baslik VARCHAR(300),
    gorsel_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    link_metni VARCHAR(100),
    arka_plan_rengi VARCHAR(50) DEFAULT '#1E88E5',
    metin_rengi VARCHAR(50) DEFAULT '#FFFFFF',
    sira INT DEFAULT 0,
    aktif TINYINT(1) DEFAULT 1,
    baslangic_tarihi DATETIME,
    bitis_tarihi DATETIME,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_aktif (aktif),
    INDEX idx_sira (sira),
    INDEX idx_tarih (baslangic_tarihi, bitis_tarihi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Ana sayfa bölümleri tablosu
CREATE TABLE IF NOT EXISTS anasayfa_bolumleri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bolum_tipi VARCHAR(50) NOT NULL COMMENT 'populer, yeni_gelenler, sectiklerimiz, indirimli',
    baslik VARCHAR(200) NOT NULL,
    alt_baslik VARCHAR(300),
    sira INT DEFAULT 0,
    maksimum_urun_sayisi INT DEFAULT 8,
    aktif TINYINT(1) DEFAULT 1,
    arka_plan_rengi VARCHAR(50),
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bolum_tipi (bolum_tipi),
    INDEX idx_aktif (aktif),
    INDEX idx_sira (sira)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Ana sayfa bölüm ürünleri tablosu
CREATE TABLE IF NOT EXISTS anasayfa_bolum_urunleri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bolum_id INT NOT NULL,
    urun_id INT NOT NULL,
    sira INT DEFAULT 0,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bolum_id) REFERENCES anasayfa_bolumleri(id) ON DELETE CASCADE,
    FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bolum_urun (bolum_id, urun_id),
    INDEX idx_bolum (bolum_id),
    INDEX idx_urun (urun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- XML import geçmişi tablosu
CREATE TABLE IF NOT EXISTS xml_import_gecmisi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dosya_adi VARCHAR(255),
    toplam_kayit INT DEFAULT 0,
    basarili_kayit INT DEFAULT 0,
    hatali_kayit INT DEFAULT 0,
    durum ENUM('devam_ediyor', 'tamamlandi', 'basarisiz') DEFAULT 'devam_ediyor',
    hata_mesaji TEXT,
    baslangic_zamani TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bitis_zamani TIMESTAMP NULL,
    INDEX idx_durum (durum),
    INDEX idx_tarih (baslangic_zamani)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Site ayarları tablosu
CREATE TABLE IF NOT EXISTS site_ayarlari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anahtar VARCHAR(100) UNIQUE NOT NULL,
    deger TEXT,
    aciklama TEXT,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Admin kullanıcıları tablosu
CREATE TABLE IF NOT EXISTS admin_kullanicilar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_adi VARCHAR(100) UNIQUE NOT NULL,
    sifre VARCHAR(255) NOT NULL,
    ad_soyad VARCHAR(200) NOT NULL,
    eposta VARCHAR(200) NOT NULL,
    rol ENUM('super_admin', 'admin', 'editor') DEFAULT 'editor',
    aktif TINYINT(1) DEFAULT 1,
    son_giris TIMESTAMP NULL,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kullanici_adi (kullanici_adi),
    INDEX idx_aktif (aktif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Demo admin kullanıcısı (şifre: admin123)
INSERT INTO admin_kullanicilar (kullanici_adi, sifre, ad_soyad, eposta, rol) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Kullanıcı', 'admin@gurbuzoyuncak.com', 'super_admin');

-- Temel site ayarları
INSERT INTO site_ayarlari (anahtar, deger, aciklama) VALUES
('site_baslik', 'Gürbüz Oyuncak', 'Site başlığı'),
('site_aciklama', 'Türkiye\'nin en güvenilir oyuncak toptancısı', 'Site açıklaması'),
('iletisim_telefon', '0242 XXX XX XX', 'İletişim telefonu'),
('iletisim_eposta', 'info@gurbuzoyuncak.com', 'İletişim e-postası'),
('ucretsiz_kargo_limiti', '500', 'Ücretsiz kargo limit tutarı (TL)'),
('xml_feed_url', '', 'XML feed URL adresi'),
('xml_otomatik_import', '0', 'Otomatik XML import (0: Kapalı, 1: Açık)');
