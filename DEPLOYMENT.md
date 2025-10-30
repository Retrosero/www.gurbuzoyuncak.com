# Gürbüz Oyuncak - Production Deployment Guide

## 🚀 Canlıya Alma Rehberi

Bu doküman, Gürbüz Oyuncak e-ticaret sitesinin production ortamına nasıl deploy edileceğini detaylı olarak açıklamaktadır.

---

## 📋 Gereksinimler

### Sunucu Gereksinimleri
- **PHP:** 7.4 veya üzeri
- **MySQL:** 5.7 veya üzeri (MariaDB 10.3+ de kullanılabilir)
- **Web Sunucu:** Apache 2.4+ veya Nginx 1.18+
- **SSL Sertifikası:** Let's Encrypt veya ücretli SSL
- **Disk Alanı:** Minimum 1 GB (ürün görselleri için daha fazla gerekebilir)
- **RAM:** Minimum 1 GB

### PHP Eklentileri
```bash
php-mysql
php-curl
php-gd
php-mbstring
php-xml
php-json
php-zip
```

---

## 🔧 Adım 1: Sunucu Hazırlığı

### A. Linux Sunucu (Ubuntu/Debian)

```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# PHP ve gerekli eklentiler
sudo apt install php php-mysql php-curl php-gd php-mbstring php-xml php-json php-zip -y

# MySQL kurulumu
sudo apt install mysql-server -y

# Apache kurulumu
sudo apt install apache2 -y

# Apache modüllerini aktifleştir
sudo a2enmod rewrite
sudo a2enmod ssl
sudo systemctl restart apache2
```

### B. cPanel/Plesk Ortamı

1. **File Manager** üzerinden projeyi yükle
2. **PHP Selector** üzerinden PHP 7.4+ seç
3. **MySQL Databases** üzerinden veritabanı oluştur
4. **SSL/TLS** bölümünden Let's Encrypt SSL aktifleştir

---

## 📦 Adım 2: Dosyaların Yüklenmesi

### FTP/SFTP ile Yükleme

```bash
# SFTP bağlantısı
sftp username@yourdomain.com

# Dosyaları yükle
put -r /local/path/gurbuz-oyuncak /var/www/html/

# İzinleri ayarla
chmod -R 755 /var/www/html/gurbuz-oyuncak
chown -R www-data:www-data /var/www/html/gurbuz-oyuncak
```

### Git ile Deploy

```bash
# Sunucuda Git reposunu klonla
cd /var/www/html
git clone https://github.com/yourusername/gurbuz-oyuncak.git

# Doğru branch'e geç
cd gurbuz-oyuncak
git checkout production
```

---

## 🗄️ Adım 3: Veritabanı Kurulumu

### MySQL Veritabanı Oluşturma

```bash
# MySQL'e giriş yap
mysql -u root -p

# Veritabanı ve kullanıcı oluştur
CREATE DATABASE gurbuz_oyuncak CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gurbuz_user'@'localhost' IDENTIFIED BY 'GÜÇLÜ_ŞİFRE_BURAYA';
GRANT ALL PRIVILEGES ON gurbuz_oyuncak.* TO 'gurbuz_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Schema'yı import et
mysql -u gurbuz_user -p gurbuz_oyuncak < database/schema.sql
```

### cPanel'de Veritabanı Oluşturma

1. **MySQL Databases** bölümüne git
2. Yeni veritabanı oluştur: `gurbuz_oyuncak`
3. Yeni kullanıcı oluştur ve güçlü şifre belirle
4. Kullanıcıyı veritabanına ekle (ALL PRIVILEGES)
5. **phpMyAdmin** ile `schema.sql` dosyasını import et

---

## ⚙️ Adım 4: Konfigürasyon

### Database Config Güncelleme

`backend/config/database.php` dosyasını düzenle:

```php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "gurbuz_oyuncak";
    private $username = "gurbuz_user";
    private $password = "GÜÇLÜ_ŞİFRE_BURAYA";
    private $charset = "utf8mb4";
    private $conn;
    
    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Connection Error: " . $e->getMessage());
        }
        return $this->conn;
    }
}
?>
```

### Environment Variables (.env)

`.env` dosyası oluştur (production için):

