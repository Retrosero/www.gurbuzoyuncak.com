<?php
// Basit auth kontrolü
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ana Sayfa Bölümleri | Gürbüz Oyuncak Admin</title>
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
        
        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background-color: #1E88E5;
            color: #FFFFFF;
        }
        
        .btn-success {
            background-color: #2E7D32;
            color: #FFFFFF;
        }
        
        .btn-danger {
            background-color: #C62828;
            color: #FFFFFF;
        }
        
        .btn-secondary {
            background-color: #6B7280;
            color: #FFFFFF;
        }
        
        .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        table th,
        table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }
        
        table th {
            background-color: #F9FAFB;
            font-weight: 600;
            color: #374151;
        }
        
        .badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .badge-success {
            background-color: #D1FAE5;
            color: #065F46;
        }
        
        .badge-danger {
            background-color: #FEE2E2;
            color: #991B1B;
        }
        
        .badge-info {
            background-color: #DBEAFE;
            color: #1E40AF;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        
        .modal-content {
            background-color: #FFFFFF;
            margin: 5% auto;
            padding: 2rem;
            border-radius: 0.5rem;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
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
        
        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .product-item {
            border: 1px solid #E5E7EB;
            border-radius: 0.375rem;
            padding: 0.5rem;
            text-align: center;
            position: relative;
        }
        
        .product-item img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 0.25rem;
        }
        
        .product-item .remove-btn {
            position: absolute;
            top: 0.25rem;
            right: 0.25rem;
            background-color: #C62828;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
        }
        
        .type-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .type-populer { background-color: #FEE2E2; color: #991B1B; }
        .type-yeni_gelenler { background-color: #DBEAFE; color: #1E40AF; }
        .type-sectiklerimiz { background-color: #FEF3C7; color: #92400E; }
        .type-indirimli { background-color: #D1FAE5; color: #065F46; }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Ana Sayfa Bölümleri</h1>
                <button class="btn btn-primary" onclick="openModal()">Yeni Bölüm Ekle</button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2>Tüm Bölümler</h2>
                </div>
                
                <table id="sectionsTable">
                    <thead>
                        <tr>
                            <th>Bölüm Türü</th>
                            <th>Başlık</th>
                            <th>Sıra</th>
                            <th>Max Ürün</th>
                            <th>Ürün Sayısı</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="sectionsTableBody">
                        <tr>
                            <td colspan="7" style="text-align: center;">Yükleniyor...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Bölüm Modal -->
    <div id="sectionModal" class="modal">
        <div class="modal-content">
            <h2 id="modalTitle">Yeni Bölüm Ekle</h2>
            <form id="sectionForm">
                <input type="hidden" id="sectionId">
                
                <div class="form-group">
                    <label>Bölüm Türü *</label>
                    <select id="sectionType" required>
                        <option value="populer">Popüler Ürünler</option>
                        <option value="yeni_gelenler">Yeni Gelen Ürünler</option>
                        <option value="sectiklerimiz">Bizim Seçtiklerimiz</option>
                        <option value="indirimli">İndirimli Ürünler</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Başlık *</label>
                    <input type="text" id="title" required>
                </div>
                
                <div class="form-group">
                    <label>Alt Başlık</label>
                    <input type="text" id="subtitle">
                </div>
                
                <div class="form-group">
                    <label>Gösterim Sırası</label>
                    <input type="number" id="displayOrder" value="0" min="0">
                </div>
                
                <div class="form-group">
                    <label>Maksimum Ürün Sayısı</label>
                    <input type="number" id="maxItems" value="8" min="1" max="24">
                </div>
                
                <div class="form-group">
                    <label>Arka Plan Rengi (opsiyonel)</label>
                    <input type="color" id="backgroundColor">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="isActive" checked>
                        Aktif
                    </label>
                </div>
                
                <div class="action-buttons">
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">İptal</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Ürün Yönetim Modal -->
    <div id="productsModal" class="modal">
        <div class="modal-content" style="max-width: 800px;">
            <h2 id="productsModalTitle">Bölüm Ürünleri</h2>
            
            <div class="form-group">
                <label>Ürün Ekle</label>
                <select id="productSelect" onchange="addProductToSection()">
                    <option value="">Ürün seçin...</option>
                </select>
            </div>
            
            <div id="sectionProductsGrid" class="product-grid">
                <!-- Ürünler buraya yüklenecek -->
            </div>
            
            <div class="action-buttons" style="margin-top: 1rem;">
                <button type="button" class="btn btn-secondary" onclick="closeProductsModal()">Kapat</button>
            </div>
        </div>
    </div>
    
    <script src="js/homepage_sections.js"></script>
</body>
</html>
