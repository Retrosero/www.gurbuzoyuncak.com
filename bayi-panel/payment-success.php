<?php
/**
 * PayTR Ödeme Başarı Sayfası
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

session_start();
require_once 'includes/auth.php';
require_once '../backend/config/database.php';
require_once '../backend/classes/PayTRBayi.php';

// Giriş kontrolü
checkBayiLogin();

$message = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // PayTR callback verilerini al
    $database = new Database();
    $db = $database->getConnection();
    
    $paytr = new PayTRBayi($db);
    $result = $paytr->verifyCallback($_POST);
    
    if ($result['success']) {
        $success = true;
        $message = 'Ödemeniz başarıyla tamamlandı! Bakiyeniz güncellendi.';
        updateSessionBalance();
    } else {
        $message = $result['error'] ?? 'Ödeme doğrulaması başarısız';
    }
} elseif (isset($_GET['merchant_oid'])) {
    // URL'den gelen başarı durumu
    $success = true;
    $message = 'Ödeme işleminiz başarıyla tamamlandı! Bakiyeniz güncelleniyor.';
    updateSessionBalance();
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>Ödeme <?php echo $success ? 'Başarılı' : 'Başarısız'; ?> | Bayi Panel - Gürbüz Oyuncak</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .result-container {
            max-width: 600px;
            width: 100%;
            animation: fadeInUp 0.5s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .result-card {
            background: white;
            border-radius: 20px;
            padding: 3rem 2rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        
        .icon-success {
            width: 100px;
            height: 100px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
            animation: scaleIn 0.5s ease-out 0.2s both;
        }
        
        .icon-error {
            width: 100px;
            height: 100px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
            animation: scaleIn 0.5s ease-out 0.2s both;
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }
        
        .result-title {
            color: #2c3e50;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .result-message {
            background: #f8f9fa;
            border-left: 4px solid;
            border-radius: 10px;
            padding: 1.25rem;
            margin: 1.5rem 0;
            text-align: left;
        }
        
        .result-message.success {
            border-color: #4caf50;
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .result-message.error {
            border-color: #f44336;
            background: #ffebee;
            color: #c62828;
        }
        
        .info-box {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1.25rem;
            margin: 1.5rem 0;
            text-align: left;
        }
        
        .countdown {
            font-size: 0.875rem;
            color: #7f8c8d;
            margin-top: 1rem;
        }
        
        @media (max-width: 576px) {
            .result-card {
                padding: 2rem 1.5rem;
            }
            
            .result-title {
                font-size: 1.5rem;
            }
            
            .icon-success, .icon-error {
                width: 80px;
                height: 80px;
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="result-container">
        <div class="result-card">
            <?php if ($success): ?>
                <div class="icon-success">
                    <i class="fas fa-check"></i>
                </div>
                <h1 class="result-title" style="color: #4caf50;">Ödeme Başarılı!</h1>
                <div class="result-message success">
                    <i class="fas fa-check-circle me-2"></i>
                    <?php echo htmlspecialchars($message); ?>
                </div>
                
                <div class="info-box">
                    <h5 class="mb-3"><i class="fas fa-info-circle me-2"></i>İşlem Detayları</h5>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Yeni Bakiyeniz:</span>
                        <strong class="text-success fs-5"><?php echo formatMoney($_SESSION['bayi_balance']); ?></strong>
                    </div>
                    <p class="text-muted small mb-0 mt-3">
                        <i class="fas fa-receipt me-1"></i>
                        İşlem detaylarını işlem geçmişi sayfasından görüntüleyebilirsiniz.
                    </p>
                </div>
                
                <div class="d-grid gap-2 mt-4">
                    <a href="index.php" class="btn btn-success btn-lg">
                        <i class="fas fa-home me-2"></i>Dashboard'a Dön
                    </a>
                    <a href="transactions.php" class="btn btn-outline-secondary">
                        <i class="fas fa-history me-2"></i>İşlem Geçmişi
                    </a>
                </div>
                
                <div class="countdown" id="countdown">
                    <i class="fas fa-clock me-1"></i>
                    <span id="seconds">5</span> saniye sonra otomatik olarak dashboard'a yönlendirileceksiniz...
                </div>
            <?php else: ?>
                <div class="icon-error">
                    <i class="fas fa-times"></i>
                </div>
                <h1 class="result-title" style="color: #f44336;">Ödeme Başarısız</h1>
                <div class="result-message error">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <?php echo htmlspecialchars($message); ?>
                </div>
                
                <div class="info-box">
                    <h5 class="mb-3"><i class="fas fa-question-circle me-2"></i>Ne Yapmalıyım?</h5>
                    <ul class="text-muted text-start">
                        <li>Kart bilgilerinizi kontrol edin</li>
                        <li>Kartınızda yeterli bakiye olduğundan emin olun</li>
                        <li>Farklı bir kart ile deneyebilirsiniz</li>
                        <li>Sorun devam ederse bankanızla iletişime geçin</li>
                    </ul>
                </div>
                
                <div class="d-grid gap-2 mt-4">
                    <a href="deposit.php" class="btn btn-primary btn-lg">
                        <i class="fas fa-redo me-2"></i>Tekrar Dene
                    </a>
                    <a href="index.php" class="btn btn-outline-secondary">
                        <i class="fas fa-home me-2"></i>Dashboard'a Dön
                    </a>
                </div>
            <?php endif; ?>
            
            <div class="border-top mt-4 pt-3">
                <p class="text-muted small mb-0">
                    <i class="fas fa-headset me-1"></i>
                    Yardıma mı ihtiyacınız var?
                    <br>
                    <i class="fas fa-phone me-1"></i><strong>0242 123 45 67</strong>
                    <span class="mx-2">|</span>
                    <i class="fas fa-envelope me-1"></i><strong>info@gurbuzoyuncak.com</strong>
                </p>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        <?php if ($success): ?>
        // Countdown timer
        let seconds = 5;
        const countdownElement = document.getElementById('seconds');
        
        const countdown = setInterval(function() {
            seconds--;
            if (countdownElement) {
                countdownElement.textContent = seconds;
            }
            
            if (seconds <= 0) {
                clearInterval(countdown);
                window.location.href = 'index.php';
            }
        }, 1000);
        
        // Kullanıcı tıklarsa countdown'u durdur
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                clearInterval(countdown);
            });
        });
        <?php endif; ?>
    </script>
</body>
</html>
