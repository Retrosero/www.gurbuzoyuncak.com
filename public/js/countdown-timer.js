/**
 * Countdown Timer Bileşenleri
 * Gürbüz Oyuncak E-Ticaret Sistemi
 * Ürün kartları ve banner countdown'ları için
 */

class CountdownTimer {
    constructor(element, endDate, options = {}) {
        this.element = element;
        this.endDate = new Date(endDate);
        this.options = {
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            labels: {
                days: 'Gün',
                hours: 'Saat',
                minutes: 'Dakika',
                seconds: 'Saniye'
            },
            onExpire: null,
            updateInterval: 1000,
            ...options
        };
        
        this.interval = null;
        this.isExpired = false;
        
        this.init();
    }
    
    init() {
        this.createTimerStructure();
        this.startTimer();
    }
    
    createTimerStructure() {
        let html = '<div class="countdown-timer">';
        
        if (this.options.showDays) {
            html += '<div class="time-unit"><span class="time-value" data-unit="days">00</span><span class="time-label">' + this.options.labels.days + '</span></div>';
        }
        if (this.options.showHours) {
            html += '<div class="time-unit"><span class="time-value" data-unit="hours">00</span><span class="time-label">' + this.options.labels.hours + '</span></div>';
        }
        if (this.options.showMinutes) {
            html += '<div class="time-unit"><span class="time-value" data-unit="minutes">00</span><span class="time-label">' + this.options.labels.minutes + '</span></div>';
        }
        if (this.options.showSeconds) {
            html += '<div class="time-unit"><span class="time-value" data-unit="seconds">00</span><span class="time-label">' + this.options.labels.seconds + '</span></div>';
        }
        
        html += '</div>';
        this.element.innerHTML = html;
    }
    
    calculateTimeRemaining() {
        const now = new Date().getTime();
        const distance = this.endDate.getTime() - now;
        
        if (distance < 0) {
            return {
                expired: true,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }
        
        return {
            expired: false,
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };
    }
    
    updateDisplay() {
        const timeData = this.calculateTimeRemaining();
        
        if (timeData.expired && !this.isExpired) {
            this.handleExpiration();
            return;
        }
        
        // Zamanları güncelle
        if (this.options.showDays) {
            const daysElement = this.element.querySelector('[data-unit="days"]');
            if (daysElement) daysElement.textContent = this.padZero(timeData.days);
        }
        
        if (this.options.showHours) {
            const hoursElement = this.element.querySelector('[data-unit="hours"]');
            if (hoursElement) hoursElement.textContent = this.padZero(timeData.hours);
        }
        
        if (this.options.showMinutes) {
            const minutesElement = this.element.querySelector('[data-unit="minutes"]');
            if (minutesElement) minutesElement.textContent = this.padZero(timeData.minutes);
        }
        
        if (this.options.showSeconds) {
            const secondsElement = this.element.querySelector('[data-unit="seconds"]');
            if (secondsElement) secondsElement.textContent = this.padZero(timeData.seconds);
        }
    }
    
    padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    startTimer() {
        this.updateDisplay(); // İlk güncelleme
        this.interval = setInterval(() => {
            this.updateDisplay();
        }, this.options.updateInterval);
    }
    
    stopTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    handleExpiration() {
        this.isExpired = true;
        this.stopTimer();
        this.element.classList.add('expired');
        
        if (this.options.onExpire && typeof this.options.onExpire === 'function') {
            this.options.onExpire();
        }
    }
    
    destroy() {
        this.stopTimer();
        this.element.innerHTML = '';
    }
}

// Product Card Countdown Timer
class ProductCountdownTimer extends CountdownTimer {
    constructor(element, endDate, campaignData = {}) {
        const options = {
            showDays: false,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            labels: {
                hours: 'Sa',
                minutes: 'Dk',
                seconds: 'Sn'
            },
            onExpire: () => {
                this.handleProductExpiration();
            }
        };
        
        super(element, endDate, options);
        this.campaignData = campaignData;
    }
    