```env
# Database
DB_HOST=localhost
DB_NAME=gurbuz_oyuncak
DB_USER=gurbuz_user
DB_PASS=GÜÇLÜ_ŞİFRE_BURAYA

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2y$10$... (password_hash ile oluştur)

# Payment - İyzico
IYZICO_API_KEY=your_production_api_key
IYZICO_SECRET_KEY=your_production_secret_key
IYZICO_BASE_URL=https://api.iyzipay.com

# Payment - PayTR
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt

# Site
SITE_URL=https://www.gurbuzoyuncak.com
SITE_NAME=Gürbüz Oyuncak

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@gurbuzoyuncak.com
SMTP_PASS=your_email_password
```

---

## 🔒 Adım 5: Güvenlik Ayarları

### Apache .htaccess

`public/.htaccess` oluştur:

```apache
# URL Rewriting
RewriteEngine On
RewriteBase /

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Güvenlik Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;"
</IfModule>

# Dosya yükleme limiti
php_value upload_max_filesize 10M
php_value post_max_size 10M

# Dizin listelemeyi kapat
Options -Indexes

# Hassas dosyaları koru
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### Admin Directory Protection

`admin/.htaccess` oluştur:

```apache
# IP kısıtlama (opsiyonel)
<Limit GET POST>
    order deny,allow
    deny from all
    allow from YOUR_IP_ADDRESS
</Limit>

# Session güvenliği
php_flag session.cookie_httponly on
php_flag session.cookie_secure on
php_value session.gc_maxlifetime 1800
```

### Dosya İzinleri

```bash
# Klasör izinleri (755)
find /var/www/html/gurbuz-oyuncak -type d -exec chmod 755 {} \;

# Dosya izinleri (644)
find /var/www/html/gurbuz-oyuncak -type f -exec chmod 644 {} \;

# Upload klasörü (775)
chmod 775 /var/www/html/gurbuz-oyuncak/public/uploads
chown -R www-data:www-data /var/www/html/gurbuz-oyuncak/public/uploads
```

---

## 💳 Adım 6: Ödeme Entegrasyonu

### İyzico Kurulumu

```bash
# Composer ile İyzico SDK'sını yükle
cd /var/www/html/gurbuz-oyuncak/backend/payment
composer require iyzico/iyzipay-php
```

**API Anahtarlarını Al:**
1. https://merchant.iyzipay.com adresinden üye ol
2. **Ayarlar** > **Geliştirici** bölümünden API anahtarlarını al
3. `.env` dosyasına ekle

### PayTR Kurulumu

**Merchant Bilgilerini Al:**
1. https://www.paytr.com adresinden başvuru yap
2. Onay sonrası **Entegrasyon** bölümünden Merchant ID, Key ve Salt değerlerini al
3. `.env` dosyasına ekle

**Callback URL Ayarla:**
- PayTR panel'den callback URL'ini ayarla: `https://yourdomain.com/backend/payment/paytr_callback.php`

---

## 📧 Adım 7: E-posta Ayarları

### SMTP Konfigürasyonu

`backend/includes/email.php` oluştur:

```php
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Composer ile PHPMailer yükle

function sendEmail($to, $subject, $body) {
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST');
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USER');
        $mail->Password = getenv('SMTP_PASS');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = getenv('SMTP_PORT');
        $mail->CharSet = 'UTF-8';
        
        $mail->setFrom('noreply@gurbuzoyuncak.com', 'Gürbüz Oyuncak');
        $mail->addAddress($to);
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email Error: {$mail->ErrorInfo}");
        return false;
    }
}
?>
```

---

## 🔍 Adım 8: SSL Sertifikası

### Let's Encrypt (Ücretsiz)

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-apache -y

# SSL sertifikası al
sudo certbot --apache -d gurbuzoyuncak.com -d www.gurbuzoyuncak.com

# Otomatik yenileme
sudo certbot renew --dry-run
```

### cPanel SSL

1. **SSL/TLS** bölümüne git
2. **Let's Encrypt™ SSL** seç
3. Domain seç ve **Issue** butonuna tıkla

---

## 📊 Adım 9: Performans Optimizasyonu

### PHP Opcache

`php.ini` düzenle:

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

### MySQL Optimizasyonu

```sql
-- Query cache aktifleştir
SET GLOBAL query_cache_type = ON;
SET GLOBAL query_cache_size = 67108864; -- 64MB

