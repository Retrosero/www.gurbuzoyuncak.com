<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/../components/ComponentLoader.php';
require_once __DIR__ . '/../backend/classes/CustomerType.php';

if (!isAdminLoggedIn()) {
    header('Location: login.php');
    exit;
}

$customerTypeManager = new CustomerType();
$message = '';
$messageType = '';

// Form gönderildiğinde
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'add':
                $data = [
                    'name' => $_POST['name'],
                    'code' => $_POST['code'],
                    'price_multiplier' => $_POST['price_multiplier'],
                    'discount_percentage' => $_POST['discount_percentage'],
                    'min_order_amount' => $_POST['min_order_amount'],
                    'is_active' => isset($_POST['is_active']) ? 1 : 0
                ];
                
                if ($customerTypeManager->create($data)) {
                    $message = 'Müşteri grubu başarıyla eklendi!';
                    $messageType = 'success';
                } else {
                    $message = 'Müşteri grubu eklenirken hata oluştu!';
                    $messageType = 'error';
                }
                break;
                
            case 'update':
                $data = [
                    'name' => $_POST['name'],
                    'code' => $_POST['code'],
                    'price_multiplier' => $_POST['price_multiplier'],
                    'discount_percentage' => $_POST['discount_percentage'],
                    'min_order_amount' => $_POST['min_order_amount'],
                    'is_active' => isset($_POST['is_active']) ? 1 : 0
                ];
                
                if ($customerTypeManager->update($_POST['id'], $data)) {
                    $message = 'Müşteri grubu başarıyla güncellendi!';
                    $messageType = 'success';
                } else {
                    $message = 'Müşteri grubu güncellenirken hata oluştu!';
                    $messageType = 'error';
                }
                break;
                
            case 'delete':
                if ($customerTypeManager->delete($_POST['id'])) {
                    $message = 'Müşteri grubu başarıyla silindi!';
                    $messageType = 'success';
                } else {
                    $message = 'Müşteri grubu silinirken hata oluştu!';
                    $messageType = 'error';
                }
                break;
        }
    }
}

$customerTypes = $customerTypeManager->getAll();
$editing = null;
if (isset($_GET['edit'])) {
    $editing = $customerTypeManager->getById($_GET['edit']);
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Müşteri Grupları | Gürbüz Oyuncak Admin</title>
    
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
        
        .form-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .form-card h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #1f2937;
        }
        
        .customer-card {
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
                    <i data-lucide="users" style="width: 32px; height: 32px;"></i>
                    Müşteri Grupları
                </h1>
            </div>
            
            <?php if ($message): ?>
                <div class="alert alert-<?php echo $messageType === 'success' ? 'success' : 'danger'; ?> alert-dismissible fade show" role="alert">
                    <?php echo $message; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            
            <!-- Form -->
            <div class="form-card">
                <h2><?php echo $editing ? 'Müşteri Grubu Düzenle' : 'Yeni Müşteri Grubu Ekle'; ?></h2>
                <form method="POST">
                    <input type="hidden" name="action" value="<?php echo $editing ? 'update' : 'add'; ?>">
                    <?php if ($editing): ?>
                        <input type="hidden" name="id" value="<?php echo $editing['id']; ?>">
                    <?php endif; ?>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Grup Adı *</label>
                            <input type="text" class="form-control" name="name" value="<?php echo $editing['name'] ?? ''; ?>" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Grup Kodu *</label>
                            <input type="text" class="form-control" name="code" value="<?php echo $editing['code'] ?? ''; ?>" required>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Fiyat Çarpanı *</label>
                            <input type="number" class="form-control" name="price_multiplier" step="0.01" value="<?php echo $editing['price_multiplier'] ?? '1.00'; ?>" required>
                            <small class="form-text text-muted">Örn: 1.00 = Liste fiyatı, 0.90 = %10 indirim</small>
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">İndirim Yüzdesi (%)</label>
                            <input type="number" class="form-control" name="discount_percentage" step="0.01" value="<?php echo $editing['discount_percentage'] ?? '0'; ?>">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Min. Sipariş Tutarı (TL)</label>
                            <input type="number" class="form-control" name="min_order_amount" step="0.01" value="<?php echo $editing['min_order_amount'] ?? '0'; ?>">
                        </div>
                    </div>
                    
                    <div class="mb-3 form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="is_active" id="is_active" <?php echo ($editing['is_active'] ?? 1) ? 'checked' : ''; ?>>
                        <label class="form-check-label" for="is_active">Aktif</label>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i data-lucide="save" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;"></i>
                            <?php echo $editing ? 'Güncelle' : 'Ekle'; ?>
                        </button>
                        <?php if ($editing): ?>
                            <a href="customer_types.php" class="btn btn-secondary">İptal</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>
            
            <!-- Tablo -->
            <div class="customer-card">
                <div class="card-header-custom">
                    <h3 class="m-0">Müşteri Grupları</h3>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Grup Adı</th>
                                <th>Kod</th>
                                <th>Fiyat Çarpanı</th>
                                <th>İndirim %</th>
                                <th>Min. Sipariş</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($customerTypes)): ?>
                                <tr>
                                    <td colspan="7" class="text-center py-4">Kayıt bulunamadı</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($customerTypes as $type): ?>
                                    <tr>
                                        <td><strong><?php echo htmlspecialchars($type['name']); ?></strong></td>
                                        <td><span class="badge bg-secondary"><?php echo htmlspecialchars($type['code']); ?></span></td>
                                        <td><?php echo number_format($type['price_multiplier'], 2); ?></td>
                                        <td><?php echo number_format($type['discount_percentage'], 2); ?>%</td>
                                        <td>₺<?php echo number_format($type['min_order_amount'], 2); ?></td>
                                        <td>
                                            <span class="badge <?php echo $type['is_active'] ? 'bg-success' : 'bg-danger'; ?>">
                                                <?php echo $type['is_active'] ? 'Aktif' : 'Pasif'; ?>
                                            </span>
                                        </td>
                                        <td>
                                            <div class="d-flex gap-1">
                                                <a href="?edit=<?php echo $type['id']; ?>" class="btn btn-primary btn-sm">
                                                    <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                                                </a>
                                                <form method="POST" style="display: inline;" onsubmit="return confirm('Silmek istediğinize emin misiniz?');">
                                                    <input type="hidden" name="action" value="delete">
                                                    <input type="hidden" name="id" value="<?php echo $type['id']; ?>">
                                                    <button type="submit" class="btn btn-danger btn-sm">
                                                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../components/js/component-loader.js"></script>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>
