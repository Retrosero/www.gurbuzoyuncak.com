// Kupon Yönetimi JavaScript

let couponsData = [];

// Sayfa yüklendiğinde kuponları yükle
document.addEventListener('DOMContentLoaded', function() {
    loadCoupons();
});

// Kuponları yükle
async function loadCoupons() {
    const active = document.getElementById('filterActive').value;
    const customerType = document.getElementById('filterCustomerType').value;
    const search = document.getElementById('searchInput').value;
    
    let url = '../backend/api/coupons.php?';
    if (active !== '') url += `is_active=${active}&`;
    if (customerType) url += `customer_type=${customerType}&`;
    if (search) url += `search=${search}&`;
    
    try {
        const response = await fetch(url);
        const result = await response.json();
        
        couponsData = result.data || [];
        renderCouponsTable();
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Kuponlar yüklenemedi', 'error');
    }
}

// Kupon tablosunu oluştur
function renderCouponsTable() {
    const tbody = document.getElementById('couponsTableBody');
    
    if (couponsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Kupon bulunamadı</td></tr>';
        return;
    }
    
    tbody.innerHTML = couponsData.map(coupon => `
        <tr>
            <td><strong>${coupon.code}</strong></td>
            <td>${coupon.name}</td>
            <td>${formatDiscount(coupon)}</td>
            <td>${formatCustomerType(coupon.customer_type)}</td>
            <td>${coupon.used_count || 0} / ${coupon.usage_limit || '∞'}</td>
            <td>${formatDateRange(coupon.valid_from, coupon.valid_until)}</td>
            <td>${coupon.is_active == 1 ? '<span class="badge badge-success">Aktif</span>' : '<span class="badge badge-secondary">Pasif</span>'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editCoupon(${coupon.id})">Düzenle</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCoupon(${coupon.id})">Sil</button>
            </td>
        </tr>
    `).join('');
}

// Kupon modal göster
function showCouponModal(id = null) {
    document.getElementById('couponModal').style.display = 'block';
    
    if (id) {
        document.getElementById('modalTitle').textContent = 'Kupon Düzenle';
        loadCouponData(id);
    } else {
        document.getElementById('modalTitle').textContent = 'Yeni Kupon Oluştur';
        document.getElementById('couponForm').reset();
        document.getElementById('couponId').value = '';
    }
}

// Kupon modal kapat
function closeCouponModal() {
    document.getElementById('couponModal').style.display = 'none';
}

// Kupon düzenle
function editCoupon(id) {
    showCouponModal(id);
}

// Kupon verisini yükle
async function loadCouponData(id) {
    try {
        const response = await fetch(`../backend/api/coupons.php?id=${id}`);
        const coupon = await response.json();
        
        document.getElementById('couponId').value = coupon.id;
        document.getElementById('code').value = coupon.code;
        document.getElementById('name').value = coupon.name;
        document.getElementById('description').value = coupon.description || '';
        document.getElementById('discountType').value = coupon.discount_type;
        document.getElementById('discountValue').value = coupon.discount_value;
        document.getElementById('minPurchaseAmount').value = coupon.min_purchase_amount || 0;
        document.getElementById('maxDiscountAmount').value = coupon.max_discount_amount || '';
        document.getElementById('usageLimit').value = coupon.usage_limit || '';
        document.getElementById('usageLimitPerUser').value = coupon.usage_limit_per_user || 1;
        document.getElementById('validFrom').value = formatDatetimeLocal(coupon.valid_from);
        document.getElementById('validUntil').value = formatDatetimeLocal(coupon.valid_until);
        document.getElementById('customerType').value = coupon.customer_type;
        document.getElementById('applicableTo').value = coupon.applicable_to;
        document.getElementById('isActive').checked = coupon.is_active == 1;
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Kupon yüklenemedi', 'error');
    }
}

// Kupon kaydet
async function saveCoupon(event) {
    event.preventDefault();
    
    const id = document.getElementById('couponId').value;
    const data = {
        code: document.getElementById('code').value.toUpperCase(),
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        discount_type: document.getElementById('discountType').value,
        discount_value: parseFloat(document.getElementById('discountValue').value),
        min_purchase_amount: parseFloat(document.getElementById('minPurchaseAmount').value) || 0,
        max_discount_amount: parseFloat(document.getElementById('maxDiscountAmount').value) || null,
        usage_limit: parseInt(document.getElementById('usageLimit').value) || null,
        usage_limit_per_user: parseInt(document.getElementById('usageLimitPerUser').value) || 1,
        valid_from: document.getElementById('validFrom').value.replace('T', ' ') + ':00',
        valid_until: document.getElementById('validUntil').value.replace('T', ' ') + ':00',
        customer_type: document.getElementById('customerType').value,
        applicable_to: document.getElementById('applicableTo').value,
        is_active: document.getElementById('isActive').checked ? 1 : 0
    };
    
    if (id) {
        data.id = parseInt(id);
    }
    
    try {
        const response = await fetch('../backend/api/coupons.php', {
            method: id ? 'PUT' : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success || response.ok) {
            showNotification('Kupon başarıyla kaydedildi', 'success');
            closeCouponModal();
            loadCoupons();
        } else {
            showNotification(result.error || 'Kayıt başarısız', 'error');
        }
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Kayıt sırasında hata oluştu', 'error');
    }
}

// Kupon sil
async function deleteCoupon(id) {
    if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch('../backend/api/coupons.php', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Kupon silindi', 'success');
            loadCoupons();
        } else {
            showNotification(result.error || 'Silme başarısız', 'error');
        }
    } catch (error) {
        console.error('Hata:', error);
        showNotification('Silme sırasında hata oluştu', 'error');
    }
}

// Yardımcı fonksiyonlar
function formatDiscount(coupon) {
    if (coupon.discount_type === 'percentage') {
        return `%${coupon.discount_value}`;
    } else if (coupon.discount_type === 'fixed') {
        return `${coupon.discount_value} TL`;
    } else {
        return 'Ücretsiz Kargo';
    }
}

function formatCustomerType(type) {
    const types = {
        'all': 'Tümü',
        'B2C': 'B2C',
        'B2B': 'B2B',
        'wholesale': 'Toptan'
    };
    return types[type] || type;
}

function formatDateRange(from, to) {
    const fromDate = new Date(from).toLocaleDateString('tr-TR');
    const toDate = new Date(to).toLocaleDateString('tr-TR');
    return `${fromDate} - ${toDate}`;
}

function formatDatetimeLocal(datetime) {
    return datetime.replace(' ', 'T').substring(0, 16);
}

function showNotification(message, type = 'info') {
    alert(message); // Basit versiyon, production'da toast kullan
}
