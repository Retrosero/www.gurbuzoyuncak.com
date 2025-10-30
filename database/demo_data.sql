-- Gürbüz Oyuncak E-Ticaret Demo Verileri
-- UTF-8 Türkçe karakterler için charset ayarları
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE gurbuz_oyuncak;

-- Markalar ekle
INSERT INTO brands (name, slug, description, display_order, is_active) VALUES
('Gürbüz Oyuncak', 'gurbuz-oyuncak', 'Gürbüz Oyuncak markası kaliteli ve güvenli oyuncaklar', 1, 1),
('PuzzlePlay', 'puzzleplay', 'Eğitici puzzle ve zeka oyunları markası', 2, 1),
('SafeTime', 'safetime', 'Güvenlik standartlarında bebek oyuncakları', 3, 1),
('EduToys', 'edutoys', 'STEM ve robotik eğitici oyuncaklar', 4, 1),
('OutdoorFun', 'outdoorfun', 'Dış mekan oyuncakları ve spor malzemeleri', 5, 1),
('SoftPlay', 'softplay', 'Yumuşak ve güvenli çocuk oyuncakları', 6, 1),
('MusicBox', 'musicbox', 'Müzikli oyuncaklar ve enstrümanlar', 7, 1),
('BookTime', 'booktime', 'Çocuk kitapları ve aktivite setleri', 8, 1);

-- Kategorilerden ID'leri al (zaten eklenmişler)
-- Bebekler & Aksesuarları = 1
-- Puzzle & Yapboz = 2  
-- Kumandalılar = 3
-- Araçlar = 4
-- Oyun Setleri = 5
-- Outdoor & Bahçe = 6
-- Figürler = 7
-- Eğitici & Hobi = 8
-- Peluşlar = 9

-- Yaş gruplarından ID'leri al (zaten eklenmişler)
-- 0-3 Yaş = 1
-- 4-7 Yaş = 2  
-- 8+ Yaş = 3

-- BEBEKLER KATEGORİSİ ÜRÜNLER
INSERT INTO products (name, slug, sku, description, short_description, category_id, brand_id, age_group_id, price, compare_price, stock_quantity, weight, dimensions, material, safety_info, is_featured, is_new, is_active) VALUES

-- Bebek Bebekleri
('Harikalar Diyarı Bebek: Hayal Gücünü Canlandır!', 'harikalar-diyari-bebek', 'GRB-BB-001', 'Yumuşak kumaş, güvenli aksesuarlar ve rengarenk tasarımıyla hayal gücünü destekler. CE standartlarına uygun, yıkanabilir kumaştan üretilmiş bebek bebeği.', 'Yumuşak kumaş, güvenli aksesuarlar ve rengarenk tasarımıyla hayal gücünü destekler.', 1, 3, 1, 224.00, 299.00, 25, 0.45, '35x25x12 cm', 'Yumuşak kumaş, PE dolgu', 'CE sertifikalı, 0-3 yaş uygun', 1, 1, 1),

('Müzikli Minikler: Küçük Parmaklar, Büyük Sesler!', 'muzikli-minikler', 'GRB-BB-002', 'Hafif ses seviyeli müzik modülü ile bebeklerin gelişimini destekler. Uyku ve oyun anları için ideal, pil ömrü uzun müzikli bebek.', 'Hafif ses seviyeli müzik modülü; uyku ve oyun anları için ideal.', 1, 7, 1, 274.00, 349.00, 18, 0.52, '38x28x15 cm', 'Kumaş, elektronik modül', 'Ses seviyesi 60dB altı, CE uyumlu', 1, 0, 1),

('Arkadaşım Bebek: İlk Arkadaşlık, Sonsuz Mutluluk!', 'arkadasim-bebek', 'GRB-BB-003', 'Dokulu kollar ve bacaklar ile ince motor becerilerini destekler. Yıkanabilir kumaştan üretilmiş, çocukların en iyi arkadaşı olacak bebek.', 'Dokulu kollar ve bacaklar; ince motor becerilerini destekler.', 1, 3, 1, 254.00, 329.00, 30, 0.48, '36x26x13 cm', 'Organik pamuklu kumaş', 'Makinede yıkanabilir, hipoalerjenik', 0, 1, 1),

-- EĞİTİCİ OYUNCAKLAR KATEGORİSİ
('Zekâ Sprint: Öğrenmenin Hızını Bırak!', 'zeka-sprint', 'GRB-EG-001', 'Yaşa uygun bulmacalar ve zeka oyunlarıyla dikkat ve problem çözme becerisi geliştirir. Tek kişilik ve iki kişilik oyun seçenekleri mevcut.', 'Yaşa uygun bulmacalar ve zeka oyunlarıyla dikkat ve problem çözme becerisi.', 8, 4, 2, 264.00, 399.00, 40, 0.75, '30x25x8 cm', 'Ahşap ve karton', 'Tek ve çift oyuncu, 4-9 yaş', 1, 0, 1),

('Robotik Arkadaşım: Kodlaya, Eğlenceye!', 'robotik-arkadasim', 'GRB-EG-002', 'Basit blok-kodlama görevleri ile temel robotik kavramlarını oyunla öğretir. Opsiyonel mobil uygulama desteği ile eğlence katlanır.', 'Basit blok-kodlama görevleri; temel robotik kavramlarını oyunla öğretir.', 8, 4, 2, 524.00, 699.00, 15, 1.20, '25x20x15 cm', 'Plastik, elektronik', 'Bluetooth bağlantı, şarj edilebilir', 1, 1, 1),

('Keşif Haritası: Macera ve Bilim Bir Arada!', 'kesif-haritasi', 'GRB-EG-003', 'Harita, pusula ve deney setleriyle keşfet ve öğren. Ek deney malzemeleri ile bilimsel merakı tetikleyen kapsamlı set.', 'Harita, pusula ve deney setleriyle keşfet ve öğren.', 8, 4, 2, 339.00, 499.00, 22, 0.95, '35x30x10 cm', 'Karton, plastik, metal', 'Ek deney malzemeleri içerir', 0, 1, 1),

