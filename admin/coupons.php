<?php
session_start();
// Production'da session kontrolü ekle
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kupon Yönetimi | Gürbüz Oyuncak Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Kupon Yönetimi</h1>
                <button class="btn btn-primary" onclick="showCouponModal()">Yeni Kupon Oluştur</button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2>Kuponlar</h2>
                    <div class="filters">
                        <select id="filterActive" onchange="loadCoupons()">
                            <option value="">Tüm Kuponlar</option>
                            <option value="1">Aktif</option>
                            <option value="0">Pasif</option>
                        </select>
                        <select id="filterCustomerType" onchange="loadCoupons()">
                            <option value="">Tüm Müşteriler</option>
                            <option value="all">Genel</option>
                            <option value="B2C">B2C</option>
                            <option value="B2B">B2B</option>
                            <option value="wholesale">Toptan</option>
                        </select>
                        <input type="text" id="searchInput" placeholder="Kupon kodu ara..." onkeyup="loadCoupons()">
                    </div>
                </div>
                <div class="table-container">
                    <table id="couponsTable">
                        <thead>
                            <tr>
                                <th>Kod</th>
                                <th>İsim</th>
                                <th>İndirim</th>
                                <th>Müşteri Tipi</th>
                                <th>Kullanım</th>
                                <th>Geçerlilik</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="couponsTableBody">
                            <tr><td colspan="8">Yükleniyor...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Kupon Modal -->
    <div id="couponModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeCouponModal()">&times;</span>
            <h2 id="modalTitle">Yeni Kupon Oluştur</h2>
            <form id="couponForm" onsubmit="saveCoupon(event)">
                <input type="hidden" id="couponId">
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="code">Kupon Kodu *</label>
                        <input type="text" id="code" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="name">İsim *</label>
                        <input type="text" id="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="discountType">İndirim Türü *</label>
                        <select id="discountType" required>
                            <option value="percentage">Yüzde (%)</option>
                            <option value="fixed">Sabit Tutar (TL)</option>
                            <option value="free_shipping">Ücretsiz Kargo</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="discountValue">İndirim Değeri *</label>
                        <input type="number" id="discountValue" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="minPurchaseAmount">Min. Sepet Tutarı (TL)</label>
                        <input type="number" id="minPurchaseAmount" step="0.01" value="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="maxDiscountAmount">Maks. İndirim (TL)</label>
                        <input type="number" id="maxDiscountAmount" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label for="usageLimit">Toplam Kullanım Limiti</label>
                        <input type="number" id="usageLimit">
                    </div>
                    
                    <div class="form-group">
                        <label for="usageLimitPerUser">Kullanıcı Başına Limit</label>
                        <input type="number" id="usageLimitPerUser" value="1">
                    </div>
                    
                    <div class="form-group">
                        <label for="validFrom">Başlangıç Tarihi *</label>
                        <input type="datetime-local" id="validFrom" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="validUntil">Bitiş Tarihi *</label>
                        <input type="datetime-local" id="validUntil" required>
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
                        <label for="applicableTo">Geçerlilik</label>
                        <select id="applicableTo">
                            <option value="all">Tüm Ürünler</option>
                            <option value="categories">Belirli Kategoriler</option>
                            <option value="products">Belirli Ürünler</option>
                        </select>
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
                    <button type="button" class="btn btn-secondary" onclick="closeCouponModal()">İptal</button>
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        </div>
    </div>
    
    <script src="js/coupons.js"></script>
</body>
</html>
