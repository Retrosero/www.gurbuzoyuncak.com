<?php
require_once '../backend/config/database.php';
require_once '../backend/classes/AdminAuth.php';

// Auth kontrolü
if (!AdminAuth::isAdminLoggedIn()) {
    header('Location: login.php');
    exit;
}

// Include components
require_once '../components/ComponentLoader.php';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sipariş Yönetimi | Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome 6.4.0 -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Component CSS -->
    <link href="../components/css/component-loader.css" rel="stylesheet">
    
    <style>
        :root {
            --primary-color: #1e88e5;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
        }
        
        * {
            font-family: 'Inter', sans-serif;
        }
        
        body {
            background-color: var(--gray-50);
            font-size: 14px;
        }
        
        .main-wrapper {
            min-height: 100vh;
            display: flex;
        }
        
        .content-area {
            flex: 1;
            padding: 1.5rem;
            margin-left: 280px;
            transition: margin-left 0.3s ease;
        }
        
        .content-area.sidebar-collapsed {
            margin-left: 80px;
        }
        
        @media (max-width: 768px) {
            .content-area {
                margin-left: 0;
                padding: 1rem;
            }
            
            .content-area.sidebar-collapsed {
                margin-left: 0;
            }
        }
        
        .page-header {
            background: linear-gradient(135deg, var(--primary-color), #1565c0);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            color: white;
        }
        
        .page-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid var(--gray-200);
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
            margin-bottom: 1rem;
        }
        
        .stat-icon.primary { background: var(--primary-color); }
        .stat-icon.success { background: var(--success-color); }
        .stat-icon.warning { background: var(--warning-color); }
        .stat-icon.danger { background: var(--danger-color); }
        
        .stat-label {
            color: var(--gray-600);
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--gray-900);
            margin: 0;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            border: 1px solid var(--gray-200);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-bottom: 2rem;
        }
        
        .card-header {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 1.5rem;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            align-items: center;
            justify-content: between;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--gray-900);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .filter-section {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        
        .filter-group {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .form-control {
            border: 1px solid var(--gray-300);
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
        }
        
        .btn {
            border-radius: 8px;
            font-weight: 500;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            border: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background: #1565c0;
            transform: translateY(-1px);
        }
        
        .btn-success {
            background: var(--success-color);
            color: white;
        }
        
        .btn-warning {
            background: var(--warning-color);
            color: white;
        }
        
        .btn-danger {
            background: var(--danger-color);
            color: white;
        }
        
        .btn-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
        }
        
        .badge {
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.375rem 0.75rem;
            border-radius: 6px;
        }
        
        .badge-beklemede { background: #fef3c7; color: #92400e; }
        .badge-onaylandi { background: #dbeafe; color: #1e40af; }
        .badge-hazirlaniyor { background: #e0e7ff; color: #3730a3; }
        .badge-kargoda { background: #fde68a; color: #92400e; }
        .badge-teslim-edildi { background: #d1fae5; color: #065f46; }
        .badge-iptal-edildi { background: #fee2e2; color: #991b1b; }
        .badge-odendi { background: #d1fae5; color: #065f46; }
        .badge-basarisiz { background: #fee2e2; color: #991b1b; }
        .badge-beklemede-odeme { background: #fef3c7; color: #92400e; }
        .badge-iade { background: #e0e7ff; color: #3730a3; }
        
        .order-table {
            font-size: 0.875rem;
        }
        
        .order-table th {
            background: var(--gray-50);
            color: var(--gray-700);
            font-weight: 600;
            border-bottom: 2px solid var(--gray-200);
            padding: 1rem 0.75rem;
            white-space: nowrap;
        }
        
        .order-table td {
            padding: 1rem 0.75rem;
            border-bottom: 1px solid var(--gray-200);
            vertical-align: middle;
        }
        
        .order-number {
            font-weight: 600;
            color: var(--gray-900);
        }
        
        .customer-name {
            color: var(--gray-700);
        }
        
        .amount {
            font-weight: 600;
            color: var(--gray-900);
        }
        
        .actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        
        .page-btn {
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--gray-300);
            background: white;
            color: var(--gray-700);
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.3s ease;
            min-width: 40px;
            text-align: center;
        }
        
        .page-btn:hover {
            background: var(--gray-100);
            color: var(--gray-900);
        }
        
        .page-btn.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        
        .modal-content {
            border-radius: 12px;
            border: none;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
            border-bottom: 1px solid var(--gray-200);
            padding: 1.5rem;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-title {
            font-weight: 600;
            color: var(--gray-900);
        }
        
        .order-detail-section {
            margin-bottom: 2rem;
        }
        
        .order-detail-section h5 {
            color: var(--gray-900);
            font-weight: 600;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border: 1px solid var(--gray-200);
            border-radius: 8px;
            margin-bottom: 0.75rem;
            background: var(--gray-50);
        }
        
        .order-item-info h6 {
            margin: 0 0 0.25rem 0;
            color: var(--gray-900);
            font-weight: 600;
        }
        
        .order-item-info small {
            color: var(--gray-600);
        }
        
        .order-item-price {
            text-align: right;
        }
        
        .order-item-price .quantity {
            color: var(--gray-600);
            font-size: 0.875rem;
        }
        
        .order-item-price .total {
            font-weight: 600;
            color: var(--gray-900);
        }
        
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .toast {
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid var(--primary-color);
            margin-bottom: 0.75rem;
            max-width: 400px;
        }
        
        .toast.success {
            border-left-color: var(--success-color);
        }
        
        .toast.error {
            border-left-color: var(--danger-color);
        }
        
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
            
            .stat-value {
                font-size: 1.5rem;
            }
            
            .page-header {
                padding: 1.5rem;
            }
            
            .page-title {
                font-size: 1.5rem;
            }
            
            .filter-section {
                flex-direction: column;
            }
            
            .filter-group {
                width: 100%;
            }
            
            .form-control {
                width: 100%;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
            
            .order-table {
                font-size: 0.75rem;
            }
            
            .order-table th,
            .order-table td {
                padding: 0.5rem 0.25rem;
            }
        }
        
        .mobile-swipe-hint {
            display: none;
            background: linear-gradient(90deg, var(--primary-color), #1565c0);
            color: white;
            padding: 0.75rem;
            text-align: center;
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .mobile-swipe-hint {
                display: block;
            }
        }
    </style>
</head>
<body>
    <!-- Component Loader -->
    <?php includeComponent('navbar', ['variant' => 'admin']); ?>
    <?php includeComponent('sidebar', ['variant' => 'admin']); ?>
    
    <div class="main-wrapper">
        <div class="content-area">
            <!-- Sayfa Başlığı -->
            <div class="page-header">
                <h1 class="page-title">
                    <i class="fas fa-shopping-cart"></i>
                    Sipariş Yönetimi
                </h1>
                <p class="mb-0 opacity-75">Tüm siparişleri görüntüleyin ve yönetin</p>
            </div>
            
            <!-- Mobil Swipe İpucu -->
            <div class="mobile-swipe-hint">
                <i class="fas fa-hand-point-right"></i>
                Mobilde sağa kaydırarak daha fazla bilgi görebilirsiniz
            </div>
            
            <!-- İstatistikler -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="stat-label">Bugünkü Siparişler</div>
                    <div class="stat-value" id="daily-orders">-</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-label">Bekleyen Siparişler</div>
                    <div class="stat-value" id="pending-orders">-</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-turkish-lira-sign"></i>
                    </div>
                    <div class="stat-label">Bugünkü Satış</div>
                    <div class="stat-value" id="daily-sales">₺-</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-label">Toplam Sipariş</div>
                    <div class="stat-value" id="total-orders">-</div>
                </div>
            </div>
            
            <!-- Ana Kart -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-list"></i>
                        Sipariş Listesi
                    </h2>
                </div>
                
                <div class="card-body p-0">
                    <!-- Filtreler -->
                    <div class="p-4 border-bottom">
                        <div class="filter-section">
                            <div class="filter-group">
                                <i class="fas fa-search text-muted"></i>
                                <input type="text" class="form-control" id="search-input" 
                                       placeholder="Sipariş no, müşteri adı..." 
                                       style="min-width: 200px;">
                            </div>
                            
                            <div class="filter-group">
                                <select class="form-control" id="status-filter">
                                    <option value="">Tüm Durumlar</option>
                                    <option value="beklemede">Beklemede</option>
                                    <option value="onaylandi">Onaylandı</option>
                                    <option value="hazirlaniyor">Hazırlanıyor</option>
                                    <option value="kargoda">Kargoda</option>
                                    <option value="teslim_edildi">Teslim Edildi</option>
                                    <option value="iptal_edildi">İptal Edildi</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <select class="form-control" id="payment-filter">
                                    <option value="">Tüm Ödemeler</option>
                                    <option value="beklemede">Ödeme Bekliyor</option>
                                    <option value="odendi">Ödendi</option>
                                    <option value="basarisiz">Başarısız</option>
                                    <option value="iade">İade</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <input type="date" class="form-control" id="date-filter">
                            </div>
                            
                            <button class="btn btn-primary" onclick="loadOrders(1)">
                                <i class="fas fa-sync-alt"></i>
                                Yenile
                            </button>
                        </div>
                    </div>
                    
                    <!-- Sipariş Tablosu -->
                    <div class="table-responsive">
                        <table class="table table-hover order-table mb-0">
                            <thead>
                                <tr>
                                    <th>Sipariş No</th>
                                    <th>Müşteri</th>
                                    <th>Tarih</th>
                                    <th>Tutar</th>
                                    <th>Durum</th>
                                    <th>Ödeme</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody id="orders-tbody">
                                <tr>
                                    <td colspan="7" class="text-center py-4">
                                        <div class="d-flex justify-content-center">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Yükleniyor...</span>
                                            </div>
                                        </div>
                                        <div class="mt-2 text-muted">Siparişler yükleniyor...</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Sayfalama -->
                    <div id="pagination-container" class="p-4 border-top"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Sipariş Detay Modal -->
    <div class="modal fade" id="orderModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-info-circle"></i>
                        Sipariş Detayları
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                
                <div class="modal-body">
                    <div id="order-details">
                        <div class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Yükleniyor...</span>
                            </div>
                            <div class="mt-2">Sipariş detayları yükleniyor...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Toast Container -->
    <div class="toast-container"></div>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../components/js/component-loader.js"></script>
    
    <script>
        // Global değişkenler
        let currentPage = 1;
        let totalPages = 1;
        let orders = [];
        let isLoading = false;
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            initializePage();
            loadOrders();
            loadStats();
        });
        
        // Sayfa başlatma
        function initializePage() {
            // Event listener'ları ekle
            document.getElementById('search-input').addEventListener('input', debounce(() => loadOrders(1), 500));
            document.getElementById('status-filter').addEventListener('change', () => loadOrders(1));
            document.getElementById('payment-filter').addEventListener('change', () => loadOrders(1));
            document.getElementById('date-filter').addEventListener('change', () => loadOrders(1));
            
            // Modal event listener
            document.getElementById('orderModal').addEventListener('hidden.bs.modal', function() {
                // Modal kapandığında temizlik
            });
        }
        
        // İstatistikleri yükle
        async function loadStats() {
            try {
                const response = await fetch('../backend/api/siparisler.php?stats=1');
                const data = await response.json();
                
                if (data.success) {
                    const stats = data.data;
                    
                    // Bugünkü siparişler ve satış
                    document.getElementById('daily-orders').textContent = stats.gunluk_siparisler || '0';
                    document.getElementById('daily-sales').textContent = `₺${(stats.gunluk_satis || 0).toFixed(2)}`;
                    
                    // Bekleyen siparişler
                    document.getElementById('pending-orders').textContent = stats.bekleyen_siparisler || '0';
                    
                    // Toplam sipariş
                    document.getElementById('total-orders').textContent = stats.toplam_siparisler || '0';
                }
            } catch (error) {
                console.error('İstatistikler yüklenemedi:', error);
                showToast('İstatistikler yüklenirken hata oluştu', 'error');
            }
        }
        
        // Siparişleri yükle
        async function loadOrders(page = 1) {
            if (isLoading) return;
            
            isLoading = true;
            currentPage = page;
            
            try {
                const searchTerm = document.getElementById('search-input').value;
                const statusFilter = document.getElementById('status-filter').value;
                const paymentFilter = document.getElementById('payment-filter').value;
                const dateFilter = document.getElementById('date-filter').value;
                
                let url = `../backend/api/siparisler.php?limit=20&offset=${(page - 1) * 20}`;
                
                if (searchTerm) {
                    if (searchTerm.includes('GO-')) {
                        url += `&siparis_no=${encodeURIComponent(searchTerm)}`;
                    } else {
                        url += `&musteri_adi=${encodeURIComponent(searchTerm)}`;
                    }
                }
                if (statusFilter) url += `&durum=${statusFilter}`;
                if (paymentFilter) url += `&odeme_durumu=${paymentFilter}`;
                if (dateFilter) url += `&baslangic_tarihi=${dateFilter}&bitis_tarihi=${dateFilter}`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.success) {
                    orders = data.data || [];
                    displayOrders(orders);
                    
                    // Sayfalama bilgilerini güncelle
                    if (data.pagination) {
                        totalPages = data.pagination.total_pages;
                        currentPage = data.pagination.current_page;
                        updatePagination();
                    }
                } else {
                    showToast(data.message || 'Siparişler yüklenirken hata oluştu', 'error');
                    displayOrders([]);
                }
                
            } catch (error) {
                console.error('Siparişler yüklenemedi:', error);
                showToast('Siparişler yüklenirken hata oluştu', 'error');
                displayOrders([]);
            } finally {
                isLoading = false;
            }
        }
        
        // Siparişleri tabloda göster
        function displayOrders(orders) {
            const tbody = document.getElementById('orders-tbody');
            
            if (!orders || orders.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-5">
                            <div class="text-muted">
                                <i class="fas fa-search fa-2x mb-3"></i>
                                <div>Sipariş bulunamadı</div>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>
                        <div class="order-number">${order.siparis_no}</div>
                    </td>
                    <td>
                        <div class="customer-name">${order.musteri_adi}</div>
                        <small class="text-muted">${order.musteri_eposta}</small>
                    </td>
                    <td>
                        <div>${formatDateTime(order.siparis_tarihi)}</div>
                    </td>
                    <td>
                        <div class="amount">₺${parseFloat(order.toplam_tutar || 0).toFixed(2)}</div>
                    </td>
                    <td>
                        <span class="badge badge-${order.durum}">
                            ${getDurumText(order.durum)}
                        </span>
                    </td>
                    <td>
                        <span class="badge badge-${order.odeme_durumu}">
                            ${getOdemeDurumText(order.odeme_durumu)}
                        </span>
                    </td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-primary btn-sm" onclick="viewOrder(${order.id})" title="Detay Görüntüle">
                                <i class="fas fa-eye"></i>
                                Detay
                            </button>
                            <button class="btn btn-warning btn-sm" onclick="quickUpdateStatus(${order.id})" title="Durum Güncelle">
                                <i class="fas fa-edit"></i>
                                Güncelle
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        // Tarih formatla
        function formatDateTime(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Durum metni
        function getDurumText(durum) {
            const durumlar = {
                'beklemede': 'Beklemede',
                'onaylandi': 'Onaylandı',
                'hazirlaniyor': 'Hazırlanıyor',
                'kargoda': 'Kargoda',
                'teslim_edildi': 'Teslim Edildi',
                'iptal_edildi': 'İptal Edildi'
            };
            return durumlar[durum] || durum;
        }
        
        // Ödeme durumu metni
        function getOdemeDurumText(durum) {
            const durumlar = {
                'beklemede': 'Bekliyor',
                'odendi': 'Ödendi',
                'basarisiz': 'Başarısız',
                'iade': 'İade'
            };
            return durumlar[durum] || durum;
        }
        
        // Sayfalama güncelle
        function updatePagination() {
            const container = document.getElementById('pagination-container');
            
            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }
            
            let html = '<div class="pagination">';
            
            // Önceki sayfa
            if (currentPage > 1) {
                html += `<a href="#" class="page-btn" onclick="loadOrders(${currentPage - 1})">« Önceki</a>`;
            }
            
            // Sayfa numaraları (max 5 sayfa göster)
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            if (startPage > 1) {
                html += `<a href="#" class="page-btn" onclick="loadOrders(1)">1</a>`;
                if (startPage > 2) {
                    html += `<span class="page-btn" style="pointer-events: none;">...</span>`;
                }
            }
            
            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    html += `<a href="#" class="page-btn active">${i}</a>`;
                } else {
                    html += `<a href="#" class="page-btn" onclick="loadOrders(${i})">${i}</a>`;
                }
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    html += `<span class="page-btn" style="pointer-events: none;">...</span>`;
                }
                html += `<a href="#" class="page-btn" onclick="loadOrders(${totalPages})">${totalPages}</a>`;
            }
            
            // Sonraki sayfa
            if (currentPage < totalPages) {
                html += `<a href="#" class="page-btn" onclick="loadOrders(${currentPage + 1})">Sonraki »</a>`;
            }
            
            html += '</div>';
            container.innerHTML = html;
        }
        
        // Sipariş detaylarını görüntüle
        async function viewOrder(id) {
            try {
                const response = await fetch(`../backend/api/siparisler.php/${id}`);
                const data = await response.json();
                
                if (data.success) {
                    const order = data.data;
                    displayOrderDetails(order);
                    
                    // Modal göster
                    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
                    modal.show();
                } else {
                    showToast('Sipariş detayları yüklenemedi', 'error');
                }
                
            } catch (error) {
                console.error('Sipariş detayları yüklenemedi:', error);
                showToast('Sipariş detayları yüklenirken hata oluştu', 'error');
            }
        }
        
        // Sipariş detaylarını modal'da göster
        function displayOrderDetails(order) {
            const container = document.getElementById('order-details');
            
            let itemsHtml = '';
            if (order.kalemler && order.kalemler.length > 0) {
                itemsHtml = order.kalemler.map(item => `
                    <div class="order-item">
                        <div class="order-item-info">
                            <h6>${item.urun_adi}</h6>
                            <small>Ürün Kodu: ${item.urun_kodu || '-'}</small>
                        </div>
                        <div class="order-item-price">
                            <div class="quantity">${item.miktar} x ₺${parseFloat(item.birim_fiyat).toFixed(2)}</div>
                            <div class="total">₺${parseFloat(item.toplam_fiyat).toFixed(2)}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                itemsHtml = '<p class="text-muted">Sipariş kalemi bulunamadı</p>';
            }
            
            container.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="order-detail-section">
                            <h5><i class="fas fa-info-circle"></i> Sipariş Bilgileri</h5>
                            <p><strong>Sipariş No:</strong> ${order.siparis_no}</p>
                            <p><strong>Tarih:</strong> ${formatDateTime(order.siparis_tarihi)}</p>
                            <p><strong>Durum:</strong> 
                                <span class="badge badge-${order.durum}">${getDurumText(order.durum)}</span>
                            </p>
                            <p><strong>Ödeme Durumu:</strong> 
                                <span class="badge badge-${order.odeme_durumu}">${getOdemeDurumText(order.odeme_durumu)}</span>
                            </p>
                        </div>
                        
                        <div class="order-detail-section">
                            <h5><i class="fas fa-user"></i> Müşteri Bilgileri</h5>
                            <p><strong>Ad:</strong> ${order.musteri_adi}</p>
                            <p><strong>E-posta:</strong> ${order.musteri_eposta}</p>
                            <p><strong>Telefon:</strong> ${order.musteri_telefon || '-'}</p>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="order-detail-section">
                            <h5><i class="fas fa-map-marker-alt"></i> Teslimat Adresi</h5>
                            <p>${order.teslimat_adresi || 'Adres bilgisi yok'}</p>
                            <p>${order.teslimat_ilce || ''} ${order.teslimat_il || ''}</p>
                            ${order.teslimat_posta_kodu ? `<p><strong>Posta Kodu:</strong> ${order.teslimat_posta_kodu}</p>` : ''}
                        </div>
                        
                        <div class="order-detail-section">
                            <h5><i class="fas fa-calculator"></i> Fiyat Detayı</h5>
                            <p><strong>Ara Toplam:</strong> ₺${parseFloat(order.ara_toplam || 0).toFixed(2)}</p>
                            <p><strong>Vergi:</strong> ₺${parseFloat(order.vergi_toplami || 0).toFixed(2)}</p>
                            <p><strong>Kargo:</strong> ₺${parseFloat(order.kargo_ucreti || 0).toFixed(2)}</p>
                            <p><strong>İndirim:</strong> -₺${parseFloat(order.indirim_tutari || 0).toFixed(2)}</p>
                            <hr>
                            <p><strong>Toplam:</strong> <span class="fs-5 fw-bold text-primary">₺${parseFloat(order.toplam_tutar || 0).toFixed(2)}</span></p>
                        </div>
                    </div>
                </div>
                
                <div class="order-detail-section">
                    <h5><i class="fas fa-list"></i> Sipariş Kalemleri</h5>
                    ${itemsHtml}
                </div>
                
                <div class="order-detail-section">
                    <h5><i class="fas fa-edit"></i> Durum Güncelle</h5>
                    <div class="row">
                        <div class="col-md-8">
                            <select class="form-control" id="new-status">
                                <option value="beklemede" ${order.durum === 'beklemede' ? 'selected' : ''}>Beklemede</option>
                                <option value="onaylandi" ${order.durum === 'onaylandi' ? 'selected' : ''}>Onaylandı</option>
                                <option value="hazirlaniyor" ${order.durum === 'hazirlaniyor' ? 'selected' : ''}>Hazırlanıyor</option>
                                <option value="kargoda" ${order.durum === 'kargoda' ? 'selected' : ''}>Kargoda</option>
                                <option value="teslim_edildi" ${order.durum === 'teslim_edildi' ? 'selected' : ''}>Teslim Edildi</option>
                                <option value="iptal_edildi" ${order.durum === 'iptal_edildi' ? 'selected' : ''}>İptal Edildi</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-success w-100" onclick="saveOrderStatus(${order.id})">
                                <i class="fas fa-save"></i> Güncelle
                            </button>
                        </div>
                    </div>
                </div>
                
                ${order.siparis_notu ? `
                    <div class="order-detail-section">
                        <h5><i class="fas fa-comment"></i> Sipariş Notu</h5>
                        <div class="alert alert-info">${order.siparis_notu}</div>
                    </div>
                ` : ''}
                
                ${order.admin_notu ? `
                    <div class="order-detail-section">
                        <h5><i class="fas fa-sticky-note"></i> Admin Notu</h5>
                        <div class="alert alert-warning">${order.admin_notu}</div>
                    </div>
                ` : ''}
            `;
        }
        
        // Hızlı durum güncelleme
        async function quickUpdateStatus(id) {
            const statusOptions = {
                '1': { value: 'beklemede', text: 'Beklemede' },
                '2': { value: 'onaylandi', text: 'Onaylandı' },
                '3': { value: 'hazirlaniyor', text: 'Hazırlanıyor' },
                '4': { value: 'kargoda', text: 'Kargoda' },
                '5': { value: 'teslim_edildi', text: 'Teslim Edildi' },
                '6': { value: 'iptal_edildi', text: 'İptal Edildi' }
            };
            
            let optionsList = '';
            for (let key in statusOptions) {
                optionsList += `${key} - ${statusOptions[key].text}\n`;
            }
            
            const newStatus = prompt(`Yeni durum seçin (1-6):\n${optionsList}Sayı giriniz:`);
            
            if (statusOptions[newStatus]) {
                await updateOrderStatus(id, statusOptions[newStatus].value);
            }
        }
        
        // Sipariş durumunu güncelle
        async function saveOrderStatus(orderId) {
            const newStatus = document.getElementById('new-status').value;
            await updateOrderStatus(orderId, newStatus);
        }
        
        // Sipariş durumu güncelleme
        async function updateOrderStatus(orderId, newStatus) {
            try {
                const response = await fetch(`../backend/api/siparisler.php/${orderId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        durum: newStatus
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showToast('Sipariş durumu güncellendi', 'success');
                    loadOrders(currentPage);
                    loadStats();
                    
                    // Modal açıksa kapat
                    const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
                    if (modal) {
                        modal.hide();
                    }
                } else {
                    showToast(data.message || 'Durum güncellenemedi', 'error');
                }
                
            } catch (error) {
                console.error('Durum güncellenemedi:', error);
                showToast('Durum güncellenirken hata oluştu', 'error');
            }
        }
        
        // Toast mesajı göster
        function showToast(message, type = 'info') {
            const container = document.querySelector('.toast-container');
            const toast = document.createElement('div');
            
            const bgClass = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
            
            toast.className = `toast ${bgClass}`;
            toast.innerHTML = `
                <div class="d-flex align-items-center p-3">
                    <div class="me-auto">
                        <div class="fw-bold">${type === 'success' ? 'Başarılı' : type === 'error' ? 'Hata' : 'Bilgi'}</div>
                        <div class="text-muted">${message}</div>
                    </div>
                    <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
            `;
            
            container.appendChild(toast);
            
            // Otomatik kaldır
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 5000);
        }
        
        // Debounce fonksiyonu
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    </script>
</body>
</html>