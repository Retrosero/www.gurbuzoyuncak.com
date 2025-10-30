# B2B Bayi Paneli Sistemi

Gürbüz Oyuncak B2B Bayi Sistemi, bayilerin bakiye yüklemesi yapmasına, sipariş vermesine ve hesap yönetimi gerçekleştirmesine olanak tanıyan kapsamlı bir sistemdir.

## Özellikler

### 🔐 Kimlik Doğrulama
- Güvenli bayi girişi
- Session tabanlı oturum yönetimi
- Şifre hash'leme (bcrypt)
- CSRF koruması
- Otomatik oturum zaman aşımı

### 💰 Bakiye Yönetimi
- PayTR entegrasyonu ile güvenli ödeme
- Test modu desteği
- Anlık bakiye güncellemesi
- İşlem geçmişi takibi
- Otomatik bakiye senkronizasyonu

### 📊 Dashboard & Raporlama
- Anlık bakiye görüntüleme
- Son işlemler listesi
- İstatistiksel özetler
- Hızlı işlem erişimi

### 🛡️ Güvenlik
- SQL injection koruması
- XSS koruması
- CSRF token doğrulaması
- Session güvenliği
- Güvenli yönlendirme

## Kurulum

### 1. Veritabanı Kurulumu

```sql
-- Ana veritabanı şemasını uygula
mysql -u root -p gurbuz_oyuncak < database/schema.sql

-- B2B bayi tablolarını oluştur
mysql -u root -p gurbuz_oyuncak < database/bayi_system_schema.sql
```

### 2. Dosya Yapısı

```
bayi-panel/
├── includes/
│   └── auth.php           # Kimlik doğrulama fonksiyonları
├── css/
│   └── style.css          # Ana stil dosyası
├── js/
│   └── main.js           # JavaScript fonksiyonları
├── ajax/
│   └── get-balance.php   # AJAX endpoint'leri
├── login.php             # Giriş sayfası
├── register.php          # Kayıt sayfası
├── index.php             # Dashboard
├── deposit.php           # Bakiye yükleme
├── transactions.php      # İşlem geçmişi
├── payment-process.php   # PayTR ödeme işlemi
├── payment-success.php   # Ödeme başarılı
├── payment-fail.php      # Ödeme başarısız
└── logout.php           # Çıkış
```

### 3. PayTR Konfigürasyonu

Environment değişkenlerini ayarlayın:

```bash
# .env dosyası veya server environment
PAYTR_MERCHANT_ID=XXXXXX
PAYTR_MERCHANT_KEY=XXXXXXXXXXXXXXXX
PAYTR_MERCHANT_SALT=XXXXXXXXXXXXXXXX
```

## Kullanım

### Demo Hesap

```
E-posta: demo@bayipanel.com
Şifre: 123456
```

### Test Modunda Ödeme

Test modunda ödeme yapmak için:
1. `deposit.php` sayfasında "Test Ödemesi" seçeneğini seçin
2. Miktar girin ve "Ödemeye Geç" butonuna tıklayın
3. Bakiye anında hesabınıza yüklenir

### Production PayTR Entegrasyonu

1. `PayTRBayi.php` dosyasında test modunu kapatın:
```php
$test_mode = false; // Production için
```

2. Gerçek PayTR anahtarlarını environment'a ekleyin

3. Callback URL'lerini PayTR panelinde ayarlayın:
   - Success URL: `https://yourdomain.com/bayi-panel/payment-success.php`
   - Fail URL: `https://yourdomain.com/bayi-panel/payment-fail.php`

## API Endpoint'leri

### AJAX Endpoint'leri

- `GET /bayi-panel/ajax/get-balance.php` - Güncel bakiye sorgulama

## Veritabanı Tabloları

### bayiler
Bayi bilgilerini saklar:
- bayi_id (PK)
- email, password_hash
- company_name, contact_person
- phone, address, tax_number
- is_active, email_verified

### bayi_profiles
Bayi profil ve bakiye bilgileri:
- profile_id (PK)
- bayi_id (FK)
- balance, credit_limit
- status, discount_rate
- last_login, total_orders

### bayi_balance_transactions
Bakiye işlem geçmişi:
- transaction_id (PK)
- bayi_id (FK)
- transaction_type, amount
- balance_before, balance_after
- payment_method, status

### bayi_paytr_transactions
PayTR ödeme kayıtları:
- id (PK)
- bayi_id (FK)
- merchant_oid, payment_amount
- status, paytr_response

## Güvenlik Özellikleri

### Session Güvenliği
- Session ID regeneration
- Secure session cookies
- Session timeout (4 saat)
- Brute force koruması

### Veri Güvenliği
- PDO prepared statements
- Input sanitization
- Output escaping
- CSRF token doğrulaması

### Ödeme Güvenliği
- PayTR hash doğrulaması
- SSL/TLS şifreleme
- PCI DSS uyumlu ödeme

## Geliştirme Notları

### Debug Modu

Test ortamında debug modunu aktifleştirin:

```php
// includes/auth.php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

### Log Tutma

Önemli işlemler için log tutun:

```php
// Örnek log fonksiyonu
function logTransaction($bayi_id, $action, $details) {
    $log = date('Y-m-d H:i:s') . " - Bayi: $bayi_id - $action - $details\n";
    file_put_contents('logs/bayi_transactions.log', $log, FILE_APPEND);
}
```

### Performans Optimizasyonu

- Database connection pooling
- Query caching
- Session caching
- CDN kullanımı

## Sorun Giderme

### Yaygın Sorunlar

1. **Giriş yapılamıyor**
   - Veritabanı bağlantısını kontrol edin
   - Session ayarlarını kontrol edin
   - Bayi durumunu (is_active, status) kontrol edin

2. **PayTR ödemeleri çalışmıyor**
   - API anahtarlarını kontrol edin
   - Test/Production modu kontrolü
   - Callback URL'leri doğrulayın

3. **Bakiye güncellenmiyor**
   - AJAX endpoint'lerini kontrol edin
   - Session değişkenlerini kontrol edin
   - Veritabanı transaction'larını kontrol edin

### Loglar

```bash
# Apache/Nginx error logs
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log

# PHP error logs
tail -f /var/log/php/error.log

# MySQL slow query log
tail -f /var/log/mysql/slow.log
```

## Destek

Teknik destek için:
- 📧 developer@gurbuzoyuncak.com
- 📞 0242 XXX XX XX
- 📋 GitHub Issues

## Lisans

Bu proje Gürbüz Oyuncak için özel olarak geliştirilmiştir.

---

**Geliştirme Tarihi:** 2025-10-30
**Versiyon:** 1.0.0
**Geliştirici:** MiniMax Agent