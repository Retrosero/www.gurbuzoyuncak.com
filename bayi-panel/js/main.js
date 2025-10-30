/**
 * Bayi Panel JavaScript
 */

// DOM hazır olduğunda çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

/**
 * Sayfa başlatma
 */
function initializePage() {
    // Form validasyonu
    initFormValidation();
    
    // Sidebar menü
    initSidebarMenu();
    
    // Otomatik form gönderme önleme
    preventDoubleSubmit();
    
    // Para formatı
    initMoneyFormat();
    
    // Tarih formatı
    initDateFormat();
    
    // Tooltip'ler
    initTooltips();
}

/**
 * Form validasyonu
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                return false;
            }
        });
    });
}

/**
 * Form doğrulama
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Bu alan gereklidir');
            isValid = false;
        } else {
            clearFieldError(field);
        }
        
        // Email doğrulama
        if (field.type === 'email' && field.value) {
            if (!isValidEmail(field.value)) {
                showFieldError(field, 'Geçerli bir e-posta adresi girin');
                isValid = false;
            }
        }
        
        // Para miktarı doğrulama
        if (field.classList.contains('money-input') && field.value) {
            const amount = parseFloat(field.value);
            if (isNaN(amount) || amount <= 0) {
                showFieldError(field, 'Geçerli bir miktar girin');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

/**
 * Alan hatası göster
 */
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#F44336';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
}

/**
 * Alan hatasını temizle
 */
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Email doğrulama
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sidebar menü
 */
function initSidebarMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Aktif menü işaretleme
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop()) {
            link.classList.add('active');
        }
    });
}

/**
 * Çift tıklama önleme
 */
function preventDoubleSubmit() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<div class="loading"></div> İşleniyor...';
                
                // 5 saniye sonra tekrar aktifleştir
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = submitBtn.dataset.originalText || 'Gönder';
                }, 5000);
            }
        });
    });
}

/**
 * Para formatı
 */
function initMoneyFormat() {
    const moneyInputs = document.querySelectorAll('.money-input');
    
    moneyInputs.forEach(input => {
        input.addEventListener('input', function() {
            let value = this.value.replace(/[^\d.,]/g, '');
            value = value.replace(',', '.');
            
            if (value) {
                const number = parseFloat(value);
                if (!isNaN(number)) {
                    this.value = number.toFixed(2);
                }
            }
        });
    });
}

/**
 * Tarih formatı
 */
function initDateFormat() {
    const dateElements = document.querySelectorAll('[data-date]');
    
    dateElements.forEach(element => {
        const dateStr = element.dataset.date;
        if (dateStr) {
            const date = new Date(dateStr);
            element.textContent = formatDate(date);
        }
    });
}

/**
 * Tarih formatla
 */
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return 'Bugün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Dün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
        return days + ' gün önce';
    } else {
        return date.toLocaleDateString('tr-TR');
    }
}

/**
 * Tooltip'ler
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

/**
 * Tooltip göster
 */
function showTooltip(e) {
    const element = e.target;
    const text = element.dataset.tooltip;
    
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
        max-width: 200px;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    element._tooltip = tooltip;
}

/**
 * Tooltip gizle
 */
function hideTooltip(e) {
    const element = e.target;
    if (element._tooltip) {
        document.body.removeChild(element._tooltip);
        element._tooltip = null;
    }
}

/**
 * Modal açma/kapama
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Bildirim göster
 */
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 500px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid ${getNotificationColor(type)};
    `;
    
    document.body.appendChild(notification);
    
    if (duration > 0) {
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

/**
 * Bildirim rengi
 */
function getNotificationColor(type) {
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#1E88E5'
    };
    return colors[type] || colors.info;
}

/**
 * Para formatı (görüntüleme)
 */
function formatMoney(amount, currency = 'TL') {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + ' ' + currency;
}

/**
 * AJAX isteği gönder
 */
function sendAjaxRequest(url, data, callback, method = 'POST') {
    const xhr = new XMLHttpRequest();
    
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    callback(response);
                } catch (e) {
                    callback({ error: 'Geçersiz yanıt' });
                }
            } else {
                callback({ error: 'İstek başarısız' });
            }
        }
    };
    
    if (method === 'POST') {
        let formData = '';
        if (typeof data === 'object') {
            formData = Object.keys(data).map(key => 
                encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
            ).join('&');
        } else {
            formData = data;
        }
        xhr.send(formData);
    } else {
        xhr.send();
    }
}

/**
 * Loading göster/gizle
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading"></div> Yükleniyor...';
    }
}

function hideLoading(elementId, originalContent) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = originalContent;
    }
}

/**
 * Confirm dialog
 */
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

/**
 * Sayfa yönlendirme
 */
function redirectTo(url, delay = 0) {
    if (delay > 0) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    } else {
        window.location.href = url;
    }
}

/**
 * Clipboard'a kopyala
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Panoya kopyalandı', 'success', 2000);
    }).catch(() => {
        showNotification('Kopyalama başarısız', 'error', 2000);
    });
}

/**
 * CSS animasyonları
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
        margin-left: 1rem;
    }
    
    .notification-close:hover {
        color: #333;
    }
    
    .is-invalid {
        border-color: #F44336 !important;
        box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
    }
`;
document.head.appendChild(style);