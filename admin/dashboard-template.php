<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#1E88E5">
    
    <title>Dashboard - Admin Panel | Gürbüz Oyuncak</title>
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/admin/css/admin.css">
    <link rel="stylesheet" href="/components/css/components.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="admin-body">
    <?php
    // Component Loader'ı include et
    require_once __DIR__ . '/../components/ComponentLoader.php';
    
    // Navbar (admin variant)
    component('navbar', ['variant' => 'admin']);
    
    // Sidebar (admin variant)
    component('sidebar', ['variant' => 'admin']);
    ?>
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="container-fluid p-4">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Dashboard</h1>
                    <p class="text-muted">Hoş geldiniz, Admin</p>
                </div>
                <div class="d-none d-md-flex gap-2">
                    <button class="btn btn-outline-primary">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                        </svg>
                        Rapor İndir
                    </button>
                    <button class="btn btn-primary">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        Yeni Ürün Ekle
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row g-4 mb-4">
                <div class="col-12 col-sm-6 col-lg-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-primary-light text-primary">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="stat-label">Toplam Sipariş</p>
                            <h3 class="stat-value">1,234</h3>
                            <span class="stat-change positive">+12.5%</span>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-sm-6 col-lg-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-success-light text-success">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                                <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="stat-label">Toplam Gelir</p>
                            <h3 class="stat-value">₺245,678</h3>
                            <span class="stat-change positive">+8.2%</span>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-sm-6 col-lg-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-warning-light text-warning">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="stat-label">Aktif Bayiler</p>
                            <h3 class="stat-value">456</h3>
                            <span class="stat-change positive">+5.1%</span>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-sm-6 col-lg-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-danger-light text-danger">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.5 0A1.5 1.5 0 0 0 1 1.5V13h13V1.5A1.5 1.5 0 0 0 12.5 0h-10z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="stat-label">Ürün Sayısı</p>
                            <h3 class="stat-value">3,421</h3>
                            <span class="stat-change neutral">+0.5%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="row g-4 mb-4">
                <div class="col-12 col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Satış Grafiği</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="salesChart" height="80"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Kategori Dağılımı</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Orders -->
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Son Siparişler</h5>
                    <a href="/admin/orders.php" class="btn btn-sm btn-outline-primary">Tümünü Gör</a>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Sipariş No</th>
                                    <th>Bayi</th>
                                    <th class="d-none d-md-table-cell">Tarih</th>
                                    <th class="text-end">Tutar</th>
                                    <th class="text-center">Durum</th>
                                    <th class="text-end">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>#1234</strong></td>
                                    <td>Oyuncak Dünyası</td>
                                    <td class="d-none d-md-table-cell">31.10.2025</td>
                                    <td class="text-end">₺1,234</td>
                                    <td class="text-center">
                                        <span class="badge bg-success">Tamamlandı</span>
                                    </td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary">Detay</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>#1233</strong></td>
                                    <td>Neşeli Oyuncak</td>
                                    <td class="d-none d-md-table-cell">31.10.2025</td>
                                    <td class="text-end">₺2,456</td>
                                    <td class="text-center">
                                        <span class="badge bg-warning">Bekliyor</span>
                                    </td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary">Detay</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>#1232</strong></td>
                                    <td>Çocuk Oyuncak</td>
                                    <td class="d-none d-md-table-cell">30.10.2025</td>
                                    <td class="text-end">₺3,789</td>
                                    <td class="text-center">
                                        <span class="badge bg-info">Kargoda</span>
                                    </td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary">Detay</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Chart.js (opsiyonel) -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <!-- Component Loader -->
    <script src="/components/js/component-loader.js"></script>
    
    <!-- Admin Dashboard JS -->
    <script>
        // Örnek chart
        if (typeof Chart !== 'undefined') {
            // Sales Chart
            const salesCtx = document.getElementById('salesChart');
            if (salesCtx) {
                new Chart(salesCtx, {
                    type: 'line',
                    data: {
                        labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
                        datasets: [{
                            label: 'Satışlar',
                            data: [12, 19, 15, 25, 22, 30],
                            borderColor: '#1E88E5',
                            backgroundColor: 'rgba(30, 136, 229, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true
                    }
                });
            }
            
            // Category Chart
            const categoryCtx = document.getElementById('categoryChart');
            if (categoryCtx) {
                new Chart(categoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Bebekler', 'Puzzle', 'Kumandalılar', 'Diğer'],
                        datasets: [{
                            data: [30, 25, 20, 25],
                            backgroundColor: ['#1E88E5', '#00BFA5', '#F9A825', '#C62828']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true
                    }
                });
            }
        }
    </script>
    
    <style>
        /* Admin-specific styles */
        .admin-body {
            background-color: #F8FAFC;
        }
        
        .main-content {
            margin-left: 280px;
            min-height: 100vh;
            padding-top: 70px;
        }
        
        @media (max-width: 991px) {
            .main-content {
                margin-left: 0;
            }
        }
        
        .stat-card {
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }
        
        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .stat-label {
            font-size: 0.875rem;
            color: #6B7280;
            margin-bottom: 0.25rem;
        }
        
        .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        
        .stat-change {
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .stat-change.positive {
            color: #2E7D32;
        }
        
        .stat-change.negative {
            color: #C62828;
        }
        
        .stat-change.neutral {
            color: #6B7280;
        }
        
        .bg-primary-light { background-color: #E3F2FD; }
        .bg-success-light { background-color: #E8F5E9; }
        .bg-warning-light { background-color: #FFF8E1; }
        .bg-danger-light { background-color: #FFEBEE; }
        
        .card {
            border: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border-radius: 0.75rem;
        }
        
        .card-header {
            background-color: white;
            border-bottom: 1px solid #E5E7EB;
            padding: 1rem 1.5rem;
        }
        
        .card-title {
            font-weight: 600;
        }
    </style>
</body>
</html>
