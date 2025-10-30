<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="description" content="Gürbüz Oyuncak - Antalya merkezli oyuncak toptancısı. B2B e-ticaret platformu.">
    <meta name="theme-color" content="#1E88E5">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Gürbüz Oyuncak">
    
    <title>Ana Sayfa - Gürbüz Oyuncak B2B</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="/public/images/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/public/images/apple-touch-icon.png">
    
    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json">
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/public/css/style.css">
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
    
    <!-- Banner Slider -->
    <section class="banner-slider" id="banner-slider">
        <div class="banner-slides" id="banner-slides">
            <!-- Banner'lar JavaScript ile yüklenecek -->
        </div>
        <button class="banner-nav banner-prev" id="banner-prev" aria-label="Önceki">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
        </button>
        <button class="banner-nav banner-next" id="banner-next" aria-label="Sonraki">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        </button>
        <div class="banner-dots" id="banner-dots"></div>
    </section>

    <!-- Yaş Grupları -->
    <section class="section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Yaşa Göre Alışveriş</h2>
                <p class="section-subtitle">Çocuğunuzun yaşına uygun oyuncakları keşfedin</p>
            </div>
            
            <div class="row g-4">
                <div class="col-12 col-md-6 col-lg-4">
                    <a href="/public/products.html?age=0-3" class="age-group-card">
                        <div class="age-group-icon">
                            <svg width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                            </svg>
                        </div>
                        <h3 class="age-group-title">0-3 Yaş</h3>
                        <p class="age-group-desc">Bebekler için güvenli ve eğitici oyuncaklar</p>
                        <span class="btn btn-outline">Keşfet</span>
                    </a>
                </div>
                
                <div class="col-12 col-md-6 col-lg-4">
                    <a href="/public/products.html?age=4-7" class="age-group-card">
                        <div class="age-group-icon">
                            <svg width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z"/>
                                <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0zM0 3.5c0 .753.333 1.429.86 1.887A8.035 8.035 0 0 1 4.387 1.86 2.5 2.5 0 0 0 0 3.5zM13.5 1c-.753 0-1.429.333-1.887.86a8.035 8.035 0 0 1 3.527 3.527A2.5 2.5 0 0 0 13.5 1z"/>
                            </svg>
                        </div>
                        <h3 class="age-group-title">4-7 Yaş</h3>
                        <p class="age-group-desc">Yaratıcılık ve hayal gücü geliştiren oyuncaklar</p>
                        <span class="btn btn-outline">Keşfet</span>
                    </a>
                </div>
                
                <div class="col-12 col-md-6 col-lg-4">
                    <a href="/public/products.html?age=8+" class="age-group-card">
                        <div class="age-group-icon">
                            <svg width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                            </svg>
                        </div>
                        <h3 class="age-group-title">8+ Yaş</h3>
                        <p class="age-group-desc">Karmaşık ve zorlayıcı oyuncaklar</p>
                        <span class="btn btn-outline">Keşfet</span>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Dinamik Bölümler (Homepage Sections API'den gelecek) -->
    <div id="homepage-sections"></div>

    <!-- Öne Çıkan Ürünler -->
    <section class="section bg-light">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Öne Çıkan Ürünler</h2>
                <p class="section-subtitle">En popüler oyuncaklar</p>
            </div>
            
            <div class="row g-4" id="featured-products">
                <!-- Ürünler JavaScript ile yüklenecek -->
            </div>
            
            <div class="text-center mt-5">
                <a href="/public/products.html" class="btn btn-primary btn-lg">Tüm Ürünleri Gör</a>
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
        
        // PWA Install Prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Install button göster (isterseniz)
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.style.display = 'block';
                installBtn.addEventListener('click', () => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        }
                        deferredPrompt = null;
                    });
                });
            }
        });
    </script>
</body>
</html>
