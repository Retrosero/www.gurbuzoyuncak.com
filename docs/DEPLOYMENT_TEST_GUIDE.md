# Gürbüz Oyuncak - Deployment ve Test Kılavuzu

## Önemli Not
Bu PHP+MySQL tabanlı uygulama için deployment ve test işlemleri aşağıdaki adımları takip etmelidir.

## Ön Gereksinimler

### Sunucu Gereksinimleri
- PHP 7.4 veya üzeri
- MySQL 5.7 veya üzeri / MariaDB 10.3 veya üzeri
- Apache veya Nginx web sunucusu
- PHP uzantıları: PDO, PDO_MySQL, JSON, GD (görsel işleme için)

### Yerel Geliştirme Ortamı Seçenekleri
1. **XAMPP** (Windows, macOS, Linux) - Önerilen
2. **MAMP** (macOS, Windows)
3. **Laragon** (Windows)
4. **Docker** (Tüm platformlar)

## Deployment Adımları

### Adım 1: Dosyaları Sunucuya Yerleştirme

```bash
# Projeyi sunucunun web dizinine kopyalayın
# Apache için genellikle: /var/www/html/
# XAMPP için: C:\xampp\htdocs\ veya /opt/lampp/htdocs/

cp -r /workspace/gurbuz-oyuncak /var/www/html/
```

### Adım 2: Klasör İzinlerini Ayarlama

```bash
# Linux/macOS için
cd /var/www/html/gurbuz-oyuncak

# Banner görsel klasörüne yazma izni
chmod 755 public/images/banners/
chmod 755 public/images/

# Gerekirse Apache kullanıcısına sahiplik verin
chown -R www-data:www-data public/images/
```

### Adım 3: Veritabanı Kurulumu

```bash
# MySQL'e bağlan
mysql -u root -p

# Veritabanını oluştur (eğer yoksa)
CREATE DATABASE gurbuz_oyuncak CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

# Çıkış yap
exit

# Ana şemayı uygula
mysql -u root -p gurbuz_oyuncak < database/schema.sql

# Ek şemaları uygula
mysql -u root -p gurbuz_oyuncak < database/extensions_schema.sql
mysql -u root -p gurbuz_oyuncak < database/banners_homepage_sections.sql

# Demo veri ekle (opsiyonel)
mysql -u root -p gurbuz_oyuncak < database/demo_data.sql
```

### Adım 4: Veritabanı Bağlantı Ayarları

`backend/config/database.php` dosyasını düzenleyin:

```php
<?php
class Database {
    private $host = "localhost";       // Veritabanı sunucusu
    private $db_name = "gurbuz_oyuncak"; // Veritabanı adı
    private $username = "root";        // Veritabanı kullanıcısı
    private $password = "";            // Veritabanı şifresi
    private $charset = "utf8mb4";
    
    // ... geri kalan kod
}
```

### Adım 5: Web Sunucu Yapılandırması

#### Apache (.htaccess)

`.htaccess` dosyası zaten mevcut olmalı. Eğer yoksa oluşturun:

```apache
# Ana dizin .htaccess
RewriteEngine On
RewriteBase /gurbuz-oyuncak/

# Admin panele erişim
RewriteRule ^admin/(.*)$ admin/$1 [L]

# API endpoint'leri
RewriteRule ^api/(.*)$ backend/api/$1 [L,QSA]

# Frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ public/$1 [L]
```

#### Nginx

Nginx kullanıyorsanız, site yapılandırmanıza ekleyin:

```nginx
server {
    listen 80;
    server_name gurbuz-oyuncak.local;
    root /var/www/html/gurbuz-oyuncak/public;
    index index.html index.php;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        rewrite ^/api/(.*)$ /backend/api/$1 last;
    }

    location /admin {
        index index.php;
        try_files $uri $uri/ /admin/index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

### Adım 6: Test Sunucusunu Başlatma (Yerel Geliştirme)

#### PHP Built-in Server (Basit Test İçin)

```bash
cd /var/www/html/gurbuz-oyuncak/public
php -S localhost:8000
```

Ardından tarayıcıda açın: `http://localhost:8000`

#### XAMPP/MAMP Kullanarak

1. XAMPP/MAMP'i başlatın
2. Apache ve MySQL servislerini başlatın
3. Tarayıcıda `http://localhost/gurbuz-oyuncak/public/` adresini açın

