<?php
$current_page = basename($_SERVER['REQUEST_URI']);
?>
<!-- Font Awesome for Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<div class="sidebar">
    <div class="sidebar-header">
        <h2>Gürbüz Oyuncak</h2>
        <p>Admin Paneli</p>
    </div>
    
    <ul class="sidebar-menu">
        <li class="<?php echo ($current_page == 'index.php' || $current_page == 'dashboard.php') ? 'active' : ''; ?>">
            <a href="index.php"><i class="fas fa-home"></i> Dashboard</a>
        </li>
        <li class="<?php echo ($current_page == 'products.php' || $current_page == 'urunler.php') ? 'active' : ''; ?>">
            <a href="urunler.php"><i class="fas fa-box"></i> Ürünler</a>
        </li>
        <li class="<?php echo ($current_page == 'categories.php' || $current_page == 'kategoriler.php') ? 'active' : ''; ?>">
            <a href="kategoriler.php"><i class="fas fa-tags"></i> Kategoriler</a>
        </li>
        <li class="<?php echo ($current_page == 'orders.php' || $current_page == 'siparisler.php') ? 'active' : ''; ?>">
            <a href="siparisler.php"><i class="fas fa-shopping-cart"></i> Siparişler</a>
        </li>
        <li class="<?php echo ($current_page == 'customers.php') ? 'active' : ''; ?>">
            <a href="customers.php"><i class="fas fa-users"></i> Müşteriler</a>
        </li>
        
        <li class="menu-divider"><span>İçerik Yönetimi</span></li>
        <li class="<?php echo ($current_page == 'banners.php') ? 'active' : ''; ?>">
            <a href="banners.php"><i class="fas fa-image"></i> Banner Yönetimi</a>
        </li>
        <li class="<?php echo ($current_page == 'homepage_sections.php') ? 'active' : ''; ?>">
            <a href="homepage_sections.php"><i class="fas fa-th-large"></i> Ana Sayfa Bölümleri</a>
        </li>
        <li class="<?php echo ($current_page == 'xml_import.php') ? 'active' : ''; ?>">
            <a href="xml_import.php"><i class="fas fa-file-import"></i> XML İmport</a>
        </li>
        
        <li class="menu-divider"><span>Pazarlama</span></li>
        <li class="<?php echo ($current_page == 'campaigns_new.php' || $current_page == 'campaigns-timed.php') ? 'active' : ''; ?>">
            <a href="campaigns_new.php"><i class="fas fa-bullhorn"></i> Kampanyalar</a>
        </li>
        <li class="<?php echo ($current_page == 'coupons.php') ? 'active' : ''; ?>">
            <a href="coupons.php"><i class="fas fa-ticket-alt"></i> Kuponlar</a>
        </li>
        
        <li class="menu-divider"><span>Müşteri Yönetimi</span></li>
        <li class="<?php echo ($current_page == 'customer_types.php') ? 'active' : ''; ?>">
            <a href="customer_types.php"><i class="fas fa-user-tag"></i> Müşteri Grupları</a>
        </li>
        <li class="<?php echo ($current_page == 'balance.php') ? 'active' : ''; ?>">
            <a href="balance.php"><i class="fas fa-wallet"></i> Bakiye Yönetimi</a>
        </li>
        <li class="<?php echo ($current_page == 'rewards.php') ? 'active' : ''; ?>">
            <a href="rewards.php"><i class="fas fa-gift"></i> Ödül & Puanlar</a>
        </li>
        <li class="<?php echo ($current_page == 'bayi-onay.php') ? 'active' : ''; ?>">
            <a href="bayi-onay.php"><i class="fas fa-user-check"></i> Bayi Onay</a>
        </li>
        
        <li class="menu-divider"><span>Raporlar</span></li>
        <li class="<?php echo ($current_page == 'reports.php') ? 'active' : ''; ?>">
            <a href="reports.php"><i class="fas fa-chart-bar"></i> Raporlar</a>
        </li>
        
        <li class="menu-divider"><span>Ayarlar</span></li>
        <li class="<?php echo ($current_page == 'settings.php') ? 'active' : ''; ?>">
            <a href="settings.php"><i class="fas fa-cog"></i> Site Ayarları</a>
        </li>
        <li>
            <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Çıkış</a>
        </li>
    </ul>
</div>

<style>
.sidebar-menu li a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.sidebar-menu li a i {
    width: 20px;
    text-align: center;
}

.menu-divider {
    margin-top: 1.5rem;
    padding: 0.5rem 1.5rem;
    opacity: 0.5;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.sidebar-menu li a:hover {
    background-color: rgba(255,255,255,0.05);
    color: white;
}

.sidebar-menu li.active > a {
    background-color: rgba(59, 130, 246, 0.1);
    color: white;
    border-left-color: #3b82f6;
    font-weight: 600;
}
</style>