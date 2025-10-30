<?php
require_once '../components/ComponentLoader.php';
require_once 'includes/auth.php';

// Auth kontrolü
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
    <title>Ürün Yönetimi | Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Hammer.js for touch gestures -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>
    
    <!-- SortableJS for drag-drop -->
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    
    <style>
        .main-content {
            padding: 1.5rem;
            background: #f8f9fa;
            min-height: 100vh;
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
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid var(--bs-primary);
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--bs-primary);
            margin-bottom: 0.5rem;
        }
        
        .stat-card .label {
            color: #6c757d;
            font-size: 0.875rem;
        }
        
        .product-card {
            border: 1px solid #dee2e6;
            border-radius: 0.75rem;
            transition: all 0.3s ease;
            margin-bottom: 1rem;
        }
        
        .product-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .product-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 0.5rem;
        }
        
        .view-toggle {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .view-toggle .btn {
            padding: 0.5rem 1rem;
        }
        
        .product-grid .product-card {
            width: 100%;
            max-width: 300px;
        }
        
        .swipe-action {
            position: fixed;
            top: 0;
            right: -80px;
            width: 80px;
            height: 100%;
            background: #dc3545;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: right 0.3s ease;
            z-index: 1000;
        }
        
        .swipe-action.edit {
            background: #ffc107;
            right: auto;
            left: -80px;
        }
        
        .card-swiped .swipe-action {
            right: 0;
        }
        
        .card-swiped .swipe-action.edit {
            right: auto;
            left: 0;
        }
        
        .touch-actions {
            position: absolute;
            top: 50%;
            right: 1rem;
            transform: translateY(-50%);
            display: flex;
            gap: 0.5rem;
        }
        
        .badge {
            font-size: 0.75rem;
        }
        
        .stock-warning {
            color: #dc3545;
            font-weight: 600;
        }
        
        .stock-low {
            color: #ffc107;
            font-weight: 600;
        }
        
        .image-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .image-item {
            position: relative;
            border-radius: 0.5rem;
            overflow: hidden;
        }
        
        .image-item img {
            width: 100%;
            height: 80px;
            object-fit: cover;
        }
        
        .image-item .remove-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            cursor: pointer;
        }
        
        .price-display {
            font-weight: 600;
            color: var(--bs-success);
        }
        
        .old-price {
            text-decoration: line-through;
            color: #6c757d;
            font-size: 0.875rem;
        }
        
        .modal-xl {
            max-width: 90%;
        }
        
        @media (max-width: 768px) {
            .main-content {
                padding: 1rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .view-toggle {
                flex-wrap: wrap;
            }
            
            .touch-actions {
                position: static;
                transform: none;
                justify-content: center;
                margin-top: 1rem;
            }
        }
    </style>
</head>
<body>
    <?php ComponentLoader::load('navbar', ['variant' => 'admin']); ?>
    <?php ComponentLoader::load('sidebar', ['variant' => 'admin', 'active' => 'urunler']); ?>
    
    <div class="main-content">
        <!-- Stats Dashboard -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="value" id="total-products">-</div>
                <div class="label">Toplam Ürün</div>
            </div>
            <div class="stat-card">
                <div class="value" id="active-products">-</div>
                <div class="label">Aktif Ürün</div>
            </div>
            <div class="stat-card">
                <div class="value" id="low-stock">-</div>
                <div class="label">Düşük Stok</div>
            </div>
            <div class="stat-card">
                <div class="value" id="new-products">-</div>
                <div class="label">Yeni Ürünler</div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Ürün Yönetimi</h5>
                <div class="d-flex gap-2">
                    <div class="view-toggle">
                        <button class="btn btn-outline-secondary btn-sm" id="grid-view-btn">
                            <i data-lucide="grid"></i> Grid
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" id="list-view-btn">
                            <i data-lucide="list"></i> Liste
                        </button>
                    </div>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#product-modal">
                        <i data-lucide="plus"></i> Yeni Ürün
                    </button>
                </div>
            </div>
            
            <div class="card-body">
                <!-- Filter Bar -->
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
                        <input type="text" class="form-control" id="search-input" 
                               placeholder="Ürün adı, kodu, barkod...">
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="category-filter">
                            <option value="">Tüm Kategoriler</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="status-filter">
                            <option value="">Tüm Durumlar</option>
                            <option value="1">Aktif</option>
                            <option value="0">Pasif</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="stock-filter">
                            <option value="">Tüm Stok</option>
                            <option value="low">Düşük Stok</option>
                            <option value="out">Tükenmiş</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-primary w-100" onclick="loadProducts()">
                            <i data-lucide="refresh-cw"></i> Yenile
                        </button>
                    </div>
                    <div class="col-md-1">
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary dropdown-toggle" 
                                    data-bs-toggle="dropdown">
                                <i data-lucide="more-horizontal"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="exportProducts()">
                                    <i data-lucide="download"></i> Excel Export
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="bulkActions()">
                                    <i data-lucide="users"></i> Toplu İşlemler
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Products Display -->
                <div id="products-container">
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Yükleniyor...</span>
                        </div>
                        <div class="mt-2">Ürünler yükleniyor...</div>
                    </div>
                </div>
                
                <!-- Pagination -->
                <div id="pagination-container"></div>
            </div>
        </div>
    </div>
    
    <!-- Product Modal -->
    <div class="modal fade" id="product-modal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal-title">Yeni Ürün Ekle</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                
                <form id="product-form" onsubmit="saveProduct(event)">
                    <div class="modal-body">
                        <input type="hidden" id="product-id">
                        
                        <div class="row">
                            <div class="col-md-8">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Ürün Adı *</label>
                                        <input type="text" class="form-control" id="urun-adi" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Ürün Kodu (SKU) *</label>
                                        <input type="text" class="form-control" id="urun-kodu" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Barkod</label>
                                        <input type="text" class="form-control" id="barkod">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Kategori</label>
                                        <select class="form-select" id="kategori-id">
                                            <option value="">Kategori Seçiniz</option>
                                        </select>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Açıklama</label>
                                        <textarea class="form-control" id="aciklama" rows="3"></textarea>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Fiyat (₺) *</label>
                                        <input type="number" class="form-control" id="fiyat" 
                                               step="0.01" min="0" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Karşılaştırma Fiyatı (₺)</label>
                                        <input type="number" class="form-control" id="karsilastirma-fiyati" 
                                               step="0.01" min="0">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Maliyet (₺)</label>
                                        <input type="number" class="form-control" id="maliyet" 
                                               step="0.01" min="0">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Stok Miktarı *</label>
                                        <input type="number" class="form-control" id="stok-miktari" 
                                               min="0" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Minimum Stok Uyarısı</label>
                                        <input type="number" class="form-control" id="min-stok" min="0" value="5">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Durum</label>
                                        <select class="form-select" id="aktif">
                                            <option value="1">Aktif</option>
                                            <option value="0">Pasif</option>
                                        </select>
                                    </div>
                                    <div class="col-12">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" id="yeni-urun" value="1">
                                            <label class="form-check-label">Yeni Ürün</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" id="vitrin-urunu" value="1">
                                            <label class="form-check-label">Vitrin Ürünü</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" id="indirimli" value="1">
                                            <label class="form-check-label">İndirimli</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="mb-0">Ürün Görselleri</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label class="form-label">Ana Görsel</label>
                                            <input type="url" class="form-control mb-2" id="ana-gorsel" 
                                                   placeholder="https://...">
                                            <img id="ana-gorsel-preview" class="img-fluid rounded" 
                                                 style="display: none; max-height: 200px;">
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label class="form-label">Galeri Görselleri</label>
                                            <input type="file" class="form-control" id="galeri-gorseller" 
                                                   multiple accept="image/*">
                                            <div class="image-gallery" id="galeri-preview"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="card mt-3">
                                    <div class="card-header">
                                        <h6 class="mb-0">SEO Ayarları</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label class="form-label">SEO Başlık</label>
                                            <input type="text" class="form-control" id="meta-baslik">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">SEO Açıklama</label>
                                            <textarea class="form-control" id="meta-aciklama" rows="2"></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">URL Slug</label>
                                            <input type="text" class="form-control" id="url-slug">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                        <button type="submit" class="btn btn-primary">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Bulk Actions Modal -->
    <div class="modal fade" id="bulk-modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Toplu Ürün İşlemleri</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">İşlem Seçin</label>
                        <select class="form-select" id="bulk-action">
                            <option value="">İşlem Seçiniz</option>
                            <option value="activate">Aktif Yap</option>
                            <option value="deactivate">Pasif Yap</option>
                            <option value="delete">Sil</option>
                            <option value="export">Excel Export</option>
                        </select>
                    </div>
                    <div class="alert alert-info">
                        <i data-lucide="info"></i>
                        Toplu işlemler seçili ürünlere uygulanacaktır.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                    <button type="button" class="btn btn-primary" onclick="executeBulkAction()">
                        Uygula
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <?php ComponentLoader::load('footer'); ?>
    
    <script>
        class ProductManager {
            constructor() {
                this.currentPage = 1;
                this.totalPages = 1;
                this.products = [];
                this.categories = [];
                this.selectedProducts = [];
                this.viewMode = 'grid';
                this.init();
            }
            
            async init() {
                await this.loadProducts();
                await this.loadCategories();
                await this.loadStats();
                this.initializeTouchGestures();
                this.initializeEventListeners();
                this.updateViewMode('grid');
                lucide.createIcons();
            }
            
            async loadStats() {
                try {
                    const response = await fetch('../backend/api/urunler.php?stats=true');
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('total-products').textContent = data.stats.total || '0';
                        document.getElementById('active-products').textContent = data.stats.active || '0';
                        document.getElementById('low-stock').textContent = data.stats.lowStock || '0';
                        document.getElementById('new-products').textContent = data.stats.newProducts || '0';
                    }
                } catch (error) {
                    console.error('İstatistikler yüklenemedi:', error);
                }
            }
            
            async loadCategories() {
                try {
                    const response = await fetch('../backend/api/kategoriler.php');
                    const data = await response.json();
                    
                    if (data.success) {
                        this.categories = data.data;
                        
                        // Kategori dropdown'larını doldur
                        const categoryFilter = document.getElementById('category-filter');
                        const categorySelect = document.getElementById('kategori-id');
                        
                        categoryFilter.innerHTML = '<option value="">Tüm Kategoriler</option>';
                        categorySelect.innerHTML = '<option value="">Kategori Seçiniz</option>';
                        
                        this.categories.forEach(category => {
                            categoryFilter.innerHTML += `<option value="${category.id}">${category.kategori_adi}</option>`;
                            categorySelect.innerHTML += `<option value="${category.id}">${category.kategori_adi}</option>`;
                        });
                    }
                } catch (error) {
                    console.error('Kategoriler yüklenemedi:', error);
                }
            }
            
            async loadProducts(page = 1) {
                try {
                    this.currentPage = page;
                    const searchTerm = document.getElementById('search-input').value;
                    const categoryFilter = document.getElementById('category-filter').value;
                    const statusFilter = document.getElementById('status-filter').value;
                    const stockFilter = document.getElementById('stock-filter').value;
                    
                    let url = `../backend/api/urunler.php?limit=20&offset=${(page - 1) * 20}`;
                    
                    if (searchTerm) url += `&arama=${encodeURIComponent(searchTerm)}`;
                    if (categoryFilter) url += `&kategori_id=${categoryFilter}`;
                    if (statusFilter !== '') url += `&aktif=${statusFilter}`;
                    if (stockFilter) url += `&stok_filtre=${stockFilter}`;
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.success) {
                        this.products = data.data;
                        this.displayProducts();
                        
                        if (data.pagination) {
                            this.totalPages = data.pagination.total_pages;
                            this.updatePagination();
                        }
                        
                        await this.loadStats();
                    } else {
                        this.showAlert('Ürünler yüklenirken hata oluştu', 'error');
                    }
                } catch (error) {
                    console.error('Ürünler yüklenemedi:', error);
                    this.showAlert('Ürünler yüklenirken hata oluştu', 'error');
                }
            }
            
            displayProducts() {
                const container = document.getElementById('products-container');
                
                if (!this.products || this.products.length === 0) {
                    container.innerHTML = `
                        <div class="text-center py-5">
                            <i data-lucide="package" style="width: 64px; height: 64px; color: #dee2e6;"></i>
                            <div class="mt-3 text-muted">Ürün bulunamadı</div>
                        </div>
                    `;
                    lucide.createIcons();
                    return;
                }
                
                if (this.viewMode === 'grid') {
                    container.innerHTML = `
                        <div class="row product-grid">
                            ${this.products.map(product => this.createProductCard(product)).join('')}
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th width="60">
                                            <input type="checkbox" class="form-check-input" 
                                                   id="select-all" onchange="productManager.toggleSelectAll()">
                                        </th>
                                        <th>Görsel</th>
                                        <th>Ürün Adı</th>
                                        <th>SKU/Barkod</th>
                                        <th>Kategori</th>
                                        <th>Fiyat</th>
                                        <th>Stok</th>
                                        <th>Durum</th>
                                        <th width="120">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.products.map(product => this.createTableRow(product)).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }
                
                lucide.createIcons();
                this.initializeTouchGestures();
            }
            
            createProductCard(product) {
                const stockClass = product.stok_miktari <= 5 ? 'stock-warning' : 
                                   product.stok_miktari <= 10 ? 'stock-low' : '';
                const stockText = product.stok_miktari <= 0 ? 'Tükenmiş' : 
                                  product.stok_miktari <= 5 ? 'Düşük' : product.stok_miktari + ' adet';
                
                return `
                    <div class="col-md-4 col-lg-3" data-product-id="${product.id}">
                        <div class="card product-card h-100">
                            <div class="position-relative">
                                <img src="${product.ana_gorsel || '/images/no-image.jpg'}" 
                                     class="product-image" alt="${product.urun_adi}">
                                <div class="position-absolute top-0 end-0 p-2">
                                    ${product.yeni_urun ? '<span class="badge bg-primary">Yeni</span>' : ''}
                                    ${product.indirimli ? '<span class="badge bg-danger">İndirim</span>' : ''}
                                </div>
                                <input type="checkbox" class="form-check-input position-absolute top-0 start-0 m-2"
                                       id="select-${product.id}" onchange="productManager.toggleProduct(${product.id})">
                            </div>
                            <div class="card-body">
                                <h6 class="card-title">${product.urun_adi}</h6>
                                <p class="text-muted small mb-2">${product.urun_kodu}</p>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="price-display">₺${parseFloat(product.fiyat || 0).toFixed(2)}</span>
                                    ${product.karsilastirma_fiyati ? 
                                        `<small class="old-price">₺${parseFloat(product.karsilastirma_fiyati).toFixed(2)}</small>` : 
                                        ''}
                                </div>
                                <div class="mb-2">
                                    <small class="${stockClass}">${stockText}</small>
                                </div>
                                <div class="d-flex gap-1">
                                    <button class="btn btn-outline-primary btn-sm flex-fill" 
                                            onclick="productManager.editProduct(${product.id})">
                                        <i data-lucide="edit"></i> Düzenle
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" 
                                            onclick="productManager.deleteProduct(${product.id})">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            createTableRow(product) {
                const stockClass = product.stok_miktari <= 5 ? 'stock-warning' : 
                                   product.stok_miktari <= 10 ? 'stock-low' : '';
                const stockText = product.stok_miktari <= 0 ? 'Tükenmiş' : 
                                  product.stok_miktari <= 5 ? 'Düşük' : product.stok_miktari + ' adet';
                
                return `
                    <tr data-product-id="${product.id}">
                        <td>
                            <input type="checkbox" class="form-check-input" 
                                   id="select-${product.id}" onchange="productManager.toggleProduct(${product.id})">
                        </td>
                        <td>
                            <img src="${product.ana_gorsel || '/images/no-image.jpg'}" 
                                 class="rounded" style="width: 40px; height: 40px; object-fit: cover;">
                        </td>
                        <td>
                            <div>
                                <strong>${product.urun_adi}</strong><br>
                                <small class="text-muted">${product.kategori_adi || 'Kategori yok'}</small>
                            </div>
                        </td>
                        <td>
                            <div>
                                <small><strong>SKU:</strong> ${product.urun_kodu}</small><br>
                                <small><strong>Barkod:</strong> ${product.barkod || '-'}</small>
                            </div>
                        </td>
                        <td>${product.kategori_adi || '-'}</td>
                        <td>
                            <div>
                                <span class="price-display">₺${parseFloat(product.fiyat || 0).toFixed(2)}</span><br>
                                ${product.karsilastirma_fiyati ? 
                                    `<small class="old-price">₺${parseFloat(product.karsilastirma_fiyati).toFixed(2)}</small>` : 
                                    ''}
                            </div>
                        </td>
                        <td>
                            <span class="${stockClass}">${stockText}</span>
                        </td>
                        <td>
                            <span class="badge ${product.aktif == 1 ? 'bg-success' : 'bg-secondary'}">
                                ${product.aktif == 1 ? 'Aktif' : 'Pasif'}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" 
                                        onclick="productManager.editProduct(${product.id})">
                                    <i data-lucide="edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" 
                                        onclick="productManager.deleteProduct(${product.id})">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
            
            updatePagination() {
                const container = document.getElementById('pagination-container');
                
                if (this.totalPages <= 1) {
                    container.innerHTML = '';
                    return;
                }
                
                let html = '<nav><ul class="pagination justify-content-center">';
                
                // Önceki sayfa
                if (this.currentPage > 1) {
                    html += `<li class="page-item"><a class="page-link" href="#" onclick="productManager.loadProducts(${this.currentPage - 1})">«</a></li>`;
                }
                
                // Sayfa numaraları
                const startPage = Math.max(1, this.currentPage - 2);
                const endPage = Math.min(this.totalPages, this.currentPage + 2);
                
                for (let i = startPage; i <= endPage; i++) {
                    html += `<li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="productManager.loadProducts(${i})">${i}</a>
                    </li>`;
                }
                
                // Sonraki sayfa
                if (this.currentPage < this.totalPages) {
                    html += `<li class="page-item"><a class="page-link" href="#" onclick="productManager.loadProducts(${this.currentPage + 1})">»</a></li>`;
                }
                
                html += '</ul></nav>';
                container.innerHTML = html;
            }
            
            updateViewMode(mode) {
                this.viewMode = mode;
                document.getElementById('grid-view-btn').className = 
                    mode === 'grid' ? 'btn btn-primary btn-sm' : 'btn btn-outline-secondary btn-sm';
                document.getElementById('list-view-btn').className = 
                    mode === 'list' ? 'btn btn-primary btn-sm' : 'btn btn-outline-secondary btn-sm';
                this.displayProducts();
            }
            
            initializeEventListeners() {
                // Search input
                document.getElementById('search-input').addEventListener('input', 
                    debounce(() => this.loadProducts(1), 500));
                
                // Filter dropdowns
                document.getElementById('category-filter').addEventListener('change', 
                    () => this.loadProducts(1));
                document.getElementById('status-filter').addEventListener('change', 
                    () => this.loadProducts(1));
                document.getElementById('stock-filter').addEventListener('change', 
                    () => this.loadProducts(1));
                
                // View toggle
                document.getElementById('grid-view-btn').addEventListener('click', 
                    () => this.updateViewMode('grid'));
                document.getElementById('list-view-btn').addEventListener('click', 
                    () => this.updateViewMode('list'));
                
                // Image preview
                document.getElementById('ana-gorsel').addEventListener('input', 
                    (e) => this.previewImage(e.target.value, 'ana-gorsel-preview'));
                
                // Auto-generate URL slug
                document.getElementById('urun-adi').addEventListener('input', 
                    (e) => this.generateSlug(e.target.value));
            }
            
            previewImage(url, previewId) {
                const preview = document.getElementById(previewId);
                if (url) {
                    preview.src = url;
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
            }
            
            generateSlug(text) {
                if (!document.getElementById('url-slug').value) {
                    const slug = text.toLowerCase()
                        .replace(/ğ/g, 'g')
                        .replace(/ü/g, 'u')
                        .replace(/ş/g, 's')
                        .replace(/ı/g, 'i')
                        .replace(/ö/g, 'o')
                        .replace(/ç/g, 'c')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim('-');
                    document.getElementById('url-slug').value = slug;
                }
            }
            
            initializeTouchGestures() {
                if (window.innerWidth <= 768) {
                    const cards = document.querySelectorAll('.product-card');
                    cards.forEach(card => {
                        const hammer = new Hammer(card);
                        hammer.on('swipeleft', () => this.quickDelete(card));
                        hammer.on('swiperight', () => this.quickEdit(card));
                        hammer.on('doubletap', () => this.toggleSelect(card));
                    });
                }
            }
            
            quickDelete(card) {
                const productId = card.closest('[data-product-id]').dataset.productId;
                if (confirm('Bu ürünü hızlıca silmek istediğinizden emin misiniz?')) {
                    this.deleteProduct(productId);
                }
            }
            
            quickEdit(card) {
                const productId = card.closest('[data-product-id]').dataset.productId;
                this.editProduct(productId);
            }
            
            toggleSelect(card) {
                const productId = card.closest('[data-product-id]').dataset.productId;
                this.toggleProduct(productId);
            }
            
            toggleProduct(productId) {
                const index = this.selectedProducts.indexOf(productId);
                if (index > -1) {
                    this.selectedProducts.splice(index, 1);
                } else {
                    this.selectedProducts.push(productId);
                }
            }
            
            toggleSelectAll() {
                const selectAll = document.getElementById('select-all');
                const checkboxes = document.querySelectorAll('input[id^="select-"]');
                
                if (selectAll.checked) {
                    this.selectedProducts = this.products.map(p => p.id.toString());
                    checkboxes.forEach(cb => cb.checked = true);
                } else {
                    this.selectedProducts = [];
                    checkboxes.forEach(cb => cb.checked = false);
                }
            }
            
            async editProduct(id) {
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
                        document.getElementById('maliyet').value = product.maliyet || '';
                        document.getElementById('stok-miktari').value = product.stok_miktari || '';
                        document.getElementById('min-stok').value = product.min_stok || 5;
                        document.getElementById('aktif').value = product.aktif || '1';
                        document.getElementById('yeni-urun').checked = product.yeni_urun == 1;
                        document.getElementById('vitrin-urunu').checked = product.vitrin_urunu == 1;
                        document.getElementById('indirimli').checked = product.indirimli == 1;
                        document.getElementById('ana-gorsel').value = product.ana_gorsel || '';
                        document.getElementById('meta-baslik').value = product.meta_baslik || '';
                        document.getElementById('meta-aciklama').value = product.meta_aciklama || '';
                        document.getElementById('url-slug').value = product.url_slug || '';
                        
                        // Preview ana görsel
                        if (product.ana_gorsel) {
                            this.previewImage(product.ana_gorsel, 'ana-gorsel-preview');
                        }
                        
                        new bootstrap.Modal(document.getElementById('product-modal')).show();
                    } else {
                        this.showAlert('Ürün bilgileri yüklenemedi', 'error');
                    }
                } catch (error) {
                    console.error('Ürün bilgileri yüklenemedi:', error);
                    this.showAlert('Ürün bilgileri yüklenirken hata oluştu', 'error');
                }
            }
            
            async saveProduct(event) {
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
                    maliyet: parseFloat(document.getElementById('maliyet').value) || null,
                    stok_miktari: parseInt(document.getElementById('stok-miktari').value),
                    min_stok: parseInt(document.getElementById('min-stok').value) || 5,
                    yeni_urun: document.getElementById('yeni-urun').checked ? 1 : 0,
                    vitrin_urunu: document.getElementById('vitrin-urunu').checked ? 1 : 0,
                    indirimli: document.getElementById('indirimli').checked ? 1 : 0,
                    aktif: parseInt(document.getElementById('aktif').value),
                    ana_gorsel: document.getElementById('ana-gorsel').value,
                    meta_baslik: document.getElementById('meta-baslik').value,
                    meta_aciklama: document.getElementById('meta-aciklama').value,
                    url_slug: document.getElementById('url-slug').value
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
                        this.showAlert(isEdit ? 'Ürün başarıyla güncellendi' : 'Ürün başarıyla eklendi', 'success');
                        bootstrap.Modal.getInstance(document.getElementById('product-modal')).hide();
                        this.loadProducts(this.currentPage);
                    } else {
                        this.showAlert(data.message || 'İşlem başarısız', 'error');
                    }
                } catch (error) {
                    console.error('Ürün kaydedilemedi:', error);
                    this.showAlert('Ürün kaydedilirken hata oluştu', 'error');
                }
            }
            
            async deleteProduct(id) {
                if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
                    return;
                }
                
                try {
                    const response = await fetch(`../backend/api/urunler.php/${id}`, {
                        method: 'DELETE'
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.showAlert('Ürün başarıyla silindi', 'success');
                        this.loadProducts(this.currentPage);
                    } else {
                        this.showAlert(data.message || 'Ürün silinemedi', 'error');
                    }
                } catch (error) {
                    console.error('Ürün silinemedi:', error);
                    this.showAlert('Ürün silinirken hata oluştu', 'error');
                }
            }
            
            showAlert(message, type) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
                alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
                alertDiv.innerHTML = `
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                
                document.body.appendChild(alertDiv);
                
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 5000);
            }
        }
        
        // Helper functions
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
        
        function exportProducts() {
            // Excel export functionality
            const params = new URLSearchParams();
            const searchTerm = document.getElementById('search-input').value;
            const categoryFilter = document.getElementById('category-filter').value;
            const statusFilter = document.getElementById('status-filter').value;
            
            if (searchTerm) params.append('arama', searchTerm);
            if (categoryFilter) params.append('kategori_id', categoryFilter);
            if (statusFilter !== '') params.append('aktif', statusFilter);
            
            window.open(`../backend/api/urunler.php?export=excel&${params.toString()}`);
        }
        
        function bulkActions() {
            if (productManager.selectedProducts.length === 0) {
                productManager.showAlert('Lütfen en az bir ürün seçin', 'warning');
                return;
            }
            
            new bootstrap.Modal(document.getElementById('bulk-modal')).show();
        }
        
        function executeBulkAction() {
            const action = document.getElementById('bulk-action').value;
            if (!action) {
                productManager.showAlert('Lütfen bir işlem seçin', 'warning');
                return;
            }
            
            // Bulk action implementation
            productManager.showAlert('Toplu işlem başlatıldı', 'info');
            bootstrap.Modal.getInstance(document.getElementById('bulk-modal')).hide();
        }
        
        // Initialize Product Manager
        const productManager = new ProductManager();
    </script>
</body>
</html>
    
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