## Kapsamlı Test Senaryoları

### Test 1: Veritabanı Bağlantısı

```bash
# MySQL'e bağlan ve tabloları kontrol et
mysql -u root -p gurbuz_oyuncak

# Tabloları listele
SHOW TABLES;

# Banner tablosunu kontrol et
SELECT * FROM banners;

# Ana sayfa bölümlerini kontrol et
SELECT * FROM homepage_sections;

# Çıkış
exit
```

**Beklenen Sonuç:** 
- 16+ tablo listelenmeli (products, categories, banners, homepage_sections, vb.)
- banners tablosunda 3 demo banner
- homepage_sections tablosunda 4 demo bölüm

### Test 2: Frontend Ana Sayfa

**Test URL:** `http://localhost:8000/index.html`

**Kontrol Listesi:**
- [ ] Sayfa yükleniyor
- [ ] Header ve navigasyon görünüyor
- [ ] Banner slider çalışıyor (3 banner otomatik geçiş yapıyor)
- [ ] Ok butonları ile manuel geçiş çalışıyor
- [ ] Dot navigasyon çalışıyor
- [ ] Yaş grupları bölümü görünüyor
- [ ] Dinamik ürün bölümleri yükleniyor
- [ ] Footer görünüyor

**Console Kontrolleri:**
1. Tarayıcıda F12 tuşuna basın
2. Console sekmesini açın
3. Hata olmamalı
4. Network sekmesinde API istekleri başarılı olmalı (200 OK)

### Test 3: Banner API Endpoints

```bash
# Tüm banner'ları getir
curl http://localhost:8000/../backend/api/banners.php

# Veya tarayıcıda
http://localhost:8000/../backend/api/banners.php

# Aktif banner'ları getir
curl http://localhost:8000/../backend/api/banners.php?active_only=1

# Tek banner getir (ID=1)
curl http://localhost:8000/../backend/api/banners.php/1
```

**Beklenen Yanıt:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "Yeni Sezon Oyuncakları",
            "subtitle": "En yeni ve eğlenceli oyuncaklar burada!",
            "image_url": "/public/images/banners/banner1.jpg",
            "link_url": "/products.html",
            "link_text": "Şimdi Keşfet",
            "background_color": "#1E88E5",
            "text_color": "#FFFFFF",
            "display_order": 1,
            "is_active": 1,
            ...
        }
    ],
    "count": 3
}
```

### Test 4: Ana Sayfa Bölümleri API

```bash
# Tüm bölümleri getir
curl http://localhost:8000/../backend/api/homepage_sections.php

# Bölümleri ürünleriyle getir
curl http://localhost:8000/../backend/api/homepage_sections.php?with_products=1

# Bölüm ürünlerini getir (ID=1)
curl http://localhost:8000/../backend/api/homepage_sections.php/1/products
```

### Test 5: Admin Panel - Banner Yönetimi

**Test URL:** `http://localhost:8000/../admin/banners.php`

**Test Adımları:**

1. **Sayfa Yükleme**
   - [ ] Admin sidebar menüsü görünüyor
   - [ ] "Banner Yönetimi" başlığı görünüyor
   - [ ] "Yeni Banner Ekle" butonu görünüyor
   - [ ] Banner listesi tablosu görünüyor

2. **Banner Listeleme**
   - [ ] Demo banner'lar listeleniyor (3 adet)
   - [ ] Her banner'ın görseli, başlığı, durumu görünüyor
   - [ ] "Düzenle" ve "Sil" butonları görünüyor

3. **Yeni Banner Ekleme**
   - [ ] "Yeni Banner Ekle" butonuna tıklayın
   - [ ] Modal açılıyor
   - [ ] Formu doldurun:
     - Başlık: "Test Banner"
     - Alt Başlık: "Test için oluşturuldu"
     - Görsel seçin (max 5MB JPG/PNG/GIF/WEBP)
     - Link URL: "/products.html"
     - Link Butonu Metni: "Test Et"
     - Arka plan rengi: #2E7D32
     - Metin rengi: #FFFFFF
     - Gösterim sırası: 4
     - Aktif: İşaretli
   - [ ] "Kaydet" butonuna tıklayın
   - [ ] Başarı mesajı görüntüleniyor
   - [ ] Yeni banner listede görünüyor

