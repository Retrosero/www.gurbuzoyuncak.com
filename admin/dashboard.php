<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/../components/ComponentLoader.php';

if (!isAdminLoggedIn()) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ana Dashboard | Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Component CSS -->
    <link rel="stylesheet" href="/components/css/components.css">
    
    <style>
        :root {
            --primary-color: #667eea;
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --success-color: #22c55e;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
            --info-color: #3b82f6;
            --sidebar-width: 280px;
            --topbar-height: 70px;
            --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --card-hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            line-height: 1.6;
        }
        
        .admin-wrapper {
            display: flex;
            min-height: 100vh;
        }
        
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: calc(var(--topbar-height) + 2rem) 2rem 2rem;
            transition: margin-left 0.3s ease;
        }
        
        .top-bar {
            position: fixed;
            top: 0;
            left: var(--sidebar-width);
            right: 0;
            height: var(--topbar-height);
            background: white;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            z-index: 999;
            backdrop-filter: blur(10px);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: left 0.3s ease;
        }
        
        .top-bar-title {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .top-bar h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .time-filter {
            display: flex;
            gap: 0.5rem;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 0.25rem;
        }
        
        .time-filter button {
            background: none;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .time-filter button.active {
            background: var(--primary-color);
            color: white;
            box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
        }
        
        .time-filter button:hover:not(.active) {
            background: #e5e7eb;
            color: #374151;
        }
        
        /* KPI Cards Grid */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .kpi-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: var(--card-shadow);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .kpi-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--card-hover-shadow);
        }
        
        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-gradient);
        }
        
        .kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .kpi-title {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .kpi-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(102, 126, 234, 0.1);
            color: var(--primary-color);
        }
        
        .kpi-value {
            font-size: 2.25rem;
            font-weight: 800;
            color: #1f2937;
            margin: 0.75rem 0;
            line-height: 1;
        }
        
        .kpi-change {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .kpi-change.positive {
            color: var(--success-color);
        }
        
        .kpi-change.negative {
            color: var(--danger-color);
        }
        
        .kpi-change.neutral {
            color: var(--info-color);
        }
        
        /* Dashboard Cards */
        .dashboard-section {
            margin-bottom: 2rem;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .dashboard-card {
            background: white;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            margin-bottom: 1.5rem;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .card-header-modern {
            background: var(--primary-gradient);
            color: white;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: between;
            align-items: center;
        }
        
        .card-header-modern h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
        }
        
        .card-body-modern {
            padding: 0;
        }
        
        /* Charts */
        .chart-container {
            position: relative;
            height: 350px;
            padding: 1.5rem;
        }
        
        .chart-tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            background: #f8f9fa;
        }
        
        .chart-tab {
            flex: 1;
            padding: 1rem;
            text-align: center;
            background: none;
            border: none;
            font-weight: 500;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .chart-tab.active {
            background: white;
            color: var(--primary-color);
            border-bottom: 2px solid var(--primary-color);
        }
        
        /* Tables */
        .modern-table {
            background: white;
        }
        
        .modern-table thead th {
            background: #f8f9fa;
            border: none;
            font-weight: 600;
            color: #374151;
            padding: 1rem;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
        }
        
        .modern-table tbody td {
            padding: 1rem;
            border-color: #f3f4f6;
            vertical-align: middle;
        }
        
        .modern-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        /* Quick Actions */
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .quick-action-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            text-decoration: none;
            color: #374151;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: var(--card-shadow);
        }
        
        .quick-action-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
            transform: translateY(-2px);
            box-shadow: var(--card-hover-shadow);
        }
        
        .quick-action-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
        }
        
        /* Activity Feed */
        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            flex-shrink: 0;
        }
        
        .activity-icon.order {
            background: rgba(34, 197, 94, 0.1);
            color: var(--success-color);
        }
        
        .activity-icon.user {
            background: rgba(59, 130, 246, 0.1);
            color: var(--info-color);
        }
        
        .activity-icon.warning {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning-color);
        }
        
        .activity-content {
            flex: 1;
        }
        
        .activity-title {
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 0.25rem;
        }
        
        .activity-time {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        /* Loading States */
        .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #6b7280;
            padding: 2rem;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .spin {
            animation: spin 1s linear infinite;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .main-content {
                margin-left: 0;
                padding: calc(var(--topbar-height) + 1rem) 1rem 1rem;
            }
            
            .top-bar {
                left: 0;
                padding: 0 1rem;
            }
            
            .top-bar h1 {
                font-size: 1.25rem;
            }
            
            .kpi-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .kpi-card {
                padding: 1.25rem;
            }
            
            .kpi-value {
                font-size: 1.875rem;
            }
            
            .time-filter {
                flex-wrap: wrap;
                gap: 0.25rem;
            }
            
            .time-filter button {
                padding: 0.375rem 0.75rem;
                font-size: 0.8rem;
            }
            
            .quick-actions {
                grid-template-columns: 1fr;
            }
            
            .chart-container {
                height: 280px;
                padding: 1rem;
            }
            
            .card-header-modern {
                padding: 1rem 1.5rem;
            }
            
            .modern-table {
                font-size: 0.875rem;
            }
            
            .modern-table thead th,
            .modern-table tbody td {
                padding: 0.75rem 0.5rem;
            }
        }
        
        @media (max-width: 480px) {
            .top-bar {
                flex-direction: column;
                height: auto;
                padding: 1rem;
                gap: 1rem;
                align-items: stretch;
            }
            
            .main-content {
                padding-top: calc(90px + 1rem);
            }
            
            .kpi-card {
                padding: 1rem;
            }
            
            .kpi-value {
                font-size: 1.5rem;
            }
            
            .chart-tabs {
                flex-wrap: wrap;
            }
            
            .chart-tab {
                flex: none;
                min-width: 80px;
            }
        }
        
        /* Touch Gestures for Mobile */
        .swipe-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        
        .swipe-container::-webkit-scrollbar {
            display: none;
        }
        
        /* PWA Ready Styles */
        @media (display-mode: standalone) {
            .top-bar {
                padding-top: env(safe-area-inset-top);
            }
        }
    </style>
</head>
<body>
    <div class="admin-wrapper">
        <?php component('sidebar', ['variant' => 'admin']); ?>
        
        <div class="main-content">
            <!-- Top Bar -->
            <div class="top-bar">
                <div class="top-bar-title">
                    <i data-lucide="layout-dashboard" style="width: 32px; height: 32px; color: var(--primary-color);"></i>
                    <h1>Ana Dashboard</h1>
                </div>
                <div class="time-filter">
                    <button type="button" class="filter-btn" data-period="today">Bugün</button>
                    <button type="button" class="filter-btn active" data-period="week">Bu Hafta</button>
                    <button type="button" class="filter-btn" data-period="month">Bu Ay</button>
                    <button type="button" class="filter-btn" data-period="year">Bu Yıl</button>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="quick-actions">
                <a href="orders.php" class="quick-action-btn">
                    <i data-lucide="shopping-cart" class="quick-action-icon"></i>
                    <span>Siparişler</span>
                </a>
                <a href="products.php" class="quick-action-btn">
                    <i data-lucide="package" class="quick-action-icon"></i>
                    <span>Ürünler</span>
                </a>
                <a href="bayi-onay.php" class="quick-action-btn">
                    <i data-lucide="user-check" class="quick-action-icon"></i>
                    <span>Bayi Onayları</span>
                </a>
                <a href="reports.php" class="quick-action-btn">
                    <i data-lucide="bar-chart-3" class="quick-action-icon"></i>
                    <span>Raporlar</span>
                </a>
            </div>
            
            <!-- KPI Cards -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-title">Toplam Sipariş</div>
                        <div class="kpi-icon">
                            <i data-lucide="shopping-cart" style="width: 20px; height: 20px;"></i>
                        </div>
                    </div>
                    <div class="kpi-value" id="totalOrders">
                        <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="kpi-change positive" id="ordersChange">
                        <i data-lucide="trending-up" style="width: 16px; height: 16px;"></i>
                        <span>+12% bu hafta</span>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-title">Toplam Gelir</div>
                        <div class="kpi-icon">
                            <i data-lucide="turkish-lira" style="width: 20px; height: 20px;"></i>
                        </div>
                    </div>
                    <div class="kpi-value" id="totalRevenue">
                        <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="kpi-change positive" id="revenueChange">
                        <i data-lucide="trending-up" style="width: 16px; height: 16px;"></i>
                        <span>+8% bu hafta</span>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-title">Aktif Bayiler</div>
                        <div class="kpi-icon">
                            <i data-lucide="users" style="width: 20px; height: 20px;"></i>
                        </div>
                    </div>
                    <div class="kpi-value" id="activeCustomers">
                        <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="kpi-change neutral" id="customersChange">
                        <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
                        <span>+5 yeni bayi</span>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-title">Düşük Stok</div>
                        <div class="kpi-icon">
                            <i data-lucide="alert-triangle" style="width: 20px; height: 20px;"></i>
                        </div>
                    </div>
                    <div class="kpi-value" id="lowStockCount">
                        <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="kpi-change negative" id="stockChange">
                        <i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i>
                        <span>Dikkat gerekli</span>
                    </div>
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="dashboard-section">
                <h2 class="section-title">
                    <i data-lucide="bar-chart-3" style="width: 24px; height: 24px;"></i>
                    İstatistikler ve Grafikler
                </h2>
                
                <div class="row">
                    <div class="col-lg-8">
                        <div class="dashboard-card">
                            <div class="chart-tabs">
                                <button class="chart-tab active" data-chart="sales">Satış Grafiği</button>
                                <button class="chart-tab" data-chart="orders">Sipariş Grafiği</button>
                                <button class="chart-tab" data-chart="customers">Müşteri Grafiği</button>
                            </div>
                            <div class="chart-container">
                                <canvas id="mainChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="dashboard-card">
                            <div class="card-header-modern">
                                <h3>Kategori Dağılımı</h3>
                            </div>
                            <div class="chart-container" style="height: 300px;">
                                <canvas id="categoryChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Activity Section -->
            <div class="dashboard-section">
                <h2 class="section-title">
                    <i data-lucide="activity" style="width: 24px; height: 24px;"></i>
                    Son Aktiviteler ve Bilgiler
                </h2>
                
                <div class="row">
                    <div class="col-lg-6">
                        <div class="dashboard-card">
                            <div class="card-header-modern">
                                <h3>Son Siparişler</h3>
                            </div>
                            <div class="card-body-modern">
                                <div class="table-responsive">
                                    <table class="table modern-table">
                                        <thead>
                                            <tr>
                                                <th>Sipariş No</th>
                                                <th>Müşteri</th>
                                                <th>Tutar</th>
                                                <th>Durum</th>
                                            </tr>
                                        </thead>
                                        <tbody id="recentOrdersTable">
                                            <tr>
                                                <td colspan="4" class="loading-spinner">
                                                    <i data-lucide="loader-2" class="spin" style="width: 20px; height: 20px;"></i>
                                                    <span>Yükleniyor...</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-6">
                        <div class="dashboard-card">
                            <div class="card-header-modern">
                                <h3>Son Bayiler</h3>
                            </div>
                            <div class="card-body-modern">
                                <div class="table-responsive">
                                    <table class="table modern-table">
                                        <thead>
                                            <tr>
                                                <th>Bayi Adı</th>
                                                <th>Şehir</th>
                                                <th>Durum</th>
                                                <th>Tarih</th>
                                            </tr>
                                        </thead>
                                        <tbody id="recentCustomersTable">
                                            <tr>
                                                <td colspan="4" class="loading-spinner">
                                                    <i data-lucide="loader-2" class="spin" style="width: 20px; height: 20px;"></i>
                                                    <span>Yükleniyor...</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Alerts and Low Stock -->
            <div class="dashboard-section">
                <div class="row">
                    <div class="col-lg-6">
                        <div class="dashboard-card">
                            <div class="card-header-modern">
                                <h3>Düşük Stoklu Ürünler</h3>
                            </div>
                            <div class="card-body-modern">
                                <div class="table-responsive">
                                    <table class="table modern-table">
                                        <thead>
                                            <tr>
                                                <th>Ürün Adı</th>
                                                <th>Stok</th>
                                                <th>Durum</th>
                                                <th>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody id="lowStockTable">
                                            <tr>
                                                <td colspan="4" class="loading-spinner">
                                                    <i data-lucide="loader-2" class="spin" style="width: 20px; height: 20px;"></i>
                                                    <span>Yükleniyor...</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-6">
                        <div class="dashboard-card">
                            <div class="card-header-modern">
                                <h3>Sistem Aktiviteleri</h3>
                            </div>
                            <div class="card-body-modern">
                                <div id="systemActivities" style="max-height: 400px; overflow-y: auto;">
                                    <div class="loading-spinner">
                                        <i data-lucide="loader-2" class="spin" style="width: 20px; height: 20px;"></i>
                                        <span>Yükleniyor...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Component Loader -->
    <script src="/components/js/component-loader.js"></script>
    
    <script>
        // Dashboard Manager Class
        class DashboardManager {
            constructor() {
                this.currentPeriod = 'week';
                this.charts = {};
                this.refreshInterval = null;
                this.init();
            }
            
            init() {
                this.initLucideIcons();
                this.initEventListeners();
                this.initCharts();
                this.loadDashboardData();
                this.startAutoRefresh();
            }
            
            initLucideIcons() {
                lucide.createIcons();
            }
            
            initEventListeners() {
                // Time filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        this.currentPeriod = e.target.dataset.period;
                        this.loadDashboardData();
                    });
                });
                
                // Chart tabs
                document.querySelectorAll('.chart-tab').forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
                        e.target.classList.add('active');
                        this.switchChart(e.target.dataset.chart);
                    });
                });
                
                // Touch gestures for mobile
                this.initTouchGestures();
            }
            
            initTouchGestures() {
                let startX = 0;
                let currentX = 0;
                
                const chartContainer = document.querySelector('.chart-container');
                
                chartContainer.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                });
                
                chartContainer.addEventListener('touchmove', (e) => {
                    currentX = e.touches[0].clientX;
                });
                
                chartContainer.addEventListener('touchend', (e) => {
                    const diffX = startX - currentX;
                    
                    if (Math.abs(diffX) > 50) {
                        const tabs = document.querySelectorAll('.chart-tab');
                        const activeIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
                        
                        if (diffX > 0 && activeIndex < tabs.length - 1) {
                            // Swipe left - next tab
                            tabs[activeIndex + 1].click();
                        } else if (diffX < 0 && activeIndex > 0) {
                            // Swipe right - previous tab
                            tabs[activeIndex - 1].click();
                        }
                    }
                });
            }
            
            initCharts() {
                const ctx1 = document.getElementById('mainChart').getContext('2d');
                const ctx2 = document.getElementById('categoryChart').getContext('2d');
                
                // Main Chart (Sales/Orders/Customers)
                this.charts.main = new Chart(ctx1, {
                    type: 'line',
                    data: {
                        labels: this.getDateLabels(),
                        datasets: [{
                            label: 'Satış (₺)',
                            data: [],
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#667eea',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: '#667eea',
                                borderWidth: 1,
                                cornerRadius: 8,
                                displayColors: false,
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': ₺' + context.parsed.y.toLocaleString('tr-TR');
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: '#6b7280'
                                }
                            },
                            y: {
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)'
                                },
                                ticks: {
                                    color: '#6b7280',
                                    callback: function(value) {
                                        return '₺' + value.toLocaleString('tr-TR');
                                    }
                                }
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        }
                    }
                });
                
                // Category Chart (Doughnut)
                this.charts.category = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: ['Eğitici Oyuncaklar', 'Bebek Oyuncakları', 'Dış Mekan', 'Puzzle', 'Kitaplar'],
                        datasets: [{
                            data: [30, 25, 20, 15, 10],
                            backgroundColor: [
                                '#667eea',
                                '#764ba2',
                                '#22c55e',
                                '#f59e0b',
                                '#ef4444'
                            ],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    usePointStyle: true,
                                    color: '#6b7280'
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                cornerRadius: 8,
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': %' + context.parsed;
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            getDateLabels() {
                const labels = [];
                const now = new Date();
                
                switch(this.currentPeriod) {
                    case 'today':
                        for(let i = 23; i >= 0; i--) {
                            const hour = now.getHours() - i;
                            labels.push(hour + ':00');
                        }
                        break;
                    case 'week':
                        for(let i = 6; i >= 0; i--) {
                            const date = new Date(now);
                            date.setDate(date.getDate() - i);
                            labels.push(date.toLocaleDateString('tr-TR', { weekday: 'short' }));
                        }
                        break;
                    case 'month':
                        for(let i = 29; i >= 0; i--) {
                            const date = new Date(now);
                            date.setDate(date.getDate() - i);
                            labels.push(date.getDate().toString());
                        }
                        break;
                    case 'year':
                        for(let i = 11; i >= 0; i--) {
                            const date = new Date(now);
                            date.setMonth(date.getMonth() - i);
                            labels.push(date.toLocaleDateString('tr-TR', { month: 'short' }));
                        }
                        break;
                }
                
                return labels;
            }
            
            switchChart(type) {
                const chart = this.charts.main;
                
                switch(type) {
                    case 'sales':
                        chart.data.datasets[0].label = 'Satış (₺)';
                        chart.data.datasets[0].data = this.generateSampleData(100, 5000);
                        chart.data.datasets[0].borderColor = '#667eea';
                        chart.data.datasets[0].backgroundColor = 'rgba(102, 126, 234, 0.1)';
                        break;
                    case 'orders':
                        chart.data.datasets[0].label = 'Sipariş Sayısı';
                        chart.data.datasets[0].data = this.generateSampleData(5, 50);
                        chart.data.datasets[0].borderColor = '#22c55e';
                        chart.data.datasets[0].backgroundColor = 'rgba(34, 197, 94, 0.1)';
                        break;
                    case 'customers':
                        chart.data.datasets[0].label = 'Yeni Müşteri';
                        chart.data.datasets[0].data = this.generateSampleData(1, 15);
                        chart.data.datasets[0].borderColor = '#f59e0b';
                        chart.data.datasets[0].backgroundColor = 'rgba(245, 158, 11, 0.1)';
                        break;
                }
                
                chart.update('active');
            }
            
            generateSampleData(min, max) {
                const data = [];
                const length = this.getDateLabels().length;
                
                for(let i = 0; i < length; i++) {
                    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
                }
                
                return data;
            }
            
            async loadDashboardData() {
                try {
                    // Load KPI data
                    await this.loadKPIData();
                    
                    // Load recent orders
                    await this.loadRecentOrders();
                    
                    // Load recent customers
                    await this.loadRecentCustomers();
                    
                    // Load low stock products
                    await this.loadLowStockProducts();
                    
                    // Load system activities
                    await this.loadSystemActivities();
                    
                    // Update charts
                    this.updateCharts();
                    
                } catch (error) {
                    console.error('Dashboard data loading error:', error);
                    this.showErrorMessage('Veri yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
                }
            }
            
            async loadKPIData() {
                try {
                    // Simulate API calls with real-looking data
                    setTimeout(() => {
                        document.getElementById('totalOrders').textContent = '1,247';
                        document.getElementById('totalRevenue').textContent = '₺' + (486750).toLocaleString('tr-TR');
                        document.getElementById('activeCustomers').textContent = '189';
                        document.getElementById('lowStockCount').textContent = '23';
                    }, 1000);
                    
                } catch (error) {
                    console.error('KPI data loading error:', error);
                }
            }
            
            async loadRecentOrders() {
                try {
                    const response = await fetch('/backend/api/orders.php?limit=5');
                    const data = await response.json();
                    
                    const tbody = document.getElementById('recentOrdersTable');
                    
                    if (data.success && data.data.length > 0) {
                        tbody.innerHTML = data.data.map(order => {
                            const statusClass = order.status === 'completed' ? 'success' : 
                                               order.status === 'pending' ? 'warning' : 'secondary';
                            const statusText = order.status === 'completed' ? 'Tamamlandı' : 
                                              order.status === 'pending' ? 'Beklemede' : order.status;
                            
                            return `
                                <tr>
                                    <td><strong>#${order.id}</strong></td>
                                    <td>${order.customer_name || 'N/A'}</td>
                                    <td>₺${parseFloat(order.total_amount).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</td>
                                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                                </tr>
                            `;
                        }).join('');
                    } else {
                        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3">Sipariş bulunamadı</td></tr>';
                    }
                } catch (error) {
                    console.error('Recent orders loading error:', error);
                    document.getElementById('recentOrdersTable').innerHTML = 
                        '<tr><td colspan="4" class="text-center py-3 text-danger">Veri yüklenemedi</td></tr>';
                }
            }
            
            async loadRecentCustomers() {
                const tbody = document.getElementById('recentCustomersTable');
                
                // Simulate recent customers data
                const sampleCustomers = [
                    { name: 'Ahmet Yılmaz', city: 'İstanbul', status: 'Aktif', date: '2025-10-30' },
                    { name: 'Mehmet Kaya', city: 'Ankara', status: 'Beklemede', date: '2025-10-29' },
                    { name: 'Fatma Demir', city: 'İzmir', status: 'Aktif', date: '2025-10-28' },
                    { name: 'Ali Şahin', city: 'Bursa', status: 'Aktif', date: '2025-10-27' },
                    { name: 'Ayşe Özkan', city: 'Antalya', status: 'Beklemede', date: '2025-10-26' }
                ];
                
                setTimeout(() => {
                    tbody.innerHTML = sampleCustomers.map(customer => {
                        const statusClass = customer.status === 'Aktif' ? 'success' : 'warning';
                        
                        return `
                            <tr>
                                <td><strong>${customer.name}</strong></td>
                                <td>${customer.city}</td>
                                <td><span class="badge bg-${statusClass}">${customer.status}</span></td>
                                <td><small>${new Date(customer.date).toLocaleDateString('tr-TR')}</small></td>
                            </tr>
                        `;
                    }).join('');
                }, 1200);
            }
            
            async loadLowStockProducts() {
                const tbody = document.getElementById('lowStockTable');
                
                // Simulate low stock products
                const sampleProducts = [
                    { name: 'LEGO Classic Yaratıcı Parçalar', stock: 3, status: 'Kritik' },
                    { name: 'Barbie Rüya Evi', stock: 7, status: 'Düşük' },
                    { name: 'Hot Wheels 5\'li Araba Seti', stock: 12, status: 'Düşük' },
                    { name: 'Puzzle 1000 Parça Manzara', stock: 5, status: 'Kritik' },
                    { name: 'Oyun Hamuru 12 Renk', stock: 15, status: 'Düşük' }
                ];
                
                setTimeout(() => {
                    tbody.innerHTML = sampleProducts.map(product => {
                        const statusClass = product.status === 'Kritik' ? 'danger' : 'warning';
                        
                        return `
                            <tr>
                                <td><strong>${product.name}</strong></td>
                                <td>${product.stock}</td>
                                <td><span class="badge bg-${statusClass}">${product.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary">
                                        <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                    
                    lucide.createIcons();
                }, 1500);
            }
            
            async loadSystemActivities() {
                const container = document.getElementById('systemActivities');
                
                // Simulate system activities
                const activities = [
                    { type: 'order', title: 'Yeni sipariş alındı', details: '#1247 numaralı sipariş', time: '5 dakika önce', icon: 'shopping-cart' },
                    { type: 'user', title: 'Yeni bayi kaydı', details: 'Ahmet Yılmaz - İstanbul', time: '15 dakika önce', icon: 'user-plus' },
                    { type: 'warning', title: 'Düşük stok uyarısı', details: 'LEGO Classic serisi', time: '1 saat önce', icon: 'alert-triangle' },
                    { type: 'order', title: 'Sipariş tamamlandı', details: '#1245 numaralı sipariş', time: '2 saat önce', icon: 'check-circle' },
                    { type: 'user', title: 'Bayi onaylandı', details: 'Mehmet Kaya - Ankara', time: '3 saat önce', icon: 'user-check' }
                ];
                
                setTimeout(() => {
                    container.innerHTML = activities.map(activity => {
                        return `
                            <div class="activity-item">
                                <div class="activity-icon ${activity.type}">
                                    <i data-lucide="${activity.icon}" style="width: 16px; height: 16px;"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-title">${activity.title}</div>
                                    <div class="activity-time">${activity.details} • ${activity.time}</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    
                    lucide.createIcons();
                }, 1800);
            }
            
            updateCharts() {
                // Update main chart with new data
                this.charts.main.data.labels = this.getDateLabels();
                this.charts.main.data.datasets[0].data = this.generateSampleData(100, 5000);
                this.charts.main.update('none');
                
                // Update category chart
                this.charts.category.update('none');
            }
            
            startAutoRefresh() {
                // Refresh every 5 minutes
                this.refreshInterval = setInterval(() => {
                    this.loadDashboardData();
                }, 300000);
            }
            
            stopAutoRefresh() {
                if (this.refreshInterval) {
                    clearInterval(this.refreshInterval);
                }
            }
            
            showErrorMessage(message) {
                // Create toast notification for errors
                const toast = document.createElement('div');
                toast.className = 'position-fixed top-0 end-0 p-3';
                toast.style.zIndex = '9999';
                toast.innerHTML = `
                    <div class="toast show" role="alert">
                        <div class="toast-header bg-danger text-white">
                            <strong class="me-auto">Hata</strong>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                        </div>
                        <div class="toast-body">
                            ${message}
                        </div>
                    </div>
                `;
                
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.remove();
                }, 5000);
            }
        }
        
        // Initialize Dashboard
        document.addEventListener('DOMContentLoaded', function() {
            window.dashboardManager = new DashboardManager();
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', function() {
            if (window.dashboardManager) {
                window.dashboardManager.stopAutoRefresh();
            }
        });
    </script>
</body>
</html>