    createTimerStructure() {
        let html = '<div class="product-countdown-timer">';
        html += '<div class="countdown-header">⏰ Kampanya Bitiyor!</div>';
        html += '<div class="countdown-display">';
        
        if (this.options.showHours) {
            html += '<span class="time-unit"><span class="time-value" data-unit="hours">00</span><span class="time-label">' + this.options.labels.hours + '</span></span>';
        }
        if (this.options.showMinutes) {
            html += '<span class="time-separator">:</span>';
            html += '<span class="time-unit"><span class="time-value" data-unit="minutes">00</span><span class="time-label">' + this.options.labels.minutes + '</span></span>';
        }
        if (this.options.showSeconds) {
            html += '<span class="time-separator">:</span>';
            html += '<span class="time-unit"><span class="time-value" data-unit="seconds">00</span><span class="time-label">' + this.options.labels.seconds + '</span></span>';
        }
        
        html += '</div></div>';
        this.element.innerHTML = html;
    }
    
    handleProductExpiration() {
        // Ürün kartındaki indirim bilgisini kaldır
        const productCard = this.element.closest('.product-card');
        if (productCard) {
            const discountBadge = productCard.querySelector('.discount-badge');
            const oldPrice = productCard.querySelector('.old-price');
            
            if (discountBadge) discountBadge.style.display = 'none';
            if (oldPrice) oldPrice.style.display = 'none';
            
            // "Süresi Doldu" mesajı göster
            this.element.innerHTML = '<div class="countdown-expired">Kampanya Sona Erdi</div>';
        }
    }
}

// Banner Countdown Timer
class BannerCountdownTimer extends CountdownTimer {
    constructor(element, endDate, bannerData = {}) {
        const options = {
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            labels: {
                days: 'GÜN',
                hours: 'SAAT',
                minutes: 'DK',
                seconds: 'SN'
            },
            onExpire: () => {
                this.handleBannerExpiration();
            }
        };
        
        super(element, endDate, options);
        this.bannerData = bannerData;
    }
    
    createTimerStructure() {
        let html = '<div class="banner-countdown-timer">';
        html += '<div class="countdown-title">Kampanya Bitiyor!</div>';
        html += '<div class="countdown-units">';
        
        if (this.options.showDays) {
            html += '<div class="time-unit"><span class="time-value" data-unit="days">00</span><span class="time-label">' + this.options.labels.days + '</span></div>';
        }
        if (this.options.showHours) {
            html += '<div class="time-unit"><span class="time-value" data-unit="hours">00</span><span class="time-label">' + this.options.labels.hours + '</span></div>';
        }
        if (this.options.showMinutes) {
            html += '<div class="time-unit"><span class="time-value" data-unit="minutes">00</span><span class="time-label">' + this.options.labels.minutes + '</span></div>';
        }
        if (this.options.showSeconds) {
            html += '<div class="time-unit"><span class="time-value" data-unit="seconds">00</span><span class="time-label">' + this.options.labels.seconds + '</span></div>';
        }
        
        html += '</div></div>';
        this.element.innerHTML = html;
    }
    
    handleBannerExpiration() {
        // Banner'ı gizle veya farklı bir mesaj göster
        const banner = this.element.closest('.countdown-banner');
        if (banner) {
            banner.style.opacity = '0.5';
            this.element.innerHTML = '<div class="countdown-expired">Bu kampanya sona ermiştir</div>';
        }
    }
}

// Countdown Manager - Sayfa üzerindeki tüm countdown'ları yönet
class CountdownManager {
    constructor() {
        this.timers = [];
        this.init();
    }
    
    init() {
        this.initProductCountdowns();
        this.initBannerCountdowns();
        this.setupAutoRefresh();
    }
    
