# Bildirim ve Raporlama Sistemi Dokümantasyonu

## 📋 Genel Bakış

Gürbüz Oyuncak sistemi için geliştirilen kapsamlı Bildirim ve Raporlama Sistemi, e-ticaret operasyonlarınızı otomatikleştiren ve analitik değerler sunan bir modüldür.

## ✨ Özellikler

### 🔔 Bildirim Sistemi
- **Real-time bildirimler** - Anlık sistem bildirimleri
- **Email bildirimleri** - Otomatik email gönderimleri
- **Fiyat düşüş uyarıları** - Kullanıcıların takip ettiği ürünlerin fiyat düşüş bildirimleri
- **Stok uyarıları** - Düşük stok ve tükenme bildirimleri
- **Sistem hataları** - Kritik sistem durumları için bildirimler

### 📊 Raporlama Sistemi
- **Satış raporları** - Detaylı satış analizleri
- **Stok raporları** - Stok durumu ve hareket analizleri
- **Ürün performans raporları** - Ürün bazlı satış analizleri
- **Interaktif dashboard** - Grafikli ve görsel raporlar
- **CSV/XML Export** - Veri dışa aktarma özelliği

### 📧 Email Yönetimi
- **Email şablonları** - Özelleştirilebilir HTML email şablonları
- **Dinamik değişkenler** - Kişiselleştirilmiş email içerikleri
- **Gönderim logları** - Email gönderim geçmişi ve durum takibi
- **Test gönderimi** - Email şablonlarını test etme imkanı

### ⏰ Otomatik Sistemler
- **Zamanlanmış raporlar** - Günlük/haftalık/aylık otomatik rapor gönderimi
- **Cron job'lar** - Otomatik bildirim ve rapor işleme
- **Fiyat takibi** - Otomatik fiyat değişiklik kontrolü

## 🗄️ Database Yapısı

### Ana Tablolar

#### `email_templates`
Email şablonlarını saklayan tablo
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR) - Şablon adı
- subject (VARCHAR) - Email konusu
- html_content (TEXT) - HTML email içeriği
- template_type (VARCHAR) - Şablon türü
- variables (JSONB) - Değişkenler
- is_active (BOOLEAN) - Aktiflik durumu
- created_at, updated_at (TIMESTAMP)
```

#### `email_logs`
Email gönderim loglarını saklayan tablo
```sql
- id (SERIAL PRIMARY KEY)
- recipient_email (VARCHAR) - Alıcı email
- template_id (INTEGER) - Şablon ID
- subject (VARCHAR) - Email konusu
- sent_at (TIMESTAMP) - Gönderim zamanı
- status (VARCHAR) - Durum (sent/failed/pending)
- error_message (TEXT) - Hata mesajı
- retry_count (INTEGER) - Tekrar deneme sayısı
- metadata (JSONB) - Ek bilgiler
```

#### `price_alerts`
Fiyat düşüş uyarılarını saklayan tablo
```sql
- id (SERIAL PRIMARY KEY)
- user_id (UUID) - Kullanıcı ID
- product_id (INTEGER) - Ürün ID
- old_price (DECIMAL) - Eski fiyat
- new_price (DECIMAL) - Yeni fiyat
- alert_sent (BOOLEAN) - Bildirim gönderildi mi
- notification_sent_at (TIMESTAMP) - Bildirim zamanı
```

#### `notification_settings`
Kullanıcı bildirim ayarları
```sql
- id (SERIAL PRIMARY KEY)
- user_id (UUID) - Kullanıcı ID
- email_notifications (BOOLEAN) - Email bildirimleri
- stock_alerts (BOOLEAN) - Stok uyarıları
- price_drop_alerts (BOOLEAN) - Fiyat düşüş uyarıları
- sale_reports (BOOLEAN) - Satış raporları
- daily_reports (BOOLEAN) - Günlük raporlar
- weekly_reports (BOOLEAN) - Haftalık raporlar
```

#### `report_schedules`
Zamanlanmış rapor planları
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR) - Plan adı
- report_type (VARCHAR) - Rapor türü
- frequency (VARCHAR) - Frekans (daily/weekly/monthly)
- recipients (JSONB) - Alıcı listesi
- last_sent (TIMESTAMP) - Son gönderim
- next_send (TIMESTAMP) - Sonraki gönderim
- is_active (BOOLEAN) - Aktiflik durumu
- filters (JSONB) - Rapor filtreleri
```

#### `notification_history`
Bildirim geçmişi
```sql
- id (SERIAL PRIMARY KEY)
- user_id (UUID) - Kullanıcı ID
- type (VARCHAR) - Bildirim türü
- title (VARCHAR) - Başlık
- message (TEXT) - Mesaj
- is_read (BOOLEAN) - Okundu durumu
- metadata (JSONB) - Ek bilgiler
```

