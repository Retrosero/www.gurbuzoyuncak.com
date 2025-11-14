# ÜYE FAVORİLERİ SİSTEMİ DOKÜMANTASYONU

## 📋 GENEL BAKIŞ

Gürbüz Oyuncak sistemine entegre edilen **ÜYE FAVORİLERİ SİSTEMİ**, kullanıcıların beğendiği ürünleri favorilere eklemesine, fiyat ve stok değişikliklerini takip etmesine olanak tanıyan kapsamlı bir özelliktir.

## 🎯 SİSTEM ÖZELLİKLERİ

### ✅ Temel Özellikler
- **Favori Ürün Ekleme/Çıkarma**: Ürün kartlarında kalp ikonu ile tek tık favorileme
- **Favoriler Sayfası**: `/favoriler` - Kullanıcının favori ürünlerinin görüntülenmesi
- **Toplu İşlemler**: Seçili favorileri toplu sepete ekleme
- **Fiyat Takibi**: Favori ürünlerde fiyat değişikliği takibi
- **Stok Takibi**: Favori ürünlerde stok durumu takibi

### 🆕 Gelişmiş Özellikler
- **Email Bildirimleri**: Fiyat düştüğünde veya stok geldiğinde otomatik email
- **Real-time Updates**: Supabase Realtime ile anlık favori sayısı güncellemesi
- **Fiyat Geçmişi**: Favori ürünlerin fiyat değişim geçmişi
- **Stok Geçmişi**: Favori ürünlerin stok değişim geçmişi
- **Akıllı Filtreleme**: Kategori, marka, fiyat aralığına göre filtreleme
- **Sıralama Seçenekleri**: Tarih, fiyat, alfabetik sıralama

## 🏗️ TEKNİK MİMARİ

### Frontend Yapısı
```
src/
├── components/
│   ├── ProductCard.tsx          # Favori butonu ile güncellendi
│   └── Header.tsx               # Favori sayısı badge'i eklendi
├── contexts/
│   └── FavoritesContext.tsx     # Favori işlemleri context'i
└── pages/
    └── FavoritesPage.tsx        # Ana favori sayfası
```

### Backend Yapısı
```
supabase/
├── functions/
│   ├── favorite-price-tracker/  # Fiyat takip servisi
│   └── favorite-stock-tracker/  # Stok takip servisi
└── migrations/
    └── create_user_favorites_system.sql
```

## 📊 DATABASE YAPISI

