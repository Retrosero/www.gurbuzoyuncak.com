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
    <title>Kategori Yönetimi | Gürbüz Oyuncak Admin</title>
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
        
        .sidebar {
            background-color: #1F2937;
            color: #FFFFFF;
            padding: 2rem 0;
        }
        
        .sidebar-header {
            padding: 0 1.5rem 2rem;
            border-bottom: 1px solid #374151;
        }
        
        .sidebar-header h2 {
            font-size: 1.5rem;
            color: #1E88E5;
        }
        
        .sidebar-menu {
            list-style: none;
            margin-top: 2rem;
        }
        
        .sidebar-menu li {
            margin-bottom: 0.5rem;
        }
        
        .sidebar-menu a {
            display: block;
            padding: 0.75rem 1.5rem;
            color: #D1D5DB;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .sidebar-menu a:hover,
        .sidebar-menu a.active {
            background-color: #374151;
            color: #FFFFFF;
            border-left: 3px solid #1E88E5;
        }
        
        .main-content {
            padding: 2rem;
        }
        
        .top-bar {
            background-color: #FFFFFF;
            padding: 1rem 2rem;
            margin: -2rem -2rem 2rem;
            border-bottom: 1px solid #E5E7EB;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .top-bar h1 {
            font-size: 1.875rem;
            color: #1F2937;
            font-weight: 600;
        }
        
        .card {
            background-color: #FFFFFF;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin-bottom: 2rem;
        }
        
        .card-header {
            padding: 1.5rem;
            border-bottom: 1px solid #E5E7EB;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1F2937;
        }
        
        .card-body {
            padding: 1.5rem;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background-color: #1E88E5;
            color: #FFFFFF;
        }
        
        .btn-primary:hover {
            background-color: #1565C0;
        }
        
        .btn-success {
            background-color: #10B981;
            color: #FFFFFF;
        }
        
        .btn-warning {
            background-color: #F59E0B;
            color: #FFFFFF;
        }
        
        .btn-danger {
            background-color: #EF4444;
            color: #FFFFFF;
        }
        
        .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 0.25rem;
        }
        
        .badge-success {
            background-color: #D1FAE5;
            color: #065F46;
        }
        
        .badge-danger {
            background-color: #FEE2E2;
            color: #991B1B;
        }
        
        .table-container {
            overflow-x: auto;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th,
        .table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .table th {
            background-color: #F9FAFB;
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }
        
        .table td {
            font-size: 0.875rem;
            color: #6B7280;
        }
        
        .actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .form-group {
            margin-bottom: 1rem;
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
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background-color: #FFFFFF;
            padding: 2rem;
            border-radius: 0.5rem;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .close {
            font-size: 1.5rem;
            font-weight: 700;
            color: #6B7280;
            cursor: pointer;
        }
        
        .close:hover {
            color: #1F2937;
        }
        
        .kategori-gorsel {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 0.25rem;
        }
        
        .tree-view {
            list-style: none;
            padding-left: 0;
        }
        
        .tree-view ul {
            list-style: none;
            padding-left: 2rem;
            margin-top: 0.5rem;
        }
        
        .tree-item {
            padding: 0.5rem;
            border-bottom: 1px solid #E5E7EB;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .tree-item .category-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .tree-item .category-name {
            font-weight: 500;
            color: #1F2937;
        }
        
        .tree-item .category-count {
            font-size: 0.75rem;
            color: #6B7280;
            background-color: #F3F4F6;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        
        .alert-success {
            background-color: #D1FAE5;
            color: #065F46;
            border: 1px solid #A7F3D0;
        }
        
        .alert-error {
            background-color: #FEE2E2;
            color: #991B1B;
            border: 1px solid #FECACA;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background-color: #FFFFFF;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .stat-card h3 {
            font-size: 0.875rem;
            color: #6B7280;
            margin-bottom: 0.5rem;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: #1F2937;
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Kategori Yönetimi</h1>
            </div>
            
            <div id="alert-container"></div>
            
            <!-- İstatistikler -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Toplam Kategori</h3>
                    <div class="value" id="total-categories">-</div>
                </div>
                <div class="stat-card">
                    <h3>Ana Kategori</h3>
                    <div class="value" id="parent-categories">-</div>
                </div>
                <div class="stat-card">
                    <h3>Alt Kategori</h3>
                    <div class="value" id="sub-categories">-</div>
                </div>
                <div class="stat-card">
                    <h3>Ürünlü Kategoriler</h3>
                    <div class="value" id="categories-with-products">-</div>
                </div>
            </div>
            
            <!-- Kategori Ağacı -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Kategori Hiyerarşisi</h2>
                    <button class="btn btn-primary" onclick="openModal('add')">
                        Yeni Kategori Ekle
                    </button>
                </div>
                
                <div class="card-body">
                    <div id="category-tree">
                        <p style="text-align: center; padding: 2rem;">Yükleniyor...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Kategori Ekleme/Düzenleme Modal -->
    <div id="category-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Yeni Kategori Ekle</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            
            <form id="category-form" onsubmit="saveCategory(event)">
                <input type="hidden" id="category-id">
                
                <div class="form-group">
                    <label for="kategori-adi">Kategori Adı *</label>
                    <input type="text" id="kategori-adi" required>
                </div>
                
                <div class="form-group">
                    <label for="ust-kategori-id">Üst Kategori</label>
                    <select id="ust-kategori-id">
                        <option value="">Ana Kategori</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="aciklama">Açıklama</label>
                    <textarea id="aciklama" rows="3"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="gorsel-url">Görsel URL</label>
                        <input type="url" id="gorsel-url">
                    </div>
                    <div class="form-group">
                        <label for="sira">Sıra</label>
                        <input type="number" id="sira" min="0" value="0">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="aktif">Durum</label>
                    <select id="aktif">
                        <option value="1">Aktif</option>
                        <option value="0">Pasif</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="submit" class="btn btn-success">Kaydet</button>
                    <button type="button" class="btn btn-danger" onclick="closeModal()">İptal</button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        let categories = [];
        let parentCategories = [];
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            loadCategories();
            loadStats();
        });
        
        // İstatistikleri yükle
        async function loadStats() {
            try {
                const response = await fetch('../backend/api/kategoriler.php/istatistikler');
                const data = await response.json();
                
                if (data.success) {
                    const stats = data.data;
                    
                    document.getElementById('total-categories').textContent = stats.toplam_kategori || '0';
                    document.getElementById('parent-categories').textContent = stats.ana_kategori_sayisi || '0';
                    document.getElementById('sub-categories').textContent = stats.alt_kategori_sayisi || '0';
                    
                    // Ürünlü kategoriler için ayrı çağrı
                    const categoryResponse = await fetch('../backend/api/kategoriler.php');
                    const categoryData = await categoryResponse.json();
                    
                    if (categoryData.success) {
                        const categoriesWithProducts = categoryData.data.filter(cat => cat.urun_sayisi > 0).length;
                        document.getElementById('categories-with-products').textContent = categoriesWithProducts;
                    }
                }
            } catch (error) {
                console.error('İstatistikler yüklenemedi:', error);
            }
        }
        
        // Kategorileri yükle
        async function loadCategories() {
            try {
                const response = await fetch('../backend/api/kategoriler.php/hiyerarşik');
                const data = await response.json();
                
                if (data.success) {
                    categories = data.data;
                    displayCategoryTree(categories);
                    loadParentCategories();
                } else {
                    showAlert('Kategoriler yüklenirken hata oluştu', 'error');
                }
                
            } catch (error) {
                console.error('Kategoriler yüklenemedi:', error);
                showAlert('Kategoriler yüklenirken hata oluştu', 'error');
            }
        }
        
        // Üst kategorileri dropdown için yükle
        async function loadParentCategories() {
            try {
                const response = await fetch('../backend/api/kategoriler.php');
                const data = await response.json();
                
                if (data.success) {
                    parentCategories = data.data;
                    
                    const select = document.getElementById('ust-kategori-id');
                    select.innerHTML = '<option value="">Ana Kategori</option>';
                    
                    parentCategories.forEach(category => {
                        select.innerHTML += `<option value="${category.id}">${category.kategori_adi}</option>`;
                    });
                }
            } catch (error) {
                console.error('Üst kategoriler yüklenemedi:', error);
            }
        }
        
        // Kategori ağacını göster
        function displayCategoryTree(categories) {
            const container = document.getElementById('category-tree');
            
            if (!categories || categories.length === 0) {
                container.innerHTML = '<p style="text-align: center; padding: 2rem;">Kategori bulunamadı</p>';
                return;
            }
            
            container.innerHTML = '<ul class="tree-view">' + renderCategoryTree(categories) + '</ul>';
        }
        
        // Kategori ağacını render et
        function renderCategoryTree(categories) {
            return categories.map(category => {
                let html = `
                    <li>
                        <div class="tree-item">
                            <div class="category-info">
                                ${category.gorsel_url ? 
                                    `<img src="${category.gorsel_url}" alt="${category.kategori_adi}" class="kategori-gorsel">` : 
                                    ''
                                }
                                <span class="category-name">${category.kategori_adi}</span>
                                <span class="category-count">${category.urun_sayisi || 0} ürün</span>
                                <span class="badge ${category.aktif == 1 ? 'badge-success' : 'badge-danger'}">
                                    ${category.aktif == 1 ? 'Aktif' : 'Pasif'}
                                </span>
                            </div>
                            <div class="actions">
                                <button class="btn btn-warning btn-sm" onclick="editCategory(${category.id})">
                                    Düzenle
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">
                                    Sil
                                </button>
                            </div>
                        </div>
                `;
                
                if (category.alt_kategoriler && category.alt_kategoriler.length > 0) {
                    html += '<ul>' + renderCategoryTree(category.alt_kategoriler) + '</ul>';
                }
                
                html += '</li>';
                return html;
            }).join('');
        }
        
        // Modal aç
        function openModal(mode, categoryId = null) {
            const modal = document.getElementById('category-modal');
            const title = document.getElementById('modal-title');
            
            if (mode === 'add') {
                title.textContent = 'Yeni Kategori Ekle';
                document.getElementById('category-form').reset();
                document.getElementById('category-id').value = '';
            }
            
            modal.classList.add('active');
        }
        
        // Modal kapat
        function closeModal() {
            document.getElementById('category-modal').classList.remove('active');
        }
        
        // Kategori düzenle
        async function editCategory(id) {
            try {
                const response = await fetch(`../backend/api/kategoriler.php/${id}`);
                const data = await response.json();
                
                if (data.success) {
                    const category = data.data;
                    
                    document.getElementById('modal-title').textContent = 'Kategori Düzenle';
                    document.getElementById('category-id').value = category.id;
                    document.getElementById('kategori-adi').value = category.kategori_adi || '';
                    document.getElementById('ust-kategori-id').value = category.ust_kategori_id || '';
                    document.getElementById('aciklama').value = category.aciklama || '';
                    document.getElementById('gorsel-url').value = category.gorsel_url || '';
                    document.getElementById('sira').value = category.sira || '0';
                    document.getElementById('aktif').value = category.aktif || '1';
                    
                    openModal('edit', id);
                } else {
                    showAlert('Kategori bilgileri yüklenemedi', 'error');
                }
                
            } catch (error) {
                console.error('Kategori bilgileri yüklenemedi:', error);
                showAlert('Kategori bilgileri yüklenirken hata oluştu', 'error');
            }
        }
        
        // Kategori kaydet
        async function saveCategory(event) {
            event.preventDefault();
            
            const id = document.getElementById('category-id').value;
            const isEdit = id !== '';
            
            const categoryData = {
                kategori_adi: document.getElementById('kategori-adi').value,
                ust_kategori_id: document.getElementById('ust-kategori-id').value || null,
                aciklama: document.getElementById('aciklama').value,
                gorsel_url: document.getElementById('gorsel-url').value,
                sira: parseInt(document.getElementById('sira').value) || 0,
                aktif: parseInt(document.getElementById('aktif').value)
            };
            
            try {
                const url = isEdit ? `../backend/api/kategoriler.php/${id}` : '../backend/api/kategoriler.php';
                const method = isEdit ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(categoryData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert(isEdit ? 'Kategori başarıyla güncellendi' : 'Kategori başarıyla eklendi', 'success');
                    closeModal();
                    loadCategories();
                    loadStats();
                } else {
                    showAlert(data.message || 'İşlem başarısız', 'error');
                }
                
            } catch (error) {
                console.error('Kategori kaydedilemedi:', error);
                showAlert('Kategori kaydedilirken hata oluştu', 'error');
            }
        }
        
        // Kategori sil
        async function deleteCategory(id) {
            if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
                return;
            }
            
            try {
                const response = await fetch(`../backend/api/kategoriler.php/${id}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Kategori başarıyla silindi', 'success');
                    loadCategories();
                    loadStats();
                } else {
                    showAlert(data.message || 'Kategori silinemedi', 'error');
                }
                
            } catch (error) {
                console.error('Kategori silinemedi:', error);
                showAlert('Kategori silinirken hata oluştu', 'error');
            }
        }
        
        // Alert göster
        function showAlert(message, type) {
            const container = document.getElementById('alert-container');
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.textContent = message;
            
            container.appendChild(alert);
            
            setTimeout(() => {
                container.removeChild(alert);
            }, 5000);
        }
    </script>
</body>
</html>