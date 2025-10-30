<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/../components/ComponentLoader.php';

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
    <title>Ana Sayfa Bölümleri | Gürbüz Oyuncak Admin</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="/components/css/components.css">
    
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --sidebar-width: 280px;
            --topbar-height: 70px;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fc;
        }
        
        .admin-wrapper {
            display: flex;
            min-height: 100vh;
        }
        
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: calc(var(--topbar-height) + 2rem) 2rem 2rem;
        }
        
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
        
        .section-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
        }
        
        .card-header-custom {
            background: var(--primary-gradient);
            color: white;
            padding: 1.5rem;
            border-radius: 12px 12px 0 0;
        }
        
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
        }
        
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
        }
    </style>
</head>
<body>
    <div class="admin-wrapper">
        <?php component('sidebar', ['variant' => 'admin']); ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>
                    <i data-lucide="layout-dashboard" style="width: 32px; height: 32px;"></i>
                    Ana Sayfa Bölümleri
                </h1>
                <button class="btn btn-primary-gradient" data-bs-toggle="modal" data-bs-target="#sectionModal" onclick="openModal()">
                    <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                    Yeni Bölüm
                </button>
            </div>
            
            <div class="section-card">
                <div class="card-header-custom">
                    <h3 class="m-0">Ana Sayfa Bölümleri</h3>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th>Tür</th>
                                <th>Sıra</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="sectionsTableBody">
                            <tr>
                                <td colspan="5" class="text-center py-4">
                                    <i data-lucide="loader-2" style="width: 32px; height: 32px; animation: spin 1s linear infinite;"></i>
                                    <p class="mt-2">Yükleniyor...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal -->
    <div class="modal fade" id="sectionModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header" style="background: var(--primary-gradient); color: white;">
                    <h5 class="modal-title" id="modalTitle">Yeni Bölüm Ekle</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" style="filter: brightness(0) invert(1);"></button>
                </div>
                <div class="modal-body">
                    <form id="sectionForm">
                        <input type="hidden" id="sectionId">
                        
                        <div class="mb-3">
                            <label class="form-label">Başlık *</label>
                            <input type="text" class="form-control" id="title" required>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Alt Başlık</label>
                            <input type="text" class="form-control" id="subtitle">
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Bölüm Türü *</label>
                                <select class="form-select" id="sectionType" required>
                                    <option value="banner">Banner</option>
                                    <option value="categories">Kategoriler</option>
                                    <option value="products">Ürünler</option>
                                    <option value="featured">Öne Çıkanlar</option>
                                    <option value="campaigns">Kampanyalar</option>
                                    <option value="brands">Markalar</option>
                                </select>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Sıra</label>
                                <input type="number" class="form-control" id="displayOrder" value="0" min="0">
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
                    <button type="button" class="btn btn-primary-gradient" onclick="saveSection()">Kaydet</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/components/js/component-loader.js"></script>
    
    <script>
        lucide.createIcons();
        
        const API_BASE = '/backend/api/homepage_sections.php';
        let bootstrap_modal;
        
        document.addEventListener('DOMContentLoaded', function() {
            bootstrap_modal = new bootstrap.Modal(document.getElementById('sectionModal'));
            loadSections();
        });
        
        async function loadSections() {
            try {
                const response = await fetch(API_BASE);
                const data = await response.json();
                
                if (data.success) {
                    displaySections(data.data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        function displaySections(sections) {
            const tbody = document.getElementById('sectionsTableBody');
            
            if (sections.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Bölüm bulunamadı</td></tr>';
                return;
            }
            
            tbody.innerHTML = sections.map(section => `
                <tr>
                    <td><strong>${section.title}</strong><br><small class="text-muted">${section.subtitle || ''}</small></td>
                    <td><span class="badge bg-info">${section.section_type}</span></td>
                    <td><span class="badge bg-secondary">${section.display_order}</span></td>
                    <td>
                        <span class="badge ${section.is_active == 1 ? 'bg-success' : 'bg-danger'}">
                            ${section.is_active == 1 ? 'Aktif' : 'Pasif'}
                        </span>
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-primary btn-sm" onclick="editSection(${section.id})">
                                <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteSection(${section.id})">
                                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            lucide.createIcons();
        }
        
        function openModal() {
            document.getElementById('sectionForm').reset();
            document.getElementById('sectionId').value = '';
            document.getElementById('modalTitle').textContent = 'Yeni Bölüm Ekle';
            document.getElementById('isActive').checked = true;
        }
        
        async function saveSection() {
            const sectionId = document.getElementById('sectionId').value;
            
            const sectionData = {
                title: document.getElementById('title').value,
                subtitle: document.getElementById('subtitle').value,
                section_type: document.getElementById('sectionType').value,
                display_order: document.getElementById('displayOrder').value,
                is_active: document.getElementById('isActive').checked ? 1 : 0
            };
            
            try {
                const method = sectionId ? 'PUT' : 'POST';
                const url = sectionId ? `${API_BASE}?id=${sectionId}` : API_BASE;
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sectionData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    bootstrap_modal.hide();
                    loadSections();
                    alert(sectionId ? 'Bölüm güncellendi' : 'Bölüm eklendi');
                } else {
                    alert('Hata: ' + (data.message || 'İşlem başarısız'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Bir hata oluştu');
            }
        }
        
        async function editSection(id) {
            try {
                const response = await fetch(`${API_BASE}?id=${id}`);
                const data = await response.json();
                
                if (data.success) {
                    const section = data.data;
                    
                    document.getElementById('modalTitle').textContent = 'Bölüm Düzenle';
                    document.getElementById('sectionId').value = section.id;
                    document.getElementById('title').value = section.title;
                    document.getElementById('subtitle').value = section.subtitle || '';
                    document.getElementById('sectionType').value = section.section_type;
                    document.getElementById('displayOrder').value = section.display_order;
                    document.getElementById('isActive').checked = section.is_active == 1;
                    
                    bootstrap_modal.show();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function deleteSection(id) {
            if (!confirm('Bu bölümü silmek istediğinize emin misiniz?')) return;
            
            try {
                const response = await fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' });
                const data = await response.json();
                
                if (data.success) {
                    loadSections();
                    alert('Bölüm silindi');
                } else {
                    alert('Hata: ' + (data.message || 'Silme başarısız'));
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    </script>
    
    <style>
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</body>
</html>
