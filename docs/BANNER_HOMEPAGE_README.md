# Banner Yönetimi ve Ana Sayfa Dinamik Bölümler

## Yeni Özellikler

### 1. Banner Yönetim Sistemi
Admin panelinde banner'ları yönetebilir, ana sayfada otomatik olarak gösterebilirsiniz.

**Özellikler:**
- Sınırsız banner ekleme
- Banner görseli yükleme
- Başlık, alt başlık ve link ayarları
- Arka plan ve metin rengi özelleştirme
- Gösterim sırası belirleme
- Başlangıç ve bitiş tarihi ayarlama
- Aktif/pasif durum kontrolü
- Otomatik slider (5 saniye aralıklarla)

**Kullanım:**
1. Admin panelinde "İçerik Yönetimi" > "Banner Yönetimi" sayfasına gidin
2. "Yeni Banner Ekle" butonuna tıklayın
3. Gerekli bilgileri doldurun ve banner görselini yükleyin
4. Kaydet butonuna tıklayın
5. Banner otomatik olarak ana sayfada gösterilecektir

### 2. Ana Sayfa Dinamik Bölüm Sistemi
Ana sayfada gösterilecek ürün bölümlerini yönetin.

**Bölüm Türleri:**
- **Popüler Ürünler:** En çok satılan ürünler
- **Yeni Gelen Ürünler:** Son eklenen ürünler
- **Bizim Seçtiklerimiz:** Manuel seçilen öne çıkan ürünler
- **İndirimli Ürünler:** İndirimli ürünler

**Özellikler:**
- Manuel veya otomatik ürün seçimi
- Bölüm başlığı ve alt başlığı özelleştirme
- Gösterim sırası belirleme
- Maksimum ürün sayısı ayarlama
- Arka plan rengi özelleştirme
- Aktif/pasif durum kontrolü

**Kullanım:**
1. Admin panelinde "İçerik Yönetimi" > "Ana Sayfa Bölümleri" sayfasına gidin
2. "Yeni Bölüm Ekle" butonuna tıklayın
3. Bölüm türü, başlık ve diğer ayarları doldurun
4. Kaydet butonuna tıklayın
5. "Ürünler" butonuna tıklayarak bölüme manuel ürün ekleyebilirsiniz
6. Manuel ürün eklenmezse, sistem otomatik olarak bölüm türüne uygun ürünleri gösterir

## Veritabanı Kurulumu

Yeni özellikleri kullanmak için veritabanınıza aşağıdaki dosyayı uygulayın:

```bash
mysql -u root -p gurbuz_oyuncak < database/banners_homepage_sections.sql
```

Bu SQL dosyası şunları oluşturur:
- `banners` tablosu
- `homepage_sections` tablosu
- `homepage_section_products` tablosu
- Demo banner ve bölüm verileri

## Dosya Yapısı

### Backend
```
backend/
├── classes/
│   ├── Banner.php              # Banner sınıfı
│   └── HomepageSection.php     # Ana sayfa bölüm sınıfı
└── api/
    ├── banners.php             # Banner API endpoint
    └── homepage_sections.php   # Ana sayfa bölümleri API endpoint
```

### Admin Panel
```
admin/
├── banners.php                 # Banner yönetim sayfası
├── homepage_sections.php       # Ana sayfa bölümleri yönetim sayfası
└── js/
    ├── banners.js              # Banner yönetim JavaScript
    └── homepage_sections.js    # Bölüm yönetim JavaScript
```

### Frontend
```
public/
├── index.html                  # Güncellenmiş ana sayfa
├── css/
│   └── style.css              # Banner slider CSS eklendi
├── js/
│   └── homepage.js            # Banner ve bölüm yükleme JavaScript
└── images/
    └── banners/               # Banner görselleri klasörü
```

## API Endpoint'leri

