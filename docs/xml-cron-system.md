# XML Otomatik Çekme Cron Job Sistemi

## Genel Bakış

Gürbüz Oyuncak sistemi için geliştirilmiş otomatik XML ürün çekme ve işleme sistemi. Bu sistem, belirli zamanlarda otomatik olarak XML kaynaklarından ürün bilgilerini çekerek veritabanını güncel tutar.

## Sistem Bileşenleri

### 1. Veritabanı Tabloları

#### `xml_scheduled_tasks`
Planlanmış XML çekme görevlerini saklar:

```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) NOT NULL (Görev adı)
- xml_url: TEXT NOT NULL (Çekilecek XML URL'i)
- schedule_cron: VARCHAR(50) NOT NULL (Cron ifadesi)
- is_active: BOOLEAN DEFAULT true (Aktiflik durumu)
- last_run: TIMESTAMP WITH TIME ZONE (Son çalışma zamanı)
- next_run: TIMESTAMP WITH TIME ZONE (Bir sonraki çalışma zamanı)
- status: VARCHAR(20) (pending, running, success, failed, disabled)
- retry_count: INTEGER DEFAULT 0 (Retry sayısı)
- max_retries: INTEGER DEFAULT 3 (Maksimum retry)
- last_error: TEXT (Son hata mesajı)
- created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

#### `xml_pull_history`
XML çekme işlemlerinin geçmişini saklar:

```sql
- id: SERIAL PRIMARY KEY
- task_id: INTEGER REFERENCES xml_scheduled_tasks(id) (İlişkili görev)
- run_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW() (Çalışma zamanı)
- status: VARCHAR(20) (running, success, failed)
- products_processed: INTEGER DEFAULT 0 (İşlenen ürün sayısı)
- products_imported: INTEGER DEFAULT 0 (Başarıyla eklenen ürün sayısı)
- products_failed: INTEGER DEFAULT 0 (Başarısız ürün sayısı)
- error_message: TEXT (Hata mesajı)
- execution_time_ms: INTEGER (Çalışma süresi - milisaniye)
- response_data: JSONB DEFAULT '{}'::jsonb (Detaylı yanıt verisi)
```

### 2. Edge Functions

#### `xml-cron-job`
**URL:** `https://nxtfpceqjpyexmiuecam.supabase.co/functions/v1/xml-cron-job`
**Tip:** Cron
**Amaç:** Zamanlanmış XML çekme işlemlerini gerçekleştirir

**Özellikler:**
- Tüm aktif scheduled task'ları otomatik olarak işler
- XML'leri çeker ve parse eder
- Ürün veritabanını günceller
- Retry mekanizması ile başarısız işlemleri yeniden dener
- Hata yönetimi ve logging sistemi

