<?php
session_start();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kampanya Yönetimi | Gürbüz Oyuncak Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Kampanya Yönetimi</h1>
                <button class="btn btn-primary" onclick="showCampaignModal()">Yeni Kampanya Oluştur</button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2>Kampanyalar</h2>
                    <div class="filters">
                        <select id="filterActive" onchange="loadCampaigns()">
                            <option value="">Tüm Kampanyalar</option>
                            <option value="1">Aktif</option>
                            <option value="0">Pasif</option>
                        </select>
                        <select id="filterType" onchange="loadCampaigns()">
                            <option value="">Tüm Türler</option>
                            <option value="general">Genel</option>
                            <option value="customer_based">Müşteri Bazlı</option>
                            <option value="cart_based">Sepet Bazlı</option>
                            <option value="buy_x_get_y">X Al Y Öde</option>
                            <option value="category_based">Kategori Bazlı</option>
                        </select>
                        <input type="text" id="searchInput" placeholder="Kampanya ara..." onkeyup="loadCampaigns()">
                    </div>
                </div>
                <div class="table-container">
                    <table id="campaignsTable">
                        <thead>
                            <tr>
                                <th>Kampanya Adı</th>
                                <th>Tip</th>
                                <th>İndirim</th>
                                <th>Müşteri Tipi</th>
                                <th>Kullanım</th>
                                <th>Tarih</th>
                                <th>Öncelik</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="campaignsTableBody">
                            <tr><td colspan="9">Yükleniyor...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Kampanya Modal -->
    <div id="campaignModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeCampaignModal()">&times;</span>
            <h2 id="modalTitle">Yeni Kampanya Oluştur</h2>
            <form id="campaignForm" onsubmit="saveCampaign(event)">
                <input type="hidden" id="campaignId">
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="name">Kampanya Adı *</label>
                        <input type="text" id="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="campaignType">Kampanya Türü *</label>
                        <select id="campaignType" required onchange="onCampaignTypeChange()">
                            <option value="general">Genel</option>
                            <option value="customer_based">Müşteri Bazlı</option>
                            <option value="cart_based">Sepet Bazlı</option>
                            <option value="buy_x_get_y">X Al Y Öde</option>
                            <option value="category_based">Kategori Bazlı</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="discountType">İndirim Türü *</label>
                        <select id="discountType" required>
                            <option value="percentage">Yüzde (%)</option>
                            <option value="fixed">Sabit Tutar (TL)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="discountValue">İndirim Değeri *</label>
                        <input type="number" id="discountValue" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="customerType">Müşteri Tipi</label>
                        <select id="customerType">
                            <option value="all">Tümü</option>
                            <option value="B2C">B2C</option>
                            <option value="B2B">B2B</option>
                            <option value="wholesale">Toptan</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="minCartAmount">Min. Sepet Tutarı (TL)</label>
                        <input type="number" id="minCartAmount" step="0.01">
                    </div>
                    
                    <div class="form-group" id="minItemCountGroup">
                        <label for="minItemCount">Min. Ürün Sayısı</label>
                        <input type="number" id="minItemCount">
                    </div>
                    
                    <div class="form-group" id="buyQuantityGroup" style="display: none;">
                        <label for="buyQuantity">Alınacak Miktar (X)</label>
                        <input type="number" id="buyQuantity">
                    </div>
                    
                    <div class="form-group" id="payQuantityGroup" style="display: none;">
                        <label for="payQuantity">Ödenecek Miktar (Y)</label>
                        <input type="number" id="payQuantity">
                    </div>
                    
                    <div class="form-group">
                        <label for="startDate">Başlangıç Tarihi *</label>
                        <input type="datetime-local" id="startDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="endDate">Bitiş Tarihi *</label>
                        <input type="datetime-local" id="endDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="priority">Öncelik (0-100)</label>
                        <input type="number" id="priority" value="0" min="0" max="100">
                    </div>
                    
                    <div class="form-group">
                        <label for="maxUsagePerUser">Kullanıcı Başına Limit</label>
                        <input type="number" id="maxUsagePerUser">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="description">Açıklama</label>
                    <textarea id="description" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="isActive" checked>
                        Aktif
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeCampaignModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        </div>
    </div>
    
    <script src="js/campaigns.js"></script>
</body>
</html>
