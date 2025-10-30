<?php
/**
 * Bayi Onay Sistemi - Admin Panel
 * Gürbüz Oyuncak B2B Sistemi
 * Mobile Responsive - Component Based
 */

require_once 'includes/auth.php';
require_once '../backend/config/database.php';
require_once '../backend/classes/Bayi.php';
require_once '../backend/classes/EmailTemplate.php';
require_once __DIR__ . '/../components/ComponentLoader.php';

// Admin giriş kontrolü
if (!isAdminLoggedIn()) {
    header("Location: login.php");
    exit();
}

$database = new Database();
$db = $database->getConnection();
$bayi = new Bayi($db);
$emailTemplate = new EmailTemplate($db);

$message = '';
$error = '';

// Form işlemleri
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'] ?? '';
    $bayi_id = intval($_POST['bayi_id'] ?? 0);
    $admin_id = $_SESSION['admin_id'] ?? 1;
    
    switch ($action) {
        case 'approve':
            $admin_notes = trim($_POST['admin_notes'] ?? '');
            $result = $bayi->bayiOnayla($bayi_id, $admin_id, $admin_notes);
            
            if ($result['success']) {
                // E-posta gönder
                $bayi_data = $bayi->bayiGetir($bayi_id);
                if ($bayi_data) {
                    $emailTemplate->sendBayiApprovalEmail(
                        $bayi_data['email'],
                        $bayi_data['company_name'],
                        'https://gurbuzoyuncak.com/bayi-panel'
                    );
                }
                $message = $result['message'];
            } else {
                $error = $result['error'];
            }
            break;
            
        case 'reject':
            $rejection_reason = trim($_POST['rejection_reason'] ?? '');
            if (empty($rejection_reason)) {
                $error = 'Red gerekçesi zorunludur';
                break;
            }
            
            $result = $bayi->bayiReddet($bayi_id, $admin_id, $rejection_reason);
            
            if ($result['success']) {
                // E-posta gönder
                $bayi_data = $bayi->bayiGetir($bayi_id);
                if ($bayi_data) {
                    $emailTemplate->sendBayiRejectionEmail(
                        $bayi_data['email'],
                        $bayi_data['company_name'],
                        $rejection_reason
                    );
                }
                $message = $result['message'];
            } else {
                $error = $result['error'];
            }
            break;
            
        case 'suspend':
            $suspension_reason = trim($_POST['suspension_reason'] ?? '');
            if (empty($suspension_reason)) {
                $error = 'Askıya alma gerekçesi zorunludur';
                break;
            }
            
            $result = $bayi->bayiAskiyaAl($bayi_id, $admin_id, $suspension_reason);
            
            if ($result['success']) {
                // E-posta gönder
                $bayi_data = $bayi->bayiGetir($bayi_id);
                if ($bayi_data) {
                    $emailTemplate->sendBayiSuspensionEmail(
                        $bayi_data['email'],
                        $bayi_data['company_name'],
                        $suspension_reason
                    );
                }
                $message = $result['message'];
            } else {
                $error = $result['error'];
            }
            break;
    }
}

// Filtreler
$status_filter = $_GET['status'] ?? 'pending';
$page = intval($_GET['page'] ?? 1);
$limit = 20;
$offset = ($page - 1) * $limit;

// Bayileri getir
if ($status_filter == 'all') {
    $bayiler = $bayi->bayileriStatusaGoreListele('all', $limit, $offset);
} else {
    $bayiler = $bayi->bayileriStatusaGoreListele($status_filter, $limit, $offset);
}

