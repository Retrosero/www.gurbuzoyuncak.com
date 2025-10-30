<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="description" content="Gürbüz Oyuncak - Antalya merkezli oyuncak toptancısı. Kaliteli ve güvenli oyuncaklar.">
    <meta name="theme-color" content="#1E88E5">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    
    <title>Ana Sayfa | Gürbüz Oyuncak</title>
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/public/css/style.css">
    <link rel="stylesheet" href="/public/css/countdown-timer.css">
    <link rel="stylesheet" href="/components/css/components.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito+Sans:wght@700;800&display=swap" rel="stylesheet">
</head>
<body>
    <?php
    // Component Loader'ı include et
    require_once __DIR__ . '/../components/ComponentLoader.php';
    
    // Navbar component'ini yükle
    component('navbar', ['variant' => 'public']);
    ?>
    
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="row align-items-center g-4">
                <div class="col-12 col-lg-6">
                    <h1 class="display-4 fw-bold mb-3">Çocuğunuz İçin En İyi Oyuncakları Keşfedin</h1>
                    <p class="lead mb-4">Kaliteli, güvenli ve eğlenceli oyuncaklarla çocuklarınızın hayal dünyasını zenginleştirin. Ücretsiz kargo ile 20 TL üzeri siparişlerde!</p>
                    <a href="/public/products.html" class="btn btn-danger btn-lg px-4 py-3">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                        </svg>
                        Hemen Alışverişe Başla
                    </a>
                </div>
                <div class="col-12 col-lg-6 text-center">
                    <div style="font-size: clamp(4rem, 15vw, 8rem); opacity: 0.3;">🧸</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Countdown Banners (Dynamic) -->
    <section id="countdown-banner-section" class="countdown-banner-section" style="display: none;">
        <div class="container">
            <div id="countdown-banners-container"></div>
        </div>
    </section>

    <!-- Features -->
    <section class="py-5 bg-light">
        <div class="container">
            <div class="row g-4">
                <div class="col-6 col-md-3">
                    <div class="text-center p-3">
                        <div class="display-4 mb-2">💰</div>
                        <h5 class="fw-bold mb-1">Para İadesi</h5>
                        <p class="small text-muted mb-0">7 gün içinde koşulsuz para iadesi</p>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="text-center p-3">
                        <div class="display-4 mb-2">👥</div>
                        <h5 class="fw-bold mb-1">Üyelik İndirimi</h5>
                        <p class="small text-muted mb-0">2000 TL üzeri özel indirim</p>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="text-center p-3">
                        <div class="display-4 mb-2">🚚</div>
                        <h5 class="fw-bold mb-1">Ücretsiz Kargo</h5>
                        <p class="small text-muted mb-0">20 TL üzeri tüm siparişler</p>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="text-center p-3">
                        <div class="display-4 mb-2">🛟</div>
                        <h5 class="fw-bold mb-1">7/24 Destek</h5>
                        <p class="small text-muted mb-0">Her zaman hizmetinizdeyiz</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Categories Section -->
    <section class="py-5">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold mb-2">Kategorilere Göre Alışveriş</h2>
                <p class="lead text-muted">Çocuğunuzun yaşına ve ilgi alanına uygun kategorileri keşfedin</p>
            </div>
            <div class="row g-3" id="categoriesGrid">
                <div class="col-6 col-sm-4 col-lg-2">
                    <div class="category-card card h-100 text-center p-3 border-0 shadow-sm">
                        <div class="display-4 mb-2">🧸</div>
                        <h6 class="mb-0">Bebek & Aksesuarları</h6>
                    </div>
                </div>
                <div class="col-6 col-sm-4 col-lg-2">
                    <div class="category-card card h-100 text-center p-3 border-0 shadow-sm">
                        <div class="display-4 mb-2">🧩</div>
                        <h6 class="mb-0">Puzzle & Yapboz</h6>
                    </div>
                </div>
                <div class="col-6 col-sm-4 col-lg-2">
                    <div class="category-card card h-100 text-center p-3 border-0 shadow-sm">
                        <div class="display-4 mb-2">🚁</div>
                        <h6 class="mb-0">Kumandalılar</h6>
                    </div>
                </div>
                <div class="col-6 col-sm-4 col-lg-2">
                    <div class="category-card card h-100 text-center p-3 border-0 shadow-sm">
                        <div class="display-4 mb-2">🚗</div>
                        <h6 class="mb-0">Araçlar</h6>
                    </div>
                </div>
                <div class="col-6 col-sm-4 col-lg-2">
                    <div class="category-card card h-100 text-center p-3 border-0 shadow-sm">
                        <div class="display-4 mb-2">🏕️</div>
                        <h6 class="mb-0">Oyun Setleri</h6>
                    </div>
                </div>
                <div class="col-6 col-sm-4 col-lg-2">
                    <div class="category-card card h-100 text-center p-3 border-0 shadow-sm">
                        <div class="display-4 mb-2">🌳</div>
                        <h6 class="mb-0">Outdoor & Bahçe</h6>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Age Groups Section -->
    <section class="py-5 bg-info bg-opacity-10">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold mb-2">Yaşa Göre Alışveriş</h2>
                <p class="lead text-muted">Çocuğunuzun yaşına uygun oyuncakları hemen bulun</p>
            </div>
            <div class="row g-4 justify-content-center">
                <div class="col-12 col-sm-6 col-md-4">
                    <a href="/public/products.html?age_group=1" class="text-decoration-none">
                        <div class="card border-0 shadow-sm text-center p-4 h-100" style="background: linear-gradient(135deg, #00BFA5, #00897B);">
                            <div class="card-body text-white">
                                <div class="display-3 mb-3">🧸</div>
                                <h3 class="fw-bold">0-3 Yaş</h3>
                                <p class="mb-0">Bebek Oyuncakları</p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                    <a href="/public/products.html?age_group=2" class="text-decoration-none">
                        <div class="card border-0 shadow-sm text-center p-4 h-100" style="background: linear-gradient(135deg, #E91E63, #C2185B);">
                            <div class="card-body text-white">
                                <div class="display-3 mb-3">🏃</div>
                                <h3 class="fw-bold">4-7 Yaş</h3>
                                <p class="mb-0">Okul Öncesi</p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                    <a href="/public/products.html?age_group=3" class="text-decoration-none">
                        <div class="card border-0 shadow-sm text-center p-4 h-100" style="background: linear-gradient(135deg, #FF9800, #F57C00);">
                            <div class="card-body text-white">
                                <div class="display-3 mb-3">🎮</div>
                                <h3 class="fw-bold">8+ Yaş</h3>
                                <p class="mb-0">İleri Yaş</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Products Section -->
    <section class="py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h2 class="display-5 fw-bold mb-2">Popüler Oyuncaklar</h2>
                    <p class="lead text-muted mb-0">En çok tercih edilen ve sevilen oyuncaklar</p>
                </div>
                <a href="/public/products.html" class="btn btn-primary">
                    Tümünü Gör
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="ms-1">
                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                    </svg>
                </a>
            </div>
            <div id="productsGrid" class="row g-4">
                <!-- Products will be loaded here -->
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Yükleniyor...</span>
                    </div>
                    <p class="mt-3">Ürünler yükleniyor...</p>
                </div>
            </div>
        </div>
    </section>

    <?php
    // Footer component'ini yükle
    component('footer');
    
    // Mobile menu component'ini yükle
    component('mobile-menu');
    ?>

    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JS -->
    <script src="/public/js/main.js"></script>
    <script src="/public/js/homepage.js"></script>
    <script src="/public/js/countdown-timer.js"></script>
    <script src="/components/js/component-loader.js"></script>
    
    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registered:', registration);
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed:', error);
                    });
            });
        }
    </script>
    
    <script>
        // Sepet işlemleri
        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.querySelectorAll('#cart-count, #bottom-cart-count').forEach(el => {
                if (el) el.textContent = count;
            });
        }

        function addToCart(productId) {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id: productId, quantity: 1 });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            // Toast notification
            if (window.ComponentManager) {
                window.ComponentManager.showToast('Ürün sepete eklendi!', 'success');
            } else {
                alert('Ürün sepete eklendi!');
            }
        }

        // Kategorileri yükle
        async function loadCategories() {
            try {
                const response = await fetch('/backend/api/kategoriler.php');
                const data = await response.json();
                
                if (data.success && data.data.length > 0) {
                    const grid = document.getElementById('categoriesGrid');
                    const categories = data.data.slice(0, 6);
                    
                    grid.innerHTML = categories.map(category => `
                        <div class="col-6 col-sm-4 col-lg-2">
                            <a href="/public/products.html?category=${category.id}" class="text-decoration-none">
                                <div class="category-card card h-100 text-center p-3 border-0 shadow-sm">
                                    <div class="display-4 mb-2">${getCategoryIcon(category.kategori_adi)}</div>
                                    <h6 class="mb-0">${category.kategori_adi}</h6>
                                </div>
                            </a>
                        </div>
                    `).join('');
                }
            } catch (error) {
                console.error('Kategoriler yüklenirken hata:', error);
            }
        }

        function getCategoryIcon(categoryName) {
            const icons = {
                'bebek': '🧸', 'puzzle': '🧩', 'kumandalı': '🚁',
                'araç': '🚗', 'oyun': '🎮', 'outdoor': '🌳',
                'figür': '🦸', 'eğitici': '📚', 'peluş': '🧸'
            };
            
            for (const [key, icon] of Object.entries(icons)) {
                if (categoryName.toLowerCase().includes(key)) {
                    return icon;
                }
            }
            return '🧸';
        }

        // Ürünleri yükle
        async function loadProducts() {
            try {
                const response = await fetch('/backend/api/products.php?limit=8');
                const data = await response.json();
                
                if (data.success && data.data.length > 0) {
                    const grid = document.getElementById('productsGrid');
                    
                    grid.innerHTML = data.data.map(product => `
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div class="card h-100 border-0 shadow-sm product-card">
                                <img src="${product.image_url || '/public/images/placeholder.jpg'}" 
                                     class="card-img-top" 
                                     alt="${product.product_name}"
                                     style="height: 200px; object-fit: cover;">
                                <div class="card-body">
                                    <p class="text-muted small mb-1">${product.category_name || 'Oyuncak'}</p>
                                    <h6 class="card-title">${product.product_name}</h6>
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <span class="h5 mb-0 text-primary fw-bold">${product.price ? product.price.toFixed(2) : '0.00'} TL</span>
                                    </div>
                                    <button class="btn btn-primary w-100" onclick="addToCart(${product.id})">
                                        Sepete Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    document.getElementById('productsGrid').innerHTML = `
                        <div class="col-12 text-center py-5">
                            <p class="text-muted">Henüz ürün eklenmemiş.</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error);
                document.getElementById('productsGrid').innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="text-danger">Ürünler yüklenirken bir hata oluştu.</p>
                    </div>
                `;
            }
        }

        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            updateCartCount();
            loadCategories();
            loadProducts();
            
            // Homepage sections API'den yükle (varsa)
            if (typeof loadHomepageSections === 'function') {
                loadHomepageSections();
            }
            
            // Countdown banners API'den yükle (varsa)
            if (typeof loadCountdownBanners === 'function') {
                loadCountdownBanners();
            }
        });
    </script>
</body>
</html>
