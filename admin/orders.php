<?php
/**
 * Sipariş Yönetimi - Admin Panel
 * Gürbüz Oyuncak E-Ticaret Sistemi
 * Mobile Responsive & Component Sistemi ile Modernize Edildi
 */

require_once 'includes/auth.php';
require_once '../components/ComponentLoader.php';

// Admin giriş kontrolü
if (!isAdminLoggedIn()) {
    header("Location: login.php");
    exit();
}

// Component Loader
$loader = new ComponentLoader();
?>

<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <title>Sipariş Yönetimi - Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- Custom Styles -->
    <style>
        .page-header {
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
        }
        
        .page-header h1 {
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .filter-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            margin-bottom: 1.5rem;
            border: 1px solid #e9ecef;
        }
        
        .form-control,
        .form-select {
            border-radius: 8px;
            border: 1px solid #dee2e6;
            padding: 0.625rem 0.875rem;
            font-size: 0.95rem;
            min-height: 44px;
        }
        
        .form-control:focus,
        .form-select:focus {
            border-color: #FF9800;
            box-shadow: 0 0 0 0.2rem rgba(255, 152, 0, 0.15);
        }
        
        .table-card {
            background: white;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            overflow: hidden;
            border: 1px solid #e9ecef;
        }
        
        .table-card-header {
            padding: 1.25rem 1.5rem;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .table-card-header h2 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2c3e50;
            margin: 0;
        }
        
        .order-count {
            font-size: 0.875rem;
            color: #6c757d;
            background: #e9ecef;
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
        }
        
        .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        .orders-table {
            margin-bottom: 0;
        }
        
        .orders-table thead {
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .orders-table th {
            font-weight: 600;
            color: #495057;
            font-size: 0.875rem;
            padding: 1rem 0.75rem;
            border-bottom: 2px solid #dee2e6;
            white-space: nowrap;
        }
        
        .orders-table td {
            padding: 0.875rem 0.75rem;
            vertical-align: middle;
            font-size: 0.9rem;
        }
        
        .orders-table tbody tr {
            transition: all 0.2s;
            border-bottom: 1px solid #e9ecef;
        }
        
        .orders-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        .form-check-input {
            width: 1.125rem;
            height: 1.125rem;
            cursor: pointer;
            margin-top: 0;
        }
        
        .badge-status {
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
            font-size: 0.8125rem;
            font-weight: 500;
            display: inline-block;
        }
        
        .badge-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .badge-processing {
            background: #cfe2ff;
            color: #084298;
        }
        
        .badge-shipped {
            background: #e7e3ff;
            color: #3730a3;
        }
        
        .badge-delivered {
            background: #d1fae5;
            color: #065f46;
        }
        
        .badge-cancelled {
            background: #f8d7da;
            color: #842029;
        }
        
        .btn-action {
            min-height: 38px;
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
            font-weight: 500;
            border-radius: 6px;
            transition: all 0.2s;
            border: none;
        }
        
        .btn-action:active {
            transform: scale(0.98);
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #6c757d;
        }
        
        .empty-state i {
            font-size: 4rem;
            opacity: 0.3;
            margin-bottom: 1rem;
        }
        
        .modal-header {
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            color: white;
            border-radius: 12px 12px 0 0;
        }
        
        .modal-content {
            border-radius: 12px;
            border: none;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .order-detail-section {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #e9ecef;
        }
        
        .order-detail-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .order-detail-section h4 {
            font-size: 1rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 0.8125rem;
            color: #6c757d;
            margin-bottom: 0.25rem;
        }
        
        .info-value {
            font-size: 0.9375rem;
            color: #2c3e50;
            font-weight: 500;
        }
        
        .order-items {
            margin-top: 1rem;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 0.75rem;
            border: 1px solid #e9ecef;
        }
        
        .order-item:last-child {
            margin-bottom: 0;
        }
        
        /* Mobile Optimizations */
        @media (max-width: 768px) {
            .page-header h1 {
                font-size: 1.5rem;
            }
            
            .filter-card {
                padding: 1rem;
            }
            
            .table-card-header {
                padding: 1rem;
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .orders-table th,
            .orders-table td {
                padding: 0.625rem 0.5rem;
                font-size: 0.8125rem;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .order-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            /* Hide less important columns on mobile */
            .hide-mobile {
                display: none;
            }
        }
        
        @media (max-width: 576px) {
            .page-header {
                padding: 1.5rem 0;
            }
            
            .modal-body {
                padding: 1rem;
            }
        }
        
        /* Loading spinner */
        .spinner-border-sm {
            width: 1rem;
            height: 1rem;
            border-width: 0.15em;
        }
        
        .bulk-action-bar {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
    </style>
</head>

<body>
    <!-- Sidebar -->
    <?php $loader->loadComponent('sidebar', ['type' => 'admin', 'active' => 'orders']); ?>
    
    <!-- Main Content -->
    <div class="main-content">
        <!-- Mobile Header -->
        <div class="mobile-header d-md-none">
            <button class="mobile-menu-toggle" id="mobileMenuToggle">
                <i class="fas fa-bars"></i>
            </button>
            <div class="mobile-header-title">Sipariş Yönetimi</div>
            <div class="mobile-header-actions">
                <button class="btn btn-sm btn-light" onclick="loadOrders()">
                    <i class="fas fa-sync"></i>
                </button>
            </div>
        </div>
        
        <div class="container-fluid p-3 p-md-4">
            <!-- Page Header -->
            <div class="page-header">
                <div class="px-3 px-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h1><i class="fas fa-shopping-cart me-2"></i> Sipariş Yönetimi</h1>
                        <p class="mb-0 opacity-90">Siparişleri görüntüle ve yönet</p>
                    </div>
                    <div class="d-flex gap-2">
                        <select id="bulkAction" class="form-select" style="background: white; color: #FF9800; font-weight: 600; min-height: 44px; max-width: 200px;">
                            <option value="">Toplu İşlem</option>
                            <option value="processing">İşleme Al</option>
                            <option value="shipped">Kargoya Ver</option>
                            <option value="delivered">Teslim Edildi</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Alert Container -->
            <div id="alertContainer"></div>
            
            <!-- Filters -->
            <div class="filter-card">
                <div class="row g-3">
                    <div class="col-12 col-md-3">
                        <input type="text" id="searchInput" class="form-control" placeholder="Sipariş no, müşteri adı...">
                    </div>
                    <div class="col-6 col-md-2">
                        <select id="statusFilter" class="form-select">
                            <option value="">Tüm Durumlar</option>
                            <option value="pending">Bekliyor</option>
                            <option value="processing">İşleniyor</option>
                            <option value="shipped">Kargoda</option>
                            <option value="delivered">Teslim Edildi</option>
                            <option value="cancelled">İptal Edildi</option>
                        </select>
                    </div>
                    <div class="col-6 col-md-2">
                        <input type="date" id="dateFrom" class="form-control" placeholder="Başlangıç">
                    </div>
                    <div class="col-6 col-md-2">
                        <input type="date" id="dateTo" class="form-control" placeholder="Bitiş">
                    </div>
                    <div class="col-6 col-md-3">
                        <button class="btn btn-primary w-100" onclick="loadOrders()">
                            <i class="fas fa-filter me-2"></i> Filtrele
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Orders Table -->
            <div class="table-card">
                <div class="table-card-header">
                    <h2><i class="fas fa-list me-2"></i> Siparişler</h2>
                    <span class="order-count" id="orderCount">Toplam: 0 sipariş</span>
                </div>
                
                <div class="table-responsive">
                    <table class="table orders-table">
                        <thead>
                            <tr>
                                <th style="width: 50px;">
                                    <input type="checkbox" class="form-check-input" id="selectAll">
                                </th>
                                <th>Sipariş No</th>
                                <th class="hide-mobile">Müşteri</th>
                                <th class="hide-mobile">Ürün Sayısı</th>
                                <th>Toplam</th>
                                <th>Durum</th>
                                <th class="hide-mobile">Tarih</th>
                                <th style="width: 100px;">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                            <tr>
                                <td colspan="8" class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Yükleniyor...</span>
                                    </div>
                                    <p class="mt-2 text-muted mb-0">Siparişler yükleniyor...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Order Detail Modal -->
    <div class="modal fade" id="orderModal" tabindex="-1" aria-labelledby="orderModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="orderModalLabel">
                        <i class="fas fa-receipt me-2"></i> Sipariş Detayları
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="orderDetailContent">
                    <!-- Dinamik içerik buraya gelecek -->
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap Bundle JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader JS -->
    <script src="../components/js/component-loader.js"></script>
    
    <!-- Custom Scripts -->
    <script>
        let orderModal;
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
            
            loadOrders();
            
            // Mobile menu toggle
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            if (mobileMenuToggle) {
                mobileMenuToggle.addEventListener('click', function() {
                    document.body.classList.toggle('sidebar-open');
                });
            }
            
            // Search debounce
            let searchTimeout;
            document.getElementById('searchInput').addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    loadOrders();
                }, 500);
            });
            
            // Select all checkbox
            document.getElementById('selectAll').addEventListener('change', function(e) {
                document.querySelectorAll('.order-checkbox').forEach(cb => {
                    cb.checked = e.target.checked;
                });
            });
        });
        
        // Siparişleri yükle
        async function loadOrders() {
            try {
                const search = document.getElementById('searchInput').value;
                const status = document.getElementById('statusFilter').value;
                const dateFrom = document.getElementById('dateFrom').value;
                const dateTo = document.getElementById('dateTo').value;
                
                let url = '../backend/api/orders.php?';
                if (search) url += `search=${encodeURIComponent(search)}&`;
                if (status) url += `status=${status}&`;
                if (dateFrom) url += `date_from=${dateFrom}&`;
                if (dateTo) url += `date_to=${dateTo}&`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                const orders = data.data || [];
                const tbody = document.getElementById('ordersTableBody');
                document.getElementById('orderCount').textContent = `Toplam: ${orders.length} sipariş`;
                
                if (orders.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p class="mb-0">Sipariş bulunamadı</p>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                tbody.innerHTML = orders.map(order => {
                    const statusBadge = getStatusBadge(order.status);
                    return `
                        <tr>
                            <td>
                                <input type="checkbox" class="form-check-input order-checkbox" value="${order.id}">
                            </td>
                            <td><strong>#${order.order_number}</strong></td>
                            <td class="hide-mobile">${order.customer_name || 'Misafir'}</td>
                            <td class="hide-mobile">${order.item_count || 0} ürün</td>
                            <td><strong>₺${parseFloat(order.total_amount).toFixed(2)}</strong></td>
                            <td>${statusBadge}</td>
                            <td class="hide-mobile">${formatDate(order.created_at)}</td>
                            <td>
                                <button class="btn btn-primary btn-action btn-sm" onclick="viewOrder(${order.id})">
                                    <i class="fas fa-eye me-1"></i> Detay
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
            } catch (error) {
                console.error('Siparişler yüklenemedi:', error);
                showAlert('Siparişler yüklenirken hata oluştu', 'danger');
            }
        }
        
        // Sipariş detayını görüntüle
        async function viewOrder(id) {
            try {
                const response = await fetch(`../backend/api/orders.php?id=${id}`);
                const data = await response.json();
                const order = data.data;
                
                const content = `
                    <div class="order-detail-section">
                        <h4><i class="fas fa-info-circle me-2"></i> Genel Bilgiler</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Sipariş No</span>
                                <span class="info-value">#${order.order_number}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Tarih</span>
                                <span class="info-value">${formatDate(order.created_at)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Durum</span>
                                <span class="info-value">${getStatusBadge(order.status)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Toplam Tutar</span>
                                <span class="info-value">₺${parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4><i class="fas fa-user me-2"></i> Müşteri Bilgileri</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Ad Soyad</span>
                                <span class="info-value">${order.customer_name || '-'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">E-posta</span>
                                <span class="info-value">${order.customer_email || '-'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Telefon</span>
                                <span class="info-value">${order.customer_phone || '-'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4><i class="fas fa-map-marker-alt me-2"></i> Teslimat Adresi</h4>
                        <p class="text-muted mb-0">
                            ${order.shipping_address || 'Adres bilgisi yok'}
                        </p>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4><i class="fas fa-box me-2"></i> Sipariş İçeriği</h4>
                        <div class="order-items">
                            ${order.items ? order.items.map(item => `
                                <div class="order-item">
                                    <div>
                                        <strong>${item.product_name}</strong><br>
                                        <small class="text-muted">${item.quantity} adet × ₺${parseFloat(item.price).toFixed(2)}</small>
                                    </div>
                                    <strong class="text-primary">₺${(item.quantity * parseFloat(item.price)).toFixed(2)}</strong>
                                </div>
                            `).join('') : '<p class="text-muted">Ürün bilgisi yok</p>'}
                        </div>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4><i class="fas fa-sync-alt me-2"></i> Durum Güncelle</h4>
                        <div class="d-flex flex-wrap gap-2">
                            <button class="btn btn-warning btn-sm" onclick="updateOrderStatus(${order.id}, 'processing')">
                                <i class="fas fa-cog me-1"></i> İşleme Al
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="updateOrderStatus(${order.id}, 'shipped')">
                                <i class="fas fa-truck me-1"></i> Kargoya Ver
                            </button>
                            <button class="btn btn-success btn-sm" onclick="updateOrderStatus(${order.id}, 'delivered')">
                                <i class="fas fa-check me-1"></i> Teslim Edildi
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                                <i class="fas fa-times me-1"></i> İptal Et
                            </button>
                        </div>
                    </div>
                `;
                
                document.getElementById('orderDetailContent').innerHTML = content;
                orderModal.show();
                
            } catch (error) {
                console.error('Sipariş detayları yüklenemedi:', error);
                showAlert('Sipariş detayları yüklenirken hata oluştu', 'danger');
            }
        }
        
        // Sipariş durumunu güncelle
        async function updateOrderStatus(orderId, newStatus) {
            try {
                const response = await fetch('../backend/api/orders.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: orderId,
                        status: newStatus
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert('Sipariş durumu başarıyla güncellendi', 'success');
                    orderModal.hide();
                    loadOrders();
                } else {
                    showAlert(result.message || 'Güncelleme başarısız', 'danger');
                }
                
            } catch (error) {
                console.error('Durum güncellenirken hata:', error);
                showAlert('Durum güncellenirken hata oluştu', 'danger');
            }
        }
        
        // Durum badge'i oluştur
        function getStatusBadge(status) {
            const badges = {
                'pending': '<span class="badge-status badge-pending">Bekliyor</span>',
                'processing': '<span class="badge-status badge-processing">İşleniyor</span>',
                'shipped': '<span class="badge-status badge-shipped">Kargoda</span>',
                'delivered': '<span class="badge-status badge-delivered">Teslim Edildi</span>',
                'cancelled': '<span class="badge-status badge-cancelled">İptal Edildi</span>'
            };
            return badges[status] || `<span class="badge-status">${status}</span>`;
        }
        
        // Tarih formatla
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Alert göster
        function showAlert(message, type) {
            const container = document.getElementById('alertContainer');
            const alertClass = `alert-${type}`;
            const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
            
            container.innerHTML = `
                <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                    <i class="fas ${iconClass} me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    bootstrap.Alert.getOrCreateInstance(alert).close();
                }
            }, 5000);
        }
    </script>
</body>
</html>