## 🚀 Edge Functions

### 1. `send-email`
Genel email gönderim servisi
- **URL**: `/functions/v1/send-email`
- **Method**: POST
- **Parametreler**:
  ```json
  {
    "to": "email@example.com",
    "subject": "Email Konusu",
    "htmlContent": "HTML İçerik",
    "templateId": 1,
    "variables": {"key": "value"},
    "metadata": {"type": "notification"}
  }
  ```

### 2. `process-price-alerts`
Fiyat düşüş bildirimlerini işler
- **URL**: `/functions/v1/process-price-alerts`
- **Method**: POST
- **Frekans**: 6 saatte bir çalışır (0 */6 * * *)

### 3. `generate-reports`
Rapor üretimi
- **URL**: `/functions/v1/generate-reports`
- **Method**: POST
- **Parametreler**:
  ```json
  {
    "reportType": "sales|stock|products",
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-31",
    "filters": {}
  }
  ```

### 4. `send-scheduled-reports`
Zamanlanmış rapor gönderimi
- **URL**: `/functions/v1/send-scheduled-reports`
- **Method**: POST
- **Frekans**: Her gün saat 08:00 (0 8 * * *)

## 🖥️ Frontend Sayfaları

### 1. Admin Rapor Sayfası (`/admin/reports`)
- **Özellikler**:
  - İnteraktif rapor oluşturma
  - Grafikli dashboard
  - CSV export
  - Email gönderimi
  - Tarih filtreleme
  - Çoklu rapor türü desteği

- **Bileşenler**:
  - Rapor parametreleri
  - İstatistik kartları
  - Detaylı veri tabloları
  - Export seçenekleri

### 2. Email Şablonları (`/admin/email-templates`)
- **Özellikler**:
  - Şablon CRUD işlemleri
  - HTML editör
  - Değişken yönetimi
  - Test email gönderimi
  - Şablon önizleme
  - Gönderim logları

- **Desteklenen Şablon Türleri**:
  - Stok uyarısı
  - Fiyat düşüş
  - Günlük rapor
  - Haftalık rapor
  - Sistem hatası
  - Genel

### 3. Bildirim Merkezi (`/admin/notification-center`)
- **Özellikler**:
  - Bildirim yönetimi
  - Fiyat uyarıları listesi
  - Email logları
  - Rapor planları yönetimi
  - Bildirim ayarları
  - Toplu işlemler

- **Tablar**:
  - Bildirimler
  - Fiyat Uyarıları
  - Email Logları
  - Rapor Planları

## 🔧 Kullanım Kılavuzu

### Email Şablonu Oluşturma

1. **Admin Panel** → **Email Şablonları** → **Yeni Şablon**
2. **Şablon Bilgileri**:
   - Ad girin
   - Tür seçin (stok_alert, price_drop, daily_report, vb.)
   - Konu belirleyin
   - HTML içerik yazın
   - Değişkenler tanımlayın

3. **Değişken Kullanımı**:
   ```html
   <h1>Merhaba {{user_name}}</h1>
   <p>{{product_name}} ürünü ₺{{price}} fiyatına düştü!</p>
   ```

4. **Test Gönderimi**:
   - Test email adresi girin
   - Değişken değerleri JSON formatında girin
   - Gönder butonuna tıklayın

### Rapor Oluşturma

1. **Admin Panel** → **Raporlar**
2. **Rapor Türü** seçin (Satış, Stok, Ürün)
3. **Tarih Aralığı** belirleyin
4. **Rapor Oluştur** butonuna tıklayın
5. **Export** seçeneklerini kullanın:
   - CSV Download
   - Email Gönder

### Fiyat Uyarısı Sistemi

1. **Otomatik Çalışma**: Sistem her 6 saatte bir fiyatları kontrol eder
2. **Manuel Bildirim**: Kullanıcılar favorilerine ekledikleri ürünler için otomatik uyarı alır
3. **Bildirim İçeriği**: Fiyat düşüş miktarı ve yüzdesi

### Zamanlanmış Raporlar

1. **Bildirim Merkezi** → **Rapor Planları** → **Yeni Plan**
2. **Plan Ayarları**:
   - Plan adı
   - Rapor türü
   - Frekans (günlük/haftalık/aylık)
   - Alıcı listesi
   - Aktiflik durumu

3. **Otomatik Gönderim**: Sistem belirlenen zamanlarda otomatik rapor oluşturup email gönderir

## 🎯 Özel Özellikler

### Favori Ürün Fiyat Düşüş Bildirimi
- Kullanıcılar ürünleri favorilerine ekleyebilir
- Fiyat düştüğünde otomatik bildirim gönderilir
- Email + in-app bildirim desteği