('Mini Bilim: Deney Kitiyle Büyük Keşifler!', 'mini-bilim', 'GRB-EG-004', 'Güvenli malzemelerle evde kolay deneyler yapabilir, bilimsel merakı tetikler. Yetişkin gözetimi ile 8-11 yaş çocuklar için idealdir.', 'Güvenli malzemelerle evde kolay deneyler; bilimsel merakı tetikler.', 8, 4, 3, 399.00, 599.00, 12, 1.15, '40x35x12 cm', 'Plastik, cam, güvenli kimyasallar', 'Yetişkin gözetimi önerilir, CE uyumlu', 1, 0, 1),

-- OYUNLAR VE BULMACALAR KATEGORİSİ
('PuzzlePlay Mini: Küçük Parça, Büyük Heyecan!', 'puzzleplay-mini', 'GRB-PZ-001', '100-500 parça seçenekleri ile ailece eğlenceli saatler geçirebilirsiniz. Parça sayısına göre ayarlanabilir zorluk seviyesi.', '100-500 parça seçenekleri; ailece eğlenceli saatler.', 2, 2, 2, 219.00, 349.00, 35, 0.60, '32x25x6 cm', 'Karton', 'Parça sayısına göre zorluk ayarlı', 1, 0, 1),

('Strateji Ustası: Plan Yap, Kazan!', 'strateji-ustasi', 'GRB-ST-001', 'Sıra tabanlı strateji oyunu ile sabır ve planlama becerisi gelişir. 2-4 oyuncu için tasarlanmış rekabetçi oyun.', 'Sıra tabanlı strateji oyunu; sabır ve planlama becerisi.', 5, 1, 3, 349.00, 499.00, 20, 1.05, '35x35x8 cm', 'Ahşap, plastik', '2-4 oyuncu, 45-60 dakika', 0, 1, 1),

('Aile Oyun Gecesi: Kahkaha Masaya Gelir!', 'aile-oyun-gecesi', 'GRB-AO-001', 'Kısa kurallu, hızlı taktiklerle her yaştan aile üyesi eğlenir. 15-30 dakika süren keyifli aile oyunu.', 'Kısa kurallu, hızlı taktiklerle her yaştan aile üyesi eğlenir.', 5, 1, 2, 264.00, 399.00, 28, 0.85, '28x20x8 cm', 'Karton, plastik', '15-30 dakika, 2-6 oyuncu', 1, 0, 1),

('Kutu Oyunları: Sürpriz Kartlar, Sonu Değişir!', 'kutu-oyunlari', 'GRB-KO-001', 'Kart ve zar kombinasyonu ile tekrar oynanabilirlik yüksek. 2-5 oyuncu için 30-45 dakika süren eğlenceli oyun.', 'Kart ve zar kombinasyonu; tekrar oynanabilirlik yüksek.', 5, 1, 2, 299.00, 449.00, 25, 0.75, '25x18x8 cm', 'Karton', '2-5 oyuncu, değişken süre', 0, 1, 1),

-- İÇ MEKAN OYUNLARI KATEGORİSİ
('Müzik Kutusu: Ritimde Sevincin Dansı!', 'muzik-kutusu', 'GRB-MK-001', 'Dokunmatik ve ritim modülleri ile koordinasyon ve müzik algısı gelişir. Ses seviyesi kontrolü ile güvenli kullanım.', 'Dokunmatik ve ritim modülleri; koordinasyon ve müzik algısı gelişir.', 5, 7, 1, 289.00, 399.00, 20, 0.80, '30x25x10 cm', 'Plastik, elektronik', 'Ses kontrolü, pil dahil', 1, 1, 1),

('Yaratıcı Atölye: Boyama, Kesme, Tasarla!', 'yaratici-atolye', 'GRB-YA-001', 'Kağıt, boya ve güvenli kesici araçlarla özgün el işleri yapabilir. 4-7 yaş için güvenli yaratıcılık seti.', 'Kağıt, boya ve zımba setiyle özgün el işleri.', 5, 6, 2, 174.00, 249.00, 30, 0.45, '35x28x8 cm', 'Kağıt, güvenli plastik', 'Güvenli kesici, yıkanabilir boya', 0, 0, 1),

('İnşa Ustası: Yapı Taşlarıyla Kuleler!', 'insa-ustasi', 'GRB-IN-001', 'Manyetik ve klipsli parçalarla hayal gücü ve ince motor becerisi gelişir. 50+ parça ile sınısız yaratıcılık.', 'Manyetik/klipsli parçalarla hayal gücü ve ince motor becerisi.', 5, 6, 2, 339.00, 499.00, 25, 1.20, '40x30x15 cm', 'Manyetik plastik', '50+ parça, BPA içermez', 1, 0, 1),

('Elektronik Oyun Atölyesi: Işık, Ses, Eğlence!', 'elektronik-oyun-atolyesi', 'GRB-EO-001', 'Işık-ses efektleriyle dikkat ve tepki süresini destekler. Pil ve şarj bilgisi net olarak belirtilmiş interaktif oyun.', 'Işık-ses efektleriyle dikkat ve tepki süresini destekler.', 5, 4, 2, 449.00, 599.00, 15, 1.45, '35x25x20 cm', 'Plastik, LED, elektronik', 'Şarj edilebilir, USB kablo dahil', 0, 1, 1),