### user_favorites Tablosu
```sql
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified_price_change BOOLEAN DEFAULT false,
    notified_stock_change BOOLEAN DEFAULT false,
    price_change_notified_at TIMESTAMP WITH TIME ZONE,
    stock_change_notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

### favorite_price_history Tablosu
```sql
CREATE TABLE favorite_price_history (
    id SERIAL PRIMARY KEY,
    favorite_id INTEGER REFERENCES user_favorites(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_type VARCHAR(20) CHECK (change_type IN ('increase', 'decrease')),
    change_percentage DECIMAL(5,2),
    old_stock INTEGER,
    new_stock INTEGER,
    notified BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### favorite_stock_alerts Tablosu
```sql
CREATE TABLE favorite_stock_alerts (
    id SERIAL PRIMARY KEY,
    favorite_id INTEGER REFERENCES user_favorites(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    previous_stock INTEGER,
    current_stock INTEGER,
    alert_type VARCHAR(20) CHECK (alert_type IN ('restocked', 'low_stock', 'out_of_stock')),
    message TEXT,
    notified BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 KULLANIM KILAVUZU

### Kullanıcı Tarafı

#### Favori Ekleme/Çıkarma
1. **Ürün Kartında**: Kalp ikonuna tıklayarak favorilere ekle/çıkar
2. **Ürün Detayında**: "Favorilere Ekle" butonunu kullan
3. **Header'da**: Favoriler ikonuna tıklayarak favori sayfasına git

#### Favoriler Sayfası Kullanımı
- **URL**: `/favoriler`
- **Özellikler**:
  - Grid/Liste görünüm modları
  - Sıralama seçenekleri (Tarih, Fiyat, İsim)
  - Kategori filtreleme
  - Toplu sepete ekleme
  - Fiyat değişim göstergeleri
  - Stok durumu bildirimleri

### Admin Tarafı

#### Cron Job'lar
1. **Fiyat Takibi**: Her 6 saatte bir çalışır
   - Cron ID: 8
   - Expression: `0 */6 * * *`

2. **Stok Takibi**: Her 2 saatte bir çalışır
   - Cron ID: 9
   - Expression: `0 */2 * * *`

#### Edge Functions
- **favorite-price-tracker**: Fiyat değişikliklerini tespit eder ve bildirim gönderir
- **favorite-stock-tracker**: Stok değişikliklerini tespit eder ve bildirim gönderir

## 📧 EMAIL BİLDİRİM SİSTEMİ

### Fiyat Düşüş Bildirimi
```html
Konu: 🎉 [Ürün Adı] fiyatı düştü!

Email içeriği:
- Ürün adı ve görseli
- Eski fiyat (üstü çizili)
- Yeni fiyat (vurgulanmış)
- Değişim yüzdesi
- Direkt ürün linki
```

### Stok Geldi Bildirimi
```html
Konu: 🎉 [Ürün Adı] stokta!

Email içeriği:
- Ürün adı ve görseli
- Mevcut stok adedi
- Önceki stok durumu
- Direkt ürün linki
```

### Stok Azaldı/Uyarı Bildirimi
```html
Konu: ⚠️ [Ürün Adı] az kaldı!

Email içeriği:
- Ürün adı ve görseli
- Kalan stok adedi
- Aciliyet mesajı
- Direkt ürün linki
```

## 🎨 UI/UX ÖZELLİKLERİ

### Responsive Tasarım
- **Desktop**: Grid görünüm, çoklu filtre seçenekleri
- **Mobile**: Liste görünüm, temiz arayüz

### Görsel Göstergeler
- **Kalp İkonu**: Dolu/kırmızı (favoride), boş/gri (normal)
- **Fiyat Değişimi**: 
  - 📉 Yeşil (fiyat düştü)
  - 📈 Kırmızı (fiyat arttı)
- **Stok Durumu**:
  - 🎉 Yeşil (stok geldi)
  - ⚠️ Sarı (az kaldı)
  - ❌ Kırmızı (stok bitti)

### İnteraktif Özellikler
- **Hover Efektleri**: Kartlar ve butonlar
- **Loading States**: İşlem sırasında yükleme göstergeleri
- **Toast Bildirimleri**: İşlem sonucu bildirimleri
- **Real-time Updates**: Anlık sayı güncellemeleri

## ⚙️ GÜVENLİK VE PERFORMANS

### RLS (Row Level Security)
- Kullanıcılar sadece kendi favorilerini görüntüleyebilir
- Kullanıcılar sadece kendi favorilerini yönetebilir
- Fiyat ve stok geçmişi sadece kendi favorileri için erişilebilir

### Performans Optimizasyonları
- **Index'ler**: Sık kullanılan sorgular için optimize edilmiş indeksler
- **Real-time Subscriptions**: Sadece gerekli event'lere abonelik
- **Batch Operations**: Toplu işlemler için optimize edilmiş sorgular
- **Caching**: Favori sayısı ve durumu için cache'leme

### Cron Job Optimizasyonları
- **Akıllı Filtreleme**: Sadece bildirilmemiş değişiklikleri işler
- **Batch Processing**: Tek seferde çoklu ürün işleme
- **Error Handling**: Hata durumlarında graceful degradation
- **Rate Limiting**: Aşırı email gönderimini önleme

## 🔍 MONİTORING VE LOGGING

### Loglar
- Favori ekleme/çıkarma işlemleri
- Fiyat değişikliği tespitleri
- Stok değişikliği tespitleri
- Email bildirimi gönderimleri
- Hata durumları ve çözümleri

### Metrics
- Toplam favori sayısı
- Aktif kullanıcılar
- Günlük favori ekleme/çıkarma
- Bildirim gönderim oranları
- Email açılma oranları

## 🚀 GELECEKTEKİ GELİŞTİRMELER

### Planlanan Özellikler
1. **Favori Listeleri**: Kullanıcıların birden fazla favori listesi oluşturması
2. **Paylaşma**: Favori listelerini paylaşma özelliği
3. **Push Notifications**: Web push bildirimleri
4. **Favori İstatistikleri**: Kullanıcıların favori alışkanlıkları analizi
5. **AI Önerileri**: Favorilere dayalı ürün önerileri
6. **Wearable Entegrasyonu**: Apple Watch/Android Wear bildirimleri

### Teknik İyileştirmeler
1. **GraphQL API**: Daha esnek veri sorgulama
2. **Microservice Architecture**: Bağımsız servis mimarisi
3. **Machine Learning**: Fiyat tahminleri ve trend analizi
4. **Advanced Caching**: Redis tabanlı cache sistemi
5. **CDN Integration**: Global performans optimizasyonu

## 🐛 TROUBLESHOOTING

### Yaygın Problemler

#### Favori Butonu Çalışmıyor
- **Çözüm**: Kullanıcı giriş kontrolü
- **Kontrol**: Console'da hata mesajları
- **Debug**: Network tab'inde API istekleri

#### Email Bildirimleri Gelmiyor
- **Çözüm**: Cron job'ların çalışma durumu
- **Kontrol**: Edge function logs
- **Debug**: Email service configuration

#### Favoriler Sayfası Yavaş
- **Çözüm**: Query optimization
- **Kontrol**: Database index'leri
- **Debug**: Explain plan analizi

#### Real-time Updates Çalışmıyor
- **Çözüm**: WebSocket bağlantısı
- **Kontrol**: Supabase Realtime status
- **Debug**: Browser console network tab

## 📞 DESTEK VE İLETİŞİM

### Teknik Destek
- **GitHub Issues**: [Repository Issues]
- **Documentation**: [Internal Wiki]
- **Monitoring**: [Dashboard URL]

### Sistem Durumu
- **Status Page**: [Status Page URL]
- **Uptime**: 99.9% target
- **Response Time**: <200ms average
- **Success Rate**: >99.5% target

---

**Sistem Versiyonu**: 1.0.0  
**Son Güncelleme**: 01 Kasım 2025  
**Geliştirici**: Gürbüz Oyuncak Dev Team  
**Dokümantasyon Durumu**: ✅ Tamamlandı