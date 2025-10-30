# Banner & Ana Sayfa Sistemleri Test Listesi

## Veritabanı Kurulumu

### 1. Migration Uygula
```bash
cd /workspace/gurbuz-oyuncak
mysql -u root -p gurbuz_oyuncak < database/banners_homepage_sections.sql
```

Bu komut:
- 3 yeni tablo oluşturur (banners, homepage_sections, homepage_section_products)
- 3 demo banner ekler
- 4 demo ana sayfa bölümü ekler

## Admin Panel Test Senaryoları

### Banner Yönetimi Test

1. **Banner Listesi**
   - Admin panelde "İçerik Yönetimi" > "Banner Yönetimi" sayfasına git
   - Demo banner'ların listelendiğini kontrol et
   - Tablo kolonları: Görsel, Başlık, Link, Sıra, Durum, Tarih Aralığı, İşlemler

2. **Yeni Banner Ekleme**
   - "Yeni Banner Ekle" butonuna tıkla
   - Formu doldur:
     - Başlık: "Test Banner"
     - Alt Başlık: "Test açıklaması"
     - Banner Görseli: Bir resim dosyası seç (JPG, PNG, GIF, WEBP - max 5MB)
     - Link URL: "/products.html"
     - Link Butonu Metni: "Test Buton"
     - Arka Plan Rengi: Renk seç
     - Metin Rengi: Renk seç
     - Gösterim Sırası: 1
     - Aktif: İşaretle
   - "Kaydet" butonuna tıkla
   - Başarı mesajı görüntülendiğini kontrol et
   - Listede yeni banner'ın göründüğünü kontrol et

3. **Banner Düzenleme**
   - Bir banner'ın yanındaki "Düzenle" butonuna tıkla
   - Modal'da banner bilgilerinin dolu geldiğini kontrol et
   - Başlığı değiştir
   - "Kaydet" butonuna tıkla
   - Değişikliğin listeye yansıdığını kontrol et

4. **Banner Silme**
   - Bir banner'ın yanındaki "Sil" butonuna tıkla
   - Onay mesajını kabul et
   - Banner'ın listeden kaldırıldığını kontrol et

### Ana Sayfa Bölümleri Test

1. **Bölüm Listesi**
   - "İçerik Yönetimi" > "Ana Sayfa Bölümleri" sayfasına git
   - Demo bölümlerin listelendiğini kontrol et
   - Tablo kolonları: Bölüm Türü, Başlık, Sıra, Max Ürün, Ürün Sayısı, Durum, İşlemler

2. **Yeni Bölüm Ekleme**
   - "Yeni Bölüm Ekle" butonuna tıkla
   - Formu doldur:
     - Bölüm Türü: "Popüler Ürünler" seç
     - Başlık: "Test Bölümü"
     - Alt Başlık: "Test açıklaması"
     - Gösterim Sırası: 1
     - Maksimum Ürün Sayısı: 8
     - Aktif: İşaretle
   - "Kaydet" butonuna tıkla
   - Başarı mesajı görüntülendiğini kontrol et

3. **Bölüme Ürün Ekleme**
   - Bir bölümün "Ürünler" butonuna tıkla
   - Ürün seçim listesinden bir ürün seç
   - Ürünün bölüme eklendiğini kontrol et
   - Ürün grid'inde göründüğünü kontrol et

4. **Bölümden Ürün Çıkarma**
   - Ürün grid'indeki bir ürünün üzerindeki "×" butonuna tıkla
   - Onay mesajını kabul et
   - Ürünün grid'den kaldırıldığını kontrol et

5. **Bölüm Düzenleme**
   - "Düzenle" butonuna tıkla
   - Başlığı değiştir
   - "Kaydet" butonuna tıkla
   - Değişikliğin yansıdığını kontrol et

6. **Bölüm Silme**
   - "Sil" butonuna tıkla
   - Onay mesajını kabul et
   - Bölümün listeden kaldırıldığını kontrol et

## Frontend Test Senaryoları

### Ana Sayfa Banner Slider

1. **Banner Gösterimi**
   - Ana sayfayı aç: `http://localhost/gurbuz-oyuncak/public/index.html`
   - Banner slider'ın yüklendiğini kontrol et
   - İlk banner'ın göründüğünü kontrol et

2. **Banner Navigasyonu**
   - Sol ve sağ ok butonlarına tıklayarak banner'lar arası geçişi test et
   - Alt kısımdaki dot navigasyonuna tıklayarak banner'lar arası geçişi test et
   - Otomatik geçişin 5 saniyede bir çalıştığını kontrol et

3. **Banner İçeriği**
   - Banner başlığının göründüğünü kontrol et
   - Alt başlığın göründüğünü kontrol et
   - Link butonunun çalıştığını kontrol et
   - Görselin düzgün yüklendiğini kontrol et

### Ana Sayfa Dinamik Bölümler

1. **Bölüm Gösterimi**
   - Ana sayfayı scroll et
   - Aktif bölümlerin göründüğünü kontrol et
   - Her bölümün başlık ve alt başlığının göründüğünü kontrol et

2. **Ürün Gösterimi**
   - Her bölümde ürünlerin göründüğünü kontrol et
   - Ürün kartlarının bilgilerinin doğru göründüğünü kontrol et
   - "Tümünü Gör" butonunun çalıştığını kontrol et

3. **Otomatik Ürün Seçimi**
   - Manuel ürün eklenmemiş bir bölüm oluştur
   - Ana sayfada bölümün otomatik olarak uygun ürünleri gösterdiğini kontrol et

