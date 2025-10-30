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
    <title>Kupon Yönetimi | Gürbüz Oyuncak Admin</title>
    
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
        
        .coupon-card {
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
        
        .card-header-custom h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
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
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            color: white;
        }
        
        .badge-status {
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
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
                    <i data-lucide="ticket" style="width: 32px; height: 32px;"></i>
                    Kupon Yönetimi
                </h1>
                <button class="btn btn-primary-gradient" data-bs-toggle="modal" data-bs-target="#couponModal" onclick="openModal()">
                    <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                    Yeni Kupon
                </button>
            </div>
            
            <div class="coupon-card">
                <div class="card-header-custom">
                    <h3>
                        <i data-lucide="tag" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle; margin-right: 8px;"></i>
                        Kuponlar
                    </h3>
                </div>
                
                <div class="filters">
                    <select class="form-select" id="filterActive" onchange="loadCoupons()" style="width: auto;">
                        <option value="">Tüm Kuponlar</option>
                        <option value="1">Aktif</option>
                        <option value="0">Pasif</option>
                    </select>
                    <select class="form-select" id="filterCustomerType" onchange="loadCoupons()" style="width: auto;">
                        <option value="">Tüm Müşteriler</option>
                        <option value="all">Genel</option>
                        <option value="B2C">B2C</option>
                        <option value="B2B">B2B</option>
                    </select>
                    <input type="text" class="form-control" id="searchInput" placeholder="Kupon kodu ara..." onkeyup="loadCoupons()" style="width: auto; min-width: 250px;">
                </div>
                
                <div class="table-responsive">
                    <table class="table">
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
                            <tr>
                                <td colspan="8" class="text-center py-4">
                                    <i data-lucide="loader-2" style="width: 32px; height: 32px; animation: spin 1s linear infinite;"></i>
                                    <p class="mt-2">Yükleniyor...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal -->
    <div class="modal fade" id="couponModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header" style="background: var(--primary-gradient); color: white;">
                    <h5 class="modal-title" id="modalTitle">Yeni Kupon Oluştur</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" style="filter: brightness(0) invert(1);"></button>
                </div>
                <div class="modal-body">
                    <form id="couponForm">
                        <input type="hidden" id="couponId">
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Kupon Kodu *</label>
                                <input type="text" class="form-control" id="code" required>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">İsim *</label>
                                <input type="text" class="form-control" id="name" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">İndirim Türü *</label>
                                <select class="form-select" id="discountType" required>
                                    <option value="percentage">Yüzde (%)</option>
                                    <option value="fixed">Sabit Tutar (TL)</option>
                                    <option value="free_shipping">Ücretsiz Kargo</option>
                                </select>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">İndirim Değeri *</label>
                                <input type="number" class="form-control" id="discountValue" step="0.01" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Min. Sepet Tutarı (TL)</label>
                                <input type="number" class="form-control" id="minPurchaseAmount" step="0.01" value="0">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Maks. İndirim (TL)</label>
                                <input type="number" class="form-control" id="maxDiscountAmount" step="0.01">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Toplam Kullanım Limiti</label>
                                <input type="number" class="form-control" id="usageLimit">
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Kullanıcı Başına Limit</label>
                                <input type="number" class="form-control" id="usageLimitPerUser" value="1">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Başlangıç Tarihi *</label>
                                <input type="datetime-local" class="form-control" id="validFrom" required>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Bitiş Tarihi *</label>
                                <input type="datetime-local" class="form-control" id="validUntil" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Müşteri Tipi</label>
                                <select class="form-select" id="customerType">
                                    <option value="all">Tümü</option>
                                    <option value="B2C">B2C</option>
                                    <option value="B2B">B2B</option>
                                </select>
                            </div>
                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Geçerlilik</label>
                                <select class="form-select" id="applicableTo">
                                    <option value="all">Tüm Ürünler</option>
                                    <option value="categories">Belirli Kategoriler</option>
                                    <option value="products">Belirli Ürünler</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Açıklama</label>
                            <textarea class="form-control" id="description" rows="3"></textarea>
                        </div>
                        
                        <div class="mb-3 form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="isActive" checked>
                            <label class="form-check-label" for="isActive">Aktif</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                    <button type="button" class="btn btn-primary-gradient" onclick="saveCoupon()">Kaydet</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/components/js/component-loader.js"></script>
    
    <script>
        lucide.createIcons();
        
        const API_BASE = '/backend/api/coupons.php';
        let bootstrap_modal;
        
        document.addEventListener('DOMContentLoaded', function() {
            bootstrap_modal = new bootstrap.Modal(document.getElementById('couponModal'));
            loadCoupons();
        });
        
        async function loadCoupons() {
            const active = document.getElementById('filterActive').value;
            const customerType = document.getElementById('filterCustomerType').value;
            const search = document.getElementById('searchInput').value;
            
            let url = API_BASE;
            const params = new URLSearchParams();
            if (active) params.append('active', active);
            if (customerType) params.append('customer_type', customerType);
            if (search) params.append('search', search);
            
            if (params.toString()) url += '?' + params.toString();
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.success) {
                    displayCoupons(data.data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        function displayCoupons(coupons) {
            const tbody = document.getElementById('couponsTableBody');
            
            if (coupons.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Kupon bulunamadı</td></tr>';
                return;
            }
            
            tbody.innerHTML = coupons.map(coupon => `
                <tr>
                    <td><strong>${coupon.code}</strong></td>
                    <td>${coupon.name}</td>
                    <td>
                        ${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : 
                          coupon.discount_type === 'fixed' ? '₺' + coupon.discount_value : 'Ücretsiz Kargo'}
                    </td>
                    <td><span class="badge bg-secondary">${coupon.customer_type}</span></td>
                    <td>${coupon.usage_count || 0} / ${coupon.usage_limit || '∞'}</td>
                    <td>
                        <small>
                            ${new Date(coupon.valid_from).toLocaleDateString('tr-TR')}<br>
                            ${new Date(coupon.valid_until).toLocaleDateString('tr-TR')}
                        </small>
                    </td>
                    <td>
                        <span class="badge-status ${coupon.is_active == 1 ? 'badge-active' : 'badge-inactive'}">
                            ${coupon.is_active == 1 ? 'Aktif' : 'Pasif'}
                        </span>
                    </td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-primary btn-sm" onclick="editCoupon(${coupon.id})">
                                <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCoupon(${coupon.id})">
                                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            lucide.createIcons();
        }
        
        function openModal() {
            document.getElementById('couponForm').reset();
            document.getElementById('couponId').value = '';
            document.getElementById('modalTitle').textContent = 'Yeni Kupon Oluştur';
            document.getElementById('isActive').checked = true;
        }
        
        async function saveCoupon() {
            const couponId = document.getElementById('couponId').value;
            
            const couponData = {
                code: document.getElementById('code').value,
                name: document.getElementById('name').value,
                discount_type: document.getElementById('discountType').value,
                discount_value: document.getElementById('discountValue').value,
                min_purchase_amount: document.getElementById('minPurchaseAmount').value,
                max_discount_amount: document.getElementById('maxDiscountAmount').value,
                usage_limit: document.getElementById('usageLimit').value,
                usage_limit_per_user: document.getElementById('usageLimitPerUser').value,
                valid_from: document.getElementById('validFrom').value,
                valid_until: document.getElementById('validUntil').value,
                customer_type: document.getElementById('customerType').value,
                applicable_to: document.getElementById('applicableTo').value,
                description: document.getElementById('description').value,
                is_active: document.getElementById('isActive').checked ? 1 : 0
            };
            
            try {
                const method = couponId ? 'PUT' : 'POST';
                const url = couponId ? `${API_BASE}?id=${couponId}` : API_BASE;
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(couponData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    bootstrap_modal.hide();
                    loadCoupons();
                    alert(couponId ? 'Kupon güncellendi' : 'Kupon eklendi');
                } else {
                    alert('Hata: ' + (data.message || 'İşlem başarısız'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Bir hata oluştu');
            }
        }
        
        async function editCoupon(id) {
            try {
                const response = await fetch(`${API_BASE}?id=${id}`);
                const data = await response.json();
                
                if (data.success) {
                    const coupon = data.data;
                    
                    document.getElementById('modalTitle').textContent = 'Kupon Düzenle';
                    document.getElementById('couponId').value = coupon.id;
                    document.getElementById('code').value = coupon.code;
                    document.getElementById('name').value = coupon.name;
                    document.getElementById('discountType').value = coupon.discount_type;
                    document.getElementById('discountValue').value = coupon.discount_value;
                    document.getElementById('minPurchaseAmount').value = coupon.min_purchase_amount || 0;
                    document.getElementById('maxDiscountAmount').value = coupon.max_discount_amount || '';
                    document.getElementById('usageLimit').value = coupon.usage_limit || '';
                    document.getElementById('usageLimitPerUser').value = coupon.usage_limit_per_user || 1;
                    document.getElementById('validFrom').value = coupon.valid_from.replace(' ', 'T');
                    document.getElementById('validUntil').value = coupon.valid_until.replace(' ', 'T');
                    document.getElementById('customerType').value = coupon.customer_type;
                    document.getElementById('applicableTo').value = coupon.applicable_to;
                    document.getElementById('description').value = coupon.description || '';
                    document.getElementById('isActive').checked = coupon.is_active == 1;
                    
                    bootstrap_modal.show();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function deleteCoupon(id) {
            if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return;
            
            try {
                const response = await fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' });
                const data = await response.json();
                
                if (data.success) {
                    loadCoupons();
                    alert('Kupon silindi');
                } else {
                    alert('Hata: ' + (data.message || 'Silme başarısız'));
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    </script>
    
    <style>
        .badge-active {
            background-color: #d1fae5;
            color: #065f46;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .badge-inactive {
            background-color: #fee2e2;
            color: #991b1b;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</body>
</html>
