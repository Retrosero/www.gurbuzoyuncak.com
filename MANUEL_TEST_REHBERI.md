# 4 Kritik Geliştirme - Manuel Test Rehberi

## Deployment Bilgileri
**Production URL:** https://foxb9zfthp7d.space.minimax.io
**Admin Login:** https://foxb9zfthp7d.space.minimax.io/admin/login
**Test Admin Hesabı:** adnxjbak@minimax.com / Qu7amVIMFV
**Test Bayi Hesabı:** abc@oyuncak.com / DemoB@yi123

---

## TEST 1: Modern Ürün Ekleme Sistemi

### Adımlar:
1. Admin login: https://foxb9zfthp7d.space.minimax.io/admin/login
2. Giriş yap: adnxjbak@minimax.com / Qu7amVIMFV
3. Sol menüden "Ürünler" veya doğrudan: https://foxb9zfthp7d.space.minimax.io/admin/urunler
4. Sağ üstte "Yeni Ürün" butonuna tıkla
5. Yönlendirilmelisin: /admin/urunler/yeni

### Kontrol Listesi:

#### Temel Bilgiler Bölümü:
- [ ] Ürün Kodu input (zorunlu - kırmızı yıldız)
- [ ] Barkod input
- [ ] Ürün Adı input (zorunlu - kırmızı yıldız)
- [ ] URL Slug input (otomatik - readonly, gri background)
- [ ] Kategori dropdown (zorunlu - kırmızı yıldız)
- [ ] Marka dropdown (zorunlu - kırmızı yıldız)
- [ ] Açıklama textarea (4 satır)
- [ ] Stok Miktarı input (number, min=0)
- [ ] KDV Oranı input (default: 18, min=0, max=100)
- [ ] Aktif checkbox
- [ ] Öne Çıkan checkbox

#### Fiyatlandırma Bölümü (Yeşil DollarSign ikonu):
- [ ] Alış Fiyatı input (gri açıklama: "Ürünün size maliyeti")
- [ ] Normal Fiyat input (zorunlu - kırmızı yıldız, gri açıklama: "Standart satış fiyatı")
- [ ] Kampanya Fiyatı input (gri açıklama: "İndirimli fiyat (opsiyonel)")
- [ ] B2B Fiyatı input (gri açıklama: "B2B müşteriler için")
- [ ] Toptan Fiyat input (gri açıklama: "Toptan satış için")
- [ ] Tüm fiyat alanları step="0.01" ve min="0"

