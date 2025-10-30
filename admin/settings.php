<?php
// Basit auth kontrolü (production'da session kullanılmalı)
// session_start();
// if (!isset($_SESSION['admin_logged_in'])) {
//     header('Location: login.php');
//     exit;
// }
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Ayarları | Gürbüz Oyuncak Admin</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F3F4F6;
        }
        
        .admin-layout {
            display: grid;
            grid-template-columns: 250px 1fr;
            min-height: 100vh;
        }
        

        
        .main-content {
            padding: 2rem;
        }
        
        .top-bar {
            background-color: #FFFFFF;
            padding: 1rem 2rem;
            margin: -2rem -2rem 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .settings-container {
            max-width: 800px;
        }
        
        .card {
            background-color: #FFFFFF;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .card-header h2 {
            font-size: 1.25rem;
            color: #1F2937;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
            font-size: 0.875rem;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #D1D5DB;
            border-radius: 0.375rem;
            font-size: 0.875rem;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        .form-group small {
            display: block;
            margin-top: 0.25rem;
            color: #6B7280;
            font-size: 0.75rem;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        
        .btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            text-decoration: none;
            font-size: 0.875rem;
        }
        
        .btn-primary {
            background-color: #1E88E5;
            color: #FFFFFF;
        }
        
        .btn-primary:hover {
            background-color: #1565C0;
        }
        
        .btn-success {
            background-color: #2E7D32;
            color: #FFFFFF;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        
        .alert-success {
            background-color: #D1FAE5;
            color: #065F46;
            border: 1px solid #6EE7B7;
        }
        
        .alert-error {
            background-color: #FEE2E2;
            color: #991B1B;
            border: 1px solid #FCA5A5;
        }
        
        .logo-preview {
            margin-top: 1rem;
            max-width: 200px;
        }
        
        .logo-preview img {
            max-width: 100%;
            border-radius: 0.5rem;
            border: 1px solid #E5E7EB;
        }
        
        .social-input-group {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .social-input-group input {
            flex: 1;
        }
        
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #D1D5DB;
            transition: .4s;
            border-radius: 24px;
        }
        
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
            background-color: #2E7D32;
        }
        
        input:checked + .toggle-slider:before {
            transform: translateX(26px);
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <!-- Sidebar -->
        <?php include 'includes/sidebar.php'; ?>
        
        <!-- Main Content -->
        <main class="main-content">
            <div class="top-bar">
                <h1>Site Ayarları</h1>
            </div>
            
            <div id="alert-container"></div>
            
            <div class="settings-container">
                <!-- Genel Ayarlar -->
                <div class="card">
                    <div class="card-header">
                        <h2>Genel Ayarlar</h2>
                    </div>
                    
                    <form id="general-settings-form" onsubmit="saveGeneralSettings(event)">
                        <div class="form-group">
                            <label>Site Adı *</label>
                            <input type="text" id="site-name" value="Gürbüz Oyuncak" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Site Sloganı</label>
                            <input type="text" id="site-tagline" value="Oyuncak Dünyasının Lideri">
                        </div>
                        
                        <div class="form-group">
                            <label>Site Açıklaması</label>
                            <textarea id="site-description">Gürbüz Oyuncak, 1989'dan beri kaliteli oyuncaklar sunan Türkiye'nin önde gelen oyuncak toptancısıdır.</textarea>
                            <small>Arama motorları için site açıklaması</small>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>E-posta</label>
                                <input type="email" id="site-email" value="info@gurbuzoyuncak.com">
                            </div>
                            
                            <div class="form-group">
                                <label>Telefon</label>
                                <input type="tel" id="site-phone" value="+90 242 123 45 67">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Adres</label>
                            <textarea id="site-address">Güzeloba Mah. Çağlayangil Cad. No:1234 Muratpaşa/Antalya</textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-success">
                            Kaydet
                        </button>
                    </form>
                </div>
                
                <!-- Logo Ayarları -->
                <div class="card">
                    <div class="card-header">
                        <h2>Logo ve Görseller</h2>
                    </div>
                    
                    <form id="logo-settings-form" onsubmit="saveLogoSettings(event)">
                        <div class="form-group">
                            <label>Site Logosu</label>
                            <input type="file" id="site-logo" accept="image/*" onchange="previewLogo(event, 'logo-preview')">
                            <div id="logo-preview" class="logo-preview"></div>
                        </div>
                        
                        <div class="form-group">
                            <label>Favicon</label>
                            <input type="file" id="site-favicon" accept="image/*" onchange="previewLogo(event, 'favicon-preview')">
                            <div id="favicon-preview" class="logo-preview"></div>
                            <small>32x32 piksel, ICO veya PNG formatında</small>
                        </div>
                        
                        <button type="submit" class="btn btn-success">
                            Kaydet
                        </button>
                    </form>
                </div>
                
                <!-- Sosyal Medya -->
                <div class="card">
                    <div class="card-header">
                        <h2>Sosyal Medya Hesapları</h2>
                    </div>
                    
                    <form id="social-settings-form" onsubmit="saveSocialSettings(event)">
                        <div class="form-group">
                            <label>Facebook</label>
                            <input type="url" id="social-facebook" placeholder="https://facebook.com/gurbuzoyuncak">
                        </div>
                        
                        <div class="form-group">
                            <label>Instagram</label>
                            <input type="url" id="social-instagram" placeholder="https://instagram.com/gurbuzoyuncak">
                        </div>
                        
                        <div class="form-group">
                            <label>Twitter (X)</label>
                            <input type="url" id="social-twitter" placeholder="https://twitter.com/gurbuzoyuncak">
                        </div>
                        
                        <div class="form-group">
                            <label>YouTube</label>
                            <input type="url" id="social-youtube" placeholder="https://youtube.com/@gurbuzoyuncak">
                        </div>
                        
                        <div class="form-group">
                            <label>WhatsApp İş Hattı</label>
                            <input type="tel" id="social-whatsapp" placeholder="+90 555 123 45 67">
                            <small>Müşterilerin doğrudan WhatsApp üzerinden iletişim kurabilmesi için</small>
                        </div>
                        
                        <button type="submit" class="btn btn-success">
                            Kaydet
                        </button>
                    </form>
                </div>
                
                <!-- E-Ticaret Ayarları -->
                <div class="card">
                    <div class="card-header">
                        <h2>E-Ticaret Ayarları</h2>
                    </div>
                    
                    <form id="ecommerce-settings-form" onsubmit="saveEcommerceSettings(event)">
                        <div class="form-group">
                            <label>Para Birimi</label>
                            <select id="currency">
                                <option value="TRY">Türk Lirası (₺)</option>
                                <option value="USD">Amerikan Doları ($)</option>
                                <option value="EUR">Euro (€)</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Minimum Sipariş Tutarı (₺)</label>
                                <input type="number" id="min-order-amount" value="0" step="0.01">
                            </div>
                            
                            <div class="form-group">
                                <label>Ücretsiz Kargo Limiti (₺)</label>
                                <input type="number" id="free-shipping-limit" value="500" step="0.01">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Kargo Ücreti (₺)</label>
                                <input type="number" id="shipping-fee" value="29.90" step="0.01">
                            </div>
                            
                            <div class="form-group">
                                <label>KDV Oranı (%)</label>
                                <input type="number" id="tax-rate" value="20" step="0.01">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="guest-checkout">
                                    <span class="toggle-slider"></span>
                                </label>
                                Misafir Alışverişine İzin Ver
                            </label>
                            <small>Kullanıcılar kayıt olmadan alışveriş yapabilir</small>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="stock-management" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                                Stok Yönetimini Aktif Et
                            </label>
                            <small>Stok bittiğinde ürün satışa kapatılır</small>
                        </div>
                        
                        <button type="submit" class="btn btn-success">
                            Kaydet
                        </button>
                    </form>
                </div>
                
                <!-- SEO Ayarları -->
                <div class="card">
                    <div class="card-header">
                        <h2>SEO Ayarları</h2>
                    </div>
                    
                    <form id="seo-settings-form" onsubmit="saveSeoSettings(event)">
                        <div class="form-group">
                            <label>Meta Başlık</label>
                            <input type="text" id="meta-title" value="Gürbüz Oyuncak - Oyuncak Dünyasının Lideri">
                            <small>Arama sonuçlarında görünecek başlık (50-60 karakter önerilir)</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Meta Açıklama</label>
                            <textarea id="meta-description">Gürbüz Oyuncak, 1989'dan beri kaliteli oyuncaklar sunan Türkiye'nin önde gelen oyuncak toptancısıdır. Bebek, puzzle, kumandalı araç ve daha fazlası!</textarea>
                            <small>Arama sonuçlarında görünecek açıklama (150-160 karakter önerilir)</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Anahtar Kelimeler</label>
                            <input type="text" id="meta-keywords" value="oyuncak, bebek, puzzle, kumandalı araç, lego, antalya">
                            <small>Virgülle ayırarak yazın</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Google Analytics ID</label>
                            <input type="text" id="google-analytics" placeholder="G-XXXXXXXXXX">
                        </div>
                        
                        <div class="form-group">
                            <label>Google Tag Manager ID</label>
                            <input type="text" id="google-tag-manager" placeholder="GTM-XXXXXXX">
                        </div>
                        
                        <button type="submit" class="btn btn-success">
                            Kaydet
                        </button>
                    </form>
                </div>
            </div>
        </main>
    </div>
    
    <script>
        // Sayfa yüklendiğinde ayarları yükle
        document.addEventListener('DOMContentLoaded', function() {
            loadSettings();
        });
        
        // Ayarları yükle
        function loadSettings() {
            // LocalStorage'dan veya API'den ayarları yükle
            const savedSettings = localStorage.getItem('siteSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                // Form alanlarını doldur
                if (settings.general) {
                    Object.keys(settings.general).forEach(key => {
                        const element = document.getElementById(key);
                        if (element) element.value = settings.general[key];
                    });
                }
            }
        }
        
        // Genel ayarları kaydet
        function saveGeneralSettings(event) {
            event.preventDefault();
            
            const settings = {
                'site-name': document.getElementById('site-name').value,
                'site-tagline': document.getElementById('site-tagline').value,
                'site-description': document.getElementById('site-description').value,
                'site-email': document.getElementById('site-email').value,
                'site-phone': document.getElementById('site-phone').value,
                'site-address': document.getElementById('site-address').value
            };
            
            saveToStorage('general', settings);
            showAlert('Genel ayarlar kaydedildi', 'success');
        }
        
        // Logo ayarlarını kaydet
        function saveLogoSettings(event) {
            event.preventDefault();
            showAlert('Logo ayarları kaydedildi', 'success');
        }
        
        // Sosyal medya ayarlarını kaydet
        function saveSocialSettings(event) {
            event.preventDefault();
            
            const settings = {
                'social-facebook': document.getElementById('social-facebook').value,
                'social-instagram': document.getElementById('social-instagram').value,
                'social-twitter': document.getElementById('social-twitter').value,
                'social-youtube': document.getElementById('social-youtube').value,
                'social-whatsapp': document.getElementById('social-whatsapp').value
            };
            
            saveToStorage('social', settings);
            showAlert('Sosyal medya ayarları kaydedildi', 'success');
        }
        
        // E-ticaret ayarlarını kaydet
        function saveEcommerceSettings(event) {
            event.preventDefault();
            
            const settings = {
                'currency': document.getElementById('currency').value,
                'min-order-amount': document.getElementById('min-order-amount').value,
                'free-shipping-limit': document.getElementById('free-shipping-limit').value,
                'shipping-fee': document.getElementById('shipping-fee').value,
                'tax-rate': document.getElementById('tax-rate').value,
                'guest-checkout': document.getElementById('guest-checkout').checked,
                'stock-management': document.getElementById('stock-management').checked
            };
            
            saveToStorage('ecommerce', settings);
            showAlert('E-ticaret ayarları kaydedildi', 'success');
        }
        
        // SEO ayarlarını kaydet
        function saveSeoSettings(event) {
            event.preventDefault();
            
            const settings = {
                'meta-title': document.getElementById('meta-title').value,
                'meta-description': document.getElementById('meta-description').value,
                'meta-keywords': document.getElementById('meta-keywords').value,
                'google-analytics': document.getElementById('google-analytics').value,
                'google-tag-manager': document.getElementById('google-tag-manager').value
            };
            
            saveToStorage('seo', settings);
            showAlert('SEO ayarları kaydedildi', 'success');
        }
        
        // LocalStorage'a kaydet
        function saveToStorage(section, data) {
            let settings = {};
            const savedSettings = localStorage.getItem('siteSettings');
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
            settings[section] = data;
            localStorage.setItem('siteSettings', JSON.stringify(settings));
        }
        
        // Logo önizleme
        function previewLogo(event, previewId) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById(previewId).innerHTML = 
                        `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        }
        
        // Alert göster
        function showAlert(message, type) {
            const container = document.getElementById('alert-container');
            const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
            
            container.innerHTML = `
                <div class="alert ${alertClass}">
                    ${message}
                </div>
            `;
            
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }
    </script>
</body>
</html>
