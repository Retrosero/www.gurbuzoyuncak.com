# Gürbüz Oyuncak - XML Import Sistemi Kurulum ve Test Kılavuzu

## HIZLI BAŞLANGIÇ

### 1. Veritabanı Kurulumu

```bash
# MySQL'e bağlan
mysql -u root -p

# Veritabanını sil ve yeniden oluştur
DROP DATABASE IF EXISTS gurbuz_oyuncak;

# Yeni şemayı uygula
mysql -u root -p < database/xml_uyumlu_schema.sql
```

**Önemli:** Bu işlem mevcut tüm verileri silecektir!

### 2. Klasör İzinleri

```bash
chmod 755 public/images/products/
chmod 755 backend/classes/
chmod 644 backend/config/database.php
```

### 3. Veritabanı Bağlantı Ayarları

`backend/config/database.php` dosyasını kontrol edin:

```php
private $host = "localhost";
private $db_name = "gurbuz_oyuncak";
private $username = "root";
private $password = "";
```

## XML IMPORT KULLANIMI

### Admin Panelden Import

1. Admin panele giriş: `http://localhost/gurbuz-oyuncak/admin/login.php`
   - Kullanıcı: `admin`
   - Şifre: `admin123`

2. "XML Import" menüsüne tıklayın

3. İki yöntemden birini seçin:
   - **Dosya Yükle**: XML dosyasını seçip yükleyin
   - **URL'den İndir**: XML feed URL'sini girin

4. "Import'u Başlat" butonuna tıklayın

5. İlerleme çubuğunda import durumunu izleyin

6. Tamamlandığında sonuçları görüntüleyin

### API Üzerinden Import

```bash
# Dosya ile
curl -X POST \
  -F "xml_file=@/path/to/products.xml" \
  http://localhost/gurbuz-oyuncak/backend/api/xml_import.php

# URL ile
curl -X POST \
  -d "xml_url=https://example.com/feed.xml" \
  http://localhost/gurbuz-oyuncak/backend/api/xml_import.php
```

### Import Geçmişini Görüntüleme

```bash
curl http://localhost/gurbuz-oyuncak/backend/api/xml_import.php
```

## ÖRNEK XML YAPISI

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Products>
    <Product>
        <Product_code>TOY001</Product_code>
        <Product_id>1</Product_id>
        <Barcode>1234567890123</Barcode>
        <mpn>MPN001</mpn>
        <rafno>A-01</rafno>
        <Name>Oyuncak Araba</Name>
        <alt_baslik>Kırmızı Yarış Arabası</alt_baslik>
        <alt_baslik2>30x15x10 cm</alt_baslik2>
        <mainCategory>Oyuncaklar</mainCategory>
        <mainCategory_id>1</mainCategory_id>
        <category>Araçlar</category>
        <category_id>5</category_id>
        <subCategory>Arabalar</subCategory>
        <subCategory_id>12</subCategory_id>
        <Price>149.90</Price>
        <CurrencyType>TRY</CurrencyType>
        <Tax>18</Tax>
        <Stock>50</Stock>
        <Brand>Hot Wheels</Brand>
        <urun_mensei>Çin</urun_mensei>
        <Image1>https://example.com/images/toy001_1.jpg</Image1>
        <Image2>https://example.com/images/toy001_2.jpg</Image2>
        <Image3>https://example.com/images/toy001_3.jpg</Image3>
        <width>30</width>
        <height>15</height>
        <depth>10</depth>
        <desi>4.5</desi>
        <agirlik>0.5</agirlik>
        <categories>Oyuncaklar > Araçlar > Arabalar</categories>
    </Product>
</Products>
```

## HIZLI TEST SENARYOSU

### Test 1: Veritabanı Kontrolü

```sql
-- Tabloların oluştuğunu kontrol et
USE gurbuz_oyuncak;
SHOW TABLES;

-- Beklenen: urunler, kategoriler, markalar vb.

-- Admin kullanıcısını kontrol et
SELECT * FROM admin_kullanicilar;
```

### Test 2: API Test

```bash
# Ürünleri listele
curl http://localhost/gurbuz-oyuncak/backend/api/urunler.php

# Beklenen çıktı: {"success":true,"data":[],"count":0}
```

### Test 3: XML Import Test

1. Test XML dosyası oluştur (`test_products.xml`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Products>
    <Product>
        <Product_code>TEST001</Product_code>
        <Name>Test Ürün 1</Name>
        <Price>99.90</Price>
        <Stock>10</Stock>
        <Brand>Test Marka</Brand>
        <category>Test Kategori</category>
        <Image1>https://via.placeholder.com/400x400/1E88E5/FFFFFF?text=Urun+1</Image1>
    </Product>
    <Product>
        <Product_code>TEST002</Product_code>
        <Name>Test Ürün 2</Name>
        <Price>149.90</Price>
        <Stock>20</Stock>
        <Brand>Test Marka</Brand>
        <category>Test Kategori</category>
        <Image1>https://via.placeholder.com/400x400/00BFA5/FFFFFF?text=Urun+2</Image1>
    </Product>
</Products>
```

