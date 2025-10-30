<?php
require_once __DIR__ . '/../components/ComponentLoader.php';
$componentLoader = new ComponentLoader();

// Sayfa meta bilgileri
$pageTitle = "Hesabım | Gürbüz Oyuncak";
$pageDescription = "Gürbüz Oyuncak hesap yönetimi - Siparişlerinizi takip edin, profil bilgilerinizi güncelleyin";
$canonicalUrl = "https://gurbuzoyuncak.com/account";
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="robots" content="noindex, nofollow">
    <title><?php echo $pageTitle; ?></title>
    
    <!-- Canonical URL -->
    <link rel="canonical" href="<?php echo $canonicalUrl; ?>">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="images/favicon.png">
    <link rel="apple-touch-icon" href="images/favicon.png">
    
    <!-- Open Graph -->
    <meta property="og:title" content="<?php echo $pageTitle; ?>">
    <meta property="og:description" content="<?php echo $pageDescription; ?>">
    <meta property="og:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="og:type" content="website">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- Custom CSS -->
    <style>
        :root {
            --primary-color: #2563eb;
            --primary-light: #dbeafe;
            --primary-dark: #1d4ed8;
            --secondary-color: #64748b;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
            --light-gray: #f8fafc;
            --border-color: #e2e8f0;
            --text-color: #1e293b;
            --text-muted: #64748b;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --radius-sm: 0.375rem;
            --radius-md: 0.5rem;
            --radius-lg: 0.75rem;
            --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #f8fafc;
            color: var(--text-color);
            line-height: 1.6;
        }
        
        /* Account Layout */
        .account-wrapper {
            min-height: 100vh;
            padding: 1rem 0 3rem;
        }
        
        .account-container {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        /* Account Sidebar */
        .account-sidebar {
            background: white;
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
            height: fit-content;
            position: sticky;
            top: 100px;
        }
        
        .user-profile {
            text-align: center;
            padding-bottom: 1.5rem;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .user-avatar {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 1rem;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .user-avatar:hover {
            transform: scale(1.05);
        }
        
        .avatar-image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            border: 3px solid white;
            box-shadow: var(--shadow-md);
            object-fit: cover;
        }
        
        .avatar-upload-btn {
            position: absolute;
            bottom: 0;
            right: 0;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-md);
            transition: var(--transition);
        }
        
        .avatar-upload-btn:hover {
            background: var(--primary-dark);
            transform: scale(1.1);
        }
        
        .user-name {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }
        
        .user-email {
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
        }
        
        .user-member-since {
            font-size: 0.75rem;
            color: var(--text-muted);
            background: var(--light-gray);
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-sm);
            display: inline-block;
        }
        
        /* Account Menu */
        .account-menu {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .account-menu li {
            margin-bottom: 0.25rem;
        }
        
        .menu-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1rem;
            border-radius: var(--radius-md);
            color: var(--text-color);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }
        
        .menu-link:hover {
            background: var(--primary-light);
            color: var(--primary-color);
            transform: translateX(4px);
        }
        
        .menu-link.active {
            background: var(--primary-color);
            color: white;
            box-shadow: var(--shadow-md);
        }
        
        .menu-link.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: white;
        }
        
        .logout-link {
            color: var(--danger-color) !important;
            border-top: 1px solid var(--border-color);
            margin-top: 1rem;
            padding-top: 1rem;
        }
        
        .logout-link:hover {
            background: #fef2f2;
            color: var(--danger-color) !important;
        }
        
        /* Main Content */
        .account-content {
            background: white;
            border-radius: var(--radius-lg);
            padding: 2rem;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
        }
        
        .content-section {
            display: none;
        }
        
        .content-section.active {
            display: block;
        }
        
        .section-header {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);
        }
        
        .section-title {
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }
        
        .section-description {
            color: var(--text-muted);
            font-size: 0.875rem;
        }
        
        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            text-align: center;
            border: 1px solid var(--border-color);
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), #3b82f6);
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }
        
        /* Order Cards */
        .orders-container {
            display: grid;
            gap: 1.5rem;
        }
        
        .order-card {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            transition: var(--transition);
            position: relative;
        }
        
        .order-card:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-2px);
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            gap: 1rem;
        }
        
        .order-info h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 0.25rem;
        }
        
        .order-date {
            font-size: 0.875rem;
            color: var(--text-muted);
        }
        
        .order-status {
            padding: 0.375rem 0.875rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-processing {
            background: #dbeafe;
            color: #1d4ed8;
        }
        
        .status-shipped {
            background: #e0e7ff;
            color: #5b21b6;
        }
        
        .status-delivered {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .order-items {
            display: flex;
            gap: 1rem;
            margin: 1rem 0;
            padding: 1rem;
            background: var(--light-gray);
            border-radius: var(--radius-md);
        }
        
        .order-item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-color);
        }
        
        .order-items-info {
            flex: 1;
        }
        
        .order-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
            font-weight: 600;
        }
        
        .order-total .amount {
            font-size: 1.25rem;
            color: var(--primary-color);
        }
        
        /* Address Cards */
        .address-grid {
            display: grid;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .address-card {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            position: relative;
            transition: var(--transition);
        }
        
        .address-card:hover {
            box-shadow: var(--shadow-md);
        }
        
        .address-card.default {
            border-color: var(--primary-color);
            background: linear-gradient(135deg, #f8fafc, var(--primary-light));
        }
        
        .default-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--primary-color);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .address-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--text-color);
        }
        
        .address-details {
            color: var(--text-muted);
            font-size: 0.875rem;
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        
        .address-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        /* Form Styles */
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--text-color);
            font-size: 0.875rem;
        }
        
        .form-control {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 1rem;
            transition: var(--transition);
            background: white;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .form-control.is-invalid {
            border-color: var(--danger-color);
        }
        
        .form-control.is-valid {
            border-color: var(--success-color);
        }
        
        .form-feedback {
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }
        
        .invalid-feedback {
            color: var(--danger-color);
        }
        
        .valid-feedback {
            color: var(--success-color);
        }
        
        /* Password Strength */
        .password-strength {
            margin-top: 0.5rem;
        }
        
        .strength-bar {
            height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .strength-fill {
            height: 100%;
            transition: var(--transition);
            border-radius: 2px;
        }
        
        .strength-weak .strength-fill {
            width: 25%;
            background: var(--danger-color);
        }
        
        .strength-fair .strength-fill {
            width: 50%;
            background: var(--warning-color);
        }
        
        .strength-good .strength-fill {
            width: 75%;
            background: #3b82f6;
        }
        
        .strength-strong .strength-fill {
            width: 100%;
            background: var(--success-color);
        }
        
        .strength-text {
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            transition: var(--transition);
            cursor: pointer;
            text-align: center;
            min-height: 48px;
            justify-content: center;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
        
        .btn-outline {
            background: transparent;
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
        }
        
        .btn-outline:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-outline-danger {
            background: transparent;
            color: var(--danger-color);
            border: 1px solid var(--danger-color);
        }
        
        .btn-outline-danger:hover {
            background: var(--danger-color);
            color: white;
        }
        
        .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
            min-height: 36px;
        }
        
        /* Mobile Responsive */
        @media (max-width: 992px) {
            .account-container {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .account-sidebar {
                position: static;
                order: 2;
            }
            
            .account-content {
                order: 1;
                padding: 1.5rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 576px) {
            .account-wrapper {
                padding: 0.5rem 0 2rem;
            }
            
            .account-container {
                padding: 0 0.5rem;
                gap: 0.75rem;
            }
            
            .account-content {
                padding: 1rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .order-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .address-actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
            
            .user-avatar {
                width: 80px;
                height: 80px;
            }
            
            .avatar-image {
                font-size: 2rem;
            }
            
            .section-title {
                font-size: 1.5rem;
            }
        }
        
        /* Loading States */
        .loading-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* Utility Classes */
        .text-center { text-align: center; }
        .text-muted { color: var(--text-muted); }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 0.5rem; }
        .mb-2 { margin-bottom: 1rem; }
        .mb-3 { margin-bottom: 1.5rem; }
        .mt-2 { margin-top: 1rem; }
        .d-none { display: none; }
        .d-block { display: block; }
        .d-flex { display: flex; }
        .align-items-center { align-items: center; }
        .justify-content-between { justify-content: space-between; }
        .gap-2 { gap: 1rem; }
        
        /* Animation Classes */
        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Toast Notifications */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1050;
        }
        
        .toast {
            background: white;
            border-radius: var(--radius-md);
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
            min-width: 300px;
            transform: translateX(100%);
            transition: var(--transition);
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast.success {
            border-left: 4px solid var(--success-color);
        }
        
        .toast.error {
            border-left: 4px solid var(--danger-color);
        }
        
        .toast.warning {
            border-left: 4px solid var(--warning-color);
        }
    </style>
</head>
<body>
    <!-- Navbar Component -->
    <?php echo $componentLoader->loadComponent('navbar', ['variant' => 'public']); ?>

    <!-- Account Section -->
    <div class="account-wrapper">
        <div class="account-container">
            <!-- Account Sidebar -->
            <aside class="account-sidebar">
                <!-- User Profile -->
                <div class="user-profile">
                    <div class="user-avatar" onclick="triggerAvatarUpload()">
                        <img id="avatar-img" class="avatar-image" src="" alt="Profil Fotoğrafı" style="display: none;">
                        <div id="avatar-initials" class="avatar-image">AY</div>
                        <button class="avatar-upload-btn" title="Fotoğraf Değiştir">
                            <i data-lucide="camera" width="16" height="16"></i>
                        </button>
                        <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                    </div>
                    <div class="user-name" id="user-name">Ahmet Yılmaz</div>
                    <div class="user-email" id="user-email">ahmet@example.com</div>
                    <div class="user-member-since">Üye: Ocak 2023</div>
                </div>
                
                <!-- Account Menu -->
                <nav>
                    <ul class="account-menu">
                        <li>
                            <a href="#" class="menu-link active" onclick="showSection(event, 'dashboard')">
                                <i data-lucide="layout-dashboard" width="20" height="20"></i>
                                Kontrol Paneli
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-link" onclick="showSection(event, 'orders')">
                                <i data-lucide="package" width="20" height="20"></i>
                                Siparişlerim
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-link" onclick="showSection(event, 'addresses')">
                                <i data-lucide="map-pin" width="20" height="20"></i>
                                Adreslerim
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-link" onclick="showSection(event, 'profile')">
                                <i data-lucide="user" width="20" height="20"></i>
                                Profil Bilgilerim
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-link" onclick="showSection(event, 'security')">
                                <i data-lucide="shield" width="20" height="20"></i>
                                Güvenlik
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-link" onclick="showSection(event, 'preferences')">
                                <i data-lucide="settings" width="20" height="20"></i>
                                Tercihler
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-link logout-link" onclick="logout()">
                                <i data-lucide="log-out" width="20" height="20"></i>
                                Çıkış Yap
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
            
            <!-- Main Content -->
            <main class="account-content">
                <!-- Dashboard Section -->
                <section id="dashboard" class="content-section active fade-in">
                    <header class="section-header">
                        <h1 class="section-title">Kontrol Paneli</h1>
                        <p class="section-description">Hesap özetiniz ve hızlı erişim menüsü</p>
                    </header>
                    
                    <!-- Stats Grid -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" id="total-orders">12</div>
                            <div class="stat-label">Toplam Sipariş</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="pending-orders">2</div>
                            <div class="stat-label">Bekleyen Sipariş</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="favorite-products">8</div>
                            <div class="stat-label">Favori Ürün</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="total-spent">₺1,247</div>
                            <div class="stat-label">Toplam Harcama</div>
                        </div>
                    </div>
                    
                    <!-- Recent Orders -->
                    <div class="mb-3">
                        <h3 style="margin-bottom: 1rem; color: var(--text-color);">Son Siparişler</h3>
                        <div class="orders-container" id="recent-orders">
                            <!-- Recent orders will be loaded here -->
                        </div>
                    </div>
                </section>
                
                <!-- Orders Section -->
                <section id="orders" class="content-section">
                    <header class="section-header">
                        <h1 class="section-title">Siparişlerim</h1>
                        <p class="section-description">Tüm siparişlerinizi görüntüleyin ve takip edin</p>
                    </header>
                    
                    <!-- Order Filters -->
                    <div class="d-flex gap-2 mb-3" style="flex-wrap: wrap;">
                        <button class="btn btn-outline" onclick="filterOrders('all')">Tümü</button>
                        <button class="btn btn-outline" onclick="filterOrders('pending')">Bekleyen</button>
                        <button class="btn btn-outline" onclick="filterOrders('processing')">İşlemde</button>
                        <button class="btn btn-outline" onclick="filterOrders('shipped')">Kargoda</button>
                        <button class="btn btn-outline" onclick="filterOrders('delivered')">Teslim Edildi</button>
                    </div>
                    
                    <div class="orders-container" id="all-orders">
                        <!-- All orders will be loaded here -->
                    </div>
                </section>
                
                <!-- Addresses Section -->
                <section id="addresses" class="content-section">
                    <header class="section-header">
                        <h1 class="section-title">Adreslerim</h1>
                        <p class="section-description">Teslimat adreslerinizi yönetin</p>
                    </header>
                    
                    <button class="btn btn-primary mb-3" onclick="openAddressModal()">
                        <i data-lucide="plus" width="16" height="16"></i>
                        Yeni Adres Ekle
                    </button>
                    
                    <div class="address-grid" id="addresses-list">
                        <!-- Addresses will be loaded here -->
                    </div>
                </section>
                
                <!-- Profile Section -->
                <section id="profile" class="content-section">
                    <header class="section-header">
                        <h1 class="section-title">Profil Bilgilerim</h1>
                        <p class="section-description">Kişisel bilgilerinizi güncelleyin</p>
                    </header>
                    
                    <form id="profile-form" onsubmit="updateProfile(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Ad *</label>
                                <input type="text" class="form-control" name="first_name" value="Ahmet" required>
                                <div class="invalid-feedback"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Soyad *</label>
                                <input type="text" class="form-control" name="last_name" value="Yılmaz" required>
                                <div class="invalid-feedback"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">E-posta *</label>
                            <input type="email" class="form-control" name="email" value="ahmet@example.com" required>
                            <div class="invalid-feedback"></div>
                        </div>
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Telefon *</label>
                                <input type="tel" class="form-control" name="phone" value="0555 123 45 67" required>
                                <div class="invalid-feedback"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Doğum Tarihi</label>
                                <input type="date" class="form-control" name="birth_date" value="1990-01-15">
                            </div>
                        </div>
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Cinsiyet</label>
                                <select class="form-control" name="gender">
                                    <option value="">Seçiniz</option>
                                    <option value="male" selected>Erkek</option>
                                    <option value="female">Kadın</option>
                                    <option value="other">Belirtmek İstemiyorum</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Şehir</label>
                                <select class="form-control" name="city">
                                    <option value="">Şehir Seçiniz</option>
                                    <option value="antalya" selected>Antalya</option>
                                    <option value="istanbul">İstanbul</option>
                                    <option value="ankara">Ankara</option>
                                    <option value="izmir">İzmir</option>
                                </select>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i data-lucide="save" width="16" height="16"></i>
                            Bilgileri Güncelle
                        </button>
                    </form>
                </section>
                
                <!-- Security Section -->
                <section id="security" class="content-section">
                    <header class="section-header">
                        <h1 class="section-title">Güvenlik</h1>
                        <p class="section-description">Hesap güvenliğinizi yönetin</p>
                    </header>
                    
                    <!-- Change Password -->
                    <div class="mb-4">
                        <h3 style="margin-bottom: 1rem;">Şifre Değiştir</h3>
                        <form id="password-form" onsubmit="changePassword(event)">
                            <div class="form-group">
                                <label class="form-label">Mevcut Şifre *</label>
                                <input type="password" class="form-control" name="current_password" required>
                                <div class="invalid-feedback"></div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Yeni Şifre *</label>
                                <input type="password" class="form-control" name="new_password" id="new-password" required>
                                <div class="password-strength">
                                    <div class="strength-bar">
                                        <div class="strength-fill"></div>
                                    </div>
                                    <div class="strength-text"></div>
                                </div>
                                <small class="text-muted">En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter içermelidir</small>
                                <div class="invalid-feedback"></div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Yeni Şifre Tekrar *</label>
                                <input type="password" class="form-control" name="new_password_confirm" id="new-password-confirm" required>
                                <div class="invalid-feedback"></div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i data-lucide="shield-check" width="16" height="16"></i>
                                Şifreyi Değiştir
                            </button>
                        </form>
                    </div>
                    
                    <!-- Two Factor Authentication -->
                    <div class="mb-4">
                        <h3 style="margin-bottom: 1rem;">İki Faktörlü Doğrulama</h3>
                        <div style="background: var(--light-gray); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 style="margin-bottom: 0.5rem;">SMS ile Doğrulama</h4>
                                    <p class="text-muted mb-0">Hesabınızı daha güvenli hale getirin</p>
                                </div>
                                <button class="btn btn-outline" onclick="toggle2FA()">
                                    <span id="tfa-status">Etkinleştir</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Login History -->
                    <div>
                        <h3 style="margin-bottom: 1rem;">Giriş Geçmişi</h3>
                        <div style="background: var(--light-gray); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            <div id="login-history">
                                <!-- Login history will be loaded here -->
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Preferences Section -->
                <section id="preferences" class="content-section">
                    <header class="section-header">
                        <h1 class="section-title">Tercihler</h1>
                        <p class="section-description">Hesap tercihlerinizi yönetin</p>
                    </header>
                    
                    <form id="preferences-form" onsubmit="updatePreferences(event)">
                        <div class="mb-4">
                            <h3 style="margin-bottom: 1rem;">E-posta Bildirimleri</h3>
                            <div style="background: var(--light-gray); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <div class="form-check mb-3">
                                    <input type="checkbox" class="form-check-input" id="newsletter" name="newsletter" checked>
                                    <label class="form-check-label" for="newsletter">
                                        Haber bülteni ve kampanyalar
                                    </label>
                                </div>
                                <div class="form-check mb-3">
                                    <input type="checkbox" class="form-check-input" id="order-updates" name="order_updates" checked>
                                    <label class="form-check-label" for="order-updates">
                                        Sipariş güncellemeleri
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="security-alerts" name="security_alerts" checked>
                                    <label class="form-check-label" for="security-alerts">
                                        Güvenlik uyarıları
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h3 style="margin-bottom: 1rem;">Dil ve Bölge</h3>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Dil</label>
                                    <select class="form-control" name="language">
                                        <option value="tr" selected>Türkçe</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Para Birimi</label>
                                    <select class="form-control" name="currency">
                                        <option value="try" selected>Türk Lirası (₺)</option>
                                        <option value="usd">US Dollar ($)</option>
                                        <option value="eur">Euro (€)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i data-lucide="save" width="16" height="16"></i>
                            Tercihleri Kaydet
                        </button>
                    </form>
                </section>
            </main>
        </div>
    </div>

    <!-- Address Modal -->
    <div class="modal fade" id="addressModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Adres Ekle/Düzenle</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="address-form" onsubmit="saveAddress(event)">
                        <input type="hidden" id="address-id" name="address_id">
                        
                        <div class="form-group">
                            <label class="form-label">Adres Başlığı *</label>
                            <input type="text" class="form-control" name="title" placeholder="Ev, İş, vb." required>
                        </div>
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Ad Soyad *</label>
                                <input type="text" class="form-control" name="full_name" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Telefon *</label>
                                <input type="tel" class="form-control" name="phone" required>
                            </div>
                        </div>
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Şehir *</label>
                                <select class="form-control" name="city" required>
                                    <option value="">Şehir Seçiniz</option>
                                    <option value="antalya">Antalya</option>
                                    <option value="istanbul">İstanbul</option>
                                    <option value="ankara">Ankara</option>
                                    <option value="izmir">İzmir</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">İlçe *</label>
                                <select class="form-control" name="district" required>
                                    <option value="">İlçe Seçiniz</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Adres *</label>
                            <textarea class="form-control" name="address" rows="3" placeholder="Mahalle, cadde, sokak, bina no, daire no" required></textarea>
                        </div>
                        
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="is-default" name="is_default">
                            <label class="form-check-label" for="is-default">
                                Varsayılan adres olarak ayarla
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" data-bs-dismiss="modal">İptal</button>
                    <button type="submit" form="address-form" class="btn btn-primary">Kaydet</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toast-container"></div>

    <!-- Footer Component -->
    <?php echo $componentLoader->loadComponent('footer'); ?>

    <!-- Bootstrap 5.3.2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader JS -->
    <script src="../components/js/component-loader.js"></script>
    
    <!-- Main Script -->
    <script>
        // Account Management System
        class AccountManager {
            constructor() {
                this.user = this.loadUserData();
                this.orders = this.loadOrderData();
                this.addresses = this.loadAddressData();
                this.init();
            }
            
            init() {
                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                
                this.renderDashboard();
                this.renderOrders();
                this.renderAddresses();
                this.setupFormValidation();
                this.setupPasswordStrength();
                this.loadLoginHistory();
            }
            
            loadUserData() {
                const defaultUser = {
                    id: 1,
                    first_name: 'Ahmet',
                    last_name: 'Yılmaz',
                    email: 'ahmet@example.com',
                    phone: '0555 123 45 67',
                    birth_date: '1990-01-15',
                    gender: 'male',
                    city: 'antalya',
                    member_since: '2023-01-15',
                    avatar: null,
                    preferences: {
                        newsletter: true,
                        order_updates: true,
                        security_alerts: true,
                        language: 'tr',
                        currency: 'try'
                    }
                };
                
                return JSON.parse(localStorage.getItem('user_data')) || defaultUser;
            }
            
            loadOrderData() {
                const defaultOrders = [
                    {
                        id: 'ORD-2025-001',
                        date: '2025-10-28',
                        status: 'delivered',
                        items: [
                            { name: 'Lego City Set', image: 'images/products/lego-city.jpg', quantity: 1, price: 299.90 },
                            { name: 'Puzzle 1000 Parça', image: 'images/products/puzzle.jpg', quantity: 2, price: 62.55 }
                        ],
                        total: 425.00,
                        tracking_number: 'TK123456789'
                    },
                    {
                        id: 'ORD-2025-002',
                        date: '2025-10-30',
                        status: 'shipped',
                        items: [
                            { name: 'Remote Control Car', image: 'images/products/rc-car.jpg', quantity: 1, price: 189.90 },
                            { name: 'Action Figure', image: 'images/products/action-figure.jpg', quantity: 1, price: 99.60 }
                        ],
                        total: 289.50,
                        tracking_number: 'TK987654321'
                    },
                    {
                        id: 'ORD-2025-003',
                        date: '2025-10-25',
                        status: 'processing',
                        items: [
                            { name: 'Baby Doll', image: 'images/products/baby-doll.jpg', quantity: 1, price: 149.99 }
                        ],
                        total: 149.99,
                        tracking_number: null
                    }
                ];
                
                return JSON.parse(localStorage.getItem('user_orders')) || defaultOrders;
            }
            
            loadAddressData() {
                const defaultAddresses = [
                    {
                        id: 1,
                        title: 'Ev Adresi',
                        full_name: 'Ahmet Yılmaz',
                        phone: '0555 123 45 67',
                        city: 'antalya',
                        district: 'muratpasa',
                        address: 'Güzeloba Mah. Çağlayangil Cad. No:123/5',
                        is_default: true
                    },
                    {
                        id: 2,
                        title: 'İş Adresi',
                        full_name: 'Ahmet Yılmaz',
                        phone: '0555 123 45 67',
                        city: 'antalya',
                        district: 'konyaalti',
                        address: 'Konyaaltı Mah. Atatürk Blv. No:456',
                        is_default: false
                    }
                ];
                
                return JSON.parse(localStorage.getItem('user_addresses')) || defaultAddresses;
            }
            
            renderDashboard() {
                // Update stats
                document.getElementById('total-orders').textContent = this.orders.length;
                document.getElementById('pending-orders').textContent = this.orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
                document.getElementById('favorite-products').textContent = '8'; // Mock data
                
                const totalSpent = this.orders.reduce((sum, order) => sum + order.total, 0);
                document.getElementById('total-spent').textContent = `₺${totalSpent.toLocaleString('tr-TR')}`;
                
                // Render recent orders
                const recentOrders = this.orders.slice(0, 3);
                const container = document.getElementById('recent-orders');
                container.innerHTML = recentOrders.map(order => this.renderOrderCard(order)).join('');
            }
            
            renderOrders() {
                const container = document.getElementById('all-orders');
                if (this.orders.length === 0) {
                    container.innerHTML = `
                        <div class="text-center" style="padding: 3rem; background: var(--light-gray); border-radius: var(--radius-lg);">
                            <i data-lucide="package" width="48" height="48" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                            <h3>Henüz sipariş bulunmamaktadır</h3>
                            <p class="text-muted">İlk siparişinizi vermek için ürünlerimizi inceleyebilirsiniz.</p>
                            <a href="products.php" class="btn btn-primary mt-2">Ürünleri İncele</a>
                        </div>
                    `;
                } else {
                    container.innerHTML = this.orders.map(order => this.renderOrderCard(order)).join('');
                }
                
                // Re-initialize icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            
            renderOrderCard(order) {
                const statusLabels = {
                    pending: 'Bekleyen',
                    processing: 'İşlemde',
                    shipped: 'Kargoda',
                    delivered: 'Teslim Edildi',
                    cancelled: 'İptal Edildi'
                };
                
                const itemsHtml = order.items.slice(0, 3).map(item => `
                    <img src="${item.image}" alt="${item.name}" class="order-item-image" 
                         onerror="this.src='images/placeholder.jpg'">
                `).join('');
                
                return `
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-info">
                                <h4>#${order.id}</h4>
                                <div class="order-date">${new Date(order.date).toLocaleDateString('tr-TR')}</div>
                            </div>
                            <span class="order-status status-${order.status}">${statusLabels[order.status]}</span>
                        </div>
                        
                        <div class="order-items">
                            ${itemsHtml}
                            <div class="order-items-info">
                                <strong>${order.items.length} Ürün</strong>
                                ${order.tracking_number ? `<div class="text-muted" style="font-size: 0.875rem;">Takip: ${order.tracking_number}</div>` : ''}
                            </div>
                        </div>
                        
                        <div class="order-total">
                            <span class="text-muted">Toplam</span>
                            <span class="amount">₺${order.total.toLocaleString('tr-TR')}</span>
                        </div>
                    </div>
                `;
            }
            
            renderAddresses() {
                const container = document.getElementById('addresses-list');
                container.innerHTML = this.addresses.map(address => `
                    <div class="address-card ${address.is_default ? 'default' : ''}">
                        ${address.is_default ? '<span class="default-badge">Varsayılan</span>' : ''}
                        <h4 class="address-title">${address.title}</h4>
                        <div class="address-details">
                            ${address.full_name}<br>
                            ${address.address}<br>
                            ${address.city.toUpperCase()} / ${address.district.toUpperCase()}<br>
                            Tel: ${address.phone}
                        </div>
                        <div class="address-actions">
                            <button class="btn btn-outline btn-sm" onclick="editAddress(${address.id})">
                                <i data-lucide="edit" width="14" height="14"></i>
                                Düzenle
                            </button>
                            ${!address.is_default ? `
                                <button class="btn btn-outline btn-sm" onclick="setDefaultAddress(${address.id})">
                                    <i data-lucide="star" width="14" height="14"></i>
                                    Varsayılan Yap
                                </button>
                            ` : ''}
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteAddress(${address.id})">
                                <i data-lucide="trash-2" width="14" height="14"></i>
                                Sil
                            </button>
                        </div>
                    </div>
                `).join('');
                
                // Re-initialize icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            
            setupFormValidation() {
                // Profile form validation
                const profileForm = document.getElementById('profile-form');
                if (profileForm) {
                    profileForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.validateAndUpdateProfile(e.target);
                    });
                }
                
                // Real-time validation
                document.querySelectorAll('.form-control').forEach(input => {
                    input.addEventListener('blur', (e) => {
                        this.validateField(e.target);
                    });
                });
            }
            
            validateField(field) {
                const value = field.value.trim();
                let isValid = true;
                let message = '';
                
                switch (field.type) {
                    case 'email':
                        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                        message = isValid ? '' : 'Geçerli bir e-posta adresi girin';
                        break;
                    case 'tel':
                        isValid = /^[0-9\s\-\+\(\)]+$/.test(value) && value.length >= 10;
                        message = isValid ? '' : 'Geçerli bir telefon numarası girin';
                        break;
                    default:
                        if (field.required) {
                            isValid = value.length > 0;
                            message = isValid ? '' : 'Bu alan zorunludur';
                        }
                }
                
                field.classList.toggle('is-valid', isValid && value.length > 0);
                field.classList.toggle('is-invalid', !isValid && value.length > 0);
                
                const feedback = field.parentNode.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = message;
                }
                
                return isValid;
            }
            
            setupPasswordStrength() {
                const passwordInput = document.getElementById('new-password');
                if (passwordInput) {
                    passwordInput.addEventListener('input', (e) => {
                        this.checkPasswordStrength(e.target.value);
                    });
                }
            }
            
            checkPasswordStrength(password) {
                const strengthContainer = document.querySelector('.password-strength');
                const strengthBar = strengthContainer.querySelector('.strength-fill');
                const strengthText = strengthContainer.querySelector('.strength-text');
                
                let score = 0;
                let feedback = '';
                
                if (password.length >= 8) score++;
                if (/[a-z]/.test(password)) score++;
                if (/[A-Z]/.test(password)) score++;
                if (/[0-9]/.test(password)) score++;
                if (/[^A-Za-z0-9]/.test(password)) score++;
                
                strengthContainer.className = 'password-strength';
                
                switch (score) {
                    case 0:
                    case 1:
                        strengthContainer.classList.add('strength-weak');
                        feedback = 'Çok zayıf';
                        break;
                    case 2:
                        strengthContainer.classList.add('strength-fair');
                        feedback = 'Zayıf';
                        break;
                    case 3:
                        strengthContainer.classList.add('strength-good');
                        feedback = 'İyi';
                        break;
                    case 4:
                    case 5:
                        strengthContainer.classList.add('strength-strong');
                        feedback = 'Güçlü';
                        break;
                }
                
                strengthText.textContent = feedback;
            }
            
            loadLoginHistory() {
                const loginHistory = [
                    { date: '2025-10-31 09:15', ip: '192.168.1.1', device: 'Chrome (Windows)' },
                    { date: '2025-10-30 14:22', ip: '192.168.1.1', device: 'Safari (iPhone)' },
                    { date: '2025-10-29 11:45', ip: '192.168.1.1', device: 'Chrome (Windows)' }
                ];
                
                const container = document.getElementById('login-history');
                container.innerHTML = loginHistory.map(login => `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <strong>${login.device}</strong><br>
                            <small class="text-muted">${login.date} - IP: ${login.ip}</small>
                        </div>
                        <button class="btn btn-outline-danger btn-sm">
                            <i data-lucide="log-out" width="14" height="14"></i>
                            Oturumu Sonlandır
                        </button>
                    </div>
                `).join('');
                
                // Re-initialize icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            
            showToast(message, type = 'success') {
                const toast = document.createElement('div');
                toast.className = `toast ${type} show`;
                toast.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" width="20" height="20"></i>
                        <span>${message}</span>
                    </div>
                `;
                
                document.getElementById('toast-container').appendChild(toast);
                
                // Re-initialize icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            }
        }
        
        // Initialize Account Manager
        let accountManager;
        document.addEventListener('DOMContentLoaded', function() {
            accountManager = new AccountManager();
        });
        
        // Navigation Functions
        function showSection(event, sectionId) {
            event.preventDefault();
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Remove active from all menu links
            document.querySelectorAll('.menu-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Show selected section with animation
            const targetSection = document.getElementById(sectionId);
            targetSection.classList.add('active', 'fade-in');
            event.currentTarget.classList.add('active');
            
            // Scroll to top of content
            document.querySelector('.account-content').scrollTop = 0;
        }
        
        // Profile Functions
        function updateProfile(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const profileData = Object.fromEntries(formData);
            
            // Validate all fields
            let isValid = true;
            event.target.querySelectorAll('.form-control').forEach(field => {
                if (!accountManager.validateField(field)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                accountManager.showToast('Lütfen tüm alanları doğru şekilde doldurun', 'error');
                return;
            }
            
            // Update user data
            Object.assign(accountManager.user, profileData);
            localStorage.setItem('user_data', JSON.stringify(accountManager.user));
            
            // Update UI
            document.getElementById('user-name').textContent = `${profileData.first_name} ${profileData.last_name}`;
            document.getElementById('user-email').textContent = profileData.email;
            
            accountManager.showToast('Profil bilgileriniz başarıyla güncellendi');
        }
        
        // Security Functions
        function changePassword(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const currentPassword = formData.get('current_password');
            const newPassword = formData.get('new_password');
            const confirmPassword = formData.get('new_password_confirm');
            
            // Validate passwords
            if (newPassword !== confirmPassword) {
                accountManager.showToast('Yeni şifreler eşleşmiyor', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                accountManager.showToast('Yeni şifre en az 8 karakter olmalıdır', 'error');
                return;
            }
            
            // Simulate password change
            accountManager.showToast('Şifreniz başarıyla değiştirildi');
            event.target.reset();
        }
        
        function toggle2FA() {
            const button = event.target;
            const status = document.getElementById('tfa-status');
            
            if (status.textContent === 'Etkinleştir') {
                status.textContent = 'Devre Dışı Bırak';
                button.classList.remove('btn-outline');
                button.classList.add('btn-primary');
                accountManager.showToast('İki faktörlü doğrulama etkinleştirildi');
            } else {
                status.textContent = 'Etkinleştir';
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline');
                accountManager.showToast('İki faktörlü doğrulama devre dışı bırakıldı');
            }
        }
        
        // Address Functions
        function openAddressModal(addressId = null) {
            const modal = new bootstrap.Modal(document.getElementById('addressModal'));
            const form = document.getElementById('address-form');
            const modalTitle = document.querySelector('#addressModal .modal-title');
            
            form.reset();
            
            if (addressId) {
                const address = accountManager.addresses.find(a => a.id === addressId);
                if (address) {
                    modalTitle.textContent = 'Adresi Düzenle';
                    Object.keys(address).forEach(key => {
                        const field = form.querySelector(`[name="${key}"]`);
                        if (field) {
                            if (field.type === 'checkbox') {
                                field.checked = address[key];
                            } else {
                                field.value = address[key];
                            }
                        }
                    });
                }
            } else {
                modalTitle.textContent = 'Yeni Adres Ekle';
            }
            
            modal.show();
        }
        
        function editAddress(addressId) {
            openAddressModal(addressId);
        }
        
        function saveAddress(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const addressData = Object.fromEntries(formData);
            addressData.is_default = formData.has('is_default');
            
            const addressId = addressData.address_id;
            
            if (addressId) {
                // Update existing address
                const index = accountManager.addresses.findIndex(a => a.id == addressId);
                if (index !== -1) {
                    accountManager.addresses[index] = { ...accountManager.addresses[index], ...addressData };
                }
            } else {
                // Add new address
                addressData.id = Date.now();
                accountManager.addresses.push(addressData);
            }
            
            // Set as default if checked
            if (addressData.is_default) {
                accountManager.addresses.forEach(addr => {
                    addr.is_default = addr.id == (addressId || addressData.id);
                });
            }
            
            localStorage.setItem('user_addresses', JSON.stringify(accountManager.addresses));
            accountManager.renderAddresses();
            
            bootstrap.Modal.getInstance(document.getElementById('addressModal')).hide();
            accountManager.showToast('Adres başarıyla kaydedildi');
        }
        
        function setDefaultAddress(addressId) {
            accountManager.addresses.forEach(addr => {
                addr.is_default = addr.id === addressId;
            });
            
            localStorage.setItem('user_addresses', JSON.stringify(accountManager.addresses));
            accountManager.renderAddresses();
            accountManager.showToast('Varsayılan adres güncellendi');
        }
        
        function deleteAddress(addressId) {
            if (confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
                accountManager.addresses = accountManager.addresses.filter(addr => addr.id !== addressId);
                localStorage.setItem('user_addresses', JSON.stringify(accountManager.addresses));
                accountManager.renderAddresses();
                accountManager.showToast('Adres başarıyla silindi');
            }
        }
        
        // Order Functions
        function filterOrders(status) {
            const orders = status === 'all' ? accountManager.orders : accountManager.orders.filter(o => o.status === status);
            const container = document.getElementById('all-orders');
            container.innerHTML = orders.map(order => accountManager.renderOrderCard(order)).join('');
            
            // Update active filter button
            document.querySelectorAll('[onclick^="filterOrders"]').forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
            });
            event.target.classList.remove('btn-outline');
            event.target.classList.add('btn-primary');
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
        // Preferences Functions
        function updatePreferences(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const preferences = {
                newsletter: formData.has('newsletter'),
                order_updates: formData.has('order_updates'),
                security_alerts: formData.has('security_alerts'),
                language: formData.get('language'),
                currency: formData.get('currency')
            };
            
            accountManager.user.preferences = preferences;
            localStorage.setItem('user_data', JSON.stringify(accountManager.user));
            
            accountManager.showToast('Tercihleriniz başarıyla kaydedildi');
        }
        
        // Avatar Functions
        function triggerAvatarUpload() {
            document.getElementById('avatar-upload').click();
        }
        
        document.getElementById('avatar-upload')?.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const avatarImg = document.getElementById('avatar-img');
                    const avatarInitials = document.getElementById('avatar-initials');
                    
                    avatarImg.src = e.target.result;
                    avatarImg.style.display = 'block';
                    avatarInitials.style.display = 'none';
                    
                    accountManager.showToast('Profil fotoğrafı güncellendi');
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Logout Function
        function logout() {
            if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
                localStorage.removeItem('user_data');
                localStorage.removeItem('user_orders');
                localStorage.removeItem('user_addresses');
                window.location.href = 'auth.php';
            }
        }
        
        // Cart integration
        document.addEventListener('DOMContentLoaded', function() {
            // Update cart count if available
            if (typeof Cart !== 'undefined') {
                const cartCount = Cart.getItemCount();
                const cartCountElement = document.querySelector('.cart-count');
                if (cartCountElement) {
                    cartCountElement.textContent = cartCount;
                }
            }
        });
    </script>
</body>
</html>