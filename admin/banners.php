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
    <meta name="description" content="Banner yönetimi - Gürbüz Oyuncak Admin Panel">
    <title>Banner Yönetimi | Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        
        .top-bar-actions {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }
        
        /* Cards */
        .banner-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .card-header-custom {
            background: var(--primary-gradient);
            color: white;
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .card-header-custom h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        /* Table */
        .table-responsive {
            overflow-x: auto;
        }
        
        .banner-table {
            margin: 0;
        }
        
        .banner-table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            white-space: nowrap;
            padding: 1rem;
        }
        
        .banner-table td {
            padding: 1rem;
            vertical-align: middle;
        }
        
        .banner-thumbnail {
            width: 120px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        /* Buttons */
        .btn-primary-gradient {
            background: var(--primary-gradient);
            color: white;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s;
        }
        
        .btn-primary-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            color: white;
        }
        
        .btn-sm-icon {
            width: 36px;
            height: 36px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
        }
        
        /* Badges */
        .badge-status {
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .badge-active {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .badge-inactive {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        /* Modal Enhancements */
        .modal-content {
            border: none;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
            background: var(--primary-gradient);
            color: white;
            border-bottom: none;
            border-radius: 12px 12px 0 0;
            padding: 1.5rem;
        }
        
        .modal-header .btn-close {
            filter: brightness(0) invert(1);
        }
        
        .banner-preview-container {
            margin-top: 1rem;
            border: 2px dashed #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            min-height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .banner-preview-container img {
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
        }
        
        .banner-preview-container.empty {
            color: #9ca3af;
        }
        
        /* Form Elements */
        .form-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .form-control, .form-select {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 0.75rem;
            transition: all 0.2s;
        }
        
        .form-control:focus, .form-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        input[type="color"] {
            height: 50px;
            padding: 0.25rem;
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
            
            .top-bar-actions {
                gap: 0.5rem;
            }
            
            .banner-thumbnail {
                width: 80px;
                height: 40px;
            }
            
            .table-responsive {
                font-size: 0.85rem;
            }
            
            .banner-table th,
            .banner-table td {
                padding: 0.5rem;
            }
        }
        
        /* Loading State */
        .loading-spinner {
            text-align: center;
            padding: 3rem;
            color: #9ca3af;
        }
        
        .loading-spinner i {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: #6b7280;
        }
        
        .empty-state i {
            width: 64px;
            height: 64px;
            margin-bottom: 1rem;
            opacity: 0.5;
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
                    <i data-lucide="image" style="width: 32px; height: 32px;"></i>
                    Banner Yönetimi
                </h1>
                <div class="top-bar-actions">
                    <button class="btn btn-primary-gradient" data-bs-toggle="modal" data-bs-target="#bannerModal" onclick="openModal()">
                        <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                        Yeni Banner
                    </button>
                </div>
            </div>
            
            <!-- Banner List -->
            <div class="banner-card">
                <div class="card-header-custom">
                    <h3>
                        <i data-lucide="layout" style="width: 24px; height: 24px;"></i>
                        Tüm Banner'lar
                    </h3>
                </div>
                
                <div class="table-responsive">
                    <table class="table banner-table">
                        <thead>
                            <tr>
                                <th>Görsel</th>
                                <th>Başlık</th>
                                <th>Link</th>
                                <th>Sıra</th>
                                <th>Durum</th>
                                <th>Tarih Aralığı</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="bannersTableBody">
                            <tr>
                                <td colspan="7" class="loading-spinner">
                                    <i data-lucide="loader-2" style="width: 32px; height: 32px;"></i>
                                    <p class="mt-2 mb-0">Yükleniyor...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Banner Modal -->
    <div class="modal fade" id="bannerModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">
                        <i data-lucide="plus-circle" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i>
                        Yeni Banner Ekle
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="bannerForm">
                        <input type="hidden" id="bannerId">
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Başlık *</label>
                                <input type="text" class="form-control" id="title" required>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Alt Başlık</label>
                                <input type="text" class="form-control" id="subtitle">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Banner Görseli *</label>
                            <input type="file" class="form-control" id="imageFile" accept="image/*">
                            <input type="hidden" id="imageUrl">
                            <div id="imagePreview" class="banner-preview-container empty">
                                <span>Görsel yüklenecek</span>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Link URL</label>
                                <input type="text" class="form-control" id="linkUrl" placeholder="/products.html">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Link Butonu Metni</label>
                                <input type="text" class="form-control" id="linkText" placeholder="Şimdi Keşfet">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Arka Plan Rengi</label>
                                <input type="color" class="form-control" id="backgroundColor" value="#1E88E5">
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Metin Rengi</label>
                                <input type="color" class="form-control" id="textColor" value="#FFFFFF">
                            </div>
                            
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Gösterim Sırası</label>
                                <input type="number" class="form-control" id="displayOrder" value="0" min="0">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Başlangıç Tarihi</label>
                                <input type="datetime-local" class="form-control" id="startDate">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Bitiş Tarihi</label>
                                <input type="datetime-local" class="form-control" id="endDate">
                            </div>
                        </div>
                        
                        <div class="mb-3 form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="isActive" checked>
                            <label class="form-check-label" for="isActive">Aktif</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                    <button type="button" class="btn btn-primary-gradient" onclick="saveBanner()">
                        <i data-lucide="save" style="width: 18px; height: 18px;"></i>
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Toast Container -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
        <div id="toastNotification" class="toast" role="alert">
            <div class="toast-header">
                <i id="toastIcon" data-lucide="check-circle" style="width: 18px; height: 18px; margin-right: 8px;"></i>
                <strong class="me-auto" id="toastTitle">Bildirim</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body" id="toastBody"></div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader -->
    <script src="../components/js/component-loader.js"></script>
    
    <script>
        // Lucide icons'ı başlat
        lucide.createIcons();
        
        const API_BASE = '/backend/api/banners.php';
        let bootstrap_modal;
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            bootstrap_modal = new bootstrap.Modal(document.getElementById('bannerModal'));
            loadBanners();
            initFilePreview();
        });
        
        /**
         * Banner'ları yükle
         */
        async function loadBanners() {
            try {
                const response = await fetch(API_BASE);
                const data = await response.json();
                
                if (data.success) {
                    displayBanners(data.data);
                } else {
                    showError('Banner\'lar yüklenemedi');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Bir hata oluştu');
            }
        }
        
        /**
         * Banner'ları tabloda göster
         */
        function displayBanners(banners) {
            const tbody = document.getElementById('bannersTableBody');
            
            if (banners.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-state">
                            <i data-lucide="image-off"></i>
                            <p>Henüz banner eklenmemiş</p>
                        </td>
                    </tr>
                `;
                lucide.createIcons();
                return;
            }
            
            tbody.innerHTML = banners.map(banner => `
                <tr>
                    <td>
                        <img src="${banner.image_url}" alt="${banner.title}" class="banner-thumbnail">
                    </td>
                    <td>
                        <strong>${banner.title}</strong><br>
                        <small class="text-muted">${banner.subtitle || ''}</small>
                    </td>
                    <td><small>${banner.link_url || '-'}</small></td>
                    <td><span class="badge bg-secondary">${banner.display_order}</span></td>
                    <td>
                        <span class="badge-status ${banner.is_active == 1 ? 'badge-active' : 'badge-inactive'}">
                            ${banner.is_active == 1 ? 'Aktif' : 'Pasif'}
                        </span>
                    </td>
                    <td>
                        <small>
                            ${banner.start_date ? new Date(banner.start_date).toLocaleDateString('tr-TR') : '-'}<br>
                            ${banner.end_date ? new Date(banner.end_date).toLocaleDateString('tr-TR') : '-'}
                        </small>
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-primary btn-sm-icon" onclick="editBanner(${banner.id})" title="Düzenle">
                                <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="btn btn-danger btn-sm-icon" onclick="deleteBanner(${banner.id})" title="Sil">
                                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            lucide.createIcons();
        }
        
        /**
         * Modal aç (yeni banner)
         */
        function openModal() {
            document.getElementById('modalTitle').innerHTML = '<i data-lucide="plus-circle" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Yeni Banner Ekle';
            document.getElementById('bannerForm').reset();
            document.getElementById('bannerId').value = '';
            document.getElementById('imageUrl').value = '';
            document.getElementById('backgroundColor').value = '#1E88E5';
            document.getElementById('textColor').value = '#FFFFFF';
            document.getElementById('isActive').checked = true;
            
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = '<span>Görsel yüklenecek</span>';
            preview.classList.add('empty');
            
            lucide.createIcons();
        }
        
        /**
         * Dosya önizleme
         */
        function initFilePreview() {
            document.getElementById('imageFile').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const preview = document.getElementById('imagePreview');
                        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                        preview.classList.remove('empty');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        /**
         * Banner kaydet
         */
        async function saveBanner() {
            const bannerId = document.getElementById('bannerId').value;
            const imageFile = document.getElementById('imageFile').files[0];
            let imageUrl = document.getElementById('imageUrl').value;
            
            // Yeni dosya seçildiyse yükle
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
                if (!imageUrl) {
                    showError('Görsel yüklenemedi');
                    return;
                }
            }
            
            if (!imageUrl) {
                showError('Lütfen bir görsel seçin');
                return;
            }
            
            const bannerData = {
                title: document.getElementById('title').value,
                subtitle: document.getElementById('subtitle').value,
                image_url: imageUrl,
                link_url: document.getElementById('linkUrl').value,
                link_text: document.getElementById('linkText').value,
                background_color: document.getElementById('backgroundColor').value,
                text_color: document.getElementById('textColor').value,
                display_order: parseInt(document.getElementById('displayOrder').value),
                is_active: document.getElementById('isActive').checked ? 1 : 0,
                start_date: document.getElementById('startDate').value || null,
                end_date: document.getElementById('endDate').value || null
            };
            
            try {
                const method = bannerId ? 'PUT' : 'POST';
                const url = bannerId ? `${API_BASE}?id=${bannerId}` : API_BASE;
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bannerData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    bootstrap_modal.hide();
                    loadBanners();
                    showSuccess(bannerId ? 'Banner güncellendi' : 'Banner eklendi');
                } else {
                    showError(data.message || 'İşlem başarısız');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Bir hata oluştu');
            }
        }
        
        /**
         * Görsel yükle
         */
        async function uploadImage(file) {
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                return data.success ? data.url : null;
            } catch (error) {
                console.error('Upload error:', error);
                return null;
            }
        }
        
        /**
         * Banner düzenle
         */
        async function editBanner(id) {
            try {
                const response = await fetch(`${API_BASE}?id=${id}`);
                const data = await response.json();
                
                if (data.success) {
                    const banner = data.data;
                    
                    document.getElementById('modalTitle').innerHTML = '<i data-lucide="edit-2" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i> Banner Düzenle';
                    document.getElementById('bannerId').value = banner.id;
                    document.getElementById('title').value = banner.title;
                    document.getElementById('subtitle').value = banner.subtitle || '';
                    document.getElementById('imageUrl').value = banner.image_url;
                    document.getElementById('linkUrl').value = banner.link_url || '';
                    document.getElementById('linkText').value = banner.link_text || '';
                    document.getElementById('backgroundColor').value = banner.background_color;
                    document.getElementById('textColor').value = banner.text_color;
                    document.getElementById('displayOrder').value = banner.display_order;
                    document.getElementById('isActive').checked = banner.is_active == 1;
                    
                    if (banner.start_date) {
                        document.getElementById('startDate').value = banner.start_date.replace(' ', 'T');
                    }
                    if (banner.end_date) {
                        document.getElementById('endDate').value = banner.end_date.replace(' ', 'T');
                    }
                    
                    const preview = document.getElementById('imagePreview');
                    preview.innerHTML = `<img src="${banner.image_url}" alt="Preview">`;
                    preview.classList.remove('empty');
                    
                    bootstrap_modal.show();
                    lucide.createIcons();
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Banner yüklenemedi');
            }
        }
        
        /**
         * Banner sil
         */
        async function deleteBanner(id) {
            if (!confirm('Bu banner\'ı silmek istediğinize emin misiniz?')) {
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}?id=${id}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    loadBanners();
                    showSuccess('Banner silindi');
                } else {
                    showError(data.message || 'Silme işlemi başarısız');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Bir hata oluştu');
            }
        }
        
        /**
         * Toast göster
         */
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toastNotification');
            const toastIcon = document.getElementById('toastIcon');
            const toastTitle = document.getElementById('toastTitle');
            const toastBody = document.getElementById('toastBody');
            const toastHeader = toast.querySelector('.toast-header');
            
            if (type === 'success') {
                toastIcon.setAttribute('data-lucide', 'check-circle');
                toastTitle.textContent = 'Başarılı';
                toastHeader.style.backgroundColor = '#d1fae5';
                toastHeader.style.color = '#065f46';
            } else {
                toastIcon.setAttribute('data-lucide', 'alert-circle');
                toastTitle.textContent = 'Hata';
                toastHeader.style.backgroundColor = '#fee2e2';
                toastHeader.style.color = '#991b1b';
            }
            
            toastBody.textContent = message;
            
            lucide.createIcons();
            
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        }
        
        function showSuccess(message) {
            showToast(message, 'success');
        }
        
        function showError(message) {
            showToast(message, 'error');
        }
    </script>
</body>
</html>
