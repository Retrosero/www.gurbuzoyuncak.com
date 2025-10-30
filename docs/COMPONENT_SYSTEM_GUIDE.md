# Mobile Responsive Component Sistemi - Kullanım Kılavuzu

## Genel Bakış

Bu sistem, Gürbüz Oyuncak B2B e-ticaret sitesi için mobile-first, component-based bir mimari sunar.

### Özellikler
- ✅ Component-based mimari (PHP)
- ✅ Bootstrap 5.3.2 entegrasyonu
- ✅ Mobile-first responsive design
- ✅ Touch-friendly interface (44px minimum)
- ✅ PWA desteği (offline, installable)
- ✅ Service Worker (caching, offline support)
- ✅ Lazy loading
- ✅ Touch gestures (swipe, pull-to-refresh)

## Dosya Yapısı

```
gurbuz-oyuncak/
├── components/
│   ├── ComponentLoader.php       # PHP component loader class
│   ├── navbar.php               # Ana menü (public/admin/bayi variants)
│   ├── footer.php               # Alt bilgi
│   ├── sidebar.php              # Admin/Bayi sidebar
│   ├── mobile-menu.php          # Mobil overlay menü
│   ├── css/
│   │   └── components.css       # Component & responsive CSS
│   └── js/
│       └── component-loader.js   # Frontend component manager
├── manifest.json                # PWA manifest
├── service-worker.js            # Service worker
├── offline.html                 # Offline fallback sayfası
└── public/
    └── index-template.php       # Örnek sayfa şablonu
```

## 1. Component Kullanımı (PHP)

### Temel Kullanım

```php
<?php
// ComponentLoader'ı include et
require_once __DIR__ . '/../components/ComponentLoader.php';

// Component yükle
component('navbar', ['variant' => 'public']);
component('footer');
component('mobile-menu');
```

### Variant'lı Kullanım

```php
// Navbar için variant'lar: public (default), admin, bayi
component('navbar', ['variant' => 'admin']);
component('navbar', ['variant' => 'bayi']);

// Sidebar için variant'lar: admin (default), bayi
component('sidebar', ['variant' => 'admin']);
component('sidebar', ['variant' => 'bayi']);
```

### Cache Kontrolü

```php
// Cache'li yükleme (varsayılan)
component('navbar', [], ['cache' => true]);

// Cache'siz yükleme
component('navbar', [], ['cache' => false]);

// Cache temizle
ComponentLoader::clearCache();
```

### Helper Functions

```php
// Kısa kullanım
component('footer');

// Return olarak (string)
$footerHtml = get_component('footer');
echo $footerHtml;
```

## 2. HTML Sayfa Şablonu

### Minimum Gereksinimler

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <meta name="theme-color" content="#1E88E5">
    
    <title>Sayfa Başlığı - Gürbüz Oyuncak</title>
    
    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/public/css/style.css">
    <link rel="stylesheet" href="/components/css/components.css">
</head>
<body>
    <?php
    require_once __DIR__ . '/../components/ComponentLoader.php';
    component('navbar', ['variant' => 'public']);
    ?>
    
    <!-- Ana içerik buraya -->
    <main class="main-content">
        <div class="container">
            <h1>Sayfa İçeriği</h1>
        </div>
    </main>
    
    <?php
    component('footer');
    component('mobile-menu');
    ?>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader JS -->
    <script src="/components/js/component-loader.js"></script>
    
    <!-- Service Worker -->
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js');
        }
    </script>
</body>
</html>
```

## 3. Admin/Bayi Panel Şablonu

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Admin Panel</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/components/css/components.css">
</head>
<body>
    <?php
    require_once __DIR__ . '/../components/ComponentLoader.php';
    component('navbar', ['variant' => 'admin']);
    component('sidebar', ['variant' => 'admin']);
    ?>
    
    <main class="main-content" style="margin-left: 280px;">
        <div class="container-fluid p-4">
            <h1>Dashboard</h1>
            <!-- İçerik -->
        </div>
    </main>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/components/js/component-loader.js"></script>
</body>
</html>
```

## 4. JavaScript Component Manager

### Otomatik İşlemler