### Real-time Bildirimler
- WebSocket bağlantısı ile anlık bildirimler
- Admin panelinde badge sayacı
- Otomatik yenileme

### Akıllı Email İçeriği
- Kişiselleştirilmiş email şablonları
- Dinamik değişken desteği
- Responsive HTML tasarım
- Template önizleme

### Gelişmiş Raporlama
- Çoklu veri kaynağı entegrasyonu
- İnteraktif grafikler
- Detaylı metrikler
- Karşılaştırmalı analiz

## 🔒 Güvenlik

### Row Level Security (RLS)
- Tüm tablolarda RLS politikaları aktif
- Admin yetkisi kontrolü
- Kullanıcı veri izolasyonu

### API Güvenliği
- Supabase auth token doğrulama
- CORS yapılandırması
- Input validation

### Email Güvenliği
- Email adresi doğrulama
- HTML sanitization
- Rate limiting

## 📊 Performans Optimizasyonları

### Database İndeksleri
- Email logları için hızlı sorgu
- Bildirimler için tarih bazlı indeks
- Fiyat uyarıları için composite indeks

### Caching Stratejisi
- Rapor sonuçları geçici saklama
- Email template cache
- Notification cache

### Background Processing
- Cron job'larla otomatik işleme
- Asenkron email gönderimi
- Queue sistemi hazırlığı

## 🔄 Cron Job Yapılandırması

### Aktif Cron Job'lar

1. **Günlük Raporlar** (Job ID: 6)
   - Cron: `0 8 * * *` (Her gün 08:00)
   - Function: `send-scheduled-reports`
   - Amaç: Zamanlanmış raporları gönderir

2. **Fiyat Düşüş Kontrolü** (Job ID: 7)
   - Cron: `0 */6 * * *` (6 saatte bir)
   - Function: `process-price-alerts`
   - Amaç: Fiyat değişikliklerini kontrol eder

### Cron Job Yönetimi
```bash
# Aktif job'ları listele
GET /functions/v1/list_background_cron_jobs

# Job durdurma
POST /functions/v1/offline_background_cron_job
{
  "cron_job_id": 6
}
```

## 🚀 Deployment Bilgileri

### Edge Functions
Tüm edge function'lar Supabase platformunda deploy edilmiştir:

1. **send-email**: Email gönderim servisi
   - Status: ACTIVE
   - Version: 1

2. **process-price-alerts**: Fiyat düşüş işleme
   - Status: ACTIVE
   - Version: 1

3. **generate-reports**: Rapor üretimi
   - Status: ACTIVE
   - Version: 1

4. **send-scheduled-reports**: Zamanlanmış raporlar
   - Status: ACTIVE
   - Version: 1

### Environment Variables
```env
SUPABASE_URL=https://nxtfpceqjpyexmiuecam.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **Email Gönderilmiyor**
   - Email loglarını kontrol edin
   - SMTP yapılandırmasını kontrol edin
   - Error message'ları inceleyin

2. **Rapor Oluşturulmuyor**
   - Database bağlantısını kontrol edin
   - Date range'leri kontrol edin
   - Function loglarını inceleyin

3. **Cron Job Çalışmıyor**
   - Job status'unu kontrol edin
   - Function URL'lerini doğrulayın
   - Database trigger'larını kontrol edin

### Log Kontrolü
```sql
-- Email logları
SELECT * FROM email_logs WHERE status = 'failed';

-- Cron job geçmişi
SELECT * FROM cron.job_run_details ORDER BY run_time DESC;

-- Bildirim geçmişi
SELECT * FROM notification_history ORDER BY created_at DESC;
```

## 📈 Gelecek Geliştirmeler

### Planlanan Özellikler
- [ ] Push notification desteği
- [ ] SMS bildirim entegrasyonu
- [ ] Advanced analytics dashboard
- [ ] Machine learning ile tahminleme
- [ ] Multi-language email templates
- [ ] A/B testing for email campaigns
- [ ] Real-time collaboration on reports
- [ ] Mobile app push notifications

### Performans İyileştirmeleri
- [ ] Redis caching implementasyonu
- [ ] Database query optimizasyonu
- [ ] CDN entegrasyonu
- [ ] Load balancing

## 📞 Destek

Herhangi bir sorun veya soru için:
- Admin panel üzerinden sistem loglarını kontrol edin
- Email template'leri test ederek doğrulayın
- Cron job'ların düzgün çalıştığından emin olun
- Database bağlantılarını kontrol edin

---

**Sistem Versiyonu**: 1.0.0  
**Son Güncelleme**: 01.11.2025  
**Geliştirici**: MiniMax Agent  
**Durum**: Aktif ✅