### Banner API
- `GET /backend/api/banners.php` - Tüm banner'ları getir
- `GET /backend/api/banners.php/{id}` - Tek banner getir
- `GET /backend/api/banners.php?active_only=1` - Aktif banner'ları getir
- `POST /backend/api/banners.php` - Yeni banner oluştur
- `PUT /backend/api/banners.php/{id}` - Banner güncelle
- `DELETE /backend/api/banners.php/{id}` - Banner sil

### Ana Sayfa Bölümleri API
- `GET /backend/api/homepage_sections.php` - Tüm bölümleri getir
- `GET /backend/api/homepage_sections.php/{id}` - Tek bölüm getir
- `GET /backend/api/homepage_sections.php?with_products=1` - Bölümleri ürünleriyle getir
- `GET /backend/api/homepage_sections.php/{id}/products` - Bölüm ürünlerini getir
- `POST /backend/api/homepage_sections.php` - Yeni bölüm oluştur
- `POST /backend/api/homepage_sections.php/{id}/products` - Bölüme ürün ekle
- `PUT /backend/api/homepage_sections.php/{id}` - Bölüm güncelle
- `DELETE /backend/api/homepage_sections.php/{id}` - Bölüm sil
- `DELETE /backend/api/homepage_sections.php/{id}/products` - Bölümden ürün çıkar

## Güvenlik Notları

1. **Dosya Yükleme:** Banner görselleri yüklenirken dosya türü ve boyutu kontrol edilir
   - İzin verilen formatlar: JPG, PNG, GIF, WEBP
   - Maksimum dosya boyutu: 5MB

2. **Veri Doğrulama:** Tüm girdi verileri temizlenir ve doğrulanır

3. **SQL Injection:** PDO prepared statements kullanılır

4. **XSS Koruması:** htmlspecialchars() ile veri temizlenir

## Kullanım Örnekleri

### Banner Ekleme
```php
POST /backend/api/banners.php

{
    "title": "Yeni Sezon Oyuncakları",
    "subtitle": "En yeni ve eğlenceli oyuncaklar burada!",
    "image_url": "/public/images/banners/banner1.jpg",
    "link_url": "/products.html",
    "link_text": "Şimdi Keşfet",
    "background_color": "#1E88E5",
    "text_color": "#FFFFFF",
    "display_order": 1,
    "is_active": 1
}
```

### Ana Sayfa Bölümü Ekleme
```php
POST /backend/api/homepage_sections.php

{
    "section_type": "populer",
    "title": "Popüler Ürünler",
    "subtitle": "En çok satılan ve beğenilen oyuncaklar",
    "display_order": 1,
    "max_items": 8,
    "is_active": 1
}
```

## Sorun Giderme

### Banner'lar görünmüyor
1. Veritabanında aktif banner var mı kontrol edin
2. Banner'ın başlangıç/bitiş tarihi kontrolü yapın
3. Browser console'da JavaScript hataları kontrol edin

### Ürünler bölümde görünmüyor
1. Bölümün aktif olduğundan emin olun
2. Bölüm türüne uygun ürünler var mı kontrol edin
3. Manuel ürün eklenmişse, ürünlerin aktif ve stokta olduğunu kontrol edin

### Görsel yüklenmiyor
1. `/public/images/banners/` klasörünün yazma izni olduğundan emin olun
2. Dosya boyutunun 5MB'dan küçük olduğunu kontrol edin
3. Dosya formatının JPG, PNG, GIF veya WEBP olduğunu kontrol edin

## Geliştirme Notları

- Banner slider otomatik olarak 5 saniyede bir değişir
- Tek banner varsa, navigation okları ve dots gösterilmez
- Dinamik bölümlerde manuel ürün yoksa, otomatik seçim devreye girer
- Responsive tasarım: Mobil cihazlarda tek sütun düzenine geçer

## Lisans
Gürbüz Oyuncak E-Ticaret Sistemi - Tüm hakları saklıdır.
