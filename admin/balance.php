<?php
session_start();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bakiye Yönetimi | Gürbüz Oyuncak Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Bakiye Yönetimi</h1>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2>Bayi Bakiyeleri</h2>
                    <div class="filters">
                        <select id="filterCustomerType" onchange="loadBalances()">
                            <option value="">Tüm Müşteriler</option>
                            <option value="B2B">B2B</option>
                            <option value="wholesale">Toptan</option>
                        </select>
                        <select id="filterLowBalance" onchange="loadBalances()">
                            <option value="">Tümü</option>
                            <option value="1">Düşük Bakiye</option>
                        </select>
                        <input type="text" id="searchInput" placeholder="Müşteri ara..." onkeyup="loadBalances()">
                    </div>
                </div>
                <div class="table-container">
                    <table id="balancesTable">
                        <thead>
                            <tr>
                                <th>Müşteri</th>
                                <th>Email</th>
                                <th>Müşteri Tipi</th>
                                <th>Mevcut Bakiye</th>
                                <th>Kredi Limiti</th>
                                <th>Kullanılabilir</th>
                                <th>Toplam Yükleme</th>
                                <th>Toplam Harcama</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="balancesTableBody">
                            <tr><td colspan="9">Yükleniyor...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bakiye Yükleme Modal -->
    <div id="loadBalanceModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeLoadBalanceModal()">&times;</span>
            <h2>Bakiye Yükle</h2>
            <form id="loadBalanceForm" onsubmit="loadBalance(event)">
                <input type="hidden" id="userId">
                
                <div class="form-group">
                    <label for="customerName">Müşteri</label>
                    <input type="text" id="customerName" readonly>
                </div>
                
                <div class="form-group">
                    <label for="amount">Yüklenecek Tutar (TL) *</label>
                    <input type="number" id="amount" step="0.01" required min="0">
                </div>
                
                <div class="form-group">
                    <label for="description">Açıklama</label>
                    <textarea id="description" rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeLoadBalanceModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Bakiye Yükle</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Ayarlar Modal -->
    <div id="settingsModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeSettingsModal()">&times;</span>
            <h2>Bakiye Ayarları</h2>
            <form id="settingsForm" onsubmit="updateSettings(event)">
                <input type="hidden" id="settingsUserId">
                
                <div class="form-group">
                    <label for="settingsCustomerName">Müşteri</label>
                    <input type="text" id="settingsCustomerName" readonly>
                </div>
                
                <div class="form-group">
                    <label for="creditLimit">Kredi Limiti (TL)</label>
                    <input type="number" id="creditLimit" step="0.01" min="0">
                </div>
                
                <div class="form-group">
                    <label for="lowBalanceThreshold">Düşük Bakiye Uyarı Limiti (TL)</label>
                    <input type="number" id="lowBalanceThreshold" step="0.01" min="0">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSettingsModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        </div>
    </div>
    
    <script src="js/balance.js"></script>
</body>
</html>
