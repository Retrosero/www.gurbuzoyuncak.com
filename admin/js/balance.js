// Bakiye Yönetimi JavaScript

let balancesData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadBalances();
});

// Bakiyeleri yükle
async function loadBalances() {
    const customerType = document.getElementById('filterCustomerType').value;
    const lowBalance = document.getElementById('filterLowBalance').value;
    const search = document.getElementById('searchInput').value;
    
    let url = '../backend/api/balance.php?action=all&';
    if (customerType) url += `customer_type=${customerType}&`;
    if (lowBalance) url += `low_balance=${lowBalance}&`;
    if (search) url += `search=${search}&`;
    
    try {
        const response = await fetch(url);
        const result = await response.json();
        
        balancesData = result.data || [];
        renderBalancesTable();
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Bakiyeler yüklenemedi', 'error');
    }
}

// Bakiye tablosunu oluştur
function renderBalancesTable() {
    const tbody = document.getElementById('balancesTableBody');
    
    if (balancesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">Bakiye hesabı bulunamadı</td></tr>';
        return;
    }
    
    tbody.innerHTML = balancesData.map(balance => `
        <tr>
            <td>${balance.first_name} ${balance.last_name}</td>
            <td>${balance.email}</td>
            <td>${formatCustomerType(balance.customer_type)}</td>
            <td><strong>${parseFloat(balance.current_balance).toFixed(2)} TL</strong></td>
            <td>${parseFloat(balance.credit_limit).toFixed(2)} TL</td>
            <td><strong style="color: var(--yesil);">${parseFloat(balance.available_balance).toFixed(2)} TL</strong></td>
            <td>${parseFloat(balance.total_loaded).toFixed(2)} TL</td>
            <td>${parseFloat(balance.total_spent).toFixed(2)} TL</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showLoadBalanceModal(${balance.user_id}, '${balance.first_name} ${balance.last_name}')">Yükle</button>
                <button class="btn btn-sm btn-info" onclick="showSettingsModal(${balance.user_id}, '${balance.first_name} ${balance.last_name}', ${balance.credit_limit}, ${balance.low_balance_threshold})">Ayarlar</button>
                <button class="btn btn-sm btn-secondary" onclick="viewTransactions(${balance.user_id})">Geçmiş</button>
            </td>
        </tr>
    `).join('');
}

// Bakiye yükleme modalı göster
function showLoadBalanceModal(userId, customerName) {
    document.getElementById('userId').value = userId;
    document.getElementById('customerName').value = customerName;
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('loadBalanceModal').style.display = 'block';
}

function closeLoadBalanceModal() {
    document.getElementById('loadBalanceModal').style.display = 'none';
}

// Bakiye yükle
async function loadBalance(event) {
    event.preventDefault();
    
    const userId = parseInt(document.getElementById('userId').value);
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    
    if (amount <= 0) {
        showNotification('Geçerli bir tutar girin', 'error');
        return;
    }
    
    try {
        const response = await fetch('../backend/api/balance.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                action: 'load',
                user_id: userId,
                amount: amount,
                description: description
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`${amount} TL başarıyla yüklendi`, 'success');
            closeLoadBalanceModal();
            loadBalances();
        } else {
            showNotification(result.error || 'İşlem başarısız', 'error');
        }
    } catch (error) {
        console.error('Hata:', error);
        showNotification('İşlem sırasında hata oluştu', 'error');
    }
}

// Ayarlar modalı göster
function showSettingsModal(userId, customerName, creditLimit, lowBalanceThreshold) {
    document.getElementById('settingsUserId').value = userId;
    document.getElementById('settingsCustomerName').value = customerName;
    document.getElementById('creditLimit').value = creditLimit;
    document.getElementById('lowBalanceThreshold').value = lowBalanceThreshold;
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Ayarları güncelle
async function updateSettings(event) {
    event.preventDefault();
    
    const userId = parseInt(document.getElementById('settingsUserId').value);
    const creditLimit = parseFloat(document.getElementById('creditLimit').value);
    const lowBalanceThreshold = parseFloat(document.getElementById('lowBalanceThreshold').value);
    
    try {
        const response = await fetch('../backend/api/balance.php', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: userId,
                credit_limit: creditLimit,
                low_balance_threshold: lowBalanceThreshold
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Ayarlar güncellendi', 'success');
            closeSettingsModal();
            loadBalances();
        } else {
            showNotification(result.error || 'Güncelleme başarısız', 'error');
        }
    } catch (error) {
        console.error('Hata:', error);
        showNotification('İşlem sırasında hata oluştu', 'error');
    }
}

// İşlem geçmişini görüntüle
function viewTransactions(userId) {
    window.location.href = `balance-transactions.php?user_id=${userId}`;
}

// Yardımcı fonksiyonlar
function formatCustomerType(type) {
    const types = {
        'B2C': 'B2C',
        'B2B': 'B2B',
        'wholesale': 'Toptan'
    };
    return types[type] || type;
}

function showNotification(message, type = 'info') {
    alert(message);
}