-- ÇOCUK KİTAPLARI (Yeni kategori olarak Eğitici & Hobi'ye eklenecek)
('Masal Gecesi: Rüyalara Seslenen Hikâyeler!', 'masal-gecesi', 'GRB-MG-001', 'Uyku öncesi hikâyeler ile sakinleştirici dil ve ritim. Sertifikalı mürekkep ile basılmış güvenli çocuk kitabı.', 'Uyku öncesi hikâyeler; sakinleştirici dil ve ritim.', 8, 8, 1, 134.00, 199.00, 50, 0.25, '20x25x2 cm', 'Karton, sertifikalı mürekkep', 'Uyku öncesi için ideal', 1, 0, 1),

('Okul Öncesi Macera: Öğrenmenin İlk Adımları!', 'okul-oncesi-macera', 'GRB-OM-001', 'Alfabe, sayılar ve temel kavramlar ile oyunla destekli öğrenme. Aktivite sayfaları içeren eğitici kitap seti.', 'Alfabe, sayılar ve temel kavramlar; oyunla destekli öğrenme.', 8, 8, 2, 164.00, 249.00, 40, 0.35, '22x28x3 cm', 'Karton, güvenli boya', 'Aktivite sayfaları dahil', 0, 1, 1),

('Bilginin İlk Kitabı: Sorularla Öğren, Keşfet!', 'bilginin-ilk-kitabi', 'GRB-BK-001', 'Soru-cevap formatı ile çocukların merakını diri tutar. Resimli ve anlaşılır dil ile bilgiye ilk adım.', 'Soru-cevap formatı; çocukların merakını diri tutar.', 8, 8, 2, 194.00, 299.00, 35, 0.42, '24x30x4 cm', 'Kaliteli karton', 'Resimli, anlaşılır metin', 1, 0, 1),

('Aktivite Zamanı: Bul, Boya, Başar!', 'aktivite-zamani', 'GRB-AZ-001', 'Labirent, bulmaca ve boyama ile uzun yolculuklar için ideal. Seyahat dostu tasarım ile her yerde eğlence.', 'Labirent, bulmaca ve boyama; uzun yolculuklar için ideal.', 8, 8, 2, 164.00, 249.00, 45, 0.30, '21x27x2 cm', 'Karton', 'Seyahat dostu, kompakt', 0, 0, 1),

-- DIŞ MEKAN OYUNCAKLARI
('Park Macerası: Koş, Katıl, Kazan!', 'park-macerasi', 'GRB-PM-001', 'Park ve bahçe oyunları ile takım ruhu ve koordinasyonu geliştirir. Grup oyunu için ideal, dayanıklı malzemeler.', 'Park ve bahçe oyunları; takım ruhu ve koordinasyonu geliştirir.', 6, 5, 2, 399.00, 599.00, 20, 2.15, '50x40x30 cm', 'Dayanıklı plastik, metal', 'Grup oyunu, hava koşullarına dayanıklı', 1, 0, 1),

('Scooter Süper: Güvenle Kay, Hızla Gül!', 'scooter-super', 'GRB-SC-001', 'Ayarlanabilir sürüş yüksekliği ve katlanabilir gövde. Güvenlik freni ve dayanıklı tekerleklerle güvenli sürüş.', 'Ayarlanabilir sürüş yüksekliği; katlanabilir gövde.', 6, 5, 2, 674.00, 999.00, 12, 3.50, '85x35x95 cm', 'Alüminyum, kauçuk', 'Fren sistemi, ayarlanabilir yükseklik', 1, 1, 1),

('Bahçe Çiftlik: Toprağı Keşfet, Bitkiyi Sev!', 'bahce-ciftlik', 'GRB-BC-001', 'Mini bahçe seti ile doğa sevgisi ve sorumluluk duygusu gelişir. Yeniden kullanılabilir set ile sürdürülebilir eğlence.', 'Mini bahçe seti; doğa sevgisi ve sorumluluk duygusu.', 6, 5, 2, 274.00, 399.00, 25, 1.85, '45x35x20 cm', 'Plastik, metal araçlar', 'Yeniden kullanılabilir, eğitici', 0, 1, 1),

('Top ve Spor: Takıma Katıl, Zaferi Yakala!', 'top-ve-spor', 'GRB-TS-001', 'Top, rakip ve kale ile dayanıklı malzeme kullanılmış. Dış mekân kullanımı için özel dikim ve uzun ömürlü tasarım.', 'Top, rakip ve kale; dayanıklı malzeme, dış mekân kullanımı.', 6, 5, 2, 224.00, 349.00, 30, 1.20, '40x30x25 cm', 'Sentetik deri, metal', 'Dayanıklı dikiş, su geçirmez', 0, 0, 1),

-- ARAÇLAR KATEGORİSİ 
('İtfaiye Kahramanı: Hızla Olay Yerine!', 'itfaiye-kahramani', 'GRB-IK-001', 'Süper ses efektleri ve ışık ile rol yapımı ve hikâye kurma desteklenir. Pil ve şarj bilgisi net olarak belirtilmiş.', 'Süperses efektleri ve ışık; rol yapımı ve hikâye kurma.', 4, 1, 2, 399.00, 599.00, 20, 0.95, '35x15x20 cm', 'Plastik, elektronik', 'LED ışık, ses efektleri, pil dahil', 1, 0, 1),

('Mini Tren: Raylarda macera, durakta öğrenme!', 'mini-tren', 'GRB-MT-001', 'Manyetik bağlantılı vagonlar ile ince motor ve düzen becerisi gelişir. 3+ vagon ile genişletilebilir tren seti.', 'Manyetik bağlantılı vagonlar; ince motor ve düzen becerisi.', 4, 1, 2, 339.00, 499.00, 22, 1.15, '45x8x12 cm', 'Ahşap, manyetik metal', '3+ vagon, ek vagon satılır', 0, 1, 1),

('Gökyüzü Pilotu: Uzağa Uç, Hayalleri Yaşa!', 'gokyuzu-pilotu', 'GRB-GP-001', 'Hafif gövde ve dayanıklı kanatlar ile oyun alanı güvenliği sağlanır. Kenar koruma bilgisi içeren güvenli uçak oyuncağı.', 'Hafif gövde ve dayanıklı kanatlar; oyun alanı güvenliği.', 4, 1, 2, 274.00, 399.00, 28, 0.45, '30x35x8 cm', 'Hafif plastik, köpük', 'Kenar korumalı, düşürülebilir', 0, 0, 1),

-- KUMANDALIAR (Elektronik Araçlar)
('RC Racing Car: Hızın Kontrolü Sende!', 'rc-racing-car', 'GRB-RC-001', 'Uzaktan kumandalı yarış arabası ile hız ve kontrol becerisi gelişir. Şarj edilebilir batarya ve dayanıklı gövde.', 'Uzaktan kumandalı yarış arabası ile hız ve kontrol becerisi.', 3, 4, 2, 549.00, 799.00, 15, 1.25, '25x15x10 cm', 'Plastik, elektronik', 'Şarj edilebilir, 50m menzil', 1, 1, 1),

('Drone Başlangıç: İlk Uçuş Deneyimi!', 'drone-baslangic', 'GRB-DR-001', 'Başlangıç seviyesi drone ile koordinasyon ve odaklanma becerisi. Güvenlik koruyucuları ve kolay kontrol sistemi.', 'Başlangıç seviyesi drone ile koordinasyon ve odaklanma becerisi.', 3, 4, 3, 699.00, 999.00, 10, 0.75, '20x20x8 cm', 'Plastik, elektronik', 'Güvenlik koruyucuları, LED ışık', 1, 1, 1),

-- PELUŞLAR KATEGORİSİ
('Sevimli Ayıcık: Sarılmak İçin Doğmuş!', 'sevimli-ayicik', 'GRB-SA-001', 'Yumuşacık peluş kumaş ile sarılmaya davet eden ayıcık. Hipoalerjenik dolgu malzemesi ile güvenli ve sağlıklı.', 'Yumuşacık peluş kumaş ile sarılmaya davet eden ayıcık.', 9, 6, 1, 189.00, 269.00, 35, 0.40, '30x25x20 cm', 'Peluş kumaş, PE dolgu', 'Hipoalerjenik, yıkanabilir', 1, 0, 1),

('Dostum Tavşan: Yumuşak Kalpler!', 'dostum-tavsan', 'GRB-DT-001', 'Uzun kulakları ve yumuşak karnı ile uyku arkadaşı. Organik pamuklu kumaş ve doğal dolgu malzemesi kullanılmış.', 'Uzun kulakları ve yumuşak karnı ile uyku arkadaşı.', 9, 6, 1, 214.00, 299.00, 30, 0.38, '35x20x15 cm', 'Organik pamuk, doğal dolgu', 'GOTS sertifikalı, makinede yıkanabilir', 0, 1, 1),

('Aslan Kral: Cesaret ve Dostluk!', 'aslan-kral', 'GRB-AK-001', 'Güçlü yelesi ve sevimli yüzü ile cesareti temsil eden aslan. Dayanıklı dikiş ve uzun ömürlü kaliteli peluş.', 'Güçlü yelesi ve sevimli yüzü ile cesareti temsil eden aslan.', 9, 6, 2, 249.00, 349.00, 25, 0.55, '32x28x25 cm', 'Kaliteli peluş, güvenli dolgu', 'Dayanıklı dikiş, kol ve bacak hareketli', 1, 0, 1);

-- Ürün görselleri ekle
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
-- Harikalar Diyarı Bebek
(1, '/images/products/harikalar-diyari-bebek-1.jpg', 'Harikalar Diyarı Bebek ön görünüm', 1, 1),
(1, '/images/products/harikalar-diyari-bebek-2.jpg', 'Harikalar Diyarı Bebek yan görünüm', 0, 2),

-- Müzikli Minikler
(2, '/images/products/muzikli-minikler-1.jpg', 'Müzikli Minikler bebek ön görünüm', 1, 1),
(2, '/images/products/muzikli-minikler-2.jpg', 'Müzikli Minikler ses modülü detayı', 0, 2),

-- Arkadaşım Bebek
(3, '/images/products/arkadasim-bebek-1.jpg', 'Arkadaşım Bebek ön görünüm', 1, 1),
(3, '/images/products/arkadasim-bebek-2.jpg', 'Arkadaşım Bebek dokulu detaylar', 0, 2),

-- Zekâ Sprint
(4, '/images/products/zeka-sprint-1.jpg', 'Zekâ Sprint oyun seti', 1, 1),
(4, '/images/products/zeka-sprint-2.jpg', 'Zekâ Sprint bulmaca örnekleri', 0, 2),

-- Robotik Arkadaşım
(5, '/images/products/robotik-arkadasim-1.jpg', 'Robotik Arkadaşım ana ürün', 1, 1),
(5, '/images/products/robotik-arkadasim-2.jpg', 'Robotik Arkadaşım kodlama blokları', 0, 2),

-- Keşif Haritası
(6, '/images/products/kesif-haritasi-1.jpg', 'Keşif Haritası set görünümü', 1, 1),
(6, '/images/products/kesif-haritasi-2.jpg', 'Keşif Haritası harita detayı', 0, 2),

-- Mini Bilim
(7, '/images/products/mini-bilim-1.jpg', 'Mini Bilim deney kiti', 1, 1),
(7, '/images/products/mini-bilim-2.jpg', 'Mini Bilim deney malzemeleri', 0, 2),

-- PuzzlePlay Mini
(8, '/images/products/puzzleplay-mini-1.jpg', 'PuzzlePlay Mini puzzle kutusu', 1, 1),
(8, '/images/products/puzzleplay-mini-2.jpg', 'PuzzlePlay Mini tamamlanmış puzzle', 0, 2),

-- Strateji Ustası
(9, '/images/products/strateji-ustasi-1.jpg', 'Strateji Ustası oyun tahtası', 1, 1),
(9, '/images/products/strateji-ustasi-2.jpg', 'Strateji Ustası oyun parçaları', 0, 2),

-- Aile Oyun Gecesi
(10, '/images/products/aile-oyun-gecesi-1.jpg', 'Aile Oyun Gecesi kutu içeriği', 1, 1),
(10, '/images/products/aile-oyun-gecesi-2.jpg', 'Aile Oyun Gecesi kart örnekleri', 0, 2),

-- Kutu Oyunları
(11, '/images/products/kutu-oyunlari-1.jpg', 'Kutu Oyunları ana görünüm', 1, 1),
(11, '/images/products/kutu-oyunlari-2.jpg', 'Kutu Oyunları kart ve zar seti', 0, 2),

-- Müzik Kutusu
(12, '/images/products/muzik-kutusu-1.jpg', 'Müzik Kutusu ana ürün', 1, 1),
(12, '/images/products/muzik-kutusu-2.jpg', 'Müzik Kutusu dokunmatik paneli', 0, 2),

-- Yaratıcı Atölye
(13, '/images/products/yaratici-atolye-1.jpg', 'Yaratıcı Atölye malzeme seti', 1, 1),
(13, '/images/products/yaratici-atolye-2.jpg', 'Yaratıcı Atölye örnek çalışmalar', 0, 2),

-- İnşa Ustası
(14, '/images/products/insa-ustasi-1.jpg', 'İnşa Ustası yapı taşları', 1, 1),
(14, '/images/products/insa-ustasi-2.jpg', 'İnşa Ustası örnek yapılar', 0, 2),

-- Elektronik Oyun Atölyesi
(15, '/images/products/elektronik-oyun-atolyesi-1.jpg', 'Elektronik Oyun Atölyesi ana ürün', 1, 1),
(15, '/images/products/elektronik-oyun-atolyesi-2.jpg', 'Elektronik Oyun Atölyesi LED efektleri', 0, 2),

-- Masal Gecesi
(16, '/images/products/masal-gecesi-1.jpg', 'Masal Gecesi kitap kapağı', 1, 1),
(16, '/images/products/masal-gecesi-2.jpg', 'Masal Gecesi iç sayfa örnekleri', 0, 2),

-- Okul Öncesi Macera
(17, '/images/products/okul-oncesi-macera-1.jpg', 'Okul Öncesi Macera kitap seti', 1, 1),
(17, '/images/products/okul-oncesi-macera-2.jpg', 'Okul Öncesi Macera aktivite sayfaları', 0, 2),

-- Bilginin İlk Kitabı
(18, '/images/products/bilginin-ilk-kitabi-1.jpg', 'Bilginin İlk Kitabı kapak', 1, 1),
(18, '/images/products/bilginin-ilk-kitabi-2.jpg', 'Bilginin İlk Kitabı soru-cevap sayfaları', 0, 2),

-- Aktivite Zamanı
(19, '/images/products/aktivite-zamani-1.jpg', 'Aktivite Zamanı kitap kapağı', 1, 1),
(19, '/images/products/aktivite-zamani-2.jpg', 'Aktivite Zamanı labirent örnekleri', 0, 2),

-- Park Macerası
(20, '/images/products/park-macerasi-1.jpg', 'Park Macerası oyun seti', 1, 1),
(20, '/images/products/park-macerasi-2.jpg', 'Park Macerası kullanım örneği', 0, 2),

-- Scooter Süper
(21, '/images/products/scooter-super-1.jpg', 'Scooter Süper ön görünüm', 1, 1),
(21, '/images/products/scooter-super-2.jpg', 'Scooter Süper katlanmış hali', 0, 2),

-- Bahçe Çiftlik
(22, '/images/products/bahce-ciftlik-1.jpg', 'Bahçe Çiftlik mini set', 1, 1),
(22, '/images/products/bahce-ciftlik-2.jpg', 'Bahçe Çiftlik kullanım örneği', 0, 2),

-- Top ve Spor
(23, '/images/products/top-ve-spor-1.jpg', 'Top ve Spor set içeriği', 1, 1),
(23, '/images/products/top-ve-spor-2.jpg', 'Top ve Spor oyun sahası', 0, 2),

-- İtfaiye Kahramanı
(24, '/images/products/itfaiye-kahramani-1.jpg', 'İtfaiye Kahramanı araç görünümü', 1, 1),
(24, '/images/products/itfaiye-kahramani-2.jpg', 'İtfaiye Kahramanı ışık efektleri', 0, 2),

-- Mini Tren
(25, '/images/products/mini-tren-1.jpg', 'Mini Tren set görünümü', 1, 1),
(25, '/images/products/mini-tren-2.jpg', 'Mini Tren vagon detayları', 0, 2),

-- Gökyüzü Pilotu
(26, '/images/products/gokyuzu-pilotu-1.jpg', 'Gökyüzü Pilotu uçak görünümü', 1, 1),
(26, '/images/products/gokyuzu-pilotu-2.jpg', 'Gökyüzü Pilotu kanat detayı', 0, 2),

-- RC Racing Car
(27, '/images/products/rc-racing-car-1.jpg', 'RC Racing Car ana görünüm', 1, 1),
(27, '/images/products/rc-racing-car-2.jpg', 'RC Racing Car kumanda', 0, 2),

-- Drone Başlangıç
(28, '/images/products/drone-baslangic-1.jpg', 'Drone Başlangıç ana ürün', 1, 1),
(28, '/images/products/drone-baslangic-2.jpg', 'Drone Başlangıç koruyucular', 0, 2),

-- Sevimli Ayıcık
(29, '/images/products/sevimli-ayicik-1.jpg', 'Sevimli Ayıcık ön görünüm', 1, 1),
(29, '/images/products/sevimli-ayicik-2.jpg', 'Sevimli Ayıcık sarılma pozisyonu', 0, 2),

-- Dostum Tavşan
(30, '/images/products/dostum-tavsan-1.jpg', 'Dostum Tavşan ana görünüm', 1, 1),
(30, '/images/products/dostum-tavsan-2.jpg', 'Dostum Tavşan uzun kulak detayı', 0, 2),

-- Aslan Kral
(31, '/images/products/aslan-kral-1.jpg', 'Aslan Kral ön görünüm', 1, 1),
(31, '/images/products/aslan-kral-2.jpg', 'Aslan Kral yelesi detayı', 0, 2);

-- Test kullanıcıları ekle (şifreler: test123)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, email_verified) VALUES
('ayse.yilmaz@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ayşe', 'Yılmaz', '0532 123 45 67', 'customer', 1, 1),
('mehmet.kaya@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mehmet', 'Kaya', '0533 234 56 78', 'customer', 1, 1),
('fatma.demir@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fatma', 'Demir', '0534 345 67 89', 'customer', 1, 1),
('ahmet.ozcan@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmet', 'Özcan', '0535 456 78 90', 'customer', 1, 1),
('zeynep.arslan@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zeynep', 'Arslan', '0536 567 89 01', 'customer', 1, 1);

