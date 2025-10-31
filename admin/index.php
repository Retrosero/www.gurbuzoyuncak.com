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
    <title>Admin Panel | Gürbüz Oyuncak</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="../components/css/components.css">
    
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --sidebar-width: 280px;
            --topbar-height: 70px;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fc;
        }
        
        .admin-wrapper {
            display: flex;
            min-height: 100vh;
        }
        
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: calc(var(--topbar-height) + 2rem) 2rem 2rem;
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
        }
        
        .top-bar h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
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
        
        .stat-card h3 {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0.5rem 0;
        }
        
        .stat-card .change {
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .change.positive {
            color: #059669;
        }
        
        .change.negative {
            color: #dc2626;
        }
        
        .dashboard-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
        }
        
        .card-header-custom {
            background: var(--primary-gradient);
            color: white;
            padding: 1.5rem;
            border-radius: 12px 12px 0 0;
        }
        
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
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="admin-wrapper">
        <?php component('sidebar', ['variant' => 'admin']); ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>
                    <i data-lucide="layout-dashboard" style="width: 32px; height: 32px;"></i>
                    Dashboard
                </h1>
                <span class="text-muted">Hoş geldiniz, Admin</span>
            </div>
            
            <!-- İstatistikler -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Toplam Sipariş</h3>
                    <div class="value" id="totalOrders">
                        <i data-lucide="loader-2" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"></i>
                    </div>
                    <div class="change positive">
                        <i data-lucide="trending-up" style="width: 16px; height: 16px;"></i>
                        <span>Bu ay</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <h3>Toplam Gelir</h3>
                    <div class="value" id="totalRevenue">
                        <i data-lucide="loader-2" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"></i>
                    </div>
                    <div class="change positive">
                        <i data-lucide="trending-up" style="width: 16px; height: 16px;"></i>
                        <span>Bu ay</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <h3>Aktif Ürün</h3>
                    <div class="value" id="totalProducts">
                        <i data-lucide="loader-2" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"></i>
                    </div>
                    <div class="change">
                        <span>Toplam ürün</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <h3>Kayıtlı Bayi</h3>
                    <div class="value" id="totalCustomers">
                        <i data-lucide="loader-2" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"></i>
                    </div>
                    <div class="change positive">
                        <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
                        <span>Bu ay</span>
                    </div>
                </div>
            </div>
            
            <!-- Son Siparişler -->
            <div class="dashboard-card">
                <div class="card-header-custom">
                    <h3 class="m-0">Son Siparişler</h3>
                </div>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Sipariş No</th>
                                <th>Müşteri</th>
                                <th>Tutar</th>
                                <th>Durum</th>
                                <th>Tarih</th>
                            </tr>
                        </thead>
                        <tbody id="recentOrders">
                            <tr>
                                <td colspan="5" class="text-center py-4">Yükleniyor...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Düşük Stoklu Ürünler -->
            <div class="dashboard-card">
                <div class="card-header-custom">
                    <h3 class="m-0">Düşük Stoklu Ürünler</h3>
                </div>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ürün</th>
                                <th>Stok</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody id="lowStockProducts">
                            <tr>
                                <td colspan="3" class="text-center py-4">Yükleniyor...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../components/js/component-loader.js"></script>
    
    <script>
        lucide.createIcons();
        
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboardData();
        });
        
        async function loadDashboardData() {
            try {
                // İstatistikler
                const statsResponse = await fetch('/backend/api/orders.php?action=stats');
                const statsData = await statsResponse.json();
                
                if (statsData.success) {
                    document.getElementById('totalOrders').textContent = statsData.data.totalOrders || 0;
                    document.getElementById('totalRevenue').textContent = '₺' + (statsData.data.totalRevenue || 0).toLocaleString('tr-TR');
                }
                
                // Ürün sayısı
                const productsResponse = await fetch('/backend/api/products.php?action=count');
                const productsData = await productsResponse.json();
                if (productsData.success) {
                    document.getElementById('totalProducts').textContent = productsData.data.count || 0;
                }
                
                // Müşteri sayısı
                document.getElementById('totalCustomers').textContent = '0';
                
                // Son siparişler
                const ordersResponse = await fetch('/backend/api/orders.php?limit=10');
                const ordersData = await ordersResponse.json();
                
                if (ordersData.success && ordersData.data.length > 0) {
                    displayRecentOrders(ordersData.data);
                } else {
                    document.getElementById('recentOrders').innerHTML = '<tr><td colspan="5" class="text-center">Sipariş bulunamadı</td></tr>';
                }
                
                // Düşük stoklu ürünler
                document.getElementById('lowStockProducts').innerHTML = '<tr><td colspan="3" class="text-center">Düşük stoklu ürün yok</td></tr>';
                
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        function displayRecentOrders(orders) {
            const tbody = document.getElementById('recentOrders');
            
            tbody.innerHTML = orders.map(order => {
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
                        <td><small>${new Date(order.created_at).toLocaleDateString('tr-TR')}</small></td>
                    </tr>
                `;
            }).join('');
        }
    </script>
    
    <style>
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</body>
</html>
