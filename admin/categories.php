<?php
/**
 * Kategori Yönetimi
 * Gürbüz Oyuncak E-Ticaret Sistemi
 * Mobile Responsive & Modern Design
 */

session_start();
require_once 'includes/auth.php';

// Admin girişi zorunlu
if (!isAdminLoggedIn()) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="theme-color" content="#1E88E5">
    
    <title>Kategori Yönetimi | Admin Panel - Gürbüz Oyuncak</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/admin/css/style.css">
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body { background-color: #F8FAFC; padding-top: 70px; }
        .main-content { margin-left: 0; padding: 2rem 0; }
        
        @media (min-width: 992px) {
            .main-content { margin-left: 280px; }
        }
        
        .category-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .table-responsive { border-radius: 12px; overflow: hidden; }
    </style>
</head>
<body>
    <?php
    // Component Loader
    require_once __DIR__ . '/../components/ComponentLoader.php';
    
    // Navbar (admin variant)
    component('navbar', ['variant' => 'admin']);
    
    // Sidebar (admin variant)
    component('sidebar', ['variant' => 'admin']);
    ?>
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="container-fluid px-3 px-md-4">
            <!-- Başlık -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h1 class="h3 mb-1">
                                <i class="fas fa-folder-open text-primary me-2"></i>Kategori Yönetimi
                            </h1>
                            <p class="text-muted mb-0">Ürün kategorilerini yönetin</p>
                        </div>
                        <div>
                            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#categoryModal" onclick="resetForm()">
                                <i class="fas fa-plus me-2"></i>Yeni Kategori
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Alert Container -->
            <div id="alert-container"></div>
            
            <!-- Kategoriler Tablosu -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Kategoriler</h5>
                        <span class="badge bg-primary" id="category-count">Yükleniyor...</span>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>İkon</th>
                                <th>Kategori Adı</th>
                                <th>Slug</th>
                                <th class="d-none d-md-table-cell">Açıklama</th>
                                <th class="d-none d-lg-table-cell">Ürün Sayısı</th>
                                <th>Durum</th>
                                <th class="text-end">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="categories-table">
                            <tr>
                                <td colspan="7" class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Yükleniyor...</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Kategori Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal-title">Yeni Kategori Ekle</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="category-form" onsubmit="saveCategory(event)">
                    <div class="modal-body">
                        <input type="hidden" id="category-id">
                        
                        <div class="mb-3">
                            <label for="category-name" class="form-label">Kategori Adı <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="category-name" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="category-slug" class="form-label">Slug <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="category-slug" required>
                            <small class="form-text text-muted">URL'de kullanılacak (örn: bebekler-aksesuar)</small>
                        </div>
                        
                        <div class="mb-3">
                            <label for="category-description" class="form-label">Açıklama</label>
                            <textarea class="form-control" id="category-description" rows="3"></textarea>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="category-icon" class="form-label">İkon (Emoji)</label>
                                <input type="text" class="form-control" id="category-icon" placeholder="🧸">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label for="category-order" class="form-label">Sıralama</label>
                                <input type="number" class="form-control" id="category-order" value="0">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="category-status" class="form-label">Durum</label>
                            <select class="form-select" id="category-status">
                                <option value="1">Aktif</option>
                                <option value="0">Pasif</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>İptal
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader -->
    <script src="../components/js/component-loader.js"></script>
    
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
                document.getElementById('category-count').textContent = `${categories.length} kategori`;
                
                if (categories.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center py-5">
                                <div class="text-muted">
                                    <i class="fas fa-inbox fa-3x mb-3"></i>
                                    <p>Henüz kategori eklenmemiş</p>
                                </div>
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
                        <td>
                            <strong>${cat.name}</strong>
                        </td>
                        <td><code class="text-muted">${cat.slug}</code></td>
                        <td class="d-none d-md-table-cell">
                            <small class="text-muted">${cat.description || '-'}</small>
                        </td>
                        <td class="d-none d-lg-table-cell">
                            <span class="badge bg-secondary">${cat.product_count || 0}</span>
                        </td>
                        <td>
                            <span class="badge bg-${cat.is_active ? 'success' : 'danger'}">
                                ${cat.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                        </td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-warning" onclick="editCategory(${cat.id})" title="Düzenle">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})" title="Sil">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Kategoriler yüklenemedi:', error);
                showAlert('Kategoriler yüklenirken hata oluştu', 'danger');
            }
        }
        
        // Form sıfırla
        function resetForm() {
            document.getElementById('category-form').reset();
            document.getElementById('category-id').value = '';
            document.getElementById('modal-title').textContent = 'Yeni Kategori Ekle';
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
                
                new bootstrap.Modal(document.getElementById('categoryModal')).show();
                
            } catch (error) {
                console.error('Kategori bilgileri yüklenemedi:', error);
                showAlert('Kategori bilgileri yüklenirken hata oluştu', 'danger');
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
                    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
                    loadCategories();
                } else {
                    showAlert(result.message || 'İşlem başarısız', 'danger');
                }
                
            } catch (error) {
                console.error('Kategori kaydedilirken hata:', error);
                showAlert('Kategori kaydedilirken hata oluştu', 'danger');
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
                    showAlert(result.message || 'Silme işlemi başarısız', 'danger');
                }
                
            } catch (error) {
                console.error('Kategori silinirken hata:', error);
                showAlert('Kategori silinirken hata oluştu', 'danger');
            }
        }
        
        // Alert göster
        function showAlert(message, type) {
            const container = document.getElementById('alert-container');
            const alertHtml = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            container.innerHTML = alertHtml;
            
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    bootstrap.Alert.getInstance(alert)?.close();
                }
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
