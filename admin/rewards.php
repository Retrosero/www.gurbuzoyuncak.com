<?php
session_start();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ödül & Puan Yönetimi | Gürbüz Oyuncak Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Ödül & Puan Yönetimi</h1>
            </div>
            
            <!-- İstatistikler -->
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card">
                    <h4>Toplam Kullanıcı</h4>
                    <p id="totalUsers">-</p>
                </div>
                <div class="stat-card">
                    <h4>Toplam Puan</h4>
                    <p id="totalPoints">-</p>
                </div>
                <div class="stat-card">
                    <h4>VIP Kullanıcılar</h4>
                    <p id="vipUsers">-</p>
                </div>
                <div class="stat-card">
                    <h4>Yaklaşan Süre Dolan</h4>
                    <p id="expiringPoints">-</p>
                </div>
            </div>
            
            <!-- VIP Seviyeleri -->
            <div class="card">
                <div class="card-header">
                    <h2>VIP Seviyeleri</h2>
                </div>
                <div class="table-container">
                    <table id="vipLevelsTable">
                        <thead>
                            <tr>
                                <th>Seviye</th>
                                <th>Min. Puan</th>
                                <th>Maks. Puan</th>
                                <th>İndirim (%)</th>
                                <th>Ücretsiz Kargo</th>
                                <th>Kullanıcı Sayısı</th>
                            </tr>
                        </thead>
                        <tbody id="vipLevelsTableBody">
                            <tr><td colspan="6">Yükleniyor...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Puan Kuralları -->
            <div class="card">
                <div class="card-header">
                    <h2>Puan Kazanma Kuralları</h2>
                </div>
                <div class="table-container">
                    <table id="rulesTable">
                        <thead>
                            <tr>
                                <th>Kural</th>
                                <th>Tip</th>
                                <th>Puan Miktarı</th>
                                <th>Hesaplama</th>
                                <th>Süre (Gün)</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody id="rulesTableBody">
                            <tr><td colspan="6">Yükleniyor...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Kullanıcı Puanları -->
            <div class="card">
                <div class="card-header">
                    <h2>Kullanıcı Puanları</h2>
                    <input type="text" id="searchUsers" placeholder="Kullanıcı ara...">
                </div>
                <div id="userPointsContainer">
                    <p>Yükleniyor...</p>
                </div>
            </div>
        </div>
    </div>
    
    <script src="js/rewards.js"></script>
</body>
</html>
