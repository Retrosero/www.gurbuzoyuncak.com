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
    <title>Ürün Yönetimi | Gürbüz Oyuncak Admin</title>
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
        
        .btn-danger {
            background-color: #C62828;
            color: #FFFFFF;
            padding: 0.375rem 0.75rem;
        }
        
        .btn-warning {
            background-color: #F9A825;
            color: #FFFFFF;
            padding: 0.375rem 0.75rem;
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
        
        .badge-success {
            background-color: #D1FAE5;
            color: #065F46;
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
        
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
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
            max-width: 600px;
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
        
        .product-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 0.25rem;
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
        
        .image-preview {
            margin-top: 1rem;
        }
        
        .image-preview img {
            max-width: 200px;
            max-height: 200px;
            border-radius: 0.5rem;
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
                <h1>Ürün Yönetimi</h1>
                <button class="btn btn-primary" onclick="openModal('add')">
                    + Yeni Ürün Ekle
                </button>
            </div>
            
            <div id="alert-container"></div>
            
            <!-- Filters -->
            <div class="card">
                <div class="filter-bar">
                    <input type="text" id="search" placeholder="Ürün adı, SKU ara..." style="min-width: 250px;">
                    <select id="category-filter">
                        <option value="">Tüm Kategoriler</option>
                    </select>
                    <select id="status-filter">
                        <option value="">Tüm Durumlar</option>
                        <option value="1">Aktif</option>
                        <option value="0">Pasif</option>
                    </select>
                    <button class="btn btn-primary btn-sm" onclick="loadProducts()">Filtrele</button>
                </div>
            </div>
            
            <!-- Products Table -->
            <div class="card">
                <div class="card-header">
                    <h2>Ürünler</h2>
                    <span id="product-count">Toplam: 0 ürün</span>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Görsel</th>
                            <th>Ürün Adı</th>
                            <th>SKU</th>
                            <th>Kategori</th>
                            <th>Fiyat</th>
                            <th>Stok</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="products-table">
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
    
    <!-- Add/Edit Product Modal -->
    <div id="product-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Yeni Ürün Ekle</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            
            <form id="product-form" onsubmit="saveProduct(event)">
                <input type="hidden" id="product-id">
                
                <div class="form-group">
                    <label>Ürün Adı *</label>
                    <input type="text" id="product-name" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>SKU *</label>
                        <input type="text" id="product-sku" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Kategori *</label>
                        <select id="product-category" required>
                            <option value="">Seçiniz</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Açıklama</label>
                    <textarea id="product-description"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Fiyat (₺) *</label>
                        <input type="number" id="product-price" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label>İndirimli Fiyat (₺)</label>
                        <input type="number" id="product-sale-price" step="0.01">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Stok Adedi *</label>
                        <input type="number" id="product-stock" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Yaş Grubu</label>
                        <select id="product-age-group">
                            <option value="">Seçiniz</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Marka</label>
                        <select id="product-brand">
                            <option value="">Seçiniz</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Durum</label>
                        <select id="product-status">
                            <option value="1">Aktif</option>
                            <option value="0">Pasif</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Ürün Görseli</label>
                    <input type="file" id="product-image" accept="image/*" onchange="previewImage(event)">
                    <div id="image-preview" class="image-preview"></div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-success" style="flex: 1;">
                        Kaydet
                    </button>
                    <button type="button" class="btn btn-danger" onclick="closeModal()" style="flex: 1;">
                        İptal
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        let categories = [];
        let ageGroups = [];
        let brands = [];
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            loadCategories();
            loadAgeGroups();
            loadBrands();
            loadProducts();
        });
        
        // Kategorileri yükle
        async function loadCategories() {
            try {
                const response = await fetch('../backend/api/categories.php');
                const data = await response.json();
                categories = data.data || [];
                
                const categoryFilter = document.getElementById('category-filter');
                const productCategory = document.getElementById('product-category');
                
                categories.forEach(cat => {
                    categoryFilter.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
                    productCategory.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
                });
            } catch (error) {
                console.error('Kategoriler yüklenemedi:', error);
            }
        }
        
        // Yaş gruplarını yükle
        async function loadAgeGroups() {
            // Mock data - API'den çekilebilir
            ageGroups = [
                {id: 1, name: '0-3 yaş'},
                {id: 2, name: '4-7 yaş'},
                {id: 3, name: '8+ yaş'}
            ];
            
            const ageGroupSelect = document.getElementById('product-age-group');
            ageGroups.forEach(ag => {
                ageGroupSelect.innerHTML += `<option value="${ag.id}">${ag.name}</option>`;
            });
        }
        
        // Markaları yükle
        async function loadBrands() {
            // Mock data - API'den çekilebilir
            brands = [
                {id: 1, name: 'Gürbüz Oyuncak'},
                {id: 2, name: 'Barbie'},
                {id: 3, name: 'Hot Wheels'},
                {id: 4, name: 'LEGO'},
                {id: 5, name: 'Playmobil'}
            ];
            
            const brandSelect = document.getElementById('product-brand');
            brands.forEach(brand => {
                brandSelect.innerHTML += `<option value="${brand.id}">${brand.name}</option>`;
            });
        }
        
        // Ürünleri yükle
        async function loadProducts() {
            try {
                const search = document.getElementById('search').value;
                const category = document.getElementById('category-filter').value;
                const status = document.getElementById('status-filter').value;
                
                let url = '../backend/api/products.php?';
                if (search) url += `search=${search}&`;
                if (category) url += `category_id=${category}&`;
                if (status !== '') url += `is_active=${status}&`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                const products = data.data || [];
                const tbody = document.getElementById('products-table');
                document.getElementById('product-count').textContent = `Toplam: ${products.length} ürün`;
                
                if (products.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 2rem; color: #6B7280;">
                                Ürün bulunamadı
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                tbody.innerHTML = products.map(product => `
                    <tr>
                        <td>
                            <img src="${product.image_url || 'https://via.placeholder.com/50'}" 
                                 alt="${product.name}" class="product-image">
                        </td>
                        <td>${product.name}</td>
                        <td>${product.sku}</td>
                        <td>${product.category_name || '-'}</td>
                        <td>₺${parseFloat(product.price).toFixed(2)}</td>
                        <td>${product.stock_quantity}</td>
                        <td>
                            <span class="badge ${product.is_active ? 'badge-success' : 'badge-danger'}">
                                ${product.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                        </td>
                        <td>
                            <div class="actions">
                                <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">
                                    Düzenle
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                                    Sil
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Ürünler yüklenemedi:', error);
                showAlert('Ürünler yüklenirken hata oluştu', 'error');
            }
        }
        
        // Modal aç
        function openModal(mode, productId = null) {
            const modal = document.getElementById('product-modal');
            const title = document.getElementById('modal-title');
            
            if (mode === 'add') {
                title.textContent = 'Yeni Ürün Ekle';
                document.getElementById('product-form').reset();
                document.getElementById('product-id').value = '';
                document.getElementById('image-preview').innerHTML = '';
            }
            
            modal.classList.add('active');
        }
        
        // Modal kapat
        function closeModal() {
            document.getElementById('product-modal').classList.remove('active');
        }
        
        // Ürün düzenle
        async function editProduct(id) {
            try {
                const response = await fetch(`../backend/api/products.php?id=${id}`);
                const data = await response.json();
                const product = data.data;
                
                document.getElementById('modal-title').textContent = 'Ürün Düzenle';
                document.getElementById('product-id').value = product.id;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-sku').value = product.sku;
                document.getElementById('product-category').value = product.category_id;
                document.getElementById('product-description').value = product.description || '';
                document.getElementById('product-price').value = product.price;
                document.getElementById('product-sale-price').value = product.sale_price || '';
                document.getElementById('product-stock').value = product.stock_quantity;
                document.getElementById('product-age-group').value = product.age_group_id || '';
                document.getElementById('product-brand').value = product.brand_id || '';
                document.getElementById('product-status').value = product.is_active ? '1' : '0';
                
                if (product.image_url) {
                    document.getElementById('image-preview').innerHTML = 
                        `<img src="${product.image_url}" alt="${product.name}">`;
                }
                
                openModal('edit', id);
                
            } catch (error) {
                console.error('Ürün bilgileri yüklenemedi:', error);
                showAlert('Ürün bilgileri yüklenirken hata oluştu', 'error');
            }
        }
        
        // Ürün kaydet
        async function saveProduct(event) {
            event.preventDefault();
            
            const id = document.getElementById('product-id').value;
            const method = id ? 'PUT' : 'POST';
            
            const productData = {
                name: document.getElementById('product-name').value,
                sku: document.getElementById('product-sku').value,
                category_id: document.getElementById('product-category').value,
                description: document.getElementById('product-description').value,
                price: document.getElementById('product-price').value,
                sale_price: document.getElementById('product-sale-price').value || null,
                stock_quantity: document.getElementById('product-stock').value,
                age_group_id: document.getElementById('product-age-group').value || null,
                brand_id: document.getElementById('product-brand').value || null,
                is_active: document.getElementById('product-status').value
            };
            
            if (id) {
                productData.id = id;
            }
            
            try {
                const response = await fetch('../backend/api/products.php', {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert(id ? 'Ürün başarıyla güncellendi' : 'Ürün başarıyla eklendi', 'success');
                    closeModal();
                    loadProducts();
                } else {
                    showAlert(result.message || 'İşlem başarısız', 'error');
                }
                
            } catch (error) {
                console.error('Ürün kaydedilirken hata:', error);
                showAlert('Ürün kaydedilirken hata oluştu', 'error');
            }
        }
        
        // Ürün sil
        async function deleteProduct(id) {
            if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
                return;
            }
            
            try {
                const response = await fetch('../backend/api/products.php', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: id })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert('Ürün başarıyla silindi', 'success');
                    loadProducts();
                } else {
                    showAlert(result.message || 'Silme işlemi başarısız', 'error');
                }
                
            } catch (error) {
                console.error('Ürün silinirken hata:', error);
                showAlert('Ürün silinirken hata oluştu', 'error');
            }
        }
        
        // Görsel önizleme
        function previewImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('image-preview').innerHTML = 
                        `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
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
        
        // Arama inputu için debounce
        let searchTimeout;
        document.getElementById('search').addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadProducts();
            }, 500);
        });
    </script>
</body>
</html>