4. **Banner Düzenleme**
   - [ ] Bir banner'ın "Düzenle" butonuna tıklayın
   - [ ] Modal açılıyor ve veriler dolu geliyor
   - [ ] Başlığı değiştirin: "Test Banner - Güncellendi"
   - [ ] "Kaydet" butonuna tıklayın
   - [ ] Değişiklik listede görünüyor

5. **Banner Silme**
   - [ ] Oluşturduğunuz test banner'ın "Sil" butonuna tıklayın
   - [ ] Onay popup'ı görünüyor
   - [ ] "OK" diyerek onaylayın
   - [ ] Banner listeden kaldırıldı

6. **Görsel Yükleme Testi**
   - [ ] Yeni banner ekleme formunda görsel seçin
   - [ ] Önizleme gösteriliyor
   - [ ] Kaydettikten sonra görsel doğru URL ile yükleniyor
   - [ ] Ana sayfada banner görseli görünüyor

### Test 6: Admin Panel - Ana Sayfa Bölümleri

**Test URL:** `http://localhost:8000/../admin/homepage_sections.php`

**Test Adımları:**

1. **Sayfa Yükleme**
   - [ ] Sayfa yükleniyor
   - [ ] "Ana Sayfa Bölümleri" başlığı görünüyor
   - [ ] "Yeni Bölüm Ekle" butonu görünüyor
   - [ ] Bölüm listesi tablosu görünüyor

2. **Bölüm Listeleme**
   - [ ] 4 demo bölüm listeleniyor
   - [ ] Her bölümün türü, başlığı, ürün sayısı görünüyor
   - [ ] "Ürünler", "Düzenle", "Sil" butonları görünüyor

3. **Yeni Bölüm Ekleme**
   - [ ] "Yeni Bölüm Ekle" butonuna tıklayın
   - [ ] Modal açılıyor
   - [ ] Formu doldurun:
     - Bölüm Türü: "Popüler Ürünler"
     - Başlık: "Test Bölümü"
     - Alt Başlık: "Test için oluşturuldu"
     - Gösterim Sırası: 5
     - Maksimum Ürün Sayısı: 6
     - Aktif: İşaretli
   - [ ] "Kaydet" butonuna tıklayın
   - [ ] Başarı mesajı görüntüleniyor
   - [ ] Yeni bölüm listede görünüyor

4. **Bölüme Ürün Ekleme**
   - [ ] Bir bölümün "Ürünler" butonuna tıklayın
   - [ ] Ürün yönetimi modal'ı açılıyor
   - [ ] Ürün seçim listesi dolu
   - [ ] Bir ürün seçin ve ekleyin
   - [ ] Ürün grid'inde görünüyor
   - [ ] Ürün bilgileri doğru (isim, fiyat, görsel)

5. **Bölümden Ürün Çıkarma**
   - [ ] Ürün grid'inde bir ürünün "×" butonuna tıklayın
   - [ ] Onay popup'ı görünüyor
   - [ ] "OK" diyerek onaylayın
   - [ ] Ürün grid'den kaldırıldı
   - [ ] Liste güncellendiğinde ürün sayısı azaldı

6. **Bölüm Düzenleme**
   - [ ] Bir bölümün "Düzenle" butonuna tıklayın
   - [ ] Modal açılıyor ve veriler dolu geliyor
   - [ ] Başlığı değiştirin
   - [ ] Max ürün sayısını değiştirin
   - [ ] "Kaydet" butonuna tıklayın
   - [ ] Değişiklik listede görünüyor

7. **Bölüm Silme**
   - [ ] Test bölümünün "Sil" butonuna tıklayın
   - [ ] Onay popup'ı görünüyor
   - [ ] "OK" diyerek onaylayın
   - [ ] Bölüm listeden kaldırıldı

### Test 7: Frontend Entegrasyon

**Ana Sayfayı Yeniden Test Edin:**

1. **Banner'lar**
   - [ ] Ana sayfayı yenileyin
   - [ ] Eklediğiniz banner'lar slider'da görünüyor
   - [ ] Otomatik geçiş çalışıyor (5 saniye)
   - [ ] Manuel navigasyon çalışıyor
   - [ ] Link butonları doğru yönlendiriyor

2. **Dinamik Bölümler**
   - [ ] Aktif bölümler ana sayfada sırayla görünüyor
   - [ ] Her bölümde ürünler listeleniyor
   - [ ] Manuel eklenen ürünler gösteriliyor
   - [ ] Manuel ürün yoksa otomatik seçim çalışıyor
   - [ ] "Tümünü Gör" butonları çalışıyor

