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
    <title>Müşteri Yönetimi | Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
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
        
        /* Customer Stats Cards */
        .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: var(--card-shadow);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--card-hover-shadow);
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-gradient);
        }
        
        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .stat-title {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(102, 126, 234, 0.1);
            color: var(--primary-color);
        }
        
        .stat-value {
            font-size: 2.25rem;
            font-weight: 800;
            color: #1f2937;
            margin: 0.75rem 0;
            line-height: 1;
        }
        
        .stat-change {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .stat-change.positive {
            color: var(--success-color);
        }
        
        .stat-change.negative {
            color: var(--danger-color);
        }
        
        /* Search and Filter Bar */
        .filter-section {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: var(--card-shadow);
        }
        
        .search-bar {
            position: relative;
            flex: 1;
            max-width: 400px;
        }
        
        .search-bar input {
            border-radius: 12px;
            border: 2px solid #e5e7eb;
            padding: 0.75rem 1rem 0.75rem 3rem;
            font-size: 0.875rem;
            transition: all 0.2s ease;
            width: 100%;
        }
        
        .search-bar input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
        }
        
        .filter-buttons {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 0.5rem 1.25rem;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 10px;
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        
        .filter-btn.active,
        .filter-btn:hover {
            border-color: var(--primary-color);
            background: var(--primary-color);
            color: white;
        }
        
        /* Customer Table */
        .customer-table-container {
            background: white;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
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
        
        .bulk-actions {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }
        
        .bulk-select {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: white;
            padding: 0.5rem;
        }
        
        .bulk-select option {
            background: #1f2937;
            color: white;
        }
        
        .export-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s ease;
        }
        
        .export-btn:hover {
            background: rgba(255, 255, 255, 0.3);
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
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .modern-table tbody td {
            padding: 1rem;
            border-color: #f3f4f6;
            vertical-align: middle;
        }
        
        .modern-table tbody tr {
            transition: all 0.2s ease;
        }
        
        .modern-table tbody tr:hover {
            background: #f8f9fa;
            transform: scale(1.01);
        }
        
        /* Customer Card (Mobile) */
        .customer-card {
            background: white;
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            box-shadow: var(--card-shadow);
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .customer-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--card-hover-shadow);
        }
        
        .customer-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        
        .customer-info {
            flex: 1;
        }
        
        .customer-name {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.25rem;
        }
        
        .customer-email {
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .customer-badge {
            flex-shrink: 0;
            margin-left: 1rem;
        }
        
        .customer-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #f3f4f6;
        }
        
        .customer-stat {
            text-align: center;
        }
        
        .customer-stat-label {
            font-size: 0.75rem;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 500;
            margin-bottom: 0.25rem;
        }
        
        .customer-stat-value {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1f2937;
        }
        
        /* Action Buttons */
        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        .action-btn {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;
        }
        
        .action-btn.view {
            background: rgba(59, 130, 246, 0.1);
            color: var(--info-color);
        }
        
        .action-btn.edit {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning-color);
        }
        
        .action-btn.delete {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger-color);
        }
        
        .action-btn:hover {
            transform: scale(1.1);
            opacity: 0.8;
        }
        
        /* Customer Status Badges */
        .status-badge {
            padding: 0.375rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .status-badge.vip {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #92400e;
        }
        
        .status-badge.regular {
            background: rgba(34, 197, 94, 0.1);
            color: var(--success-color);
        }
        
        .status-badge.new {
            background: rgba(59, 130, 246, 0.1);
            color: var(--info-color);
        }
        
        .status-badge.inactive {
            background: rgba(107, 114, 128, 0.1);
            color: #6b7280;
        }
        
        /* Pagination */
        .pagination-container {
            display: flex;
            justify-content: between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: #f8f9fa;
            border-top: 1px solid #e5e7eb;
        }
        
        .pagination-info {
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .pagination {
            margin: 0;
        }
        
        .page-link {
            border: none;
            padding: 0.5rem 0.75rem;
            margin: 0 0.125rem;
            border-radius: 8px;
            color: #6b7280;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .page-link:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .page-item.active .page-link {
            background: var(--primary-color);
            color: white;
        }
        
        /* Modal Styles */
        .modal-content {
            border: none;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .modal-header {
            background: var(--primary-gradient);
            color: white;
            border-radius: 16px 16px 0 0;
            padding: 1.5rem 2rem;
        }
        
        .modal-title {
            font-weight: 600;
        }
        
        .btn-close {
            filter: invert(1);
        }
        
        .customer-detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 1.5rem 0;
        }
        
        .detail-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.25rem;
        }
        
        .detail-card h6 {
            color: #6b7280;
            font-size: 0.875rem;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }
        
        .detail-value {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
        }
        
        /* Swipe Actions (Mobile) */
        .swipe-container {
            position: relative;
            overflow: hidden;
        }
        
        .swipe-actions {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            background: var(--danger-color);
            color: white;
            padding: 0 1rem;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .swipe-container.swiped .swipe-actions {
            transform: translateX(0);
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
            
            .stats-cards {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .filter-section {
                padding: 1rem;
            }
            
            .filter-section .d-flex {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
            
            .search-bar {
                max-width: none;
            }
            
            .filter-buttons {
                justify-content: center;
            }
            
            .table-header {
                padding: 1rem 1.5rem;
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
            
            .bulk-actions {
                justify-content: center;
            }
            
            .modern-table {
                display: none;
            }
            
            .customer-cards {
                display: block;
            }
            
            .customer-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .pagination-container {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
        }
        
        @media (min-width: 769px) {
            .customer-cards {
                display: none;
            }
        }
        
        /* Touch Gestures */
        .touch-action {
            touch-action: pan-y;
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
                    <i data-lucide="users" style="width: 32px; height: 32px; color: var(--primary-color);"></i>
                    <h1>Müşteri Yönetimi</h1>
                </div>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCustomerModal">
                    <i data-lucide="user-plus" style="width: 20px; height: 20px;"></i>
                    <span class="d-none d-md-inline ms-2">Yeni Müşteri</span>
                </button>
            </div>
            
            <!-- Customer Stats -->
            <div class="stats-cards">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Toplam Müşteri</div>
                        <div class="stat-icon">
                            <i data-lucide="users" style="width: 20px; height: 20px;"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="totalCustomers">
                        <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="stat-change positive">
                        <i data-lucide="trending-up" style="width: 16px; height: 16px;"></i>
                        <span>+12 bu ay</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">VIP Müşteriler</div>
                        <div class="stat-icon">
                            <i data-lucide="crown" style="width: 20px; height: 20px;"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="vipCustomers">
                        <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="stat-change positive">
                        <i data-lucide="star" style="width: 16px; height: 16px;"></i>
                        <span>Premium</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Aktif Müşteri</div>
                        <div class="stat-icon">
                            <i data-lucide="user-check" style="width: 20px; height: 20px;"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="activeCustomers">
                        <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="stat-change positive">
                        <i data-lucide="activity" style="width: 16px; height: 16px;"></i>
                        <span>Son 30 gün</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Ortalama Sipariş</div>
                        <div class="stat-icon">
                            <i data-lucide="shopping-cart" style="width: 20px; height: 20px;"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="avgOrderValue">
                        <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                    </div>
                    <div class="stat-change positive">
                        <i data-lucide="turkish-lira" style="width: 16px; height: 16px;"></i>
                        <span>Müşteri başına</span>
                    </div>
                </div>
            </div>
            
            <!-- Search and Filter -->
            <div class="filter-section">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="search-bar">
                        <i data-lucide="search" class="search-icon" style="width: 20px; height: 20px;"></i>
                        <input type="text" id="customerSearch" placeholder="Müşteri ara (ad, email, telefon)..." class="form-control">
                    </div>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">Tümü</button>
                        <button class="filter-btn" data-filter="vip">VIP</button>
                        <button class="filter-btn" data-filter="regular">Regular</button>
                        <button class="filter-btn" data-filter="new">Yeni</button>
                        <button class="filter-btn" data-filter="inactive">Pasif</button>
                    </div>
                </div>
            </div>
            
            <!-- Customer Table -->
            <div class="customer-table-container">
                <div class="table-header">
                    <h3>Müşteri Listesi</h3>
                    <div class="bulk-actions">
                        <select class="bulk-select" id="bulkAction">
                            <option value="">Toplu İşlemler</option>
                            <option value="activate">Aktifleştir</option>
                            <option value="deactivate">Pasifleştir</option>
                            <option value="vip">VIP Yap</option>
                            <option value="delete">Sil</option>
                        </select>
                        <button class="export-btn" onclick="exportCustomers()">
                            <i data-lucide="download" style="width: 16px; height: 16px;"></i>
                            <span>Export</span>
                        </button>
                    </div>
                </div>
                
                <!-- Desktop Table -->
                <div class="table-responsive">
                    <table class="table modern-table">
                        <thead>
                            <tr>
                                <th width="40">
                                    <input type="checkbox" id="selectAll" class="form-check-input">
                                </th>
                                <th>Müşteri Bilgileri</th>
                                <th>İletişim</th>
                                <th>Durum</th>
                                <th>Son Sipariş</th>
                                <th>Toplam Harcama</th>
                                <th>Kayıt Tarihi</th>
                                <th width="120">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="customerTableBody">
                            <tr>
                                <td colspan="8" class="loading-spinner">
                                    <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px;"></i>
                                    <span>Müşteriler yükleniyor...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Mobile Cards -->
                <div class="customer-cards" id="customerCards">
                    <div class="loading-spinner">
                        <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px;"></i>
                        <span>Müşteriler yükleniyor...</span>
                    </div>
                </div>
                
                <!-- Pagination -->
                <div class="pagination-container">
                    <div class="pagination-info">
                        <span id="paginationInfo">1-20 / 150 müşteri gösteriliyor</span>
                    </div>
                    <nav>
                        <ul class="pagination" id="customerPagination">
                            <li class="page-item disabled">
                                <a class="page-link" href="#"><i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i></a>
                            </li>
                            <li class="page-item active"><a class="page-link" href="#">1</a></li>
                            <li class="page-item"><a class="page-link" href="#">2</a></li>
                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                            <li class="page-item">
                                <a class="page-link" href="#"><i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i></a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Customer Detail Modal -->
    <div class="modal fade" id="customerDetailModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Müşteri Detayları</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="customerDetailBody">
                    <div class="loading-spinner">
                        <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px;"></i>
                        <span>Müşteri bilgileri yükleniyor...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Add Customer Modal -->
    <div class="modal fade" id="addCustomerModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Yeni Müşteri Ekle</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addCustomerForm">
                        <div class="mb-3">
                            <label class="form-label">Ad Soyad *</label>
                            <input type="text" class="form-control" name="fullName" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">E-posta *</label>
                            <input type="email" class="form-control" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Telefon</label>
                            <input type="tel" class="form-control" name="phone">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Şehir</label>
                            <input type="text" class="form-control" name="city">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Müşteri Tipi</label>
                            <select class="form-select" name="customerType">
                                <option value="regular">Regular</option>
                                <option value="vip">VIP</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                    <button type="button" class="btn btn-primary" onclick="saveCustomer()">Kaydet</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Component Loader -->
    <script src="../components/js/component-loader.js"></script>
    
    <script>
        // Customer Manager Class
        class CustomerManager {
            constructor() {
                this.customers = [];
                this.currentPage = 1;
                this.itemsPerPage = 20;
                this.currentFilter = 'all';
                this.currentSearch = '';
                this.selectedCustomers = new Set();
                this.init();
            }
            
            init() {
                this.initLucideIcons();
                this.initEventListeners();
                this.loadCustomers();
                this.loadStats();
            }
            
            initLucideIcons() {
                lucide.createIcons();
            }
            
            initEventListeners() {
                // Search
                document.getElementById('customerSearch').addEventListener('input', (e) => {
                    this.currentSearch = e.target.value.toLowerCase();
                    this.currentPage = 1;
                    this.filterAndDisplayCustomers();
                });
                
                // Filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        this.currentFilter = e.target.dataset.filter;
                        this.currentPage = 1;
                        this.filterAndDisplayCustomers();
                    });
                });
                
                // Select all checkbox
                document.getElementById('selectAll').addEventListener('change', (e) => {
                    const checkboxes = document.querySelectorAll('input[name="customerSelect"]');
                    checkboxes.forEach(cb => {
                        cb.checked = e.target.checked;
                        if (e.target.checked) {
                            this.selectedCustomers.add(cb.value);
                        } else {
                            this.selectedCustomers.delete(cb.value);
                        }
                    });
                });
                
                // Bulk actions
                document.getElementById('bulkAction').addEventListener('change', (e) => {
                    if (e.target.value && this.selectedCustomers.size > 0) {
                        this.performBulkAction(e.target.value);
                        e.target.value = '';
                    }
                });
                
                // Touch gestures for mobile
                this.initTouchGestures();
            }
            
            initTouchGestures() {
                let startX = 0;
                let startY = 0;
                let currentElement = null;
                
                document.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    currentElement = e.target.closest('.customer-card');
                });
                
                document.addEventListener('touchmove', (e) => {
                    if (!currentElement) return;
                    
                    const currentX = e.touches[0].clientX;
                    const currentY = e.touches[0].clientY;
                    const diffX = startX - currentX;
                    const diffY = Math.abs(startY - currentY);
                    
                    // Only horizontal swipe
                    if (diffY < 50 && Math.abs(diffX) > 20) {
                        e.preventDefault();
                        
                        if (diffX > 0) {
                            currentElement.style.transform = `translateX(-${diffX}px)`;
                        }
                    }
                });
                
                document.addEventListener('touchend', (e) => {
                    if (!currentElement) return;
                    
                    const diffX = startX - e.changedTouches[0].clientX;
                    
                    if (diffX > 100) {
                        // Swipe left - show delete action
                        currentElement.classList.add('swiped');
                        setTimeout(() => {
                            currentElement.classList.remove('swiped');
                            currentElement.style.transform = '';
                        }, 2000);
                    } else {
                        currentElement.style.transform = '';
                    }
                    
                    currentElement = null;
                });
            }
            
            async loadStats() {
                try {
                    // Simulate loading stats
                    setTimeout(() => {
                        document.getElementById('totalCustomers').textContent = '847';
                        document.getElementById('vipCustomers').textContent = '92';
                        document.getElementById('activeCustomers').textContent = '678';
                        document.getElementById('avgOrderValue').textContent = '₺2,450';
                    }, 1000);
                } catch (error) {
                    console.error('Stats loading error:', error);
                }
            }
            
            async loadCustomers() {
                try {
                    // Simulate loading customers - replace with real API call
                    const sampleCustomers = this.generateSampleCustomers();
                    
                    setTimeout(() => {
                        this.customers = sampleCustomers;
                        this.filterAndDisplayCustomers();
                    }, 1500);
                    
                } catch (error) {
                    console.error('Customers loading error:', error);
                    this.showErrorMessage('Müşteri verileri yüklenirken hata oluştu.');
                }
            }
            
            generateSampleCustomers() {
                const names = ['Ahmet Yılmaz', 'Fatma Demir', 'Mehmet Kaya', 'Ayşe Şahin', 'Ali Özkan', 'Zeynep Arslan', 'Mustafa Çelik', 'Elif Koç', 'Ömer Aydın', 'Seda Öztürk'];
                const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Gaziantep', 'Konya', 'Kayseri', 'Mersin', 'Eskişehir'];
                const statuses = ['vip', 'regular', 'new', 'inactive'];
                const customers = [];
                
                for (let i = 1; i <= 150; i++) {
                    const name = names[Math.floor(Math.random() * names.length)];
                    const email = name.toLowerCase().replace(' ', '.') + i + '@example.com';
                    const phone = '+90 5' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
                    const city = cities[Math.floor(Math.random() * cities.length)];
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    const totalSpent = Math.floor(Math.random() * 50000) + 500;
                    const lastOrderDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
                    const registrationDate = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000);
                    const orderCount = Math.floor(Math.random() * 25) + 1;
                    
                    customers.push({
                        id: i,
                        name: name,
                        email: email,
                        phone: phone,
                        city: city,
                        status: status,
                        totalSpent: totalSpent,
                        lastOrderDate: lastOrderDate,
                        registrationDate: registrationDate,
                        orderCount: orderCount,
                        avgOrderValue: Math.floor(totalSpent / orderCount)
                    });
                }
                
                return customers;
            }
            
            filterAndDisplayCustomers() {
                let filteredCustomers = this.customers;
                
                // Apply status filter
                if (this.currentFilter !== 'all') {
                    filteredCustomers = filteredCustomers.filter(customer => 
                        customer.status === this.currentFilter
                    );
                }
                
                // Apply search filter
                if (this.currentSearch) {
                    filteredCustomers = filteredCustomers.filter(customer =>
                        customer.name.toLowerCase().includes(this.currentSearch) ||
                        customer.email.toLowerCase().includes(this.currentSearch) ||
                        customer.phone.includes(this.currentSearch) ||
                        customer.city.toLowerCase().includes(this.currentSearch)
                    );
                }
                
                // Calculate pagination
                const totalItems = filteredCustomers.length;
                const totalPages = Math.ceil(totalItems / this.itemsPerPage);
                const startIndex = (this.currentPage - 1) * this.itemsPerPage;
                const endIndex = startIndex + this.itemsPerPage;
                const pageCustomers = filteredCustomers.slice(startIndex, endIndex);
                
                // Display customers
                this.displayCustomersTable(pageCustomers);
                this.displayCustomersCards(pageCustomers);
                this.updatePagination(totalItems, totalPages);
            }
            
            displayCustomersTable(customers) {
                const tbody = document.getElementById('customerTableBody');
                
                if (customers.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Müşteri bulunamadı</td></tr>';
                    return;
                }
                
                tbody.innerHTML = customers.map(customer => {
                    const statusClass = this.getStatusClass(customer.status);
                    const statusText = this.getStatusText(customer.status);
                    
                    return `
                        <tr>
                            <td>
                                <input type="checkbox" name="customerSelect" value="${customer.id}" class="form-check-input">
                            </td>
                            <td>
                                <div>
                                    <strong>${customer.name}</strong>
                                    <div class="text-muted small">ID: #${customer.id}</div>
                                </div>
                            </td>
                            <td>
                                <div>${customer.email}</div>
                                <div class="text-muted small">${customer.phone}</div>
                                <div class="text-muted small">${customer.city}</div>
                            </td>
                            <td>
                                <span class="status-badge ${customer.status}">${statusText}</span>
                            </td>
                            <td>
                                <div>${customer.lastOrderDate.toLocaleDateString('tr-TR')}</div>
                                <div class="text-muted small">${customer.orderCount} sipariş</div>
                            </td>
                            <td>
                                <div>₺${customer.totalSpent.toLocaleString('tr-TR')}</div>
                                <div class="text-muted small">Ort: ₺${customer.avgOrderValue.toLocaleString('tr-TR')}</div>
                            </td>
                            <td>
                                <small>${customer.registrationDate.toLocaleDateString('tr-TR')}</small>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn view" onclick="viewCustomer(${customer.id})" title="Görüntüle">
                                        <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                                    </button>
                                    <button class="action-btn edit" onclick="editCustomer(${customer.id})" title="Düzenle">
                                        <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                                    </button>
                                    <button class="action-btn delete" onclick="deleteCustomer(${customer.id})" title="Sil">
                                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                // Reinitialize icons
                lucide.createIcons();
                
                // Add checkbox event listeners
                document.querySelectorAll('input[name="customerSelect"]').forEach(cb => {
                    cb.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.selectedCustomers.add(e.target.value);
                        } else {
                            this.selectedCustomers.delete(e.target.value);
                        }
                    });
                });
            }
            
            displayCustomersCards(customers) {
                const container = document.getElementById('customerCards');
                
                if (customers.length === 0) {
                    container.innerHTML = '<div class="text-center py-4">Müşteri bulunamadı</div>';
                    return;
                }
                
                container.innerHTML = customers.map(customer => {
                    const statusText = this.getStatusText(customer.status);
                    
                    return `
                        <div class="customer-card swipe-container touch-action" data-customer-id="${customer.id}">
                            <div class="customer-card-header">
                                <div class="customer-info">
                                    <div class="customer-name">${customer.name}</div>
                                    <div class="customer-email">${customer.email}</div>
                                </div>
                                <div class="customer-badge">
                                    <span class="status-badge ${customer.status}">${statusText}</span>
                                </div>
                            </div>
                            <div class="customer-stats">
                                <div class="customer-stat">
                                    <div class="customer-stat-label">Sipariş</div>
                                    <div class="customer-stat-value">${customer.orderCount}</div>
                                </div>
                                <div class="customer-stat">
                                    <div class="customer-stat-label">Harcama</div>
                                    <div class="customer-stat-value">₺${customer.totalSpent.toLocaleString('tr-TR')}</div>
                                </div>
                                <div class="customer-stat">
                                    <div class="customer-stat-label">Son Sipariş</div>
                                    <div class="customer-stat-value">${customer.lastOrderDate.toLocaleDateString('tr-TR')}</div>
                                </div>
                            </div>
                            <div class="swipe-actions">
                                <i data-lucide="trash-2" style="width: 20px; height: 20px;"></i>
                            </div>
                        </div>
                    `;
                }).join('');
                
                lucide.createIcons();
            }
            
            updatePagination(totalItems, totalPages) {
                // Update info
                const start = (this.currentPage - 1) * this.itemsPerPage + 1;
                const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);
                document.getElementById('paginationInfo').textContent = 
                    `${start}-${end} / ${totalItems} müşteri gösteriliyor`;
                
                // Update pagination buttons
                const pagination = document.getElementById('customerPagination');
                let paginationHTML = '';
                
                // Previous button
                paginationHTML += `
                    <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="customerManager.changePage(${this.currentPage - 1})">
                            <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
                        </a>
                    </li>
                `;
                
                // Page numbers
                const startPage = Math.max(1, this.currentPage - 2);
                const endPage = Math.min(totalPages, this.currentPage + 2);
                
                for (let i = startPage; i <= endPage; i++) {
                    paginationHTML += `
                        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" onclick="customerManager.changePage(${i})">${i}</a>
                        </li>
                    `;
                }
                
                // Next button
                paginationHTML += `
                    <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="customerManager.changePage(${this.currentPage + 1})">
                            <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
                        </a>
                    </li>
                `;
                
                pagination.innerHTML = paginationHTML;
                lucide.createIcons();
            }
            
            changePage(page) {
                this.currentPage = page;
                this.filterAndDisplayCustomers();
            }
            
            getStatusClass(status) {
                const classes = {
                    'vip': 'vip',
                    'regular': 'regular',
                    'new': 'new',
                    'inactive': 'inactive'
                };
                return classes[status] || 'regular';
            }
            
            getStatusText(status) {
                const texts = {
                    'vip': 'VIP',
                    'regular': 'Regular',
                    'new': 'Yeni',
                    'inactive': 'Pasif'
                };
                return texts[status] || 'Regular';
            }
            
            performBulkAction(action) {
                if (this.selectedCustomers.size === 0) {
                    alert('Lütfen en az bir müşteri seçin.');
                    return;
                }
                
                const actionTexts = {
                    'activate': 'aktifleştir',
                    'deactivate': 'pasifleştir',
                    'vip': 'VIP yap',
                    'delete': 'sil'
                };
                
                if (confirm(`Seçili ${this.selectedCustomers.size} müşteriyi ${actionTexts[action]}mek istediğinizden emin misiniz?`)) {
                    // Perform the action
                    console.log(`Performing ${action} on customers:`, Array.from(this.selectedCustomers));
                    
                    // Clear selection
                    this.selectedCustomers.clear();
                    document.getElementById('selectAll').checked = false;
                    document.querySelectorAll('input[name="customerSelect"]').forEach(cb => cb.checked = false);
                    
                    this.showSuccessMessage(`${this.selectedCustomers.size} müşteri başarıyla ${actionTexts[action]}ildi.`);
                }
            }
            
            showSuccessMessage(message) {
                this.showToast(message, 'success');
            }
            
            showErrorMessage(message) {
                this.showToast(message, 'danger');
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
        function viewCustomer(customerId) {
            const customer = customerManager.customers.find(c => c.id == customerId);
            if (!customer) return;
            
            const modal = document.getElementById('customerDetailModal');
            const body = document.getElementById('customerDetailBody');
            
            body.innerHTML = `
                <div class="customer-detail-grid">
                    <div class="detail-card">
                        <h6>Kişisel Bilgiler</h6>
                        <div class="detail-value">${customer.name}</div>
                        <div class="text-muted">${customer.email}</div>
                        <div class="text-muted">${customer.phone}</div>
                        <div class="text-muted">${customer.city}</div>
                    </div>
                    <div class="detail-card">
                        <h6>Müşteri Durumu</h6>
                        <span class="status-badge ${customer.status}">${customerManager.getStatusText(customer.status)}</span>
                    </div>
                    <div class="detail-card">
                        <h6>Sipariş İstatistikleri</h6>
                        <div class="detail-value">${customer.orderCount} Sipariş</div>
                        <div class="text-muted">Toplam: ₺${customer.totalSpent.toLocaleString('tr-TR')}</div>
                        <div class="text-muted">Ortalama: ₺${customer.avgOrderValue.toLocaleString('tr-TR')}</div>
                    </div>
                    <div class="detail-card">
                        <h6>Tarihler</h6>
                        <div class="detail-value">Kayıt: ${customer.registrationDate.toLocaleDateString('tr-TR')}</div>
                        <div class="text-muted">Son Sipariş: ${customer.lastOrderDate.toLocaleDateString('tr-TR')}</div>
                    </div>
                </div>
                <div class="mt-4">
                    <h6>Son Siparişler</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Sipariş No</th>
                                    <th>Tarih</th>
                                    <th>Tutar</th>
                                    <th>Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#${Math.floor(Math.random() * 10000)}</td>
                                    <td>${customer.lastOrderDate.toLocaleDateString('tr-TR')}</td>
                                    <td>₺${customer.avgOrderValue.toLocaleString('tr-TR')}</td>
                                    <td><span class="badge bg-success">Tamamlandı</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            new bootstrap.Modal(modal).show();
        }
        
        function editCustomer(customerId) {
            alert(`Müşteri ${customerId} düzenleme işlemi henüz geliştiriliyor.`);
        }
        
        function deleteCustomer(customerId) {
            if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
                customerManager.customers = customerManager.customers.filter(c => c.id != customerId);
                customerManager.filterAndDisplayCustomers();
                customerManager.showSuccessMessage('Müşteri başarıyla silindi.');
            }
        }
        
        function saveCustomer() {
            const form = document.getElementById('addCustomerForm');
            const formData = new FormData(form);
            
            // Validate required fields
            if (!formData.get('fullName') || !formData.get('email')) {
                alert('Lütfen gerekli alanları doldurun.');
                return;
            }
            
            // Simulate saving
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
                form.reset();
                customerManager.showSuccessMessage('Yeni müşteri başarıyla eklendi.');
                customerManager.loadCustomers();
            }, 500);
        }
        
        function exportCustomers() {
            customerManager.showSuccessMessage('Müşteri listesi CSV formatında indiriliyor...');
            // Implement actual export functionality here
        }
        
        // Initialize Customer Manager
        document.addEventListener('DOMContentLoaded', function() {
            window.customerManager = new CustomerManager();
        });
    </script>
</body>
</html>