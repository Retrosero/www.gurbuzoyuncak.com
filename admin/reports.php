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
    <title>Raporlar ve Analytics | Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Date Range Picker -->
    <script src="https://cdn.jsdelivr.net/npm/moment@latest/moment.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css">
    <script src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
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
        
        /* Report Controls */
        .report-controls {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: var(--card-shadow);
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
            justify-content: space-between;
        }
        
        .control-group {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .date-picker-wrapper {
            position: relative;
        }
        
        .date-picker {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            background: white;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 200px;
        }
        
        .date-picker:focus,
        .date-picker:hover {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .export-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        .export-btn {
            padding: 0.5rem 1rem;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 10px;
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .export-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
            background: rgba(102, 126, 234, 0.05);
        }
        
        /* Report Tabs */
        .report-tabs {
            display: flex;
            background: white;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            margin-bottom: 2rem;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        
        .report-tab {
            flex: 1;
            padding: 1rem 1.5rem;
            border: none;
            background: transparent;
            color: #6b7280;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-right: 1px solid #e5e7eb;
            position: relative;
        }
        
        .report-tab:last-child {
            border-right: none;
        }
        
        .report-tab.active {
            background: var(--primary-gradient);
            color: white;
        }
        
        .report-tab:not(.active):hover {
            background: #f8f9fa;
            color: #374151;
        }
        
        /* KPI Summary Cards */
        .kpi-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
            color: #6b7280;
        }
        
        /* Chart Containers */
        .chart-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .chart-card {
            background: white;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
        }
        
        .chart-header {
            background: var(--primary-gradient);
            color: white;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: between;
            align-items: center;
        }
        
        .chart-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
        }
        
        .chart-controls {
            display: flex;
            gap: 0.5rem;
        }
        
        .chart-control-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            border-radius: 6px;
            padding: 0.375rem 0.75rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .chart-control-btn:hover,
        .chart-control-btn.active {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .chart-container {
            position: relative;
            height: 400px;
            padding: 1.5rem;
        }
        
        .chart-container.small {
            height: 320px;
        }
        
        /* Report Content */
        .report-content {
            display: none;
        }
        
        .report-content.active {
            display: block;
        }
        
        /* Data Tables */
        .report-table-card {
            background: white;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
            margin-bottom: 2rem;
        }
        
        .table-header {
            background: var(--primary-gradient);
            color: white;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .table-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
        }
        
        .modern-table {
            background: white;
            margin: 0;
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
        
        /* Comparative Analysis */
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .comparison-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: var(--card-shadow);
        }
        
        .comparison-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
        }
        
        .comparison-metrics {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .metric-group {
            text-align: center;
        }
        
        .metric-label {
            font-size: 0.75rem;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }
        
        .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
        }
        
        .comparison-chart {
            height: 100px;
            margin-top: 1rem;
        }
        
        /* Quick Stats Grid */
        .quick-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .quick-stat {
            background: white;
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: var(--card-shadow);
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .quick-stat:hover {
            transform: translateY(-2px);
            box-shadow: var(--card-hover-shadow);
        }
        
        .quick-stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(102, 126, 234, 0.1);
            color: var(--primary-color);
        }
        
        .quick-stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.25rem;
        }
        
        .quick-stat-label {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        /* Performance Indicators */
        .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .performance-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: var(--card-shadow);
        }
        
        .performance-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .performance-title {
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
        }
        
        .performance-trend {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .performance-trend.up {
            color: var(--success-color);
        }
        
        .performance-trend.down {
            color: var(--danger-color);
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #f3f4f6;
            border-radius: 4px;
            overflow: hidden;
            margin: 1rem 0;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--primary-gradient);
            border-radius: 4px;
            transition: width 1s ease;
        }
        
        /* Print Styles */
        @media print {
            .admin-wrapper .sidebar,
            .top-bar,
            .report-controls,
            .report-tabs {
                display: none !important;
            }
            
            .main-content {
                margin-left: 0;
                padding: 1rem;
            }
            
            .chart-card,
            .report-table-card {
                break-inside: avoid;
                margin-bottom: 1rem;
            }
            
            body {
                background: white;
            }
        }
        
        /* Loading States */
        .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #6b7280;
            padding: 3rem;
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
            
            .report-controls {
                flex-direction: column;
                align-items: stretch;
                gap: 1rem;
            }
            
            .control-group {
                justify-content: center;
            }
            
            .date-picker {
                min-width: auto;
                width: 100%;
            }
            
            .report-tabs {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            .report-tab {
                flex: none;
                min-width: 120px;
                white-space: nowrap;
            }
            
            .kpi-summary {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .chart-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .chart-container {
                height: 300px;
                padding: 1rem;
            }
            
            .comparison-grid {
                grid-template-columns: 1fr;
            }
            
            .quick-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .performance-grid {
                grid-template-columns: 1fr;
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
            .quick-stats {
                grid-template-columns: 1fr;
            }
            
            .kpi-value {
                font-size: 1.75rem;
            }
            
            .export-buttons {
                flex-wrap: wrap;
                justify-content: center;
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
        
        /* Animation Classes */
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .chart-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #6b7280;
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
                    <i data-lucide="bar-chart-3" style="width: 32px; height: 32px; color: var(--primary-color);"></i>
                    <h1>Raporlar ve Analytics</h1>
                </div>
                <div class="export-buttons">
                    <button class="export-btn" onclick="printReport()">
                        <i data-lucide="printer" style="width: 16px; height: 16px;"></i>
                        <span class="d-none d-md-inline">Yazdır</span>
                    </button>
                    <button class="export-btn" onclick="exportToPDF()">
                        <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                        <span class="d-none d-md-inline">PDF</span>
                    </button>
                    <button class="export-btn" onclick="exportToExcel()">
                        <i data-lucide="file-spreadsheet" style="width: 16px; height: 16px;"></i>
                        <span class="d-none d-md-inline">Excel</span>
                    </button>
                </div>
            </div>
            
            <!-- Report Controls -->
            <div class="report-controls">
                <div class="control-group">
                    <label class="form-label mb-0">Tarih Aralığı:</label>
                    <input type="text" id="dateRangePicker" class="date-picker" value="01/10/2025 - 31/10/2025">
                </div>
                <div class="control-group">
                    <button class="export-btn" onclick="refreshData()">
                        <i data-lucide="refresh-cw" style="width: 16px; height: 16px;"></i>
                        <span>Yenile</span>
                    </button>
                    <button class="export-btn" onclick="scheduleReport()">
                        <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                        <span>Zamanla</span>
                    </button>
                </div>
            </div>
            
            <!-- Report Tabs -->
            <div class="report-tabs">
                <button class="report-tab active" data-report="sales">
                    <i data-lucide="trending-up" style="width: 16px; height: 16px;"></i>
                    <span>Satış Raporları</span>
                </button>
                <button class="report-tab" data-report="products">
                    <i data-lucide="package" style="width: 16px; height: 16px;"></i>
                    <span>Ürün Performansı</span>
                </button>
                <button class="report-tab" data-report="customers">
                    <i data-lucide="users" style="width: 16px; height: 16px;"></i>
                    <span>Müşteri Analytics</span>
                </button>
                <button class="report-tab" data-report="financial">
                    <i data-lucide="dollar-sign" style="width: 16px; height: 16px;"></i>
                    <span>Finansal Raporlar</span>
                </button>
                <button class="report-tab" data-report="inventory">
                    <i data-lucide="archive" style="width: 16px; height: 16px;"></i>
                    <span>Stok Raporları</span>
                </button>
                <button class="report-tab" data-report="marketing">
                    <i data-lucide="megaphone" style="width: 16px; height: 16px;"></i>
                    <span>Pazarlama</span>
                </button>
            </div>
            
            <!-- Sales Reports -->
            <div class="report-content active" id="salesReport">
                <!-- KPI Summary -->
                <div class="kpi-summary">
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Toplam Satış</div>
                            <div class="kpi-icon">
                                <i data-lucide="trending-up" style="width: 20px; height: 20px;"></i>
                            </div>
                        </div>
                        <div class="kpi-value" id="totalSales">
                            <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                        </div>
                        <div class="kpi-change positive">
                            <i data-lucide="arrow-up" style="width: 16px; height: 16px;"></i>
                            <span>+15.2% önceki döneme göre</span>
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Sipariş Sayısı</div>
                            <div class="kpi-icon">
                                <i data-lucide="shopping-cart" style="width: 20px; height: 20px;"></i>
                            </div>
                        </div>
                        <div class="kpi-value" id="totalOrders">
                            <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                        </div>
                        <div class="kpi-change positive">
                            <i data-lucide="arrow-up" style="width: 16px; height: 16px;"></i>
                            <span>+8.7% önceki döneme göre</span>
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Ortalama Sipariş</div>
                            <div class="kpi-icon">
                                <i data-lucide="calculator" style="width: 20px; height: 20px;"></i>
                            </div>
                        </div>
                        <div class="kpi-value" id="avgOrderValue">
                            <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                        </div>
                        <div class="kpi-change positive">
                            <i data-lucide="arrow-up" style="width: 16px; height: 16px;"></i>
                            <span>+5.3% önceki döneme göre</span>
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Dönüşüm Oranı</div>
                            <div class="kpi-icon">
                                <i data-lucide="target" style="width: 20px; height: 20px;"></i>
                            </div>
                        </div>
                        <div class="kpi-value" id="conversionRate">
                            <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                        </div>
                        <div class="kpi-change negative">
                            <i data-lucide="arrow-down" style="width: 16px; height: 16px;"></i>
                            <span>-2.1% önceki döneme göre</span>
                        </div>
                    </div>
                </div>
                
                <!-- Sales Charts -->
                <div class="chart-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Satış Trendi</h3>
                            <div class="chart-controls">
                                <button class="chart-control-btn active" data-period="daily">Günlük</button>
                                <button class="chart-control-btn" data-period="weekly">Haftalık</button>
                                <button class="chart-control-btn" data-period="monthly">Aylık</button>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="salesTrendChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Kategori Dağılımı</h3>
                        </div>
                        <div class="chart-container small">
                            <canvas id="categoryDistributionChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Top Products Table -->
                <div class="report-table-card">
                    <div class="table-header">
                        <h3>En Çok Satan Ürünler</h3>
                        <span class="badge bg-light text-dark">Son 30 Gün</span>
                    </div>
                    <div class="table-responsive">
                        <table class="table modern-table">
                            <thead>
                                <tr>
                                    <th>Ürün Adı</th>
                                    <th>Kategori</th>
                                    <th>Satış Adedi</th>
                                    <th>Toplam Gelir</th>
                                    <th>Kar Marjı</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody id="topProductsTable">
                                <tr>
                                    <td colspan="6" class="loading-spinner">
                                        <i data-lucide="loader-2" class="spin" style="width: 20px; height: 20px;"></i>
                                        <span>Yükleniyor...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Product Performance Reports -->
            <div class="report-content" id="productsReport">
                <div class="performance-grid">
                    <div class="performance-card">
                        <div class="performance-header">
                            <div class="performance-title">Ürün Satış Performansı</div>
                            <div class="performance-trend up">
                                <i data-lucide="trending-up" style="width: 16px; height: 16px;"></i>
                                <span>+12%</span>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 78%;"></div>
                        </div>
                        <div class="text-muted small">Hedefin %78'i tamamlandı</div>
                    </div>
                    
                    <div class="performance-card">
                        <div class="performance-header">
                            <div class="performance-title">Stok Devir Hızı</div>
                            <div class="performance-trend up">
                                <i data-lucide="rotate-cw" style="width: 16px; height: 16px;"></i>
                                <span>+5%</span>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 65%;"></div>
                        </div>
                        <div class="text-muted small">Ortalama 45 gün</div>
                    </div>
                    
                    <div class="performance-card">
                        <div class="performance-header">
                            <div class="performance-title">Yeni Ürün Performansı</div>
                            <div class="performance-trend down">
                                <i data-lucide="trending-down" style="width: 16px; height: 16px;"></i>
                                <span>-3%</span>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 42%;"></div>
                        </div>
                        <div class="text-muted small">Beklentilerin %42'si</div>
                    </div>
                </div>
                
                <div class="chart-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Ürün Kategorisi Performansı</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="productCategoryChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Marka Dağılımı</h3>
                        </div>
                        <div class="chart-container small">
                            <canvas id="brandDistributionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Customer Analytics -->
            <div class="report-content" id="customersReport">
                <div class="quick-stats">
                    <div class="quick-stat">
                        <div class="quick-stat-icon">
                            <i data-lucide="users" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="quick-stat-value">1,247</div>
                        <div class="quick-stat-label">Toplam Müşteri</div>
                    </div>
                    
                    <div class="quick-stat">
                        <div class="quick-stat-icon">
                            <i data-lucide="crown" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="quick-stat-value">187</div>
                        <div class="quick-stat-label">VIP Müşteri</div>
                    </div>
                    
                    <div class="quick-stat">
                        <div class="quick-stat-icon">
                            <i data-lucide="user-plus" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="quick-stat-value">+42</div>
                        <div class="quick-stat-label">Bu Ay Yeni</div>
                    </div>
                    
                    <div class="quick-stat">
                        <div class="quick-stat-icon">
                            <i data-lucide="repeat" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="quick-stat-value">67%</div>
                        <div class="quick-stat-label">Tekrar Müşteri</div>
                    </div>
                </div>
                
                <div class="chart-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Müşteri Segmentasyonu</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="customerSegmentChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Şehir Dağılımı</h3>
                        </div>
                        <div class="chart-container small">
                            <canvas id="cityDistributionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Financial Reports -->
            <div class="report-content" id="financialReport">
                <div class="comparison-grid">
                    <div class="comparison-card">
                        <div class="comparison-title">Gelir Karşılaştırması</div>
                        <div class="comparison-metrics">
                            <div class="metric-group">
                                <div class="metric-label">Bu Ay</div>
                                <div class="metric-value">₺486,750</div>
                            </div>
                            <div class="metric-group">
                                <div class="metric-label">Geçen Ay</div>
                                <div class="metric-value">₺422,340</div>
                            </div>
                            <div class="metric-group">
                                <div class="metric-label">Değişim</div>
                                <div class="metric-value" style="color: var(--success-color);">+15.2%</div>
                            </div>
                        </div>
                        <div class="comparison-chart">
                            <canvas id="revenueComparisonChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="comparison-card">
                        <div class="comparison-title">Kar Marjı Analizi</div>
                        <div class="comparison-metrics">
                            <div class="metric-group">
                                <div class="metric-label">Brüt Kar</div>
                                <div class="metric-value">₺195,400</div>
                            </div>
                            <div class="metric-group">
                                <div class="metric-label">Net Kar</div>
                                <div class="metric-value">₺146,800</div>
                            </div>
                            <div class="metric-group">
                                <div class="metric-label">Marj</div>
                                <div class="metric-value">30.1%</div>
                            </div>
                        </div>
                        <div class="comparison-chart">
                            <canvas id="profitMarginChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="chart-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Gelir ve Gider Analizi</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="revenueExpenseChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Nakit Akışı</h3>
                        </div>
                        <div class="chart-container small">
                            <canvas id="cashFlowChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Inventory Reports -->
            <div class="report-content" id="inventoryReport">
                <div class="kpi-summary">
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Toplam Stok Değeri</div>
                            <div class="kpi-icon">
                                <i data-lucide="archive" style="width: 20px; height: 20px;"></i>
                            </div>
                        </div>
                        <div class="kpi-value">₺1,245,680</div>
                        <div class="kpi-change neutral">
                            <i data-lucide="minus" style="width: 16px; height: 16px;"></i>
                            <span>Değişim yok</span>
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Düşük Stoklu Ürün</div>
                            <div class="kpi-icon">
                                <i data-lucide="alert-triangle" style="width: 20px; height: 20px;"></i>
                            </div>
                        </div>
                        <div class="kpi-value">23</div>
                        <div class="kpi-change negative">
                            <i data-lucide="arrow-up" style="width: 16px; height: 16px;"></i>
                            <span>+5 son hafta</span>
                        </div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">Stok Devir Oranı</div>
                            <div class="kpi-icon">
                                <i data-lucide="rotate-cw" style="width: 20px; height: 20px;"></i>
                            </div>
                        </div>
                        <div class="kpi-value">8.4x</div>
                        <div class="kpi-change positive">
                            <i data-lucide="arrow-up" style="width: 16px; height: 16px;"></i>
                            <span>+0.3 geçen aya göre</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-table-card">
                    <div class="table-header">
                        <h3>Stok Durumu Raporu</h3>
                    </div>
                    <div class="table-responsive">
                        <table class="table modern-table">
                            <thead>
                                <tr>
                                    <th>Ürün Adı</th>
                                    <th>Mevcut Stok</th>
                                    <th>Minimum Stok</th>
                                    <th>Stok Değeri</th>
                                    <th>Son Hareket</th>
                                    <th>Durum</th>
                                </tr>
                            </thead>
                            <tbody id="inventoryTable">
                                <tr>
                                    <td colspan="6" class="loading-spinner">
                                        <i data-lucide="loader-2" class="spin" style="width: 20px; height: 20px;"></i>
                                        <span>Yükleniyor...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Marketing Reports -->
            <div class="report-content" id="marketingReport">
                <div class="quick-stats">
                    <div class="quick-stat">
                        <div class="quick-stat-icon">
                            <i data-lucide="megaphone" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="quick-stat-value">12</div>
                        <div class="quick-stat-label">Aktif Kampanya</div>
                    </div>
                    
                    <div class="quick-stat">
                        <div class="quick-stat-icon">
                            <i data-lucide="mail" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="quick-stat-value">85%</div>
                        <div class="quick-stat-label">Email Açılma</div>
                    </div>
                    
                    <div class="quick-stat">
                        <div class="quick-stat-icon">
                            <i data-lucide="click" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="quick-stat-value">3.2%</div>
                        <div class="quick-stat-label">Tıklama Oranı</div>
                    </div>
                    
                    <div class="quick-stat">
                        <div class="quick-stat-icon">
                            <i data-lucide="target" style="width: 24px; height: 24px;"></i>
                        </div>
                        <div class="quick-stat-value">₺45,200</div>
                        <div class="quick-stat-label">Kampanya Geliri</div>
                    </div>
                </div>
                
                <div class="chart-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Kampanya Performansı</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="campaignPerformanceChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Pazarlama Kanalları</h3>
                        </div>
                        <div class="chart-container small">
                            <canvas id="marketingChannelsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery for DateRangePicker -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Component Loader -->
    <script src="/components/js/component-loader.js"></script>
    
    <script>
        // Reports Manager Class
        class ReportsManager {
            constructor() {
                this.charts = {};
                this.currentReport = 'sales';
                this.dateRange = {
                    start: moment().subtract(29, 'days'),
                    end: moment()
                };
                this.init();
            }
            
            init() {
                this.initLucideIcons();
                this.initDateRangePicker();
                this.initEventListeners();
                this.initCharts();
                this.loadReportData();
            }
            
            initLucideIcons() {
                lucide.createIcons();
            }
            
            initDateRangePicker() {
                $('#dateRangePicker').daterangepicker({
                    startDate: this.dateRange.start,
                    endDate: this.dateRange.end,
                    ranges: {
                        'Bugün': [moment(), moment()],
                        'Dün': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        'Son 7 Gün': [moment().subtract(6, 'days'), moment()],
                        'Son 30 Gün': [moment().subtract(29, 'days'), moment()],
                        'Bu Ay': [moment().startOf('month'), moment().endOf('month')],
                        'Geçen Ay': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    },
                    locale: {
                        format: 'DD/MM/YYYY',
                        separator: ' - ',
                        applyLabel: 'Uygula',
                        cancelLabel: 'İptal',
                        fromLabel: 'Başlangıç',
                        toLabel: 'Bitiş',
                        customRangeLabel: 'Özel Aralık',
                        weekLabel: 'H',
                        daysOfWeek: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
                        monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
                        firstDay: 1
                    }
                }, (start, end) => {
                    this.dateRange.start = start;
                    this.dateRange.end = end;
                    this.loadReportData();
                });
            }
            
            initEventListeners() {
                // Report tabs
                document.querySelectorAll('.report-tab').forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
                        document.querySelectorAll('.report-content').forEach(c => c.classList.remove('active'));
                        
                        e.target.classList.add('active');
                        this.currentReport = e.target.dataset.report;
                        document.getElementById(this.currentReport + 'Report').classList.add('active');
                        
                        this.loadReportData();
                    });
                });
                
                // Chart period controls
                document.querySelectorAll('.chart-control-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const container = e.target.closest('.chart-card');
                        container.querySelectorAll('.chart-control-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        
                        this.updateChartPeriod(container.querySelector('canvas').id, e.target.dataset.period);
                    });
                });
                
                // Touch gestures for mobile tab swiping
                this.initTouchGestures();
            }
            
            initTouchGestures() {
                let startX = 0;
                let currentX = 0;
                
                const reportTabs = document.querySelector('.report-tabs');
                
                reportTabs.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                });
                
                reportTabs.addEventListener('touchmove', (e) => {
                    currentX = e.touches[0].clientX;
                });
                
                reportTabs.addEventListener('touchend', (e) => {
                    const diffX = startX - currentX;
                    
                    if (Math.abs(diffX) > 50) {
                        const tabs = document.querySelectorAll('.report-tab');
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
                // Sales Trend Chart
                const salesCtx = document.getElementById('salesTrendChart');
                if (salesCtx) {
                    this.charts.salesTrend = new Chart(salesCtx, {
                        type: 'line',
                        data: {
                            labels: this.generateDateLabels('daily'),
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
                                pointRadius: 6
                            }]
                        },
                        options: this.getChartOptions('line')
                    });
                }
                
                // Category Distribution Chart
                const categoryCtx = document.getElementById('categoryDistributionChart');
                if (categoryCtx) {
                    this.charts.categoryDistribution = new Chart(categoryCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Eğitici Oyuncaklar', 'Bebek Oyuncakları', 'Dış Mekan', 'Puzzle', 'Kitaplar'],
                            datasets: [{
                                data: [35, 28, 18, 12, 7],
                                backgroundColor: ['#667eea', '#764ba2', '#22c55e', '#f59e0b', '#ef4444'],
                                borderWidth: 0,
                                hoverOffset: 4
                            }]
                        },
                        options: this.getChartOptions('doughnut')
                    });
                }
                
                // Initialize other charts similarly...
                this.initProductCharts();
                this.initCustomerCharts();
                this.initFinancialCharts();
                this.initMarketingCharts();
            }
            
            initProductCharts() {
                // Product Category Chart
                const productCtx = document.getElementById('productCategoryChart');
                if (productCtx) {
                    this.charts.productCategory = new Chart(productCtx, {
                        type: 'bar',
                        data: {
                            labels: ['LEGO', 'Barbie', 'Hot Wheels', 'Puzzle', 'Kitap', 'Bebek'],
                            datasets: [{
                                label: 'Satış Adedi',
                                data: [245, 189, 167, 134, 98, 76],
                                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                                borderColor: '#667eea',
                                borderWidth: 1,
                                borderRadius: 8
                            }]
                        },
                        options: this.getChartOptions('bar')
                    });
                }
                
                // Brand Distribution Chart
                const brandCtx = document.getElementById('brandDistributionChart');
                if (brandCtx) {
                    this.charts.brandDistribution = new Chart(brandCtx, {
                        type: 'pie',
                        data: {
                            labels: ['LEGO', 'Mattel', 'Hasbro', 'Diğer'],
                            datasets: [{
                                data: [40, 25, 20, 15],
                                backgroundColor: ['#667eea', '#22c55e', '#f59e0b', '#ef4444'],
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: this.getChartOptions('pie')
                    });
                }
            }
            
            initCustomerCharts() {
                // Customer Segment Chart
                const segmentCtx = document.getElementById('customerSegmentChart');
                if (segmentCtx) {
                    this.charts.customerSegment = new Chart(segmentCtx, {
                        type: 'bar',
                        data: {
                            labels: ['VIP', 'Regular', 'Yeni', 'Pasif'],
                            datasets: [{
                                label: 'Müşteri Sayısı',
                                data: [187, 654, 298, 108],
                                backgroundColor: ['#ffd700', '#22c55e', '#3b82f6', '#6b7280'],
                                borderRadius: 8
                            }]
                        },
                        options: this.getChartOptions('bar')
                    });
                }
                
                // City Distribution Chart
                const cityCtx = document.getElementById('cityDistributionChart');
                if (cityCtx) {
                    this.charts.cityDistribution = new Chart(cityCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Diğer'],
                            datasets: [{
                                data: [32, 18, 14, 12, 24],
                                backgroundColor: ['#667eea', '#22c55e', '#f59e0b', '#ef4444', '#6b7280'],
                                borderWidth: 0
                            }]
                        },
                        options: this.getChartOptions('doughnut')
                    });
                }
            }
            
            initFinancialCharts() {
                // Revenue Comparison Chart (small)
                const revenueCompCtx = document.getElementById('revenueComparisonChart');
                if (revenueCompCtx) {
                    this.charts.revenueComparison = new Chart(revenueCompCtx, {
                        type: 'bar',
                        data: {
                            labels: ['Geçen Ay', 'Bu Ay'],
                            datasets: [{
                                data: [422340, 486750],
                                backgroundColor: ['#6b7280', '#667eea'],
                                borderRadius: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { display: false },
                                y: { display: false }
                            }
                        }
                    });
                }
                
                // Revenue vs Expense Chart
                const revenueExpenseCtx = document.getElementById('revenueExpenseChart');
                if (revenueExpenseCtx) {
                    this.charts.revenueExpense = new Chart(revenueExpenseCtx, {
                        type: 'line',
                        data: {
                            labels: this.generateDateLabels('monthly'),
                            datasets: [{
                                label: 'Gelir',
                                data: [420000, 445000, 398000, 467000, 486750],
                                borderColor: '#22c55e',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                fill: true,
                                tension: 0.4
                            }, {
                                label: 'Gider',
                                data: [285000, 310000, 275000, 320000, 340000],
                                borderColor: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                fill: true,
                                tension: 0.4
                            }]
                        },
                        options: this.getChartOptions('line')
                    });
                }
                
                // Cash Flow Chart
                const cashFlowCtx = document.getElementById('cashFlowChart');
                if (cashFlowCtx) {
                    this.charts.cashFlow = new Chart(cashFlowCtx, {
                        type: 'bar',
                        data: {
                            labels: ['Hf1', 'Hf2', 'Hf3', 'Hf4'],
                            datasets: [{
                                label: 'Nakit Akışı',
                                data: [125000, 145000, 98000, 167000],
                                backgroundColor: '#3b82f6',
                                borderRadius: 6
                            }]
                        },
                        options: this.getChartOptions('bar')
                    });
                }
            }
            
            initMarketingCharts() {
                // Campaign Performance Chart
                const campaignCtx = document.getElementById('campaignPerformanceChart');
                if (campaignCtx) {
                    this.charts.campaignPerformance = new Chart(campaignCtx, {
                        type: 'line',
                        data: {
                            labels: ['1 Hafta', '2 Hafta', '3 Hafta', '4 Hafta'],
                            datasets: [{
                                label: 'Tıklama Oranı (%)',
                                data: [2.8, 3.2, 3.1, 3.4],
                                borderColor: '#667eea',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                yAxisID: 'y'
                            }, {
                                label: 'Dönüşüm Oranı (%)',
                                data: [1.2, 1.8, 1.6, 2.1],
                                borderColor: '#22c55e',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                yAxisID: 'y1'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: { mode: 'index', intersect: false },
                            scales: {
                                x: { display: true },
                                y: { type: 'linear', display: true, position: 'left' },
                                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
                            }
                        }
                    });
                }
                
                // Marketing Channels Chart
                const channelsCtx = document.getElementById('marketingChannelsChart');
                if (channelsCtx) {
                    this.charts.marketingChannels = new Chart(channelsCtx, {
                        type: 'pie',
                        data: {
                            labels: ['Email', 'SMS', 'Social Media', 'Google Ads'],
                            datasets: [{
                                data: [45, 25, 20, 10],
                                backgroundColor: ['#667eea', '#22c55e', '#f59e0b', '#ef4444'],
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: this.getChartOptions('pie')
                    });
                }
            }
            
            getChartOptions(type) {
                const baseOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: type === 'doughnut' || type === 'pie' ? 'bottom' : 'top',
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
                            borderColor: '#667eea',
                            borderWidth: 1,
                            cornerRadius: 8
                        }
                    }
                };
                
                if (type === 'line' || type === 'bar') {
                    baseOptions.scales = {
                        x: {
                            grid: { display: false },
                            ticks: { color: '#6b7280' }
                        },
                        y: {
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                            ticks: { color: '#6b7280' }
                        }
                    };
                }
                
                if (type === 'doughnut' || type === 'pie') {
                    baseOptions.cutout = type === 'doughnut' ? '60%' : '0%';
                }
                
                return baseOptions;
            }
            
            generateDateLabels(period) {
                const labels = [];
                const now = moment();
                
                switch(period) {
                    case 'daily':
                        for(let i = 6; i >= 0; i--) {
                            const date = moment(now).subtract(i, 'days');
                            labels.push(date.format('DD/MM'));
                        }
                        break;
                    case 'weekly':
                        for(let i = 3; i >= 0; i--) {
                            const date = moment(now).subtract(i, 'weeks');
                            labels.push('Hafta ' + (4-i));
                        }
                        break;
                    case 'monthly':
                        for(let i = 4; i >= 0; i--) {
                            const date = moment(now).subtract(i, 'months');
                            labels.push(date.format('MMM'));
                        }
                        break;
                }
                
                return labels;
            }
            
            async loadReportData() {
                try {
                    // Simulate loading based on current report
                    switch(this.currentReport) {
                        case 'sales':
                            await this.loadSalesData();
                            break;
                        case 'products':
                            await this.loadProductData();
                            break;
                        case 'customers':
                            await this.loadCustomerData();
                            break;
                        case 'financial':
                            await this.loadFinancialData();
                            break;
                        case 'inventory':
                            await this.loadInventoryData();
                            break;
                        case 'marketing':
                            await this.loadMarketingData();
                            break;
                    }
                } catch (error) {
                    console.error('Report data loading error:', error);
                    this.showErrorMessage('Rapor verileri yüklenirken hata oluştu.');
                }
            }
            
            async loadSalesData() {
                // Simulate API calls
                setTimeout(() => {
                    document.getElementById('totalSales').textContent = '₺486,750';
                    document.getElementById('totalOrders').textContent = '1,247';
                    document.getElementById('avgOrderValue').textContent = '₺390';
                    document.getElementById('conversionRate').textContent = '4.2%';
                    
                    // Update charts
                    if (this.charts.salesTrend) {
                        this.charts.salesTrend.data.datasets[0].data = [45000, 52000, 38000, 61000, 55000, 67000, 48000];
                        this.charts.salesTrend.update('none');
                    }
                    
                    // Load top products table
                    this.loadTopProductsTable();
                }, 1000);
            }
            
            loadTopProductsTable() {
                const tbody = document.getElementById('topProductsTable');
                const sampleProducts = [
                    { name: 'LEGO Classic Yaratıcı Parçalar', category: 'Eğitici', sales: 245, revenue: 98000, margin: '32%', trend: 'up' },
                    { name: 'Barbie Rüya Evi', category: 'Bebek', sales: 189, revenue: 75600, margin: '28%', trend: 'up' },
                    { name: 'Hot Wheels 5\'li Set', category: 'Araba', sales: 167, revenue: 33400, margin: '25%', trend: 'down' },
                    { name: 'Puzzle 1000 Parça', category: 'Puzzle', sales: 134, revenue: 26800, margin: '35%', trend: 'up' },
                    { name: 'Çocuk Kitabı Seti', category: 'Kitap', sales: 98, revenue: 19600, margin: '40%', trend: 'up' }
                ];
                
                tbody.innerHTML = sampleProducts.map(product => {
                    const trendIcon = product.trend === 'up' ? 'trending-up' : 'trending-down';
                    const trendColor = product.trend === 'up' ? 'text-success' : 'text-danger';
                    
                    return `
                        <tr>
                            <td><strong>${product.name}</strong></td>
                            <td><span class="badge bg-light text-dark">${product.category}</span></td>
                            <td>${product.sales}</td>
                            <td>₺${product.revenue.toLocaleString('tr-TR')}</td>
                            <td>${product.margin}</td>
                            <td>
                                <i data-lucide="${trendIcon}" class="${trendColor}" style="width: 16px; height: 16px;"></i>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                lucide.createIcons();
            }
            
            async loadProductData() {
                // Simulate product data loading
                setTimeout(() => {
                    if (this.charts.productCategory) {
                        this.charts.productCategory.data.datasets[0].data = [245, 189, 167, 134, 98, 76];
                        this.charts.productCategory.update('none');
                    }
                }, 800);
            }
            
            async loadCustomerData() {
                // Customer data already set in chart initialization
            }
            
            async loadFinancialData() {
                // Financial data already set in chart initialization
            }
            
            async loadInventoryData() {
                const tbody = document.getElementById('inventoryTable');
                const sampleInventory = [
                    { name: 'LEGO Classic Yaratıcı Parçalar', current: 15, minimum: 20, value: 45000, lastMove: '2025-10-30', status: 'low' },
                    { name: 'Barbie Rüya Evi', current: 8, minimum: 15, value: 32000, lastMove: '2025-10-29', status: 'critical' },
                    { name: 'Hot Wheels 5\'li Set', current: 45, minimum: 25, value: 11250, lastMove: '2025-10-31', status: 'good' },
                    { name: 'Puzzle 1000 Parça', current: 67, minimum: 30, value: 13400, lastMove: '2025-10-30', status: 'good' },
                    { name: 'Çocuk Kitabı Seti', current: 12, minimum: 20, value: 2400, lastMove: '2025-10-28', status: 'low' }
                ];
                
                tbody.innerHTML = sampleInventory.map(item => {
                    let statusBadge, statusText;
                    
                    if (item.status === 'critical') {
                        statusBadge = 'bg-danger';
                        statusText = 'Kritik';
                    } else if (item.status === 'low') {
                        statusBadge = 'bg-warning';
                        statusText = 'Düşük';
                    } else {
                        statusBadge = 'bg-success';
                        statusText = 'İyi';
                    }
                    
                    return `
                        <tr>
                            <td><strong>${item.name}</strong></td>
                            <td>${item.current}</td>
                            <td>${item.minimum}</td>
                            <td>₺${item.value.toLocaleString('tr-TR')}</td>
                            <td><small>${moment(item.lastMove).format('DD/MM/YYYY')}</small></td>
                            <td><span class="badge ${statusBadge}">${statusText}</span></td>
                        </tr>
                    `;
                }).join('');
            }
            
            async loadMarketingData() {
                // Marketing data already set in chart initialization
            }
            
            updateChartPeriod(chartId, period) {
                const chartName = chartId.replace('Chart', '');
                
                if (this.charts[chartName]) {
                    this.charts[chartName].data.labels = this.generateDateLabels(period);
                    // Update data based on period
                    this.charts[chartName].update('active');
                }
            }
            
            showErrorMessage(message) {
                this.showToast(message, 'danger');
            }
            
            showSuccessMessage(message) {
                this.showToast(message, 'success');
            }
            
            showToast(message, type) {
                const toast = document.createElement('div');
                toast.className = 'position-fixed top-0 end-0 p-3';
                toast.style.zIndex = '9999';
                toast.innerHTML = `
                    <div class="toast show" role="alert">
                        <div class="toast-header bg-${type} text-white">
                            <strong class="me-auto">${type === 'success' ? 'Başarılı' : 'Hata'}</strong>
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
        
        // Global functions
        function refreshData() {
            reportsManager.loadReportData();
            reportsManager.showSuccessMessage('Veriler başarıyla yenilendi.');
        }
        
        function printReport() {
            window.print();
        }
        
        function exportToPDF() {
            reportsManager.showSuccessMessage('PDF raporu oluşturuluyor...');
            // Implement PDF export
        }
        
        function exportToExcel() {
            reportsManager.showSuccessMessage('Excel raporu oluşturuluyor...');
            // Implement Excel export
        }
        
        function scheduleReport() {
            alert('Zamanlanmış rapor özelliği geliştirme aşamasındadır.');
        }
        
        // Initialize Reports Manager
        document.addEventListener('DOMContentLoaded', function() {
            window.reportsManager = new ReportsManager();
        });
    </script>
</body>
</html>