    initProductCountdowns() {
        const productCountdownElements = document.querySelectorAll('[data-countdown-product]');
        
        productCountdownElements.forEach(element => {
            const endDate = element.dataset.countdownEnd;
            const campaignData = {
                campaignId: element.dataset.campaignId || null,
                discountType: element.dataset.discountType || 'percentage',
                discountValue: element.dataset.discountValue || 0
            };
            
            if (endDate) {
                const timer = new ProductCountdownTimer(element, endDate, campaignData);
                this.timers.push(timer);
            }
        });
    }
    
    initBannerCountdowns() {
        const bannerCountdownElements = document.querySelectorAll('[data-countdown-banner]');
        
        bannerCountdownElements.forEach(element => {
            const endDate = element.dataset.countdownEnd;
            const bannerData = {
                bannerId: element.dataset.bannerId || null,
                title: element.dataset.bannerTitle || '',
                text: element.dataset.bannerText || ''
            };
            
            if (endDate) {
                const timer = new BannerCountdownTimer(element, endDate, bannerData);
                this.timers.push(timer);
            }
        });
    }
    
    setupAutoRefresh() {
        // Her 5 dakikada bir sayfa verilerini kontrol et
        setInterval(() => {
            this.checkForUpdatedCampaigns();
        }, 5 * 60 * 1000);
    }
    
    checkForUpdatedCampaigns() {
        // AJAX ile güncel kampanya verilerini kontrol et
        fetch('/backend/api/campaigns.php?action=check_active')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.updated) {
                    // Sayfa verilerini güncelle
                    this.refreshTimers();
                }
            })
            .catch(error => {
                console.log('Kampanya kontrolü hatası:', error);
            });
    }
    
    refreshTimers() {
        // Mevcut timer'ları temizle
        this.destroyAllTimers();
        
        // Yeni timer'ları başlat
        this.init();
    }
    
    destroyAllTimers() {
        this.timers.forEach(timer => {
            timer.destroy();
        });
        this.timers = [];
    }
    
    addTimer(timer) {
        this.timers.push(timer);
    }
    
    removeTimer(timer) {
        const index = this.timers.indexOf(timer);
        if (index > -1) {
            this.timers.splice(index, 1);
            timer.destroy();
        }
    }
}

// Global countdown manager instance
let countdownManager;

// DOM yüklendiğinde countdown manager'ı başlat
document.addEventListener('DOMContentLoaded', function() {
    countdownManager = new CountdownManager();
});

// Utility Functions
const CountdownUtils = {
    // Yeni ürün kartı eklendiğinde countdown ekle
    addProductCountdown: function(productElement, endDate, campaignData) {
        const countdownElement = productElement.querySelector('[data-countdown-product]');
        if (countdownElement && endDate) {
            const timer = new ProductCountdownTimer(countdownElement, endDate, campaignData);
            if (countdownManager) {
                countdownManager.addTimer(timer);
            }
            return timer;
        }
        return null;
    },
    
    // Banner countdown ekle
    addBannerCountdown: function(bannerElement, endDate, bannerData) {
        const countdownElement = bannerElement.querySelector('[data-countdown-banner]');
        if (countdownElement && endDate) {
            const timer = new BannerCountdownTimer(countdownElement, endDate, bannerData);
            if (countdownManager) {
                countdownManager.addTimer(timer);
            }
            return timer;
        }
        return null;
    },
    
    // Tarihi local timezone'a çevir
    convertToLocalTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR');
    },
    
    // Kalan süreyi hesapla
    getTimeRemaining: function(endDate) {
        const now = new Date().getTime();
        const end = new Date(endDate).getTime();
        const distance = end - now;
        
        if (distance < 0) {
            return { expired: true };
        }
        
        return {
            expired: false,
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            totalSeconds: Math.floor(distance / 1000)
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CountdownTimer,
        ProductCountdownTimer,
        BannerCountdownTimer,
        CountdownManager,
        CountdownUtils
    };
}