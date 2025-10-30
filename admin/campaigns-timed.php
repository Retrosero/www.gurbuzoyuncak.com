<?php
/**
 * Timed Discount Kampanya Yönetimi - Admin Panel
 * Gürbüz Oyuncak E-Ticaret Sistemi
 * Mobile Responsive & Component Sistemi ile Modernize Edildi
 */

require_once 'includes/auth.php';
require_once '../backend/config/database.php';
require_once '../backend/classes/Campaign.php';
require_once '../backend/classes/Product.php';
require_once '../components/ComponentLoader.php';

// Admin giriş kontrolü
if (!isAdminLoggedIn()) {
    header("Location: login.php");
    exit();
}

$database = new Database();
$db = $database->getConnection();
$campaign = new Campaign($db);
$product = new Product($db);

$message = '';
$error = '';

// Form işlemleri
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'] ?? '';
    
    try {
        switch ($action) {
            case 'create_timed':
                $campaign->name = trim($_POST['name']);
                $campaign->description = trim($_POST['description']);
                $campaign->campaign_type = 'timed_discount';
                $campaign->customer_type = $_POST['customer_type'] ?? 'all';
                $campaign->discount_type = $_POST['discount_type'];
                $campaign->discount_value = floatval($_POST['discount_value']);
                $campaign->start_date = $_POST['start_date'];
                $campaign->end_date = $_POST['end_date'];
                $campaign->min_purchase_amount = floatval($_POST['min_purchase_amount'] ?? 0);
                $campaign->max_discount_amount = floatval($_POST['max_discount_amount'] ?? 0);
                $campaign->priority = intval($_POST['priority'] ?? 1);
                $campaign->is_active = isset($_POST['is_active']) ? 1 : 0;
                
                // Ürün ID'lerini JSON formatında kaydet
                $selected_products = $_POST['product_ids'] ?? [];
                if (!empty($selected_products)) {
                    $campaign->product_ids = json_encode(array_map('intval', $selected_products));
                } else {
                    $campaign->product_ids = null;
                }
                
                if ($campaign->create()) {
                    $message = 'Timed discount kampanyası başarıyla oluşturuldu.';
                } else {
                    $error = 'Kampanya oluşturulurken hata oluştu.';
                }
                break;
                
            case 'update_timed':
                $campaign->id = intval($_POST['campaign_id']);
                $campaign->name = trim($_POST['name']);
                $campaign->description = trim($_POST['description']);
                $campaign->campaign_type = 'timed_discount';
                $campaign->customer_type = $_POST['customer_type'] ?? 'all';
                $campaign->discount_type = $_POST['discount_type'];
                $campaign->discount_value = floatval($_POST['discount_value']);
                $campaign->start_date = $_POST['start_date'];
                $campaign->end_date = $_POST['end_date'];
                $campaign->min_purchase_amount = floatval($_POST['min_purchase_amount'] ?? 0);
                $campaign->max_discount_amount = floatval($_POST['max_discount_amount'] ?? 0);
                $campaign->priority = intval($_POST['priority'] ?? 1);
                $campaign->is_active = isset($_POST['is_active']) ? 1 : 0;
                
                // Ürün ID'lerini JSON formatında kaydet
                $selected_products = $_POST['product_ids'] ?? [];
                if (!empty($selected_products)) {
                    $campaign->product_ids = json_encode(array_map('intval', $selected_products));
                } else {
                    $campaign->product_ids = null;
                }
                
                if ($campaign->update()) {
                    $message = 'Kampanya başarıyla güncellendi.';
                } else {
                    $error = 'Kampanya güncellenirken hata oluştu.';
                }
                break;
                
            case 'delete':
                $campaign->id = intval($_POST['campaign_id']);
                if ($campaign->delete()) {
                    $message = 'Kampanya başarıyla silindi.';
                } else {
                    $error = 'Kampanya silinirken hata oluştu.';
                }
                break;
                
            case 'toggle_status':
                $campaign->id = intval($_POST['campaign_id']);
                $campaign_data = $campaign->readOne();
                if ($campaign_data) {
                    $campaign->is_active = $campaign_data['is_active'] ? 0 : 1;
                    if ($campaign->update()) {
                        $status = $campaign->is_active ? 'aktif' : 'pasif';
                        $message = "Kampanya {$status} olarak güncellendi.";
                    }
                }
                break;
        }
    } catch (Exception $e) {
        $error = 'İşlem sırasında hata oluştu: ' . $e->getMessage();
    }
}