## API Test Senaryoları

### Banner API Test

1. **Tüm Banner'ları Getir**
```bash
curl http://localhost/gurbuz-oyuncak/backend/api/banners.php
```
Beklenen: JSON formatında tüm banner'lar

2. **Aktif Banner'ları Getir**
```bash
curl http://localhost/gurbuz-oyuncak/backend/api/banners.php?active_only=1
```
Beklenen: Sadece aktif ve tarih aralığına uygun banner'lar

3. **Tek Banner Getir**
```bash
curl http://localhost/gurbuz-oyuncak/backend/api/banners.php/1
```
Beklenen: ID=1 olan banner'ın detayları

### Ana Sayfa Bölümleri API Test

1. **Tüm Bölümleri Getir**
```bash
curl http://localhost/gurbuz-oyuncak/backend/api/homepage_sections.php
```
Beklenen: JSON formatında tüm bölümler

2. **Bölümleri Ürünleriyle Getir**
```bash
curl http://localhost/gurbuz-oyuncak/backend/api/homepage_sections.php?with_products=1
```
Beklenen: Her bölümün products array'i içermesi

3. **Bölüm Ürünlerini Getir**
```bash
curl http://localhost/gurbuz-oyuncak/backend/api/homepage_sections.php/1/products
```
Beklenen: ID=1 olan bölümün ürünleri

## Responsive Test

1. **Mobil Görünüm (< 768px)**
   - Banner slider'ın tek sütun düzenine geçtiğini kontrol et
   - Görselin üstte olduğunu kontrol et
   - Navigation butonlarının küçüldüğünü kontrol et
   - Ürün grid'inin tek sütun olduğunu kontrol et

2. **Tablet Görünüm (768px - 1024px)**
   - Banner'ın 2 sütun düzeninde olduğunu kontrol et
   - Ürün grid'inin 2-3 sütun olduğunu kontrol et

3. **Desktop Görünüm (> 1024px)**
   - Banner'ın 2 sütun düzeninde olduğunu kontrol et
   - Ürün grid'inin 4 sütun olduğunu kontrol et

## Güvenlik Test

1. **Dosya Yükleme Güvenliği**
   - Sadece izin verilen dosya türlerini (JPG, PNG, GIF, WEBP) yüklemeyi dene
   - 5MB'dan büyük dosya yüklemeyi dene
   - PHP dosyası yüklemeyi dene (reddedilmeli)

2. **SQL Injection Test**
   - API endpoint'lerine SQL injection denemesi yap
   - Prepared statements kullanıldığı için başarısız olmalı

3. **XSS Test**
   - Banner başlığına script tag'i eklemeyi dene
   - htmlspecialchars() ile temizlendiği için escape edilmeli

## Performans Test

1. **Sayfa Yükleme Hızı**
   - Ana sayfanın 2 saniyeden kısa sürede yüklenmesini kontrol et
   - Browser Developer Tools > Network sekmesini kullan

2. **API Yanıt Süresi**
   - API endpoint'lerinin 500ms altında yanıt vermesini kontrol et
   - Browser Developer Tools > Network sekmesini kullan

## Başarı Kriterleri

- [ ] Tüm banner'lar doğru gösteriliyor
- [ ] Banner slider otomatik ve manuel çalışıyor
- [ ] Ana sayfa bölümleri doğru gösteriliyor
- [ ] Manuel ürün ekleme/çıkarma çalışıyor
- [ ] Otomatik ürün seçimi çalışıyor
- [ ] Admin panel CRUD işlemleri çalışıyor
- [ ] API endpoint'leri doğru yanıt veriyor
- [ ] Responsive tasarım çalışıyor
- [ ] Güvenlik kontrolleri aktif
- [ ] Performans kabul edilebilir seviyede

## Bilinen Sorunlar ve Çözümler

### Banner görseli yüklenmiyor
**Çözüm:** `/public/images/banners/` klasörüne yazma izni ver
```bash
chmod 755 /workspace/gurbuz-oyuncak/public/images/banners/
```

### API 404 hatası veriyor
**Çözüm:** Backend API dosyalarının doğru konumda olduğunu kontrol et

### JavaScript çalışmıyor
**Çözüm:** Browser console'da hataları kontrol et, dosya yollarını doğrula

## Test Tamamlama Raporu Şablonu

```
Test Tarihi: _______________
Test Eden: _______________

Banner Yönetimi:
- [ ] Listeleme: _____ (Başarılı/Başarısız)
- [ ] Ekleme: _____ (Başarılı/Başarısız)
- [ ] Düzenleme: _____ (Başarılı/Başarısız)
- [ ] Silme: _____ (Başarılı/Başarısız)

Ana Sayfa Bölümleri:
- [ ] Listeleme: _____ (Başarılı/Başarısız)
- [ ] Ekleme: _____ (Başarılı/Başarısız)
- [ ] Ürün Yönetimi: _____ (Başarılı/Başarısız)
- [ ] Düzenleme: _____ (Başarılı/Başarısız)
- [ ] Silme: _____ (Başarılı/Başarısız)

Frontend:
- [ ] Banner Slider: _____ (Başarılı/Başarısız)
- [ ] Dinamik Bölümler: _____ (Başarılı/Başarısız)
- [ ] Responsive: _____ (Başarılı/Başarısız)

Notlar:
_______________________________________
_______________________________________
_______________________________________
```
