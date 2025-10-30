<?php
/**
 * Ürün Yönetimi - Admin Panel
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
    <title>Ürün Yönetimi - Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- Custom Styles -->
    <style>
        .page-header {
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }
        
        .page-header h1 {
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .page-header .btn {
            background: white;
            color: #4CAF50;
            font-weight: 600;
            border: none;
            min-height: 44px;
            padding: 0.625rem 1.5rem;
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .page-header .btn:hover {
            background: #f1f8f4;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
            border-color: #4CAF50;
            box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.15);
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
        
        .product-count {
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
        
        .products-table {
            margin-bottom: 0;
        }
        
        .products-table thead {
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .products-table th {
            font-weight: 600;
            color: #495057;
            font-size: 0.875rem;
            padding: 1rem 0.75rem;
            border-bottom: 2px solid #dee2e6;
            white-space: nowrap;
        }
        
        .products-table td {
            padding: 0.875rem 0.75rem;
            vertical-align: middle;
            font-size: 0.9rem;
        }
        
        .products-table tbody tr {
            transition: all 0.2s;
            border-bottom: 1px solid #e9ecef;
        }
        
        .products-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        .product-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        
        .badge-status {
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
            font-size: 0.8125rem;
            font-weight: 500;
            display: inline-block;
        }
        
        .badge-active {
            background: #d4edda;
            color: #155724;
        }
        
        .badge-inactive {
            background: #f8d7da;
            color: #721c24;
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
        
        .btn-group-action {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
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
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
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
        
        .form-label {
            font-weight: 500;
            color: #495057;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .image-preview {
            margin-top: 1rem;
            text-align: center;
        }
        
        .image-preview img {
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            border: 2px solid #dee2e6;
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
            
            .products-table th,
            .products-table td {
                padding: 0.625rem 0.5rem;
                font-size: 0.8125rem;
            }
            
            .product-image {
                width: 40px;
                height: 40px;
            }
            
            .btn-group-action {
                flex-direction: column;
            }
            
            .btn-group-action .btn {
                width: 100%;
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
    </style>
</head>

<body>
    <!-- Sidebar -->
    <?php $loader->loadComponent('sidebar', ['type' => 'admin', 'active' => 'products']); ?>
    
    <!-- Main Content -->
    <div class="main-content">
        <!-- Mobile Header -->
        <div class="mobile-header d-md-none">
            <button class="mobile-menu-toggle" id="mobileMenuToggle">
                <i class="fas fa-bars"></i>
            </button>
            <div class="mobile-header-title">Ürün Yönetimi</div>
            <div class="mobile-header-actions">
                <button class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#productModal" onclick="openAddModal()">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
        
        <div class="container-fluid p-3 p-md-4">
            <!-- Page Header -->
            <div class="page-header">
                <div class="px-3 px-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h1><i class="fas fa-box me-2"></i> Ürün Yönetimi</h1>
                        <p class="mb-0 opacity-90">Ürünleri görüntüle, ekle, düzenle ve yönet</p>
                    </div>
                    <button class="btn d-none d-md-inline-flex align-items-center" data-bs-toggle="modal" data-bs-target="#productModal" onclick="openAddModal()">
                        <i class="fas fa-plus me-2"></i> Yeni Ürün Ekle
                    </button>
                </div>
            </div>
            
            <!-- Alert Container -->
            <div id="alertContainer"></div>
            
            <!-- Filters -->
            <div class="filter-card">
                <div class="row g-3">
                    <div class="col-12 col-md-4">
                        <input type="text" id="searchInput" class="form-control" placeholder="Ürün adı, SKU ara...">
                    </div>
                    <div class="col-6 col-md-3">
                        <select id="categoryFilter" class="form-select">
                            <option value="">Tüm Kategoriler</option>
                        </select>
                    </div>
                    <div class="col-6 col-md-3">
                        <select id="statusFilter" class="form-select">
                            <option value="">Tüm Durumlar</option>
                            <option value="1">Aktif</option>
                            <option value="0">Pasif</option>
                        </select>
                    </div>
                    <div class="col-12 col-md-2">
                        <button class="btn btn-primary w-100" onclick="loadProducts()">
                            <i class="fas fa-filter me-2"></i> Filtrele
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Products Table -->
            <div class="table-card">
                <div class="table-card-header">
                    <h2><i class="fas fa-list me-2"></i> Ürünler</h2>
                    <span class="product-count" id="productCount">Toplam: 0 ürün</span>
                </div>
                
                <div class="table-responsive">
                    <table class="table products-table">
                        <thead>
                            <tr>
                                <th style="width: 70px;">Görsel</th>
                                <th>Ürün Adı</th>
                                <th class="hide-mobile">SKU</th>
                                <th class="hide-mobile">Kategori</th>
                                <th>Fiyat</th>
                                <th class="hide-mobile">Stok</th>
                                <th>Durum</th>
                                <th style="width: 180px;">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="productsTableBody">
                            <tr>
                                <td colspan="8" class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Yükleniyor...</span>
                                    </div>
                                    <p class="mt-2 text-muted mb-0">Ürünler yükleniyor...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Product Modal -->
    <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="productModalLabel">
                        <i class="fas fa-box me-2"></i> Yeni Ürün Ekle
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="productForm" onsubmit="saveProduct(event)">
                        <input type="hidden" id="productId">
                        
                        <div class="mb-3">
                            <label for="productName" class="form-label">Ürün Adı *</label>
                            <input type="text" class="form-control" id="productName" required>
                        </div>
                        
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="productSku" class="form-label">SKU *</label>
                                <input type="text" class="form-control" id="productSku" required>
                            </div>
                            
                            <div class="col-md-6">
                                <label for="productCategory" class="form-label">Kategori *</label>
                                <select class="form-select" id="productCategory" required>
                                    <option value="">Seçiniz</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="productDescription" class="form-label">Açıklama</label>
                            <textarea class="form-control" id="productDescription" rows="3"></textarea>
                        </div>
                        
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="productPrice" class="form-label">Fiyat (₺) *</label>
                                <input type="number" class="form-control" id="productPrice" step="0.01" required>
                            </div>
                            
                            <div class="col-md-6">
                                <label for="productSalePrice" class="form-label">İndirimli Fiyat (₺)</label>
                                <input type="number" class="form-control" id="productSalePrice" step="0.01">
                            </div>
                        </div>
                        
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="productStock" class="form-label">Stok Adedi *</label>
                                <input type="number" class="form-control" id="productStock" required>
                            </div>
                            
                            <div class="col-md-6">
                                <label for="productAgeGroup" class="form-label">Yaş Grubu</label>
                                <select class="form-select" id="productAgeGroup">
                                    <option value="">Seçiniz</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="productBrand" class="form-label">Marka</label>
                                <select class="form-select" id="productBrand">
                                    <option value="">Seçiniz</option>
                                </select>
                            </div>
                            
                            <div class="col-md-6">
                                <label for="productStatus" class="form-label">Durum</label>
                                <select class="form-select" id="productStatus">
                                    <option value="1">Aktif</option>
                                    <option value="0">Pasif</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="productImage" class="form-label">Ürün Görseli</label>
                            <input type="file" class="form-control" id="productImage" accept="image/*" onchange="previewImage(event)">
                            <div id="imagePreview" class="image-preview"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-2"></i> İptal
                    </button>
                    <button type="submit" form="productForm" class="btn btn-success">
                        <i class="fas fa-save me-2"></i> Kaydet
                    </button>
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
        let categories = [];
        let ageGroups = [];
        let brands = [];
        let productModal;
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            productModal = new bootstrap.Modal(document.getElementById('productModal'));
            
            loadCategories();
            loadAgeGroups();
            loadBrands();
            loadProducts();
            
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
                    loadProducts();
                }, 500);
            });
        });
        
        // Kategorileri yükle
        async function loadCategories() {
            try {
                const response = await fetch('../backend/api/categories.php');
                const data = await response.json();
                categories = data.data || [];
                
                const categoryFilter = document.getElementById('categoryFilter');
                const productCategory = document.getElementById('productCategory');
                
                categoryFilter.innerHTML = '<option value="">Tüm Kategoriler</option>';
                productCategory.innerHTML = '<option value="">Seçiniz</option>';
                
                categories.forEach(cat => {
                    categoryFilter.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
                    productCategory.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
                });
            } catch (error) {
                console.error('Kategoriler yüklenemedi:', error);
            }
        }
        
        // Yaş gruplarını yükle (Gerçek API)
        async function loadAgeGroups() {
            try {
                const response = await fetch('../backend/api/age_groups.php');
                const data = await response.json();
                ageGroups = data.data || [];
                
                const ageGroupSelect = document.getElementById('productAgeGroup');
                ageGroupSelect.innerHTML = '<option value="">Seçiniz</option>';
                ageGroups.forEach(ag => {
                    ageGroupSelect.innerHTML += `<option value="${ag.id}">${ag.name}</option>`;
                });
            } catch (error) {
                console.error('Yaş grupları yüklenemedi:', error);
                // Fallback: Mock data
                ageGroups = [
                    {id: 1, name: '0-3 yaş'},
                    {id: 2, name: '4-7 yaş'},
                    {id: 3, name: '8+ yaş'}
                ];
                const ageGroupSelect = document.getElementById('productAgeGroup');
                ageGroupSelect.innerHTML = '<option value="">Seçiniz</option>';
                ageGroups.forEach(ag => {
                    ageGroupSelect.innerHTML += `<option value="${ag.id}">${ag.name}</option>`;
                });
            }
        }
        
        // Markaları yükle (Gerçek API)
        async function loadBrands() {
            try {
                const response = await fetch('../backend/api/brands.php');
                const data = await response.json();
                brands = data.data || [];
                
                const brandSelect = document.getElementById('productBrand');
                brandSelect.innerHTML = '<option value="">Seçiniz</option>';
                brands.forEach(brand => {
                    brandSelect.innerHTML += `<option value="${brand.id}">${brand.name}</option>`;
                });
            } catch (error) {
                console.error('Markalar yüklenemedi:', error);
                // Fallback: Mock data
                brands = [
                    {id: 1, name: 'Gürbüz Oyuncak'},
                    {id: 2, name: 'Barbie'},
                    {id: 3, name: 'Hot Wheels'},
                    {id: 4, name: 'LEGO'},
                    {id: 5, name: 'Playmobil'}
                ];
                const brandSelect = document.getElementById('productBrand');
                brandSelect.innerHTML = '<option value="">Seçiniz</option>';
                brands.forEach(brand => {
                    brandSelect.innerHTML += `<option value="${brand.id}">${brand.name}</option>`;
                });
            }
        }
        
        // Ürünleri yükle
        async function loadProducts() {
            try {
                const search = document.getElementById('searchInput').value;
                const category = document.getElementById('categoryFilter').value;
                const status = document.getElementById('statusFilter').value;
                
                let url = '../backend/api/products.php?';
                if (search) url += `search=${encodeURIComponent(search)}&`;
                if (category) url += `category_id=${category}&`;
                if (status !== '') url += `is_active=${status}&`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                const products = data.data || [];
                const tbody = document.getElementById('productsTableBody');
                document.getElementById('productCount').textContent = `Toplam: ${products.length} ürün`;
                
                if (products.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p class="mb-0">Ürün bulunamadı</p>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                tbody.innerHTML = products.map(product => `
                    <tr>
                        <td>
                            <img src="${product.image_url || 'https://via.placeholder.com/50?text=Ürün'}" 
                                 alt="${product.name}" class="product-image">
                        </td>
                        <td><strong>${product.name}</strong></td>
                        <td class="hide-mobile text-muted">${product.sku}</td>
                        <td class="hide-mobile">${product.category_name || '-'}</td>
                        <td><strong>₺${parseFloat(product.price).toFixed(2)}</strong></td>
                        <td class="hide-mobile">${product.stock_quantity}</td>
                        <td>
                            <span class="badge-status ${product.is_active ? 'badge-active' : 'badge-inactive'}">
                                ${product.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group-action">
                                <button class="btn btn-warning btn-action btn-sm" onclick="editProduct(${product.id})">
                                    <i class="fas fa-edit me-1"></i> Düzenle
                                </button>
                                <button class="btn btn-danger btn-action btn-sm" onclick="deleteProduct(${product.id})">
                                    <i class="fas fa-trash me-1"></i> Sil
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Ürünler yüklenemedi:', error);
                showAlert('Ürünler yüklenirken hata oluştu', 'danger');
            }
        }
        
        // Modal aç (Add)
        function openAddModal() {
            document.getElementById('productModalLabel').innerHTML = '<i class="fas fa-box me-2"></i> Yeni Ürün Ekle';
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            document.getElementById('imagePreview').innerHTML = '';
        }
        
        // Ürün düzenle
        async function editProduct(id) {
            try {
                const response = await fetch(`../backend/api/products.php?id=${id}`);
                const data = await response.json();
                const product = data.data;
                
                document.getElementById('productModalLabel').innerHTML = '<i class="fas fa-edit me-2"></i> Ürün Düzenle';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productSku').value = product.sku;
                document.getElementById('productCategory').value = product.category_id;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productSalePrice').value = product.sale_price || '';
                document.getElementById('productStock').value = product.stock_quantity;
                document.getElementById('productAgeGroup').value = product.age_group_id || '';
                document.getElementById('productBrand').value = product.brand_id || '';
                document.getElementById('productStatus').value = product.is_active ? '1' : '0';
                
                if (product.image_url) {
                    document.getElementById('imagePreview').innerHTML = 
                        `<img src="${product.image_url}" alt="${product.name}">`;
                }
                
                productModal.show();
                
            } catch (error) {
                console.error('Ürün bilgileri yüklenemedi:', error);
                showAlert('Ürün bilgileri yüklenirken hata oluştu', 'danger');
            }
        }
        
        // Ürün kaydet
        async function saveProduct(event) {
            event.preventDefault();
            
            const id = document.getElementById('productId').value;
            const method = id ? 'PUT' : 'POST';
            
            const productData = {
                name: document.getElementById('productName').value,
                sku: document.getElementById('productSku').value,
                category_id: document.getElementById('productCategory').value,
                description: document.getElementById('productDescription').value,
                price: document.getElementById('productPrice').value,
                sale_price: document.getElementById('productSalePrice').value || null,
                stock_quantity: document.getElementById('productStock').value,
                age_group_id: document.getElementById('productAgeGroup').value || null,
                brand_id: document.getElementById('productBrand').value || null,
                is_active: document.getElementById('productStatus').value
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
                    productModal.hide();
                    loadProducts();
                } else {
                    showAlert(result.message || 'İşlem başarısız', 'danger');
                }
                
            } catch (error) {
                console.error('Ürün kaydedilirken hata:', error);
                showAlert('Ürün kaydedilirken hata oluştu', 'danger');
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
                    showAlert(result.message || 'Silme işlemi başarısız', 'danger');
                }
                
            } catch (error) {
                console.error('Ürün silinirken hata:', error);
                showAlert('Ürün silinirken hata oluştu', 'danger');
            }
        }
        
        // Görsel önizleme
        function previewImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('imagePreview').innerHTML = 
                        `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
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