### Test 8: Responsive Tasarım

**Mobil Test (< 768px):**
- [ ] Chrome DevTools açın (F12)
- [ ] Responsive mod aktif edin (Ctrl+Shift+M)
- [ ] iPhone 12 Pro simülasyonu seçin
- [ ] Ana sayfayı test edin:
  - [ ] Banner tek sütun düzeninde
  - [ ] Görsel üstte, içerik altta
  - [ ] Navigation butonları küçük
  - [ ] Ürün grid'i tek sütun
  - [ ] Tüm içerik okunabilir

**Tablet Test (768px - 1024px):**
- [ ] iPad simülasyonu seçin
- [ ] Ana sayfayı test edin:
  - [ ] Banner 2 sütun düzeninde
  - [ ] Ürün grid'i 2-3 sütun
  - [ ] Navigation uygun boyutta

### Test 9: Güvenlik Testleri

**SQL Injection Testi:**
```bash
# API'ye kötü amaçlı sorgu gönder
curl -X POST http://localhost:8000/../backend/api/banners.php \
  -H "Content-Type: application/json" \
  -d '{"title":"Test'; DROP TABLE banners;--"}'
```
- [ ] Hata alınıyor veya temizleniyor (prepared statements sayesinde)

**XSS Testi:**
- [ ] Banner başlığına `<script>alert('XSS')</script>` girmeyi deneyin
- [ ] Kaydedildiğinde escape edilmiş olmalı
- [ ] Ana sayfada script çalışmamalı

**Dosya Yükleme Testi:**
- [ ] PHP dosyası (.php) yüklemeyi deneyin
- [ ] Reddedilmeli (sadece JPG, PNG, GIF, WEBP)
- [ ] 6MB dosya yüklemeyi deneyin
- [ ] Reddedilmeli (max 5MB)

### Test 10: Performans Testleri

**Sayfa Yükleme Hızı:**
- [ ] Chrome DevTools > Network sekmesi
- [ ] Ana sayfayı yenileyin
- [ ] DOMContentLoaded: < 2 saniye
- [ ] Load: < 3 saniye
- [ ] API istekleri: < 500ms

**API Yanıt Süreleri:**
- [ ] Banner API: < 200ms
- [ ] Bölümler API: < 300ms
- [ ] Ürünler API: < 400ms

## Test Sonuç Raporu Şablonu

```
=================================================
GÜRBÜZ OYUNCAK - TEST SONUÇ RAPORU
=================================================

Test Tarihi: _________________
Test Eden: _________________
Tarayıcı: _________________
Ortam: Local / Staging / Production

-------------------------------------------------
VERİTABANI TESTLERİ
-------------------------------------------------
[ ] Tablolar oluşturuldu (16+ tablo)
[ ] Demo veri yüklendi
[ ] Banner'lar mevcut (3 adet)
[ ] Ana sayfa bölümleri mevcut (4 adet)

-------------------------------------------------
API TESTLERİ
-------------------------------------------------
[ ] Banner API - Listeleme (GET)
[ ] Banner API - Tek kayıt (GET)
[ ] Banner API - Ekleme (POST)
[ ] Banner API - Güncelleme (PUT)
[ ] Banner API - Silme (DELETE)
[ ] Ana Sayfa Bölümleri API - Listeleme (GET)
[ ] Ana Sayfa Bölümleri API - Ürünlerle (GET)
[ ] Ana Sayfa Bölümleri API - Ürün Ekleme (POST)
[ ] Ana Sayfa Bölümleri API - Ürün Çıkarma (DELETE)

-------------------------------------------------
ADMIN PANEL TESTLERİ
-------------------------------------------------
Banner Yönetimi:
[ ] Sayfa yükleniyor
[ ] Banner listeleme
[ ] Yeni banner ekleme
[ ] Banner düzenleme
[ ] Banner silme
[ ] Görsel yükleme

Ana Sayfa Bölümleri:
[ ] Sayfa yükleniyor
[ ] Bölüm listeleme
[ ] Yeni bölüm ekleme
[ ] Bölüm düzenleme
[ ] Bölüm silme
[ ] Ürün ekleme/çıkarma

-------------------------------------------------
FRONTEND TESTLERİ
-------------------------------------------------
Ana Sayfa:
[ ] Sayfa yükleniyor
[ ] Banner slider çalışıyor
[ ] Otomatik geçiş (5 saniye)
[ ] Manuel navigasyon (ok butonları)
[ ] Dot navigasyon
[ ] Dinamik bölümler yükleniyor
[ ] Ürünler gösteriliyor
[ ] "Tümünü Gör" butonları

-------------------------------------------------
RESPONSIVE TASARIM
-------------------------------------------------
[ ] Mobil görünüm (< 768px)
[ ] Tablet görünüm (768px - 1024px)
[ ] Desktop görünüm (> 1024px)

-------------------------------------------------
GÜVENLİK TESTLERİ
-------------------------------------------------
[ ] SQL Injection koruması
[ ] XSS koruması
[ ] Dosya yükleme güvenliği
[ ] Dosya boyutu kontrolü

-------------------------------------------------
PERFORMANS TESTLERİ
-------------------------------------------------
[ ] Sayfa yükleme < 3 saniye
[ ] API yanıt < 500ms
[ ] Console'da hata yok

-------------------------------------------------
GENEL DEĞERLENDİRME
-------------------------------------------------
Başarılı Test Sayısı: ___ / ___
Başarısız Test Sayısı: ___
Kritik Hatalar: ___

NOTLAR:
_________________________________________________
_________________________________________________
_________________________________________________

SONUÇ: [ ] BAŞARILI  [ ] BAŞARISIZ  [ ] KISMİ BAŞARILI

İmza: _________________
Tarih: _________________
```

