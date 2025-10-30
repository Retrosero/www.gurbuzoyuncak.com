<?php
require_once '../components/ComponentLoader.php';
$loader = new ComponentLoader();

// Get product ID from URL
$productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Ürün detayları - Gürbüz Oyuncak">
    <title>Ürün Detayı | Gürbüz Oyuncak</title>
    <link rel="icon" type="image/png" href="images/favicon.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../components/css/components.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Mobile-first Product Detail Styles */
        .product-detail-main {
            min-height: 80vh;
            padding: 1rem 0;
        }
        
        /* Breadcrumb */
        .breadcrumb-nav {
            background: #f8fafc;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
        }
        
        .breadcrumb-nav a {
            color: #667eea;
            text-decoration: none;
            transition: color 0.2s ease;
        }
        
        .breadcrumb-nav a:hover {
            color: #4c51bf;
            text-decoration: underline;
        }
        
        .breadcrumb-nav span {
            color: #6b7280;
        }
        
        /* Product Gallery */
        .product-gallery {
            margin-bottom: 2rem;
        }
        
        .main-image-container {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            background: #f8fafc;
            margin-bottom: 1rem;
        }
        
        .main-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .image-zoom-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            backdrop-filter: blur(4px);
            transition: all 0.3s ease;
        }
        
        .image-zoom-btn:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.05);
        }
        
        .thumbnail-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
        }
        
        .thumbnail-image {
            width: 100%;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .thumbnail-image:hover,
        .thumbnail-image.active {
            border-color: #667eea;
            transform: scale(1.05);
        }
        
        /* Product Info */
        .product-info {
            padding: 0;
        }
        
        .product-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 1rem;
            line-height: 1.3;
        }
        
        .product-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .rating-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .rating-stars {
            display: flex;
            align-items: center;
            gap: 2px;
        }
        
        .rating-star {
            width: 16px;
            height: 16px;
            color: #fbbf24;
        }
        
        .rating-text {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .product-sku {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        /* Price Section */
        .price-container {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid #e2e8f0;
        }
        
        .price-current {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .price-original {
            font-size: 1.125rem;
            color: #9ca3af;
            text-decoration: line-through;
            margin-left: 0.5rem;
        }
        
        .discount-badge {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 0.375rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-left: 0.75rem;
        }
        
        .stock-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            margin-top: 0.75rem;
        }
        
        .stock-indicator.in-stock {
            color: #10b981;
        }
        
        .stock-indicator.out-of-stock {
            color: #ef4444;
        }
        
        /* Quantity Selector */
        .quantity-section {
            margin: 1.5rem 0;
        }
        
        .quantity-label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #374151;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            max-width: 140px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .quantity-btn {
            width: 48px;
            height: 48px;
            border: none;
            background: #f8fafc;
            color: #374151;
            font-size: 1.25rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .quantity-btn:hover {
            background: #e2e8f0;
        }
        
        .quantity-btn:active {
            transform: scale(0.95);
        }
        
        .quantity-input {
            width: 60px;
            height: 48px;
            text-align: center;
            border: none;
            border-left: 1px solid #d1d5db;
            border-right: 1px solid #d1d5db;
            font-size: 1rem;
            font-weight: 600;
            background: white;
        }
        
        .quantity-input:focus {
            outline: none;
            box-shadow: inset 0 0 0 2px #667eea;
        }
        
        /* Action Buttons */
        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 2rem;
        }
        
        .action-btn {
            min-height: 48px;
            font-weight: 600;
            border-radius: 8px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .btn-add-cart {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .btn-add-cart:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
        
        .btn-wishlist {
            background: white;
            border: 2px solid #e2e8f0;
            color: #6b7280;
        }
        
        .btn-wishlist:hover {
            border-color: #667eea;
            color: #667eea;
            background: #f8fafc;
        }
        
        /* Features Section */
        .features-container {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid #e2e8f0;
        }
        
        .features-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .features-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .features-list li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .feature-check {
            width: 16px;
            height: 16px;
            color: #10b981;
        }
        
        /* Trust Badges */
        .trust-badges {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid #e2e8f0;
        }
        
        .trust-badge {
            text-align: center;
        }
        
        .trust-badge-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        .trust-badge-title {
            font-weight: 600;
            font-size: 0.875rem;
            color: #374151;
            margin-bottom: 0.25rem;
        }
        
        .trust-badge-desc {
            font-size: 0.75rem;
            color: #6b7280;
        }
        
        /* Product Tabs */
        .product-tabs {
            margin-top: 2rem;
        }
        
        .nav-tabs {
            border-bottom: 2px solid #e2e8f0;
            margin-bottom: 1.5rem;
        }
        
        .nav-tabs .nav-link {
            border: none;
            border-bottom: 3px solid transparent;
            color: #6b7280;
            font-weight: 600;
            padding: 1rem 0.75rem;
            margin-bottom: -2px;
            border-radius: 0;
            white-space: nowrap;
        }
        
        .nav-tabs .nav-link.active {
            color: #667eea;
            border-bottom-color: #667eea;
            background: none;
        }
        
        .tab-content-container {
            min-height: 200px;
        }
        
        /* Review Item */
        .review-item {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border: 1px solid #e2e8f0;
        }
        
        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }
        
        .reviewer-name {
            font-weight: 600;
            color: #374151;
        }
        
        .review-date {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .review-text {
            color: #6b7280;
            line-height: 1.5;
            margin: 0;
        }
        
        /* Specifications Table */
        .specs-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .specs-table tr {
            border-bottom: 1px solid #e2e8f0;
        }
        
        .specs-table tr:last-child {
            border-bottom: none;
        }
        
        .specs-table td {
            padding: 1rem;
            vertical-align: top;
        }
        
        .specs-table td:first-child {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
            width: 30%;
        }
        
        .specs-table td:last-child {
            color: #6b7280;
        }
        
        /* Responsive Design - Mobile First */
        @media (min-width: 576px) {
            .main-image {
                height: 350px;
            }
            
            .thumbnail-image {
                height: 70px;
            }
            
            .product-title {
                font-size: 1.75rem;
            }
            
            .price-current {
                font-size: 2.25rem;
            }
            
            .action-buttons {
                flex-direction: row;
            }
        }
        
        @media (min-width: 768px) {
            .product-detail-main {
                padding: 2rem 0;
            }
            
            .main-image {
                height: 400px;
            }
            
            .thumbnail-image {
                height: 80px;
            }
            
            .product-title {
                font-size: 2rem;
            }
            
            .price-current {
                font-size: 2.5rem;
            }
            
            .trust-badges {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        @media (min-width: 992px) {
            .main-image {
                height: 500px;
            }
            
            .thumbnail-image {
                height: 90px;
            }
            
            .product-gallery {
                position: sticky;
                top: 100px;
                margin-bottom: 0;
            }
        }
        
        /* Loading States */
        .loading-placeholder {
            background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
            background-size: 200% 100%;
            animation: loading-shimmer 1.5s infinite;
            border-radius: 8px;
        }
        
        @keyframes loading-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        .error-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #6b7280;
        }
        
        .error-icon {
            width: 48px;
            height: 48px;
            color: #ef4444;
            margin: 0 auto 1rem;
        }
        
        /* Image Viewer Modal */
        .image-viewer-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1060;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .image-viewer-content {
            max-width: 90vw;
            max-height: 90vh;
            position: relative;
        }
        
        .image-viewer-img {
            width: 100%;
            height: auto;
            border-radius: 8px;
        }
        
        .image-viewer-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body>
    <?php echo $loader->loadComponent('navbar', 'Public'); ?>
    
    <!-- Image Viewer Modal -->
    <div class="image-viewer-modal" id="imageViewerModal">
        <div class="image-viewer-content">
            <button class="image-viewer-close" onclick="closeImageViewer()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <img id="imageViewerImg" class="image-viewer-img" src="" alt="Ürün görseli">
        </div>
    </div>
    
    <main class="product-detail-main">
        <div class="container-fluid">
            <!-- Breadcrumb -->
            <nav class="breadcrumb-nav">
                <div class="d-flex align-items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9,22 9,12 15,12 15,22"></polyline>
                    </svg>
                    <a href="index.php">Ana Sayfa</a>
                    <span>/</span>
                    <a href="products.php" id="breadcrumb-category">Ürünler</a>
                    <span>/</span>
                    <span id="breadcrumb-product">Ürün Detayı</span>
                </div>
            </nav>
            
            <div class="row">
                <!-- Product Gallery -->
                <div class="col-lg-6 col-12">
                    <div class="product-gallery">
                        <div class="main-image-container">
                            <img id="main-image" class="main-image" src="" alt="Ürün görseli">
                            <button class="image-zoom-btn" onclick="openImageViewer()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="M21 21l-4.35-4.35"></path>
                                    <path d="M11 8v6"></path>
                                    <path d="M8 11h6"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="thumbnail-grid" id="thumbnail-grid">
                            <!-- Thumbnail images will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <!-- Product Info -->
                <div class="col-lg-6 col-12">
                    <div class="product-info">
                        <h1 class="product-title" id="product-name">
                            <div class="loading-placeholder" style="height: 2.5rem; width: 80%;"></div>
                        </h1>
                        
                        <div class="product-meta">
                            <div class="rating-container">
                                <div class="rating-stars">
                                    <svg class="rating-star" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                    <svg class="rating-star" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                    <svg class="rating-star" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                    <svg class="rating-star" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                    <svg class="rating-star" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                </div>
                                <span class="rating-text">(4.5) - 24 değerlendirme</span>
                            </div>
                            <div class="product-sku">
                                SKU: <span id="product-sku">-</span>
                            </div>
                        </div>
                        
                        <div class="price-container">
                            <div class="d-flex align-items-center flex-wrap">
                                <span class="price-current" id="product-price">
                                    <div class="loading-placeholder" style="height: 2rem; width: 120px;"></div>
                                </span>
                                <span class="price-original" id="product-old-price" style="display: none;"></span>
                                <span class="discount-badge" id="discount-badge" style="display: none;"></span>
                            </div>
                            <div class="stock-indicator in-stock" id="stock-status">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                                <span>Stok durumu yükleniyor...</span>
                            </div>
                        </div>
                        
                        <div class="quantity-section">
                            <label class="quantity-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <path d="M9 9h6v6H9z"></path>
                                </svg>
                                Miktar:
                            </label>
                            <div class="quantity-controls">
                                <button type="button" class="quantity-btn" onclick="decreaseQuantity()">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                                <input type="number" class="quantity-input" id="quantity" value="1" min="1" max="10" readonly>
                                <button type="button" class="quantity-btn" onclick="increaseQuantity()">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="btn action-btn btn-add-cart" onclick="addToCart()" id="add-to-cart-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="8" cy="21" r="1"></circle>
                                    <circle cx="19" cy="21" r="1"></circle>
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.42 7H6"></path>
                                </svg>
                                Sepete Ekle
                            </button>
                            <button class="btn action-btn btn-wishlist" onclick="addToWishlist()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                Favorilere Ekle
                            </button>
                        </div>
                        
                        <div class="features-container">
                            <h3 class="features-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"></polygon>
                                </svg>
                                Ürün Özellikleri
                            </h3>
                            <ul class="features-list" id="product-features">
                                <li>
                                    <svg class="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                    Yüksek kaliteli malzeme
                                </li>
                                <li>
                                    <svg class="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                    CE sertifikalı ve güvenli
                                </li>
                                <li>
                                    <svg class="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                    Kolay temizlenir
                                </li>
                                <li>
                                    <svg class="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                    Yaşa uygun tasarım
                                </li>
                            </ul>
                        </div>
                        
                        <div class="trust-badges">
                            <div class="trust-badge">
                                <div class="trust-badge-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="1" y="3" width="15" height="13"></rect>
                                        <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"></polygon>
                                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                    </svg>
                                </div>
                                <div class="trust-badge-title">Ücretsiz Kargo</div>
                                <div class="trust-badge-desc">500 TL üzeri</div>
                            </div>
                            <div class="trust-badge">
                                <div class="trust-badge-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="9,11 12,14 22,4"></polyline>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                    </svg>
                                </div>
                                <div class="trust-badge-title">Kolay İade</div>
                                <div class="trust-badge-desc">14 gün içinde</div>
                            </div>
                            <div class="trust-badge">
                                <div class="trust-badge-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <div class="trust-badge-title">Güvenli Ödeme</div>
                                <div class="trust-badge-desc">SSL korumalı</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Product Tabs -->
            <div class="product-tabs">
                <ul class="nav nav-tabs" id="productTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10,9 9,9 8,9"></polyline>
                            </svg>
                            Açıklama
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="specifications-tab" data-bs-toggle="tab" data-bs-target="#specifications" type="button" role="tab">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <path d="M8 12h8"></path>
                                <path d="M8 16h8"></path>
                                <path d="M8 8h8"></path>
                            </svg>
                            Özellikler
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"></polygon>
                            </svg>
                            Değerlendirmeler (24)
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="shipping-tab" data-bs-toggle="tab" data-bs-target="#shipping" type="button" role="tab">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                <rect x="1" y="3" width="15" height="13"></rect>
                                <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                            </svg>
                            Kargo & İade
                        </button>
                    </li>
                </ul>
                
                <div class="tab-content tab-content-container" id="productTabContent">
                    <div class="tab-pane fade show active" id="description" role="tabpanel">
                        <div class="p-3">
                            <p id="product-description" class="text-muted">
                                Ürün açıklaması yükleniyor...
                            </p>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="specifications" role="tabpanel">
                        <div class="p-3">
                            <table class="specs-table">
                                <tr>
                                    <td>Marka</td>
                                    <td id="spec-brand">-</td>
                                </tr>
                                <tr>
                                    <td>Yaş Grubu</td>
                                    <td id="spec-age">-</td>
                                </tr>
                                <tr>
                                    <td>Malzeme</td>
                                    <td>Yüksek kaliteli plastik</td>
                                </tr>
                                <tr>
                                    <td>Boyutlar</td>
                                    <td>25 x 15 x 10 cm</td>
                                </tr>
                                <tr>
                                    <td>Sertifikalar</td>
                                    <td>CE, TSE</td>
                                </tr>
                                <tr>
                                    <td>Garanti</td>
                                    <td>2 yıl satıcı garantisi</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="reviews" role="tabpanel">
                        <div class="p-3">
                            <div class="review-item">
                                <div class="review-header">
                                    <div>
                                        <div class="reviewer-name">Ayşe Y.</div>
                                        <div class="rating-stars mt-1">
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="review-date">15 Ekim 2024</div>
                                </div>
                                <p class="review-text">Çocuğum çok sevdi, kaliteli bir ürün. Hızlı kargo için teşekkürler!</p>
                            </div>
                            
                            <div class="review-item">
                                <div class="review-header">
                                    <div>
                                        <div class="reviewer-name">Mehmet K.</div>
                                        <div class="rating-stars mt-1">
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="review-date">10 Ekim 2024</div>
                                </div>
                                <p class="review-text">Fiyat performans ürünü, tavsiye ederim. Kaliteli ve dayanıklı.</p>
                            </div>
                            
                            <div class="review-item">
                                <div class="review-header">
                                    <div>
                                        <div class="reviewer-name">Fatma Ç.</div>
                                        <div class="rating-stars mt-1">
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                            <svg class="rating-star" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="review-date">5 Ekim 2024</div>
                                </div>
                                <p class="review-text">Çok memnun kaldık, çocuklar bayıldı. Kesinlikle tavsiye ederim.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="shipping" role="tabpanel">
                        <div class="p-3">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5 class="fw-bold mb-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                                            <rect x="1" y="3" width="15" height="13"></rect>
                                            <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"></polygon>
                                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                        </svg>
                                        Kargo Bilgileri
                                    </h5>
                                    <ul class="list-unstyled">
                                        <li class="mb-2">• 500 TL ve üzeri siparişlerde kargo ücretsizdir</li>
                                        <li class="mb-2">• Diğer siparişlerde kargo ücreti 29.90 TL'dir</li>
                                        <li class="mb-2">• Siparişleriniz 1-3 iş günü içerisinde kargoya verilir</li>
                                        <li class="mb-2">• Kargo takip numarası SMS ile bildirilir</li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <h5 class="fw-bold mb-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                                            <polyline points="9,11 12,14 22,4"></polyline>
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                        </svg>
                                        İade Koşulları
                                    </h5>
                                    <ul class="list-unstyled">
                                        <li class="mb-2">• Ürünü teslim aldıktan sonra 14 gün içerisinde iade</li>
                                        <li class="mb-2">• İade edilecek ürünler kullanılmamış olmalıdır</li>
                                        <li class="mb-2">• Ambalajı açılmamış ve hasarsız olmalıdır</li>
                                        <li class="mb-2">• İade kargo ücreti müşteriye aittir</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Related Products -->
            <section class="mt-5">
                <div class="d-flex align-items-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <circle cx="12" cy="1" r="1"></circle>
                        <circle cx="12" cy="23" r="1"></circle>
                        <circle cx="20.49" cy="8.51" r="1"></circle>
                        <circle cx="3.51" cy="15.49" r="1"></circle>
                        <circle cx="20.49" cy="15.49" r="1"></circle>
                        <circle cx="3.51" cy="8.51" r="1"></circle>
                        <circle cx="8.51" cy="3.51" r="1"></circle>
                        <circle cx="15.49" cy="20.49" r="1"></circle>
                        <circle cx="15.49" cy="3.51" r="1"></circle>
                        <circle cx="8.51" cy="20.49" r="1"></circle>
                    </svg>
                    <h2 class="mb-0">Benzer Ürünler</h2>
                </div>
                <div class="product-grid" id="related-products">
                    <!-- Related products will be loaded here -->
                </div>
            </section>
        </div>
    </main>
    
    <?php echo $loader->loadComponent('footer', 'Public'); ?>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../components/js/component-loader.js"></script>
    <script src="js/main.js"></script>
    
    <script>
        // Global product data
        let currentProduct = null;
        const productId = <?php echo $productId; ?>;
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            if (productId) {
                loadProductDetail(productId);
            } else {
                showError('Ürün bulunamadı', 'Geçersiz ürün ID\'si');
            }
            updateCartCount();
        });
        
        // Load product details
        async function loadProductDetail(id) {
            try {
                showLoadingState();
                
                const response = await fetch(`../backend/api/urunler.php/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    currentProduct = data.data;
                    displayProduct(currentProduct);
                    loadRelatedProducts(currentProduct.kategori_id);
                } else {
                    throw new Error(data.message || 'Ürün bulunamadı');
                }
            } catch (error) {
                console.error('Ürün yüklenirken hata:', error);
                showError('Ürün Yüklenemedi', error.message);
            }
        }
        
        // Show loading state
        function showLoadingState() {
            document.getElementById('product-name').innerHTML = '<div class="loading-placeholder" style="height: 2.5rem; width: 80%;"></div>';
            document.getElementById('product-price').innerHTML = '<div class="loading-placeholder" style="height: 2rem; width: 120px;"></div>';
            document.getElementById('main-image').src = 'https://via.placeholder.com/500x500?text=Yükleniyor...';
        }
        
        // Show error state
        function showError(title, message) {
            const container = document.querySelector('.product-detail-main .container-fluid');
            container.innerHTML = `
                <div class="error-state">
                    <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <h3 class="text-danger">${title}</h3>
                    <p class="text-muted mb-4">${message}</p>
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-primary" onclick="location.reload()">Sayfayı Yenile</button>
                        <a href="products.php" class="btn btn-outline-secondary">Ürünlere Dön</a>
                    </div>
                </div>
            `;
        }
        
        // Display product data
        function displayProduct(product) {
            // Basic info
            document.getElementById('product-name').textContent = product.urun_adi;
            document.getElementById('product-sku').textContent = product.urun_kodu || 'N/A';
            document.getElementById('product-description').textContent = product.aciklama || 'Ürün açıklaması mevcut değil.';
            
            // Price calculation
            const salePrice = product.indirimli_fiyat > 0 ? product.indirimli_fiyat : product.fiyat;
            const originalPrice = product.indirimli_fiyat > 0 ? product.fiyat : null;
            const discountPercent = originalPrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
            
            document.getElementById('product-price').textContent = `₺${parseFloat(salePrice).toFixed(2)}`;
            
            // Show discount if available
            if (originalPrice) {
                document.getElementById('product-old-price').textContent = `₺${parseFloat(originalPrice).toFixed(2)}`;
                document.getElementById('product-old-price').style.display = 'inline';
                document.getElementById('discount-badge').textContent = `%${discountPercent} İndirim`;
                document.getElementById('discount-badge').style.display = 'inline-block';
            }
            
            // Stock status
            const stockStatus = document.getElementById('stock-status');
            if (product.stok_miktari > 0) {
                stockStatus.className = 'stock-indicator in-stock';
                stockStatus.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    <span>Stokta var (${product.stok_miktari} adet)</span>
                `;
                
                // Enable quantity controls
                document.getElementById('quantity').max = Math.min(10, product.stok_miktari);
                document.getElementById('add-to-cart-btn').disabled = false;
            } else {
                stockStatus.className = 'stock-indicator out-of-stock';
                stockStatus.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>Stokta yok</span>
                `;
                
                // Disable add to cart
                document.getElementById('add-to-cart-btn').disabled = true;
                document.getElementById('add-to-cart-btn').textContent = 'Stokta Yok';
            }
            
            // Images
            setupProductImages(product);
            
            // Breadcrumb
            updateBreadcrumb(product);
            
            // Specifications
            document.getElementById('spec-brand').textContent = product.brand_name || 'Gürbüz Oyuncak';
            document.getElementById('spec-age').textContent = product.age_group_name || '-';
            
            // Update page title
            document.title = `${product.urun_adi} | Gürbüz Oyuncak`;
        }
        
        // Setup product images
        function setupProductImages(product) {
            const mainImage = document.getElementById('main-image');
            const thumbnailGrid = document.getElementById('thumbnail-grid');
            
            // Default images if none available
            const images = [
                product.resim_url || 'https://via.placeholder.com/500x500?text=Ürün+Görseli',
                product.resim_2 || 'https://via.placeholder.com/500x500?text=Görsel+2',
                product.resim_3 || 'https://via.placeholder.com/500x500?text=Görsel+3',
                product.resim_4 || 'https://via.placeholder.com/500x500?text=Görsel+4'
            ];
            
            // Set main image
            mainImage.src = images[0];
            mainImage.alt = product.urun_adi;
            
            // Create thumbnails
            thumbnailGrid.innerHTML = '';
            images.forEach((imageSrc, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = imageSrc;
                thumbnail.alt = `${product.urun_adi} - Görsel ${index + 1}`;
                thumbnail.className = `thumbnail-image ${index === 0 ? 'active' : ''}`;
                thumbnail.onclick = () => changeMainImage(thumbnail, imageSrc);
                thumbnail.onerror = () => {
                    thumbnail.src = 'https://via.placeholder.com/500x500?text=Görsel+Yok';
                };
                thumbnailGrid.appendChild(thumbnail);
            });
        }
        
        // Change main image
        function changeMainImage(thumbnail, imageSrc) {
            document.getElementById('main-image').src = imageSrc;
            document.querySelectorAll('.thumbnail-image').forEach(img => img.classList.remove('active'));
            thumbnail.classList.add('active');
        }
        
        // Update breadcrumb
        function updateBreadcrumb(product) {
            if (product.kategori_adi) {
                const breadcrumbCategory = document.getElementById('breadcrumb-category');
                breadcrumbCategory.textContent = product.kategori_adi;
                breadcrumbCategory.href = `products.php?kategori_id=${product.kategori_id}`;
            }
            document.getElementById('breadcrumb-product').textContent = product.urun_adi;
        }
        
        // Quantity controls
        function increaseQuantity() {
            const input = document.getElementById('quantity');
            const current = parseInt(input.value);
            const max = parseInt(input.max);
            
            if (current < max) {
                input.value = current + 1;
            }
        }
        
        function decreaseQuantity() {
            const input = document.getElementById('quantity');
            const current = parseInt(input.value);
            const min = parseInt(input.min);
            
            if (current > min) {
                input.value = current - 1;
            }
        }
        
        // Add to cart
        function addToCart() {
            if (!currentProduct) {
                alert('Ürün bilgileri yüklenmedi!');
                return;
            }
            
            if (currentProduct.stok_miktari <= 0) {
                alert('Bu ürün stokta yok!');
                return;
            }
            
            const quantity = parseInt(document.getElementById('quantity').value);
            const salePrice = currentProduct.indirimli_fiyat > 0 ? currentProduct.indirimli_fiyat : currentProduct.fiyat;
            
            const cartItem = {
                id: currentProduct.id,
                name: currentProduct.urun_adi,
                price: salePrice,
                quantity: quantity,
                image: currentProduct.resim_url || 'https://via.placeholder.com/200x200?text=Ürün',
                sku: currentProduct.urun_kodu
            };
            
            // Add to localStorage cart (simple implementation)
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.id === cartItem.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push(cartItem);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Show success message
            const btn = document.getElementById('add-to-cart-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                </svg>
                Sepete Eklendi!
            `;
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
            
            updateCartCount();
        }
        
        // Add to wishlist
        function addToWishlist() {
            if (!currentProduct) {
                alert('Ürün bilgileri yüklenmedi!');
                return;
            }
            
            // Simple wishlist implementation
            let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            const existingItem = wishlist.find(item => item.id === currentProduct.id);
            
            if (!existingItem) {
                wishlist.push({
                    id: currentProduct.id,
                    name: currentProduct.urun_adi,
                    price: currentProduct.indirimli_fiyat > 0 ? currentProduct.indirimli_fiyat : currentProduct.fiyat,
                    image: currentProduct.resim_url || 'https://via.placeholder.com/200x200?text=Ürün'
                });
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                
                const btn = event.target.closest('.btn-wishlist');
                const originalText = btn.innerHTML;
                btn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Favorilere Eklendi!
                `;
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            } else {
                alert('Bu ürün zaten favorilerinizde!');
            }
        }
        
        // Load related products
        async function loadRelatedProducts(categoryId) {
            try {
                const response = await fetch(`../backend/api/urunler.php?kategori_id=${categoryId}&limit=4&exclude=${productId}`);
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    displayRelatedProducts(data.data);
                }
            } catch (error) {
                console.error('Benzer ürünler yüklenirken hata:', error);
            }
        }
        
        // Display related products
        function displayRelatedProducts(products) {
            const container = document.getElementById('related-products');
            container.className = 'row g-3';
            
            container.innerHTML = products.map(product => {
                const salePrice = product.indirimli_fiyat > 0 ? product.indirimli_fiyat : product.fiyat;
                const originalPrice = product.indirimli_fiyat > 0 ? product.fiyat : null;
                
                return `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="card h-100 shadow-sm border-0" style="cursor: pointer; transition: all 0.3s ease;" 
                             onclick="window.location.href='product-detail.php?id=${product.id}'"
                             onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'" 
                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'">
                            <div class="position-relative overflow-hidden" style="height: 200px;">
                                <img src="${product.resim_url || 'https://via.placeholder.com/300x200?text=Ürün+Resmi'}" 
                                     class="card-img-top h-100 w-100" 
                                     style="object-fit: cover;"
                                     alt="${product.urun_adi}"
                                     onerror="this.src='https://via.placeholder.com/300x200?text=Ürün+Resmi'">
                            </div>
                            <div class="card-body p-3">
                                <h6 class="card-title text-truncate mb-2" style="font-size: 0.9rem;">${product.urun_adi}</h6>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="h6 mb-0 text-primary fw-bold">${parseFloat(salePrice).toFixed(2)} ₺</span>
                                    ${originalPrice ? `<span class="text-muted text-decoration-line-through small">${parseFloat(originalPrice).toFixed(2)} ₺</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Image viewer functions
        function openImageViewer() {
            const mainImage = document.getElementById('main-image');
            const viewerImg = document.getElementById('imageViewerImg');
            const modal = document.getElementById('imageViewerModal');
            
            viewerImg.src = mainImage.src;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
        function closeImageViewer() {
            const modal = document.getElementById('imageViewerModal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Close image viewer on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeImageViewer();
            }
        });
        
        // Close image viewer on outside click
        document.getElementById('imageViewerModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeImageViewer();
            }
        });
        
        // Update cart count
        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = totalItems;
            }
        }
        
        // Utility function for URL parameters
        function getURLParameter(name) {
            return new URLSearchParams(window.location.search).get(name);
        }
    </script>
</body>
</html>