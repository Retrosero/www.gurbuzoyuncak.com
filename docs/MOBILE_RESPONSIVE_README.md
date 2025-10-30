# Mobile Responsive Component System

B2B E-Ticaret sitesi için mobile-first, component-based responsive framework.

## 🎯 Hedefler

✅ %100 Mobile Responsive  
✅ Component-Based Mimari  
✅ Touch-Friendly Interface (44px minimum)  
✅ PWA Desteği (Installable, Offline)  
✅ Bootstrap 5.3.2 Entegrasyonu  
✅ Performance Optimized  
✅ Cross-Browser Compatible  

## 📦 İçindekiler

### 1. Component Sistemi
```
components/
├── ComponentLoader.php       # PHP component loader class
├── navbar.php               # Navbar (public/admin/bayi variants)
├── footer.php               # Footer + bottom navigation
├── sidebar.php              # Sidebar (admin/bayi variants)
├── mobile-menu.php          # Mobile overlay menu
├── css/
│   └── components.css       # Responsive framework CSS
└── js/
    └── component-loader.js  # Frontend component manager
```

### 2. PWA Dosyaları
```
/
├── manifest.json            # PWA manifest
├── service-worker.js        # Service worker (offline, caching)
└── offline.html             # Offline fallback page
```

### 3. Template Dosyaları
```
/
├── public/
│   └── index-template.php   # Public site template
└── admin/
    └── dashboard-template.php   # Admin panel template
```

### 4. Dokümantasyon
```
docs/
├── COMPONENT_SYSTEM_GUIDE.md    # Detaylı kullanım kılavuzu
└── QUICK_START.md               # Hızlı başlangıç kılavuzu
```

## 🚀 Hızlı Başlangıç

### 1. Component Kullanımı

```php
<?php
// ComponentLoader'ı include et
require_once __DIR__ . '/../components/ComponentLoader.php';

// Navbar yükle (public site için)
component('navbar', ['variant' => 'public']);

// Footer ve mobile menu yükle
component('footer');
component('mobile-menu');
?>
```

### 2. HTML Sayfası Şablonu

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sayfa Başlığı</title>
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="/components/css/components.css">
    
    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json">
</head>
<body>
    <?php
    require_once __DIR__ . '/../components/ComponentLoader.php';
    component('navbar', ['variant' => 'public']);
    ?>
    
    <main>
        <!-- İçerik -->
    </main>
    
    <?php
    component('footer');
    component('mobile-menu');
    ?>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/components/js/component-loader.js"></script>
    
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js');
        }
    </script>
</body>
</html>
```

## 📱 Özellikler

### Mobile-First Design
- Responsive breakpoints (xs, sm, md, lg, xl, xxl)
- Bootstrap 5 grid system
- Touch-optimized UI (minimum 44px)
- Mobile-specific components (bottom nav, swipe menu)

### Component System
- Merkezi component yönetimi
- Variant desteği (public/admin/bayi)
- Component caching
- Kolay bakım ve güncelleme

### PWA Features
- Installable (Add to Home Screen)
- Offline support
- Service Worker caching
- Push notification ready
- Background sync ready

### Touch Gestures
- Swipe to open/close menu
- Pull to refresh (simüle)
- Touch-optimized scrolling
- Haptic feedback simulation

### Performance
- Lazy loading (images)
- Component caching
- Service Worker caching
- Minified CSS/JS (production)

## 🎨 Responsive Breakpoints

```css
/* Mobile Small */
@media (max-width: 575px) { }

/* Mobile */
@media (min-width: 576px) { }

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 992px) { }

/* Desktop Large */
@media (min-width: 1200px) { }

/* Desktop XL */
@media (min-width: 1400px) { }
```

## 🧩 Component Variants

### Navbar
- `public` (default): Public site navbar
- `admin`: Admin panel navbar
- `bayi`: Bayi panel navbar

### Sidebar
- `admin` (default): Admin panel sidebar
- `bayi`: Bayi panel sidebar

## 📊 Sayfa Dönüştürme Durumu

### Public Site (9 sayfa)
- [ ] index.html → index.php
- [ ] products.html → products.php
- [ ] product-detail.html → product-detail.php
- [ ] cart.html → cart.php
- [ ] auth.html → auth.php
- [ ] account.html → account.php
- [ ] contact.html → contact.php
- [ ] about.html → about.php
- [ ] cart-enhanced.html → cart-enhanced.php

### Admin Panel (22+ sayfa)
- [ ] Tüm admin sayfaları component sistemi ile güncellenmeli

### Bayi Panel (8+ sayfa)
- [ ] Tüm bayi panel sayfaları component sistemi ile güncellenmeli

## 📚 Dokümantasyon

- **[Component System Guide](docs/COMPONENT_SYSTEM_GUIDE.md)**: Detaylı kullanım kılavuzu
- **[Quick Start](docs/QUICK_START.md)**: Hızlı başlangıç rehberi

## 🔧 Gereksinimler

- PHP 7.4+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- HTTPS (PWA için, localhost hariç)

## 🌐 Browser Desteği

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile
- ✅ Samsung Internet

## 🧪 Testing Checklist

- [ ] Google Mobile-Friendly Test
- [ ] Lighthouse Audit (90+ score)
- [ ] Touch targets (minimum 44px)
- [ ] Cross-browser testing
- [ ] Cross-device testing
- [ ] PWA install prompt
- [ ] Offline mode
- [ ] Service Worker caching
- [ ] Performance (load time < 3s)

## 📞 Destek

### Sorun Giderme

1. **Component yüklenmiyor**
   - ComponentLoader.php include edildi mi?
   - Dosya yolu doğru mu?

2. **CSS yüklenmiyor**
   - Absolute path kullanıldı mı?
   - components.css dosyası mevcut mu?

3. **Mobile menu açılmıyor**
   - component-loader.js yüklendi mi?
   - Console'da hata var mı?

4. **PWA çalışmıyor**
   - HTTPS kullanılıyor mu?
   - service-worker.js root'ta mı?
   - Manifest doğru mu?

### Kaynaklar

- Bootstrap 5: https://getbootstrap.com/docs/5.3
- PWA: https://web.dev/progressive-web-apps/
- Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

## 📝 Lisans

Gürbüz Oyuncak - Dahili Proje

## 👥 Ekip

MiniMax Agent - Frontend Development

---

**Not:** Bu sistem production-ready değildir. Tüm sayfaların dönüştürülmesi ve kapsamlı testing gerekmektedir.

## 🎯 Sonraki Adımlar

1. [ ] Tüm public sayfaları dönüştür
2. [ ] Tüm admin sayfalarını dönüştür
3. [ ] Tüm bayi sayfalarını dönüştür
4. [ ] Cross-browser testing
5. [ ] Performance optimization
6. [ ] Accessibility audit
7. [ ] Production deployment

## 📈 İlerleme

- ✅ Component sistemi kuruldu (100%)
- ✅ PWA dosyaları oluşturuldu (100%)
- ✅ Template'ler hazırlandı (100%)
- ⏳ Sayfa dönüştürme (0%)
- ⏳ Testing (0%)
