<?php
session_start();
require_once 'includes/auth.php';

// Giriş kontrolü
checkBayiLogin();

$error = '';
$success = '';

// Test modunu kontrol et
$test_mode = true; // Production'da false yapılmalı

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once '../backend/config/database.php';
    require_once '../backend/classes/Bayi.php';
    require_once '../backend/classes/PayTRBayi.php';
    
    $amount = floatval($_POST['amount'] ?? 0);
    $payment_method = $_POST['payment_method'] ?? 'paytr';
    
    if (!verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $error = 'Güvenlik hatası. Lütfen sayfayı yenileyin.';
    } elseif ($amount < 10) {
        $error = 'Minimum 10 TL yükleme yapabilirsiniz.';
    } elseif ($amount > 50000) {
        $error = 'Maksimum 50.000 TL yükleme yapabilirsiniz.';
    } else {
        $database = new Database();
        $db = $database->getConnection();
        
        // Bayi bilgilerini al
        $bayi = new Bayi($db);
        $bayi->bayi_id = $_SESSION['bayi_id'];
        $bayi_data = $bayi->bilgileriGetir();
        
        if ($payment_method === 'test' && $test_mode) {
            // Test modu - direkt bakiye yükle
            $paytr = new PayTRBayi($db);
            $result = $paytr->createTestPayment($_SESSION['bayi_id'], $amount);
            
            if ($result['success']) {
                updateSessionBalance();
                $success = 'Test ödemesi başarıyla tamamlandı! Yeni bakiyeniz: ' . formatMoney($result['new_balance']);
            } else {
                $error = $result['error'] ?? 'Test ödemesi başarısız';
            }
        } elseif ($payment_method === 'paytr') {
            // PayTR ile ödeme
            $paytr = new PayTRBayi($db);
            $result = $paytr->createBalancePaymentForm($bayi_data, $amount, $test_mode ? 1 : 0);
            
            if ($result['success']) {
                // PayTR ödeme sayfasına yönlendir
                header('Location: payment-process.php?token=' . $result['token'] . '&oid=' . $result['merchant_oid']);
                exit;
            } else {
                $error = $result['error'] ?? 'Ödeme oluşturulamadı';
            }
        }
    }
}

