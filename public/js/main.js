/**
 * Gürbüz Oyuncak - Ana JavaScript Dosyası
 */

// API Base URL
const API_BASE_URL = '../backend/api';

// Sepet işlemleri
class Cart {
    constructor() {
        this.items = this.loadCart();
    }
    
    loadCart() {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : [];
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }
    
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.urun_adi,
                slug: product.seo_url,
                price: product.fiyat,
                image: product.ana_gorsel,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.showNotification('Ürün sepete eklendi!', 'success');
    }
    
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }
    
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
            }
        }
    }
    
    getItems() {
        return this.items;
    }
    
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    clear() {
        this.items = [];
        this.saveCart();
    }
    
    updateCartCount() {
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            const count = this.getItemCount();
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        // Basit bildirim sistemi
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background-color: ${type === 'success' ? '#00BFA5' : '#1E88E5'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global sepet instance
const cart = new Cart();

// Sepet sayısını güncelle
function updateCartCount() {
    cart.updateCartCount();
}

// Ürün kartı oluştur
function createProductCard(product) {
    const hasDiscount = product.kampanya_fiyati && product.kampanya_fiyati < product.fiyat;
    const discountPercent = hasDiscount 
        ? Math.round(((product.fiyat - product.kampanya_fiyati) / product.fiyat) * 100)
        : 0;
    
    const finalPrice = hasDiscount ? product.kampanya_fiyati : product.fiyat;
    const imageSrc = product.ana_gorsel || 'images/placeholder.png';
    
    return `
        <div class="product-card">
            <div class="product-image">
                <a href="product-detail.html?id=${product.id}">
                    <img src="${imageSrc}" alt="${product.urun_adi}" onerror="this.src='images/placeholder.png'">
                </a>
                ${product.yeni_urun ? '<div class="product-badge badge-new">Yeni</div>' : ''}
                ${product.kampanyali || hasDiscount ? '<div class="product-badge badge-sale">-' + discountPercent + '%</div>' : ''}
            </div>
            <div class="product-content">
                <div class="product-category">${product.kategori_adi || 'Kategori'}</div>
                <h3 class="product-title">
                    <a href="product-detail.html?id=${product.id}">${product.urun_adi}</a>
                </h3>
                <div class="product-price">
                    <span class="current-price">${formatPrice(finalPrice)}</span>
                    ${hasDiscount ? `<span class="old-price">${formatPrice(product.fiyat)}</span>` : ''}
                </div>
                <button class="btn btn-primary add-to-cart-btn" onclick="addToCart(${product.id})" 
                        ${product.stok_miktari <= 0 ? 'disabled' : ''}>
                    ${product.stok_miktari > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                </button>
            </div>
        </div>
    `;
}

// Fiyat formatla
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2
    }).format(price);
}

// Yıldızları oluştur
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    if (hasHalfStar) {
        stars += '½';
    }
    for (let i = Math.ceil(rating); i < 5; i++) {
        stars += '☆';
    }
    
    return stars;
}

// Sepete ekle
async function addToCart(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/urunler.php/${productId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            cart.addItem(data.data, 1);
        } else {
            cart.showNotification('Ürün bulunamadı.', 'error');
        }
    } catch (error) {
        console.error('Sepete eklerken hata:', error);
        cart.showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
}

// Arama formu işle
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                window.location.href = `products.html?arama=${encodeURIComponent(searchTerm)}`;
            }
        });
    }
    
    // Animasyonlar için CSS ekle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// URL parametrelerini al
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Ürünleri yükle (ürün listesi sayfası için)
async function loadProducts(filters = {}) {
    const container = document.getElementById('products-container');
    const paginationContainer = document.getElementById('pagination');
    
    if (!container) return;
    
    try {
        // Loading göster
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><p style="color: #6B7280;">Ürünler yükleniyor...</p></div>';
        
        // Query string oluştur
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/urunler.php?${queryParams}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(product => createProductCard(product)).join('');
            
            // Sayfalama oluştur
            if (paginationContainer && data.total_pages > 1) {
                createPagination(data.page, data.total_pages, paginationContainer);
            }
        } else {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><p style="color: #6B7280;">Ürün bulunamadı.</p></div>';
        }
    } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><p style="color: #C62828;">Ürünler yüklenirken bir hata oluştu.</p></div>';
    }
}

// Sayfalama oluştur
function createPagination(currentPage, totalPages, container) {
    let html = '<div class="pagination">';
    
    // Önceki sayfa
    if (currentPage > 1) {
        html += `<a href="#" class="pagination-link" data-page="${currentPage - 1}">« Önceki</a>`;
    }
    
    // Sayfa numaraları
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<span class="pagination-link active">${i}</span>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<a href="#" class="pagination-link" data-page="${i}">${i}</a>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Sonraki sayfa
    if (currentPage < totalPages) {
        html += `<a href="#" class="pagination-link" data-page="${currentPage + 1}">Sonraki »</a>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // Sayfa linklerine tıklama event ekle
    container.querySelectorAll('.pagination-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                const url = new URL(window.location);
                url.searchParams.set('page', page);
                window.location.href = url.toString();
            }
        });
    });
}
