/**
 * Component Loader JS - Frontend Component Yönetimi
 * Mobile-first, touch-friendly, responsive
 */

class ComponentManager {
    constructor() {
        this.components = new Map();
        this.init();
    }

    init() {
        // DOM yüklendikten sonra component'leri başlat
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        this.initMobileMenu();
        this.initSidebar();
        this.initBottomNav();
        this.initTouchGestures();
        this.initLazyLoading();
        this.updateCartCount();
    }

    /**
     * Mobile Menu Component
     */
    initMobileMenu() {
        const toggle = document.getElementById('mobile-menu-toggle');
        const overlay = document.getElementById('mobile-menu-overlay');
        const close = document.getElementById('mobile-menu-close');
        const menu = document.querySelector('.mobile-menu');

        if (!toggle || !overlay) return;

        // Menüyü aç
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Animation
            setTimeout(() => {
                if (menu) menu.classList.add('active');
            }, 10);
        });

        // Menüyü kapat
        const closeMenu = () => {
            if (menu) menu.classList.remove('active');
            setTimeout(() => {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }, 300);
        };

        if (close) close.addEventListener('click', closeMenu);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeMenu();
        });

        // ESC tuşu ile kapat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    /**
     * Sidebar Component (Admin & Bayi)
     */
    initSidebar() {
        const toggle = document.getElementById('sidebar-toggle');
        const close = document.getElementById('sidebar-close');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (!sidebar || !overlay) return;

        // Sidebar'ı aç
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        // Sidebar'ı kapat
        const closeSidebar = () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (close) close.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
    }

    /**
     * Bottom Navigation
     */
    initBottomNav() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (!bottomNav) return;

        // Aktif sayfa işaretle
        const currentPath = window.location.pathname;
        const navItems = bottomNav.querySelectorAll('.bottom-nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href)) {
                item.classList.add('active');
            }
        });

        // Arama toggle
        const searchToggle = bottomNav.querySelector('.search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', (e) => {
                e.preventDefault();
                const mobileSearch = document.querySelector('.mobile-search');
                if (mobileSearch) {
                    mobileSearch.classList.toggle('active');
                    const input = mobileSearch.querySelector('input');
                    if (input) input.focus();
                }
            });
        }
    }

    /**
     * Touch Gestures
     */
    initTouchGestures() {
        // Swipe gesture for mobile menu
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        this.handleSwipe = () => {
            const swipeThreshold = 100;
            const diff = touchEndX - touchStartX;

            // Sağa kaydırma - menüyü aç
            if (diff > swipeThreshold && touchStartX < 50) {
                const overlay = document.getElementById('mobile-menu-overlay');
                if (overlay && !overlay.classList.contains('active')) {
                    document.getElementById('mobile-menu-toggle')?.click();
                }
            }

            // Sola kaydırma - menüyü kapat
            if (diff < -swipeThreshold) {
                const overlay = document.getElementById('mobile-menu-overlay');
                if (overlay && overlay.classList.contains('active')) {
                    document.getElementById('mobile-menu-close')?.click();
                }
            }
        };

        // Pull to refresh (simüle edilmiş)
        let pullStartY = 0;
        let isPulling = false;

        window.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                pullStartY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            const pullDistance = e.touches[0].clientY - pullStartY;
            if (pullDistance > 100) {
                // Pull to refresh indicator göster
                this.showPullRefreshIndicator();
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            if (isPulling) {
                isPulling = false;
                this.hidePullRefreshIndicator();
            }
        });
    }

    showPullRefreshIndicator() {
        // Refresh indicator implementation
        console.log('Pull to refresh triggered');
    }

    hidePullRefreshIndicator() {
        // Hide refresh indicator
    }

    /**
     * Lazy Loading for Images
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                        }
                        
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    }

    /**
     * Sepet sayısını güncelle
     */
    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        
        // Header cart count
        const cartCountElements = document.querySelectorAll('#cart-count, #bottom-cart-count, #sidebar-cart-count');
        cartCountElements.forEach(el => {
            if (el) el.textContent = count;
        });
    }

    /**
     * Toast Notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Loading Spinner
     */
    showLoading() {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.id = 'loading-overlay';
        loader.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.remove();
    }
}

// Global instance
window.ComponentManager = new ComponentManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentManager;
}
