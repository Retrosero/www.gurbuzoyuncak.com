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
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
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
        
        .btn-danger {
            background-color: #C62828;
            color: #FFFFFF;
            padding: 0.375rem 0.75rem;
        }
        
        .btn-warning {
            background-color: #F9A825;
            color: #FFFFFF;
            padding: 0.375rem 0.75rem;
        }
        
        .btn-success {
            background-color: #2E7D32;
            color: #FFFFFF;
        }
        
        .btn-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead {
            background-color: #F9FAFB;
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }
        
        th {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }
        
        tbody tr:hover {
            background-color: #F9FAFB;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .badge-success {
            background-color: #D1FAE5;
            color: #065F46;
        }
        
        .badge-danger {
            background-color: #FEE2E2;
            color: #991B1B;
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
        
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
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
            max-width: 500px;
            width: 90%;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .modal-header h3 {
            font-size: 1.25rem;
            color: #1F2937;
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
        
        .actions {
            display: flex;
            gap: 0.5rem;
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
        
        .category-icon {
            width: 40px;
            height: 40px;
            background-color: #E3F2FD;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <!-- Main Content -->
        <main class="main-content">
            <div class="top-bar">
                <h1>Kategori Yönetimi</h1>
                <button class="btn btn-primary" onclick="openModal('add')">
                    + Yeni Kategori Ekle
                </button>
            </div>
            
            <div id="alert-container"></div>
            
            <!-- Categories Table -->
            <div class="card">
                <div class="card-header">
                    <h2>Kategoriler</h2>
                    <span id="category-count">Toplam: 0 kategori</span>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>İkon</th>
                            <th>Kategori Adı</th>
                            <th>Slug</th>
                            <th>Açıklama</th>
                            <th>Ürün Sayısı</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="categories-table">
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 2rem; color: #6B7280;">
                                Yükleniyor...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    
    <!-- Add/Edit Category Modal -->
    <div id="category-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Yeni Kategori Ekle</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            
            <form id="category-form" onsubmit="saveCategory(event)">
                <input type="hidden" id="category-id">
                
                <div class="form-group">
                    <label>Kategori Adı *</label>
                    <input type="text" id="category-name" required>
                </div>
                
                <div class="form-group">
                    <label>Slug *</label>
                    <input type="text" id="category-slug" required>
                    <small style="color: #6B7280; font-size: 0.75rem;">
                        URL'de kullanılacak (örn: bebekler-aksesuar)
                    </small>
                </div>
                
                <div class="form-group">
                    <label>Açıklama</label>
                    <textarea id="category-description"></textarea>
                </div>
                
                <div class="form-group">
                    <label>İkon (Emoji)</label>
                    <input type="text" id="category-icon" placeholder="🧸">
                    <small style="color: #6B7280; font-size: 0.75rem;">
                        Kategoriyi temsil eden emoji girin
                    </small>
                </div>
                
                <div class="form-group">
                    <label>Sıralama</label>
                    <input type="number" id="category-order" value="0">
                </div>
                
                <div class="form-group">
                    <label>Durum</label>
                    <select id="category-status">
                        <option value="1">Aktif</option>
                        <option value="0">Pasif</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-success" style="flex: 1;">
                        Kaydet
                    </button>
                    <button type="button" class="btn btn-danger" onclick="closeModal()" style="flex: 1;">
                        İptal
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            loadCategories();
        });
        
        // Kategorileri yükle
        async function loadCategories() {
            try {
                const response = await fetch('../backend/api/categories.php');
                const data = await response.json();
                
                const categories = data.data || [];
                const tbody = document.getElementById('categories-table');
                document.getElementById('category-count').textContent = `Toplam: ${categories.length} kategori`;
                
                if (categories.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 2rem; color: #6B7280;">
                                Kategori bulunamadı
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                tbody.innerHTML = categories.map(cat => `
                    <tr>
                        <td>
                            <div class="category-icon">
                                ${cat.icon || '📦'}
                            </div>
                        </td>
                        <td><strong>${cat.name}</strong></td>
                        <td><code>${cat.slug}</code></td>
                        <td>${cat.description || '-'}</td>
                        <td>${cat.product_count || 0}</td>
                        <td>
                            <span class="badge ${cat.is_active ? 'badge-success' : 'badge-danger'}">
                                ${cat.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                        </td>
                        <td>
                            <div class="actions">
                                <button class="btn btn-warning btn-sm" onclick="editCategory(${cat.id})">
                                    Düzenle
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${cat.id})">
                                    Sil
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Kategoriler yüklenemedi:', error);
                showAlert('Kategoriler yüklenirken hata oluştu', 'error');
            }
        }
        
        // Modal aç
        function openModal(mode) {
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
                const response = await fetch(`../backend/api/categories.php?id=${id}`);
                const data = await response.json();
                const category = data.data;
                
                document.getElementById('modal-title').textContent = 'Kategori Düzenle';
                document.getElementById('category-id').value = category.id;
                document.getElementById('category-name').value = category.name;
                document.getElementById('category-slug').value = category.slug;
                document.getElementById('category-description').value = category.description || '';
                document.getElementById('category-icon').value = category.icon || '';
                document.getElementById('category-order').value = category.display_order || 0;
                document.getElementById('category-status').value = category.is_active ? '1' : '0';
                
                openModal('edit');
                
            } catch (error) {
                console.error('Kategori bilgileri yüklenemedi:', error);
                showAlert('Kategori bilgileri yüklenirken hata oluştu', 'error');
            }
        }
        
        // Kategori kaydet
        async function saveCategory(event) {
            event.preventDefault();
            
            const id = document.getElementById('category-id').value;
            const method = id ? 'PUT' : 'POST';
            
            const categoryData = {
                name: document.getElementById('category-name').value,
                slug: document.getElementById('category-slug').value,
                description: document.getElementById('category-description').value,
                icon: document.getElementById('category-icon').value || null,
                display_order: document.getElementById('category-order').value,
                is_active: document.getElementById('category-status').value
            };
            
            if (id) {
                categoryData.id = id;
            }
            
            try {
                const response = await fetch('../backend/api/categories.php', {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(categoryData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert(id ? 'Kategori başarıyla güncellendi' : 'Kategori başarıyla eklendi', 'success');
                    closeModal();
                    loadCategories();
                } else {
                    showAlert(result.message || 'İşlem başarısız', 'error');
                }
                
            } catch (error) {
                console.error('Kategori kaydedilirken hata:', error);
                showAlert('Kategori kaydedilirken hata oluştu', 'error');
            }
        }
        
        // Kategori sil
        async function deleteCategory(id) {
            if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                return;
            }
            
            try {
                const response = await fetch('../backend/api/categories.php', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: id })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert('Kategori başarıyla silindi', 'success');
                    loadCategories();
                } else {
                    showAlert(result.message || 'Silme işlemi başarısız', 'error');
                }
                
            } catch (error) {
                console.error('Kategori silinirken hata:', error);
                showAlert('Kategori silinirken hata oluştu', 'error');
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
        
        // Kategori adından slug oluştur
        document.getElementById('category-name').addEventListener('input', function(e) {
            const slug = e.target.value
                .toLowerCase()
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            
            document.getElementById('category-slug').value = slug;
        });
    </script>
</body>
</html>
