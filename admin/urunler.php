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
            border-bottom: 1px solid #E5E7EB;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .top-bar h1 {
            font-size: 1.875rem;
            color: #1F2937;
            font-weight: 600;
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
        
        .btn-success:hover {
            background-color: #059669;
        }
        
        .btn-warning {
            background-color: #F59E0B;
            color: #FFFFFF;
        }
        
        .btn-warning:hover {
            background-color: #D97706;
        }
        
        .btn-danger {
            background-color: #EF4444;
            color: #FFFFFF;
        }
        
        .btn-danger:hover {
            background-color: #DC2626;
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
        
        .badge-success {
            background-color: #D1FAE5;
            color: #065F46;
        }
        
        .badge-danger {
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
        
        .form-row-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
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
        
        .urun-gorsel {
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
        
        .image-gallery {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .image-item {
            position: relative;
        }
        
        .image-item img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 0.25rem;
            border: 1px solid #E5E7EB;
        }
        
        .image-item .remove-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #EF4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Ürün Yönetimi</h1>
            </div>
            
            <div id="alert-container"></div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Ürünler</h2>
                    <button class="btn btn-primary" onclick="openModal('add')">
                        Yeni Ürün Ekle
                    </button>
                </div>
                
                <div class="card-body">
                    <!-- Filtreler -->
                    <div class="filter-bar">
                        <div class="form-group" style="margin-bottom: 0;">
                            <input type="text" id="search-input" placeholder="Ürün ara..." 
                                   style="width: 200px;" onkeyup="filterProducts()">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <select id="category-filter" onchange="filterProducts()" style="width: 150px;">
                                <option value="">Tüm Kategoriler</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <select id="status-filter" onchange="filterProducts()" style="width: 120px;">
                                <option value="">Tüm Durumlar</option>
                                <option value="1">Aktif</option>
                                <option value="0">Pasif</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" onclick="loadProducts()">Yenile</button>
                    </div>
                    
                    <!-- Ürün Tablosu -->
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Görsel</th>
                                    <th>Ürün Adı</th>
                                    <th>Ürün Kodu</th>
                                    <th>Kategori</th>
                                    <th>Fiyat</th>
                                    <th>Stok</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody id="products-tbody">
                                <tr>
                                    <td colspan="8" style="text-align: center; padding: 2rem;">
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
    
    <!-- Ürün Ekleme/Düzenleme Modal -->
    <div id="product-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Yeni Ürün Ekle</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            
            <form id="product-form" onsubmit="saveProduct(event)">
                <input type="hidden" id="product-id">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="urun-adi">Ürün Adı *</label>
                        <input type="text" id="urun-adi" required>
                    </div>
                    <div class="form-group">
                        <label for="urun-kodu">Ürün Kodu *</label>
                        <input type="text" id="urun-kodu" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="barkod">Barkod</label>
                        <input type="text" id="barkod">
                    </div>
                    <div class="form-group">
                        <label for="kategori-id">Kategori</label>
                        <select id="kategori-id">
                            <option value="">Kategori Seçiniz</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="aciklama">Açıklama</label>
                    <textarea id="aciklama" rows="3"></textarea>
                </div>
                
                <div class="form-row-3">
                    <div class="form-group">
                        <label for="fiyat">Fiyat (₺) *</label>
                        <input type="number" id="fiyat" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="karsilastirma-fiyati">Karşılaştırma Fiyatı (₺)</label>
                        <input type="number" id="karsilastirma-fiyati" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="stok-miktari">Stok Miktarı *</label>
                        <input type="number" id="stok-miktari" min="0" required>
                    </div>
                </div>
                
                <div class="form-row-3">
                    <div class="form-group">
                        <label for="yeni-urun">Yeni Ürün</label>
                        <select id="yeni-urun">
                            <option value="0">Hayır</option>
                            <option value="1">Evet</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="vitrin-urunu">Vitrin Ürünü</label>
                        <select id="vitrin-urunu">
                            <option value="0">Hayır</option>
                            <option value="1">Evet</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="aktif">Durum</label>
                        <select id="aktif">
                            <option value="1">Aktif</option>
                            <option value="0">Pasif</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="ana-gorsel">Ana Görsel URL</label>
                    <input type="url" id="ana-gorsel">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="meta-baslik">SEO Başlık</label>
                        <input type="text" id="meta-baslik">
                    </div>
                    <div class="form-group">
                        <label for="meta-aciklama">SEO Açıklama</label>
                        <input type="text" id="meta-aciklama">
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="submit" class="btn btn-success">Kaydet</button>
                    <button type="button" class="btn btn-danger" onclick="closeModal()">İptal</button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        let currentPage = 1;
        let totalPages = 1;
        let products = [];
        let categories = [];
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            loadProducts();
            loadCategories();
        });
        
        // Kategorileri yükle
        async function loadCategories() {
            try {
                const response = await fetch('../backend/api/kategoriler.php');
                const data = await response.json();
                
                if (data.success) {
                    categories = data.data;
                    
                    // Kategori filtre dropdown'unu doldur
                    const categoryFilter = document.getElementById('category-filter');
                    const categorySelect = document.getElementById('kategori-id');
                    
                    categoryFilter.innerHTML = '<option value="">Tüm Kategoriler</option>';
                    categorySelect.innerHTML = '<option value="">Kategori Seçiniz</option>';
                    
                    categories.forEach(category => {
                        categoryFilter.innerHTML += `<option value="${category.id}">${category.kategori_adi}</option>`;
                        categorySelect.innerHTML += `<option value="${category.id}">${category.kategori_adi}</option>`;
                    });
                }
            } catch (error) {
                console.error('Kategoriler yüklenemedi:', error);
            }
        }
        
        // Ürünleri yükle
        async function loadProducts(page = 1) {
            try {
                const searchTerm = document.getElementById('search-input').value;
                const categoryFilter = document.getElementById('category-filter').value;
                const statusFilter = document.getElementById('status-filter').value;
                
                let url = `../backend/api/urunler.php?limit=20&offset=${(page - 1) * 20}`;
                
                if (searchTerm) url += `&arama=${encodeURIComponent(searchTerm)}`;
                if (categoryFilter) url += `&kategori_id=${categoryFilter}`;
                if (statusFilter !== '') url += `&aktif=${statusFilter}`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.success) {
                    products = data.data;
                    displayProducts(products);
                    
                    // Sayfalama bilgilerini güncelle
                    if (data.pagination) {
                        totalPages = data.pagination.total_pages;
                        currentPage = data.pagination.current_page;
                        updatePagination();
                    }
                } else {
                    showAlert('Ürünler yüklenirken hata oluştu', 'error');
                }
                
            } catch (error) {
                console.error('Ürünler yüklenemedi:', error);
                showAlert('Ürünler yüklenirken hata oluştu', 'error');
            }
        }
        
        // Ürünleri tabloda göster
        function displayProducts(products) {
            const tbody = document.getElementById('products-tbody');
            
            if (!products || products.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 2rem;">
                            Ürün bulunamadı
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>
                        <img src="${product.ana_gorsel || 'https://via.placeholder.com/50'}" 
                             alt="${product.urun_adi}" class="urun-gorsel">
                    </td>
                    <td>${product.urun_adi}</td>
                    <td>${product.urun_kodu}</td>
                    <td>${product.kategori_adi || '-'}</td>
                    <td>₺${parseFloat(product.fiyat || 0).toFixed(2)}</td>
                    <td>${product.stok_miktari || 0}</td>
                    <td>
                        <span class="badge ${product.aktif == 1 ? 'badge-success' : 'badge-danger'}">
                            ${product.aktif == 1 ? 'Aktif' : 'Pasif'}
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
                html += `<button onclick="loadProducts(${currentPage - 1})">« Önceki</button>`;
            }
            
            // Sayfa numaraları
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    html += `<button class="active">${i}</button>`;
                } else {
                    html += `<button onclick="loadProducts(${i})">${i}</button>`;
                }
            }
            
            // Sonraki sayfa
            if (currentPage < totalPages) {
                html += `<button onclick="loadProducts(${currentPage + 1})">Sonraki »</button>`;
            }
            
            html += '</div>';
            container.innerHTML = html;
        }
        
        // Filtreleme
        function filterProducts() {
            loadProducts(1);
        }
        
        // Modal aç
        function openModal(mode, productId = null) {
            const modal = document.getElementById('product-modal');
            const title = document.getElementById('modal-title');
            
            if (mode === 'add') {
                title.textContent = 'Yeni Ürün Ekle';
                document.getElementById('product-form').reset();
                document.getElementById('product-id').value = '';
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
                const response = await fetch(`../backend/api/urunler.php/${id}`);
                const data = await response.json();
                
                if (data.success) {
                    const product = data.data;
                    
                    document.getElementById('modal-title').textContent = 'Ürün Düzenle';
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('urun-adi').value = product.urun_adi || '';
                    document.getElementById('urun-kodu').value = product.urun_kodu || '';
                    document.getElementById('barkod').value = product.barkod || '';
                    document.getElementById('kategori-id').value = product.kategori_id || '';
                    document.getElementById('aciklama').value = product.aciklama || '';
                    document.getElementById('fiyat').value = product.fiyat || '';
                    document.getElementById('karsilastirma-fiyati').value = product.karsilastirma_fiyati || '';
                    document.getElementById('stok-miktari').value = product.stok_miktari || '';
                    document.getElementById('yeni-urun').value = product.yeni_urun || '0';
                    document.getElementById('vitrin-urunu').value = product.vitrin_urunu || '0';
                    document.getElementById('aktif').value = product.aktif || '1';
                    document.getElementById('ana-gorsel').value = product.ana_gorsel || '';
                    document.getElementById('meta-baslik').value = product.meta_baslik || '';
                    document.getElementById('meta-aciklama').value = product.meta_aciklama || '';
                    
                    openModal('edit', id);
                } else {
                    showAlert('Ürün bilgileri yüklenemedi', 'error');
                }
                
            } catch (error) {
                console.error('Ürün bilgileri yüklenemedi:', error);
                showAlert('Ürün bilgileri yüklenirken hata oluştu', 'error');
            }
        }
        
        // Ürün kaydet
        async function saveProduct(event) {
            event.preventDefault();
            
            const id = document.getElementById('product-id').value;
            const isEdit = id !== '';
            
            const productData = {
                urun_adi: document.getElementById('urun-adi').value,
                urun_kodu: document.getElementById('urun-kodu').value,
                barkod: document.getElementById('barkod').value,
                kategori_id: document.getElementById('kategori-id').value || null,
                aciklama: document.getElementById('aciklama').value,
                fiyat: parseFloat(document.getElementById('fiyat').value),
                karsilastirma_fiyati: parseFloat(document.getElementById('karsilastirma-fiyati').value) || null,
                stok_miktari: parseInt(document.getElementById('stok-miktari').value),
                yeni_urun: parseInt(document.getElementById('yeni-urun').value),
                vitrin_urunu: parseInt(document.getElementById('vitrin-urunu').value),
                aktif: parseInt(document.getElementById('aktif').value),
                ana_gorsel: document.getElementById('ana-gorsel').value,
                meta_baslik: document.getElementById('meta-baslik').value,
                meta_aciklama: document.getElementById('meta-aciklama').value
            };
            
            try {
                const url = isEdit ? `../backend/api/urunler.php/${id}` : '../backend/api/urunler.php';
                const method = isEdit ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert(isEdit ? 'Ürün başarıyla güncellendi' : 'Ürün başarıyla eklendi', 'success');
                    closeModal();
                    loadProducts(currentPage);
                } else {
                    showAlert(data.message || 'İşlem başarısız', 'error');
                }
                
            } catch (error) {
                console.error('Ürün kaydedilemedi:', error);
                showAlert('Ürün kaydedilirken hata oluştu', 'error');
            }
        }
        
        // Ürün sil
        async function deleteProduct(id) {
            if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
                return;
            }
            
            try {
                const response = await fetch(`../backend/api/urunler.php/${id}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Ürün başarıyla silindi', 'success');
                    loadProducts(currentPage);
                } else {
                    showAlert(data.message || 'Ürün silinemedi', 'error');
                }
                
            } catch (error) {
                console.error('Ürün silinemedi:', error);
                showAlert('Ürün silinirken hata oluştu', 'error');
            }
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