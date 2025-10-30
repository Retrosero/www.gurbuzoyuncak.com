# Gürbüz Oyuncak E-Ticaret Platformu

![Gürbüz Oyuncak Logo](public/images/logo.png)

**1989'dan beri Türkiye'nin en güvenilir oyuncak markası**

Gürbüz Oyuncak, modern teknoloji ile geleneksel güveni birleştiren, tam fonksiyonel bir e-ticaret platformudur. MySQL + PHP backend ve HTML/CSS/JavaScript frontend ile geliştirilmiştir.

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Proje İstatistikleri](#-proje-istatistikleri)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Production Deployment](#-production-deployment)
- [Ödeme Entegrasyonu](#-ödeme-entegrasyonu)
- [Güvenlik](#-güvenlik)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

---

## ✨ Özellikler

### 🛍️ Frontend (Müşteri Tarafı)

**Ana Sayfalar:**
- 🏠 Ana Sayfa - Hero banner, kategori girişleri, öne çıkan ürünler
- 🎯 Ürün Listesi - Grid/List görünümü, filtreleme, sıralama
- 🔍 Ürün Detayı - Galeri, yorumlar, benzer ürünler
- 🛒 Sepet - Miktar güncelleme, kupon kodu
- 👤 Kullanıcı Hesabı - Siparişler, adresler, profil yönetimi
- 📞 İletişim - Form, harita, SSS
- ℹ️ Hakkımızda - Şirket hikayesi, değerler, ekip

**Özellikler:**
- ✅ Responsive tasarım (mobil uyumlu)
- ✅ Türkçe dil desteği
- ✅ Modern UI/UX (İznik Mavisi temalı)
- ✅ LocalStorage sepet sistemi
- ✅ Arama ve filtreleme
- ✅ Kullanıcı authentication
- ✅ Sipariş oluşturma
- ✅ SEO optimizasyonu

### 🎛️ Admin Paneli

**Yönetim Sayfaları:**
- 📊 Dashboard - İstatistikler, grafikler
- 📦 Ürün Yönetimi - CRUD işlemleri, 9 görsel yükleme, XML import
- 📁 Kategori Yönetimi - 3 seviyeli hiyerarşik yapı
- 📋 Sipariş Yönetimi - Durum güncelleme, detay görüntüleme
- 👥 Müşteri Yönetimi - Kullanıcı listesi, bakiye yönetimi
- 🎨 İçerik Yönetimi - Banner slider, ana sayfa bölümleri
- 🎁 Pazarlama - Kuponlar, kampanyalar, ödül puanları
- 🔄 XML Import - Toplu ürün import, resim indirme, progress tracking
- ⚙️ Ayarlar - Site konfigürasyonu

**Admin Özellikleri:**
- ✅ Session tabanlı güvenli giriş
- ✅ CSRF koruması
- ✅ Tam CRUD işlevselliği
- ✅ XML feed import sistemi (otomatik kategori/marka oluşturma)
- ✅ Çoklu resim yükleme (9 resim)
- ✅ Real-time progress tracking
- ✅ Toplu ürün yönetimi
- ✅ Form validasyonları
- ✅ Modal formlar
- ✅ Filtreleme ve arama
- ✅ Responsive admin panel

### 💳 Ödeme Sistemleri

- **İyzico:** Tam entegrasyon, 3D Secure desteği
- **PayTR:** iframe tabanlı ödeme
- Güvenli ödeme altyapısı
- Test ve canlı mod desteği

### 🔒 Güvenlik

- Session yönetimi (30 dakika timeout)
- CSRF token koruması
- XSS koruması
- SQL injection koruması (PDO Prepared Statements)
- Password hashing (bcrypt)
- HTTPS zorunluluğu
- IP kısıtlama (admin paneli)

---

## 🛠️ Teknoloji Stack

### Backend
- **PHP:** 7.4+
- **MySQL:** 5.7+ / MariaDB 10.3+
- **PDO:** Veritabanı soyutlama katmanı
- **RESTful API:** JSON formatında veri transferi

### Frontend
- **HTML5:** Semantic markup
- **CSS3:** Custom properties, Grid, Flexbox
- **JavaScript (Vanilla):** ES6+, Async/Await
- **Google Fonts:** Nunito Sans, Inter

### Ödeme
- **İyzico SDK:** PHP integration
- **PayTR API:** cURL tabanlı entegrasyon

### Araçlar
- **Composer:** PHP dependency management
- **Git:** Version control
- **phpMyAdmin:** Database yönetimi

---

## 📊 Proje İstatistikleri

```
Toplam Dosya: 35+
Toplam Kod: 12,500+ satır

├── Veritabanı: 415 satır (13 tablo - XML uyumlu Türkçe şema)
│   ├── urunler (ürünler - 9 resim desteği)
│   ├── kategoriler (3 seviyeli kategori)
│   ├── markalar
│   ├── siparisler & siparis_urunler
│   ├── kullanicilar
│   ├── kuponlar, kampanyalar
│   ├── bakiye_islemleri, odul_puanlari
│   ├── bannerlar, anasayfa_bolumler
│   └── xml_import_gecmisi
├── Backend PHP: 4,500+ satır
│   ├── API Endpoints: 12+ dosya
│   ├── Classes: 10+ dosya (Türkçe alan adlı)
│   ├── XML Import: XMLImporter.php (602 satır)
│   ├── Payment: 2 dosya
│   └── Auth: 1 dosya
├── Frontend: 3,134+ satır (8 sayfa)
│   ├── index.html (banner slider, dinamik bölümler)
│   ├── products.html
│   ├── product-detail.html
│   ├── cart.html (kupon, bakiye, ödül desteği)
│   ├── auth.html
│   ├── account.html
│   ├── about.html
│   └── contact.html
├── Admin Panel: 5,000+ satır (12+ sayfa)
│   ├── index.php (dashboard)
│   ├── products.php (ürünler)
│   ├── categories.php (kategoriler)
│   ├── orders.php (siparişler)
│   ├── xml_import.php (XML import - 411 satır)
│   ├── banners.php, homepage_sections.php
│   ├── coupons.php, campaigns_new.php
│   ├── balance.php, rewards.php
│   ├── settings.php
│   └── login.php
├── CSS: 680+ satır
└── JavaScript: 1,800+ satır
```

---

## 🚀 Kurulum

### Gereksinimler

- PHP 7.4 veya üzeri
- MySQL 5.7 veya üzeri
- Apache/Nginx web sunucu
- Composer (ödeme entegrasyonları için)

### Adım 1: Projeyi İndirin

```bash
git clone https://github.com/yourusername/gurbuz-oyuncak.git
cd gurbuz-oyuncak
```

### Adım 2: Veritabanını Kurun

```bash
# MySQL'e giriş yapın
mysql -u root -p

# Veritabanı oluşturun
CREATE DATABASE gurbuz_oyuncak CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

# XML uyumlu Türkçe schema'yı import edin
mysql -u root -p gurbuz_oyuncak < database/xml_uyumlu_schema.sql

# (Opsiyonel) Demo data'yı yükleyin
mysql -u root -p gurbuz_oyuncak < database/demo_data.sql
```

### Adım 3: Konfigürasyon

`backend/config/database.php` dosyasını düzenleyin:

```php
private $host = "localhost";
private $db_name = "gurbuz_oyuncak";
private $username = "root";
private $password = "your_password";
```

### Adım 4: Ödeme SDK'larını Yükleyin (Opsiyonel)

```bash
# İyzico için
cd backend/payment
composer require iyzico/iyzipay-php
```

### Adım 5: Web Sunucusunu Başlatın

**XAMPP/WAMP/MAMP:**
- Projeyi `htdocs` dizinine kopyalayın
- Apache ve MySQL'i başlatın
- `http://localhost/gurbuz-oyuncak/public/` adresine gidin

**PHP Built-in Server (Development):**
```bash
cd public
php -S localhost:8000
```

---

## 📖 Kullanım

### Müşteri Girişi

1. Ana sayfa: `http://localhost/gurbuz-oyuncak/public/`
2. Kayıt ol / Giriş yap
3. Ürünleri incele ve sepete ekle
4. Sipariş oluştur

### Admin Girişi

1. Admin paneli: `http://localhost/gurbuz-oyuncak/admin/`
2. Kullanıcı adı: `admin`
3. Şifre: `admin123`
4. Dashboard'dan işlemleri yönet

**Önemli:** Production ortamında admin şifresini mutlaka değiştirin!

---

## 🌐 Production Deployment

Detaylı deployment rehberi için [DEPLOYMENT.md](DEPLOYMENT.md) dosyasına bakın.

### Hızlı Başlangıç

```bash
# 1. Sunucuya yükle (SFTP/Git)
# 2. Veritabanını oluştur ve import et
# 3. .env dosyasını yapılandır
# 4. SSL sertifikası kur
# 5. İzinleri ayarla
chmod -R 755 /var/www/html/gurbuz-oyuncak
chmod 775 /var/www/html/gurbuz-oyuncak/public/uploads

# 6. Apache/Nginx yapılandır
# 7. Test et
```

---

## 💳 Ödeme Entegrasyonu

### İyzico Kurulumu

```bash
# SDK'yı yükle
composer require iyzico/iyzipay-php

# .env dosyasına ekle
IYZICO_API_KEY=your_api_key
IYZICO_SECRET_KEY=your_secret_key
IYZICO_BASE_URL=https://api.iyzipay.com  # Production
```

**Kullanım:**

```php
require_once 'backend/payment/IyzicoPayment.php';

$iyzico = new IyzicoPayment();
$result = $iyzico->createPayment($orderData);

if ($result['status'] == 'success') {
    // Ödeme başarılı
}
```

### PayTR Kurulumu

```bash
# .env dosyasına ekle
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
```

**Kullanım:**

```php
require_once 'backend/payment/PayTRPayment.php';

$paytr = new PayTRPayment();
$result = $paytr->createPaymentForm($orderData);

echo '<iframe src="' . $result['iframe_url'] . '"></iframe>';
```

Detaylı örnekler için `backend/payment/` klasörüne bakın.

---

## 🔒 Güvenlik

### Güvenlik Özellikleri

- **Session Management:** 30 dakika timeout, session regeneration
- **CSRF Protection:** Token tabanlı form koruması
- **XSS Prevention:** htmlspecialchars ile input temizleme
- **SQL Injection:** PDO prepared statements
- **Password Security:** bcrypt ile hash'leme
- **HTTPS:** SSL/TLS zorunluluğu
- **Security Headers:** X-Frame-Options, X-Content-Type-Options

### Güvenlik Best Practices

```php
// Admin auth kontrolü
require_once 'includes/auth.php';
checkAdminSession();

// CSRF token kontrolü
if (!verifyCSRFToken($_POST['csrf_token'])) {
    die('Invalid CSRF token');
}

// Input temizleme
$username = cleanInput($_POST['username']);
```

### .htaccess Güvenlik

```apache
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"

# Dizin listelemeyi kapat
Options -Indexes
```

---

## 📚 API Dokümantasyonu

### Ürünler API (Türkçe Alanlar)

**GET /backend/api/urunler.php**
```
Parametreler:
- id (optional): Ürün ID
- kategori_id (optional): Kategori ID
- marka_id (optional): Marka ID
- arama (optional): Arama terimi
- limit (optional): Sayfa başına ürün sayısı
- sayfa (optional): Sayfa numarası

Örnek: /backend/api/urunler.php?kategori_id=1&limit=10&sayfa=1
```

**POST /backend/api/urunler.php**
```json
{
  "urun_adi": "LEGO Classic",
  "urun_kodu": "LEG-001",
  "barkod": "8690123456789",
  "kategori_id": 1,
  "marka_id": 2,
  "fiyat": 150.00,
  "stok_miktari": 50,
  "aciklama": "Ürün açıklaması",
  "resim_url_1": "https://...",
  "kdv_orani": 20
}
```

### Kategoriler API

**GET /backend/api/kategoriler.php**
```
Parametreler:
- id (optional): Kategori ID
- ust_kategori_id (optional): Üst kategori ID (alt kategorileri getir)

Örnek: /backend/api/kategoriler.php?ust_kategori_id=1
```

### Siparişler API

**POST /backend/api/siparisler.php**
```json
{
  "kullanici_id": 1,
  "teslimat_adresi": "Adres",
  "fatura_adresi": "Adres",
  "toplam_tutar": 300.00,
  "kupon_kodu": "INDIRIM20",
  "kullanilan_bakiye": 50.00,
  "urunler": [
    {
      "urun_id": 1,
      "miktar": 2,
      "birim_fiyat": 150.00
    }
  ]
}
```

### Kullanıcılar API

**POST /backend/api/kullanicilar.php?islem=kayit**
```json
{
  "eposta": "user@example.com",
  "sifre": "securepassword",
  "ad": "Ahmet",
  "soyad": "Yılmaz",
  "telefon": "05321234567"
}
```

### XML Import API

**POST /backend/api/xml_import.php**
```json
{
  "xml_url": "https://tedarikci.com/feed.xml",
  "otomatik_kategori": true,
  "resim_indir": true
}
```

**GET /backend/api/xml_import.php?islem=gecmis**
```
XML import geçmişini getirir
```

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları takip edin:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

### Kod Standartları

- PSR-12 kod standardı
- Meaningful commit messages
- Test coverage
- Documentation

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📞 İletişim

**Gürbüz Oyuncak**
- 🌐 Website: https://www.gurbuzoyuncak.com
- 📧 Email: info@gurbuzoyuncak.com
- 📱 Telefon: 0242 XXX XX XX
- 📍 Adres: Güzeloba Mah. Çağlayangil Cad. No:1234, Muratpaşa/Antalya

---

## 🙏 Teşekkürler

- [İyzico](https://www.iyzico.com/) - Ödeme altyapısı
- [PayTR](https://www.paytr.com/) - Ödeme altyapısı
- [Google Fonts](https://fonts.google.com/) - Tipografi
- [Unsplash](https://unsplash.com/) - Görseller
- Tüm katkıda bulunan geliştiriciler

---

## 📸 Ekran Görüntüleri

### Ana Sayfa
![Ana Sayfa](screenshots/home.png)

### Ürün Listesi
![Ürün Listesi](screenshots/products.png)

### Admin Paneli
![Admin Paneli](screenshots/admin.png)

---

## 🗺️ Roadmap

- [x] XML feed import sistemi
- [x] Banner yönetimi ve slider
- [x] Dinamik ana sayfa bölümleri
- [x] Kupon ve kampanya sistemi
- [x] Bakiye yönetimi
- [x] Ödül puanları
- [ ] Mobil uygulama (React Native)
- [ ] Çoklu dil desteği
- [ ] Wishlist özelliği
- [ ] Ürün karşılaştırma
- [ ] Canlı destek (chat)
- [ ] AI destekli ürün önerileri
- [ ] PWA desteği
- [ ] GraphQL API

---

**Son Güncelleme:** 30 Ekim 2025  
**Versiyon:** 2.0.0 (XML Uyumlu Türkçe Şema)  
**Durum:** Production Ready ✅

## 🆕 Versiyon 2.0 Yenilikleri

### XML Feed Entegrasyonu
- **Otomatik XML Import:** Tedarikçi XML feed'lerinden toplu ürün aktarımı
- **9 Resim Desteği:** Her ürün için 9 resim URL'i (otomatik indirme)
- **Otomatik Kategori/Marka:** XML'den gelen kategoriler ve markalar otomatik oluşturulur
- **Progress Tracking:** Real-time import ilerleme takibi
- **Import Geçmişi:** Tüm import işlemlerinin logu

### Türkçe Veritabanı Şeması
- **Tam Türkçe Alan Adları:** `urunler`, `kategoriler`, `siparisler`, `kullanicilar` vb.
- **XML Uyumlu Alanlar:** `urun_kodu`, `barkod`, `mpn`, `raf_no`, `urun_mensei` vb.
- **Genişletilmiş Özellikler:** Boyut bilgileri (genislik, yukseklik, derinlik, agirlik, desi)
- **3 Seviyeli Kategori:** Ana kategori → Alt kategori → Alt alt kategori

### İçerik Yönetimi
- **Banner Slider:** Responsive, mobil uyumlu slider yönetimi
- **Dinamik Ana Sayfa:** Popüler ürünler, yeni gelenler, öne çıkanlar, indirimli ürünler
- **Otomatik/Manuel Seçim:** Bölüm ürünleri otomatik (kural bazlı) veya manuel seçilebilir

### Pazarlama Araçları
- **Kupon Sistemi:** Sabit/yüzde indirim, minimum sepet tutarı, kullanım limiti
- **Kampanya Yönetimi:** Ürün/kategori bazlı özel kampanyalar
- **Bakiye Sistemi:** Kullanıcı cüzdan bakiyesi, yükleme/harcama takibi
- **Ödül Puanları:** Satın alma bazlı puan kazanımı ve kullanımı

---

Made with ❤️ by Gürbüz Oyuncak Team
