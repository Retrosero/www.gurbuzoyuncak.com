-- Gürbüz Oyuncak E-Ticaret Sistemi
-- Brands ve Age Groups Sample Data
-- Production'a deploy edilmeden önce çalıştırılmalıdır

-- Brands tablosu için örnek veriler
INSERT INTO brands (name, slug, logo_url, is_active, display_order, created_at) VALUES
('Gürbüz Oyuncak', 'gurbuz-oyuncak', NULL, 1, 1, NOW()),
('Barbie', 'barbie', NULL, 1, 2, NOW()),
('Hot Wheels', 'hot-wheels', NULL, 1, 3, NOW()),
('LEGO', 'lego', NULL, 1, 4, NOW()),
('Playmobil', 'playmobil', NULL, 1, 5, NOW()),
('Fisher-Price', 'fisher-price', NULL, 1, 6, NOW()),
('Nerf', 'nerf', NULL, 1, 7, NOW()),
('Hasbro', 'hasbro', NULL, 1, 8, NOW()),
('Mattel', 'mattel', NULL, 1, 9, NOW()),
('Chicco', 'chicco', NULL, 1, 10, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Age Groups tablosu için örnek veriler
INSERT INTO age_groups (name, slug, min_age, max_age, description, is_active, display_order, created_at) VALUES
('0-3 Yaş', '0-3-yas', 0, 3, 'Bebekler ve toddler\'lar için oyuncaklar', 1, 1, NOW()),
('4-7 Yaş', '4-7-yas', 4, 7, 'Okul öncesi ve ilkokul çocukları için oyuncaklar', 1, 2, NOW()),
('8-12 Yaş', '8-12-yas', 8, 12, 'İlkokul ve ortaokul çocukları için oyuncaklar', 1, 3, NOW()),
('13+ Yaş', '13-yas', 13, NULL, 'Ergenler ve yetişkinler için oyuncaklar', 1, 4, NOW()),
('Tüm Yaşlar', 'tum-yaslar', 0, NULL, 'Her yaş grubuna uygun oyuncaklar', 1, 5, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Verification Query (Test için - silinilebilir)
-- SELECT 'Brands Count:', COUNT(*) FROM brands WHERE is_active = 1;
-- SELECT 'Age Groups Count:', COUNT(*) FROM age_groups WHERE is_active = 1;
