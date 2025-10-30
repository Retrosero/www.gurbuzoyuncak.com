<?php
/**
 * Bayi Dashboard - Ana Sayfa
 * Gürbüz Oyuncak E-Ticaret Sistemi
 * Mobile Responsive & Component Sistemi ile Modernize Edildi
 */

session_start();
require_once 'includes/auth.php';
require_once '../components/ComponentLoader.php';

// Giriş kontrolü
checkBayiLogin();

// Bayi bilgilerini güncelle
$bayi_data = getCurrentBayi();
if (!$bayi_data) {
    bayiLogout();
    header('Location: login.php');
    exit;
}

// Güncel bakiye bilgisini session'a kaydet
updateSessionBalance();

require_once '../backend/config/database.php';
require_once '../backend/classes/Bayi.php';

$database = new Database();
$db = $database->getConnection();

$bayi = new Bayi($db);
$bayi->bayi_id = $_SESSION['bayi_id'];

// Son işlemleri getir
$son_islemler = $bayi->islemGecmisiGetir(10, 0);

// İstatistikler
$stats = [
    'balance' => $bayi_data['balance'],
    'credit_limit' => $bayi_data['credit_limit'],
    'total_orders' => $bayi_data['total_orders'] ?? 0,
    'total_amount' => $bayi_data['total_amount'] ?? 0,
    'discount_rate' => $bayi_data['discount_rate'] ?? 0
];

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
    <title>Bayi Dashboard - Gürbüz Oyuncak B2B</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- Custom Styles -->
    <style>
        .dashboard-header {
            background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
            color: white;
            padding: 1.5rem 0;
            margin-bottom: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(30, 136, 229, 0.3);
        }
        
        .dashboard-header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border: 1px solid #e9ecef;
            transition: all 0.3s;
        }
        
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        
        .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1E88E5;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #6c757d;
            font-weight: 500;
        }
        
        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .card-modern {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border: 1px solid #e9ecef;
            margin-bottom: 1.5rem;
        }
        
        .card-header-modern {
            padding: 1.25rem 1.5rem;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            border-radius: 12px 12px 0 0;
        }
        
        .card-header-modern h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2c3e50;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .card-body-modern {
            padding: 1.5rem;
        }
        
        .quick-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            min-height: 60px;
            font-size: 1rem;
            font-weight: 500;
            border-radius: 10px;
            transition: all 0.2s;
            text-decoration: none;
            border: none;
        }
        
        .quick-action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .quick-action-btn i {
            font-size: 1.5rem;
        }
        
        .btn-primary-custom {
            background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
            color: white;
        }
        
        .btn-secondary-custom {
            background: #f8f9fa;
            color: #495057;
            border: 1px solid #dee2e6;
        }
        
        .btn-secondary-custom:hover {
            background: #e9ecef;
            color: #495057;
        }
        
        .transactions-table {
            width: 100%;
        }
        
        .transactions-table thead {
            background: #f8f9fa;
        }
        
        .transactions-table th {
            padding: 0.875rem 1rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }
        
        .transactions-table td {
            padding: 0.875rem 1rem;
            font-size: 0.9rem;
            vertical-align: middle;
            border-bottom: 1px solid #e9ecef;
        }
        
        .transactions-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        .badge-status {
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
            font-size: 0.8125rem;
            font-weight: 500;
            display: inline-block;
        }
        
        .badge-success {
            background: #d4edda;
            color: #155724;
        }
        
        .badge-warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .badge-danger {
            background: #f8d7da;
            color: #721c24;
        }
        
        .info-box {
            padding: 1.25rem;
            border-radius: 10px;
            margin-bottom: 1rem;
        }
        
        .info-box h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.625rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .info-box p {
            margin: 0;
            color: #495057;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .info-box-blue {
            background: #e3f2fd;
            border-left: 4px solid #1E88E5;
        }
        
        .info-box-blue h4 {
            color: #1565C0;
        }
        
        .info-box-green {
            background: #e8f5e9;
            border-left: 4px solid #4CAF50;
        }
        
        .info-box-green h4 {
            color: #2e7d32;
        }
        
        .info-box-orange {
            background: #fff3e0;
            border-left: 4px solid #FF9800;
        }
        
        .info-box-orange h4 {
            color: #ef6c00;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #6c757d;
        }
        
        .empty-state i {
            font-size: 3rem;
            opacity: 0.3;
            margin-bottom: 1rem;
        }
        
        /* Mobile Optimizations */
        @media (max-width: 768px) {
            .dashboard-header h1 {
                font-size: 1.25rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 0.75rem;
            }
            
            .stat-card {
                padding: 1rem;
            }
            
            .stat-value {
                font-size: 1.5rem;
            }
            
            .stat-label {
                font-size: 0.8rem;
            }
            
            .quick-action-btn {
                padding: 0.875rem 1rem;
                min-height: 52px;
                font-size: 0.9rem;
            }
            
            .quick-action-btn i {
                font-size: 1.25rem;
            }
            
            .transactions-table {
                font-size: 0.85rem;
            }
            
            .transactions-table th,
            .transactions-table td {
                padding: 0.625rem 0.75rem;
            }
            
            /* Hide less important columns on mobile */
            .hide-mobile {
                display: none;
            }
            
            .card-body-modern {
                padding: 1rem;
            }
            
            .info-box {
                padding: 1rem;
            }
        }
        
        @media (max-width: 576px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>
    <!-- Sidebar -->
    <?php $loader->loadComponent('sidebar', ['type' => 'bayi', 'active' => 'dashboard']); ?>
    
    <!-- Main Content -->
    <div class="main-content">
        <!-- Mobile Header -->
        <div class="mobile-header d-md-none">
            <button class="mobile-menu-toggle" id="mobileMenuToggle">
                <i class="fas fa-bars"></i>
            </button>
            <div class="mobile-header-title">Dashboard</div>
            <div class="mobile-header-actions">
                <span class="badge bg-primary"><?php echo formatMoney($stats['balance']); ?></span>
            </div>
        </div>
        
        <div class="container-fluid p-3 p-md-4">
            <!-- Dashboard Header -->
            <div class="dashboard-header">
                <div class="px-3 px-md-4">
                    <h1>
                        <i class="fas fa-chart-line me-2"></i>
                        Hoş Geldiniz, <?php echo htmlspecialchars($bayi_data['contact_person']); ?>!
                    </h1>
                    <p class="mb-0 opacity-90 d-none d-md-block">Bayi paneline hoş geldiniz. İşlemlerinizi buradan takip edebilirsiniz.</p>
                </div>
            </div>
            
            <!-- İstatistik Kartları -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e3f2fd; color: #1E88E5;">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div class="stat-value"><?php echo formatMoney($stats['balance']); ?></div>
                    <div class="stat-label">Mevcut Bakiye</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #f3e5f5; color: #9C27B0;">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="stat-value"><?php echo formatMoney($stats['credit_limit']); ?></div>
                    <div class="stat-label">Kredi Limiti</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e8f5e9; color: #4CAF50;">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <div class="stat-value"><?php echo number_format($stats['total_orders']); ?></div>
                    <div class="stat-label">Toplam Sipariş</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fff3e0; color: #FF9800;">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="stat-value"><?php echo formatMoney($stats['total_amount']); ?></div>
                    <div class="stat-label">Toplam Alışveriş</div>
                </div>
            </div>
            
            <div class="row">
                <!-- Hızlı İşlemler -->
                <div class="col-12 col-lg-6">
                    <div class="card-modern">
                        <div class="card-header-modern">
                            <h3><i class="fas fa-bolt"></i> Hızlı İşlemler</h3>
                        </div>
                        <div class="card-body-modern">
                            <div class="d-grid gap-3">
                                <a href="deposit.php" class="quick-action-btn btn-primary-custom">
                                    <i class="fas fa-credit-card"></i>
                                    <span>Bakiye Yükle</span>
                                </a>
                                <a href="products.php" class="quick-action-btn btn-secondary-custom">
                                    <i class="fas fa-shopping-cart"></i>
                                    <span>Sipariş Ver</span>
                                </a>
                                <a href="transactions.php" class="quick-action-btn btn-secondary-custom">
                                    <i class="fas fa-history"></i>
                                    <span>İşlem Geçmişi</span>
                                </a>
                                <a href="profile.php" class="quick-action-btn btn-secondary-custom">
                                    <i class="fas fa-user-cog"></i>
                                    <span>Profil Ayarları</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Son İşlemler -->
                <div class="col-12 col-lg-6">
                    <div class="card-modern">
                        <div class="card-header-modern">
                            <h3><i class="fas fa-clock"></i> Son İşlemler</h3>
                        </div>
                        <?php if (empty($son_islemler)): ?>
                            <div class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p class="mb-0">Henüz işlem yapılmamış</p>
                            </div>
                        <?php else: ?>
                            <div class="table-responsive">
                                <table class="transactions-table">
                                    <thead>
                                        <tr>
                                            <th class="hide-mobile">Tarih</th>
                                            <th>İşlem</th>
                                            <th>Tutar</th>
                                            <th class="hide-mobile">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach (array_slice($son_islemler, 0, 5) as $islem): ?>
                                            <tr>
                                                <td class="hide-mobile">
                                                    <small><?php echo formatDate($islem['created_at']); ?></small>
                                                </td>
                                                <td>
                                                    <strong><?php echo getTransactionTypeText($islem['transaction_type']); ?></strong>
                                                    <?php if ($islem['description']): ?>
                                                        <br><small class="text-muted d-none d-md-inline"><?php echo htmlspecialchars($islem['description']); ?></small>
                                                    <?php endif; ?>
                                                </td>
                                                <td>
                                                    <strong style="color: <?php echo $islem['transaction_type'] === 'deposit' ? '#4CAF50' : '#F44336'; ?>">
                                                        <?php echo ($islem['transaction_type'] === 'deposit' ? '+' : '-') . formatMoney($islem['amount']); ?>
                                                    </strong>
                                                </td>
                                                <td class="hide-mobile">
                                                    <?php echo getStatusBadge($islem['status']); ?>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                            <div class="text-center p-3 border-top">
                                <a href="transactions.php" class="btn btn-outline-primary">
                                    <i class="fas fa-list me-2"></i> Tümünü Görüntüle
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <!-- Bilgilendirme -->
            <div class="row">
                <div class="col-12">
                    <div class="card-modern">
                        <div class="card-header-modern">
                            <h3><i class="fas fa-info-circle"></i> Önemli Bilgiler</h3>
                        </div>
                        <div class="card-body-modern">
                            <div class="info-box info-box-blue">
                                <h4><i class="fas fa-wallet"></i> Bakiye Yükleme</h4>
                                <p>
                                    Bakiye yüklemek için "Bakiye Yükle" butonunu kullanabilir, kredi kartı ile güvenli ödeme yapabilirsiniz.
                                    Yüklenen bakiye anında hesabınıza geçer.
                                </p>
                            </div>
                            
                            <div class="info-box info-box-green">
                                <h4><i class="fas fa-percentage"></i> İndirim Oranınız</h4>
                                <p>
                                    Mevcut indirim oranınız: <strong>%<?php echo number_format($stats['discount_rate'], 2); ?></strong>
                                    Daha fazla indirim için satış temsilcinizle iletişime geçin.
                                </p>
                            </div>
                            
                            <div class="info-box info-box-orange">
                                <h4><i class="fas fa-headset"></i> Destek</h4>
                                <p>
                                    Sorularınız için: <strong>0242 XXX XX XX</strong> numaralı telefonu arayabilir 
                                    veya <strong>info@gurbuzoyuncak.com</strong> adresine e-posta gönderebilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap Bundle JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader JS -->
    <script src="../components/js/component-loader.js"></script>
    
    <!-- Custom Scripts -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Mobile menu toggle
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            if (mobileMenuToggle) {
                mobileMenuToggle.addEventListener('click', function() {
                    document.body.classList.toggle('sidebar-open');
                });
            }
            
            // 30 saniyede bir bakiye güncellemesi kontrol et
            setInterval(function() {
                fetch('ajax/get-balance.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Bakiye görüntülemelerini güncelle
                            const balanceElements = document.querySelectorAll('.stat-value');
                            balanceElements.forEach((element, index) => {
                                if (index === 0) { // İlk stat-value mevcut bakiye
                                    element.textContent = data.balance;
                                }
                            });
                            
                            // Mobile header badge güncelle
                            const mobileBadge = document.querySelector('.mobile-header-actions .badge');
                            if (mobileBadge) {
                                mobileBadge.textContent = data.balance;
                            }
                        }
                    })
                    .catch(error => console.log('Bakiye güncelleme hatası:', error));
            }, 30000);
        });
    </script>
</body>
</html>
