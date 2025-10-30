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
            font-size: 0.875rem;
        }
        
        .btn-primary {
            background-color: #1E88E5;
            color: #FFFFFF;
        }
        
        .btn-primary:hover {
            background-color: #1565C0;
        }
        
        .btn-success {
            background-color: #2E7D32;
            color: #FFFFFF;
        }
        
        .btn-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
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
            font-size: 0.875rem;
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
        
        .badge-pending {
            background-color: #FEF3C7;
            color: #92400E;
        }
        
        .badge-processing {
            background-color: #DBEAFE;
            color: #1E3A8A;
        }
        
        .badge-shipped {
            background-color: #E0E7FF;
            color: #3730A3;
        }
        
        .badge-delivered {
            background-color: #D1FAE5;
            color: #065F46;
        }
        
        .badge-cancelled {
            background-color: #FEE2E2;
            color: #991B1B;
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
        
        .modal-header h3 {
            font-size: 1.25rem;
            color: #1F2937;
        }
        
        .close {
            font-size: 1.5rem;
            font-weight: 700;
            color: #6B7280;
            cursor: pointer;
        }
        
        .close:hover {
            color: #1F2937;
        }
        
        .filter-bar {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        
        .filter-bar select,
        .filter-bar input {
            padding: 0.5rem;
            border: 1px solid #D1D5DB;
            border-radius: 0.375rem;
            font-size: 0.875rem;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        
        .alert-success {
            background-color: #D1FAE5;
            color: #065F46;
            border: 1px solid #6EE7B7;
        }
        
        .alert-error {
            background-color: #FEE2E2;
            color: #991B1B;
            border: 1px solid #FCA5A5;
        }
        
        .order-detail-section {
            margin-bottom: 1.5rem;
        }
        
        .order-detail-section h4 {
            font-size: 1rem;
            color: #1F2937;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #E5E7EB;
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
            font-size: 0.75rem;
            color: #6B7280;
            margin-bottom: 0.25rem;
        }
        
        .info-value {
            font-size: 0.875rem;
            color: #1F2937;
            font-weight: 500;
        }
        
        .order-items {
            margin-top: 1rem;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background-color: #F9FAFB;
            border-radius: 0.375rem;
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <!-- Main Content -->
        <main class="main-content">
            <div class="top-bar">
                <h1>Sipariş Yönetimi</h1>
                <div style="display: flex; gap: 1rem;">
                    <select id="bulk-action" style="padding: 0.5rem; border-radius: 0.375rem; border: 1px solid #D1D5DB;">
                        <option value="">Toplu İşlem</option>
                        <option value="processing">İşleme Al</option>
                        <option value="shipped">Kargoya Ver</option>
                        <option value="delivered">Teslim Edildi</option>
                    </select>
                </div>
            </div>
            
            <div id="alert-container"></div>
            
            <!-- Filters -->
            <div class="card">
                <div class="filter-bar">
                    <input type="text" id="search" placeholder="Sipariş no, müşteri adı..." style="min-width: 250px;">
                    <select id="status-filter">
                        <option value="">Tüm Durumlar</option>
                        <option value="pending">Bekliyor</option>
                        <option value="processing">İşleniyor</option>
                        <option value="shipped">Kargoda</option>
                        <option value="delivered">Teslim Edildi</option>
                        <option value="cancelled">İptal Edildi</option>
                    </select>
                    <input type="date" id="date-from" placeholder="Başlangıç">
                    <input type="date" id="date-to" placeholder="Bitiş">
                    <button class="btn btn-primary btn-sm" onclick="loadOrders()">Filtrele</button>
                </div>
            </div>
            
            <!-- Orders Table -->
            <div class="card">
                <div class="card-header">
                    <h2>Siparişler</h2>
                    <span id="order-count">Toplam: 0 sipariş</span>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all"></th>
                            <th>Sipariş No</th>
                            <th>Müşteri</th>
                            <th>Ürün Sayısı</th>
                            <th>Toplam</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="orders-table">
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 2rem; color: #6B7280;">
                                Yükleniyor...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    
    <!-- Order Detail Modal -->
    <div id="order-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Sipariş Detayları</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            
            <div id="order-detail-content">
                <!-- Dinamik içerik buraya gelecek -->
            </div>
        </div>
    </div>
    
    <script>
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            loadOrders();
        });
        
        // Siparişleri yükle
        async function loadOrders() {
            try {
                const search = document.getElementById('search').value;
                const status = document.getElementById('status-filter').value;
                const dateFrom = document.getElementById('date-from').value;
                const dateTo = document.getElementById('date-to').value;
                
                let url = '../backend/api/orders.php?';
                if (search) url += `search=${search}&`;
                if (status) url += `status=${status}&`;
                if (dateFrom) url += `date_from=${dateFrom}&`;
                if (dateTo) url += `date_to=${dateTo}&`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                const orders = data.data || [];
                const tbody = document.getElementById('orders-table');
                document.getElementById('order-count').textContent = `Toplam: ${orders.length} sipariş`;
                
                if (orders.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 2rem; color: #6B7280;">
                                Sipariş bulunamadı
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                tbody.innerHTML = orders.map(order => {
                    const statusBadge = getStatusBadge(order.status);
                    return `
                        <tr>
                            <td><input type="checkbox" class="order-checkbox" value="${order.id}"></td>
                            <td><strong>#${order.order_number}</strong></td>
                            <td>${order.customer_name || 'Misafir'}</td>
                            <td>${order.item_count || 0} ürün</td>
                            <td><strong>₺${parseFloat(order.total_amount).toFixed(2)}</strong></td>
                            <td>${statusBadge}</td>
                            <td>${formatDate(order.created_at)}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="viewOrder(${order.id})">
                                    Detay
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
            } catch (error) {
                console.error('Siparişler yüklenemedi:', error);
                showAlert('Siparişler yüklenirken hata oluştu', 'error');
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
                        <h4>Genel Bilgiler</h4>
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
                        <h4>Müşteri Bilgileri</h4>
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
                        <h4>Teslimat Adresi</h4>
                        <p style="color: #374151; font-size: 0.875rem;">
                            ${order.shipping_address || 'Adres bilgisi yok'}
                        </p>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4>Sipariş İçeriği</h4>
                        <div class="order-items">
                            ${order.items ? order.items.map(item => `
                                <div class="order-item">
                                    <div>
                                        <strong>${item.product_name}</strong><br>
                                        <small style="color: #6B7280;">${item.quantity} adet × ₺${parseFloat(item.price).toFixed(2)}</small>
                                    </div>
                                    <strong>₺${(item.quantity * parseFloat(item.price)).toFixed(2)}</strong>
                                </div>
                            `).join('') : '<p>Ürün bilgisi yok</p>'}
                        </div>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4>Durum Güncelle</h4>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-sm" style="background: #F59E0B; color: white;" 
                                    onclick="updateOrderStatus(${order.id}, 'processing')">İşleme Al</button>
                            <button class="btn btn-sm" style="background: #3B82F6; color: white;" 
                                    onclick="updateOrderStatus(${order.id}, 'shipped')">Kargoya Ver</button>
                            <button class="btn btn-success btn-sm" 
                                    onclick="updateOrderStatus(${order.id}, 'delivered')">Teslim Edildi</button>
                            <button class="btn btn-sm" style="background: #EF4444; color: white;" 
                                    onclick="updateOrderStatus(${order.id}, 'cancelled')">İptal Et</button>
                        </div>
                    </div>
                `;
                
                document.getElementById('order-detail-content').innerHTML = content;
                document.getElementById('order-modal').classList.add('active');
                
            } catch (error) {
                console.error('Sipariş detayları yüklenemedi:', error);
                showAlert('Sipariş detayları yüklenirken hata oluştu', 'error');
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
                    showAlert('Sipariş durumu güncellendi', 'success');
                    closeModal();
                    loadOrders();
                } else {
                    showAlert(result.message || 'Güncelleme başarısız', 'error');
                }
                
            } catch (error) {
                console.error('Durum güncellenirken hata:', error);
                showAlert('Durum güncellenirken hata oluştu', 'error');
            }
        }
        
        // Durum badge'i oluştur
        function getStatusBadge(status) {
            const badges = {
                'pending': '<span class="badge badge-pending">Bekliyor</span>',
                'processing': '<span class="badge badge-processing">İşleniyor</span>',
                'shipped': '<span class="badge badge-shipped">Kargoda</span>',
                'delivered': '<span class="badge badge-delivered">Teslim Edildi</span>',
                'cancelled': '<span class="badge badge-cancelled">İptal Edildi</span>'
            };
            return badges[status] || status;
        }
        
        // Tarih formatla
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Modal kapat
        function closeModal() {
            document.getElementById('order-modal').classList.remove('active');
        }
        
        // Alert göster
        function showAlert(message, type) {
            const container = document.getElementById('alert-container');
            const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
            
            container.innerHTML = `
                <div class="alert ${alertClass}">
                    ${message}
                </div>
            `;
            
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }
        
        // Tümünü seç
        document.getElementById('select-all').addEventListener('change', function(e) {
            document.querySelectorAll('.order-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
            });
        });
        
        // Arama için debounce
        let searchTimeout;
        document.getElementById('search').addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadOrders();
            }, 500);
        });
    </script>
</body>
</html>
