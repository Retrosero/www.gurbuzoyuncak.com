/**
 * Gelişmiş Sepet Yönetimi
 * Kupon, Bakiye, Puan, Kampanya sistemleri entegrasyonu
 */

class AdvancedCart {
    constructor() {
        this.cart = this.loadCart();
        this.currentUser = this.loadUser();
        this.coupon = null;
        this.campaign = null;
        this.pointsToUse = 0;
        this.useBalance = false;
        this.init();
    }
    
    loadCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }
    
    loadUser() {
        // Session'dan kullanıcı bilgisini al
        const user = sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    
    init() {
        this.renderCart();
        this.loadUserRewards();
        this.loadUserBalance();
        this.checkAvailableCampaigns();
    }
    
    // Sepeti render et
    renderCart() {
        const container = document.getElementById('cartItems');
        
        if (!this.cart || this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Sepetiniz Boş</h2>
                    <p>Alışverişe başlamak için ürünleri sepete ekleyin</p>
                    <a href="products.html" class="btn btn-primary">Alışverişe Başla</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image || 'images/placeholder.jpg'}" class="cart-item-image" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} TL</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           onchange="cart.updateQuantity(${index}, parseInt(this.value))">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-remove">
                    <span class="remove-btn" onclick="cart.removeItem(${index})">✕</span>
                </div>
            </div>
        `).join('');
        
        this.updateSummary();
    }
    
    // Sepet özetini güncelle
    async updateSummary() {
        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping(subtotal);
        let discount = 0;
        
        // Kampanya kontrolü
        if (!this.coupon) {
            await this.checkAvailableCampaigns();
        }
        
        // Kupon indirimi
        if (this.coupon) {
            discount += this.coupon.discount;
        }
        
        // Kampanya indirimi
        if (this.campaign) {
            discount += this.campaign.calculated_discount;
        }
        
        // Puan indirimi
        const pointsDiscount = this.calculatePointsDiscount();
        
        // VIP indirimi
        const vipDiscount = this.calculateVIPDiscount(subtotal);
        
        const totalDiscount = discount + pointsDiscount + vipDiscount;
        const total = Math.max(0, subtotal + shipping - totalDiscount);
        
        // Özet HTML
        const summaryHTML = `
            <h3>Sepet Özeti</h3>
            
            <div class="summary-row">
                <span>Ara Toplam</span>
                <span>${subtotal.toFixed(2)} TL</span>
            </div>
            
            ${this.renderVIPDiscount(vipDiscount)}
            ${this.renderCampaignInfo()}
            ${this.renderCouponSection()}
            ${this.renderPointsSection(pointsDiscount)}
            ${this.renderBalanceSection()}
            
            <div class="summary-row">
                <span>Kargo</span>
                <span>${shipping === 0 ? 'Ücretsiz' : shipping.toFixed(2) + ' TL'}</span>
            </div>
            
            ${totalDiscount > 0 ? `
            <div class="summary-row" style="color: var(--yesil);">
                <span>Toplam İndirim</span>
                <span>-${totalDiscount.toFixed(2)} TL</span>
            </div>
            ` : ''}
            
            <div class="summary-row total">
                <span>Toplam</span>
                <span>${total.toFixed(2)} TL</span>
            </div>
            
            <button class="btn btn-primary btn-block" onclick="cart.proceedToCheckout()">
                Siparişi Tamamla
            </button>
        `;
        
        document.getElementById('cartSummary').innerHTML = summaryHTML;
    }
    
    // VIP indirim gösterimi
    renderVIPDiscount(vipDiscount) {
        if (!this.currentUser || !vipDiscount) return '';
        
        return `
            <div class="summary-row" style="color: var(--altin);">
                <span>VIP İndirim (${this.currentUser.vip_level.name})</span>
                <span>-${vipDiscount.toFixed(2)} TL</span>
            </div>
        `;
    }
    
    // Kampanya bilgisi gösterimi
    renderCampaignInfo() {
        if (!this.campaign) return '';
        
        return `
            <div class="campaign-info">
                <span style="color: var(--yesil);">🎉 ${this.campaign.name}</span>
                <span style="color: var(--yesil);">-${this.campaign.calculated_discount.toFixed(2)} TL</span>
            </div>
        `;
    }
    
    // Kupon bölümü
    renderCouponSection() {
        if (this.coupon) {
            return `
                <div class="coupon-applied">
                    <div>
                        <strong>✓ Kupon: ${this.coupon.coupon.code}</strong>
                        <button class="btn-link" onclick="cart.removeCoupon()">Kaldır</button>
                    </div>
                    <span style="color: var(--yesil);">-${this.coupon.discount.toFixed(2)} TL</span>
                </div>
            `;
        }
        
        return `
            <div class="coupon-section">
                <input type="text" id="couponCode" placeholder="Kupon kodu girin" />
                <button class="btn btn-secondary" onclick="cart.applyCoupon()">Uygula</button>
            </div>
        `;
    }
    
    // Puan bölümü
    renderPointsSection(pointsDiscount) {
        if (!this.currentUser) return '';
        
        const availablePoints = this.currentUser.reward_points || 0;
        const maxPoints = Math.min(availablePoints, Math.floor(this.calculateSubtotal() / 0.1));
        
        return `
            <div class="points-section">
                <div class="points-header">
                    <span>Puan Kullan (${availablePoints} puan mevcut)</span>
                    <span>${pointsDiscount.toFixed(2)} TL</span>
                </div>
                <input type="range" id="pointsSlider" min="0" max="${maxPoints}" 
                       value="${this.pointsToUse}" 
                       oninput="cart.updatePoints(parseInt(this.value))" />
                <div class="points-info">
                    <span>${this.pointsToUse} puan</span>
                    <span>${(this.pointsToUse * 0.1).toFixed(2)} TL indirim</span>
                </div>
            </div>
        `;
    }
    
    // Bakiye bölümü
    renderBalanceSection() {
        if (!this.currentUser || !this.currentUser.has_balance) return '';
        
        return `
            <div class="balance-section">
                <label>
                    <input type="checkbox" id="useBalance" 
                           ${this.useBalance ? 'checked' : ''}
                           onchange="cart.toggleBalance(this.checked)" />
                    Bakiye ile öde (${this.currentUser.balance.toFixed(2)} TL mevcut)
                </label>
            </div>
        `;
    }
    
    // Kupon uygula
    async applyCoupon() {
        const code = document.getElementById('couponCode').value.trim();
        if (!code) {
            alert('Lütfen kupon kodu girin');
            return;
        }
        
        const cartTotal = this.calculateSubtotal();
        const cartItems = JSON.stringify(this.cart.map(item => ({
            product_id: item.id,
            category_id: item.category_id,
            price: item.price,
            quantity: item.quantity
        })));
        
        try {
            const response = await fetch(`/backend/api/coupons.php?action=validate&code=${code}&cart_total=${cartTotal}&customer_type=${this.currentUser?.customer_type || 'B2C'}&cart_items=${encodeURIComponent(cartItems)}&user_id=${this.currentUser?.id || ''}`);
            const result = await response.json();
            
            if (result.valid) {
                this.coupon = result;
                this.updateSummary();
                alert(`Kupon başarıyla uygulandı! ${result.discount.toFixed(2)} TL indirim kazandınız.`);
            } else {
                alert(result.error || 'Kupon geçerli değil');
            }
        } catch (error) {
            console.error('Kupon hatası:', error);
            alert('Kupon kontrol edilirken hata oluştu');
        }
    }
    
    // Kupon kaldır
    removeCoupon() {
        this.coupon = null;
        this.updateSummary();
    }
    
    // Kampanya kontrol et
    async checkAvailableCampaigns() {
        if (!this.cart || this.cart.length === 0) return;
        
        const cartTotal = this.calculateSubtotal();
        const cartItems = JSON.stringify(this.cart.map(item => ({
            product_id: item.id,
            category_id: item.category_id,
            price: item.price,
            quantity: item.quantity
        })));
        
        try {
            const response = await fetch(`/backend/api/campaigns.php?action=best&cart_total=${cartTotal}&customer_type=${this.currentUser?.customer_type || 'B2C'}&cart_items=${encodeURIComponent(cartItems)}&user_id=${this.currentUser?.id || ''}`);
            const result = await response.json();
            
            if (result.found) {
                this.campaign = result.campaign;
            }
        } catch (error) {
            console.error('Kampanya hatası:', error);
        }
    }
    
    // Kullanıcı ödül bilgilerini yükle
    async loadUserRewards() {
        if (!this.currentUser) return;
        
        try {
            const response = await fetch(`/backend/api/rewards.php?action=points&user_id=${this.currentUser.id}`);
            const data = await response.json();
            
            this.currentUser.reward_points = data.reward_points;
            this.currentUser.vip_level = data.vip_level;
        } catch (error) {
            console.error('Ödül bilgisi hatası:', error);
        }
    }
    
    // Kullanıcı bakiye bilgilerini yükle
    async loadUserBalance() {
        if (!this.currentUser || this.currentUser.customer_type === 'B2C') return;
        
        try {
            const response = await fetch(`/backend/api/balance.php?action=balance&user_id=${this.currentUser.id}`);
            const data = await response.json();
            
            this.currentUser.has_balance = true;
            this.currentUser.balance = data.current_balance;
        } catch (error) {
            console.error('Bakiye bilgisi hatası:', error);
        }
    }
    
    // Puan güncelle
    updatePoints(points) {
        this.pointsToUse = points;
        this.updateSummary();
    }
    
    // Bakiye kullanımı değiştir
    toggleBalance(use) {
        this.useBalance = use;
        this.updateSummary();
    }
    
    // Hesaplamalar
    calculateSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    calculateShipping(subtotal) {
        return subtotal >= 500 ? 0 : 29.90;
    }
    
    calculatePointsDiscount() {
        return this.pointsToUse * 0.1; // 1 puan = 0.10 TL
    }
    
    calculateVIPDiscount(subtotal) {
        if (!this.currentUser || !this.currentUser.vip_level) return 0;
        return (subtotal * this.currentUser.vip_level.discount_percentage) / 100;
    }
    
    // Sepet işlemleri
    updateQuantity(index, quantity) {
        if (quantity <= 0) {
            this.removeItem(index);
            return;
        }
        
        this.cart[index].quantity = quantity;
        this.saveCart();
        this.renderCart();
    }
    
    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.renderCart();
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    // Ödemeye geç
    proceedToCheckout() {
        // Sepet bilgilerini sessionStorage'a kaydet
        const checkoutData = {
            cart: this.cart,
            coupon: this.coupon,
            campaign: this.campaign,
            pointsToUse: this.pointsToUse,
            useBalance: this.useBalance
        };
        
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        window.location.href = 'checkout.html';
    }
}

// Global cart instance
let cart;

document.addEventListener('DOMContentLoaded', function() {
    cart = new AdvancedCart();
});