#### Ürün Resimleri Bölümü (Mor ImageIcon):
- [ ] "Resim Yükle (0/10)" butonu (mor, disabled when 10 image)
- [ ] Dosya input (hidden, multiple, accept="image/*")
- [ ] Grid görünümü (2-3-5 cols responsive)
- [ ] Her resimde:
  - [ ] Sıra numarası badge (mor, sol üst)
  - [ ] "ANA" badge (yeşil, ilk resim için, sağ üst)
  - [ ] Drag handle (GripVertical icon, hover'da görünür)
  - [ ] Remove butonu (kırmızı X, hover'da görünür, sağ üst)
- [ ] Drag & drop çalışıyor mu? (resmi sürükleyip sırayı değiştir)
- [ ] İpucu metni: "İpucu: Resimlerin sırasını değiştirmek için sürükleyip bırakın..."

#### İndirilebilir Dosyalar Bölümü (Turuncu FileSpreadsheet):
- [ ] "Dosya Yükle" butonu (turuncu)
- [ ] Dosya input (hidden, multiple, accept=".pdf,.xlsx,.xls,.doc,.docx")
- [ ] Yüklenen dosya kartları:
  - [ ] FileText ikonu (turuncu)
  - [ ] Dosya adı
  - [ ] Dosya boyutu (formatlanmış: KB/MB)
  - [ ] Remove butonu (kırmızı X)

#### Video Bölümü (Kırmızı Tag ikonu):
- [ ] Video Tipi dropdown (Yok, YouTube, Dosya)
- [ ] Video URL input (video_type seçildiğinde aktif)

#### Submit Butonları:
- [ ] "İptal" butonu (gri border, sol) → /admin/urunler'e gider
- [ ] "Ürünü Kaydet" butonu (mavi, sağ) → Loading state (Loader2 spinner + "Kaydediliyor...")

### Fonksiyonellik Testleri:
1. **Slug Otomatik Oluşturma:**
   - Ürün adına "Lego Star Wars Set" yaz
   - Slug otomatik "lego-star-wars-set" olmalı

2. **Form Validasyon:**
   - Boş form gönder → "Ürün adı zorunludur" toast
   - Sadece isim gir, kategori boş → "Kategori seçiniz" toast
   - Resim yüklemeden gönder → "En az 1 ürün resmi yüklemelisiniz" toast

3. **Resim Yükleme:**
   - 3 resim yükle
   - İlk resim "ANA" badge'i almalı
   - 2. resmi sürükle 1. sıraya → Badge güncellenmeli
   - 11. resim yüklemeyi dene → "En fazla X resim daha ekleyebilirsiniz" toast

4. **Dosya Yükleme:**
   - PDF dosyası ekle
   - Dosya listede görünmeli
   - Boyut formatlanmış olmalı

5. **Tam Form Gönderimi:**
   - Tüm zorunlu alanları doldur
   - 2 resim yükle
   - 1 PDF ekle
   - Alış fiyatı: 50
   - Normal fiyat: 100
   - Kampanya fiyatı: 80
   - B2B fiyatı: 70
   - Toptan fiyat: 60
   - "Ürünü Kaydet" → Başarı mesajı + yönlendirme /admin/urunler

6. **Veritabanı Kontrolü:**
   - Ürünler listesinde yeni ürün görünmeli
   - Database'de purchase_price, campaign_price, b2b_price, wholesale_price kolonları dolu olmalı
   - product_images tablosunda 2 kayıt, order_index doğru
   - product_files tablosunda 1 kayıt

---

## TEST 2: Kupon Sisteminde Kullanıcı Arama

### Adımlar:
1. Admin panel: https://foxb9zfthp7d.space.minimax.io/admin/kuponlar
2. "Yeni Kupon" butonu (yeşil, Gift ikonu)
3. Modal açılır

### Kontrol Listesi:
- [ ] "Kullanıcıya Özel" sekmesi/bölümü var
- [ ] Kullanıcı arama input var (Mail ikonu ile)
- [ ] Placeholder: "Kullanıcı ara (isim veya email)..."

### Fonksiyonellik Testleri:
1. **Type-as-you-search:**
   - Input'a "test" yaz
   - 300ms sonra dropdown açılmalı
   - Sonuçlar listelenmeli (max 20)
   - Her sonuçta: Mail ikonu + İsim + Email

2. **Highlight:**
   - "demo" ara
   - Sonuçlarda "demo" kelimesi sarı highlight olmalı

3. **Auto-complete:**
   - Bir kullanıcıya tıkla
   - Input değeri kullanıcı adı/email olmalı
   - Dropdown kapanmalı
   - form_data.user_id set olmalı

4. **Cache:**
   - Aynı terimi 2. kez ara
   - Daha hızlı yanıt vermeli (cache'den)

5. **Temizle:**
   - "X" ikonu ile input'u temizle
   - user_id null olmalı
   - Dropdown kapanmalı

6. **Outside Click:**
   - Dropdown açıkken dışarıya tıkla
   - Dropdown kapanmalı

---

## TEST 3: Hesabım Sayfası

### A) Favoriler Sayfası - Resim Görünümü

**Adımlar:**
1. Normal kullanıcı login (test hesabı oluştur veya mevcut)
2. Favoriler sayfası: https://foxb9zfthp7d.space.minimax.io/favoriler

**Kontrol:**
- [ ] Favori ürünler listeleniyor
- [ ] Her ürün kartında resim görünüyor (product_images'dan ilk resim)
- [ ] Resim yoksa fallback image (Unsplash placeholder)
- [ ] Grid/List view mode çalışıyor
- [ ] Kategori filtreleme çalışıyor
- [ ] Sıralama çalışıyor (tarih, fiyat, isim)

### B) Profil Sayfası - Siparişlerim Sekmesi

**Adımlar:**
1. Profil sayfası: https://foxb9zfthp7d.space.minimax.io/profil
2. "Siparişlerim" sekmesine tıkla (orders tab)

**Kontrol:**
- [ ] "Siparişlerim" sekmesi var (VIP Bilgilerim yanında)
- [ ] Sipariş listesi yükleniyor
- [ ] Her sipariş kartında:
  - [ ] Sipariş numarası
  - [ ] Toplam tutar
  - [ ] Ödeme durumu badge
  - [ ] Sipariş durumu badge
  - [ ] Tarih
  - [ ] Detay butonu (ChevronDown/Up)
- [ ] Detay açıldığında:
  - [ ] Sipariş kalemleri (order_items)
  - [ ] Her kalem: Ürün adı, miktar, birim fiyat, toplam
  - [ ] Teslimat adresi
  - [ ] Kargo bilgileri (varsa)

---

## TEST 4: Bayi Paneli - Ürünlerim Sayfası

### Adımlar:
1. Bayi login: https://foxb9zfthp7d.space.minimax.io/bayi/login
2. Hesap: abc@oyuncak.com / DemoB@yi123
3. Sol menüden "Ürünlerim": https://foxb9zfthp7d.space.minimax.io/bayi/urunler

### Kontrol Listesi:
- [ ] Ürün listesi yükleniyor (loading spinner → ürün grid)
- [ ] Her ürün kartında:
  - [ ] Ürün resmi (product_images'dan ilk resim, image_urls[0])
  - [ ] Ürün adı
  - [ ] Kategori adı (category_name)
  - [ ] Marka adı (brand_name)
  - [ ] Orijinal fiyat (çizili)
  - [ ] Bayi fiyatı (calculated_bayi_price, büyük ve vurgulu)
  - [ ] İndirim yüzdesi badge (discount_percentage)
  - [ ] Tasarruf tutarı (savings_amount)
  - [ ] Stok durumu
  - [ ] "Sepete Ekle" butonu
- [ ] Filtreler çalışıyor:
  - [ ] Kategori dropdown
  - [ ] Marka dropdown
  - [ ] Fiyat aralığı slider
  - [ ] Stokta var checkbox
  - [ ] Arama input (name/description)
- [ ] Fiyat hesaplama doğru:
  - Bayi indirimi: %30 (bayi_discount_percentage)
  - Örnek: base_price=100 → calculated_bayi_price=70
  - savings_amount=30
- [ ] Sepete ekleme çalışıyor
- [ ] Sepet gösterimi (sağ panel)
- [ ] Toplam tutar doğru hesaplanıyor

### Fonksiyonellik Testleri:
1. **Resim Görünümü:**
   - En az 1 ürün resmi olmalı
   - Resim yok ise fallback placeholder

2. **Filtreleme:**
   - Kategori seç → Ürünler filtrelensin
   - Marka seç → Ürünler filtrelensin
   - "Lego" ara → İlgili ürünler listelenmeli

3. **Sepet İşlemleri:**
   - 3 farklı ürün ekle
   - Miktarları değiştir (+/-)
   - Ürün sil
   - Toplam tutar doğru hesaplansın

4. **Console Kontrol:**
   - F12 aç
   - Console'da hata YOK olmalı
   - Network sekmesinde bayi-products edge function çağrısı başarılı (200 OK)
   - Response'da: success: true, products array dolu, her üründe image_urls array

---

## Hata Raporlama
Herhangi bir hata bulursanız, lütfen şunları belirtin:
1. Hangi test (1-4)
2. Hangi adım
3. Beklenen davranış
4. Gerçekleşen davranış
5. Console hataları (varsa)
6. Ekran görüntüsü (opsiyonel)

---

## Tamamlanma Kriterleri
✅ Tüm 4 test başarılı
✅ Kritik hatalar yok
✅ Console temiz
✅ Resimler, dosyalar, veriler doğru gösteriliyor
✅ Form validasyonları çalışıyor
✅ Database'e doğru kaydediliyor
