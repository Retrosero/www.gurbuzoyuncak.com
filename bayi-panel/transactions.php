<?php
/**
 * İşlem Geçmişi
 * Gürbüz Oyuncak E-Ticaret Sistemi
 * Mobile Responsive & Modern Design
 */

session_start();
require_once 'includes/auth.php';

// Giriş kontrolü
checkBayiLogin();

require_once '../backend/config/database.php';
require_once '../backend/classes/Bayi.php';

$database = new Database();
$db = $database->getConnection();

$bayi = new Bayi($db);
$bayi->bayi_id = $_SESSION['bayi_id'];

// Sayfalama
$page = intval($_GET['page'] ?? 1);
$limit = 25;
$offset = ($page - 1) * $limit;

// Filtreler
$filters = [
    'type' => $_GET['type'] ?? '',
    'status' => $_GET['status'] ?? '',
    'date_from' => $_GET['date_from'] ?? '',
    'date_to' => $_GET['date_to'] ?? ''
];

// İşlem geçmişini getir
$transactions = $bayi->islemGecmisiGetir($limit, $offset);

// Toplam sayıyı hesapla (yaklaşık)
$total_transactions = count($bayi->islemGecmisiGetir(1000, 0));
$total_pages = ceil($total_transactions / $limit);
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="theme-color" content="#1E88E5">
    
    <title>İşlem Geçmişi | Bayi Panel - Gürbüz Oyuncak</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/bayi-panel/css/style.css">
    <link rel="stylesheet" href="/components/css/components.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body { background-color: #F8FAFC; padding-top: 70px; }
        .main-content { margin-left: 0; padding: 2rem 0; }
        
        @media (min-width: 992px) {
            .main-content { margin-left: 280px; }
        }
        
        .filter-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
        .table-responsive { border-radius: 12px; overflow: hidden; }
        
        /* Mobile transaction cards */
        .transaction-card {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: none;
        }
        
        @media (max-width: 991px) {
            .table-responsive { display: none !important; }
            .transaction-card { display: block; }
        }
        
        .transaction-amount.positive { color: #10b981; font-weight: 700; }
        .transaction-amount.negative { color: #ef4444; font-weight: 700; }
        
        .badge { padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.875rem; font-weight: 500; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-secondary { background: #e5e7eb; color: #374151; }
    </style>
</head>
<body>
    <?php
    // Component Loader'ı include et
    require_once __DIR__ . '/../components/ComponentLoader.php';
    
    // Navbar (bayi variant)
    component('navbar', ['variant' => 'bayi']);
    
    // Sidebar (bayi variant)
    component('sidebar', ['variant' => 'bayi']);
    ?>
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="container-fluid px-3 px-md-4">
            <!-- Başlık -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h1 class="h3 mb-1">
                                <i class="fas fa-history text-primary me-2"></i>İşlem Geçmişi
                            </h1>
                            <p class="text-muted mb-0">Tüm bakiye hareketlerinizi görüntüleyin</p>
                        </div>
                        <div>
                            <a href="export-transactions.php" class="btn btn-outline-success">
                                <i class="fas fa-file-excel me-2"></i>Excel'e Aktar
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Filtreler -->
            <div class="filter-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0"><i class="fas fa-filter me-2"></i>Filtreler</h5>
                    <button class="btn btn-sm btn-link d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#filterForm">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                
                <div class="collapse show" id="filterForm">
                    <form method="GET" class="row g-3">
                        <div class="col-12 col-md-6 col-lg-3">
                            <label for="type" class="form-label">İşlem Türü</label>
                            <select id="type" name="type" class="form-select">
                                <option value="">Tümü</option>
                                <option value="deposit" <?php echo $filters['type'] === 'deposit' ? 'selected' : ''; ?>>Bakiye Yükleme</option>
                                <option value="withdrawal" <?php echo $filters['type'] === 'withdrawal' ? 'selected' : ''; ?>>Bakiye Çekme</option>
                                <option value="order_payment" <?php echo $filters['type'] === 'order_payment' ? 'selected' : ''; ?>>Sipariş Ödemesi</option>
                                <option value="refund" <?php echo $filters['type'] === 'refund' ? 'selected' : ''; ?>>İade</option>
                                <option value="commission" <?php echo $filters['type'] === 'commission' ? 'selected' : ''; ?>>Komisyon</option>
                                <option value="adjustment" <?php echo $filters['type'] === 'adjustment' ? 'selected' : ''; ?>>Düzeltme</option>
                            </select>
                        </div>
                        
                        <div class="col-12 col-md-6 col-lg-3">
                            <label for="status" class="form-label">Durum</label>
                            <select id="status" name="status" class="form-select">
                                <option value="">Tümü</option>
                                <option value="pending" <?php echo $filters['status'] === 'pending' ? 'selected' : ''; ?>>Bekleyen</option>
                                <option value="completed" <?php echo $filters['status'] === 'completed' ? 'selected' : ''; ?>>Tamamlandı</option>
                                <option value="cancelled" <?php echo $filters['status'] === 'cancelled' ? 'selected' : ''; ?>>İptal</option>
                                <option value="failed" <?php echo $filters['status'] === 'failed' ? 'selected' : ''; ?>>Başarısız</option>
                            </select>
                        </div>
                        
                        <div class="col-12 col-md-6 col-lg-3">
                            <label for="date_from" class="form-label">Başlangıç Tarihi</label>
                            <input type="date" id="date_from" name="date_from" class="form-control" value="<?php echo htmlspecialchars($filters['date_from']); ?>">
                        </div>
                        
                        <div class="col-12 col-md-6 col-lg-3">
                            <label for="date_to" class="form-label">Bitiş Tarihi</label>
                            <input type="date" id="date_to" name="date_to" class="form-control" value="<?php echo htmlspecialchars($filters['date_to']); ?>">
                        </div>
                        
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-search me-2"></i>Filtrele
                            </button>
                            <a href="transactions.php" class="btn btn-outline-secondary">
                                <i class="fas fa-times me-2"></i>Temizle
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- İşlemler -->
            <?php if (empty($transactions)): ?>
                <div class="card border-0 shadow-sm">
                    <div class="card-body text-center py-5">
                        <div class="mb-4">
                            <i class="fas fa-inbox fa-4x text-muted"></i>
                        </div>
                        <h4 class="mb-3">İşlem Bulunamadı</h4>
                        <p class="text-muted mb-4">Seçilen kriterlerde işlem bulunmuyor.</p>
                        <a href="deposit.php" class="btn btn-primary">
                            <i class="fas fa-plus me-2"></i>İlk Bakiye Yükleme
                        </a>
                    </div>
                </div>
            <?php else: ?>
                <!-- Desktop Tablo -->
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white border-bottom">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">İşlemler</h5>
                            <span class="badge bg-primary"><?php echo number_format($total_transactions); ?> kayıt</span>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Tarih/Saat</th>
                                    <th>İşlem Türü</th>
                                    <th>Açıklama</th>
                                    <th class="text-end">Tutar</th>
                                    <th class="text-end">Önceki</th>
                                    <th class="text-end">Sonraki</th>
                                    <th>Ödeme</th>
                                    <th>Durum</th>
                                    <th>Referans</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($transactions as $transaction): 
                                    $isPositive = in_array($transaction['transaction_type'], ['deposit', 'refund', 'commission']);
                                ?>
                                    <tr>
                                        <td>
                                            <div class="fw-medium"><?php echo formatDate($transaction['created_at'], 'd.m.Y'); ?></div>
                                            <small class="text-muted"><?php echo formatDate($transaction['created_at'], 'H:i'); ?></small>
                                        </td>
                                        <td>
                                            <span class="fw-medium">
                                                <?php echo getTransactionTypeText($transaction['transaction_type']); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <div style="max-width: 200px;">
                                                <?php echo htmlspecialchars($transaction['description'] ?? '-'); ?>
                                            </div>
                                        </td>
                                        <td class="text-end">
                                            <span class="transaction-amount <?php echo $isPositive ? 'positive' : 'negative'; ?>">
                                                <?php 
                                                $sign = $isPositive ? '+' : '-';
                                                echo $sign . formatMoney($transaction['amount']); 
                                                ?>
                                            </span>
                                        </td>
                                        <td class="text-end text-muted">
                                            <?php echo formatMoney($transaction['balance_before']); ?>
                                        </td>
                                        <td class="text-end fw-bold">
                                            <?php echo formatMoney($transaction['balance_after']); ?>
                                        </td>
                                        <td>
                                            <small class="text-muted">
                                                <?php echo getPaymentMethodText($transaction['payment_method']); ?>
                                            </small>
                                        </td>
                                        <td>
                                            <?php echo getStatusBadge($transaction['status']); ?>
                                        </td>
                                        <td>
                                            <small class="text-muted">
                                                <?php echo htmlspecialchars($transaction['reference_id'] ?? '-'); ?>
                                            </small>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Mobile Cards -->
                <?php foreach ($transactions as $transaction): 
                    $isPositive = in_array($transaction['transaction_type'], ['deposit', 'refund', 'commission']);
                ?>
                    <div class="transaction-card">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <div class="fw-medium"><?php echo getTransactionTypeText($transaction['transaction_type']); ?></div>
                                <small class="text-muted">
                                    <?php echo formatDate($transaction['created_at'], 'd.m.Y H:i'); ?>
                                </small>
                            </div>
                            <div class="text-end">
                                <div class="transaction-amount <?php echo $isPositive ? 'positive' : 'negative'; ?>">
                                    <?php 
                                    $sign = $isPositive ? '+' : '-';
                                    echo $sign . formatMoney($transaction['amount']); 
                                    ?>
                                </div>
                            </div>
                        </div>
                        
                        <?php if ($transaction['description']): ?>
                            <p class="text-muted small mb-2"><?php echo htmlspecialchars($transaction['description']); ?></p>
                        <?php endif; ?>
                        
                        <div class="d-flex justify-content-between align-items-center small">
                            <div>
                                <?php echo getStatusBadge($transaction['status']); ?>
                            </div>
                            <div class="text-muted">
                                Sonraki: <strong class="text-dark"><?php echo formatMoney($transaction['balance_after']); ?></strong>
                            </div>
                        </div>
                        
                        <?php if ($transaction['reference_id']): ?>
                            <div class="mt-2 pt-2 border-top">
                                <small class="text-muted">
                                    <i class="fas fa-hashtag me-1"></i><?php echo htmlspecialchars($transaction['reference_id']); ?>
                                </small>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
                
                <!-- Sayfalama -->
                <?php if ($total_pages > 1): ?>
                    <div class="card border-0 shadow-sm mt-3">
                        <div class="card-body">
                            <nav aria-label="İşlem sayfalama">
                                <ul class="pagination justify-content-center mb-0 flex-wrap">
                                    <?php if ($page > 1): ?>
                                        <li class="page-item">
                                            <a class="page-link" href="?page=<?php echo $page - 1; ?>" aria-label="Önceki">
                                                <i class="fas fa-chevron-left"></i>
                                            </a>
                                        </li>
                                    <?php endif; ?>
                                    
                                    <?php for ($i = max(1, $page - 2); $i <= min($total_pages, $page + 2); $i++): ?>
                                        <li class="page-item <?php echo $i === $page ? 'active' : ''; ?>">
                                            <a class="page-link" href="?page=<?php echo $i; ?>"><?php echo $i; ?></a>
                                        </li>
                                    <?php endfor; ?>
                                    
                                    <?php if ($page < $total_pages): ?>
                                        <li class="page-item">
                                            <a class="page-link" href="?page=<?php echo $page + 1; ?>" aria-label="Sonraki">
                                                <i class="fas fa-chevron-right"></i>
                                            </a>
                                        </li>
                                    <?php endif; ?>
                                </ul>
                            </nav>
                            <div class="text-center mt-3 text-muted small">
                                Sayfa <?php echo $page; ?> / <?php echo $total_pages; ?> 
                                (<?php echo number_format($total_transactions); ?> kayıt)
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </main>
    
    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader -->
    <script src="/components/js/component-loader.js"></script>
    
    <!-- Custom JS -->
    <script src="/bayi-panel/js/main.js"></script>
</body>
</html>
