<?php
require_once '../components/ComponentLoader.php';
$loader = new ComponentLoader();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Gürbüz Oyuncak ürünleri - Kaliteli ve güvenilir oyuncaklar">
    <title>Ürünler | Gürbüz Oyuncak</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../components/css/components.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Mobile-first Responsive Design */
        .products-main {
            min-height: 80vh;
            padding: 1rem 0;
        }
        
        .products-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 1.5rem;
        }
        
        /* Filter Button for Mobile */
        .filter-toggle {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            min-height: 48px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
        }
        
        .filter-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
        
        /* Filters Container */
        .filters-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid #e2e8f0;
        }
        
        .filter-group {
            margin-bottom: 1.5rem;
        }
        
        .filter-group:last-child {
            margin-bottom: 0;
        }
        
        .filter-title {
            font-size: 1rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .filter-option {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .filter-option:hover {
            color: #667eea;
        }
        
        .filter-option input[type="checkbox"] {
            width: 20px;
            height: 20px;
            accent-color: #667eea;
            cursor: pointer;
        }
        
        .filter-option label {
            cursor: pointer;
            user-select: none;
            font-size: 0.9rem;
            color: #4a5568;
        }
        
        /* Filter Actions */
        .filter-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .filter-btn {
            min-height: 44px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        /* Sort Bar */
        .sort-bar {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border: 1px solid #e2e8f0;
        }
        
        .sort-select {
            min-height: 44px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            background: white;
            font-size: 0.9rem;
        }
        
        .sort-select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        /* Product Grid Responsive */
        .product-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: 1fr;
        }
        
        /* Responsive Breakpoints - Mobile First */
        @media (min-width: 576px) {
            .product-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.25rem;
            }
            
            .products-title {
                font-size: 1.75rem;
            }
        }
        
        @media (min-width: 768px) {
            .products-main {
                padding: 2rem 0;
            }
            
            .products-title {
                font-size: 2rem;
                margin-bottom: 2rem;
            }
            
            .product-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 1.5rem;
            }
            
            .filter-toggle {
                display: none !important;
            }
            
            .filters-container {
                display: block !important;
            }
            
            .filter-actions {
                flex-direction: row;
            }
        }
        
        @media (min-width: 992px) {
            .product-grid {
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
            }
        }
        
        @media (min-width: 1200px) {
            .product-grid {
                grid-template-columns: repeat(5, 1fr);
                gap: 1.5rem;
            }
        }
        
        /* Mobile Filter Overlay */
        .mobile-filter-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1040;
            display: none;
        }
        
        .mobile-filter-sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 85%;
            max-width: 320px;
            height: 100%;
            background: white;
            z-index: 1050;
            transition: left 0.3s ease;
            overflow-y: auto;
            padding: 1rem;
        }
        
        .mobile-filter-sidebar.active {
            left: 0;
        }
        
        .mobile-filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 1rem;
        }
        
        .close-filter {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #6b7280;
            cursor: pointer;
            min-height: 48px;
            min-width: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Loading and Empty States */
        .loading-state, .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem 1rem;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <?php echo $loader->loadComponent('navbar', 'Public'); ?>
    
    <!-- Mobile Filter Overlay -->
    <div class="mobile-filter-overlay" id="mobileFilterOverlay"></div>
    
    <!-- Mobile Filter Sidebar -->
    <div class="mobile-filter-sidebar" id="mobileFilterSidebar">
        <div class="mobile-filter-header">
            <h5 class="mb-0 fw-bold">Filtreler</h5>
            <button class="close-filter" onclick="closeMobileFilters()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        
        <!-- Mobile Filter Content (same as desktop) -->
        <div class="filter-group">
            <h6 class="filter-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path>
                    <path d="M2 7h20l-2 5H4l-2-5Z"></path>
                    <path d="M7 11V5a3 3 0 0 1 6 0v6"></path>
                </svg>
                Yaş Grubu
            </h6>
            <div class="filter-options" id="mobile-age-filters">
                <label class="filter-option">
                    <input type="checkbox" name="age_group" value="1">
                    <span>0-3 Yaş</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" name="age_group" value="2">
                    <span>4-7 Yaş</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" name="age_group" value="3">
                    <span>8+ Yaş</span>
                </label>
            </div>
        </div>
        
        <div class="filter-group">
            <h6 class="filter-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"></polygon>
                </svg>
                Özellikler
            </h6>
            <div class="filter-options">
                <label class="filter-option">
                    <input type="checkbox" name="is_featured" value="1">
                    <span>Öne Çıkanlar</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" name="is_new" value="1">
                    <span>Yeni Ürünler</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" name="is_sale" value="1">
                    <span>Kampanyada</span>
                </label>
            </div>
        </div>
        
        <div class="filter-actions">
            <button class="btn btn-primary filter-btn" onclick="applyFilters(); closeMobileFilters();">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filtreleri Uygula
            </button>
            <button class="btn btn-outline-secondary filter-btn" onclick="clearFilters(); closeMobileFilters();">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Temizle
            </button>
        </div>
    </div>
    
    <!-- Products Section -->
    <main class="products-main">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <h1 class="products-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.42 7H6"></path>
                        </svg>
                        Ürünler
                    </h1>
                </div>
            </div>
            
            <div class="row">
                <!-- Desktop Filter Sidebar -->
                <div class="col-lg-3 d-none d-md-block">
                    <div class="filters-container">
                        <div class="filter-group">
                            <h6 class="filter-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path>
                                    <path d="M2 7h20l-2 5H4l-2-5Z"></path>
                                    <path d="M7 11V5a3 3 0 0 1 6 0v6"></path>
                                </svg>
                                Yaş Grubu
                            </h6>
                            <div class="filter-options" id="age-filters">
                                <label class="filter-option">
                                    <input type="checkbox" name="age_group" value="1">
                                    <span>0-3 Yaş</span>
                                </label>
                                <label class="filter-option">
                                    <input type="checkbox" name="age_group" value="2">
                                    <span>4-7 Yaş</span>
                                </label>
                                <label class="filter-option">
                                    <input type="checkbox" name="age_group" value="3">
                                    <span>8+ Yaş</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <h6 class="filter-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"></polygon>
                                </svg>
                                Özellikler
                            </h6>
                            <div class="filter-options">
                                <label class="filter-option">
                                    <input type="checkbox" name="is_featured" value="1">
                                    <span>Öne Çıkanlar</span>
                                </label>
                                <label class="filter-option">
                                    <input type="checkbox" name="is_new" value="1">
                                    <span>Yeni Ürünler</span>
                                </label>
                                <label class="filter-option">
                                    <input type="checkbox" name="is_sale" value="1">
                                    <span>Kampanyada</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button class="btn btn-primary filter-btn w-100" onclick="applyFilters()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                </svg>
                                Filtreleri Uygula
                            </button>
                            <button class="btn btn-outline-secondary filter-btn w-100 mt-2" onclick="clearFilters()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                Temizle
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Products Content -->
                <div class="col-lg-9 col-12">
                    <!-- Mobile Filter Toggle -->
                    <div class="d-md-none mb-3">
                        <button class="btn filter-toggle w-100" onclick="openMobileFilters()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            Filtreler
                        </button>
                    </div>
                    
                    <!-- Sort Bar -->
                    <div class="sort-bar">
                        <div class="row align-items-center">
                            <div class="col-12 col-md-6 mb-2 mb-md-0">
                                <span id="result-count" class="text-muted fw-medium">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="M21 21l-4.35-4.35"></path>
                                    </svg>
                                    Ürünler yükleniyor...
                                </span>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="d-flex align-items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 6h18"></path>
                                        <path d="M7 12h10"></path>
                                        <path d="M10 18h4"></path>
                                    </svg>
                                    <select class="form-select sort-select" id="sort-select" onchange="applyFilters()">
                                        <option value="yeni">En Yeniler</option>
                                        <option value="fiyat_artan">Fiyat (Düşük - Yüksek)</option>
                                        <option value="fiyat_azalan">Fiyat (Yüksek - Düşük)</option>
                                        <option value="a-z">İsim (A-Z)</option>
                                        <option value="z-a">İsim (Z-A)</option>
                                        <option value="stok">En Çok Stokta</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Products Grid -->
                    <div class="product-grid" id="products-container">
                        <div class="loading-state">
                            <div class="loading-spinner"></div>
                            <p class="text-muted mb-0">Ürünler yükleniyor...</p>
                        </div>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="pagination" class="mt-4"></div>
                </div>
            </div>
        </div>
    </main>
    
    <?php echo $loader->loadComponent('footer', 'Public'); ?>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../components/js/component-loader.js"></script>
    <script src="js/main.js"></script>
    
    <script>
        // Mobile Filter Functions
        function openMobileFilters() {
            document.getElementById('mobileFilterOverlay').style.display = 'block';
            document.getElementById('mobileFilterSidebar').classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closeMobileFilters() {
            document.getElementById('mobileFilterOverlay').style.display = 'none';
            document.getElementById('mobileFilterSidebar').classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Close mobile filters when clicking overlay
        document.getElementById('mobileFilterOverlay').addEventListener('click', closeMobileFilters);
        
        // Sync mobile and desktop filters
        function syncFilters() {
            const desktopFilters = document.querySelectorAll('#age-filters input, .filters-container input');
            const mobileFilters = document.querySelectorAll('#mobile-age-filters input, .mobile-filter-sidebar input');
            
            desktopFilters.forEach((input, index) => {
                if (mobileFilters[index]) {
                    mobileFilters[index].checked = input.checked;
                }
            });
            
            mobileFilters.forEach((input, index) => {
                if (desktopFilters[index]) {
                    desktopFilters[index].checked = input.checked;
                }
            });
        }
        
        // Enhanced product card creation with responsive design
        function createProductCard(product) {
            const salePrice = product.indirimli_fiyat > 0 ? product.indirimli_fiyat : product.fiyat;
            const originalPrice = product.indirimli_fiyat > 0 ? product.fiyat : null;
            const discountPercent = originalPrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
            const isNew = product.yeni_urun == 1;
            const isFeatured = product.vitrin_urunu == 1;
            const isOnSale = product.kampanyali == 1 || product.indirimli_fiyat > 0;
            
            let badges = '';
            if (isNew) badges += '<span class="badge bg-success position-absolute top-0 start-0 m-2">Yeni</span>';
            if (isFeatured) badges += '<span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">Öne Çıkan</span>';
            if (isOnSale) badges += `<span class="badge bg-danger position-absolute" style="top: ${isNew || isFeatured ? '2.5rem' : '0.5rem'}; right: 0.5rem;">%${discountPercent} İndirim</span>`;
            
            return `
                <div class="card h-100 shadow-sm border-0 product-card" style="transition: all 0.3s ease; cursor: pointer;" 
                     onclick="window.location.href='product-detail.php?id=${product.id}'" 
                     onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'" 
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'">
                    <div class="position-relative overflow-hidden" style="height: 200px;">
                        ${badges}
                        <img src="${product.resim_url || 'https://via.placeholder.com/300x200?text=Ürün+Resmi'}" 
                             class="card-img-top h-100 w-100" 
                             style="object-fit: cover; transition: transform 0.3s ease;"
                             alt="${product.urun_adi}"
                             onmouseover="this.style.transform='scale(1.05)'"
                             onmouseout="this.style.transform='scale(1)'"
                             onerror="this.src='https://via.placeholder.com/300x200?text=Ürün+Resmi'">
                    </div>
                    <div class="card-body d-flex flex-column p-3">
                        <h6 class="card-title text-truncate mb-2" style="font-size: 0.9rem; font-weight: 600; color: #2d3748;" title="${product.urun_adi}">
                            ${product.urun_adi}
                        </h6>
                        <p class="card-text text-muted small mb-3 flex-grow-1" style="font-size: 0.8rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${product.aciklama || 'Ürün açıklaması mevcut değil.'}
                        </p>
                        <div class="price-container mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <span class="h6 mb-0 text-primary fw-bold">${parseFloat(salePrice).toFixed(2)} ₺</span>
                                ${originalPrice ? `<span class="text-muted text-decoration-line-through small">${parseFloat(originalPrice).toFixed(2)} ₺</span>` : ''}
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                                Stok: ${product.stok_miktari || 0}
                            </small>
                            <button class="btn btn-sm btn-outline-primary" style="min-height: 36px; min-width: 36px;" 
                                    onclick="event.stopPropagation(); addToCart(${product.id})"
                                    title="Sepete Ekle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="8" cy="21" r="1"></circle>
                                    <circle cx="19" cy="21" r="1"></circle>
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.42 7H6"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Enhanced pagination with responsive design
        function createPagination(currentPage, totalPages, container) {
            let paginationHTML = '<nav aria-label="Ürün sayfaları" class="d-flex justify-content-center">';
            paginationHTML += '<ul class="pagination pagination-sm flex-wrap gap-1">';
            
            // Previous button
            if (currentPage > 1) {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="changePage(${currentPage - 1})" style="min-height: 44px; display: flex; align-items: center; padding: 0.5rem 0.75rem;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            <span class="d-none d-sm-inline ms-1">Önceki</span>
                        </a>
                    </li>
                `;
            }
            
            // Page numbers (mobile-friendly)
            const isMobile = window.innerWidth < 576;
            const pageRange = isMobile ? 2 : 3;
            
            let startPage = Math.max(1, currentPage - pageRange);
            let endPage = Math.min(totalPages, currentPage + pageRange);
            
            if (startPage > 1) {
                paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)" style="min-height: 44px; display: flex; align-items: center;">1</a></li>`;
                if (startPage > 2) {
                    paginationHTML += '<li class="page-item disabled"><span class="page-link" style="min-height: 44px; display: flex; align-items: center;">...</span></li>';
                }
            }
            
            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${i})" style="min-height: 44px; display: flex; align-items: center; padding: 0.5rem 0.75rem;">${i}</a>
                    </li>
                `;
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationHTML += '<li class="page-item disabled"><span class="page-link" style="min-height: 44px; display: flex; align-items: center;">...</span></li>';
                }
                paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})" style="min-height: 44px; display: flex; align-items: center;">${totalPages}</a></li>`;
            }
            
            // Next button
            if (currentPage < totalPages) {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})" style="min-height: 44px; display: flex; align-items: center; padding: 0.5rem 0.75rem;">
                            <span class="d-none d-sm-inline me-1">Sonraki</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </a>
                    </li>
                `;
            }
            
            paginationHTML += '</ul></nav>';
            container.innerHTML = paginationHTML;
        }
        
        function changePage(page) {
            const currentFilters = getActiveFilters();
            currentFilters.page = page;
            
            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('page', page);
            window.history.pushState({}, '', url);
            
            // Load products
            loadProducts(currentFilters);
            
            // Scroll to top on mobile
            if (window.innerWidth < 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        
        function getActiveFilters() {
            const filters = {};
            
            // Age groups
            const checkedAges = document.querySelectorAll('input[name="age_group"]:checked');
            if (checkedAges.length > 0) {
                filters.yas_grubu_id = Array.from(checkedAges).map(input => input.value).join(',');
            }
            
            // Features
            if (document.querySelector('input[name="is_featured"]:checked')) {
                filters.vitrin_urunu = 1;
            }
            if (document.querySelector('input[name="is_new"]:checked')) {
                filters.yeni_urun = 1;
            }
            if (document.querySelector('input[name="is_sale"]:checked')) {
                filters.kampanyali = 1;
            }
            
            // Sorting
            const sortValue = document.getElementById('sort-select').value;
            if (sortValue) {
                filters.siralama = sortValue;
            }
            
            // URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            for (const [key, value] of urlParams.entries()) {
                if (!filters[key] && key !== 'page') {
                    filters[key] = value;
                }
            }
            
            return filters;
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadInitialProducts();
            updateCartCount();
            
            // Add resize listener for responsive behavior
            window.addEventListener('resize', function() {
                if (window.innerWidth >= 768) {
                    closeMobileFilters();
                }
            });
        });
        
        function loadInitialProducts() {
            const filters = getFiltersFromURL();
            loadProducts(filters);
        }
        
        function getFiltersFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const filters = {};
            
            // Get all URL parameters
            for (const [key, value] of urlParams.entries()) {
                filters[key] = value;
            }
            
            // Set UI elements based on URL
            const sortSelect = document.getElementById('sort-select');
            if (filters.siralama) {
                sortSelect.value = filters.siralama;
            }
            
            // Set checkboxes
            if (filters.yas_grubu_id) {
                const ageIds = filters.yas_grubu_id.split(',');
                ageIds.forEach(id => {
                    const checkboxes = document.querySelectorAll(`input[name="age_group"][value="${id}"]`);
                    checkboxes.forEach(cb => cb.checked = true);
                });
            }
            
            if (filters.vitrin_urunu) {
                const checkboxes = document.querySelectorAll('input[name="is_featured"]');
                checkboxes.forEach(cb => cb.checked = true);
            }
            
            if (filters.yeni_urun) {
                const checkboxes = document.querySelectorAll('input[name="is_new"]');
                checkboxes.forEach(cb => cb.checked = true);
            }
            
            if (filters.kampanyali) {
                const checkboxes = document.querySelectorAll('input[name="is_sale"]');
                checkboxes.forEach(cb => cb.checked = true);
            }
            
            return filters;
        }
        
        function applyFilters() {
            const filters = getActiveFilters();
            
            // Update URL
            const url = new URL(window.location);
            url.search = new URLSearchParams(filters).toString();
            window.history.pushState({}, '', url);
            
            // Sync filters between mobile and desktop
            syncFilters();
            
            // Load products
            loadProducts(filters);
        }
        
        function clearFilters() {
            // Clear all checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(input => {
                input.checked = false;
            });
            
            // Reset sort
            document.getElementById('sort-select').value = 'yeni';
            
            // Clear URL and load products
            window.history.pushState({}, '', window.location.pathname);
            loadProducts({});
        }
        
        // Enhanced loadProducts function
        async function loadProducts(filters = {}) {
            const container = document.getElementById('products-container');
            const resultCount = document.getElementById('result-count');
            const paginationContainer = document.getElementById('pagination');
            
            try {
                // Show loading state
                container.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <p class="text-muted mb-0">Ürünler yükleniyor...</p>
                    </div>
                `;
                
                const queryParams = new URLSearchParams(filters).toString();
                const url = `../backend/api/urunler.php?${queryParams}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    container.innerHTML = data.data.map(product => createProductCard(product)).join('');
                    resultCount.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                        ${data.total} ürün bulundu
                    `;
                    
                    if (paginationContainer && data.total_pages > 1) {
                        createPagination(data.page, data.total_pages, paginationContainer);
                    } else {
                        paginationContainer.innerHTML = '';
                    }
                } else {
                    container.innerHTML = `
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted mb-3">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="M21 21l-4.35-4.35"></path>
                            </svg>
                            <h5 class="text-muted">Ürün bulunamadı</h5>
                            <p class="text-muted mb-3">Arama kriterlerinize uygun ürün bulunamadı. Filtreleri temizleyip tekrar deneyin.</p>
                            <button class="btn btn-primary" onclick="clearFilters()">Filtreleri Temizle</button>
                        </div>
                    `;
                    resultCount.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                        0 ürün bulundu
                    `;
                    paginationContainer.innerHTML = '';
                }
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error);
                container.innerHTML = `
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-danger mb-3">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <h5 class="text-danger">Hata Oluştu</h5>
                        <p class="text-muted mb-3">Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.</p>
                        <button class="btn btn-primary" onclick="location.reload()">Sayfayı Yenile</button>
                    </div>
                `;
                resultCount.textContent = 'Hata';
            }
        }
        
        // Helper functions
        function addToCart(productId) {
            // Add to cart functionality
            console.log('Ürün sepete eklendi:', productId);
            // This will be implemented when cart system is ready
        }
        
        function updateCartCount() {
            // Update cart count
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                // Get cart count from localStorage or API
                cartCount.textContent = '0';
            }
        }
        
        function getURLParameter(name) {
            return new URLSearchParams(window.location.search).get(name);
        }
    </script>
</body>
</html>
