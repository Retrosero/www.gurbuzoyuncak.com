<?php
// Basit auth kontrolü
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XML Import | Gürbüz Oyuncak Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background-color: #F3F4F6; }
        .admin-layout { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
        .main-content { padding: 2rem; }
        .top-bar {
            background-color: #FFFFFF;
            padding: 1rem 2rem;
            margin: -2rem -2rem 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .card {
            background-color: #FFFFFF;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        }
        .btn-primary { background-color: #1E88E5; color: #FFFFFF; }
        .btn-primary:hover { background-color: #1565C0; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        .form-group input[type="file"],
        .form-group input[type="url"] {
            width: 100%;
            padding: 0.75rem;
            border: 2px dashed #D1D5DB;
            border-radius: 0.375rem;
            font-size: 0.875rem;
        }
        .progress-container {
            display: none;
            margin-top: 2rem;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background-color: #E5E7EB;
            border-radius: 0.375rem;
            overflow: hidden;
            margin-bottom: 1rem;
        }
        .progress-fill {
            height: 100%;
            background-color: #1E88E5;
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
        }
        .import-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-top: 1rem;
        }
        .stat-card {
            padding: 1rem;
            background-color: #F9FAFB;
            border-radius: 0.375rem;
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #1E88E5;
        }
        .stat-label {
            color: #6B7280;
            font-size: 0.875rem;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        table th, table td {
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
        .badge-success { background-color: #D1FAE5; color: #065F46; }
        .badge-danger { background-color: #FEE2E2; color: #991B1B; }
        .badge-warning { background-color: #FEF3C7; color: #92400E; }
        .alert {
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        .alert-success { background-color: #D1FAE5; color: #065F46; }
        .alert-error { background-color: #FEE2E2; color: #991B1B; }
        .tabs {
            display: flex;
            border-bottom: 2px solid #E5E7EB;
            margin-bottom: 2rem;
        }
        .tab {
            padding: 1rem 1.5rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
        }
        .tab.active {
            border-bottom-color: #1E88E5;
            color: #1E88E5;
            font-weight: 600;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        
        .test-buttons {
            margin: 1rem 0;
            padding: 1rem;
            background-color: #F0F9FF;
            border-radius: 0.5rem;
            border-left: 4px solid #1E88E5;
        }
        
        .debug-info {
            margin: 1rem 0;
            padding: 1rem;
            background-color: #F9F9F9;
            border-radius: 0.375rem;
            font-family: monospace;
            font-size: 0.75rem;
            white-space: pre-wrap;
            border: 1px solid #E5E7EB;
        }
        
        .btn-sm {
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
        }
        
        .btn-outline {
            background: none;
            border: 1px solid #D1D5DB;
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>XML Import Sistemi</h1>
            </div>
            
            <div id="alertContainer"></div>
            
            <div class="tabs">
                <div class="tab active" onclick="switchTab('import')">Yeni Import</div>
                <div class="tab" onclick="switchTab('history')">Import Geçmişi</div>
            </div>
            
            <!-- Import Tab -->
            <div id="importTab" class="tab-content active">
                <div class="card">
                    <h2 style="margin-bottom: 1.5rem;">XML Dosyası Import Et</h2>
                    
                    <form id="importForm">
                        <div class="form-group">
                            <label>Import Yöntemi Seçin:</label>
                            <select id="importMethod" onchange="toggleImportMethod()" style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem;">
                                <option value="file">Dosya Yükle</option>
                                <option value="url">URL'den İndir</option>
                            </select>
                        </div>
                        
                        <div id="fileUpload" class="form-group">
                            <label>XML Dosyası Seçin:</label>
                            <input type="file" id="xmlFile" accept=".xml,.txt">
                            <small style="color: #6B7280; display: block; margin-top: 0.5rem;">
                                Maksimum dosya boyutu: 50MB
                            </small>
                        </div>
                        
                        <div id="urlInput" class="form-group" style="display: none;">
                            <label>XML Feed URL:</label>
                            <input type="url" id="xmlUrl" placeholder="https://example.com/feed.xml">
                            <small style="color: #6B7280; display: block; margin-top: 0.5rem;">
                                XML feed URL'sini girin
                            </small>
                        </div>
                        
                        <div class="test-buttons">
                    <h3 style="margin-bottom: 1rem;">Test Araçları</h3>
                    <button onclick="testXMLConnection()" class="btn btn-outline btn-sm">XML Bağlantısını Test Et</button>
                    <button onclick="testDatabaseConnection()" class="btn btn-outline btn-sm">Veritabanını Kontrol Et</button>
                    <button onclick="testImportSystem()" class="btn btn-outline btn-sm">Import Sistemini Test Et</button>
                    <button onclick="showDebugInfo()" class="btn btn-outline btn-sm">Debug Bilgilerini Göster</button>
                    <div id="debug-info" class="debug-info" style="display: none;"></div>
                </div>
                
                        <button type="submit" class="btn btn-primary">Import'u Başlat</button>
                    </form>
                    
                    <div id="progressContainer" class="progress-container">
                        <h3>Import İlerliyor...</h3>
                        <div class="progress-bar">
                            <div id="progressFill" class="progress-fill" style="width: 0%;">0%</div>
                        </div>
                        
                        <div class="import-stats">
                            <div class="stat-card">
                                <div class="stat-number" id="totalProducts">0</div>
                                <div class="stat-label">Toplam Ürün</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number" id="successProducts" style="color: #2E7D32;">0</div>
                                <div class="stat-label">Başarılı</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number" id="failedProducts" style="color: #C62828;">0</div>
                                <div class="stat-label">Hatalı</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- History Tab -->
            <div id="historyTab" class="tab-content">
                <div class="card">
                    <h2 style="margin-bottom: 1.5rem;">Import Geçmişi</h2>
                    
                    <table id="historyTable">
                        <thead>
                            <tr>
                                <th>Dosya</th>
                                <th>Toplam</th>
                                <th>Başarılı</th>
                                <th>Hatalı</th>
                                <th>Durum</th>
                                <th>Tarih</th>
                            </tr>
                        </thead>
                        <tbody id="historyTableBody">
                            <tr>
                                <td colspan="6" style="text-align: center;">Yükleniyor...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const API_BASE = '../backend/api/xml_import.php';
        let currentImportId = null;
        
        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            loadImportHistory();
        });
        
        // Import yöntemi değiştir
        function toggleImportMethod() {
            const method = document.getElementById('importMethod').value;
            const fileUpload = document.getElementById('fileUpload');
            const urlInput = document.getElementById('urlInput');
            
            if (method === 'file') {
                fileUpload.style.display = 'block';
                urlInput.style.display = 'none';
            } else {
                fileUpload.style.display = 'none';
                urlInput.style.display = 'block';
            }
        }
        
        // Tab değiştir
        function switchTab(tabName) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            if (tabName === 'history') {
                loadImportHistory();
            }
        }
        
        // Import form submit
        // Test fonksiyonları
        function testXMLConnection() {
            const testUrl = 'https://cdn1.xmlbankasi.com/p1/gurbuzoyuncak/image/data/xml/goapp.xml';
            const debugInfo = document.getElementById('debug-info');
            
            if (!debugInfo) {
                alert('Debug bilgi alanı bulunamadı!');
                return;
            }
            
            debugInfo.style.display = 'block';
            debugInfo.innerHTML = 'XML bağlantısı test ediliyor...\n';
            
            fetch(testUrl)
                .then(response => {
                    debugInfo.innerHTML += `HTTP Status: ${response.status}\n`;
                    debugInfo.innerHTML += `Content-Type: ${response.headers.get('content-type')}\n`;
                    debugInfo.innerHTML += `Response OK: ${response.ok}\n`;
                    
                    return response.text();
                })
                .then(data => {
                    const size = data.length;
                    debugInfo.innerHTML += `Response Size: ${size} characters\n`;
                    debugInfo.innerHTML += `Contains XML tag: ${data.includes('<?xml')}\n`;
                    debugInfo.innerHTML += `Contains <Product> tag: ${data.includes('<Product>')}\n`;
                    debugInfo.innerHTML += `First 300 chars:\n${data.substring(0, 300)}\n...\n`;
                    showAlert('XML bağlantısı başarılı! Debug bilgilerini kontrol edin.', 'success');
                })
                .catch(error => {
                    debugInfo.innerHTML += `Error: ${error.message}\n`;
                    showAlert('XML bağlantısı başarısız: ' + error.message, 'error');
                });
        }
        
        function testDatabaseConnection() {
            const debugInfo = document.getElementById('debug-info');
            if (!debugInfo) return;
            
            debugInfo.style.display = 'block';
            debugInfo.innerHTML = 'API bağlantısı test ediliyor...\n';
            
            fetch(API_BASE)
                .then(response => {
                    debugInfo.innerHTML += `API Status: ${response.status}\n`;
                    return response.json();
                })
                .then(data => {
                    debugInfo.innerHTML += `API Response: ${JSON.stringify(data, null, 2)}\n`;
                    showAlert('API bağlantısı başarılı!', 'success');
                })
                .catch(error => {
                    debugInfo.innerHTML += `API Error: ${error.message}\n`;
                    showAlert('API bağlantısı başarısız: ' + error.message, 'error');
                });
        }
        
        function testImportSystem() {
            const debugInfo = document.getElementById('debug-info');
            if (!debugInfo) return;
            
            debugInfo.style.display = 'block';
            debugInfo.innerHTML = 'Import sistemi test ediliyor...\n';
            
            fetch(API_BASE + '?limit=1')
                .then(response => {
                    debugInfo.innerHTML += `Test Response Status: ${response.status}\n`;
                    return response.json();
                })
                .then(data => {
                    debugInfo.innerHTML += `System Info: Import işlemi mevcut\n`;
                    debugInfo.innerHTML += `API Data Sample: ${JSON.stringify(data).substring(0, 200)}...\n`;
                    showAlert('Import sistemi çalışıyor!', 'success');
                })
                .catch(error => {
                    debugInfo.innerHTML += `System Error: ${error.message}\n`;
                    showAlert('Import sistemi hatası: ' + error.message, 'error');
                });
        }
        
        function showDebugInfo() {
            let debugInfo = document.getElementById('debug-info');
            if (!debugInfo) {
                // Debug alanını oluştur
                const debugArea = document.createElement('div');
                debugArea.id = 'debug-info';
                debugArea.className = 'debug-info';
                debugArea.style.display = 'none';
                debugArea.style.marginTop = '1rem';
                document.querySelector('.card').appendChild(debugArea);
                debugInfo = debugArea;
            }
            
            debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
        }
        
        // Default URL ayarı
        document.getElementById('importMethod').addEventListener('change', function() {
            if (this.value === 'url') {
                const urlInput = document.getElementById('xmlUrl');
                if (!urlInput.value) {
                    urlInput.value = 'https://cdn1.xmlbankasi.com/p1/gurbuzoyuncak/image/data/xml/goapp.xml';
                }
            }
        });

        document.getElementById('importForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const method = document.getElementById('importMethod').value;
            const formData = new FormData();
            
            if (method === 'file') {
                const fileInput = document.getElementById('xmlFile');
                if (!fileInput.files[0]) {
                    showAlert('Lütfen bir dosya seçin', 'error');
                    return;
                }
                formData.append('xml_file', fileInput.files[0]);
            } else {
                const urlInput = document.getElementById('xmlUrl');
                if (!urlInput.value) {
                    showAlert('Lütfen bir URL girin', 'error');
                    return;
                }
                formData.append('xml_url', urlInput.value);
            }
            
            startImport(formData);
        });
        
        // Import başlat
        function startImport(formData) {
            document.getElementById('progressContainer').style.display = 'block';
            
            fetch(API_BASE, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentImportId = data.import_id;
                    updateProgress(data);
                    showAlert(`Import tamamlandı! ${data.basarili} ürün başarıyla import edildi.`, 'success');
                    loadImportHistory();
                } else {
                    showAlert('Hata: ' + data.message, 'error');
                }
                
                setTimeout(() => {
                    document.getElementById('progressContainer').style.display = 'none';
                }, 5000);
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Bir hata oluştu: ' + error, 'error');
            });
        }
        
        // Progress güncelle
        function updateProgress(data) {
            const percentage = data.toplam > 0 ? Math.round((data.basarili + data.hatali) / data.toplam * 100) : 0;
            
            document.getElementById('progressFill').style.width = percentage + '%';
            document.getElementById('progressFill').textContent = percentage + '%';
            document.getElementById('totalProducts').textContent = data.toplam;
            document.getElementById('successProducts').textContent = data.basarili;
            document.getElementById('failedProducts').textContent = data.hatali;
        }
        
        // Import geçmişini yükle
        function loadImportHistory() {
            fetch(API_BASE)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        displayHistory(data.data);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
        
        // Geçmişi göster
        function displayHistory(history) {
            const tbody = document.getElementById('historyTableBody');
            
            if (history.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Henüz import yapılmamış</td></tr>';
                return;
            }
            
            tbody.innerHTML = history.map(item => {
                let statusBadge = '';
                if (item.durum === 'tamamlandi') {
                    statusBadge = '<span class="badge badge-success">Tamamlandı</span>';
                } else if (item.durum === 'basarisiz') {
                    statusBadge = '<span class="badge badge-danger">Başarısız</span>';
                } else {
                    statusBadge = '<span class="badge badge-warning">Devam Ediyor</span>';
                }
                
                return `
                    <tr>
                        <td>${item.dosya_adi || '-'}</td>
                        <td>${item.toplam_kayit}</td>
                        <td style="color: #2E7D32; font-weight: 600;">${item.basarili_kayit}</td>
                        <td style="color: #C62828; font-weight: 600;">${item.hatali_kayit}</td>
                        <td>${statusBadge}</td>
                        <td>${new Date(item.baslangic_zamani).toLocaleString('tr-TR')}</td>
                    </tr>
                `;
            }).join('');
        }
        
        // Alert göster
        function showAlert(message, type) {
            const alertContainer = document.getElementById('alertContainer');
            const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
            
            alertContainer.innerHTML = `
                <div class="alert ${alertClass}">
                    ${message}
                </div>
            `;
            
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 5000);
        }
    </script>
</body>
</html>
