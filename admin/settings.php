<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/../components/ComponentLoader.php';

// Admin kontrolü
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
    <meta name="description" content="Site ayarları yönetimi - Gürbüz Oyuncak Admin Panel">
    <title>Site Ayarları | Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="/components/css/components.css">
    
    <style>
        :root {
            --primary-color: #667eea;
            --primary-hover: #5a67d8;
            --sidebar-width: 280px;
            --topbar-height: 70px;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #f8f9fc;
            overflow-x: hidden;
        }
        
        /* Layout */
        .admin-wrapper {
            display: flex;
            min-height: 100vh;
        }
        
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: calc(var(--topbar-height) + 2rem) 2rem 2rem;
            transition: margin-left 0.3s ease;
        }
        
        /* Top Bar */
        .top-bar {
            position: fixed;
            top: 0;
            left: var(--sidebar-width);
            right: 0;
            height: var(--topbar-height);
            background: white;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            z-index: 999;
            transition: left 0.3s ease;
        }
        
        .top-bar h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        /* Settings Container */
        .settings-container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        /* Cards */
        .settings-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
            overflow: hidden;
        }
        
        .card-header-custom {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-bottom: none;
        }
        
        .card-header-custom h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .card-body-custom {
            padding: 2rem;
        }
        
        /* Form Elements */
        .form-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .form-control, .form-select {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            transition: all 0.2s;
            font-size: 0.95rem;
        }
        
        .form-control:focus, .form-select:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        textarea.form-control {
            resize: vertical;
            min-height: 100px;
        }
        
        .form-text {
            color: #6b7280;
            font-size: 0.85rem;
            margin-top: 0.25rem;
        }
        
        /* Toggle Switch */
        .form-switch {
            padding-left: 3rem;
            min-height: 28px;
        }
        
        .form-switch .form-check-input {
            width: 48px;
            height: 28px;
            margin-left: -3rem;
            cursor: pointer;
            background-color: #d1d5db;
            border: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='white'/%3e%3c/svg%3e");
        }
        
        .form-switch .form-check-input:checked {
            background-color: var(--primary-color);
        }
        
        .form-switch .form-check-label {
            font-weight: 500;
            color: #374151;
            cursor: pointer;
        }
        
        /* Buttons */
        .btn-save {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s;
        }
        
        .btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            color: white;
        }
        
        /* Logo Preview */
        .logo-preview {
            margin-top: 1rem;
            padding: 1rem;
            border: 2px dashed #e5e7eb;
            border-radius: 8px;
            text-align: center;
            min-height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-preview img {
            max-width: 200px;
            max-height: 100px;
            border-radius: 8px;
        }
        
        .logo-preview.empty {
            color: #9ca3af;
        }
        
        /* Alert Animations */
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .alert {
            animation: slideInDown 0.3s ease;
            border-radius: 8px;
            border: none;
            padding: 1rem 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .alert-success {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .alert-danger {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .main-content {
                margin-left: 0;
                padding: calc(var(--topbar-height) + 1rem) 1rem 1rem;
            }
            
            .top-bar {
                left: 0;
                padding: 0 1rem;
            }
            
            .top-bar h1 {
                font-size: 1.25rem;
            }
            
            .card-body-custom {
                padding: 1.25rem;
            }
            
            .row > div[class*='col-md-6'] {
                margin-bottom: 1rem;
            }
        }
        
        /* Loading State */
        .btn-save.loading {
            pointer-events: none;
            opacity: 0.6;
        }
        
        .btn-save.loading::after {
            content: '';
            width: 16px;
            height: 16px;
            border: 2px solid white;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="admin-wrapper">
        <!-- Sidebar -->
        <?php component('sidebar', ['variant' => 'admin']); ?>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Top Bar -->
            <div class="top-bar">
                <h1>
                    <i data-lucide="settings" style="width: 32px; height: 32px;"></i>
                    Site Ayarları
                </h1>
                <?php component('navbar', ['variant' => 'admin']); ?>
            </div>
            
            <!-- Alert Container -->
            <div id="alert-container"></div>
            
            <div class="settings-container">
                <!-- Genel Ayarlar -->
                <div class="settings-card">
                    <div class="card-header-custom">
                        <h3>
                            <i data-lucide="globe" style="width: 24px; height: 24px;"></i>
                            Genel Ayarlar
                        </h3>
                    </div>
                    <div class="card-body-custom">
                        <form id="general-settings-form">
                            <div class="mb-3">
                                <label class="form-label">Site Adı *</label>
                                <input type="text" class="form-control" id="site-name" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Site Sloganı</label>
                                <input type="text" class="form-control" id="site-tagline">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Site Açıklaması</label>
                                <textarea class="form-control" id="site-description"></textarea>
                                <div class="form-text">Arama motorları için site açıklaması</div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">E-posta</label>
                                    <input type="email" class="form-control" id="site-email">
                                </div>
                                
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Telefon</label>
                                    <input type="tel" class="form-control" id="site-phone">
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label">Adres</label>
                                <textarea class="form-control" id="site-address" rows="2"></textarea>
                            </div>
                            
                            <button type="submit" class="btn btn-save">
                                <i data-lucide="save" style="width: 18px; height: 18px;"></i>
                                Kaydet
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- Logo ve Görseller -->
                <div class="settings-card">
                    <div class="card-header-custom">
                        <h3>
                            <i data-lucide="image" style="width: 24px; height: 24px;"></i>
                            Logo ve Görseller
                        </h3>
                    </div>
                    <div class="card-body-custom">
                        <form id="logo-settings-form">
                            <div class="mb-3">
                                <label class="form-label">Site Logosu</label>
                                <input type="file" class="form-control" id="site-logo" accept="image/*">
                                <div id="logo-preview" class="logo-preview empty">
                                    Logo yüklenecek
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label">Favicon</label>
                                <input type="file" class="form-control" id="site-favicon" accept="image/*">
                                <div id="favicon-preview" class="logo-preview empty">
                                    Favicon yüklenecek
                                </div>
                                <div class="form-text">32x32 piksel, ICO veya PNG formatında</div>
                            </div>
                            
                            <button type="submit" class="btn btn-save">
                                <i data-lucide="upload" style="width: 18px; height: 18px;"></i>
                                Yükle
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- Sosyal Medya -->
                <div class="settings-card">
                    <div class="card-header-custom">
                        <h3>
                            <i data-lucide="share-2" style="width: 24px; height: 24px;"></i>
                            Sosyal Medya Hesapları
                        </h3>
                    </div>
                    <div class="card-body-custom">
                        <form id="social-settings-form">
                            <div class="mb-3">
                                <label class="form-label">Facebook</label>
                                <input type="url" class="form-control" id="social-facebook" placeholder="https://facebook.com/gurbuzoyuncak">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Instagram</label>
                                <input type="url" class="form-control" id="social-instagram" placeholder="https://instagram.com/gurbuzoyuncak">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Twitter (X)</label>
                                <input type="url" class="form-control" id="social-twitter" placeholder="https://twitter.com/gurbuzoyuncak">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">YouTube</label>
                                <input type="url" class="form-control" id="social-youtube" placeholder="https://youtube.com/@gurbuzoyuncak">
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label">WhatsApp İş Hattı</label>
                                <input type="tel" class="form-control" id="social-whatsapp" placeholder="+90 555 123 45 67">
                                <div class="form-text">Müşterilerin doğrudan WhatsApp üzerinden iletişim kurabilmesi için</div>
                            </div>
                            
                            <button type="submit" class="btn btn-save">
                                <i data-lucide="save" style="width: 18px; height: 18px;"></i>
                                Kaydet
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- E-Ticaret Ayarları -->
                <div class="settings-card">
                    <div class="card-header-custom">
                        <h3>
                            <i data-lucide="shopping-cart" style="width: 24px; height: 24px;"></i>
                            E-Ticaret Ayarları
                        </h3>
                    </div>
                    <div class="card-body-custom">
                        <form id="ecommerce-settings-form">
                            <div class="mb-3">
                                <label class="form-label">Para Birimi</label>
                                <select class="form-select" id="currency">
                                    <option value="TRY">Türk Lirası (₺)</option>
                                    <option value="USD">Amerikan Doları ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                </select>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Minimum Sipariş Tutarı (₺)</label>
                                    <input type="number" class="form-control" id="min-order-amount" step="0.01">
                                </div>
                                
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Ücretsiz Kargo Limiti (₺)</label>
                                    <input type="number" class="form-control" id="free-shipping-limit" step="0.01">
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Kargo Ücreti (₺)</label>
                                    <input type="number" class="form-control" id="shipping-fee" step="0.01">
                                </div>
                                
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">KDV Oranı (%)</label>
                                    <input type="number" class="form-control" id="tax-rate" step="0.01">
                                </div>
                            </div>
                            
                            <div class="mb-3 form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="guest-checkout">
                                <label class="form-check-label" for="guest-checkout">
                                    Misafir Alışverişine İzin Ver
                                </label>
                                <div class="form-text">Kullanıcılar kayıt olmadan alışveriş yapabilir</div>
                            </div>
                            
                            <div class="mb-4 form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="stock-management" checked>
                                <label class="form-check-label" for="stock-management">
                                    Stok Yönetimini Aktif Et
                                </label>
                                <div class="form-text">Stok bittiğinde ürün satışa kapatılır</div>
                            </div>
                            
                            <button type="submit" class="btn btn-save">
                                <i data-lucide="save" style="width: 18px; height: 18px;"></i>
                                Kaydet
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- SEO Ayarları -->
                <div class="settings-card">
                    <div class="card-header-custom">
                        <h3>
                            <i data-lucide="search" style="width: 24px; height: 24px;"></i>
                            SEO Ayarları
                        </h3>
                    </div>
                    <div class="card-body-custom">
                        <form id="seo-settings-form">
                            <div class="mb-3">
                                <label class="form-label">Meta Başlık</label>
                                <input type="text" class="form-control" id="meta-title">
                                <div class="form-text">Arama sonuçlarında görünecek başlık (50-60 karakter önerilir)</div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Meta Açıklama</label>
                                <textarea class="form-control" id="meta-description" rows="3"></textarea>
                                <div class="form-text">Arama sonuçlarında görünecek açıklama (150-160 karakter önerilir)</div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Anahtar Kelimeler</label>
                                <input type="text" class="form-control" id="meta-keywords">
                                <div class="form-text">Virgülle ayırarak yazın</div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Google Analytics ID</label>
                                <input type="text" class="form-control" id="google-analytics" placeholder="G-XXXXXXXXXX">
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label">Google Tag Manager ID</label>
                                <input type="text" class="form-control" id="google-tag-manager" placeholder="GTM-XXXXXXX">
                            </div>
                            
                            <button type="submit" class="btn btn-save">
                                <i data-lucide="save" style="width: 18px; height: 18px;"></i>
                                Kaydet
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader -->
    <script src="/components/js/component-loader.js"></script>
    
    <script>
        // Lucide icons'ı başlat
        lucide.createIcons();
        
        // Sayfa yüklendiğinde ayarları yükle
        document.addEventListener('DOMContentLoaded', function() {
            loadSettings();
            initFilePreview();
        });
        
        /**
         * Ayarları API'den yükle
         */
        async function loadSettings() {
            try {
                const response = await fetch('/backend/api/settings.php');
                const result = await response.json();
                
                if (result.success && result.data) {
                    fillFormFields(result.data);
                }
            } catch (error) {
                console.error('Ayarlar yüklenirken hata:', error);
                showAlert('Ayarlar yüklenirken hata oluştu', 'danger');
            }
        }
        
        /**
         * Form alanlarını doldur
         */
        function fillFormFields(settings) {
            Object.keys(settings).forEach(group => {
                Object.keys(settings[group]).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = settings[group][key] === true || settings[group][key] === '1';
                        } else {
                            element.value = settings[group][key];
                        }
                    }
                });
            });
        }
        
        /**
         * Genel ayarları kaydet
         */
        document.getElementById('general-settings-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button[type="submit"]');
            button.classList.add('loading');
            
            const settings = {
                general: {
                    'site-name': document.getElementById('site-name').value,
                    'site-tagline': document.getElementById('site-tagline').value,
                    'site-description': document.getElementById('site-description').value,
                    'site-email': document.getElementById('site-email').value,
                    'site-phone': document.getElementById('site-phone').value,
                    'site-address': document.getElementById('site-address').value
                }
            };
            
            const success = await saveSettings(settings);
            button.classList.remove('loading');
            
            if (success) {
                showAlert('Genel ayarlar başarıyla kaydedildi', 'success');
            }
        });
        
        /**
         * Logo ayarlarını kaydet
         */
        document.getElementById('logo-settings-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button[type="submit"]');
            button.classList.add('loading');
            
            // TODO: Logo upload işlemi
            setTimeout(() => {
                button.classList.remove('loading');
                showAlert('Logo ayarları başarıyla kaydedildi', 'success');
            }, 1000);
        });
        
        /**
         * Sosyal medya ayarlarını kaydet
         */
        document.getElementById('social-settings-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button[type="submit"]');
            button.classList.add('loading');
            
            const settings = {
                social: {
                    'social-facebook': document.getElementById('social-facebook').value,
                    'social-instagram': document.getElementById('social-instagram').value,
                    'social-twitter': document.getElementById('social-twitter').value,
                    'social-youtube': document.getElementById('social-youtube').value,
                    'social-whatsapp': document.getElementById('social-whatsapp').value
                }
            };
            
            const success = await saveSettings(settings);
            button.classList.remove('loading');
            
            if (success) {
                showAlert('Sosyal medya ayarları başarıyla kaydedildi', 'success');
            }
        });
        
        /**
         * E-ticaret ayarlarını kaydet
         */
        document.getElementById('ecommerce-settings-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button[type="submit"]');
            button.classList.add('loading');
            
            const settings = {
                ecommerce: {
                    'currency': document.getElementById('currency').value,
                    'min-order-amount': document.getElementById('min-order-amount').value,
                    'free-shipping-limit': document.getElementById('free-shipping-limit').value,
                    'shipping-fee': document.getElementById('shipping-fee').value,
                    'tax-rate': document.getElementById('tax-rate').value,
                    'guest-checkout': document.getElementById('guest-checkout').checked,
                    'stock-management': document.getElementById('stock-management').checked
                }
            };
            
            const success = await saveSettings(settings);
            button.classList.remove('loading');
            
            if (success) {
                showAlert('E-ticaret ayarları başarıyla kaydedildi', 'success');
            }
        });
        
        /**
         * SEO ayarlarını kaydet
         */
        document.getElementById('seo-settings-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button[type="submit"]');
            button.classList.add('loading');
            
            const settings = {
                seo: {
                    'meta-title': document.getElementById('meta-title').value,
                    'meta-description': document.getElementById('meta-description').value,
                    'meta-keywords': document.getElementById('meta-keywords').value,
                    'google-analytics': document.getElementById('google-analytics').value,
                    'google-tag-manager': document.getElementById('google-tag-manager').value
                }
            };
            
            const success = await saveSettings(settings);
            button.classList.remove('loading');
            
            if (success) {
                showAlert('SEO ayarları başarıyla kaydedildi', 'success');
            }
        });
        
        /**
         * Ayarları API'ye kaydet
         */
        async function saveSettings(settings) {
            try {
                const response = await fetch('/backend/api/settings.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(settings)
                });
                
                const result = await response.json();
                
                if (!result.success) {
                    showAlert(result.message || 'Kaydetme sırasında hata oluştu', 'danger');
                    return false;
                }
                
                return true;
                
            } catch (error) {
                console.error('Kaydetme hatası:', error);
                showAlert('Kaydetme sırasında hata oluştu', 'danger');
                return false;
            }
        }
        
        /**
         * Dosya önizleme
         */
        function initFilePreview() {
            document.getElementById('site-logo').addEventListener('change', function(e) {
                previewFile(e.target, 'logo-preview');
            });
            
            document.getElementById('site-favicon').addEventListener('change', function(e) {
                previewFile(e.target, 'favicon-preview');
            });
        }
        
        function previewFile(input, previewId) {
            const file = input.files[0];
            const preview = document.getElementById(previewId);
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    preview.classList.remove('empty');
                };
                reader.readAsDataURL(file);
            }
        }
        
        /**
         * Alert göster
         */
        function showAlert(message, type) {
            const container = document.getElementById('alert-container');
            const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
            
            container.innerHTML = `
                <div class="alert ${alertClass}" role="alert">
                    <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i>
                    ${message}
                </div>
            `;
            
            lucide.createIcons();
            
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }
    </script>
</body>
</html>
