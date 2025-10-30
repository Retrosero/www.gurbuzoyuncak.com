# Gürbüz Oyuncak - Sistem Test Rehberi

## Test Ortamı Hazırlığı

### 1. Veritabanı Kurulumu
```bash
# Ana şemayı yükle
mysql -u root -p gurbuz_oyuncak < database/schema.sql

# Yeni sistemleri yükle
mysql -u root -p gurbuz_oyuncak < database/extensions_schema.sql

# Demo verilerin yüklendiğini kontrol et
mysql -u root -p gurbuz_oyuncak -e "SELECT code, name, discount_value FROM coupons;"
mysql -u root -p gurbuz_oyuncak -e "SELECT email, customer_type FROM users WHERE email='bayi@test.com';"
```

### 2. Web Sunucusu
- Apache/Nginx çalıştığından emin olun
- PHP 7.4+ aktif olmalı
- MySQL bağlantısı çalışmalı

### 3. Test Kullanıcıları
- **Admin**: admin@gurbuzoyuncak.com / admin123
- **B2B Bayi**: bayi@test.com / test123 (5,000 TL bakiye)
- **Demo Müşteriler**: Demo data'daki test kullanıcıları

## Backend API Testleri

### Test 1: Kupon API
```bash
# Kupon listesi
curl "http://localhost/gurbuz-oyuncak/backend/api/coupons.php"

# Kupon doğrulama
curl "http://localhost/gurbuz-oyuncak/backend/api/coupons.php?action=validate&code=YAZ25&cart_total=500&customer_type=B2C"

# Beklenen Sonuç:
# {"valid":true,"discount":125,"coupon":{...},"message":"Kupon başarıyla uygulandı"}
```

**Kontrol Noktaları:**
- [ ] API yanıt veriyor mu?
- [ ] İndirim doğru hesaplanıyor mu? (500 * 0.25 = 125 TL)
- [ ] Müşteri tipi kontrolü çalışıyor mu?

### Test 2: Bakiye API
```bash
# Bakiye sorgulama
curl "http://localhost/gurbuz-oyuncak/backend/api/balance.php?action=balance&user_id=<BAYI_USER_ID>"

# Beklenen Sonuç:
# {"user_id":X,"current_balance":"5000.00","credit_limit":"10000.00",...}
```

**Kontrol Noktaları:**
- [ ] Bakiye bilgisi doğru mu? (5,000 TL)
- [ ] Kredi limiti doğru mu? (10,000 TL)

### Test 3: Ödül API
```bash
# VIP seviyeleri
curl "http://localhost/gurbuz-oyuncak/backend/api/rewards.php?action=vip_levels"

# Puan kuralları
curl "http://localhost/gurbuz-oyuncak/backend/api/rewards.php?action=rules"

# Beklenen Sonuç:
# {"data":[{"id":1,"name":"Standart","min_points":0,...}]}
```

**Kontrol Noktaları:**
- [ ] 5 VIP seviye görünüyor mu?
- [ ] Puan kuralları doğru mu?

### Test 4: Kampanya API
```bash
# Aktif kampanyalar
curl "http://localhost/gurbuz-oyuncak/backend/api/campaigns.php?action=active&customer_type=B2B"

# En iyi kampanya
curl "http://localhost/gurbuz-oyuncak/backend/api/campaigns.php?action=best&cart_total=1500&customer_type=B2B"

# Beklenen Sonuç:
# {"found":true,"campaign":{...},"discount":375}
```

**Kontrol Noktaları:**
- [ ] B2B kampanyası bulunuyor mu?
- [ ] İndirim %25 olarak hesaplanıyor mu? (1500 * 0.25 = 375 TL)

## Admin Panel Testleri

### Test 5: Kupon Yönetimi
1. Admin panele giriş yapın: `/admin/coupons.php`
2. "Yeni Kupon Oluştur" butonuna tıklayın
3. Test kuponu oluşturun:
   - Kod: TEST50
   - İsim: Test Kuponu
   - İndirim Türü: Sabit Tutar
   - İndirim Değeri: 50
   - Min. Sepet: 200
   - Geçerlilik: Bugün - 1 ay sonra
4. Kaydedin

**Kontrol Noktaları:**
- [ ] Modal açılıyor mu?
- [ ] Form gönderiliyor mu?
- [ ] Yeni kupon tabloda görünüyor mu?
- [ ] Düzenle/Sil butonları çalışıyor mu?

