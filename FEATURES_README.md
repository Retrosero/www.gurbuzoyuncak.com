# Gürbüz Oyuncak - Kampanya & Kupon & Bakiye & Ödül Sistemleri

## Eklenen Yeni Özellikler

### 1. İNDİRİM KUPONU SİSTEMİ
- **Kupon Türleri**: Yüzde indirim, Sabit tutar, Ücretsiz kargo
- **Kullanım Kontrolleri**: Tek/Çok kullanımlık, Tarih sınırlaması, Müşteri tipi bazlı
- **Koşullar**: Minimum sipariş tutarı, Ürün/kategori kısıtlaması, Maksimum indirim limiti
- **API Endpoint**: `/backend/api/coupons.php`
- **Admin Panel**: `/admin/coupons.php`

### 2. BAYİLER İÇİN BAKİYE SİSTEMİ
- **Bakiye İşlemleri**: Yükleme, Harcama, İade, Transfer
- **Özellikler**: Kredi limiti, Düşük bakiye uyarısı, İşlem geçmişi
- **B2B Ödeme**: Sepet sayfasında bakiye ile ödeme seçeneği
- **API Endpoint**: `/backend/api/balance.php`
- **Admin Panel**: `/admin/balance.php`

### 3. KULLANICI ÖDÜL SİSTEMİ
- **Puan Kazanma**: 
  - Alışveriş: Her 1 TL = 1 puan
  - Ürün yorumu: 50 puan
  - Sosyal medya paylaşımı: 25 puan
  - Doğum günü: 200 puan
  - Yeni üyelik: 50 puan

- **VIP Seviyeleri**:
  - Standart (0-100 puan): %0 indirim
  - Bronz (101-500 puan): %5 indirim
  - Gümüş (501-1000 puan): %10 indirim + Ücretsiz kargo
  - Altın (1001-2000 puan): %15 indirim + Özel fırsatlar
  - Platin (2001+ puan): %20 indirim + Tüm ayrıcalıklar

- **Puan Kullanımı**: Siparişlerde indirim olarak kullanım (1 puan = 0.10 TL)
- **API Endpoint**: `/backend/api/rewards.php`
- **Admin Panel**: `/admin/rewards.php`

### 4. GELİŞMİŞ KAMPANYA SİSTEMİ
- **Kampanya Türleri**:
  - **Müşteri Bazlı**: B2C (%10), B2B (%25), Toptan (%40)
  - **Sepet Bazlı**: Min. 200 TL sepete %10, Min. 10 ürüne %15
  - **X Al Y Öde**: 3 al 2 öde, 2 al 1 bedava
  - **Kategori Bazlı**: Belirli kategorilerde özel indirimler
  - **Zamanlanmış**: Başlangıç-bitiş tarihli otomatik kampanyalar

- **Öncelik Sistemi**: Birden fazla kampanya varsa en yüksek öncelikli uygulanır
- **API Endpoint**: `/backend/api/campaigns.php`
- **Admin Panel**: `/admin/campaigns_new.php`

## Veritabanı Yapısı

### Yeni Tablolar (16 adet):
- `vip_levels` - VIP seviye tanımları
- `reward_transactions` - Puan kazanım/harcama geçmişi
- `reward_rules` - Puan kazanma kuralları
- `user_balance` - Kullanıcı bakiye hesapları
- `balance_transactions` - Bakiye işlem geçmişi
- `coupons` - Kupon tanımları
- `coupon_categories` - Kupon-kategori ilişkileri
- `coupon_products` - Kupon-ürün ilişkileri
- `coupon_usage` - Kupon kullanım geçmişi
- `campaign_categories` - Kampanya-kategori ilişkileri
- `campaign_products` - Kampanya-ürün ilişkileri
- `campaign_usage` - Kampanya kullanım geçmişi

### Güncellenen Tablolar:
- `users`: `customer_type`, `vip_level_id`, `total_spent`, `reward_points` alanları eklendi
- `campaigns`: Genişletilmiş kampanya özellikleri eklendi
- `orders`: İndirim detayları alanları eklendi (kupon, kampanya, bakiye, puan)

## Kurulum

### 1. Veritabanı Kurulumu
```bash
# Ana şemayı yükle (eğer yüklenmediyse)
mysql -u root -p gurbuz_oyuncak < database/schema.sql

# Yeni sistemleri yükle
mysql -u root -p gurbuz_oyuncak < database/extensions_schema.sql
```