## Deployment Checklist

Canlı ortama geçmeden önce:

- [ ] Tüm testler başarılı
- [ ] Veritabanı backup alındı
- [ ] Production veritabanı bilgileri güncellendi
- [ ] Dosya izinleri ayarlandı (755 / 644)
- [ ] Error logging aktif
- [ ] SSL sertifikası kuruldu (HTTPS)
- [ ] .htaccess / nginx config doğru
- [ ] Demo veri temizlendi (production için)
- [ ] Admin paneline güvenli giriş eklendi
- [ ] Performans optimizasyonu yapıldı

## Sorun Giderme

### Banner'lar görünmüyor
1. Veritabanında aktif banner var mı?
   ```sql
   SELECT * FROM banners WHERE is_active = 1;
   ```
2. Banner tarih aralığı geçerli mi?
3. Browser console'da JavaScript hatası var mı?
4. API endpoint'i doğru mu? (Network sekmesi)

### Görsel yüklenmiyor
1. Klasör izinleri doğru mu?
   ```bash
   chmod 755 public/images/banners/
   ```
2. Dosya boyutu 5MB'dan küçük mü?
3. Dosya formatı JPG/PNG/GIF/WEBP mi?

### API 404 hatası
1. .htaccess çalışıyor mu?
2. mod_rewrite aktif mi?
3. Dosya yolları doğru mu?

### Bölümde ürün görünmüyor
1. Aktif ürün var mı?
   ```sql
   SELECT * FROM products WHERE is_active = 1;
   ```
2. Bölüm aktif mi?
3. Manuel ürün eklenmiş mi? (Yoksa otomatik seçim devrede)

## Canlı Ortam İzleme

Canlıya aldıktan sonra:

1. **Error Log Kontrol**
   ```bash
   tail -f /var/log/apache2/error.log
   # veya
   tail -f /var/log/nginx/error.log
   ```

2. **Veritabanı Performans**
   ```sql
   SHOW PROCESSLIST;
   SHOW STATUS LIKE 'Slow_queries';
   ```

3. **Disk Kullanımı** (Banner görselleri için)
   ```bash
   du -sh public/images/banners/
   ```

4. **Kullanıcı Geri Bildirimleri**
   - Banner tıklama oranları
   - Bölüm görüntüleme istatistikleri
   - Sayfa yükleme süreleri

## Destek ve İletişim

Sorun yaşarsanız:
1. Test raporunu hazırlayın
2. Error log'ları kaydedin
3. Ekran görüntüleri alın
4. Geliştirici ile paylaşın

---

**Hazırlayan:** MiniMax Agent  
**Tarih:** 2025-10-30  
**Versiyon:** 1.0.0  
**Proje:** Gürbüz Oyuncak E-Ticaret Sistemi