-- Index'leri optimize et
OPTIMIZE TABLE products, categories, orders;
```

### CDN Entegrasyonu

- Cloudflare veya benzeri CDN kullan
- Statik dosyaları (CSS, JS, görseller) CDN üzerinden servis et

---

## 🧪 Adım 10: Test

### Fonksiyonel Testler

```bash
# Test listesi
✓ Ana sayfa yükleniyor mu?
✓ Ürün listeleme çalışıyor mu?
✓ Sepete ekleme çalışıyor mu?
✓ Kullanıcı kaydı çalışıyor mu?
✓ Giriş yapma çalışıyor mu?
✓ Sipariş oluşturma çalışıyor mu?
✓ Admin paneline giriş yapılabiliyor mu?
✓ CRUD işlemleri çalışıyor mu?
```

### Güvenlik Testleri

```bash
# SSL kontrolü
https://www.ssllabs.com/ssltest/

# Güvenlik taraması
https://observatory.mozilla.org/

# SQL injection testi
sqlmap -u "https://yourdomain.com/backend/api/products.php?id=1"
```

### Performans Testleri

```bash
# Google PageSpeed
https://pagespeed.web.dev/

# GTmetrix
https://gtmetrix.com/

# Load testing
ab -n 1000 -c 10 https://yourdomain.com/
```

---

## 📝 Adım 11: Yedekleme

### Otomatik Yedekleme Script

`backup.sh` oluştur:

```bash
#!/bin/bash

# Değişkenler
BACKUP_DIR="/var/backups/gurbuz-oyuncak"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="gurbuz_oyuncak"
DB_USER="gurbuz_user"
DB_PASS="ŞİFRE"

# Dizin oluştur
mkdir -p $BACKUP_DIR

# Veritabanı yedeği
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Dosya yedeği
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/html/gurbuz-oyuncak

# 7 günden eski yedekleri sil
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Cron job ekle:

```bash
crontab -e

# Her gün saat 03:00'da yedek al
0 3 * * * /path/to/backup.sh
```

---

## 🚨 Sorun Giderme

### Yaygın Hatalar

**1. Database bağlantı hatası**
```bash
# MySQL servisini kontrol et
sudo systemctl status mysql

# Kullanıcı izinlerini kontrol et
mysql -u root -p
SHOW GRANTS FOR 'gurbuz_user'@'localhost';
```

**2. 500 Internal Server Error**
```bash
# PHP hata loglarını kontrol et
tail -f /var/log/apache2/error.log

# PHP ayarlarını kontrol et
php -v
php -m
```

**3. Dosya yükleme hatası**
```bash
# İzinleri kontrol et
ls -la /var/www/html/gurbuz-oyuncak/public/uploads

# Sahipliği düzelt
chown -R www-data:www-data /var/www/html/gurbuz-oyuncak/public/uploads
```

---

## ✅ Deployment Checklist

```
□ Sunucu gereksinimleri karşılandı
□ Dosyalar yüklendi
□ Veritabanı oluşturuldu ve import edildi
□ Konfigürasyon dosyaları güncellendi
□ .env dosyası oluşturuldu
□ SSL sertifikası kuruldu
□ Güvenlik ayarları yapıldı
□ Ödeme entegrasyonları tamamlandı
□ E-posta ayarları yapıldı
□ Performans optimizasyonu yapıldı
□ Testler tamamlandı
□ Yedekleme sistemi kuruldu
□ Monitoring kuruldu
□ Domain DNS ayarları yapıldı
```

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- GitHub Issues: https://github.com/yourusername/gurbuz-oyuncak/issues
- Email: support@gurbuzoyuncak.com
- Telefon: 0242 XXX XX XX

---

## 📚 Kaynaklar

- [İyzico Entegrasyon Dokümantasyonu](https://dev.iyzipay.com/)
- [PayTR Entegrasyon Dokümantasyonu](https://www.paytr.com/entegrasyon)
- [PHP Best Practices](https://www.php-fig.org/psr/)
- [MySQL Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

---

**Son Güncelleme:** 30 Ekim 2025  
**Versiyon:** 1.0.0
