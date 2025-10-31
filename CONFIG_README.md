# Gürbüz Oyuncak - Yapılandırma Kılavuzu

## 📋 İçindekiler
- [Kurulum](#kurulum)
- [Veritabanı Yapılandırması](#veritabanı-yapılandırması)
- [Güvenlik Ayarları](#güvenlik-ayarları)
- [Test](#test)
- [Sorun Giderme](#sorun-giderme)

## 🚀 Kurulum

### 1. Config Dosyası
Ana yapılandırma dosyası `config.php` kök dizinde bulunmaktadır ve tüm sistem ayarlarını içerir.

**Mevcut Veritabanı Bilgileri:**
```php
Host: localhost
Port: 3306
Database: u2101458_gurbuz_oyuncak
Username: gurbuz@gurbuzoyuncak.site
Password: ?S3rhanK6l6y?
```

### 2. Ortam Değişkenleri (.env)
Hassas bilgiler için `.env` dosyası kullanabilirsiniz:

```bash
# .env.example dosyasını kopyalayın
cp .env.example .env

# Kendi değerlerinizi girin
nano .env
```

### 3. Dizin İzinleri
Aşağıdaki dizinlere yazma izni verin:

```bash
chmod 755 uploads/
chmod 755 uploads/products/
chmod 755 uploads/banners/
chmod 755 logs/
```

## 🗄️ Veritabanı Yapılandırması

### Bağlantı Yöntemleri

#### Yöntem 1: config.php (Önerilen)
```php
require_once __DIR__ . '/config.php';
$conn = getDbConnection();
```

#### Yöntem 2: Database Class
```php
require_once 'backend/config/database.php';
$database = new Database();
$conn = $database->getConnection();
```

### Veritabanı Schema'sını Yükleme

```bash
# Ana schema
mysql -u gurbuz@gurbuzoyuncak.site -p u2101458_gurbuz_oyuncak < database/schema.sql

# Ek özellikler (kampanya, kupon, ödül sistemi)
mysql -u gurbuz@gurbuzoyuncak.site -p u2101458_gurbuz_oyuncak < database/extensions_schema.sql

# Demo veriler (opsiyonel)
mysql -u gurbuz@gurbuzoyuncak.site -p u2101458_gurbuz_oyuncak < database/demo_data.sql
```

## 🔒 Güvenlik Ayarları

### 1. Hassas Dosyaları Koruma

`.gitignore` dosyası aşağıdaki dosyaları Git'ten hariç tutar:
- `.env` - Ortam değişkenleri
- `config.local.php` - Yerel yapılandırma
- `logs/` - Log dosyaları
- `uploads/` - Yüklenen dosyalar

### 2. Canlı Sunucu Ayarları

`config.php` dosyasında aşağıdaki ayarları yapın:

```php
// Geliştirme modunu kapat
define('DEV_MODE', false);
define('DEBUG_MODE', false);

// Hata gösterimini kapat
ini_set('display_errors', 0);

// HTTPS için session güvenliği
ini_set('session.cookie_secure', 1);
```

### 3. Dosya İzinleri

```bash
# Config dosyalarını koruma
chmod 600 config.php
chmod 600 .env

# Dizin izinleri
chmod 755 uploads/
chmod 755 logs/

# Yüklenen dosyalar
chmod 644 uploads/products/*
chmod 644 uploads/banners/*
```

## 🧪 Test

### Veritabanı Bağlantı Testi

1. Tarayıcıdan test dosyasını açın:
```
http://localhost/test-db-connection.php
```

2. Tüm testlerin başarılı olduğunu kontrol edin

3. **ÖNEMLİ:** Test sonrası dosyayı silin:
```bash
rm test-db-connection.php
```

### Manuel Test

```php
<?php
require_once 'config.php';

try {
    $conn = getDbConnection();
    echo "✓ Bağlantı başarılı!";
    
    // Tablo sayısını kontrol et
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "\n✓ " . count($tables) . " tablo bulundu";
    
} catch (Exception $e) {
    echo "✗ Hata: " . $e->getMessage();
}
?>
```

## 🔧 Sorun Giderme

### Bağlantı Hatası: "Access denied"

**Çözüm 1:** Kullanıcı adı ve şifreyi kontrol edin
```php
// config.php
define('DB_USER', 'gurbuz@gurbuzoyuncak.site');
define('DB_PASS', '?S3rhanK6l6y?');
```

**Çözüm 2:** MySQL kullanıcı izinlerini kontrol edin
```sql
SHOW GRANTS FOR 'gurbuz@gurbuzoyuncak.site'@'localhost';
```

### Bağlantı Hatası: "Unknown database"

**Çözüm:** Veritabanının var olduğundan emin olun
```sql
SHOW DATABASES LIKE 'u2101458_gurbuz_oyuncak';
```

### PDO Extension Hatası

**Çözüm:** PHP PDO extension'ını aktif edin
```bash
# Ubuntu/Debian
sudo apt-get install php-mysql
sudo systemctl restart apache2

# CentOS/RHEL
sudo yum install php-mysql
sudo systemctl restart httpd
```

### Charset Hatası

**Çözüm:** MySQL charset ayarlarını kontrol edin
```sql
SHOW VARIABLES LIKE 'character_set%';
```

Config dosyasında:
```php
define('DB_CHARSET', 'utf8mb4');
```

### Session Hatası

**Çözüm:** Session dizinine yazma izni verin
```bash
chmod 755 /var/lib/php/sessions
```

veya config.php'de:
```php
session_save_path(__DIR__ . '/sessions');
```

## 📝 Yapılandırma Sabitleri

### Veritabanı
- `DB_HOST` - Veritabanı sunucusu
- `DB_PORT` - Port numarası
- `DB_NAME` - Veritabanı adı
- `DB_USER` - Kullanıcı adı
- `DB_PASS` - Şifre
- `DB_CHARSET` - Karakter seti

### Site
- `SITE_URL` - Site URL'i
- `SITE_NAME` - Site adı
- `SITE_EMAIL` - İletişim e-postası
- `SITE_PHONE` - İletişim telefonu

### Güvenlik
- `SESSION_LIFETIME` - Session süresi (saniye)
- `MAX_LOGIN_ATTEMPTS` - Maksimum giriş denemesi
- `PASSWORD_MIN_LENGTH` - Minimum şifre uzunluğu

### Dosya Yükleme
- `MAX_FILE_SIZE` - Maksimum dosya boyutu (byte)
- `ALLOWED_IMAGE_TYPES` - İzin verilen dosya tipleri
- `PRODUCT_IMAGE_PATH` - Ürün görselleri dizini
- `BANNER_IMAGE_PATH` - Banner görselleri dizini

### Ödeme
- `IYZICO_API_KEY` - İyzico API anahtarı
- `IYZICO_SECRET_KEY` - İyzico gizli anahtar
- `PAYTR_MERCHANT_ID` - PayTR merchant ID

### Kargo
- `FREE_SHIPPING_THRESHOLD` - Ücretsiz kargo limiti
- `DEFAULT_SHIPPING_COST` - Varsayılan kargo ücreti

## 🆘 Destek

Sorun yaşarsanız:
1. `logs/php-errors.log` dosyasını kontrol edin
2. `logs/app-errors.log` dosyasını kontrol edin
3. `test-db-connection.php` ile bağlantıyı test edin
4. MySQL error log'larını kontrol edin

## 📚 Ek Kaynaklar

- [PHP PDO Dokümantasyonu](https://www.php.net/manual/en/book.pdo.php)
- [MySQL Dokümantasyonu](https://dev.mysql.com/doc/)
- [Güvenlik En İyi Uygulamaları](https://www.php.net/manual/en/security.php)
