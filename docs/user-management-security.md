# Kullanıcı Yönetimi ve Güvenlik Sistemi Dokümantasyonu

## Genel Bakış

Gürbüz Oyuncak sistemine entegre edilen kapsamlı kullanıcı yönetimi ve güvenlik sistemi, sistem güvenliğini artırmak ve kullanıcı yönetimini optimize etmek için tasarlanmıştır.

## Özellikler

### 🔐 Gelişmiş Kullanıcı Rolleri
- **admin**: Tam yetki, tüm sistem işlemleri
- **moderator**: Ürün/kategori yönetimi, sipariş takibi
- **editor**: İçerik düzenleme, ürün bilgi güncelleme
- **bayi**: Bayi paneli erişimi, kendi siparişlerini takip
- **user**: Normal kullanıcı, temel işlemler

### 📊 İşlem Log Sistemi
- Kim, ne zaman, ne yaptı kayıt altında
- Detaylı aktivite takibi
- İşlem geçmişi ve audit trail
- Gerçek zamanlı log takibi

### 🛡️ Güvenlik Audit Trail
- Başarısız giriş denemeleri takibi
- Şüpheli aktivite tespiti
- Hesap kilitleme sistemi
- Güvenlik olayları kategorilendirme

### 💾 Otomatik Backup Sistemi
- Planlı yedekleme (günlük/haftalık/aylık)
- Manuel yedekleme başlatma
- Yedekleme durumu takibi
- Otomatik temizlik sistemi

### 🔍 Giriş Logları ve Güvenlik Uyarıları
- Başarısız giriş takibi
- IP tabanlı güvenlik kontrolü
- Otomatik güvenlik uyarıları
- Session yönetimi

## Teknik Implementasyon

### Database Yapısı

