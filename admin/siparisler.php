<?php
// Basit auth kontrolü (production'da session kullanılmalı)
// session_start();
// if (!isset($_SESSION['admin_logged_in'])) {
//     header('Location: login.php');
//     exit;
// }
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sipariş Yönetimi | Gürbüz Oyuncak Admin</title>
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
            border-bottom: 1px solid #E5E7EB;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .top-bar h1 {
            font-size: 1.875rem;
            color: #1F2937;
            font-weight: 600;
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
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .stat-card h3 {
            font-size: 0.875rem;
            color: #6B7280;
            font-weight: 500;
            margin-bottom: 0.5rem;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: #1F2937;
        }
        
        .card {
            background-color: #FFFFFF;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .card-header {
            padding: 1.5rem;
            border-bottom: 1px solid #E5E7EB;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1F2937;
        }
        
        .card-body {
            padding: 1.5rem;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background-color: #1E88E5;
            color: #FFFFFF;
        }
        
        .btn-primary:hover {
            background-color: #1565C0;
        }
        
        .btn-success {
            background-color: #10B981;
            color: #FFFFFF;
        }
        
        .btn-warning {
            background-color: #F59E0B;
            color: #FFFFFF;
        }
        
        .btn-danger {
            background-color: #EF4444;
            color: #FFFFFF;
        }
        
        .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 0.25rem;
        }
        
        .badge-beklemede {
            background-color: #FEF3C7;
            color: #92400E;
        }
        
        .badge-onaylandi {
            background-color: #DBEAFE;
            color: #1E40AF;
        }
        
        .badge-hazirlaniyor {
            background-color: #E0E7FF;
            color: #3730A3;
        }
        
        .badge-kargoda {
            background-color: #FDE68A;
            color: #92400E;
        }
        
        .badge-teslim-edildi {
            background-color: #D1FAE5;
            color: #065F46;
        }
        
        .badge-iptal-edildi {
            background-color: #FEE2E2;
            color: #991B1B;
        }
        
        .badge-odendi {
            background-color: #D1FAE5;
            color: #065F46;
        }
        
        .badge-basarisiz {
            background-color: #FEE2E2;
            color: #991B1B;
        }
        
        .table-container {
            overflow-x: auto;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th,
        .table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .table th {
            background-color: #F9FAFB;
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }
        
        .table td {
            font-size: 0.875rem;
            color: #6B7280;
        }
        
        .actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .filter-bar {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
            font-size: 0.875rem;
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
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background-color: #FFFFFF;
            padding: 2rem;
            border-radius: 0.5rem;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .order-items {
            margin-top: 1rem;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        
        .alert-success {
            background-color: #D1FAE5;
            color: #065F46;
            border: 1px solid #A7F3D0;
        }
        
        .alert-error {
            background-color: #FEE2E2;
            color: #991B1B;
            border: 1px solid #FECACA;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }
        
        .pagination button {
            padding: 0.5rem 0.75rem;
            border: 1px solid #D1D5DB;
            background-color: #FFFFFF;
            cursor: pointer;
            border-radius: 0.25rem;
        }
        
        .pagination button:hover {
            background-color: #F3F4F6;
        }
        
        .pagination button.active {
            background-color: #1E88E5;
            color: #FFFFFF;
            border-color: #1E88E5;
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Sipariş Yönetimi</h1>
            </div>
            
            <div id="alert-container"></div>
            
            <!-- İstatistikler -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Bugünkü Siparişler</h3>
                    <div class="value" id="daily-orders">-</div>
                </div>
                <div class="stat-card">
                    <h3>Bekleyen Siparişler</h3>
                    <div class="value" id="pending-orders">-</div>
                </div>
                <div class="stat-card">
                    <h3>Bugünkü Satış</h3>
                    <div class="value" id="daily-sales">₺-</div>
                </div>
                <div class="stat-card">
                    <h3>Toplam Sipariş</h3>
                    <div class="value" id="total-orders">-</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Siparişler</h2>
                </div>
                
                <div class="card-body">
                    <!-- Filtreler -->
                    <div class="filter-bar">
                        <div class="form-group" style="margin-bottom: 0;">
                            <input type="text" id="search-input" placeholder="Sipariş no, müşteri adı..." 
                                   style="width: 200px;" onkeyup="filterOrders()">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <select id="status-filter" onchange="filterOrders()" style="width: 150px;">
                                <option value="">Tüm Durumlar</option>
                                <option value="beklemede">Beklemede</option>
                                <option value="onaylandi">Onaylandı</option>
                                <option value="hazirlaniyor">Hazırlanıyor</option>
                                <option value="kargoda">Kargoda</option>
                                <option value="teslim_edildi">Teslim Edildi</option>
                                <option value="iptal_edildi">İptal Edildi</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <select id="payment-filter" onchange="filterOrders()" style="width: 150px;">
                                <option value="">Tüm Ödemeler</option>
                                <option value="beklemede">Ödeme Bekliyor</option>
                                <option value="odendi">Ödendi</option>
                                <option value="basarisiz">Başarısız</option>
                                <option value="iade">İade</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <input type="date" id="date-filter" onchange="filterOrders()" style="width: 150px;">
                        </div>
                        <button class="btn btn-primary" onclick="loadOrders()">Yenile</button>
                    </div>
                    
                    <!-- Sipariş Tablosu -->
                    <div class="table-container">
                        <table class="table">
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
                                    <td colspan="7" style="text-align: center; padding: 2rem;">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Sayfalama -->
                    <div id="pagination-container"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Sipariş Detay Modal -->
    <div id="order-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Sipariş Detayları</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            
            <div id="order-details">
                <!-- Sipariş detayları buraya yüklenecek -->
            </div>
        </div>
    </div>
    
    <script>
        let currentPage = 1;
        let totalPages = 1;
        let orders = [];
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            loadOrders();
            loadStats();
        });
        
        // İstatistikleri yükle
        async function loadStats() {
            try {
                const response = await fetch('../backend/api/siparisler.php/istatistikler');
                const data = await response.json();
                
                if (data.success) {
                    const stats = data.data;
                    
                    // Bugünkü siparişler
                    const today = stats.gunluk_satislar.find(s => s.tarih === new Date().toISOString().split('T')[0]);
                    document.getElementById('daily-orders').textContent = today ? today.siparis_sayisi : '0';
                    document.getElementById('daily-sales').textContent = today ? `₺${parseFloat(today.toplam_satis || 0).toFixed(2)}` : '₺0.00';
                    
                    // Bekleyen siparişler
                    const pending = stats.durum_dagilimi.find(d => d.durum === 'beklemede');
                    document.getElementById('pending-orders').textContent = pending ? pending.siparis_sayisi : '0';
                    
                    // Toplam sipariş (bu ay)
                    const thisMonth = stats.aylik_ozet[0];
                    document.getElementById('total-orders').textContent = thisMonth ? thisMonth.siparis_sayisi : '0';
                }
            } catch (error) {
                console.error('İstatistikler yüklenemedi:', error);
            }
        }
        
        // Siparişleri yükle
        async function loadOrders(page = 1) {
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
                    orders = data.data;
                    displayOrders(orders);
                    
                    // Sayfalama bilgilerini güncelle
                    if (data.pagination) {
                        totalPages = data.pagination.total_pages;
                        currentPage = data.pagination.current_page;
                        updatePagination();
                    }
                } else {
                    showAlert('Siparişler yüklenirken hata oluştu', 'error');
                }
                
            } catch (error) {
                console.error('Siparişler yüklenemedi:', error);
                showAlert('Siparişler yüklenirken hata oluştu', 'error');
            }
        }
        
        // Siparişleri tabloda göster
        function displayOrders(orders) {
            const tbody = document.getElementById('orders-tbody');
            
            if (!orders || orders.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">
                            Sipariş bulunamadı
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td><strong>${order.siparis_no}</strong></td>
                    <td>${order.musteri_adi}</td>
                    <td>${formatDate(order.siparis_tarihi)}</td>
                    <td>₺${parseFloat(order.toplam_tutar || 0).toFixed(2)}</td>
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
                            <button class="btn btn-primary btn-sm" onclick="viewOrder(${order.id})">
                                Detay
                            </button>
                            <button class="btn btn-warning btn-sm" onclick="updateOrderStatus(${order.id})">
                                Güncelle
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        // Tarih formatla
        function formatDate(dateString) {
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
                html += `<button onclick="loadOrders(${currentPage - 1})">« Önceki</button>`;
            }
            
            // Sayfa numaraları
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    html += `<button class="active">${i}</button>`;
                } else {
                    html += `<button onclick="loadOrders(${i})">${i}</button>`;
                }
            }
            
            // Sonraki sayfa
            if (currentPage < totalPages) {
                html += `<button onclick="loadOrders(${currentPage + 1})">Sonraki »</button>`;
            }
            
            html += '</div>';
            container.innerHTML = html;
        }
        
        // Filtreleme
        function filterOrders() {
            loadOrders(1);
        }
        
        // Sipariş detaylarını görüntüle
        async function viewOrder(id) {
            try {
                const response = await fetch(`../backend/api/siparisler.php/${id}`);
                const data = await response.json();
                
                if (data.success) {
                    const order = data.data;
                    displayOrderDetails(order);
                    document.getElementById('order-modal').classList.add('active');
                } else {
                    showAlert('Sipariş detayları yüklenemedi', 'error');
                }
                
            } catch (error) {
                console.error('Sipariş detayları yüklenemedi:', error);
                showAlert('Sipariş detayları yüklenirken hata oluştu', 'error');
            }
        }
        
        // Sipariş detaylarını modal'da göster
        function displayOrderDetails(order) {
            const container = document.getElementById('order-details');
            
            let itemsHtml = '';
            if (order.kalemler && order.kalemler.length > 0) {
                itemsHtml = order.kalemler.map(item => `
                    <div class="order-item">
                        <div>
                            <strong>${item.urun_adi}</strong><br>
                            <small>Ürün Kodu: ${item.urun_kodu || '-'}</small>
                        </div>
                        <div style="text-align: right;">
                            <div>${item.miktar} x ₺${parseFloat(item.birim_fiyat).toFixed(2)}</div>
                            <strong>₺${parseFloat(item.toplam_fiyat).toFixed(2)}</strong>
                        </div>
                    </div>
                `).join('');
            }
            
            container.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h4>Sipariş Bilgileri</h4>
                        <p><strong>Sipariş No:</strong> ${order.siparis_no}</p>
                        <p><strong>Tarih:</strong> ${formatDate(order.siparis_tarihi)}</p>
                        <p><strong>Durum:</strong> 
                            <span class="badge badge-${order.durum}">${getDurumText(order.durum)}</span>
                        </p>
                        <p><strong>Ödeme Durumu:</strong> 
                            <span class="badge badge-${order.odeme_durumu}">${getOdemeDurumText(order.odeme_durumu)}</span>
                        </p>
                        
                        <h4 style="margin-top: 1.5rem;">Müşteri Bilgileri</h4>
                        <p><strong>Ad:</strong> ${order.musteri_adi}</p>
                        <p><strong>E-posta:</strong> ${order.musteri_eposta}</p>
                        <p><strong>Telefon:</strong> ${order.musteri_telefon}</p>
                    </div>
                    
                    <div>
                        <h4>Teslimat Adresi</h4>
                        <p>${order.teslimat_adresi}</p>
                        <p>${order.teslimat_ilce}, ${order.teslimat_il}</p>
                        ${order.teslimat_posta_kodu ? `<p>Posta Kodu: ${order.teslimat_posta_kodu}</p>` : ''}
                        
                        <h4 style="margin-top: 1.5rem;">Fiyat Detayı</h4>
                        <p><strong>Ara Toplam:</strong> ₺${parseFloat(order.ara_toplam).toFixed(2)}</p>
                        <p><strong>Vergi:</strong> ₺${parseFloat(order.vergi_toplami || 0).toFixed(2)}</p>
                        <p><strong>Kargo:</strong> ₺${parseFloat(order.kargo_ucreti || 0).toFixed(2)}</p>
                        <p><strong>İndirim:</strong> -₺${parseFloat(order.indirim_tutari || 0).toFixed(2)}</p>
                        <p><strong>Toplam:</strong> ₺${parseFloat(order.toplam_tutar).toFixed(2)}</p>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h4>Sipariş Kalemleri</h4>
                    <div class="order-items">
                        ${itemsHtml}
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h4>Durum Güncelle</h4>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <select id="new-status" style="flex: 1;">
                            <option value="beklemede" ${order.durum === 'beklemede' ? 'selected' : ''}>Beklemede</option>
                            <option value="onaylandi" ${order.durum === 'onaylandi' ? 'selected' : ''}>Onaylandı</option>
                            <option value="hazirlaniyor" ${order.durum === 'hazirlaniyor' ? 'selected' : ''}>Hazırlanıyor</option>
                            <option value="kargoda" ${order.durum === 'kargoda' ? 'selected' : ''}>Kargoda</option>
                            <option value="teslim_edildi" ${order.durum === 'teslim_edildi' ? 'selected' : ''}>Teslim Edildi</option>
                            <option value="iptal_edildi" ${order.durum === 'iptal_edildi' ? 'selected' : ''}>İptal Edildi</option>
                        </select>
                        <button class="btn btn-success" onclick="saveOrderStatus(${order.id})">
                            Güncelle
                        </button>
                    </div>
                </div>
                
                ${order.siparis_notu ? `
                    <div style="margin-top: 1.5rem;">
                        <h4>Sipariş Notu</h4>
                        <p>${order.siparis_notu}</p>
                    </div>
                ` : ''}
                
                ${order.admin_notu ? `
                    <div style="margin-top: 1.5rem;">
                        <h4>Admin Notu</h4>
                        <p>${order.admin_notu}</p>
                    </div>
                ` : ''}
            `;
        }
        
        // Sipariş durumunu güncelle
        async function saveOrderStatus(orderId) {
            const newStatus = document.getElementById('new-status').value;
            
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
                    showAlert('Sipariş durumu güncellendi', 'success');
                    closeModal();
                    loadOrders(currentPage);
                } else {
                    showAlert(data.message || 'Durum güncellenemedi', 'error');
                }
                
            } catch (error) {
                console.error('Durum güncellenemedi:', error);
                showAlert('Durum güncellenirken hata oluştu', 'error');
            }
        }
        
        // Sipariş durumu güncelleme kısayolu
        async function updateOrderStatus(id) {
            // Basit prompt ile durum güncelleme
            const newStatus = prompt(`
Yeni durum seçin:
1 - Beklemede
2 - Onaylandı  
3 - Hazırlanıyor
4 - Kargoda
5 - Teslim Edildi
6 - İptal Edildi

Sayı giriniz (1-6):`);
            
            const statusMap = {
                '1': 'beklemede',
                '2': 'onaylandi', 
                '3': 'hazirlaniyor',
                '4': 'kargoda',
                '5': 'teslim_edildi',
                '6': 'iptal_edildi'
            };
            
            if (statusMap[newStatus]) {
                try {
                    const response = await fetch(`../backend/api/siparisler.php/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            durum: statusMap[newStatus]
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showAlert('Sipariş durumu güncellendi', 'success');
                        loadOrders(currentPage);
                    } else {
                        showAlert(data.message || 'Durum güncellenemedi', 'error');
                    }
                    
                } catch (error) {
                    console.error('Durum güncellenemedi:', error);
                    showAlert('Durum güncellenirken hata oluştu', 'error');
                }
            }
        }
        
        // Modal kapat
        function closeModal() {
            document.getElementById('order-modal').classList.remove('active');
        }
        
        // Alert göster
        function showAlert(message, type) {
            const container = document.getElementById('alert-container');
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.textContent = message;
            
            container.appendChild(alert);
            
            setTimeout(() => {
                container.removeChild(alert);
            }, 5000);
        }
    </script>
</body>
</html>