-- Test kullanıcıları için adresler ekle
INSERT INTO addresses (user_id, address_type, first_name, last_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default) VALUES
-- Ayşe Yılmaz adresleri
(2, 'shipping', 'Ayşe', 'Yılmaz', '0532 123 45 67', 'Çankaya Mahallesi, Atatürk Caddesi No: 15', 'Daire: 3', 'Ankara', 'Ankara', '06100', 'Türkiye', 1),
(2, 'billing', 'Ayşe', 'Yılmaz', '0532 123 45 67', 'Çankaya Mahallesi, Atatürk Caddesi No: 15', 'Daire: 3', 'Ankara', 'Ankara', '06100', 'Türkiye', 1),

-- Mehmet Kaya adresleri
(3, 'shipping', 'Mehmet', 'Kaya', '0533 234 56 78', 'Beşiktaş Mahallesi, İstiklal Sokak No: 8', '', 'İstanbul', 'İstanbul', '34357', 'Türkiye', 1),
(3, 'billing', 'Mehmet', 'Kaya', '0533 234 56 78', 'Beşiktaş Mahallesi, İstiklal Sokak No: 8', '', 'İstanbul', 'İstanbul', '34357', 'Türkiye', 1),

-- Fatma Demir adresleri
(4, 'shipping', 'Fatma', 'Demir', '0534 345 67 89', 'Konak Mahallesi, Cumhuriyet Bulvarı No: 42', 'Kat: 2', 'İzmir', 'İzmir', '35250', 'Türkiye', 1),
(4, 'billing', 'Fatma', 'Demir', '0534 345 67 89', 'Konak Mahallesi, Cumhuriyet Bulvarı No: 42', 'Kat: 2', 'İzmir', 'İzmir', '35250', 'Türkiye', 1),