Component Manager otomatik olarak şunları yapar:
- Mobile menü toggle
- Sidebar toggle
- Bottom navigation
- Touch gestures (swipe)
- Lazy loading
- Sepet sayısını güncelleme

### Manuel Kullanım

```javascript
// Toast notification göster
window.ComponentManager.showToast('İşlem başarılı!', 'success', 3000);
window.ComponentManager.showToast('Hata oluştu!', 'error', 3000);

// Loading spinner
window.ComponentManager.showLoading();
window.ComponentManager.hideLoading();

// Sepet sayısını güncelle
window.ComponentManager.updateCartCount();
```

## 5. Responsive Breakpoints

```css
/* Mobile Small (xs) */
@media (max-width: 575px) { }

/* Mobile (sm) */
@media (min-width: 576px) { }

/* Tablet (md) */
@media (min-width: 768px) { }

/* Desktop (lg) */
@media (min-width: 992px) { }

/* Desktop Large (xl) */
@media (min-width: 1200px) { }

/* Desktop XL (xxl) */
@media (min-width: 1400px) { }
```

## 6. Bootstrap 5 Grid Kullanımı

```html
<!-- Responsive grid -->
<div class="row g-4">
    <div class="col-12 col-md-6 col-lg-4">
        <div class="card">İçerik 1</div>
    </div>
    <div class="col-12 col-md-6 col-lg-4">
        <div class="card">İçerik 2</div>
    </div>
    <div class="col-12 col-md-6 col-lg-4">
        <div class="card">İçerik 3</div>
    </div>
</div>

<!-- Utility classes -->
<div class="d-none d-md-block">Sadece tablet ve üstünde göster</div>
<div class="d-lg-none">Sadece mobile'da göster</div>
```

## 7. Touch-Friendly Guidelines

### Minimum Touch Target: 44px

```css
/* Butonlar */
.btn {
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem 1.5rem;
}

/* Icon buttons */
.icon-button {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

## 8. PWA Özellikleri

### Service Worker

Service Worker otomatik olarak:
- Statik dosyaları cache'ler
- Offline support sağlar
- API isteklerini cache'ler (network-first strategy)

### Manifest

PWA olarak kurulabilir:
- Add to Home Screen
- Standalone mode
- Custom splash screen
- App icons

## 9. Testing Checklist

- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)
- [ ] Tablet görünümü
- [ ] Desktop görünümü
- [ ] Touch gestures (swipe, tap)
- [ ] Offline mode
- [ ] PWA install
- [ ] Performance (Lighthouse)
- [ ] Accessibility (WCAG)

## 10. Performance Optimizasyonları

### Lazy Loading

```html
<img src="placeholder.jpg" data-src="actual-image.jpg" alt="Açıklama" loading="lazy">
```

### CSS Minification

Production'da CSS'leri minimize edin:
```bash
npx postcss components/css/components.css -o components/css/components.min.css
```

### JavaScript Bundle

Tüm JS dosyalarını birleştirin (production için).

## 11. Sorun Giderme

### Mobile menü açılmıyor
- `component-loader.js` yüklendiğinden emin olun
- Console'da hata var mı kontrol edin
- Mobile menu component'i yüklenmiş mi?

### Sidebar gözükmüyor
- Admin/bayi sayfalarında mısınız?
- Sidebar component variant'ı doğru mu?
- CSS dosyası yüklendi mi?

### PWA install göstermiyor
- HTTPS kullanıyor musunuz?
- manifest.json erişilebilir mi?
- Service worker kayıtlı mı?

## 12. Deployment Notları

1. Tüm component dosyalarının yüklü olduğundan emin olun
2. Bootstrap CDN veya local kurulum yapın
3. Service Worker'ı kaydedin
4. HTTPS kullanın (PWA için zorunlu)
5. Cache version'larını güncelleyin (service-worker.js)

## 13. Sonraki Adımlar

- [ ] Tüm public sayfaları component'lere dönüştür
- [ ] Admin panel sayfalarını güncelle
- [ ] Bayi panel sayfalarını güncelle
- [ ] Performance testing yap
- [ ] Cross-browser testing yap
- [ ] Accessibility audit yap
