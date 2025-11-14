# Gürbüz Oyuncak - RLS ve Bayi Sorunları Test Raporu

## Test Planı
**Website URL**: https://vrihhhcmt4j7.space.minimax.io
**Test Tarihi**: 2025-11-04 03:04
**Test Türü**: Kritik Sorun Doğrulama

## Kritik Sorunlar
1. **RLS Hatası**: Admin panelinden yeni ürün ekleyememe
2. **Bayi Ürünler**: Bayi panelinde ürünler görünmüyor

## Test Senaryoları

### 1. Admin Panel - Yeni Ürün Ekleme Testi
**Hedef**: RLS politikalarının admin INSERT işlemlerine izin verdiğini doğrulama

**Test Adımları**:
- [ ] Admin girişi: adnxjbak@minimax.com / Qu7amVIMFV
- [ ] /admin/urunler/yeni sayfasına git
- [ ] Test ürünü ekle (zorunlu alanlar)
- [ ] Kaydet butonuna tıkla
- [ ] Hata olmadan kaydedildiğini kontrol et

**Beklenen Sonuç**: Ürün başarıyla kaydedilmeli, RLS hatası olmamalı

---

### 2. Bayi Panel - Ürün Listesi Testi
**Hedef**: Bayi kullanıcısının 154 ürünü görebildiğini ve %30 indirimli fiyatları gördüğünü doğrulama

**Test Adımları**:
- [ ] Bayi girişi: abc@oyuncak.com / DemoB@yi123
- [ ] Ürünlerim sayfasına git
- [ ] Ürün sayısını kontrol et (154 olmalı)
- [ ] Fiyatların %30 indirimli gösterildiğini kontrol et
- [ ] Bayi bilgilerini kontrol et (ABC Oyuncak, VIP Seviye 3, %30 indirim)

**Beklenen Sonuç**: 154 ürün listelenmeli, fiyatlar %30 indirimli olmalı

---

## Test Sonuçları

### Test 1: Admin Panel Ürün Ekleme
**Durum**: Test ediliyor...

### Test 2: Bayi Panel Ürün Listesi
**Durum**: Beklemede...

---

## Genel Değerlendirme
**Tüm Testler**: Devam ediyor...