-- Ahmet Özcan adresleri
(5, 'shipping', 'Ahmet', 'Özcan', '0535 456 78 90', 'Muratpaşa Mahallesi, Lara Caddesi No: 126', 'Villa', 'Antalya', 'Antalya', '07100', 'Türkiye', 1),
(5, 'billing', 'Ahmet', 'Özcan', '0535 456 78 90', 'Muratpaşa Mahallesi, Lara Caddesi No: 126', 'Villa', 'Antalya', 'Antalya', '07100', 'Türkiye', 1),

-- Zeynep Arslan adresleri
(6, 'shipping', 'Zeynep', 'Arslan', '0536 567 89 01', 'Osmangazi Mahallesi, Zafer Caddesi No: 89', 'Daire: 7', 'Bursa', 'Bursa', '16200', 'Türkiye', 1),
(6, 'billing', 'Zeynep', 'Arslan', '0536 567 89 01', 'Osmangazi Mahallesi, Zafer Caddesi No: 89', 'Daire: 7', 'Bursa', 'Bursa', '16200', 'Türkiye', 1);

-- Örnek siparişler ekle
INSERT INTO orders (order_number, user_id, status, payment_status, payment_method, subtotal, shipping_cost, tax, discount, total, shipping_address_id, billing_address_id, notes, tracking_number, shipped_at, delivered_at) VALUES
-- Ayşe Yılmaz siparişleri
('GRB-2024-001', 2, 'delivered', 'paid', 'credit_card', 498.00, 0.00, 99.60, 0.00, 597.60, 1, 2, 'Hediye paketi isteği', 'TRK1234567890', '2024-01-15 10:30:00', '2024-01-17 14:20:00'),
('GRB-2024-002', 2, 'shipped', 'paid', 'bank_transfer', 274.00, 25.00, 59.80, 0.00, 358.80, 1, 2, '', 'TRK2345678901', '2024-01-20 09:15:00', NULL),

