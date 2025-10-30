<?php
/**
 * Navbar Component - Ana Menü
 * Variant: public (default), admin, bayi
 */

$variant = $variant ?? 'public';
$currentPage = $_SERVER['REQUEST_URI'] ?? '';
?>

<header class="header" id="main-header">
    <!-- Top Bar -->
    <div class="header-top d-none d-md-block">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <div class="header-contact">
                        <span class="me-3">
                            <svg class="icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"/>
                            </svg>
                            0242 123 45 67
                        </span>
                        <span>
                            <svg class="icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                            </svg>
                            info@gurbuzoyuncak.com
                        </span>
                    </div>
                </div>
                <div class="col-md-6 text-end">
                    <div class="header-links">
                        <?php if ($variant === 'public'): ?>
                            <a href="/bayi-panel/login.php" class="header-link">Bayi Girişi</a>
                            <a href="/admin/login.php" class="header-link">Admin Girişi</a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Header -->
    <div class="header-main">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-6 col-lg-3">
                    <a href="/" class="logo">
                        <span class="logo-text">Gürbüz Oyuncak</span>
                    </a>
                </div>
                
                <?php if ($variant === 'public'): ?>
                <div class="col-lg-5 d-none d-lg-block">
                    <div class="search-bar">
                        <form action="/public/products.html" method="GET" class="search-form">
                            <input type="text" name="q" placeholder="Oyuncak ara..." class="search-input">
                            <button type="submit" class="search-button">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
                <?php endif; ?>
                
                <div class="col-6 col-lg-4">
                    <div class="header-actions">
                        <?php if ($variant === 'public'): ?>
                            <a href="/public/account.html" class="header-action d-none d-md-flex">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                                </svg>
                                <span class="d-none d-lg-inline">Hesabım</span>
                            </a>
                            <a href="/public/cart.html" class="header-action">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                </svg>
                                <span class="cart-count" id="cart-count">0</span>
                            </a>
                        <?php elseif ($variant === 'admin' || $variant === 'bayi'): ?>
                            <a href="#" class="header-action notification-btn">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                                </svg>
                                <span class="notification-badge">3</span>
                            </a>
                            <a href="logout.php" class="header-action">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                                    <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                                </svg>
                                <span class="d-none d-lg-inline">Çıkış</span>
                            </a>
                        <?php endif; ?>
                        
                        <!-- Mobile Menu Toggle -->
                        <button class="mobile-menu-toggle d-lg-none" id="mobile-menu-toggle" aria-label="Menü">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php if ($variant === 'public'): ?>
    <!-- Navigation -->
    <nav class="nav d-none d-lg-block">
        <div class="container">
            <ul class="nav-links">
                <li><a href="/public/index.html" class="nav-link <?= strpos($currentPage, 'index.html') !== false ? 'active' : '' ?>">Ana Sayfa</a></li>
                <li><a href="/public/products.html" class="nav-link <?= strpos($currentPage, 'products.html') !== false ? 'active' : '' ?>">Ürünler</a></li>
                <li><a href="/public/products.html?age=0-3" class="nav-link">0-3 Yaş</a></li>
                <li><a href="/public/products.html?age=4-7" class="nav-link">4-7 Yaş</a></li>
                <li><a href="/public/products.html?age=8+" class="nav-link">8+ Yaş</a></li>
                <li><a href="/public/about.html" class="nav-link <?= strpos($currentPage, 'about.html') !== false ? 'active' : '' ?>">Hakkımızda</a></li>
                <li><a href="/public/contact.html" class="nav-link <?= strpos($currentPage, 'contact.html') !== false ? 'active' : '' ?>">İletişim</a></li>
            </ul>
        </div>
    </nav>
    <?php endif; ?>
</header>

<!-- Mobile Search (Public Only) -->
<?php if ($variant === 'public'): ?>
<div class="mobile-search d-lg-none">
    <div class="container py-2">
        <form action="/public/products.html" method="GET" class="search-form">
            <input type="text" name="q" placeholder="Oyuncak ara..." class="form-control">
        </form>
    </div>
</div>
<?php endif; ?>
