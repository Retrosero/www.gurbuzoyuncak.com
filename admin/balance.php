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
    <title>Bakiye Yönetimi | Gürbüz Oyuncak Admin</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="../components/css/components.css">
    
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
        
        .balance-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .card-header-custom {
            background: var(--primary-gradient);
            color: white;
            padding: 1.5rem;
            border-radius: 12px 12px 0 0;
        }
        
        .filters {
            display: flex;
            gap: 1rem;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            flex-wrap: wrap;
        }
        
        .btn-primary-gradient {
            background: var(--primary-gradient);
            color: white;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
        }
        
        .balance-positive {
            color: #059669;
            font-weight: 700;
        }
        
        .balance-negative {
            color: #dc2626;
            font-weight: 700;
        }
        
        .balance-warning {
            color: #f59e0b;
            font-weight: 700;
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
                    <i data-lucide="wallet" style="width: 32px; height: 32px;"></i>
                    Bakiye Yönetimi
                </h1>
            </div>
            
            <div class="balance-card">
                <div class="card-header-custom">
                    <h3 class="m-0">Bayi Bakiyeleri</h3>
                </div>
                
                <div class="filters">
                    <select class="form-select" id="filterCustomerType" onchange="loadBalances()" style="width: auto;">
                        <option value="">Tüm Müşteriler</option>
                        <option value="B2B">B2B</option>
                        <option value="wholesale">Toptan</option>
                    </select>
                    <select class="form-select" id="filterLowBalance" onchange="loadBalances()" style="width: auto;">
                        <option value="">Tümü</option>
                        <option value="1">Düşük Bakiye</option>
                    </select>
                    <input type="text" class="form-control" id="searchInput" placeholder="Müşteri ara..." onkeyup="loadBalances()" style="min-width: 250px;">
                </div>
                
                <div class="table-responsive">
                    <table class="table">
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
                            <tr>
                                <td colspan="9" class="text-center py-4">Yükleniyor...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bakiye Yükleme Modal -->
    <div class="modal fade" id="loadBalanceModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header" style="background: var(--primary-gradient); color: white;">
                    <h5 class="modal-title">Bakiye Yükle</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" style="filter: brightness(0) invert(1);"></button>
                </div>
                <div class="modal-body">
                    <form id="loadBalanceForm">
                        <input type="hidden" id="userId">
                        
                        <div class="mb-3">
                            <label class="form-label">Müşteri</label>
                            <input type="text" class="form-control" id="customerName" readonly>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Yüklenecek Tutar (TL) *</label>
                            <input type="number" class="form-control" id="amount" step="0.01" required min="0">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Açıklama</label>
                            <textarea class="form-control" id="description" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                    <button type="button" class="btn btn-primary-gradient" onclick="loadBalance()">Bakiye Yükle</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Ayarlar Modal -->
    <div class="modal fade" id="settingsModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header" style="background: var(--primary-gradient); color: white;">
                    <h5 class="modal-title">Bakiye Ayarları</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" style="filter: brightness(0) invert(1);"></button>
                </div>
                <div class="modal-body">
                    <form id="settingsForm">
                        <input type="hidden" id="settingsUserId">
                        
                        <div class="mb-3">
                            <label class="form-label">Müşteri</label>
                            <input type="text" class="form-control" id="settingsCustomerName" readonly>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Kredi Limiti (TL)</label>
                            <input type="number" class="form-control" id="creditLimit" step="0.01" min="0">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Düşük Bakiye Uyarı Limiti (TL)</label>
                            <input type="number" class="form-control" id="lowBalanceThreshold" step="0.01" min="0">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                    <button type="button" class="btn btn-primary-gradient" onclick="updateSettings()">Kaydet</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../components/js/component-loader.js"></script>
    
    <script>
        lucide.createIcons();
        
        const API_BASE = '/backend/api/balance.php';
        let loadBalanceModal, settingsModal;
        
        document.addEventListener('DOMContentLoaded', function() {
            loadBalanceModal = new bootstrap.Modal(document.getElementById('loadBalanceModal'));
            settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
            loadBalances();
        });
        
        async function loadBalances() {
            const customerType = document.getElementById('filterCustomerType').value;
            const lowBalance = document.getElementById('filterLowBalance').value;
            const search = document.getElementById('searchInput').value;
            
            let url = API_BASE;
            const params = new URLSearchParams();
            if (customerType) params.append('customer_type', customerType);
            if (lowBalance) params.append('low_balance', lowBalance);
            if (search) params.append('search', search);
            
            if (params.toString()) url += '?' + params.toString();
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.success) {
                    displayBalances(data.data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        function displayBalances(balances) {
            const tbody = document.getElementById('balancesTableBody');
            
            if (balances.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center">Kayıt bulunamadı</td></tr>';
                return;
            }
            
            tbody.innerHTML = balances.map(balance => {
                const available = parseFloat(balance.current_balance) + parseFloat(balance.credit_limit || 0);
                const balanceClass = balance.current_balance < 0 ? 'balance-negative' : 
                                    balance.current_balance < (balance.low_balance_threshold || 0) ? 'balance-warning' : 
                                    'balance-positive';
                
                return `
                    <tr>
                        <td><strong>${balance.name}</strong></td>
                        <td><small>${balance.email}</small></td>
                        <td><span class="badge bg-secondary">${balance.customer_type}</span></td>
                        <td><span class="${balanceClass}">₺${parseFloat(balance.current_balance).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span></td>
                        <td>₺${parseFloat(balance.credit_limit || 0).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</td>
                        <td><strong>₺${available.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</strong></td>
                        <td>₺${parseFloat(balance.total_loaded || 0).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</td>
                        <td>₺${parseFloat(balance.total_spent || 0).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</td>
                        <td>
                            <div class="d-flex gap-1">
                                <button class="btn btn-success btn-sm" onclick="openLoadModal(${balance.user_id}, '${balance.name}')">
                                    <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i>
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="openSettingsModal(${balance.user_id}, '${balance.name}', ${balance.credit_limit || 0}, ${balance.low_balance_threshold || 0})">
                                    <i data-lucide="settings" style="width: 14px; height: 14px;"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            lucide.createIcons();
        }
        
        function openLoadModal(userId, customerName) {
            document.getElementById('userId').value = userId;
            document.getElementById('customerName').value = customerName;
            document.getElementById('amount').value = '';
            document.getElementById('description').value = '';
            loadBalanceModal.show();
        }
        
        function openSettingsModal(userId, customerName, creditLimit, threshold) {
            document.getElementById('settingsUserId').value = userId;
            document.getElementById('settingsCustomerName').value = customerName;
            document.getElementById('creditLimit').value = creditLimit;
            document.getElementById('lowBalanceThreshold').value = threshold;
            settingsModal.show();
        }
        
        async function loadBalance() {
            const userId = document.getElementById('userId').value;
            const amount = document.getElementById('amount').value;
            const description = document.getElementById('description').value;
            
            try {
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'load',
                        user_id: userId,
                        amount: amount,
                        description: description
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    loadBalanceModal.hide();
                    loadBalances();
                    alert('Bakiye başarıyla yüklendi');
                } else {
                    alert('Hata: ' + (data.message || 'İşlem başarısız'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Bir hata oluştu');
            }
        }
        
        async function updateSettings() {
            const userId = document.getElementById('settingsUserId').value;
            const creditLimit = document.getElementById('creditLimit').value;
            const threshold = document.getElementById('lowBalanceThreshold').value;
            
            try {
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'update_settings',
                        user_id: userId,
                        credit_limit: creditLimit,
                        low_balance_threshold: threshold
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    settingsModal.hide();
                    loadBalances();
                    alert('Ayarlar güncellendi');
                } else {
                    alert('Hata: ' + (data.message || 'İşlem başarısız'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Bir hata oluştu');
            }
        }
    </script>
</body>
</html>