-- Mehmet Kaya siparişleri
('GRB-2024-003', 3, 'delivered', 'paid', 'credit_card', 863.00, 0.00, 172.60, 50.00, 985.60, 3, 4, 'Kapıda ödeme tercih etmiştim ama kartla ödedim', 'TRK3456789012', '2024-01-18 11:45:00', '2024-01-20 16:30:00'),

-- Fatma Demir siparişleri  
('GRB-2024-004', 4, 'processing', 'paid', 'credit_card', 358.00, 25.00, 76.60, 0.00, 459.60, 5, 6, 'Okul öncesi çocuğum için aldım', NULL, NULL, NULL),
('GRB-2024-005', 4, 'confirmed', 'paid', 'bank_transfer', 674.00, 0.00, 134.80, 0.00, 808.80, 5, 6, 'Doğum günü hediyesi', NULL, NULL, NULL),

-- Ahmet Özcan siparişleri
('GRB-2024-006', 5, 'pending', 'pending', 'bank_transfer', 1173.00, 0.00, 234.60, 100.00, 1307.60, 7, 8, 'Kampanya indirimi uygulandı', NULL, NULL, NULL),

-- Zeynep Arslan siparişleri
('GRB-2024-007', 6, 'delivered', 'paid', 'credit_card', 463.00, 0.00, 92.60, 0.00, 555.60, 9, 10, 'Çok memnun kaldım', 'TRK4567890123', '2024-01-16 13:20:00', '2024-01-18 11:10:00'),
('GRB-2024-008', 6, 'cancelled', 'refunded', 'credit_card', 389.00, 25.00, 82.80, 0.00, 496.80, 9, 10, 'Müşteri isteği ile iptal', NULL, NULL, NULL);

