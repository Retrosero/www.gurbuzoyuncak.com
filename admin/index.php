<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel | Gürbüz Oyuncak</title>
    <link rel="stylesheet" href="css/admin.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F3F4F6;
        }
        
        .admin-layout {
            display: grid;
            grid-template-columns: 250px 1fr;
            min-height: 100vh;
        }
        
        .sidebar {
            background-color: #1F2937;
            color: #FFFFFF;
            padding: 2rem 0;
        }
        
        .sidebar-header {
            padding: 0 1.5rem 2rem;
            border-bottom: 1px solid #374151;
        }
        
        .sidebar-header h2 {
            font-size: 1.5rem;
            color: #1E88E5;
        }
        
        .sidebar-menu {
            list-style: none;
            margin-top: 2rem;
        }
        
        .sidebar-menu li {
            margin-bottom: 0.5rem;
        }
        
        .sidebar-menu a {
            display: block;
            padding: 0.75rem 1.5rem;
            color: #D1D5DB;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .sidebar-menu a:hover,
        .sidebar-menu a.active {
            background-color: #374151;
            color: #FFFFFF;
            border-left: 3px solid #1E88E5;
        }
        
        .main-content {
            padding: 2rem;
        }
        
        .top-bar {
            background-color: #FFFFFF;
            padding: 1rem 2rem;
            margin: -2rem -2rem 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background-color: #FFFFFF;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            font-size: 0.875rem;
            color: #6B7280;
            margin-bottom: 0.5rem;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: #1F2937;
        }
        
        .stat-card .change {
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        
        .change.positive {
            color: #10B981;
        }
        
        .change.negative {
            color: #EF4444;
        }
        
        .card {
            background-color: #FFFFFF;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .card-header h2 {
            font-size: 1.25rem;
            color: #1F2937;
        }
        
        .btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            text-decoration: none;
        }
        
        .btn-primary {
            background-color: #1E88E5;
            color: #FFFFFF;
        }
        
        .btn-primary:hover {
            background-color: #1565C0;
        }
        
        .btn-danger {
            background-color: #C62828;
            color: #FFFFFF;
        }
        
        .btn-success {
            background-color: #2E7D32;
            color: #FFFFFF;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead {
            background-color: #F9FAFB;
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }
        
        th {
            font-weight: 600;
            color: #374151;
        }
        
        tbody tr:hover {
            background-color: #F9FAFB;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .badge-success {
            background-color: #D1FAE5;
            color: #065F46;
        }
        
        .badge-warning {
            background-color: #FEF3C7;
            color: #92400E;
        }
        
        .badge-danger {
            background-color: #FEE2E2;
            color: #991B1B;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #D1D5DB;
            border-radius: 0.375rem;
            font-size: 0.875rem;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <!-- Sidebar -->
        <?php include 'includes/sidebar.php'; ?>
        
        <!-- Main Content -->
        <main class="main-content">
            <div class="top-bar">
                <h1>Dashboard</h1>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <span style="color: #6B7280;">Hoş geldiniz, Admin</span>
                </div>
            </div>
            
            <!-- Statistics -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Toplam Ürün</h3>
                    <div class="value" id="total-products">0</div>
                    <div class="change positive">+12% bu ay</div>
                </div>
                
                <div class="stat-card">
                    <h3>Bekleyen Sipariş</h3>
                    <div class="value" id="pending-orders">0</div>
                    <div class="change">0 yeni</div>
                </div>
                
                <div class="stat-card">
                    <h3>Toplam Müşteri</h3>
                    <div class="value" id="total-customers">0</div>
                    <div class="change positive">+8% bu ay</div>
                </div>
                
                <div class="stat-card">
                    <h3>Aylık Gelir</h3>
                    <div class="value">₺24,500</div>
                    <div class="change positive">+15% bu ay</div>
                </div>
            </div>
            
            <!-- Recent Orders -->
            <div class="card">
                <div class="card-header">
                    <h2>Son Siparişler</h2>
                    <a href="orders.php" class="btn btn-primary">Tümünü Gör</a>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Sipariş No</th>
                            <th>Müşteri</th>
                            <th>Tutar</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="recent-orders">
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 2rem; color: #6B7280;">
                                Henüz sipariş bulunmuyor
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Low Stock Products -->
            <div class="card">
                <div class="card-header">
                    <h2>Düşük Stoklu Ürünler</h2>
                    <a href="products.php?filter=low_stock" class="btn btn-primary">Tümünü Gör</a>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Ürün Adı</th>
                            <th>SKU</th>
                            <th>Kategori</th>
                            <th>Stok</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="low-stock-products">
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 2rem; color: #6B7280;">
                                Tüm ürünler yeterli stokta
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    
    <script>
        // Dashboard istatistiklerini yükle
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboardStats();
        });
        
        async function loadDashboardStats() {
            try {
                // Toplam ürün sayısını getir
                const productsResponse = await fetch('../backend/api/products.php?limit=1');
                const productsData = await productsResponse.json();
                document.getElementById('total-products').textContent = productsData.total || 0;
                
                // Diğer istatistikleri güncelle (şu an demo veriler)
                document.getElementById('pending-orders').textContent = '0';
                document.getElementById('total-customers').textContent = '0';
            } catch (error) {
                console.error('İstatistikler yüklenirken hata:', error);
            }
        }
    </script>
</body>
</html>