### Test 6: Bakiye Yönetimi
1. `/admin/balance.php` sayfasına gidin
2. B2B kullanıcıyı bulun (bayi@test.com)
3. "Yükle" butonuna tıklayın
4. 1,000 TL yükleyin
5. Kaydedin

**Kontrol Noktaları:**
- [ ] Bakiye listesi görünüyor mu?
- [ ] Yükleme modalı açılıyor mu?
- [ ] Yükleme başarılı mı?
- [ ] Yeni bakiye doğru mu? (6,000 TL)

### Test 7: Kampanya Yönetimi
1. `/admin/campaigns_new.php` sayfasına gidin
2. Mevcut kampanyaları görüntüleyin
3. Yeni kampanya oluşturmayı deneyin

**Kontrol Noktaları:**
- [ ] Kampanya listesi görünüyor mu?
- [ ] Filtreler çalışıyor mu?
- [ ] Modal açılıyor mu?

## Frontend Entegrasyon Testleri

### Test 8: Sepet Sayfası (Manuel Test Gerekli)

#### Hazırlık
1. `cart.html` dosyasında script ekleyin (footer'da):
```html
<script src="js/advanced-cart.js"></script>
```

2. `cart-content` div'inin ID'sini kontrol edin

#### Test Senaryosu 1: Kupon Kullanımı
1. Ürünleri sepete ekleyin (toplam 300+ TL)
2. Sepet sayfasına gidin
3. Kupon kodu alanına "YAZ25" yazın
4. "Uygula" butonuna tıklayın
5. İndirim uygulandığını görün

**Beklenen Sonuç:**
- Kupon başarıyla uygulandı mesajı
- %25 indirim sepet özetinde görünmeli
- Toplam tutar düşmeli

**Kontrol Noktaları:**
- [ ] Kupon input alanı var mı?
- [ ] Uygula butonu çalışıyor mu?
- [ ] İndirim hesaplanıyor mu?
- [ ] Sepet özeti güncelleniyor mu?

#### Test Senaryosu 2: B2B Kullanıcı - Bakiye ile Ödeme
1. Bayi kullanıcı ile giriş yapın (bayi@test.com / test123)
2. Sepete 2,000 TL ürün ekleyin
3. Sepet sayfasında:
   - Otomatik %25 B2B kampanyası görmeli (500 TL indirim)
   - "Bakiye ile öde" checkbox'ı olmalı
4. Checkbox'ı işaretleyin
5. Bakiye kullanımı onayını görün

**Beklenen Sonuç:**
- Kampanya otomatik uygulanmalı
- Bakiye checkbox görünmeli
- Toplam: 1,500 TL (2000 - 500)

**Kontrol Noktaları:**
- [ ] B2B kampanyası otomatik uygulanıyor mu?
- [ ] Bakiye checkbox görünüyor mu?
- [ ] Kullanılabilir bakiye gösteriliyor mu?

#### Test Senaryosu 3: Puan Kullanımı
1. Kayıtlı kullanıcı ile giriş yapın
2. Sepete 500 TL ürün ekleyin
3. Puan slider'ını kullanın
4. Puan indirimi hesaplanmalı

**Beklenen Sonuç:**
- Puan slider görünmeli
- Anlık indirim hesabı yapılmalı
- 100 puan = 10 TL indirim

**Kontrol Noktaları:**
- [ ] Puan bakiyesi gösteriliyor mu?
- [ ] Slider çalışıyor mu?
- [ ] İndirim doğru hesaplanıyor mu?

### Test 9: Sipariş Tamamlama (Opsiyonel)
Bu test için `checkout.html` güncellemesi gerekli.

**İleriye Dönük Test:**
1. Tüm indirimleri uygulayın
2. "Sepeti Onayla" butonuna tıklayın
3. Ödeme sayfasına geçin
4. Siparişi tamamlayın

**Veritabanı Kontrolü:**
```sql
-- Son sipariş
SELECT * FROM orders ORDER BY id DESC LIMIT 1;

-- Kupon kullanımı kaydı
SELECT * FROM coupon_usage ORDER BY id DESC LIMIT 1;

-- Bakiye işlemi
SELECT * FROM balance_transactions ORDER BY id DESC LIMIT 1;

-- Puan kazancı
SELECT * FROM reward_transactions WHERE transaction_type='earn' ORDER BY id DESC LIMIT 1;
```

## Hata Senaryoları Testi

### Test 10: Geçersiz Kupon
1. Sepete ürün ekleyin
2. "GECERSIZ123" kodunu girin
3. Hata mesajı almalısınız

**Beklenen Sonuç:**
- "Kupon bulunamadı" hatası

### Test 11: Yetersiz Bakiye
1. B2B kullanıcı ile giriş yapın
2. 10,000 TL üzeri sepet yapın
3. Bakiye ile ödeme seçin
4. Uyarı almalısınız

**Beklenen Sonuç:**
- "Yetersiz bakiye" uyarısı

### Test 12: Minimum Tutar Kontrolü
1. 100 TL sepet yapın
2. "YAZ25" kuponu uygulayın (min. 300 TL gerekli)
3. Hata almalısınız

**Beklenen Sonuç:**
- "Minimum sepet tutarı 300 TL olmalıdır" hatası

## Performans Testleri

### Test 13: API Yanıt Süreleri
```bash
# Kupon API - Hedef: < 100ms
time curl "http://localhost/gurbuz-oyuncak/backend/api/coupons.php?action=validate&code=YAZ25&cart_total=500"

# Kampanya API - Hedef: < 200ms  
time curl "http://localhost/gurbuz-oyuncak/backend/api/campaigns.php?action=best&cart_total=1000&customer_type=B2C"
```

**Kontrol Noktaları:**
- [ ] API yanıt süreleri kabul edilebilir mi?
- [ ] Veritabanı sorguları optimize mi?

## Test Checklist

### Backend ✅
- [ ] Tüm API endpoint'ler çalışıyor
- [ ] Kupon doğrulama mantığı doğru
- [ ] Kampanya öncelik sistemi çalışıyor
- [ ] Bakiye işlemleri doğru kaydediliyor
- [ ] Puan hesaplamaları doğru
- [ ] VIP seviye güncellemesi çalışıyor

### Admin Panel ✅
- [ ] Kupon yönetimi CRUD çalışıyor
- [ ] Bakiye yönetimi çalışıyor
- [ ] Filtreleme ve arama çalışıyor
- [ ] Modal'lar açılıp kapanıyor

### Frontend (Manuel Test Gerekli) 🔄
- [ ] Sepet sayfası yeni özellikleri destekliyor
- [ ] Kupon girişi çalışıyor
- [ ] Puan kullanımı çalışıyor
- [ ] Bakiye seçeneği görünüyor
- [ ] Kampanya otomatik uygulanıyor
- [ ] Tüm indirimler doğru hesaplanıyor

### Veritabanı ✅
- [ ] Demo veriler yüklendi
- [ ] Tüm tablolar oluşturuldu
- [ ] Foreign key'ler doğru
- [ ] İndeksler eklendi

## Sorun Giderme

### Problem: API 500 hatası
**Çözüm:**
1. PHP hata loglarını kontrol edin
2. Veritabanı bağlantısını kontrol edin
3. Class dosyalarının doğru yolda olduğunu doğrulayın

### Problem: Kupon uygulanmıyor
**Çözüm:**
1. Kupon kodunun doğru olduğunu kontrol edin
2. Geçerlilik tarihlerini kontrol edin
3. Minimum tutar şartını kontrol edin
4. Browser console'da hataları kontrol edin

### Problem: Kampanya görünmüyor
**Çözüm:**
1. Kampanyanın aktif olduğunu kontrol edin
2. Tarih aralığını kontrol edin
3. Müşteri tipi eşleşiyor mu kontrol edin
4. Minimum koşulları kontrol edin

## Test Raporu Şablonu

```
# Test Raporu - [Tarih]

## Test Edilen Sistemler
- [ ] Backend API
- [ ] Admin Panel
- [ ] Frontend

## Test Sonuçları
### Başarılı Testler
- ...

### Başarısız Testler
- ...

### Bulunan Hatalar
1. ...
2. ...

## Öneriler
- ...

## Sonuç
[ ] Sistem üretime hazır
[ ] Düzeltme gerekli
```

## Sonraki Adımlar

1. **Frontend Entegrasyonu Tamamlama**
   - cart.html güncelleme
   - checkout.html entegrasyonu
   - account.html kullanıcı paneli

2. **Ek Özellikler**
   - Email bildirimleri
   - Puan sona erme cron job
   - Raporlama dashboardları

3. **Güvenlik Testleri**
   - SQL injection testleri
   - XSS testleri
   - Session hijacking testleri

4. **Load Testleri**
   - Apache Bench ile load testi
   - Concurrent user simülasyonu
   - Database performans analizi