### 2. Backend Dosyaları
Tüm PHP class'ları ve API endpoint'leri hazır durumda:
- `/backend/classes/`: Coupon.php, Balance.php, Reward.php, Campaign.php
- `/backend/api/`: coupons.php, balance.php, rewards.php, campaigns.php

### 3. Admin Panel
Yeni yönetim sayfaları:
- `/admin/coupons.php` - Kupon yönetimi
- `/admin/balance.php` - Bakiye yönetimi
- `/admin/rewards.php` - Ödül/Puan yönetimi
- `/admin/campaigns_new.php` - Kampanya yönetimi

### 4. Frontend Entegrasyonu (Devam Ediyor)
- Sepet sayfası: Kupon kodu girişi, Bakiye ile ödeme, Puan kullanımı
- Ödeme sayfası: Tüm indirimlerin toplam hesaplanması
- Kullanıcı paneli: Puan bakiyesi, VIP seviye, İşlem geçmişi
- Ürün detay: VIP indirim gösterimi

## Kullanım Örnekleri

### Kupon Kullanımı (API)
```javascript
// Kupon doğrulama
const response = await fetch('/backend/api/coupons.php?action=validate&code=YAZ25&cart_total=500&customer_type=B2C');
const result = await response.json();

if (result.valid) {
    console.log('İndirim:', result.discount, 'TL');
}
```

### Bakiye Kontrolü (API)
```javascript
// Bakiye sorgula
const response = await fetch('/backend/api/balance.php?action=balance&user_id=1');
const balance = await response.json();

console.log('Mevcut Bakiye:', balance.current_balance, 'TL');
console.log('Kredi Limiti:', balance.credit_limit, 'TL');
```

### Puan İstatistikleri (API)
```javascript
// Kullanıcı puanları
const response = await fetch('/backend/api/rewards.php?action=statistics&user_id=1');
const stats = await response.json();

console.log('Toplam Puan:', stats.current_points);
console.log('VIP Seviye:', stats.vip_level.name);
console.log('Bir sonraki seviye için:', stats.points_to_next_level, 'puan gerekli');
```

### Kampanya Kontrolü (API)
```javascript
// En iyi kampanyayı bul
const cartItems = [
    {product_id: 1, category_id: 2, price: 100, quantity: 2},
    {product_id: 2, category_id: 3, price: 50, quantity: 1}
];

const response = await fetch('/backend/api/campaigns.php?action=best&cart_total=250&customer_type=B2B&cart_items=' + encodeURIComponent(JSON.stringify(cartItems)));
const best = await response.json();

if (best.found) {
    console.log('Kampanya:', best.campaign.name);
    console.log('İndirim:', best.discount, 'TL');
}
```

## Demo Veriler

### Kuponlar:
- **HOSGELDIN50**: 50 TL indirim (min. 200 TL)
- **YAZ25**: %25 indirim (min. 300 TL)
- **BAYI40**: %40 indirim (sadece B2B, min. 1000 TL)
- **KARGOBEDAVA**: Ücretsiz kargo (min. 150 TL)

### Kampanyalar:
- B2B müşteriler için %25 indirim (min. 1000 TL)
- Min. 200 TL sepete %10 indirim
- Min. 10 ürüne %15 indirim
- 3 Al 2 Öde kampanyası
- Toptan müşteriler için %40 indirim (min. 2000 TL)

### Test Kullanıcıları:
- **Bayi**: bayi@test.com (şifre: test123)
  - Müşteri Tipi: B2B
  - Bakiye: 5,000 TL
  - Kredi Limiti: 10,000 TL

## İleriye Dönük Geliştirmeler

1. Frontend entegrasyonu tamamlanacak
2. Email/SMS bildirimleri eklenecek
3. Puan sona erme zamanlayıcısı (cron job) eklenecek
4. Raporlama ve analitik sistemleri geliştirilecek
5. Mobil uygulama entegrasyonu için API iyileştirmeleri

## Teknik Detaylar

- **Backend**: PHP 7.4+, MySQL 5.7+
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: RESTful JSON API
- **Güvenlik**: PDO prepared statements, SQL injection koruması
- **Session Yönetimi**: PHP sessions
- **Tarih/Saat**: MySQL TIMESTAMP, UTC

## Destek

Sorularınız için: info@gurbuzoyuncak.com
