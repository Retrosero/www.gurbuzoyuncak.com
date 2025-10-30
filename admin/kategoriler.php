<?php
require_once '../components/ComponentLoader.php';

// Basit auth kontrolü (production'da session kullanılmalı)
// require_once 'includes/auth.php';
// checkAdminAuth();

$loader = new ComponentLoader();
$pageTitle = "Kategori Yönetimi | Gürbüz Oyuncak Admin";
$currentPage = 'kategoriler';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?></title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- SortableJS -->
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    
    <!-- Moment.js -->
    <script src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
    
    <!-- Component CSS -->
    <link href="../components/css/components.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <style>
        :root {
            --primary-color: #2563eb;
            --success-color: #16a34a;
            --warning-color: #d97706;
            --danger-color: #dc2626;
            --dark-color: #1f2937;
            --light-color: #f8fafc;
            --border-color: #e2e8f0;
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            --border-radius: 0.5rem;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--light-color);
            color: var(--dark-color);
        }

        .main-content {
            margin-left: 0;
            transition: margin-left 0.3s ease;
            min-height: 100vh;
            padding: 1rem;
        }

        @media (min-width: 768px) {
            .main-content {
                margin-left: 250px;
                padding: 2rem;
            }
        }

        .page-header {
            background: linear-gradient(135deg, var(--primary-color), #3b82f6);
            color: white;
            padding: 2rem;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
            box-shadow: var(--shadow);
        }

        .page-header h1 {
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
        }

        .page-header p {
            margin: 0.5rem 0 0;
            opacity: 0.9;
        }

        .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border-left: 4px solid var(--primary-color);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .stat-card .icon {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .stat-card .icon.primary { background: rgba(37, 99, 235, 0.1); color: var(--primary-color); }
        .stat-card .icon.success { background: rgba(22, 163, 74, 0.1); color: var(--success-color); }
        .stat-card .icon.warning { background: rgba(217, 119, 6, 0.1); color: var(--warning-color); }
        .stat-card .icon.danger { background: rgba(220, 38, 38, 0.1); color: var(--danger-color); }

        .stat-card h3 {
            font-size: 0.875rem;
            color: #64748b;
            margin: 0;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        .stat-card .value {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--dark-color);
            margin: 0.5rem 0;
        }

        .stat-card .change {
            font-size: 0.875rem;
            color: var(--success-color);
        }

        .main-card {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            overflow: hidden;
        }

        .main-card .card-header {
            background: #f8fafc;
            border-bottom: 1px solid var(--border-color);
            padding: 1.5rem;
            display: flex;
            justify-content: between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .main-card .card-header h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--dark-color);
        }

        .toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
            margin-bottom: 1rem;
        }

        .search-box {
            position: relative;
            flex: 1;
            min-width: 250px;
        }

        .search-box input {
            width: 100%;
            padding: 0.75rem 2.5rem 0.75rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            font-size: 0.875rem;
        }

        .search-box .search-icon {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
        }

        .btn-custom {
            padding: 0.75rem 1.5rem;
            border-radius: var(--border-radius);
            font-weight: 500;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }

        .btn-primary-custom {
            background: var(--primary-color);
            color: white;
        }

        .btn-primary-custom:hover {
            background: #1d4ed8;
            color: white;
        }

        .btn-success-custom {
            background: var(--success-color);
            color: white;
        }

        .btn-warning-custom {
            background: var(--warning-color);
            color: white;
        }

        .btn-danger-custom {
            background: var(--danger-color);
            color: white;
        }

        .btn-outline-custom {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--dark-color);
        }

        .btn-outline-custom:hover {
            background: #f1f5f9;
        }

        .bulk-actions {
            background: #f1f5f9;
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 1rem;
            display: none;
        }

        .bulk-actions.show {
            display: block;
        }

        .category-tree {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .category-tree ul {
            list-style: none;
            padding-left: 2rem;
            margin: 0.5rem 0;
        }

        .tree-item {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            margin-bottom: 0.5rem;
            transition: all 0.2s;
            position: relative;
        }

        .tree-item:hover {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tree-item.dragging {
            opacity: 0.5;
            transform: rotate(5deg);
        }

        .tree-item .item-content {
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
        }

        .tree-item .item-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
        }

        .tree-item .item-checkbox {
            margin-right: 0.5rem;
        }

        .tree-item .category-image {
            width: 48px;
            height: 48px;
            border-radius: var(--border-radius);
            object-fit: cover;
            border: 2px solid var(--border-color);
        }

        .tree-item .category-image.placeholder {
            background: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-size: 1.5rem;
        }

        .tree-item .category-details h4 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--dark-color);
        }

        .tree-item .category-details p {
            margin: 0.25rem 0 0;
            font-size: 0.875rem;
            color: #64748b;
        }

        .tree-item .category-meta {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .tree-item .badge-custom {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .tree-item .badge-success {
            background: rgba(22, 163, 74, 0.1);
            color: var(--success-color);
        }

        .tree-item .badge-danger {
            background: rgba(220, 38, 38, 0.1);
            color: var(--danger-color);
        }

        .tree-item .item-actions {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .tree-item .btn-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
            border-radius: 0.375rem;
        }

        .tree-toggle {
            background: none;
            border: none;
            color: var(--primary-color);
            cursor: pointer;
            padding: 0.25rem;
            margin-right: 0.5rem;
            border-radius: 0.25rem;
            transition: background 0.2s;
        }

        .tree-toggle:hover {
            background: rgba(37, 99, 235, 0.1);
        }

        .tree-toggle.collapsed .bi-chevron-down {
            transform: rotate(-90deg);
        }

        .tree-children {
            transition: all 0.3s ease;
            overflow: hidden;
        }

        .tree-children.collapsed {
            max-height: 0;
            opacity: 0;
        }

        .drop-zone {
            border: 2px dashed var(--border-color);
            border-radius: var(--border-radius);
            padding: 2rem;
            text-align: center;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
        }

        .drop-zone:hover,
        .drop-zone.drag-over {
            border-color: var(--primary-color);
            background: rgba(37, 99, 235, 0.05);
            color: var(--primary-color);
        }

        .modal-xl {
            max-width: 90%;
        }

        .form-floating label {
            color: #64748b;
        }

        .image-preview {
            max-width: 200px;
            max-height: 200px;
            border-radius: var(--border-radius);
            border: 2px solid var(--border-color);
        }

        .seo-section {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
        }

        .preview-url {
            background: #f1f5f9;
            padding: 0.75rem;
            border-radius: 0.375rem;
            border: 1px solid var(--border-color);
            font-family: monospace;
            font-size: 0.875rem;
            color: var(--primary-color);
        }

        @media (max-width: 768px) {
            .main-card .card-header {
                padding: 1rem;
            }

            .toolbar {
                flex-direction: column;
                align-items: stretch;
            }

            .search-box {
                min-width: 100%;
            }

            .tree-item .item-content {
                padding: 0.75rem;
                flex-direction: column;
                align-items: stretch;
                gap: 1rem;
            }

            .tree-item .item-info {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
            }

            .tree-item .item-actions {
                justify-content: flex-end;
            }

            .stats-cards {
                grid-template-columns: 1fr;
            }
        }

        /* Touch gestures */
        .tree-item {
            touch-action: manipulation;
        }

        /* Loading states */
        .loading {
            position: relative;
            opacity: 0.6;
            pointer-events: none;
        }

        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Toast notifications */
        .toast-container {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 1050;
        }

        .progress-bar-container {
            margin-top: 1rem;
            display: none;
        }

        .offline-indicator {
            position: fixed;
            bottom: 1rem;
            left: 1rem;
            background: var(--warning-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            display: none;
            z-index: 1040;
        }
    </style>
</head>
<body>
    <!-- Toast Container -->
    <div class="toast-container"></div>
    
    <!-- Offline Indicator -->
    <div class="offline-indicator">
        <i class="bi bi-wifi-off"></i> Bağlantı Kesildi
    </div>

    <!-- Navbar -->
    <?= $loader->loadComponent('navbar', ['currentPage' => $currentPage, 'type' => 'admin']) ?>

    <!-- Sidebar -->
    <?= $loader->loadComponent('sidebar', ['currentPage' => $currentPage, 'type' => 'admin']) ?>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Page Header -->
        <div class="page-header">
            <h1><i class="bi bi-diagram-3"></i> Kategori Yönetimi</h1>
            <p>Ürün kategorilerini organize edin, sıralayın ve yönetin</p>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-cards">
            <div class="stat-card">
                <div class="icon primary">
                    <i class="bi bi-collection"></i>
                </div>
                <h3>Toplam Kategori</h3>
                <div class="value" id="total-categories">-</div>
                <div class="change">+12% bu ay</div>
            </div>
            <div class="stat-card">
                <div class="icon success">
                    <i class="bi bi-folder"></i>
                </div>
                <h3>Ana Kategoriler</h3>
                <div class="value" id="parent-categories">-</div>
                <div class="change">Aktif kategoriler</div>
            </div>
            <div class="stat-card">
                <div class="icon warning">
                    <i class="bi bi-folder2-open"></i>
                </div>
                <h3>Alt Kategoriler</h3>
                <div class="value" id="sub-categories">-</div>
                <div class="change">Hiyerarşik yapı</div>
            </div>
            <div class="stat-card">
                <div class="icon danger">
                    <i class="bi bi-box-seam"></i>
                </div>
                <h3>Ürünlü Kategoriler</h3>
                <div class="value" id="categories-with-products">-</div>
                <div class="change">İçerik var</div>
            </div>
        </div>

        <!-- Main Card -->
        <div class="main-card">
            <div class="card-header">
                <h2><i class="bi bi-diagram-3-fill"></i> Kategori Hiyerarşisi</h2>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-primary-custom" onclick="categoryManager.openModal()">
                        <i class="bi bi-plus-lg"></i> Kategori Ekle
                    </button>
                    <button class="btn btn-outline-custom" onclick="categoryManager.expandAll()">
                        <i class="bi bi-arrows-expand"></i> Tümünü Genişlet
                    </button>
                    <button class="btn btn-outline-custom" onclick="categoryManager.collapseAll()">
                        <i class="bi bi-arrows-collapse"></i> Tümünü Daralt
                    </button>
                </div>
            </div>

            <div class="p-3">
                <!-- Toolbar -->
                <div class="toolbar">
                    <div class="search-box">
                        <input type="text" id="search-input" placeholder="Kategori ara..." autocomplete="off">
                        <i class="bi bi-search search-icon"></i>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <select id="status-filter" class="form-select" style="width: auto;">
                            <option value="">Tüm Durumlar</option>
                            <option value="1">Aktif</option>
                            <option value="0">Pasif</option>
                        </select>
                        <select id="sort-filter" class="form-select" style="width: auto;">
                            <option value="name">Ada Göre</option>
                            <option value="date">Tarihe Göre</option>
                            <option value="order">Sıraya Göre</option>
                            <option value="products">Ürün Sayısına Göre</option>
                        </select>
                        <button class="btn btn-outline-custom" onclick="categoryManager.refreshData()">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>

                <!-- Bulk Actions -->
                <div id="bulk-actions" class="bulk-actions">
                    <div class="d-flex justify-content-between align-items-center">
                        <span id="selected-count">0 kategori seçildi</span>
                        <div class="d-flex gap-2">
                            <button class="btn btn-success-custom btn-sm" onclick="categoryManager.bulkAction('activate')">
                                <i class="bi bi-check-circle"></i> Aktifleştir
                            </button>
                            <button class="btn btn-warning-custom btn-sm" onclick="categoryManager.bulkAction('deactivate')">
                                <i class="bi bi-x-circle"></i> Pasifleştir
                            </button>
                            <button class="btn btn-danger-custom btn-sm" onclick="categoryManager.bulkAction('delete')">
                                <i class="bi bi-trash"></i> Sil
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Category Tree -->
                <div id="category-tree-container">
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Yükleniyor...</span>
                        </div>
                        <p class="mt-2 text-muted">Kategoriler yükleniyor...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Category Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">
                        <i class="bi bi-folder-plus"></i> Yeni Kategori Ekle
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="categoryForm" novalidate>
                        <input type="hidden" id="categoryId">
                        
                        <div class="row">
                            <!-- Sol Kolon -->
                            <div class="col-md-6">
                                <h6 class="fw-bold mb-3"><i class="bi bi-info-circle"></i> Temel Bilgiler</h6>
                                
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="categoryName" placeholder="Kategori Adı" required>
                                    <label for="categoryName">Kategori Adı *</label>
                                    <div class="invalid-feedback">Kategori adı gereklidir.</div>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <select class="form-select" id="parentCategory">
                                        <option value="">Ana Kategori</option>
                                    </select>
                                    <label for="parentCategory">Üst Kategori</label>
                                </div>
                                
                                <div class="form-floating mb-3">
                                    <textarea class="form-control" id="categoryDescription" placeholder="Açıklama" style="height: 100px"></textarea>
                                    <label for="categoryDescription">Açıklama</label>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <input type="number" class="form-control" id="categoryOrder" placeholder="Sıra" min="0" value="0">
                                            <label for="categoryOrder">Sıra</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating mb-3">
                                            <select class="form-select" id="categoryStatus">
                                                <option value="1">Aktif</option>
                                                <option value="0">Pasif</option>
                                            </select>
                                            <label for="categoryStatus">Durum</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Sağ Kolon -->
                            <div class="col-md-6">
                                <h6 class="fw-bold mb-3"><i class="bi bi-image"></i> Görsel & SEO</h6>
                                
                                <!-- Image Upload -->
                                <div class="mb-3">
                                    <label class="form-label">Kategori Görseli</label>
                                    <div id="imageDropZone" class="drop-zone">
                                        <i class="bi bi-cloud-upload fs-1"></i>
                                        <p class="mb-2">Görsel dosyasını sürükleyin veya tıklayın</p>
                                        <small class="text-muted">PNG, JPG, JPEG (Max: 2MB)</small>
                                        <input type="file" id="imageInput" class="d-none" accept="image/*">
                                    </div>
                                    <div id="imagePreview" class="mt-2 d-none">
                                        <img id="previewImage" class="image-preview" alt="Önizleme">
                                        <button type="button" class="btn btn-danger btn-sm mt-2" onclick="categoryManager.removeImage()">
                                            <i class="bi bi-trash"></i> Görseli Kaldır
                                        </button>
                                    </div>
                                    <div id="uploadProgress" class="progress-bar-container">
                                        <div class="progress">
                                            <div class="progress-bar" style="width: 0%"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- SEO Section -->
                                <div class="seo-section">
                                    <h6 class="fw-bold mb-3"><i class="bi bi-search"></i> SEO Ayarları</h6>
                                    
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="seoTitle" placeholder="SEO Başlık">
                                        <label for="seoTitle">Meta Başlık</label>
                                        <small class="text-muted">Önerilen: 50-60 karakter</small>
                                    </div>
                                    
                                    <div class="form-floating mb-3">
                                        <textarea class="form-control" id="seoDescription" placeholder="SEO Açıklama" style="height: 80px"></textarea>
                                        <label for="seoDescription">Meta Açıklama</label>
                                        <small class="text-muted">Önerilen: 150-160 karakter</small>
                                    </div>
                                    
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="seoKeywords" placeholder="SEO Anahtar Kelimeler">
                                        <label for="seoKeywords">Anahtar Kelimeler</label>
                                        <small class="text-muted">Virgülle ayırın</small>
                                    </div>
                                    
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="urlSlug" placeholder="URL Slug">
                                        <label for="urlSlug">URL Slug</label>
                                        <small class="text-muted">Otomatik oluşturulur</small>
                                    </div>
                                    
                                    <div class="preview-url" id="urlPreview">
                                        https://gurbuzoyuncak.com/kategori/url-slug
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x"></i> İptal
                    </button>
                    <button type="button" class="btn btn-primary-custom" onclick="categoryManager.saveCategory()">
                        <i class="bi bi-check"></i> Kaydet
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component JS -->
    <script src="../components/js/component-loader.js"></script>
    
    <!-- Hammer.js for Touch Gestures -->
    <script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8"></script>

    <!-- Category Manager -->
    <script>
        class CategoryManager {
            constructor() {
                this.categories = [];
                this.filteredCategories = [];
                this.selectedItems = new Set();
                this.sortable = null;
                this.currentImageFile = null;
                this.isLoading = false;
                
                this.init();
            }
            
            init() {
                this.bindEvents();
                this.loadData();
                this.initializeDropZone();
                this.checkOnlineStatus();
            }
            
            bindEvents() {
                // Search
                document.getElementById('search-input').addEventListener('input', (e) => {
                    this.filterCategories();
                });
                
                // Filters
                document.getElementById('status-filter').addEventListener('change', () => {
                    this.filterCategories();
                });
                
                document.getElementById('sort-filter').addEventListener('change', () => {
                    this.sortCategories();
                });
                
                // Modal events
                document.getElementById('categoryName').addEventListener('input', () => {
                    this.generateSlug();
                });
                
                // Image input
                document.getElementById('imageInput').addEventListener('change', (e) => {
                    this.handleImageSelect(e.target.files[0]);
                });
                
                // Online/Offline detection
                window.addEventListener('online', () => this.updateOnlineStatus(true));
                window.addEventListener('offline', () => this.updateOnlineStatus(false));
                
                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.key === 's') {
                        e.preventDefault();
                        this.saveCategory();
                    }
                    if (e.key === 'Escape') {
                        this.closeModal();
                    }
                });
            }
            
            async loadData() {
                this.isLoading = true;
                this.showLoading();
                
                try {
                    await Promise.all([
                        this.loadCategories(),
                        this.loadStats(),
                        this.loadParentCategories()
                    ]);
                } catch (error) {
                    console.error('Veri yükleme hatası:', error);
                    this.showToast('Veriler yüklenirken hata oluştu', 'error');
                } finally {
                    this.isLoading = false;
                    this.hideLoading();
                }
            }
            
            async loadCategories() {
                try {
                    const response = await fetch('../backend/api/kategoriler.php/hiyerarşik');
                    const data = await response.json();
                    
                    if (data.success) {
                        this.categories = data.data || [];
                        this.filteredCategories = [...this.categories];
                        this.renderCategories();
                    } else {
                        throw new Error(data.message || 'Kategoriler yüklenemedi');
                    }
                } catch (error) {
                    console.error('Kategori yükleme hatası:', error);
                    // Fallback data
                    this.categories = this.getFallbackData();
                    this.filteredCategories = [...this.categories];
                    this.renderCategories();
                }
            }
            
            async loadStats() {
                try {
                    const response = await fetch('../backend/api/kategoriler.php/istatistikler');
                    const data = await response.json();
                    
                    if (data.success) {
                        this.updateStats(data.data);
                    }
                } catch (error) {
                    console.error('İstatistik yükleme hatası:', error);
                    // Fallback stats
                    this.updateStats({
                        toplam_kategori: this.categories.length,
                        ana_kategori_sayisi: this.categories.filter(c => !c.ust_kategori_id).length,
                        alt_kategori_sayisi: this.categories.filter(c => c.ust_kategori_id).length,
                        urunlu_kategori_sayisi: this.categories.filter(c => c.urun_sayisi > 0).length
                    });
                }
            }
            
            async loadParentCategories() {
                try {
                    const response = await fetch('../backend/api/kategoriler.php');
                    const data = await response.json();
                    
                    if (data.success) {
                        this.updateParentSelect(data.data);
                    }
                } catch (error) {
                    console.error('Üst kategori yükleme hatası:', error);
                }
            }
            
            updateStats(stats) {
                document.getElementById('total-categories').textContent = stats.toplam_kategori || '0';
                document.getElementById('parent-categories').textContent = stats.ana_kategori_sayisi || '0';
                document.getElementById('sub-categories').textContent = stats.alt_kategori_sayisi || '0';
                document.getElementById('categories-with-products').textContent = stats.urunlu_kategori_sayisi || '0';
            }
            
            updateParentSelect(categories) {
                const select = document.getElementById('parentCategory');
                select.innerHTML = '<option value="">Ana Kategori</option>';
                
                categories.forEach(category => {
                    select.innerHTML += `<option value="${category.id}">${category.kategori_adi}</option>`;
                });
            }
            
            renderCategories() {
                const container = document.getElementById('category-tree-container');
                
                if (!this.filteredCategories || this.filteredCategories.length === 0) {
                    container.innerHTML = `
                        <div class="text-center py-5">
                            <i class="bi bi-folder-x fs-1 text-muted"></i>
                            <p class="mt-2 text-muted">Kategori bulunamadı</p>
                            <button class="btn btn-primary-custom" onclick="categoryManager.openModal()">
                                <i class="bi bi-plus"></i> İlk Kategoriyi Ekle
                            </button>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = `<ul class="category-tree">${this.renderCategoryTree(this.filteredCategories)}</ul>`;
                this.initializeSortable();
                this.initializeTouchGestures();
            }
            
            renderCategoryTree(categories) {
                return categories.map(category => {
                    const hasChildren = category.alt_kategoriler && category.alt_kategoriler.length > 0;
                    const imageUrl = category.gorsel_url || '';
                    
                    let html = `
                        <li class="tree-item" data-id="${category.id}">
                            <div class="item-content">
                                <div class="item-info">
                                    <input type="checkbox" class="item-checkbox form-check-input" 
                                           onchange="categoryManager.toggleSelection(${category.id}, this.checked)">
                                    
                                    ${hasChildren ? `
                                        <button class="tree-toggle" onclick="categoryManager.toggleChildren(${category.id})">
                                            <i class="bi bi-chevron-down"></i>
                                        </button>
                                    ` : '<span style="width: 24px; display: inline-block;"></span>'}
                                    
                                    <div class="category-image ${!imageUrl ? 'placeholder' : ''}">
                                        ${imageUrl ? 
                                            `<img src="${imageUrl}" alt="${category.kategori_adi}" class="category-image">` :
                                            '<i class="bi bi-folder"></i>'
                                        }
                                    </div>
                                    
                                    <div class="category-details">
                                        <h4>${category.kategori_adi}</h4>
                                        <p>${category.aciklama || 'Açıklama yok'}</p>
                                    </div>
                                </div>
                                
                                <div class="category-meta">
                                    <span class="badge-custom badge-${category.aktif == 1 ? 'success' : 'danger'}">
                                        ${category.aktif == 1 ? 'Aktif' : 'Pasif'}
                                    </span>
                                    <span class="badge-custom" style="background: #f1f5f9; color: #64748b;">
                                        ${category.urun_sayisi || 0} ürün
                                    </span>
                                    <span class="badge-custom" style="background: #f1f5f9; color: #64748b;">
                                        Sıra: ${category.sira || 0}
                                    </span>
                                </div>
                                
                                <div class="item-actions">
                                    <button class="btn btn-outline-primary btn-sm" onclick="categoryManager.editCategory(${category.id})" title="Düzenle">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="categoryManager.addSubCategory(${category.id})" title="Alt Kategori Ekle">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="categoryManager.deleteCategory(${category.id})" title="Sil">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </li>
                    `;
                    
                    if (hasChildren) {
                        html += `
                            <ul class="tree-children" id="children-${category.id}">
                                ${this.renderCategoryTree(category.alt_kategoriler)}
                            </ul>
                        `;
                    }
                    
                    return html;
                }).join('');
            }
            
            initializeSortable() {
                const treeContainer = document.querySelector('.category-tree');
                if (!treeContainer) return;
                
                if (this.sortable) {
                    this.sortable.destroy();
                }
                
                this.sortable = Sortable.create(treeContainer, {
                    group: 'categories',
                    animation: 150,
                    fallbackOnBody: true,
                    swapThreshold: 0.65,
                    onStart: (evt) => {
                        evt.item.classList.add('dragging');
                    },
                    onEnd: (evt) => {
                        evt.item.classList.remove('dragging');
                        this.updateCategoryOrder();
                    }
                });
            }
            
            initializeTouchGestures() {
                const treeItems = document.querySelectorAll('.tree-item');
                
                treeItems.forEach(item => {
                    const hammer = new Hammer(item);
                    
                    // Swipe to delete
                    hammer.on('swipeleft', () => {
                        const id = item.dataset.id;
                        this.deleteCategory(id);
                    });
                    
                    // Double tap to edit
                    hammer.on('doubletap', () => {
                        const id = item.dataset.id;
                        this.editCategory(id);
                    });
                    
                    // Long press for context menu
                    hammer.on('press', () => {
                        const id = item.dataset.id;
                        this.showContextMenu(id, event);
                    });
                });
            }
            
            filterCategories() {
                const searchTerm = document.getElementById('search-input').value.toLowerCase();
                const statusFilter = document.getElementById('status-filter').value;
                
                this.filteredCategories = this.categories.filter(category => {
                    const matchesSearch = !searchTerm || 
                        category.kategori_adi.toLowerCase().includes(searchTerm) ||
                        (category.aciklama && category.aciklama.toLowerCase().includes(searchTerm));
                    
                    const matchesStatus = !statusFilter || category.aktif == statusFilter;
                    
                    return matchesSearch && matchesStatus;
                });
                
                this.sortCategories();
            }
            
            sortCategories() {
                const sortBy = document.getElementById('sort-filter').value;
                
                this.filteredCategories.sort((a, b) => {
                    switch (sortBy) {
                        case 'name':
                            return a.kategori_adi.localeCompare(b.kategori_adi, 'tr');
                        case 'date':
                            return new Date(b.olusturma_tarihi) - new Date(a.olusturma_tarihi);
                        case 'order':
                            return (a.sira || 0) - (b.sira || 0);
                        case 'products':
                            return (b.urun_sayisi || 0) - (a.urun_sayisi || 0);
                        default:
                            return 0;
                    }
                });
                
                this.renderCategories();
            }
            
            toggleSelection(id, checked) {
                if (checked) {
                    this.selectedItems.add(id);
                } else {
                    this.selectedItems.delete(id);
                }
                
                this.updateBulkActions();
            }
            
            updateBulkActions() {
                const bulkActions = document.getElementById('bulk-actions');
                const selectedCount = document.getElementById('selected-count');
                
                if (this.selectedItems.size > 0) {
                    bulkActions.classList.add('show');
                    selectedCount.textContent = `${this.selectedItems.size} kategori seçildi`;
                } else {
                    bulkActions.classList.remove('show');
                }
            }
            
            async bulkAction(action) {
                if (this.selectedItems.size === 0) return;
                
                const selectedIds = Array.from(this.selectedItems);
                let confirmMessage = '';
                
                switch (action) {
                    case 'activate':
                        confirmMessage = `${selectedIds.length} kategoriyi aktifleştirmek istediğinizden emin misiniz?`;
                        break;
                    case 'deactivate':
                        confirmMessage = `${selectedIds.length} kategoriyi pasifleştirmek istediğinizden emin misiniz?`;
                        break;
                    case 'delete':
                        confirmMessage = `${selectedIds.length} kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`;
                        break;
                }
                
                if (!confirm(confirmMessage)) return;
                
                try {
                    for (const id of selectedIds) {
                        if (action === 'delete') {
                            await this.deleteCategory(id, false);
                        } else {
                            await this.updateCategoryStatus(id, action === 'activate' ? 1 : 0);
                        }
                    }
                    
                    this.selectedItems.clear();
                    this.updateBulkActions();
                    this.showToast(`Seçilen kategoriler başarıyla ${action === 'delete' ? 'silindi' : (action === 'activate' ? 'aktifleştirildi' : 'pasifleştirildi')}`, 'success');
                    this.loadData();
                } catch (error) {
                    console.error('Toplu işlem hatası:', error);
                    this.showToast('Toplu işlem sırasında hata oluştu', 'error');
                }
            }
            
            toggleChildren(categoryId) {
                const childrenContainer = document.getElementById(`children-${categoryId}`);
                const toggleButton = childrenContainer.previousElementSibling.querySelector('.tree-toggle');
                
                if (childrenContainer.classList.contains('collapsed')) {
                    childrenContainer.classList.remove('collapsed');
                    toggleButton.classList.remove('collapsed');
                } else {
                    childrenContainer.classList.add('collapsed');
                    toggleButton.classList.add('collapsed');
                }
            }
            
            expandAll() {
                const childrenContainers = document.querySelectorAll('.tree-children');
                const toggleButtons = document.querySelectorAll('.tree-toggle');
                
                childrenContainers.forEach(container => {
                    container.classList.remove('collapsed');
                });
                
                toggleButtons.forEach(button => {
                    button.classList.remove('collapsed');
                });
            }
            
            collapseAll() {
                const childrenContainers = document.querySelectorAll('.tree-children');
                const toggleButtons = document.querySelectorAll('.tree-toggle');
                
                childrenContainers.forEach(container => {
                    container.classList.add('collapsed');
                });
                
                toggleButtons.forEach(button => {
                    button.classList.add('collapsed');
                });
            }
            
            openModal(parentId = null) {
                const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
                const modalTitle = document.getElementById('modalTitle');
                
                // Reset form
                document.getElementById('categoryForm').reset();
                document.getElementById('categoryId').value = '';
                this.currentImageFile = null;
                document.getElementById('imagePreview').classList.add('d-none');
                
                if (parentId) {
                    modalTitle.innerHTML = '<i class="bi bi-folder-plus"></i> Alt Kategori Ekle';
                    document.getElementById('parentCategory').value = parentId;
                } else {
                    modalTitle.innerHTML = '<i class="bi bi-folder-plus"></i> Yeni Kategori Ekle';
                }
                
                this.generateSlug();
                modal.show();
            }
            
            closeModal() {
                const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
                if (modal) modal.hide();
            }
            
            addSubCategory(parentId) {
                this.openModal(parentId);
            }
            
            async editCategory(id) {
                try {
                    const response = await fetch(`../backend/api/kategoriler.php/${id}`);
                    const data = await response.json();
                    
                    if (data.success) {
                        const category = data.data;
                        
                        document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil"></i> Kategori Düzenle';
                        document.getElementById('categoryId').value = category.id;
                        document.getElementById('categoryName').value = category.kategori_adi || '';
                        document.getElementById('parentCategory').value = category.ust_kategori_id || '';
                        document.getElementById('categoryDescription').value = category.aciklama || '';
                        document.getElementById('categoryOrder').value = category.sira || '0';
                        document.getElementById('categoryStatus').value = category.aktif || '1';
                        
                        // SEO fields
                        document.getElementById('seoTitle').value = category.seo_title || '';
                        document.getElementById('seoDescription').value = category.seo_description || '';
                        document.getElementById('seoKeywords').value = category.seo_keywords || '';
                        document.getElementById('urlSlug').value = category.url_slug || '';
                        
                        // Image
                        if (category.gorsel_url) {
                            document.getElementById('previewImage').src = category.gorsel_url;
                            document.getElementById('imagePreview').classList.remove('d-none');
                        }
                        
                        this.updateUrlPreview();
                        
                        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
                        modal.show();
                    } else {
                        this.showToast('Kategori bilgileri yüklenemedi', 'error');
                    }
                } catch (error) {
                    console.error('Kategori düzenleme hatası:', error);
                    this.showToast('Kategori bilgileri yüklenirken hata oluştu', 'error');
                }
            }
            
            async deleteCategory(id, showConfirm = true) {
                if (showConfirm && !confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
                    return;
                }
                
                try {
                    const response = await fetch(`../backend/api/kategoriler.php/${id}`, {
                        method: 'DELETE'
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.showToast('Kategori başarıyla silindi', 'success');
                        this.loadData();
                    } else {
                        this.showToast(data.message || 'Kategori silinemedi', 'error');
                    }
                } catch (error) {
                    console.error('Kategori silme hatası:', error);
                    this.showToast('Kategori silinirken hata oluştu', 'error');
                }
            }
            
            async saveCategory() {
                const form = document.getElementById('categoryForm');
                
                if (!form.checkValidity()) {
                    form.classList.add('was-validated');
                    return;
                }
                
                const id = document.getElementById('categoryId').value;
                const isEdit = id !== '';
                
                const formData = new FormData();
                
                // Basic data
                formData.append('kategori_adi', document.getElementById('categoryName').value);
                formData.append('ust_kategori_id', document.getElementById('parentCategory').value || null);
                formData.append('aciklama', document.getElementById('categoryDescription').value);
                formData.append('sira', parseInt(document.getElementById('categoryOrder').value) || 0);
                formData.append('aktif', parseInt(document.getElementById('categoryStatus').value));
                
                // SEO data
                formData.append('seo_title', document.getElementById('seoTitle').value);
                formData.append('seo_description', document.getElementById('seoDescription').value);
                formData.append('seo_keywords', document.getElementById('seoKeywords').value);
                formData.append('url_slug', document.getElementById('urlSlug').value);
                
                // Image file
                if (this.currentImageFile) {
                    formData.append('image', this.currentImageFile);
                }
                
                try {
                    const url = isEdit ? `../backend/api/kategoriler.php/${id}` : '../backend/api/kategoriler.php';
                    const method = isEdit ? 'PUT' : 'POST';
                    
                    const response = await fetch(url, {
                        method: method,
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.showToast(isEdit ? 'Kategori başarıyla güncellendi' : 'Kategori başarıyla eklendi', 'success');
                        this.closeModal();
                        this.loadData();
                    } else {
                        this.showToast(data.message || 'İşlem başarısız', 'error');
                    }
                } catch (error) {
                    console.error('Kategori kaydetme hatası:', error);
                    this.showToast('Kategori kaydedilirken hata oluştu', 'error');
                }
            }
            
            generateSlug() {
                const name = document.getElementById('categoryName').value;
                const slug = name
                    .toLowerCase()
                    .replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u')
                    .replace(/ş/g, 's')
                    .replace(/ı/g, 'i')
                    .replace(/ö/g, 'o')
                    .replace(/ç/g, 'c')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
                
                document.getElementById('urlSlug').value = slug;
                this.updateUrlPreview();
            }
            
            updateUrlPreview() {
                const slug = document.getElementById('urlSlug').value || 'url-slug';
                document.getElementById('urlPreview').textContent = `https://gurbuzoyuncak.com/kategori/${slug}`;
            }
            
            initializeDropZone() {
                const dropZone = document.getElementById('imageDropZone');
                const fileInput = document.getElementById('imageInput');
                
                dropZone.addEventListener('click', () => fileInput.click());
                
                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropZone.classList.add('drag-over');
                });
                
                dropZone.addEventListener('dragleave', () => {
                    dropZone.classList.remove('drag-over');
                });
                
                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('drag-over');
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        this.handleImageSelect(files[0]);
                    }
                });
            }
            
            handleImageSelect(file) {
                if (!file || !file.type.startsWith('image/')) {
                    this.showToast('Geçerli bir görsel dosyası seçin', 'error');
                    return;
                }
                
                if (file.size > 2 * 1024 * 1024) { // 2MB
                    this.showToast('Dosya boyutu 2MB\'dan küçük olmalıdır', 'error');
                    return;
                }
                
                this.currentImageFile = file;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('previewImage').src = e.target.result;
                    document.getElementById('imagePreview').classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
            
            removeImage() {
                this.currentImageFile = null;
                document.getElementById('imagePreview').classList.add('d-none');
                document.getElementById('imageInput').value = '';
            }
            
            async updateCategoryOrder() {
                const treeItems = document.querySelectorAll('.tree-item');
                const orderData = [];
                
                treeItems.forEach((item, index) => {
                    orderData.push({
                        id: item.dataset.id,
                        sira: index + 1
                    });
                });
                
                try {
                    const response = await fetch('../backend/api/kategoriler.php/bulk-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orderData)
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.showToast('Kategori sıralaması güncellendi', 'success');
                    }
                } catch (error) {
                    console.error('Sıralama güncelleme hatası:', error);
                }
            }
            
            async updateCategoryStatus(id, status) {
                try {
                    const response = await fetch(`../backend/api/kategoriler.php/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ aktif: status })
                    });
                    
                    const data = await response.json();
                    
                    if (!data.success) {
                        throw new Error(data.message || 'Durum güncellenemedi');
                    }
                } catch (error) {
                    console.error('Durum güncelleme hatası:', error);
                    throw error;
                }
            }
            
            refreshData() {
                this.loadData();
                this.showToast('Veriler yenilendi', 'info');
            }
            
            showLoading() {
                document.getElementById('category-tree-container').innerHTML = `
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Yükleniyor...</span>
                        </div>
                        <p class="mt-2 text-muted">Kategoriler yükleniyor...</p>
                    </div>
                `;
            }
            
            hideLoading() {
                // Loading will be replaced by renderCategories()
            }
            
            checkOnlineStatus() {
                this.updateOnlineStatus(navigator.onLine);
            }
            
            updateOnlineStatus(isOnline) {
                const indicator = document.querySelector('.offline-indicator');
                if (isOnline) {
                    indicator.style.display = 'none';
                } else {
                    indicator.style.display = 'block';
                }
            }
            
            showToast(message, type = 'info') {
                const toastContainer = document.querySelector('.toast-container');
                const toastId = 'toast-' + Date.now();
                
                const bgClass = {
                    'success': 'bg-success',
                    'error': 'bg-danger',
                    'warning': 'bg-warning',
                    'info': 'bg-info'
                }[type] || 'bg-info';
                
                const iconClass = {
                    'success': 'bi-check-circle',
                    'error': 'bi-exclamation-triangle',
                    'warning': 'bi-exclamation-triangle',
                    'info': 'bi-info-circle'
                }[type] || 'bi-info-circle';
                
                const toastHTML = `
                    <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
                        <div class="toast-body d-flex align-items-center">
                            <i class="bi ${iconClass} me-2"></i>
                            ${message}
                            <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast"></button>
                        </div>
                    </div>
                `;
                
                toastContainer.insertAdjacentHTML('beforeend', toastHTML);
                
                const toastEl = document.getElementById(toastId);
                const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
                toast.show();
                
                toastEl.addEventListener('hidden.bs.toast', () => {
                    toastEl.remove();
                });
            }
            
            getFallbackData() {
                return [
                    {
                        id: 1,
                        kategori_adi: 'Eğitici Oyuncaklar',
                        aciklama: 'Çocukların eğlenerek öğrenmesini sağlayan oyuncaklar',
                        gorsel_url: '',
                        aktif: 1,
                        sira: 1,
                        urun_sayisi: 25,
                        ust_kategori_id: null,
                        alt_kategoriler: [
                            {
                                id: 2,
                                kategori_adi: 'Puzzle',
                                aciklama: 'Çeşitli yaş grupları için puzzle oyuncakları',
                                gorsel_url: '',
                                aktif: 1,
                                sira: 1,
                                urun_sayisi: 12,
                                ust_kategori_id: 1,
                                alt_kategoriler: []
                            }
                        ]
                    },
                    {
                        id: 3,
                        kategori_adi: 'Açık Hava Oyuncakları',
                        aciklama: 'Bahçe ve park için ideal oyuncaklar',
                        gorsel_url: '',
                        aktif: 1,
                        sira: 2,
                        urun_sayisi: 18,
                        ust_kategori_id: null,
                        alt_kategoriler: []
                    }
                ];
            }
        }
        
        // Initialize Category Manager
        let categoryManager;
        
        document.addEventListener('DOMContentLoaded', function() {
            categoryManager = new CategoryManager();
        });
    </script>
</body>
</html>