$csrf_token = generateCSRFToken();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="theme-color" content="#1E88E5">
    
    <title>Bakiye Yükle | Bayi Panel - Gürbüz Oyuncak</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
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
        
        .payment-form { max-width: 100%; }
        .amount-option { cursor: pointer; transition: all 0.3s; }
        .amount-option:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .payment-method-card { cursor: pointer; transition: all 0.3s; }
        .payment-method-card:hover { border-color: #1E88E5 !important; }
        .payment-method-card input[type="radio"]:checked + div { border-color: #1E88E5 !important; background-color: #E3F2FD; }
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
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="h3 mb-1">Bakiye Yükle</h1>
                    <p class="text-muted">Hesabınıza bakiye yükleyerek hızlıca alışveriş yapabilirsiniz</p>
                </div>
            </div>
            
            <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                    </svg>
                    <?php echo htmlspecialchars($error); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                    <?php echo htmlspecialchars($success); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <div class="text-center my-4">
                    <a href="index.php" class="btn btn-primary btn-lg">Dashboard'a Dön</a>
                </div>
            <?php else: ?>
            
            <div class="row g-4">
                <!-- Sol Kolon - Form -->
                <div class="col-12 col-lg-8">
                    <!-- Mevcut Bakiye Kartı -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Mevcut Durum</h5>
                            <div class="row g-3">
                                <div class="col-6">
                                    <div class="text-center p-3 bg-light rounded">
                                        <div class="h4 mb-1 text-primary fw-bold"><?php echo formatMoney($_SESSION['bayi_balance']); ?></div>
                                        <div class="small text-muted">Mevcut Bakiye</div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center p-3 bg-light rounded">
                                        <div class="h4 mb-1 text-success fw-bold"><?php echo formatMoney(getCurrentBayi()['credit_limit'] ?? 0); ?></div>
                                        <div class="small text-muted">Kredi Limiti</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bakiye Yükleme Formu -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title mb-4">Bakiye Yükleme</h5>
                            
                            <form method="POST" data-validate class="payment-form">
                                <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
                                
                                <!-- Tutar Girişi -->
                                <div class="mb-4">
                                    <label for="amount" class="form-label fw-semibold">Yüklenecek Miktar (TL)</label>
                                    <div class="input-group input-group-lg">
                                        <span class="input-group-text">₺</span>
                                        <input 
                                            type="number" 
                                            id="amount" 
                                            name="amount" 
                                            class="form-control" 
                                            min="10" 
                                            max="50000" 
                                            step="0.01"
                                            required
                                            placeholder="0,00">
                                    </div>
                                    <div class="form-text">Minimum: 10 TL, Maksimum: 50.000 TL</div>
                                </div>
                                
                                <!-- Hızlı Tutar Seçimi -->
                                <div class="mb-4">
                                    <label class="form-label fw-semibold">Hızlı Seçim</label>
                                    <div class="row g-2">
                                        <div class="col-4 col-sm-2">
                                            <button type="button" class="btn btn-outline-primary w-100 amount-option" onclick="setAmount(100)">100 TL</button>
                                        </div>
                                        <div class="col-4 col-sm-2">
                                            <button type="button" class="btn btn-outline-primary w-100 amount-option" onclick="setAmount(250)">250 TL</button>
                                        </div>
                                        <div class="col-4 col-sm-2">
                                            <button type="button" class="btn btn-outline-primary w-100 amount-option" onclick="setAmount(500)">500 TL</button>
                                        </div>
                                        <div class="col-4 col-sm-2">
                                            <button type="button" class="btn btn-outline-primary w-100 amount-option" onclick="setAmount(1000)">1.000 TL</button>
                                        </div>
                                        <div class="col-4 col-sm-2">
                                            <button type="button" class="btn btn-outline-primary w-100 amount-option" onclick="setAmount(2500)">2.500 TL</button>
                                        </div>
                                        <div class="col-4 col-sm-2">
                                            <button type="button" class="btn btn-outline-primary w-100 amount-option" onclick="setAmount(5000)">5.000 TL</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Ödeme Yöntemi -->
                                <div class="mb-4">
                                    <label class="form-label fw-semibold">Ödeme Yöntemi</label>
                                    
                                    <?php if ($test_mode): ?>
                                    <div class="payment-method-card mb-3">
                                        <label class="d-block">
                                            <input type="radio" name="payment_method" value="test" checked class="d-none">
                                            <div class="card border-2 p-3">
                                                <div class="d-flex align-items-center">
                                                    <div class="me-3 display-6">🧪</div>
                                                    <div class="flex-grow-1">
                                                        <div class="fw-bold">Test Ödemesi</div>
                                                        <small class="text-muted">Geliştirme amaçlı - Direkt bakiye yüklenir</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    <?php endif; ?>
                                    
                                    <div class="payment-method-card">
                                        <label class="d-block">
                                            <input type="radio" name="payment_method" value="paytr" <?php echo !$test_mode ? 'checked' : ''; ?> class="d-none">
                                            <div class="card border-2 p-3">
                                                <div class="d-flex align-items-center">
                                                    <div class="me-3 display-6">💳</div>
                                                    <div class="flex-grow-1">
                                                        <div class="fw-bold">Kredi Kartı (PayTR)</div>
                                                        <small class="text-muted">Visa, MasterCard, Amex - Güvenli ödeme</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- Submit Button -->
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary btn-lg" id="submitBtn">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                                            <path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5V3zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a1.99 1.99 0 0 1-1-.268zM1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1z"/>
                                        </svg>
                                        Ödemeye Geç
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <!-- Sağ Kolon - Bilgi Panelleri -->
                <div class="col-12 col-lg-4">
                    <!-- Güvenlik Bilgileri -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                                    <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
                                    <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                                </svg>
                                Güvenli Ödeme
                            </h5>
                            <p class="small mb-0">Tüm ödemeler SSL şifreleme ile korunmaktadır. Kart bilgileriniz kayıt edilmez ve üçüncü şahıslarla paylaşılmaz.</p>
                        </div>
                    </div>
                    
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
                                </svg>
                                Anında Aktarım
                            </h5>
                            <p class="small mb-0">Başarılı ödemeler anında hesabınıza yansır. SMS ve E-posta ile bilgilendirme yapılır.</p>
                        </div>
                    </div>
                    
                    <!-- Destek -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16" class="me-2">
                                    <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z"/>
                                </svg>
                                Destek
                            </h5>
                            <p class="small">Sorun yaşarsanız:</p>
                            <p class="small mb-1">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="me-1">
                                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"/>
                                </svg>
                                0242 123 45 67
                            </p>
                            <p class="small mb-0">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="me-1">
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                                </svg>
                                info@gurbuzoyuncak.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <?php endif; ?>
        </div>
    </main>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader -->
    <script src="/components/js/component-loader.js"></script>
    
    <!-- Custom JS -->
    <script src="/bayi-panel/js/main.js"></script>
    
    <script>
        function setAmount(amount) {
            document.getElementById('amount').value = amount.toFixed(2);
        }
        
        // Form gönderilirken loading göster
        document.querySelector('form').addEventListener('submit', function() {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> İşleniyor...';
            submitBtn.disabled = true;
        });
        
        // Payment method selection visual feedback
        document.querySelectorAll('.payment-method-card input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.querySelectorAll('.payment-method-card .card').forEach(card => {
                    card.classList.remove('border-primary', 'bg-primary', 'bg-opacity-10');
                });
                if (this.checked) {
                    this.nextElementSibling.classList.add('border-primary', 'bg-primary', 'bg-opacity-10');
                }
            });
            
            // Initial state
            if (radio.checked) {
                radio.nextElementSibling.classList.add('border-primary', 'bg-primary', 'bg-opacity-10');
            }
        });
    </script>
</body>
</html>