// İstatistikleri getir
$stats = $bayi->bayiIstatistikleriGetir();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Bayi Onay Sistemi - Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    
    <!-- Component System CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="../manifest.json">
    <meta name="theme-color" content="#1E88E5">
    <link rel="apple-touch-icon" href="../assets/icons/icon-192x192.png">
    
    <style>
        /* Page-specific styles */
        .stat-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            padding: 1.5rem;
            text-align: center;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border: 1px solid #e9ecef;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        
        .stat-card .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #1E88E5;
            margin-bottom: 0.5rem;
            line-height: 1;
        }
        
        .stat-card .stat-label {
            color: #6c757d;
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-tabs {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
        }
        
        .status-tab {
            padding: 0.75rem 1.25rem;
            background: #f8f9fa;
            border: 2px solid transparent;
            border-radius: 25px;
            cursor: pointer;
            text-decoration: none;
            color: #495057;
            font-weight: 500;
            transition: all 0.3s ease;
            white-space: nowrap;
            min-height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        
        .status-tab:hover {
            background: #e9ecef;
            color: #212529;
            transform: translateY(-1px);
        }
        
        .status-tab.active {
            background: #1E88E5;
            color: white;
            border-color: #1E88E5;
        }
        
        .bayi-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 1rem;
            padding: 1.5rem;
            border: 1px solid #e9ecef;
            transition: box-shadow 0.2s ease;
        }
        
        .bayi-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        
        .bayi-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #212529;
            margin-bottom: 1rem;
        }
        
        .bayi-details {
            color: #6c757d;
            font-size: 0.875rem;
            line-height: 1.8;
        }
        
        .bayi-details strong {
            color: #495057;
            font-weight: 600;
            display: inline-block;
            min-width: 120px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
            font-size: 0.8125rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-approved {
            background: #d1e7dd;
            color: #0f5132;
        }
        
        .status-rejected {
            background: #f8d7da;
            color: #842029;
        }
        
        .status-suspended {
            background: #ffe5b4;
            color: #b45309;
        }
        
        .btn-action {
            min-height: 44px;
            padding: 0.625rem 1.25rem;
            font-weight: 500;
            border-radius: 8px;
            transition: all 0.2s ease;
            border: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .btn-action:hover {
            transform: translateY(-1px);
        }
        
        .btn-approve {
            background: #198754;
            color: white;
        }
        
        .btn-approve:hover {
            background: #157347;
            color: white;
        }
        
        .btn-reject {
            background: #dc3545;
            color: white;
        }
        
        .btn-reject:hover {
            background: #bb2d3b;
            color: white;
        }
        
        .btn-suspend {
            background: #fd7e14;
            color: white;
        }
        
        .btn-suspend:hover {
            background: #ca6510;
            color: white;
        }
        
        .btn-view {
            background: #0d6efd;
            color: white;
        }
        
        .btn-view:hover {
            background: #0b5ed7;
            color: white;
        }
        
        .alert {
            border-radius: 12px;
            border: none;
            padding: 1rem 1.25rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .alert i {
            font-size: 1.25rem;
        }
        
        .modal-content {
            border-radius: 16px;
            border: none;
        }
        
        .modal-header {
            border-bottom: 1px solid #e9ecef;
            padding: 1.5rem;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-footer {
            border-top: 1px solid #e9ecef;
            padding: 1.5rem;
        }
        
        @media (max-width: 767.98px) {
            .stat-card .stat-number {
                font-size: 1.5rem;
            }
            
            .bayi-card {
                padding: 1rem;
            }
            
            .bayi-card h3 {
                font-size: 1.125rem;
            }
            
            .bayi-details strong {
                display: block;
                min-width: auto;
                margin-bottom: 0.25rem;
            }
            
            .btn-action {
                width: 100%;
                margin-bottom: 0.5rem;
            }
        }
    </style>
</head>

<body>
    <?php 
    // Navbar component (admin variant)
    component('navbar', [
        'variant' => 'admin',
        'active_page' => 'bayi-onay'
    ]); 
    ?>
    
    <div class="admin-layout">
        <?php 
        // Sidebar component (admin variant)
        component('sidebar', [
            'variant' => 'admin',
            'active_page' => 'bayi-onay'
        ]); 
        ?>
        
        <main class="admin-main-content">
            <div class="container-fluid py-4">
                <!-- Page Header -->
                <div class="row mb-4">
                    <div class="col-12">
                        <h1 class="h2 mb-2">
                            <i class="fas fa-user-check text-primary me-2"></i>
                            Bayi Onay Sistemi
                        </h1>
                        <p class="text-muted mb-0">Bayi başvurularını yönetin ve onaylayın</p>
                    </div>
                </div>
                
                <!-- Alerts -->
                <?php if ($message): ?>
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <i class="fas fa-check-circle"></i>
                        <span><?php echo htmlspecialchars($message); ?></span>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php endif; ?>
                
                <?php if ($error): ?>
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span><?php echo htmlspecialchars($error); ?></span>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php endif; ?>
                
                <!-- İstatistikler -->
                <div class="row g-3 g-md-4 mb-4">
                    <div class="col-6 col-md-4 col-lg">
                        <div class="stat-card">
                            <div class="stat-number"><?php echo $stats['toplam_bayi']; ?></div>
                            <div class="stat-label">Toplam Bayi</div>
                        </div>
                    </div>
                    <div class="col-6 col-md-4 col-lg">
                        <div class="stat-card">
                            <div class="stat-number"><?php echo $stats['bekleyen']; ?></div>
                            <div class="stat-label">Bekleyen</div>
                        </div>
                    </div>
                    <div class="col-6 col-md-4 col-lg">
                        <div class="stat-card">
                            <div class="stat-number"><?php echo $stats['onaylanan']; ?></div>
                            <div class="stat-label">Onaylanmış</div>
                        </div>
                    </div>
                    <div class="col-6 col-md-4 col-lg">
                        <div class="stat-card">
                            <div class="stat-number"><?php echo $stats['reddedilen']; ?></div>
                            <div class="stat-label">Reddedilen</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4 col-lg">
                        <div class="stat-card">
                            <div class="stat-number"><?php echo $stats['askidaki']; ?></div>
                            <div class="stat-label">Askıdaki</div>
                        </div>
                    </div>
                </div>
                
                <!-- Status Filtreleri -->
                <div class="status-tabs mb-4">
                    <a href="?status=pending" class="status-tab <?php echo $status_filter == 'pending' ? 'active' : ''; ?>">
                        <i class="fas fa-clock me-1"></i> Bekleyen (<?php echo $stats['bekleyen']; ?>)
                    </a>
                    <a href="?status=approved" class="status-tab <?php echo $status_filter == 'approved' ? 'active' : ''; ?>">
                        <i class="fas fa-check me-1"></i> Onaylanmış (<?php echo $stats['onaylanan']; ?>)
                    </a>
                    <a href="?status=rejected" class="status-tab <?php echo $status_filter == 'rejected' ? 'active' : ''; ?>">
                        <i class="fas fa-times me-1"></i> Reddedilen (<?php echo $stats['reddedilen']; ?>)
                    </a>
                    <a href="?status=suspended" class="status-tab <?php echo $status_filter == 'suspended' ? 'active' : ''; ?>">
                        <i class="fas fa-pause me-1"></i> Askıdaki (<?php echo $stats['askidaki']; ?>)
                    </a>
                    <a href="?status=all" class="status-tab <?php echo $status_filter == 'all' ? 'active' : ''; ?>">
                        <i class="fas fa-list me-1"></i> Tümü (<?php echo $stats['toplam_bayi']; ?>)
                    </a>
                </div>
                
                <!-- Bayi Listesi -->
                <div class="row">
                    <div class="col-12">
                        <?php if (empty($bayiler)): ?>
                            <div class="bayi-card text-center py-5">
                                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted mb-0">Bu kategoride bayi bulunamadı.</p>
                            </div>
                        <?php else: ?>
                            <?php foreach ($bayiler as $b): ?>
                                <div class="bayi-card">
                                    <div class="row g-3">
                                        <div class="col-12 col-lg-8">
                                            <h3><?php echo htmlspecialchars($b['company_name']); ?></h3>
                                            <div class="bayi-details mb-3">
                                                <div class="mb-1">
                                                    <strong>İletişim:</strong> <?php echo htmlspecialchars($b['contact_person']); ?>
                                                </div>
                                                <div class="mb-1">
                                                    <strong>E-posta:</strong> <?php echo htmlspecialchars($b['email']); ?>
                                                </div>
                                                <div class="mb-1">
                                                    <strong>Telefon:</strong> <?php echo htmlspecialchars($b['phone']); ?>
                                                </div>
                                                <div class="mb-1">
                                                    <strong>Şehir:</strong> <?php echo htmlspecialchars($b['city']); ?>
                                                </div>
                                                <div class="mb-1">
                                                    <strong>Başvuru Tarihi:</strong> <?php echo date('d.m.Y H:i', strtotime($b['created_at'])); ?>
                                                </div>
                                                <?php if ($b['admin_notes']): ?>
                                                    <div class="mt-2">
                                                        <strong>Admin Notları:</strong><br>
                                                        <span class="text-info"><?php echo nl2br(htmlspecialchars($b['admin_notes'])); ?></span>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                            <span class="status-badge status-<?php echo $b['status']; ?>">
                                                <?php
                                                switch ($b['status']) {
                                                    case 'pending': echo 'Bekliyor'; break;
                                                    case 'approved': echo 'Onaylandı'; break;
                                                    case 'rejected': echo 'Reddedildi'; break;
                                                    case 'suspended': echo 'Askıda'; break;
                                                    default: echo $b['status'];
                                                }
                                                ?>
                                            </span>
                                        </div>
                                        
                                        <div class="col-12 col-lg-4">
                                            <div class="d-flex flex-column gap-2">
                                                <?php if ($b['status'] == 'pending'): ?>
                                                    <button class="btn btn-action btn-approve" 
                                                            onclick="showApprovalModal(<?php echo $b['id']; ?>, '<?php echo htmlspecialchars($b['company_name']); ?>')">
                                                        <i class="fas fa-check"></i> Onayla
                                                    </button>
                                                    <button class="btn btn-action btn-reject" 
                                                            onclick="showRejectionModal(<?php echo $b['id']; ?>, '<?php echo htmlspecialchars($b['company_name']); ?>')">
                                                        <i class="fas fa-times"></i> Reddet
                                                    </button>
                                                <?php elseif ($b['status'] == 'approved'): ?>
                                                    <button class="btn btn-action btn-suspend" 
                                                            onclick="showSuspensionModal(<?php echo $b['id']; ?>, '<?php echo htmlspecialchars($b['company_name']); ?>')">
                                                        <i class="fas fa-pause"></i> Askıya Al
                                                    </button>
                                                <?php endif; ?>
                                                <a href="bayi-detay.php?id=<?php echo $b['id']; ?>" class="btn btn-action btn-view">
                                                    <i class="fas fa-eye"></i> Detay Görüntüle
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Onay Modalı -->
    <div class="modal fade" id="approvalModal" tabindex="-1" aria-labelledby="approvalModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="approvalModalLabel">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Bayi Onaylama
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Kapat"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <input type="hidden" name="action" value="approve">
                        <input type="hidden" name="bayi_id" id="approve_bayi_id">
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Firma:</label>
                            <p id="approve_company_name" class="text-primary fs-5 mb-0"></p>
                        </div>
                        
                        <div class="mb-3">
                            <label for="admin_notes" class="form-label">Onay Notları (İsteğe bağlı):</label>
                            <textarea name="admin_notes" id="admin_notes" class="form-control" rows="4" 
                                      placeholder="Onay ile ilgili notlarınızı buraya yazabilirsiniz..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i> İptal
                        </button>
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-check me-1"></i> Onayla ve E-posta Gönder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Red Modalı -->
    <div class="modal fade" id="rejectionModal" tabindex="-1" aria-labelledby="rejectionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="rejectionModalLabel">
                        <i class="fas fa-times-circle text-danger me-2"></i>
                        Bayi Reddetme
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Kapat"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <input type="hidden" name="action" value="reject">
                        <input type="hidden" name="bayi_id" id="reject_bayi_id">
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Firma:</label>
                            <p id="reject_company_name" class="text-danger fs-5 mb-0"></p>
                        </div>
                        
                        <div class="mb-3">
                            <label for="rejection_reason" class="form-label">Red Gerekçesi (Zorunlu):</label>
                            <textarea name="rejection_reason" id="rejection_reason" class="form-control" rows="4" required
                                      placeholder="Neden reddedildiğini açıklayın..."></textarea>
                            <div class="form-text">Bayi, e-posta ile bu gerekçeyi görecektir.</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i> İptal
                        </button>
                        <button type="submit" class="btn btn-danger">
                            <i class="fas fa-times me-1"></i> Reddet ve E-posta Gönder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Askıya Alma Modalı -->
    <div class="modal fade" id="suspensionModal" tabindex="-1" aria-labelledby="suspensionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="suspensionModalLabel">
                        <i class="fas fa-pause-circle text-warning me-2"></i>
                        Bayi Askıya Alma
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Kapat"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <input type="hidden" name="action" value="suspend">
                        <input type="hidden" name="bayi_id" id="suspend_bayi_id">
                        
                        <div class="mb-3">
                            <label class="form-label fw-bold">Firma:</label>
                            <p id="suspend_company_name" class="text-warning fs-5 mb-0"></p>
                        </div>
                        
                        <div class="mb-3">
                            <label for="suspension_reason" class="form-label">Askıya Alma Gerekçesi (Zorunlu):</label>
                            <textarea name="suspension_reason" id="suspension_reason" class="form-control" rows="4" required
                                      placeholder="Askıya alma gerekçesini açıklayın..."></textarea>
                            <div class="form-text">Bayi, e-posta ile bu gerekçeyi görecektir.</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i> İptal
                        </button>
                        <button type="submit" class="btn btn-warning">
                            <i class="fas fa-pause me-1"></i> Askıya Al ve E-posta Gönder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <?php 
    // Footer component
    component('footer');
    
    // Mobile menu component (admin variant)
    component('mobile-menu', [
        'variant' => 'admin',
        'active_page' => 'bayi-onay'
    ]);
    ?>
    
    <!-- Bootstrap 5 Bundle (includes Popper) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader -->
    <script src="../components/js/component-loader.js"></script>
    
    <!-- PWA Service Worker -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('../service-worker.js')
                    .catch(() => console.log('Service Worker registration skipped'));
            });
        }
    </script>
    
    <!-- Page Scripts -->
    <script>
        function showApprovalModal(bayiId, companyName) {
            document.getElementById('approve_bayi_id').value = bayiId;
            document.getElementById('approve_company_name').textContent = companyName;
            const modal = new bootstrap.Modal(document.getElementById('approvalModal'));
            modal.show();
        }
        
        function showRejectionModal(bayiId, companyName) {
            document.getElementById('reject_bayi_id').value = bayiId;
            document.getElementById('reject_company_name').textContent = companyName;
            const modal = new bootstrap.Modal(document.getElementById('rejectionModal'));
            modal.show();
        }
        
        function showSuspensionModal(bayiId, companyName) {
            document.getElementById('suspend_bayi_id').value = bayiId;
            document.getElementById('suspend_company_name').textContent = companyName;
            const modal = new bootstrap.Modal(document.getElementById('suspensionModal'));
            modal.show();
        }
    </script>
</body>
</html>
