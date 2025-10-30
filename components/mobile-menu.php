<?php
/**
 * Mobile Menu Component - Mobil Overlay Menü
 */
?>

<div class="mobile-menu-overlay" id="mobile-menu-overlay">
    <div class="mobile-menu">
        <div class="mobile-menu-header">
            <h3>Menü</h3>
            <button class="mobile-menu-close" id="mobile-menu-close" aria-label="Kapat">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
            </button>
        </div>
        
        <div class="mobile-menu-body">
            <!-- Search -->
            <div class="mobile-menu-search">
                <form action="/public/products.html" method="GET">
                    <input type="text" name="q" placeholder="Oyuncak ara..." class="form-control">
                    <button type="submit" class="btn btn-primary">Ara</button>
                </form>
            </div>
            
            <!-- User Section -->
            <div class="mobile-menu-user">
                <a href="/public/account.html" class="mobile-menu-user-link">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                    </svg>
                    <span>Hesabım</span>
                </a>
            </div>
            
            <!-- Navigation Links -->
            <nav class="mobile-menu-nav">
                <a href="/public/index.html" class="mobile-menu-link">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                    </svg>
                    <span>Ana Sayfa</span>
                </a>
                
                <a href="/public/products.html" class="mobile-menu-link">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2.5 0A1.5 1.5 0 0 0 1 1.5V13h13V1.5A1.5 1.5 0 0 0 12.5 0h-10ZM2 1.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5V13H2V1.5Z"/>
                    </svg>
                    <span>Tüm Ürünler</span>
                </a>
                
                <div class="mobile-menu-divider"></div>
                
                <div class="mobile-menu-section-title">Yaşa Göre</div>
                
                <a href="/public/products.html?age=0-3" class="mobile-menu-link">
                    <span>0-3 Yaş</span>
                </a>
                
                <a href="/public/products.html?age=4-7" class="mobile-menu-link">
                    <span>4-7 Yaş</span>
                </a>
                
                <a href="/public/products.html?age=8+" class="mobile-menu-link">
                    <span>8+ Yaş</span>
                </a>
                
                <div class="mobile-menu-divider"></div>
                
                <a href="/public/about.html" class="mobile-menu-link">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                    <span>Hakkımızda</span>
                </a>
                
                <a href="/public/contact.html" class="mobile-menu-link">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                    </svg>
                    <span>İletişim</span>
                </a>
            </nav>
            
            <!-- Additional Links -->
            <div class="mobile-menu-footer">
                <div class="mobile-menu-divider"></div>
                <a href="/bayi-panel/login.php" class="mobile-menu-link highlight">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                    </svg>
                    <span>Bayi Girişi</span>
                </a>
                <a href="/admin/login.php" class="mobile-menu-link">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </svg>
                    <span>Admin Girişi</span>
                </a>
            </div>
        </div>
    </div>
</div>
