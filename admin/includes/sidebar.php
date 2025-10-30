<?php
$current_page = basename($_SERVER['REQUEST_URI']);
?>
<div class="sidebar">
    <div class="sidebar-header">
        <h2>Gürbüz Oyuncak</h2>
        <p>Admin Paneli</p>
    </div>
    
    <ul class="sidebar-menu">
        <li class="<?php echo ($current_page == 'index.php') ? 'active' : ''; ?>"><a href="index.php">Dashboard</a></li>
        <li class="<?php echo ($current_page == 'urunler.php') ? 'active' : ''; ?>"><a href="urunler.php">Ürünler</a></li>
        <li class="<?php echo ($current_page == 'kategoriler.php') ? 'active' : ''; ?>"><a href="kategoriler.php">Kategoriler</a></li>
        <li class="<?php echo ($current_page == 'siparisler.php') ? 'active' : ''; ?>"><a href="siparisler.php">Siparişler</a></li>
        
        <li class="menu-divider"><span>İçerik Yönetimi</span></li>
        <li class="<?php echo ($current_page == 'banners.php') ? 'active' : ''; ?>"><a href="banners.php">Banner Yönetimi</a></li>
        <li class="<?php echo ($current_page == 'homepage_sections.php') ? 'active' : ''; ?>"><a href="homepage_sections.php">Ana Sayfa Bölümleri</a></li>
        <li class="<?php echo ($current_page == 'xml_import.php') ? 'active' : ''; ?>"><a href="xml_import.php">XML İmport</a></li>
        
        <li class="menu-divider"><span>Pazarlama</span></li>
        <li class="<?php echo ($current_page == 'campaigns_new.php') ? 'active' : ''; ?>"><a href="campaigns_new.php">Kampanyalar</a></li>
        <li class="<?php echo ($current_page == 'coupons.php') ? 'active' : ''; ?>"><a href="coupons.php">Kuponlar</a></li>
        
        <li class="menu-divider"><span>Müşteri Yönetimi</span></li>
        <li class="<?php echo ($current_page == 'customer_types.php') ? 'active' : ''; ?>"><a href="customer_types.php">Müşteri Grupları</a></li>
        <li class="<?php echo ($current_page == 'balance.php') ? 'active' : ''; ?>"><a href="balance.php">Bakiye Yönetimi</a></li>
        <li class="<?php echo ($current_page == 'rewards.php') ? 'active' : ''; ?>"><a href="rewards.php">Ödül & Puanlar</a></li>
        
        <li class="menu-divider"><span>Ayarlar</span></li>
        <li class="<?php echo ($current_page == 'settings.php') ? 'active' : ''; ?>"><a href="settings.php">Site Ayarları</a></li>
        <li class="<?php echo ($current_page == 'logout.php') ? 'active' : ''; ?>"><a href="logout.php">Çıkış</a></li>
    </ul>
</div>

<style>
.menu-divider {
    margin-top: 1.5rem;
    padding: 0.5rem 1.5rem;
    opacity: 0.5;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.sidebar-menu li a:hover {
    background-color: #f8f9fa;
    color: #007bff;
}

.sidebar-menu li.active > a { /* Updated to target li with active class */
    background-color: #007bff;
    color: white;
}
</style>