// Kampanyaları getir
$filters = ['campaign_type' => 'timed_discount'];
$campaigns_stmt = $campaign->readAll($filters);
$campaigns = $campaigns_stmt->fetchAll(PDO::FETCH_ASSOC);

// Ürünleri getir (select için)
$products_stmt = $product->read();
$products = $products_stmt->fetchAll(PDO::FETCH_ASSOC);

// Düzenleme için kampanya getir
$edit_campaign = null;
if (isset($_GET['edit']) && is_numeric($_GET['edit'])) {
    $campaign->id = intval($_GET['edit']);
    $edit_campaign = $campaign->readOne();
    if ($edit_campaign && $edit_campaign['campaign_type'] !== 'timed_discount') {
        $edit_campaign = null; // Sadece timed discount kampanyalarını düzenle
    }
}

// Component Loader
$loader = new ComponentLoader();
?>

<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <title>Timed Discount Kampanyaları - Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- Custom Styles -->
    <style>
        .page-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .page-header h1 {
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .page-header p {
            opacity: 0.9;
            margin-bottom: 0;
        }
        
        .form-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            margin-bottom: 1.5rem;
            border: 1px solid #e9ecef;
        }
        
        .form-card h3 {
            color: #2c3e50;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1.25rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #667eea;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .form-label {
            font-weight: 500;
            color: #495057;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .form-control,
        .form-select {
            border-radius: 8px;
            border: 1px solid #dee2e6;
            padding: 0.625rem 0.875rem;
            font-size: 0.95rem;
            min-height: 44px;
        }
        
        .form-control:focus,
        .form-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }
        
        .form-check-input {
            width: 1.25rem;
            height: 1.25rem;
            margin-top: 0.125rem;
            cursor: pointer;
        }
        
        .product-selector {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 0.75rem;
            background: #f8f9fa;
        }
        
        .product-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.625rem;
            border-bottom: 1px solid #e9ecef;
            background: white;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            transition: all 0.2s;
        }
        
        .product-item:hover {
            background: #f0f3ff;
            transform: translateX(3px);
        }
        
        .product-item:last-child {
            margin-bottom: 0;
        }
        
        .product-item input[type="checkbox"] {
            width: 1.125rem;
            height: 1.125rem;
            cursor: pointer;
            flex-shrink: 0;
        }
        
        .product-item label {
            cursor: pointer;
            margin-bottom: 0;
            flex: 1;
            font-size: 0.9rem;
        }
        
        .discount-preview {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            margin-top: 1rem;
            font-weight: 600;
        }
        
        .countdown-preview {
            background: #e3f2fd;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            text-align: center;
        }
        
        .campaign-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border: 1px solid #e9ecef;
            transition: all 0.3s;
        }
        
        .campaign-card:hover {
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }
        
        .campaign-card h3 {
            color: #2c3e50;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }
        
        .campaign-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 0.75rem;
            margin: 1rem 0;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .campaign-meta-item {
            font-size: 0.875rem;
        }
        
        .campaign-meta-item strong {
            color: #495057;
            display: block;
            margin-bottom: 0.25rem;
        }
        
        .status-badge {
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
            font-size: 0.8125rem;
            font-weight: 500;
            display: inline-block;
        }
        
        .status-active {
            background: #d4edda;
            color: #155724;
        }
        
        .status-inactive {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-upcoming {
            background: #cce5ff;
            color: #004085;
        }
        
        .status-expired {
            background: #e2e3e5;
            color: #495057;
        }
        
        .btn-action {
            min-height: 44px;
            padding: 0.625rem 1.25rem;
            font-size: 0.9rem;
            font-weight: 500;
            border-radius: 8px;
            transition: all 0.2s;
            border: none;
        }
        
        .btn-action:active {
            transform: scale(0.98);
        }
        
        .btn-primary-custom {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-primary-custom:hover {
            background: linear-gradient(135deg, #5568d3 0%, #6a3f91 100%);
            color: white;
        }
        
        .btn-group-mobile {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #6c757d;
        }
        
        .empty-state i {
            font-size: 4rem;
            opacity: 0.3;
            margin-bottom: 1rem;
        }
        
        /* Mobile Optimizations */
        @media (max-width: 768px) {
            .page-header h1 {
                font-size: 1.5rem;
            }
            
            .form-card {
                padding: 1rem;
            }
            
            .campaign-card {
                padding: 1rem;
            }
            
            .campaign-meta {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
            
            .btn-group-mobile {
                width: 100%;
            }
            
            .btn-group-mobile .btn {
                flex: 1;
                min-width: auto;
            }
            
            .product-selector {
                max-height: 250px;
            }
        }
        
        /* Scrollbar Styling */
        .product-selector::-webkit-scrollbar {
            width: 8px;
        }
        
        .product-selector::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .product-selector::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 4px;
        }
        
        .product-selector::-webkit-scrollbar-thumb:hover {
            background: #5568d3;
        }
    </style>
</head>

<body>
    <!-- Sidebar -->
    <?php $loader->loadComponent('sidebar', ['type' => 'admin', 'active' => 'campaigns-timed']); ?>
    
    <!-- Main Content -->
    <div class="main-content">
        <!-- Mobile Header -->
        <div class="mobile-header d-md-none">
            <button class="mobile-menu-toggle" id="mobileMenuToggle">
                <i class="fas fa-bars"></i>
            </button>
            <div class="mobile-header-title">Timed Discount</div>
            <div class="mobile-header-actions">
                <a href="../" class="btn btn-sm btn-outline-light">
                    <i class="fas fa-home"></i>
                </a>
            </div>
        </div>
        
        <div class="container-fluid p-3 p-md-4">
            <!-- Page Header -->
            <div class="page-header">
                <div class="px-3 px-md-4">
                    <h1><i class="fas fa-clock me-2"></i> Timed Discount Kampanyaları</h1>
                    <p class="mb-0">Süreli indirim kampanyalarını yönetin</p>
                </div>
            </div>
            
            <!-- Alert Messages -->
            <?php if ($message): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    <?php echo htmlspecialchars($message); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            
            <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <?php echo htmlspecialchars($error); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            
            <!-- Campaign Form -->
            <form method="POST" id="campaignForm">
                <input type="hidden" name="action" value="<?php echo $edit_campaign ? 'update_timed' : 'create_timed'; ?>">
                <?php if ($edit_campaign): ?>
                    <input type="hidden" name="campaign_id" value="<?php echo $edit_campaign['id']; ?>">
                <?php endif; ?>
                
                <div class="row g-3">
                    <!-- Temel Bilgiler -->
                    <div class="col-12 col-lg-6">
                        <div class="form-card">
                            <h3><i class="fas fa-info-circle"></i> Temel Bilgiler</h3>
                            
                            <div class="mb-3">
                                <label for="name" class="form-label">Kampanya Adı *</label>
                                <input type="text" name="name" id="name" class="form-control" required 
                                       value="<?php echo $edit_campaign ? htmlspecialchars($edit_campaign['name']) : ''; ?>"
                                       placeholder="Örn: Kış Sonu Büyük İndirim">
                            </div>
                            
                            <div class="mb-3">
                                <label for="description" class="form-label">Açıklama</label>
                                <textarea name="description" id="description" class="form-control" rows="3"
                                          placeholder="Kampanya açıklaması..."><?php echo $edit_campaign ? htmlspecialchars($edit_campaign['description']) : ''; ?></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label for="customer_type" class="form-label">Müşteri Tipi</label>
                                <select name="customer_type" id="customer_type" class="form-select">
                                    <option value="all" <?php echo ($edit_campaign && $edit_campaign['customer_type'] == 'all') ? 'selected' : ''; ?>>Tüm Müşteriler</option>
                                    <option value="retail" <?php echo ($edit_campaign && $edit_campaign['customer_type'] == 'retail') ? 'selected' : ''; ?>>Bireysel</option>
                                    <option value="wholesale" <?php echo ($edit_campaign && $edit_campaign['customer_type'] == 'wholesale') ? 'selected' : ''; ?>>Toptan</option>
                                    <option value="bayi" <?php echo ($edit_campaign && $edit_campaign['customer_type'] == 'bayi') ? 'selected' : ''; ?>>Bayiler</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="priority" class="form-label">Öncelik</label>
                                <select name="priority" id="priority" class="form-select">
                                    <option value="1" <?php echo ($edit_campaign && $edit_campaign['priority'] == 1) ? 'selected' : ''; ?>>Düşük</option>
                                    <option value="5" <?php echo ($edit_campaign && $edit_campaign['priority'] == 5) ? 'selected' : ''; ?>>Orta</option>
                                    <option value="10" <?php echo ($edit_campaign && $edit_campaign['priority'] == 10) ? 'selected' : ''; ?>>Yüksek</option>
                                </select>
                            </div>
                            
                            <div class="form-check">
                                <input type="checkbox" name="is_active" id="is_active" class="form-check-input" value="1" 
                                       <?php echo (!$edit_campaign || $edit_campaign['is_active']) ? 'checked' : ''; ?>>
                                <label for="is_active" class="form-check-label">Kampanya Aktif</label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- İndirim Ayarları -->
                    <div class="col-12 col-lg-6">
                        <div class="form-card">
                            <h3><i class="fas fa-percentage"></i> İndirim Ayarları</h3>
                            
                            <div class="mb-3">
                                <label for="discount_type" class="form-label">İndirim Tipi</label>
                                <select name="discount_type" id="discount_type" class="form-select" onchange="updateDiscountPreview()">
                                    <option value="percentage" <?php echo ($edit_campaign && $edit_campaign['discount_type'] == 'percentage') ? 'selected' : ''; ?>>Yüzde (%)</option>
                                    <option value="fixed" <?php echo ($edit_campaign && $edit_campaign['discount_type'] == 'fixed') ? 'selected' : ''; ?>>Sabit Tutar (TL)</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="discount_value" class="form-label">İndirim Değeri *</label>
                                <input type="number" name="discount_value" id="discount_value" class="form-control" required min="0" step="0.01"
                                       value="<?php echo $edit_campaign ? $edit_campaign['discount_value'] : ''; ?>"
                                       placeholder="İndirim miktarı" oninput="updateDiscountPreview()">
                            </div>
                            
                            <div class="mb-3">
                                <label for="min_purchase_amount" class="form-label">Minimum Alışveriş Tutarı (TL)</label>
                                <input type="number" name="min_purchase_amount" id="min_purchase_amount" class="form-control" min="0" step="0.01"
                                       value="<?php echo $edit_campaign ? $edit_campaign['min_purchase_amount'] : '0'; ?>"
                                       placeholder="0">
                            </div>
                            
                            <div class="mb-3">
                                <label for="max_discount_amount" class="form-label">Maksimum İndirim Tutarı (TL)</label>
                                <input type="number" name="max_discount_amount" id="max_discount_amount" class="form-control" min="0" step="0.01"
                                       value="<?php echo $edit_campaign ? $edit_campaign['max_discount_amount'] : ''; ?>"
                                       placeholder="0 = sınırsız" oninput="updateDiscountPreview()">
                                <small class="text-muted">Yüzde indirimlerde üst limit belirlemek için</small>
                            </div>
                            
                            <div class="discount-preview">
                                <div class="mb-1">İndirim Önizlemesi</div>
                                <div id="previewText" style="font-size: 1.25rem;">%0 indirim</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Zaman Ayarları -->
                    <div class="col-12 col-lg-6">
                        <div class="form-card">
                            <h3><i class="fas fa-calendar-alt"></i> Zaman Ayarları</h3>
                            
                            <div class="mb-3">
                                <label for="start_date" class="form-label">Başlangıç Tarihi *</label>
                                <input type="datetime-local" name="start_date" id="start_date" class="form-control" required
                                       value="<?php echo $edit_campaign ? date('Y-m-d\TH:i', strtotime($edit_campaign['start_date'])) : ''; ?>"
                                       onchange="updateCountdownPreview()">
                            </div>
                            
                            <div class="mb-3">
                                <label for="end_date" class="form-label">Bitiş Tarihi *</label>
                                <input type="datetime-local" name="end_date" id="end_date" class="form-control" required
                                       value="<?php echo $edit_campaign ? date('Y-m-d\TH:i', strtotime($edit_campaign['end_date'])) : ''; ?>"
                                       onchange="updateCountdownPreview()">
                            </div>
                            
                            <div class="countdown-preview">
                                <div class="mb-1"><strong>Countdown Önizlemesi</strong></div>
                                <div id="previewCountdown" class="text-muted">Tarihler seçildikten sonra görünecek</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Ürün Seçimi -->
                    <div class="col-12 col-lg-6">
                        <div class="form-card">
                            <h3><i class="fas fa-box"></i> Ürün Seçimi</h3>
                            
                            <div class="mb-3">
                                <label class="form-label">Kampanyaya Dahil Ürünler</label>
                                <div class="btn-group-mobile mb-2">
                                    <button type="button" onclick="selectAllProducts()" class="btn btn-sm btn-secondary">
                                        <i class="fas fa-check-double me-1"></i> Tümünü Seç
                                    </button>
                                    <button type="button" onclick="deselectAllProducts()" class="btn btn-sm btn-secondary">
                                        <i class="fas fa-times me-1"></i> Temizle
                                    </button>
                                </div>
                                <div class="product-selector" id="productSelector">
                                    <?php
                                    $selected_product_ids = [];
                                    if ($edit_campaign && $edit_campaign['product_ids']) {
                                        $selected_product_ids = json_decode($edit_campaign['product_ids'], true) ?: [];
                                    }
                                    ?>
                                    <?php foreach ($products as $p): ?>
                                        <div class="product-item">
                                            <input type="checkbox" name="product_ids[]" value="<?php echo $p['id']; ?>" 
                                                   id="product_<?php echo $p['id']; ?>"
                                                   <?php echo in_array($p['id'], $selected_product_ids) ? 'checked' : ''; ?>>
                                            <label for="product_<?php echo $p['id']; ?>">
                                                <?php echo htmlspecialchars($p['name']); ?> 
                                                <span class="text-primary fw-bold">(<?php echo number_format($p['price'], 2); ?> TL)</span>
                                            </label>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                                <small class="text-muted">Hiçbir ürün seçilmezse kampanya tüm ürünlere uygulanır</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Submit Buttons -->
                <div class="text-center mt-4 mb-3">
                    <button type="submit" class="btn btn-primary-custom btn-action btn-lg px-5">
                        <i class="fas fa-save me-2"></i>
                        <?php echo $edit_campaign ? 'Kampanyayı Güncelle' : 'Kampanyayı Oluştur'; ?>
                    </button>
                    <?php if ($edit_campaign): ?>
                        <a href="campaigns-timed.php" class="btn btn-secondary btn-action btn-lg px-4 ms-2">
                            <i class="fas fa-times me-2"></i> Vazgeç
                        </a>
                    <?php endif; ?>
                </div>
            </form>
            
            <!-- Mevcut Kampanyalar -->
            <div class="mt-5">
                <div class="d-flex align-items-center mb-3">
                    <h2 class="h4 mb-0"><i class="fas fa-list me-2"></i> Mevcut Kampanyalar</h2>
                    <span class="badge bg-primary ms-2"><?php echo count($campaigns); ?></span>
                </div>
                
                <?php if (empty($campaigns)): ?>
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p class="mb-0">Henüz timed discount kampanyası oluşturulmamış.</p>
                    </div>
                <?php else: ?>
                    <?php foreach ($campaigns as $c): ?>
                        <?php
                        $now = new DateTime();
                        $start = new DateTime($c['start_date']);
                        $end = new DateTime($c['end_date']);
                        
                        if ($c['is_active']) {
                            if ($now < $start) {
                                $status = 'upcoming';
                                $status_text = 'Yakında Başlayacak';
                            } elseif ($now > $end) {
                                $status = 'expired';
                                $status_text = 'Süresi Doldu';
                            } else {
                                $status = 'active';
                                $status_text = 'Aktif';
                            }
                        } else {
                            $status = 'inactive';
                            $status_text = 'Pasif';
                        }
                        
                        $selected_products = [];
                        if ($c['product_ids']) {
                            $product_ids = json_decode($c['product_ids'], true);
                            if ($product_ids) {
                                foreach ($products as $p) {
                                    if (in_array($p['id'], $product_ids)) {
                                        $selected_products[] = $p['name'];
                                    }
                                }
                            }
                        }
                        ?>
                        <div class="campaign-card">
                            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                                <div class="flex-grow-1 mb-3 mb-md-0">
                                    <h3 class="mb-2"><?php echo htmlspecialchars($c['name']); ?></h3>
                                    <span class="status-badge status-<?php echo $status; ?> mb-2">
                                        <?php echo $status_text; ?>
                                    </span>
                                    <?php if ($c['description']): ?>
                                        <p class="text-muted mb-0 mt-2"><?php echo htmlspecialchars($c['description']); ?></p>
                                    <?php endif; ?>
                                </div>
                                
                                <div class="btn-group-mobile">
                                    <a href="?edit=<?php echo $c['id']; ?>" class="btn btn-primary btn-sm">
                                        <i class="fas fa-edit me-1"></i> Düzenle
                                    </a>
                                    <form method="POST" class="d-inline" onsubmit="return confirm('Durumu değiştirmek istediğinizden emin misiniz?')">
                                        <input type="hidden" name="action" value="toggle_status">
                                        <input type="hidden" name="campaign_id" value="<?php echo $c['id']; ?>">
                                        <button type="submit" class="btn btn-sm <?php echo $c['is_active'] ? 'btn-warning' : 'btn-success'; ?>">
                                            <i class="fas fa-<?php echo $c['is_active'] ? 'pause' : 'play'; ?> me-1"></i>
                                            <?php echo $c['is_active'] ? 'Pasif Yap' : 'Aktif Yap'; ?>
                                        </button>
                                    </form>
                                    <form method="POST" class="d-inline" onsubmit="return confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="campaign_id" value="<?php echo $c['id']; ?>">
                                        <button type="submit" class="btn btn-danger btn-sm">
                                            <i class="fas fa-trash me-1"></i> Sil
                                        </button>
                                    </form>
                                </div>
                            </div>
                            
                            <div class="campaign-meta">
                                <div class="campaign-meta-item">
                                    <strong>İndirim</strong>
                                    <span>
                                        <?php echo $c['discount_type'] == 'percentage' ? '%' . $c['discount_value'] : number_format($c['discount_value'], 2) . ' TL'; ?>
                                        <?php if ($c['max_discount_amount'] > 0): ?>
                                            (Max: <?php echo number_format($c['max_discount_amount'], 2); ?> TL)
                                        <?php endif; ?>
                                    </span>
                                </div>
                                <div class="campaign-meta-item">
                                    <strong>Başlangıç</strong>
                                    <span><?php echo date('d.m.Y H:i', strtotime($c['start_date'])); ?></span>
                                </div>
                                <div class="campaign-meta-item">
                                    <strong>Bitiş</strong>
                                    <span><?php echo date('d.m.Y H:i', strtotime($c['end_date'])); ?></span>
                                </div>
                                <div class="campaign-meta-item">
                                    <strong>Min. Tutar</strong>
                                    <span><?php echo number_format($c['min_purchase_amount'], 2); ?> TL</span>
                                </div>
                                <div class="campaign-meta-item">
                                    <strong>Öncelik</strong>
                                    <span><?php echo $c['priority']; ?></span>
                                </div>
                                <div class="campaign-meta-item">
                                    <strong>Müşteri Tipi</strong>
                                    <span>
                                        <?php
                                        switch ($c['customer_type']) {
                                            case 'all': echo 'Tüm Müşteriler'; break;
                                            case 'retail': echo 'Bireysel'; break;
                                            case 'wholesale': echo 'Toptan'; break;
                                            case 'bayi': echo 'Bayiler'; break;
                                            default: echo $c['customer_type'];
                                        }
                                        ?>
                                    </span>
                                </div>
                            </div>
                            
                            <?php if (!empty($selected_products)): ?>
                                <div class="mt-3 p-2 bg-light rounded">
                                    <strong class="d-block mb-1">Dahil Ürünler:</strong>
                                    <small class="text-muted">
                                        <?php echo implode(', ', array_slice($selected_products, 0, 3)); ?>
                                        <?php if (count($selected_products) > 3): ?>
                                            ve <?php echo count($selected_products) - 3; ?> ürün daha...
                                        <?php endif; ?>
                                    </small>
                                </div>
                            <?php else: ?>
                                <div class="mt-3 p-2 bg-light rounded">
                                    <small class="text-muted"><strong>Tüm ürünlere uygulanır</strong></small>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap Bundle JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader JS -->
    <script src="../components/js/component-loader.js"></script>
    
    <!-- Custom Scripts -->
    <script>
        function updateDiscountPreview() {
            const discountType = document.getElementById('discount_type').value;
            const discountValue = parseFloat(document.getElementById('discount_value').value) || 0;
            const maxDiscountAmount = parseFloat(document.getElementById('max_discount_amount').value) || 0;
            
            let previewText = '';
            if (discountType === 'percentage') {
                previewText = `%${discountValue} indirim`;
                if (maxDiscountAmount > 0) {
                    previewText += ` (Max: ${maxDiscountAmount.toFixed(2)} TL)`;
                }
            } else {
                previewText = `${discountValue.toFixed(2)} TL indirim`;
            }
            
            document.getElementById('previewText').textContent = previewText;
        }
        
        function updateCountdownPreview() {
            const startDate = document.getElementById('start_date').value;
            const endDate = document.getElementById('end_date').value;
            
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const now = new Date();
                
                if (end > start) {
                    const diff = end - now;
                    if (diff > 0) {
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        
                        document.getElementById('previewCountdown').innerHTML = 
                            `<strong class="text-primary">${days}</strong> gün <strong class="text-primary">${hours}</strong> saat <strong class="text-primary">${minutes}</strong> dakika kaldı`;
                        document.getElementById('previewCountdown').classList.remove('text-muted');
                    } else {
                        document.getElementById('previewCountdown').textContent = 'Kampanya süresi dolmuş';
                        document.getElementById('previewCountdown').classList.add('text-muted');
                    }
                } else {
                    document.getElementById('previewCountdown').textContent = 'Bitiş tarihi başlangıçtan sonra olmalı';
                    document.getElementById('previewCountdown').classList.add('text-muted');
                }
            }
        }
        
        function selectAllProducts() {
            const checkboxes = document.querySelectorAll('#productSelector input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = true);
        }
        
        function deselectAllProducts() {
            const checkboxes = document.querySelectorAll('#productSelector input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
        }
        
        // Sayfa yüklendiğinde önizlemeleri güncelle
        document.addEventListener('DOMContentLoaded', function() {
            updateDiscountPreview();
            updateCountdownPreview();
            
            // Tarih inputlarına event listener ekle
            document.getElementById('start_date').addEventListener('change', updateCountdownPreview);
            document.getElementById('end_date').addEventListener('change', updateCountdownPreview);
            
            // Mobile menu toggle
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            if (mobileMenuToggle) {
                mobileMenuToggle.addEventListener('click', function() {
                    document.body.classList.toggle('sidebar-open');
                });
            }
        });
    </script>
</body>
</html>