**Cron Syntax:** `0 2 * * *` (Her gün 02:00'da çalışır)

#### `xml-admin`
**URL:** `https://nxtfpceqjpyexmiuecam.supabase.co/functions/v1/xml-admin`
**Tip:** Normal
**Amaç:** Admin paneli için XML task yönetimi

**Endpoint'ler:**
- `GET`: Tüm task'ları listele
- `POST`: Yeni task oluştur
- `PATCH?id={task_id}`: Task güncelle
- `DELETE?id={task_id}`: Task sil

## Cron İfadeleri

### Desteklenen Formatlar
- `0 2 * * *` - Her gün 02:00
- `0 9 * * *` - Her gün 09:00
- `0 2 * * 1` - Her hafta pazartesi 02:00

### Cron Syntax Formatı
```
dakika saat gün ay gün_hafta
0    2    *   *    *     (Her gün 02:00)
```

## XML Format Gereksinimleri

### Beklenen XML Yapısı
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Products>
  <Product>
    <Product_code>PC001</Product_code>
    <Name>Ürün Adı</Name>
    <Price>99.99</Price>
    <Stock>10</Stock>
    <Brand>Marka Adı</Brand>
    <category>Kategori</category>
    <subCategory>Alt Kategori</subCategory>
    <Image1>http://example.com/image1.jpg</Image1>
    <Image2>http://example.com/image2.jpg</Image2>
    <Image3>http://example.com/image3.jpg</Image3>
    <Image4>http://example.com/image4.jpg</Image4>
    <Barcode>123456789</Barcode>
    <mpn>MPN123</mpn>
    <rafno>RAF001</rafno>
    <width>10</width>
    <height>20</height>
    <depth>5</depth>
    <desi>2</desi>
    <agirlik>100</agirlik>
    <urun_mensei>Türkiye</urun_mensei>
    <Tax>20</Tax>
  </Product>
</Products>
```

## Hata Yönetimi

### Retry Mekanizması
- Varsayılan 3 retry denemesi
- Her retry başarısız olursa görev "failed" durumuna geçer
- Başarılı çalışma durumunda retry sayısı sıfırlanır

### Hata Senaryoları
1. **XML Çekme Hatası**: HTTP 404, 500 vb. durumlar
2. **XML Parse Hatası**: Geçersiz XML formatı
3. **Veritabanı Hatası**: Ürün ekleme/güncelleme başarısızlıkları
4. **Network Timeout**: Çok büyük XML dosyaları

## Admin Paneli Kullanımı

### Yetkilendirme
Sadece `profiles.role = 'admin'` olan kullanıcılar erişebilir.

### İşlemler

#### 1. Yeni Task Oluşturma
```javascript
POST /functions/v1/xml-admin
{
  "name": "Tedarikçi A Günlük Ürünler",
  "xml_url": "https://tedarikci-a.com/xml/daily.xml",
  "schedule_cron": "0 2 * * *",
  "is_active": true
}
```

#### 2. Task Listeleme
```javascript
GET /functions/v1/xml-admin
```

#### 3. Task Güncelleme
```javascript
PATCH /functions/v1/xml-admin?id=1
{
  "name": "Yeni Görev Adı",
  "schedule_cron": "0 9 * * *",
  "is_active": false,
  "max_retries": 5
}
```

#### 4. Task Silme
```javascript
DELETE /functions/v1/xml-admin?id=1
```

## Monitoring ve Loglar

### Geçmiş Takibi
Her çekme işlemi `xml_pull_history` tablosunda saklanır:
- Çalışma zamanı
- İşlenen ürün sayısı
- Başarı/başarısızlık durumu
- Hata mesajları
- Çalışma süresi

### Durum Takibi
- `pending`: Beklemede
- `running`: Çalışıyor
- `success`: Başarılı
- `failed`: Başarısız
- `disabled`: Devre dışı

## Güvenlik

### RLS Policies
```sql
-- Admin kullanıcılar tüm işlemleri yapabilir
CREATE POLICY "Admin'lar tüm scheduled task'ları yönetebilir"
    ON xml_scheduled_tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Service role tam erişim (cron jobs için)
CREATE POLICY "Service role her şeyi yapabilir"
    ON xml_scheduled_tasks FOR ALL
    TO service_role
    USING (true);
```

### Başlangıç Ayarları

#### Admin Kullanıcısı Oluşturma
```sql
-- Manuel olarak bir kullanıcıyı admin yap
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = 'kullanici-uuid';
```

## Cron Job Yönetimi

### Aktif Cron Job'lar
```bash
# Tüm cron job'ları listele
SELECT * FROM cron.job;

# Belirli job'ı durdur
SELECT cron.unschedule('xml-cron-job_invoke');

# Yeni job oluştur (manuel)
SELECT cron.schedule(
    'xml-cron-job_invoke',
    '0 2 * * *',
    'CALL xml_cron_job_71092f94()'
);
```

## Performans Optimizasyonları

### XML İşleme
- Regex-based XML parser (DOMParser yerine)
- Büyük dosyalar için timeout koruması
- Batch processing ile bellek kullanımını optimize etme

### Veritabanı
- UPSERT operations (var olan ürünleri güncelleme)
- Index'li alanlarda arama
- Bulk insert operations

### Network
- User-Agent header'ı
- Timeout koruması
- Retry logic with exponential backoff

## Bakım ve Monitoring

### Günlük Kontroller
1. Cron job'ların çalışıp çalışmadığını kontrol et
2. Hata log'larını incele
3. Yavaş çalışan task'ları tespit et
4. XML kaynaklarının erişilebilirliğini kontrol et

### Hata Giderme
```sql
-- Son 24 saat içindeki başarısız işlemler
SELECT * FROM xml_pull_history 
WHERE status = 'failed' 
AND run_at > NOW() - INTERVAL '24 hours';

-- En çok hata veren task'lar
SELECT task_id, name, COUNT(*) as error_count
FROM xml_pull_history h
JOIN xml_scheduled_tasks t ON t.id = h.task_id
WHERE h.status = 'failed'
GROUP BY task_id, name
ORDER BY error_count DESC;
```

## Gelecek Geliştirmeler

### Özellikler
1. **Webhook Notification**: Başarısız işlemler için bildirim
2. **XML Format Validation**: Şema doğrulama
3. **Partial Import**: Sadece değişen ürünleri güncelleme
4. **Smart Retry**: Akıllı yeniden deneme stratejisi
5. **Rate Limiting**: XML kaynaklarına yük bindirmeyi önleme

### Monitoring
1. Grafana dashboard entegrasyonu
2. Slack/Discord bildirimleri
3. Email alerts sistemi
4. Performance metrics

## Örnek Kullanım Senaryoları

### Senaryo 1: Tedarikçi XML Entegrasyonu
```javascript
// Günlük 02:00'da tedarikçi XML'ini çek
{
  "name": "Tedarikçi A - Günlük Ürün Güncellemesi",
  "xml_url": "https://supplier-a.com/api/products/daily.xml",
  "schedule_cron": "0 2 * * *"
}
```

### Senaryo 2: Haftalık Toplu Güncelleme
```javascript
// Haftalık pazartesi 02:00'da toplu güncelleme
{
  "name": "Tüm Tedarikçiler - Haftalık Sync",
  "xml_url": "https://central-supplier.com/weekly-full-export.xml",
  "schedule_cron": "0 2 * * 1"
}
```

### Senaryo 3: Yakın Stok Uyarısı
```javascript
// Günde 3 kez stok kontrolü
{
  "name": "Stok Uyarı Sistemi",
  "xml_url": "https://inventory-system.com/api/low-stock.xml",
  "schedule_cron": "0 8,14,20 * * *"
}
```

## Teknik Detaylar

### Environment Variables
```bash
SUPABASE_URL=https://nxtfpceqjpyexmiuecam.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Extensions
- `pg_cron`: Zamanlanmış görevler için
- `pg_net`: HTTP istekleri için

### Supabase Edge Function Limits
- 1000ms - 15000ms execution time limit
- 50MB memory limit
- 10MB payload limit

---

**Son Güncelleme:** 2025-11-01
**Versiyon:** 1.0.0
**Sistem Durumu:** Aktif ve Çalışır Durumda