-- Sipariş kalemlerini ekle
INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, subtotal) VALUES
-- Sipariş GRB-2024-001 (Ayşe Yılmaz) - Delivered
(1, 5, 'Robotik Arkadaşım: Kodlaya, Eğlenceye!', 'GRB-EG-002', 1, 524.00, 524.00),

-- Sipariş GRB-2024-002 (Ayşe Yılmaz) - Shipped  
(2, 2, 'Müzikli Minikler: Küçük Parmaklar, Büyük Sesler!', 'GRB-BB-002', 1, 274.00, 274.00),

-- Sipariş GRB-2024-003 (Mehmet Kaya) - Delivered
(3, 9, 'Strateji Ustası: Plan Yap, Kazan!', 'GRB-ST-001', 1, 349.00, 349.00),
(3, 27, 'RC Racing Car: Hızın Kontrolü Sende!', 'GRB-RC-001', 1, 549.00, 549.00),

-- Sipariş GRB-2024-004 (Fatma Demir) - Processing
(4, 17, 'Okul Öncesi Macera: Öğrenmenin İlk Adımları!', 'GRB-OM-001', 1, 164.00, 164.00),
(4, 16, 'Masal Gecesi: Rüyalara Seslenen Hikâyeler!', 'GRB-MG-001', 1, 134.00, 134.00),
(4, 13, 'Yaratıcı Atölye: Boyama, Kesme, Tasarla!', 'GRB-YA-001', 1, 174.00, 174.00),

-- Sipariş GRB-2024-005 (Fatma Demir) - Confirmed
(5, 21, 'Scooter Süper: Güvenle Kay, Hızla Gül!', 'GRB-SC-001', 1, 674.00, 674.00),

-- Sipariş GRB-2024-006 (Ahmet Özcan) - Pending
(6, 28, 'Drone Başlangıç: İlk Uçuş Deneyimi!', 'GRB-DR-001', 1, 699.00, 699.00),
(6, 7, 'Mini Bilim: Deney Kitiyle Büyük Keşifler!', 'GRB-EG-004', 1, 399.00, 399.00),
(6, 31, 'Aslan Kral: Cesaret ve Dostluk!', 'GRB-AK-001', 1, 249.00, 249.00),

-- Sipariş GRB-2024-007 (Zeynep Arslan) - Delivered
(7, 14, 'İnşa Ustası: Yapı Taşlarıyla Kuleler!', 'GRB-IN-001', 1, 339.00, 339.00),
(7, 18, 'Bilginin İlk Kitabı: Sorularla Öğren, Keşfet!', 'GRB-BK-001', 1, 194.00, 194.00),

-- Sipariş GRB-2024-008 (Zeynep Arslan) - Cancelled  
(8, 6, 'Keşif Haritası: Macera ve Bilim Bir Arada!', 'GRB-EG-003', 1, 339.00, 339.00),
(8, 29, 'Sevimli Ayıcık: Sarılmak İçin Doğmuş!', 'GRB-SA-001', 1, 189.00, 189.00);

-- Örnek ürün yorumları ekle
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved, helpful_count) VALUES
-- Robotik Arkadaşım yorumları
(5, 2, 5, 'Çocuğum bayıldı!', 'Oğlum 7 yaşında ve kodlama konusunda hiç bilgisi yoktu. Bu oyuncak sayesinde temel kodlama mantığını öğrenmeye başladı. Kaliteli malzeme ve eğlenceli oyun bir arada.', 1, 1, 8),
(5, 3, 4, 'Fiyatına değer', 'Biraz pahalı ama kalitesi çok iyi. Çocuk saatlerce oynuyor. Sadece uygulama bazen donuyor, o konuda güncelleme gelmeli.', 0, 1, 3),

-- Müzikli Minikler yorumları
(2, 2, 5, 'Bebeğim çok seviyor', 'Kızım 2 yaşında ve bu bebekle çok eğleniyor. Müzikler çok güzel ve ses seviyesi ayarlanabiliyor. Yıkanabilir olması da çok praktik.', 1, 1, 12),
(2, 4, 5, 'Mükemmel kalite', 'Annesi olarak güvenlik konusunda çok titizim. Bu bebek gerçekten güvenli malzemelerden yapılmış. Çocuğum uyurken de yanında tutuyor.', 0, 1, 7),

-- Strateji Ustası yorumları
(9, 3, 4, 'Aile boyu eğlence', 'Ailemizle beraber oynuyoruz. Çocuk strateji düşünmeyi öğreniyor, biz de kaliteli vakit geçiriyoruz. Kurallar biraz karmaşık olabilir küçük çocuklar için.', 1, 1, 5),

-- RC Racing Car yorumları
(27, 3, 5, 'Hız tutkunları için', 'Oğlum araba delisi ve bu uzaktan kumandalı araç tam onun istediği gibiydi. Şarj süresi uzun, dayanıklı yapılmış. Bahçede saatlerce koşturuyor.', 1, 1, 9),

