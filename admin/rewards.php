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
    <title>Ödül & Puan Yönetimi | Gürbüz Oyuncak Admin</title>
    
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
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card h4 {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }
        
        .stat-card p {
            font-size: 2rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
        }
        
        .reward-card {
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
            
            .stats-grid {
                grid-template-columns: 1fr;
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
                    <i data-lucide="gift" style="width: 32px; height: 32px;"></i>
                    Ödül & Puan Yönetimi
                </h1>
            </div>
            
            <!-- İstatistikler -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Toplam Kullanıcı</h4>
                    <p id="totalUsers">
                        <i data-lucide="loader-2" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"></i>
                    </p>
                </div>
                <div class="stat-card">
                    <h4>Toplam Puan</h4>
                    <p id="totalPoints">
                        <i data-lucide="loader-2" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"></i>
                    </p>
                </div>
                <div class="stat-card">
                    <h4>VIP Kullanıcılar</h4>
                    <p id="vipUsers">
                        <i data-lucide="loader-2" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"></i>
                    </p>
                </div>
                <div class="stat-card">
                    <h4>Yaklaşan Süre Dolan</h4>
                    <p id="expiringPoints">
                        <i data-lucide="loader-2" style="width: 24px; height: 24px; animation: spin 1s linear infinite;"></i>
                    </p>
                </div>
            </div>
            
            <!-- VIP Seviyeleri -->
            <div class="reward-card">
                <div class="card-header-custom">
                    <h3 class="m-0">VIP Seviyeleri</h3>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
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
                            <tr>
                                <td colspan="6" class="text-center py-4">Yükleniyor...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Puan Kuralları -->
            <div class="reward-card">
                <div class="card-header-custom">
                    <h3 class="m-0">Puan Kazanma Kuralları</h3>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
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
                            <tr>
                                <td colspan="6" class="text-center py-4">Yükleniyor...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Kullanıcı Puanları -->
            <div class="reward-card">
                <div class="card-header-custom">
                    <h3 class="m-0">Kullanıcı Puanları</h3>
                </div>
                <div class="p-3">
                    <input type="text" class="form-control mb-3" id="searchUsers" placeholder="Kullanıcı ara...">
                    <div id="userPointsContainer">
                        <p class="text-center py-4">Yükleniyor...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/components/js/component-loader.js"></script>
    
    <script>
        lucide.createIcons();
        
        const API_BASE = '/backend/api/rewards.php';
        
        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
            loadVIPLevels();
            loadRules();
            loadUserPoints();
        });
        
        async function loadStats() {
            try {
                const response = await fetch(`${API_BASE}?action=stats`);
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('totalUsers').textContent = data.data.totalUsers || 0;
                    document.getElementById('totalPoints').textContent = (data.data.totalPoints || 0).toLocaleString('tr-TR');
                    document.getElementById('vipUsers').textContent = data.data.vipUsers || 0;
                    document.getElementById('expiringPoints').textContent = data.data.expiringPoints || 0;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function loadVIPLevels() {
            try {
                const response = await fetch(`${API_BASE}?action=vip_levels`);
                const data = await response.json();
                
                if (data.success) {
                    displayVIPLevels(data.data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        function displayVIPLevels(levels) {
            const tbody = document.getElementById('vipLevelsTableBody');
            
            if (levels.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">VIP seviyesi bulunamadı</td></tr>';
                return;
            }
            
            tbody.innerHTML = levels.map(level => `
                <tr>
                    <td><span class="badge bg-primary">${level.level_name}</span></td>
                    <td>${level.min_points}</td>
                    <td>${level.max_points || '∞'}</td>
                    <td>${level.discount_percentage}%</td>
                    <td><span class="badge ${level.free_shipping ? 'bg-success' : 'bg-secondary'}">${level.free_shipping ? 'Evet' : 'Hayır'}</span></td>
                    <td>${level.user_count || 0}</td>
                </tr>
            `).join('');
        }
        
        async function loadRules() {
            try {
                const response = await fetch(`${API_BASE}?action=rules`);
                const data = await response.json();
                
                if (data.success) {
                    displayRules(data.data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        function displayRules(rules) {
            const tbody = document.getElementById('rulesTableBody');
            
            if (rules.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Kural bulunamadı</td></tr>';
                return;
            }
            
            tbody.innerHTML = rules.map(rule => `
                <tr>
                    <td>${rule.rule_name}</td>
                    <td><span class="badge bg-info">${rule.rule_type}</span></td>
                    <td>${rule.points_amount}</td>
                    <td>${rule.calculation_method}</td>
                    <td>${rule.expiry_days || '∞'}</td>
                    <td><span class="badge ${rule.is_active ? 'bg-success' : 'bg-danger'}">${rule.is_active ? 'Aktif' : 'Pasif'}</span></td>
                </tr>
            `).join('');
        }
        
        async function loadUserPoints() {
            const search = document.getElementById('searchUsers').value;
            
            try {
                const url = search ? `${API_BASE}?action=user_points&search=${search}` : `${API_BASE}?action=user_points`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.success) {
                    displayUserPoints(data.data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        function displayUserPoints(users) {
            const container = document.getElementById('userPointsContainer');
            
            if (users.length === 0) {
                container.innerHTML = '<p class="text-center">Kullanıcı bulunamadı</p>';
                return;
            }
            
            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>VIP Seviye</th>
                                <th>Toplam Puan</th>
                                <th>Kullanılabilir Puan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td>${user.name}</td>
                                    <td><span class="badge bg-primary">${user.vip_level || 'Standart'}</span></td>
                                    <td>${(user.total_points || 0).toLocaleString('tr-TR')}</td>
                                    <td>${(user.available_points || 0).toLocaleString('tr-TR')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        // Arama
        document.getElementById('searchUsers').addEventListener('keyup', function() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => loadUserPoints(), 500);
        });
    </script>
    
    <style>
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</body>
</html>
