<?php
require_once '../components/ComponentLoader.php';
$loader = new ComponentLoader();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sepetim | Gürbüz Oyuncak</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../components/css/components.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Mobile-first Cart Styles */
        .cart-main {
            min-height: 80vh;
            padding: 1rem 0;
        }
        
        .cart-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .cart-icon {
            width: 28px;
            height: 28px;
            color: #667eea;
        }
        
        /* Cart Item Cards - Mobile First */
        .cart-item-card {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .cart-item-card.swipe-active {
            transform: translateX(-80px);
        }
        
        .cart-item-delete {
            position: absolute;
            right: -80px;
            top: 0;
            height: 100%;
            width: 80px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .cart-item-content {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
        }
        
        .cart-item-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            flex-shrink: 0;
            border: 1px solid #e2e8f0;
        }
        
        .cart-item-details {
            flex: 1;
            min-width: 0;
        }
        
        .cart-item-name {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
            line-height: 1.3;
            font-size: 0.95rem;
        }
        
        .cart-item-price {
            color: #667eea;
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
        }
        
        .cart-item-sku {
            font-size: 0.8rem;
            color: #6b7280;
            margin-bottom: 0.75rem;
        }
        
        /* Touch-Friendly Quantity Controls */
        .quantity-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 1rem;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
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
            background: #d1d5db;
        }
        
        .quantity-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .quantity-input {
            width: 60px;
            height: 48px;
            text-align: center;
            border: none;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            font-weight: 600;
            background: white;
            font-size: 1rem;
        }
        
        .quantity-input:focus {
            outline: none;
            box-shadow: inset 0 0 0 2px #667eea;
        }
        
        .remove-item-btn {
            width: 48px;
            height: 48px;
            border: none;
            background: #fef2f2;
            color: #ef4444;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .remove-item-btn:hover {
            background: #fee2e2;
            transform: scale(1.05);
        }
        
        .remove-item-btn:active {
            transform: scale(0.95);
        }
        
        /* Cart Summary - Mobile Optimized */
        .cart-summary {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            margin-top: 1.5rem;
        }
        
        .summary-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #374151;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 0.5rem 0;
            color: #6b7280;
        }
        
        .summary-row.total {
            font-size: 1.25rem;
            font-weight: 700;
            color: #667eea;
            border-top: 2px solid #e2e8f0;
            padding-top: 1rem;
            margin-top: 1rem;
        }
        
        .shipping-notice {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            font-size: 0.875rem;
            color: #1e40af;
        }
        
        .shipping-notice.success {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-color: #bbf7d0;
            color: #166534;
        }
        
        /* Coupon System */
        .coupon-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            border: 1px solid #e2e8f0;
        }
        
        .coupon-input-group {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.75rem;
        }
        
        .coupon-input {
            flex: 1;
            height: 48px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 0 1rem;
            font-size: 0.9rem;
        }
        
        .coupon-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .coupon-btn {
            height: 48px;
            padding: 0 1.5rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .coupon-btn:hover {
            background: #5a67d8;
        }
        
        .coupon-applied {
            background: #f0fdf4;
            border-color: #bbf7d0;
            color: #166534;
            margin-top: 0.75rem;
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        /* Action Buttons */
        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1.5rem;
        }
        
        .checkout-btn {
            height: 56px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            border-radius: 12px;
            font-weight: 700;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .checkout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
        
        .checkout-btn:active {
            transform: translateY(0);
        }
        
        .continue-shopping-btn {
            height: 48px;
            background: white;
            border: 2px solid #e2e8f0;
            color: #6b7280;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .continue-shopping-btn:hover {
            border-color: #667eea;
            color: #667eea;
            background: #f8fafc;
            text-decoration: none;
        }
        
        /* Empty Cart State */
        .empty-cart {
            text-align: center;
            padding: 4rem 1rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        
        .empty-cart-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            color: #d1d5db;
        }
        
        .empty-cart-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #374151;
            margin-bottom: 1rem;
        }
        
        .empty-cart-text {
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.5;
        }
        
        .shop-now-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .shop-now-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
            color: white;
            text-decoration: none;
        }
        
        /* Loading States */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1050;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Responsive Design */
        @media (min-width: 576px) {
            .cart-item-image {
                width: 100px;
                height: 100px;
            }
            
            .cart-item-name {
                font-size: 1rem;
            }
            
            .cart-item-price {
                font-size: 1.2rem;
            }
        }
        
        @media (min-width: 768px) {
            .cart-main {
                padding: 2rem 0;
            }
            
            .cart-title {
                font-size: 2rem;
                margin-bottom: 2rem;
            }
            
            .cart-item-card {
                padding: 1.5rem;
            }
            
            .cart-item-content {
                gap: 1.5rem;
            }
            
            .cart-item-image {
                width: 120px;
                height: 120px;
            }
            
            .quantity-container {
                flex-direction: row;
                align-items: center;
                margin-top: 0;
            }
            
            .action-buttons {
                flex-direction: row;
            }
        }
        
        @media (min-width: 992px) {
            .cart-layout {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 2rem;
                align-items: start;
            }
            
            .cart-summary {
                position: sticky;
                top: 100px;
                margin-top: 0;
            }
        }
        
        /* Checkout Modal */
        .checkout-modal .modal-content {
            border-radius: 12px;
            border: none;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
        
        .checkout-modal .modal-header {
            border-bottom: 1px solid #e2e8f0;
            padding: 1.5rem;
        }
        
        .checkout-modal .modal-body {
            padding: 1.5rem;
        }
        
        .checkout-option {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .checkout-option:hover,
        .checkout-option.selected {
            border-color: #667eea;
            background: #f0f4ff;
        }
        
        .checkout-option-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .checkout-option-desc {
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        /* Touch Gestures */
        .cart-item-card {
            touch-action: pan-y;
        }
        
        /* Notification Toast */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1060;
        }
        
        .toast-custom {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e2e8f0;
            min-width: 300px;
        }
        
        .toast-custom.success {
            border-left: 4px solid #10b981;
        }
        
        .toast-custom.error {
            border-left: 4px solid #ef4444;
        }
        
        .toast-custom.warning {
            border-left: 4px solid #f59e0b;
        }
    </style>
</head>
<body>
    <?php echo $loader->loadComponent('navbar', 'Public'); ?>
    
    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="text-center">
            <div class="loading-spinner"></div>
            <div class="mt-2 text-muted">İşlem yapılıyor...</div>
        </div>
    </div>
    
    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>
    
    <main class="cart-main">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <h1 class="cart-title">
                        <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.42 7H6"></path>
                        </svg>
                        Alışveriş Sepetim
                        <span class="badge bg-primary rounded-pill" id="cart-item-count">0</span>
                    </h1>
                </div>
            </div>
            
            <div id="cart-content">
                <!-- Cart content will be loaded here -->
            </div>
        </div>
    </main>
    
    <!-- Checkout Modal -->
    <div class="modal fade checkout-modal" id="checkoutModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Ödeme Seçeneği</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="checkout-option" onclick="selectCheckoutOption('guest')">
                        <div class="checkout-option-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <path d="M20 8v6"></path>
                                <path d="M23 11h-6"></path>
                            </svg>
                            Misafir Olarak Devam Et
                        </div>
                        <div class="checkout-option-desc">
                            Üye olmadan hızlı satın alma işlemi gerçekleştirin
                        </div>
                    </div>
                    
                    <div class="checkout-option" onclick="selectCheckoutOption('member')">
                        <div class="checkout-option-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Üye Girişi Yap
                        </div>
                        <div class="checkout-option-desc">
                            Üye avantajlarınızdan faydalanın ve siparişlerinizi takip edin
                        </div>
                    </div>
                    
                    <div class="checkout-option" onclick="selectCheckoutOption('register')">
                        <div class="checkout-option-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <path d="M20 8v6"></path>
                                <path d="M23 11h-6"></path>
                            </svg>
                            Yeni Üye Ol
                        </div>
                        <div class="checkout-option-desc">
                            Ücretsiz üyelik oluşturun ve özel tekliflerden haberdar olun
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <?php echo $loader->loadComponent('footer', 'Public'); ?>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../components/js/component-loader.js"></script>
    <script src="js/main.js"></script>
    
    <script>
        // Global variables
        let cart = {
            items: [],
            coupon: null,
            shippingThreshold: 500,
            shippingCost: 29.90
        };
        
        let touchStartX = 0;
        let touchCurrentX = 0;
        let currentSwipeItem = null;
        
        // Initialize cart on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadCartFromStorage();
            renderCart();
            updateCartCount();
            initializeSwipeGestures();
        });
        
        // Load cart from localStorage
        function loadCartFromStorage() {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                cart.items = JSON.parse(storedCart);
            }
            
            const storedCoupon = localStorage.getItem('appliedCoupon');
            if (storedCoupon) {
                cart.coupon = JSON.parse(storedCoupon);
            }
        }
        
        // Save cart to localStorage
        function saveCartToStorage() {
            localStorage.setItem('cart', JSON.stringify(cart.items));
            if (cart.coupon) {
                localStorage.setItem('appliedCoupon', JSON.stringify(cart.coupon));
            } else {
                localStorage.removeItem('appliedCoupon');
            }
        }
        
        // Render cart content
        function renderCart() {
            const cartContent = document.getElementById('cart-content');
            const itemCount = document.getElementById('cart-item-count');
            
            itemCount.textContent = cart.items.length;
            
            if (cart.items.length === 0) {
                cartContent.innerHTML = renderEmptyCart();
                return;
            }
            
            const subtotal = calculateSubtotal();
            const discount = calculateDiscount(subtotal);
            const shipping = calculateShipping(subtotal - discount);
            const total = subtotal - discount + shipping;
            
            cartContent.innerHTML = `
                <div class="cart-layout">
                    <div class="cart-items-section">
                        ${cart.items.map((item, index) => renderCartItem(item, index)).join('')}
                    </div>
                    
                    <div class="cart-summary">
                        ${renderCartSummary(subtotal, discount, shipping, total)}
                    </div>
                </div>
            `;
            
            // Re-initialize swipe gestures after rendering
            setTimeout(initializeSwipeGestures, 100);
        }
        
        // Render empty cart
        function renderEmptyCart() {
            return `
                <div class="empty-cart">
                    <svg class="empty-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="8" cy="21" r="1"></circle>
                        <circle cx="19" cy="21" r="1"></circle>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.42 7H6"></path>
                    </svg>
                    <h2 class="empty-cart-title">Sepetiniz Boş</h2>
                    <p class="empty-cart-text">
                        Henüz sepetinizde ürün bulunmuyor.<br>
                        Alışverişe başlamak için ürünlerimize göz atın.
                    </p>
                    <a href="products.php" class="shop-now-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20.42 7H6"></path>
                        </svg>
                        Ürünleri Keşfet
                    </a>
                </div>
            `;
        }
        
        // Render individual cart item
        function renderCartItem(item, index) {
            return `
                <div class="cart-item-card" data-item-id="${item.id}" data-index="${index}">
                    <div class="cart-item-delete" onclick="confirmRemoveItem(${item.id})">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </div>
                    
                    <div class="cart-item-content">
                        <img src="${item.image || 'https://via.placeholder.com/120x120?text=Ürün'}" 
                             alt="${item.name}" 
                             class="cart-item-image"
                             onerror="this.src='https://via.placeholder.com/120x120?text=Ürün'">
                        
                        <div class="cart-item-details">
                            <h6 class="cart-item-name">${item.name}</h6>
                            <div class="cart-item-price">${formatPrice(item.price)}</div>
                            ${item.sku ? `<div class="cart-item-sku">SKU: ${item.sku}</div>` : ''}
                            
                            <div class="quantity-container">
                                <div class="quantity-controls">
                                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </button>
                                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" 
                                           onchange="updateQuantity(${item.id}, this.value)" readonly>
                                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})" ${item.quantity >= 10 ? 'disabled' : ''}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                    </button>
                                </div>
                                
                                <button class="remove-item-btn" onclick="confirmRemoveItem(${item.id})" title="Sepetten Kaldır">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3,6 5,6 21,6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Render cart summary
        function renderCartSummary(subtotal, discount, shipping, total) {
            const shippingRemaining = cart.shippingThreshold - (subtotal - discount);
            
            return `
                <h3 class="summary-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-4l-3-3-3 3"></path>
                        <path d="M9 21V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12"></path>
                    </svg>
                    Sipariş Özeti
                </h3>
                
                <div class="summary-row">
                    <span>Ara Toplam (${cart.items.length} ürün):</span>
                    <span class="fw-bold">${formatPrice(subtotal)}</span>
                </div>
                
                ${discount > 0 ? `
                    <div class="summary-row text-success">
                        <span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            İndirim (${cart.coupon?.code}):
                        </span>
                        <span class="fw-bold">-${formatPrice(discount)}</span>
                    </div>
                ` : ''}
                
                <div class="summary-row">
                    <span>Kargo:</span>
                    <span class="fw-bold ${shipping === 0 ? 'text-success' : ''}">${shipping === 0 ? 'Ücretsiz' : formatPrice(shipping)}</span>
                </div>
                
                ${shippingRemaining > 0 ? `
                    <div class="shipping-notice">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                        <strong>${formatPrice(shippingRemaining)}</strong> değerinde daha ürün ekleyerek ücretsiz kargoya ulaşın!
                    </div>
                ` : shipping === 0 ? `
                    <div class="shipping-notice success">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                            <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        Tebrikler! Ücretsiz kargo kazandınız!
                    </div>
                ` : ''}
                
                ${renderCouponSection()}
                
                <div class="summary-row total">
                    <span>Toplam:</span>
                    <span>${formatPrice(total)}</span>
                </div>
                
                <div class="action-buttons">
                    <button class="checkout-btn" onclick="proceedToCheckout()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Güvenli Ödeme (${formatPrice(total)})
                    </button>
                    
                    <a href="products.php" class="continue-shopping-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        Alışverişe Devam Et
                    </a>
                </div>
            `;
        }
        
        // Render coupon section
        function renderCouponSection() {
            if (cart.coupon) {
                return `
                    <div class="coupon-applied">
                        <span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            Kupon kodu uygulandı: <strong>${cart.coupon.code}</strong>
                        </span>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeCoupon()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `;
            }
            
            return `
                <div class="coupon-section">
                    <div class="d-flex align-items-center mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                            <path d="M21 12v7a2 2 0 0 1-2 2l-1-1v-6a2 2 0 0 0-2-2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6z"></path>
                            <path d="M12 3v18"></path>
                        </svg>
                        <strong>Kupon Kodu</strong>
                    </div>
                    <div class="coupon-input-group">
                        <input type="text" class="coupon-input" id="couponInput" placeholder="Kupon kodunu girin" maxlength="20">
                        <button class="coupon-btn" onclick="applyCoupon()">
                            Uygula
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Calculate functions
        function calculateSubtotal() {
            return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
        
        function calculateDiscount(subtotal) {
            if (!cart.coupon) return 0;
            
            if (cart.coupon.type === 'percentage') {
                return (subtotal * cart.coupon.value) / 100;
            } else if (cart.coupon.type === 'fixed') {
                return Math.min(cart.coupon.value, subtotal);
            }
            
            return 0;
        }
        
        function calculateShipping(subtotal) {
            return subtotal >= cart.shippingThreshold ? 0 : cart.shippingCost;
        }
        
        // Cart operations
        function updateQuantity(productId, newQuantity) {
            newQuantity = parseInt(newQuantity);
            
            if (newQuantity < 1 || newQuantity > 10) {
                showToast('Geçersiz miktar', 'error');
                return;
            }
            
            const item = cart.items.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                saveCartToStorage();
                renderCart();
                updateCartCount();
                showToast('Miktar güncellendi', 'success');
            }
        }
        
        function confirmRemoveItem(productId) {
            if (window.innerWidth < 768) {
                // On mobile, just remove directly (since swipe gesture might be used)
                removeItem(productId);
            } else {
                // On desktop, show confirmation
                if (confirm('Bu ürünü sepetten kaldırmak istediğinizden emin misiniz?')) {
                    removeItem(productId);
                }
            }
        }
        
        function removeItem(productId) {
            const itemIndex = cart.items.findIndex(item => item.id === productId);
            if (itemIndex > -1) {
                const removedItem = cart.items.splice(itemIndex, 1)[0];
                saveCartToStorage();
                renderCart();
                updateCartCount();
                showToast(`${removedItem.name} sepetten kaldırıldı`, 'success');
            }
        }
        
        // Coupon functions
        function applyCoupon() {
            const couponCode = document.getElementById('couponInput').value.trim().toUpperCase();
            
            if (!couponCode) {
                showToast('Kupon kodu girin', 'error');
                return;
            }
            
            // Mock coupon validation (replace with actual API call)
            const validCoupons = {
                'WELCOME10': { code: 'WELCOME10', type: 'percentage', value: 10, minAmount: 100 },
                'SAVE20': { code: 'SAVE20', type: 'fixed', value: 20, minAmount: 200 },
                'FREESHIP': { code: 'FREESHIP', type: 'shipping', value: 0, minAmount: 0 }
            };
            
            const coupon = validCoupons[couponCode];
            if (!coupon) {
                showToast('Geçersiz kupon kodu', 'error');
                return;
            }
            
            const subtotal = calculateSubtotal();
            if (subtotal < coupon.minAmount) {
                showToast(`Bu kupon en az ${formatPrice(coupon.minAmount)} değerinde sipariş için geçerlidir`, 'error');
                return;
            }
            
            cart.coupon = coupon;
            saveCartToStorage();
            renderCart();
            showToast('Kupon başarıyla uygulandı!', 'success');
        }
        
        function removeCoupon() {
            cart.coupon = null;
            saveCartToStorage();
            renderCart();
            showToast('Kupon kaldırıldı', 'success');
        }
        
        // Checkout functions
        function proceedToCheckout() {
            if (cart.items.length === 0) {
                showToast('Sepetinizde ürün bulunmuyor', 'error');
                return;
            }
            
            const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
            checkoutModal.show();
        }
        
        function selectCheckoutOption(option) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            modal.hide();
            
            showLoading();
            
            setTimeout(() => {
                hideLoading();
                
                switch (option) {
                    case 'guest':
                        showToast('Misafir ödeme sayfasına yönlendiriliyorsunuz...', 'success');
                        // Redirect to guest checkout
                        setTimeout(() => window.location.href = 'checkout.php?type=guest', 1500);
                        break;
                    case 'member':
                        showToast('Giriş sayfasına yönlendiriliyorsunuz...', 'success');
                        // Redirect to login
                        setTimeout(() => window.location.href = 'auth.php?action=login', 1500);
                        break;
                    case 'register':
                        showToast('Kayıt sayfasına yönlendiriliyorsunuz...', 'success');
                        // Redirect to register
                        setTimeout(() => window.location.href = 'auth.php?action=register', 1500);
                        break;
                }
            }, 1000);
        }
        
        // Swipe gestures for mobile
        function initializeSwipeGestures() {
            const cartItems = document.querySelectorAll('.cart-item-card');
            
            cartItems.forEach(item => {
                item.addEventListener('touchstart', handleTouchStart, { passive: false });
                item.addEventListener('touchmove', handleTouchMove, { passive: false });
                item.addEventListener('touchend', handleTouchEnd, { passive: false });
            });
        }
        
        function handleTouchStart(e) {
            if (window.innerWidth >= 768) return; // Only on mobile
            
            touchStartX = e.touches[0].clientX;
            currentSwipeItem = e.currentTarget;
        }
        
        function handleTouchMove(e) {
            if (!currentSwipeItem || window.innerWidth >= 768) return;
            
            touchCurrentX = e.touches[0].clientX;
            const deltaX = touchStartX - touchCurrentX;
            
            if (deltaX > 20) { // Swiping left
                currentSwipeItem.style.transform = `translateX(-${Math.min(deltaX, 80)}px)`;
                
                if (deltaX > 80) {
                    currentSwipeItem.classList.add('swipe-active');
                }
            } else if (deltaX < -20) { // Swiping right (reset)
                currentSwipeItem.style.transform = 'translateX(0)';
                currentSwipeItem.classList.remove('swipe-active');
            }
        }
        
        function handleTouchEnd(e) {
            if (!currentSwipeItem || window.innerWidth >= 768) return;
            
            const deltaX = touchStartX - touchCurrentX;
            
            if (deltaX > 80) {
                // Keep swiped
                currentSwipeItem.style.transform = 'translateX(-80px)';
                currentSwipeItem.classList.add('swipe-active');
            } else {
                // Reset
                currentSwipeItem.style.transform = 'translateX(0)';
                currentSwipeItem.classList.remove('swipe-active');
            }
            
            currentSwipeItem = null;
            touchStartX = 0;
            touchCurrentX = 0;
        }
        
        // Utility functions
        function formatPrice(price) {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 2
            }).format(price);
        }
        
        function updateCartCount() {
            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            const cartCountElements = document.querySelectorAll('#cart-count, [data-cart-count]');
            cartCountElements.forEach(el => el.textContent = totalItems);
        }
        
        function showLoading() {
            document.getElementById('loadingOverlay').style.display = 'flex';
        }
        
        function hideLoading() {
            document.getElementById('loadingOverlay').style.display = 'none';
        }
        
        function showToast(message, type = 'success') {
            const toastContainer = document.getElementById('toastContainer');
            const toastId = 'toast-' + Date.now();
            
            const toastHTML = `
                <div class="toast toast-custom ${type}" id="${toastId}" role="alert">
                    <div class="toast-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                            ${type === 'success' ? '<path d="M20 6L9 17l-5-5"></path>' : 
                              type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' :
                              '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'}
                        </svg>
                        <strong class="me-auto">${type === 'success' ? 'Başarılı' : type === 'error' ? 'Hata' : 'Uyarı'}</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                </div>
            `;
            
            toastContainer.insertAdjacentHTML('beforeend', toastHTML);
            
            const toastElement = document.getElementById(toastId);
            const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
            toast.show();
            
            // Remove toast element after it's hidden
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                // Reset any active swipes on desktop
                document.querySelectorAll('.cart-item-card').forEach(item => {
                    item.style.transform = 'translateX(0)';
                    item.classList.remove('swipe-active');
                });
            }
        });
        
        // Demo function to add product to cart (for testing)
        function addTestProduct() {
            const testProduct = {
                id: Date.now(),
                name: 'Test Oyuncak Araba',
                price: 89.90,
                quantity: 1,
                image: 'https://via.placeholder.com/120x120?text=Test+Ürün',
                sku: 'TEST-001'
            };
            
            cart.items.push(testProduct);
            saveCartToStorage();
            renderCart();
            updateCartCount();
            showToast('Test ürün sepete eklendi', 'success');
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any open modals
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(modal => {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                });
            }
        });
    </script>
</body>
</html>