<?php
session_start();
require_once 'includes/auth.php';

// Giriş kontrolü
checkBayiLogin();

$token = $_GET['token'] ?? '';
$merchant_oid = $_GET['oid'] ?? '';

if (empty($token) || empty($merchant_oid)) {
    header('Location: deposit.php?error=invalid_payment');
    exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>Güvenli Ödeme | Bayi Panel - Gürbüz Oyuncak</title>
    
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
        
        .payment-container {
            width: 100%;
            max-width: 900px;
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
        
        .payment-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .payment-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .payment-header h1 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 700;
        }
        
        .payment-header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
            font-size: 1rem;
        }
        
        .payment-body {
            padding: 2rem;
        }
        
        .iframe-container {
            position: relative;
            width: 100%;
            height: 650px;
            border: 2px solid #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            background: #f8f9fa;
        }
        
        .iframe-container iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 10;
        }
        
        .security-badge {
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border-left: 4px solid #667eea;
            border-radius: 10px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
        }
        
        .warning-box {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            border-radius: 10px;
            padding: 1.25rem;
        }
        
        .warning-box h5 {
            color: #e65100;
            margin-bottom: 0.75rem;
        }
        
        .warning-box ul {
            margin: 0;
            padding-left: 1.5rem;
            color: #5a6c7d;
        }
        
        .warning-box li {
            margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 0.5rem;
            }
            
            .payment-card {
                border-radius: 15px;
            }
            
            .payment-header {
                padding: 1.5rem;
            }
            
            .payment-header h1 {
                font-size: 1.5rem;
            }
            
            .payment-body {
                padding: 1.25rem;
            }
            
            .iframe-container {
                height: 550px;
            }
        }
    </style>
</head>
<body>
    <div class="payment-container">
        <div class="payment-card">
            <div class="payment-header">
                <h1><i class="fas fa-lock me-2"></i>Güvenli Ödeme</h1>
                <p>Gürbüz Oyuncak B2B - Bakiye Yükleme</p>
            </div>
            
            <div class="payment-body">
                <div class="security-badge">
                    <div class="d-flex align-items-center mb-2">
                        <i class="fas fa-shield-alt text-primary me-2" style="font-size: 1.5rem;"></i>
                        <strong class="text-primary fs-5">256-bit SSL Güvenli Ödeme</strong>
                    </div>
                    <p class="mb-0 text-muted">
                        Ödemeniz SSL şifreleme ile korunmaktadır. Kart bilgileriniz güvende ve kayıt edilmez.
                    </p>
                </div>
                
                <div class="iframe-container">
                    <div class="loading-overlay" id="loadingOverlay">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3 text-muted">Güvenli ödeme sayfası yükleniyor...</p>
                    </div>
                    
                    <iframe 
                        src="https://www.paytr.com/odeme/guvenli/<?php echo htmlspecialchars($token); ?>"
                        onload="hideLoading()"
                        id="paymentFrame">
                    </iframe>
                </div>
                
                <div class="border-top pt-3 mt-3">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <small class="text-muted">
                                <i class="fas fa-receipt me-1"></i>
                                İşlem No: <strong class="text-dark"><?php echo htmlspecialchars($merchant_oid); ?></strong>
                            </small>
                        </div>
                        <div>
                            <a href="deposit.php" class="btn btn-outline-secondary">
                                <i class="fas fa-times me-1"></i>İptal Et
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="warning-box mt-3">
                    <h5><i class="fas fa-exclamation-triangle me-2"></i>Önemli Uyarı</h5>
                    <ul>
                        <li>Ödeme işlemi sırasında sayfayı <strong>kapatmayın</strong></li>
                        <li>Tarayıcı <strong>geri butonunu</strong> kullanmayın</li>
                        <li>İşlem tamamlanana kadar <strong>bekleyin</strong></li>
                        <li>Sorun yaşarsanız: <strong><i class="fas fa-phone me-1"></i>0242 123 45 67</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        function hideLoading() {
            document.getElementById('loadingOverlay').style.display = 'none';
        }
        
        // Sayfa kapatılmaya çalışıldığında uyarı ver
        window.addEventListener('beforeunload', function(e) {
            const confirmationMessage = 'Ödeme işleminiz devam ediyor. Sayfayı kapatmak istediğinizden emin misiniz?';
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        });
        
        // PayTR iframe mesajlarını dinle
        window.addEventListener('message', function(event) {
            if (event.origin !== 'https://www.paytr.com') {
                return;
            }
            
            // Ödeme başarılı/başarısız mesajları
            if (event.data && event.data.type) {
                if (event.data.type === 'payment_success') {
                    window.location.href = 'payment-success.php?merchant_oid=<?php echo htmlspecialchars($merchant_oid); ?>';
                } else if (event.data.type === 'payment_fail') {
                    window.location.href = 'payment-fail.php?reason=' + encodeURIComponent(event.data.reason || 'Ödeme başarısız');
                }
            }
        });
        
        // 30 dakika sonra timeout
        setTimeout(function() {
            if (confirm('Ödeme işlemi çok uzun sürüyor. Sayfayı yenilemek ister misiniz?')) {
                window.location.reload();
            }
        }, 30 * 60 * 1000);
    </script>
</body>
</html>