<?php
// Basit auth kontrolü
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banner Yönetimi | Gürbüz Oyuncak Admin</title>
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
        
        .btn-primary:hover {
            background-color: #1565C0;
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
        
        table tr:hover {
            background-color: #F9FAFB;
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
        
        .form-group input[type="color"] {
            height: 40px;
        }
        
        .form-group input[type="file"] {
            padding: 0.25rem;
        }
        
        .banner-preview {
            width: 100%;
            max-height: 200px;
            object-fit: cover;
            border-radius: 0.375rem;
            margin-top: 0.5rem;
        }
        
        .banner-thumbnail {
            width: 120px;
            height: 60px;
            object-fit: cover;
            border-radius: 0.25rem;
        }
        
        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Banner Yönetimi</h1>
                <button class="btn btn-primary" onclick="openModal()">Yeni Banner Ekle</button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2>Tüm Banner'lar</h2>
                </div>
                
                <table id="bannersTable">
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
                            <td colspan="7" style="text-align: center;">Yükleniyor...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Banner Modal -->
    <div id="bannerModal" class="modal">
        <div class="modal-content">
            <h2 id="modalTitle">Yeni Banner Ekle</h2>
            <form id="bannerForm">
                <input type="hidden" id="bannerId">
                
                <div class="form-group">
                    <label>Başlık *</label>
                    <input type="text" id="title" required>
                </div>
                
                <div class="form-group">
                    <label>Alt Başlık</label>
                    <input type="text" id="subtitle">
                </div>
                
                <div class="form-group">
                    <label>Banner Görseli *</label>
                    <input type="file" id="imageFile" accept="image/*" onchange="previewImage(event)">
                    <input type="hidden" id="imageUrl">
                    <img id="imagePreview" class="banner-preview" style="display: none;">
                </div>
                
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" id="linkUrl" placeholder="/products.html">
                </div>
                
                <div class="form-group">
                    <label>Link Butonu Metni</label>
                    <input type="text" id="linkText" placeholder="Şimdi Keşfet">
                </div>
                
                <div class="form-group">
                    <label>Arka Plan Rengi</label>
                    <input type="color" id="backgroundColor" value="#1E88E5">
                </div>
                
                <div class="form-group">
                    <label>Metin Rengi</label>
                    <input type="color" id="textColor" value="#FFFFFF">
                </div>
                
                <div class="form-group">
                    <label>Gösterim Sırası</label>
                    <input type="number" id="displayOrder" value="0" min="0">
                </div>
                
                <div class="form-group">
                    <label>Başlangıç Tarihi</label>
                    <input type="datetime-local" id="startDate">
                </div>
                
                <div class="form-group">
                    <label>Bitiş Tarihi</label>
                    <input type="datetime-local" id="endDate">
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
    
    <script src="js/banners.js"></script>
</body>
</html>
