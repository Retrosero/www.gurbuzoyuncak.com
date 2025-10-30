-- ============================================
-- GÜVENLİ VERİTABANI KURULUM KOMUTLARI
-- ============================================

-- 1. Temel veritabanı şeması
mysql -u root -p gurbuz_oyuncak < database/schema.sql

-- 2. Genişletmeler (güvenli komutlarla)
mysql -u root -p gurbuz_oyuncak < database/extensions_schema_safe.sql

-- 3. Banner ve ana sayfa bölümleri
mysql -u root -p gurbuz_oyuncak < database/banners_homepage_sections.sql

-- 4. Demo veriler
mysql -u root -p gurbuz_oyuncak < database/demo_data.sql

-- Manuel olarak test etmek için:
-- mysql -u root -p gurbuz_oyuncak -e "SHOW TABLES;"
-- mysql -u root -p gurbuz_oyuncak -e "DESCRIBE users;"