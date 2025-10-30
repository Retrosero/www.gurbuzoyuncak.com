<?php
session_start();
require_once '../backend/classes/Database.php';
require_once '../backend/classes/CustomerType.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

$customerTypeManager = new CustomerType();
$message = '';
$messageType = '';

// Form gönderildiğinde işlemleri yap
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

// Tüm müşteri gruplarını getir
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
    <link rel="stylesheet" href="css/admin.css">
    <style>
        .form-section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input, .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
        
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .checkbox-group input[type="checkbox"] {
            width: auto;
        }
        
        .btn-group {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        .table-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .data-table th, .data-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .data-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .data-table tr:hover {
            background-color: #f8f9fa;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .status-active {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-inactive {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            font-size: 0.875rem;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background-color: #007bff;
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #0056b3;
        }
        
        .btn-warning {
            background-color: #ffc107;
            color: #212529;
        }
        
        .btn-warning:hover {
            background-color: #e0a800;
        }
        
        .btn-danger {
            background-color: #dc3545;
            color: white;
        }
        
        .btn-danger:hover {
            background-color: #c82333;
        }
        
        .message {
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
        }
        
        .message-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .price-preview {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="main-content">
            <div class="header">
                <h1>Müşteri Grupları Yönetimi</h1>
            </div>
            
            <?php if ($message): ?>
                <div class="message message-<?php echo $messageType; ?>">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>
            
            <!-- Form Section -->
            <div class="form-section">
                <h2><?php echo $editing ? 'Müşteri Grubunu Düzenle' : 'Yeni Müşteri Grubu Ekle'; ?></h2>
                
                <form method="POST" id="customerTypeForm">
                    <input type="hidden" name="action" value="<?php echo $editing ? 'update' : 'add'; ?>">
                    <?php if ($editing): ?>
                        <input type="hidden" name="id" value="<?php echo $editing['id']; ?>">
                    <?php endif; ?>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="name">Grup Adı *</label>
                            <input type="text" id="name" name="name" 
                                   value="<?php echo $editing ? htmlspecialchars($editing['name']) : ''; ?>" 
                                   required>
                        </div>
                        
                        <div class="form-group">
                            <label for="code">Grup Kodu *</label>
                            <select id="code" name="code" required>
                                <option value="">Seçiniz</option>
                                <option value="B2C" <?php echo ($editing && $editing['code'] === 'B2C') ? 'selected' : ''; ?>>B2C - Bireysel Müşteri</option>
                                <option value="B2B" <?php echo ($editing && $editing['code'] === 'B2B') ? 'selected' : ''; ?>>B2B - İşletme Müşterisi</option>
                                <option value="wholesale" <?php echo ($editing && $editing['code'] === 'wholesale') ? 'selected' : ''; ?>>Wholesale - Toptan Müşteri</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="price_multiplier">Fiyat Çarpanı *</label>
                            <input type="number" id="price_multiplier" name="price_multiplier" 
                                   value="<?php echo $editing ? $editing['price_multiplier'] : '1.00'; ?>" 
                                   step="0.01" min="0.1" max="2.0" required>
                            <small>1.00 = Normal fiyat, 0.70 = %30 indirimli fiyat</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="discount_percentage">Ek İndirim (%)</label>
                            <input type="number" id="discount_percentage" name="discount_percentage" 
                                   value="<?php echo $editing ? $editing['discount_percentage'] : '0'; ?>" 
                                   step="0.1" min="0" max="50">
                        </div>
                        
                        <div class="form-group">
                            <label for="min_order_amount">Minimum Sipariş Tutarı (₺)</label>
                            <input type="number" id="min_order_amount" name="min_order_amount" 
                                   value="<?php echo $editing ? $editing['min_order_amount'] : '0'; ?>" 
                                   step="0.01" min="0">
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <input type="checkbox" id="is_active" name="is_active" 
                                       <?php echo (!$editing || $editing['is_active']) ? 'checked' : ''; ?>>
                                <label for="is_active">Aktif</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button type="submit" class="btn btn-primary">
                            <?php echo $editing ? 'Güncelle' : 'Ekle'; ?>
                        </button>
                        <?php if ($editing): ?>
                            <a href="customer_types.php" class="btn btn-warning">İptal</a>
                        <?php endif; ?>
                    </div>
                </form>
                
                <div class="price-preview" id="pricePreview" style="display: none;">
                    <strong>Fiyat Önizlemesi:</strong><br>
                    100₺ ürün için: <span id="previewPrice">100₺</span>
                </div>
            </div>
            
            <!-- Table Section -->
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Grup Adı</th>
                            <th>Kod</th>
                            <th>Fiyat Çarpanı</th>
                            <th>Ek İndirim</th>
                            <th>Min. Sipariş</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($customerTypes as $type): ?>
                            <tr>
                                <td><?php echo $type['id']; ?></td>
                                <td><?php echo htmlspecialchars($type['name']); ?></td>
                                <td><strong><?php echo $type['code']; ?></strong></td>
                                <td><?php echo number_format($type['price_multiplier'], 2); ?>x</td>
                                <td><?php echo number_format($type['discount_percentage'], 1); ?>%</td>
                                <td><?php echo number_format($type['min_order_amount'], 2); ?>₺</td>
                                <td>
                                    <span class="status-badge status-<?php echo $type['is_active'] ? 'active' : 'inactive'; ?>">
                                        <?php echo $type['is_active'] ? 'Aktif' : 'Pasif'; ?>
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <a href="?edit=<?php echo $type['id']; ?>" class="btn btn-warning">Düzenle</a>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Bu müşteri grubunu silmek istediğinizden emin misiniz?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $type['id']; ?>">
                                            <button type="submit" class="btn btn-danger">Sil</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        // Fiyat önizleme
        function updatePricePreview() {
            const multiplier = parseFloat(document.getElementById('price_multiplier').value) || 1;
            const discount = parseFloat(document.getElementById('discount_percentage').value) || 0;
            const basePrice = 100;
            
            const discountedPrice = basePrice * multiplier * (1 - discount / 100);
            const finalPrice = discountedPrice.toFixed(2);
            
            document.getElementById('previewPrice').textContent = finalPrice + '₺';
            document.getElementById('pricePreview').style.display = 'block';
        }
        
        // Event listeners
        document.getElementById('price_multiplier').addEventListener('input', updatePricePreview);
        document.getElementById('discount_percentage').addEventListener('input', updatePricePreview);
        
        // Sayfa yüklendiğinde önizlemeyi göster
        <?php if ($editing): ?>
        updatePricePreview();
        <?php endif; ?>
        
        // Form validation
        document.getElementById('customerTypeForm').addEventListener('submit', function(e) {
            const name = document.getElementById('name').value.trim();
            const code = document.getElementById('code').value;
            const multiplier = parseFloat(document.getElementById('price_multiplier').value);
            
            if (!name) {
                alert('Grup adı gereklidir!');
                e.preventDefault();
                return;
            }
            
            if (!code) {
                alert('Grup kodu gereklidir!');
                e.preventDefault();
                return;
            }
            
            if (!multiplier || multiplier < 0.1 || multiplier > 2.0) {
                alert('Fiyat çarpanı 0.1 ile 2.0 arasında olmalıdır!');
                e.preventDefault();
                return;
            }
        });
    </script>
</body>
</html>