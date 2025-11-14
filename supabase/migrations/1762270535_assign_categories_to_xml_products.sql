-- Migration: assign_categories_to_xml_products
-- Created at: 1762270535

-- Mevcut ürünlere kategori ataması yapan akıllı migration

-- 1. BEBEK ürünleri → Bebekler kategorisi (ID: 24)
UPDATE products 
SET category_id = 24, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%BEBEK%' 
    OR UPPER(name) LIKE '%BABY%'
    OR UPPER(brand_name) LIKE '%BABY%'
);

-- 2. FİGÜR ürünleri → Figür Oyuncaklar kategorisi (ID: 23)
UPDATE products 
SET category_id = 23, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%FİGÜR%'
    OR UPPER(name) LIKE '%FIGUR%'
    OR UPPER(name) LIKE '%PET SHOP%'
    OR UPPER(name) LIKE '%ACTION%'
);

-- 3. ARABA/ARAÇ ürünleri → Oyuncak Arabalar kategorisi (ID: 22)
UPDATE products 
SET category_id = 22, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%ARABA%'
    OR UPPER(name) LIKE '%ARAÇ%'
    OR UPPER(name) LIKE '%CAR%'
    OR UPPER(name) LIKE '%HOTWHEELS%'
    OR UPPER(name) LIKE '%HOT WHEELS%'
    OR UPPER(name) LIKE '%OFF-ROAD%'
    OR UPPER(name) LIKE '%KAYKAY%'
    OR UPPER(name) LIKE '%SCOOTER%'
    OR UPPER(name) LIKE '%PATEN%'
);

-- 4. DOKTOR/MAKYAJ SETLERİ → Kız Oyun Setleri kategorisi (ID: 50)
UPDATE products 
SET category_id = 50, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%DOKTOR%'
    OR UPPER(name) LIKE '%MAKYAJ%'
    OR UPPER(name) LIKE '%GÜZELLİK%'
    OR UPPER(name) LIKE '%VALİZ%'
    OR UPPER(name) LIKE '%ÇANTA%'
    OR UPPER(name) LIKE '%SETİ%'
);

-- 5. FROZEN vb. → Kız Oyun Setleri kategorisi (ID: 50)
UPDATE products 
SET category_id = 50, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%FROZEN%'
    OR UPPER(name) LIKE '%ELSA%'
    OR UPPER(name) LIKE '%ANNA%'
    OR UPPER(name) LIKE '%DENİZ KIZI%'
    OR UPPER(name) LIKE '%PRİNSES%'
);

-- 6. LEGO ürünleri → Lego kategorisi (ID: 52)
UPDATE products 
SET category_id = 52, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%LEGO%'
    OR UPPER(brand_name) LIKE '%LEGO%'
);

-- 7. PELUŞ ürünleri → Peluş kategorisi (ID: 55)
UPDATE products 
SET category_id = 55, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%PELUŞ%'
    OR UPPER(name) LIKE '%PELUS%'
    OR UPPER(name) LIKE '%STUFFED%'
    OR UPPER(name) LIKE '%AYICIK%'
    OR UPPER(name) LIKE '%OYUNCAK HAYVAN%'
);

-- 8. SESLİ/IŞIKLI ürünler → Sesli Işıklı Çarp Dön kategorisi (ID: 32)
UPDATE products 
SET category_id = 32, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%SESLİ%'
    OR UPPER(name) LIKE '%IŞIKLI%'
    OR UPPER(name) LIKE '%ÇARP DÖN%'
    OR UPPER(name) LIKE '%MÜZİKLİ%'
);

-- 9. UZAKTAN KUMANDA → Uzaktan Kumandalı Araçlar kategorisi (ID: 42)
UPDATE products 
SET category_id = 42, updated_at = NOW()
WHERE category_id IS NULL 
AND (
    UPPER(name) LIKE '%UZAKTAN%'
    OR UPPER(name) LIKE '%KUMANDA%'
    OR UPPER(name) LIKE '%RC%'
    OR UPPER(name) LIKE '%REMOTE%'
);

-- 10. Kalan tüm ürünler → Ana Oyuncak kategorisi (ID: 17)
UPDATE products 
SET category_id = 17, updated_at = NOW()
WHERE category_id IS NULL 
AND is_active = true;;