2. Admin panelden import et

3. Kontrol et:

```sql
SELECT COUNT(*) FROM urunler;
-- Beklenen: 2

SELECT COUNT(*) FROM kategoriler;
-- Beklenen: 1 (Test Kategori)

SELECT COUNT(*) FROM markalar;
-- Beklenen: 1 (Test Marka)

-- Ürünleri göster
SELECT urun_kodu, urun_adi, fiyat, stok_miktari FROM urunler;
```

### Test 4: Frontend Test

1. Ana sayfayı aç: `http://localhost/gurbuz-oyuncak/public/index.html`

2. Kontrol et:
   - Sayfa yükleniyor mu?
   - Header görünüyor mu?
   - Ürünler listeleniyor mu?

3. API'yi test et:

```bash
curl http://localhost/gurbuz-oyuncak/backend/api/urunler.php
```

## SORUN GİDERME

### Hata: "XML yüklenemedi"
- XML dosyasının geçerli olduğundan emin olun
- Dosya izinlerini kontrol edin
- PHP'de simplexml extension'ın kurulu olduğundan emin olun

### Hata: "Görseller indirilemedi"
- `public/images/products/` klasörünün yazma iznine sahip olduğundan emin olun
- Görsel URL'lerinin geçerli olduğundan emin olun

### Hata: "Veritabanı bağlantı hatası"
- MySQL'in çalıştığından emin olun
- `backend/config/database.php` ayarlarını kontrol edin
- Veritabanının oluşturulduğundan emin olun

### Hata: "Tablo bulunamadı"
- Yeni şemayı uyguladığınızdan emin olun:
  ```bash
  mysql -u root -p gurbuz_oyuncak < database/xml_uyumlu_schema.sql
  ```

## TEKNİK DETAYLAR

### Yeni Veritabanı Şeması

**Tablo Adları (Türkçe):**
- `urunler` (products)
- `kategoriler` (categories)
- `markalar` (brands)
- `kullanicilar` (users)
- `siparisler` (orders)
- `siparis_kalemleri` (order_items)
- `kuponlar` (coupons)
- `kampanyalar` (campaigns)
- `bakiye_hareketleri` (balance_transactions)
- `puan_hareketleri` (points_transactions)
- `bannerlar` (banners)
- `anasayfa_bolumleri` (homepage_sections)
- `xml_import_gecmisi` (xml_import_history)

**Alan Adları (Türkçe):**
- `urun_adi` (name)
- `fiyat` (price)
- `stok_miktari` (stock)
- `kategori_id` (category_id)
- `marka_id` (brand_id)
- `ana_gorsel` (main_image)
- `aktif` (active)

### XML Import Özellikleri

- Otomatik kategori ve marka oluşturma
- 9 resim desteği (Image1-Image9)
- Otomatik görsel indirme ve yeniden adlandırma
- Duplicate detection (ürün kodu ile)
- Bulk insert/update operasyonları
- Progress tracking
- Hata loglama
- Import geçmişi

### Desteklenen XML Alanları

Tüm XML alanları veritabanına kaydedilir:
- Product_code, Product_id, Barcode, mpn, rafno
- Name, alt_baslik, alt_baslik2
- mainCategory, category, subCategory (ID'li)
- Price, CurrencyType, Tax, Stock
- Brand, urun_mensei
- Image1-Image9
- width, height, depth, desi, agirlik
- categories (tam kategori yolu)

## PERFORMANS İPUÇLARI

1. **Büyük XML Dosyaları İçin:**
   - PHP'de memory_limit'i artırın: `ini_set('memory_limit', '512M');`
   - max_execution_time'ı artırın: `ini_set('max_execution_time', 300);`

2. **Görsel İndirme:**
   - Hızlı internet bağlantısı gereklidir
   - Görseller paralel indirilebilir (gelecek güncellemede)

3. **Veritabanı Optimizasyonu:**
   - Indexler otomatik oluşturulur
   - Bulk insert kullanılır
   - Transaction'lar kullanılabilir

## GÜVENLİK

1. **Admin Paneli:**
   - Production'da güçlü şifre kullanın
   - SSL sertifikası kurun

2. **Dosya Yükleme:**
   - Sadece XML dosyaları kabul edilir
   - Dosya boyutu limiti: 50MB (ayarlanabilir)

3. **SQL Injection:**
   - PDO prepared statements kullanılır
   - Tüm girdiler temizlenir

## DESTEK

Sorun yaşarsanız:

1. Error log'ları kontrol edin:
   ```bash
   tail -f /var/log/apache2/error.log
   ```

2. PHP hata mesajlarını açın:
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```

3. Veritabanı loglarını kontrol edin

---

**Hazırlayan:** MiniMax Agent
**Tarih:** 2025-10-30
**Versiyon:** 2.0.0 (XML Uyumlu)
**Proje:** Gürbüz Oyuncak E-Ticaret Sistemi