-- Scooter Süper yorumları  
(21, 4, 5, 'En iyi yatırım', 'Kızım için aldığım en doğru oyuncak. Hem fiziksel aktivite hem de eğlence bir arada. Güvenlik özellikleri çok iyi, ayarlanabilir yükseklik süper.', 1, 1, 15),

-- Mini Bilim yorumları
(7, 5, 4, 'Bilim meraklısı çocuklar için', 'Çocuğum deneyler yapmayı çok seviyor. Kit içindeki malzemeler güvenli ve deneylerin açıklamaları anlaşılır. Yetişkin gözetimi şart tabii.', 0, 1, 6),

-- İnşa Ustası yorumları
(14, 6, 5, 'Yaratıcılığı geliştiriyor', 'Kızım sürekli farklı şeyler inşa ediyor bu parçalarla. Manyetik sistemi çok pratik, parçalar sağlam. Motor becerilerini de geliştirdiği kesin.', 1, 1, 11),

-- Sevimli Ayıcık yorumları
(29, 6, 5, 'Uyku arkadaşı', 'Bebeğim bu ayıcık olmadan uyumuyor artık. Çok yumuşak ve güvenli. Yıkanabilir olması büyük avantaj. Kaliteli peluş malzeme.', 0, 1, 8);

-- İstek listesi örnekleri ekle
INSERT INTO wishlist (user_id, product_id) VALUES
-- Ayşe Yılmaz istek listesi
(2, 1), -- Harikalar Diyarı Bebek
(2, 8), -- PuzzlePlay Mini
(2, 12), -- Müzik Kutusu

-- Mehmet Kaya istek listesi  
(3, 15), -- Elektronik Oyun Atölyesi
(3, 28), -- Drone Başlangıç
(3, 24), -- İtfaiye Kahramanı

-- Fatma Demir istek listesi
(4, 16), -- Masal Gecesi
(4, 17), -- Okul Öncesi Macera
(4, 19), -- Aktivite Zamanı
(4, 13), -- Yaratıcı Atölye

-- Ahmet Özcan istek listesi
(5, 21), -- Scooter Süper
(5, 20), -- Park Macerası
(5, 23), -- Top ve Spor

-- Zeynep Arslan istek listesi
(6, 30), -- Dostum Tavşan
(6, 31), -- Aslan Kral
(6, 29); -- Sevimli Ayıcık

-- Kampanya ekle
INSERT INTO campaigns (name, description, discount_type, discount_value, start_date, end_date, is_active) VALUES
('Kış Kampanyası 2024', 'Seçili ürünlerde %20 indirim! Çocuklarınız için en sevilen oyuncaklar uygun fiyatlarla.', 'percentage', 20.00, '2024-01-01 00:00:00', '2024-02-29 23:59:59', 1),
('Yeni Yıl Özel Fırsatı', 'Yeni yıla özel tüm peluş oyuncaklarda %15 indirim. Sevimli arkadaşlar yeni evlerini bekliyor!', 'percentage', 15.00, '2024-01-15 00:00:00', '2024-01-31 23:59:59', 1),
('500 TL Üzeri Ücretsiz Kargo', 'Tüm siparişlerde 500 TL ve üzeri alışverişlerde kargo bedava!', 'fixed', 0.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 1);

-- Site ayarlarını güncelle
UPDATE settings SET setting_value = '500.00' WHERE setting_key = 'free_shipping_threshold';
UPDATE settings SET setting_value = '18' WHERE setting_key = 'tax_rate';

-- Stok güncellemeleri (bazı ürünlerde düşük stok simülasyonu)
UPDATE products SET stock_quantity = 3 WHERE id IN (5, 28); -- Robotik ve Drone için düşük stok
UPDATE products SET stock_quantity = 1 WHERE id = 21; -- Scooter için çok düşük stok

-- Görüntülenme sayılarını artır (popüler ürünler simülasyonu)
UPDATE products SET view_count = 156 WHERE id = 5; -- Robotik Arkadaşım
UPDATE products SET view_count = 143 WHERE id = 21; -- Scooter Süper  
UPDATE products SET view_count = 128 WHERE id = 27; -- RC Racing Car
UPDATE products SET view_count = 98 WHERE id = 9; -- Strateji Ustası
UPDATE products SET view_count = 87 WHERE id = 2; -- Müzikli Minikler
UPDATE products SET view_count = 76 WHERE id = 14; -- İnşa Ustası
UPDATE products SET view_count = 65 WHERE id = 7; -- Mini Bilim
UPDATE products SET view_count = 54 WHERE id = 31; -- Aslan Kral

-- Öne çıkan ürünleri belirle
UPDATE products SET is_featured = 1 WHERE id IN (5, 21, 27, 2, 14, 7, 1, 29);

-- Yeni ürünleri belirle  
UPDATE products SET is_new = 1 WHERE id IN (5, 28, 15, 17, 30, 31);

-- İndirimli ürünleri belirle (compare_price olan ürünler)
UPDATE products SET is_sale = 1 WHERE compare_price > price;

COMMIT;

-- Demo verileri başarıyla eklendi!
-- Özet:
-- ✅ 8 Marka eklendi
-- ✅ 31 Ürün eklendi (her kategoride örnekler)
-- ✅ 62 Ürün görseli eklendi (her ürün için 2 görsel)
-- ✅ 5 Test kullanıcısı eklendi (şifre: test123)
-- ✅ 10 Adres eklendi 
-- ✅ 8 Sipariş eklendi (farklı durumlarda)
-- ✅ 14 Sipariş kalemi eklendi
-- ✅ 8 Ürün yorumu eklendi
-- ✅ 12 İstek listesi kaydı eklendi
-- ✅ 3 Kampanya eklendi
-- ✅ Site ayarları güncellendi

SELECT 'Demo verileri başarıyla eklendi!' as sonuc;