#### Profiles Tablosu Genişletmeleri
```sql
ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN account_locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

#### Yeni Tablolar

**user_activities**
```sql
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**security_logs**
```sql
CREATE TABLE security_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'low',
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**user_sessions**
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**backup_schedules**
```sql
CREATE TABLE backup_schedules (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    last_backup TIMESTAMP WITH TIME ZONE,
    next_backup TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    backup_path TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Edge Functions

#### 1. activity-logger
- **URL**: `/functions/v1/activity-logger`
- **Amaç**: Kullanıcı aktivitelerini loglamak
- **Özellikler**:
  - Otomatik aktivite kaydı
  - IP ve user agent takibi
  - Detaylı işlem bilgileri
  - Rol bazlı erişim kontrolü

#### 2. security-monitor
- **URL**: `/functions/v1/security-monitor`
- **Amaç**: Güvenlik olaylarını izlemek ve yönetmek
- **Özellikler**:
  - Başarısız giriş tespiti
  - Hesap kilitleme sistemi
  - Güvenlik seviye kategorilendirme
  - Otomatik uyarı sistemi

#### 3. role-manager
- **URL**: `/functions/v1/role-manager`
- **Amaç**: Kullanıcı rollerini yönetmek
- **Özellikler**:
  - Rol atama/güncelleme
  - İzin yönetimi
  - Kullanıcı listesi
  - Admin yetkisi kontrolü

#### 4. session-manager
- **URL**: `/functions/v1/session-manager`
- **Amaç**: Oturum yönetimi
- **Özellikler**:
  - Session oluşturma/sonlandırma
  - Session doğrulama
  - Çoklu oturum kontrolü
  - Otomatik temizlik

#### 5. backup-manager
- **URL**: `/functions/v1/backup-manager`
- **Amaç**: Yedekleme yönetimi
- **Özellikler**:
  - Planlı yedekleme
  - Manuel yedekleme
  - Yedekleme durumu takibi
  - Otomatik programlama

### Frontend Sayfaları

#### /admin/kullanicilar - Kullanıcı Yönetimi
- Tüm kullanıcıları listeleme
- Rol değiştirme
- Hesap durumu yönetimi (aktif/pasif)
- Arama ve filtreleme
- Kullanıcı detayları

#### /admin/roller - Rol Yönetimi
- Rol detayları ve izinleri
- Kullanıcı rol dağılımı
- Rol açıklamaları
- Güvenlik uyarıları

#### /admin/aktivite-loglari - Aktivite Logları
- Tüm kullanıcı aktivitelerini görüntüleme
- Aktivite türüne göre filtreleme
- Tarih aralığı filtreleme
- CSV export
- Detaylı aktivite bilgileri

#### /admin/guvenlik-loglari - Güvenlik Logları
- Güvenlik olaylarını görüntüleme
- Önem seviyesine göre kategorilendirme
- Çözülmemiş olaylar
- Metrikler ve istatistikler
- Güvenlik durumu takibi

#### /admin/yedekleme - Yedekleme Yönetimi
- Yedekleme planlarını yönetme
- Manuel yedekleme başlatma
- Yedekleme durumu takibi
- Otomatik planlama
- Yedekleme istatistikleri

## Güvenlik Özellikleri

### Rol Tabanlı Erişim Kontrolü (RBAC)
- Her rol için özel yetkiler
- Otomatik yetki kontrolü
- Dinamik izin sistemi
- Audit trail kayıtları

### Güvenlik Politikaları
- **5 başarısız giriş** → 1 saat hesap kilidi
- **Şüpheli aktivite** → Yüksek önem seviyesi uyarı
- **Admin yetkisi** → Tüm sistem işlemleri
- **Session timeout** → 24 saat

### Log ve Monitoring
- Gerçek zamanlı aktivite takibi
- Otomatik güvenlik uyarıları
- IP bazlı takip
- User agent analizi
- Başarısız giriş pattern analizi

### Yedekleme ve Kurtarma
- Otomatik yedekleme programlama
- Çoklu yedekleme frekansı
- Yedekleme durumu takibi
- Veri bütünlüğü kontrolü
- Hızlı kurtarma sistemi

## Kullanım Kılavuzu

### Admin Kullanıcıları için

1. **Kullanıcı Ekleme/Düzenleme**
   - Admin paneli → Kullanıcılar
   - Yeni kullanıcı kayıt olduktan sonra rol atanabilir
   - Mevcut kullanıcıların rolleri güncellenebilir

2. **Güvenlik İzleme**
   - Güvenlik logları sayfasından güvenlik durumu takibi
   - Kritik olaylar için anında müdahale
   - Şüpheli aktivitelerin analizi

3. **Yedekleme Yönetimi**
   - Planlı yedekleme oluşturma
   - Manuel yedekleme başlatma
   - Yedekleme durumu kontrolü

4. **Aktivite Takibi**
   - Tüm sistem aktivitelerini görüntüleme
   - Kullanıcı davranış analizi
   - Sistem kullanım istatistikleri

### Moderatör Kullanıcıları için

- Ürün ve kategori yönetimi
- Sipariş takibi ve yönetimi
- Temel güvenlik loglarını görüntüleme
- Kullanıcı profil bilgilerini görüntüleme

### Editör Kullanıcıları için

- Ürün bilgilerini düzenleme
- İçerik güncelleme
- Ürün görsellerini yönetme
- Kategori açıklamalarını güncelleme

### Bayi Kullanıcıları için

- Bayi panelinden sipariş takibi
- Kendi ürünlerini görüntüleme
- Fatura bilgilerini güncelleme
- Bakiye bilgilerini takip

## Güvenlik En İyi Uygulamalar

### Rol Yönetimi
1. **Admin rolü** sadece güvenilir kişilere verilmeli
2. **Minimum yetki prensibi** uygulanmalı
3. **Düzenli rol kontrolü** yapılmalı
4. **Yetkisiz erişim** derhal raporlanmalı

### Şifre Güvenliği
1. **Güçlü şifre** zorunluluğu
2. **Düzenli şifre değişimi**
3. **İki faktörlü doğrulama** (gelecekte)
4. **Şifre geçmişi** takibi

### Oturum Güvenliği
1. **Session timeout** süresi kısa tutulmalı
2. **Çoklu oturum** kontrol edilmeli
3. **IP tabanlı** güvenlik kontrolleri
4. **Otomatik oturum temizliği**

### Log Yönetimi
1. **Düzenli log analizi**
2. **Anormal aktivite tespiti**
3. **Log bütünlüğü** kontrolü
4. **Uzun vadeli log saklama**

## Monitoring ve Alertler

### Otomatik Alertler
- **5+ başarısız giriş** → Hesap kilidi + Alert
- **Şüpheli IP** → Güvenlik uyarısı
- **Yüksek önem seviyesi olay** → Anında bildirim
- **Backup başarısızlığı** → Teknik ekip uyarısı

### Metrikler ve Raporlar
- Günlük/haftalık güvenlik özeti
- Kullanıcı aktivite analizi
- Sistem güvenlik durumu
- Backup başarı oranları
- Performance metrikleri

## Teknik Destek

### Log Analizi
```sql
-- Son 24 saatteki tüm aktiviteler
SELECT * FROM user_activities 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Başarısız giriş denemeleri
SELECT * FROM security_logs 
WHERE event_type = 'failed_login' 
AND created_at > NOW() - INTERVAL '24 hours';

-- Aktif kullanıcılar
SELECT COUNT(*) FROM profiles 
WHERE is_active = true AND last_login > NOW() - INTERVAL '24 hours';
```

### Yedekleme Komutları
```bash
# Manuel yedekleme başlatma
curl -X POST "https://your-project.supabase.co/functions/v1/backup-manager" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"table_name": "products"}'

# Yedekleme planı oluşturma
curl -X POST "https://your-project.supabase.co/functions/v1/backup-manager?action=schedule" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"table_name": "profiles", "frequency": "daily"}'
```

## Gelecek Geliştirmeler

1. **İki Faktörlü Doğrulama (2FA)**
2. **Gelişmiş Şifre Politikaları**
3. **API Rate Limiting**
4. **Anomali Tespiti (ML)**
5. **Advanced Audit Dashboard**
6. **Real-time Notification System**
7. **Compliance Reporting**
8. **Advanced Backup Strategies**

---

Bu sistem Gürbüz Oyuncak platformunun güvenliğini ve kullanıcı yönetimini önemli ölçüde geliştirmektedir. Sürekli izleme ve güncelleme ile sistem güvenliği en üst seviyede tutulmalıdır.