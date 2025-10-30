<?php
/**
 * PayTR Ödeme Başarısız Sayfası
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

session_start();
require_once 'includes/auth.php';

// Giriş kontrolü
checkBayiLogin();

$error_reason = $_GET['reason'] ?? 'Bilinmeyen hata';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>Ödeme Başarısız | Bayi Panel - Gürbüz Oyuncak</title>
    
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
            max-width: 650px;
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
            color: #f44336;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .error-message {
            background: #ffebee;
            border-left: 4px solid #f44336;
            border-radius: 10px;
            padding: 1.25rem;
            margin: 1.5rem 0;
            text-align: left;
            color: #c62828;
        }
        
        .reasons-box {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: left;
        }
        
        .reasons-box h5 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .reasons-box ul {
            margin: 0;
            padding-left: 1.5rem;
            color: #5a6c7d;
        }
        
        .reasons-box li {
            margin-bottom: 0.5rem;
            line-height: 1.6;
        }
        
        .suggestion-box {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            border-radius: 10px;
            padding: 1.25rem;
            margin: 1.5rem 0;
            text-align: left;
        }
        
        .suggestion-box h5 {
            color: #e65100;
            margin-bottom: 0.75rem;
        }
        
        .suggestion-box ul {
            margin: 0;
            padding-left: 1.5rem;
            color: #5a6c7d;
        }
        
        .suggestion-box li {
            margin-bottom: 0.5rem;
        }
        
        @media (max-width: 576px) {
            .result-card {
                padding: 2rem 1.5rem;
            }
            
            .result-title {
                font-size: 1.5rem;
            }
            
            .icon-error {
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
            <div class="icon-error">
                <i class="fas fa-times"></i>
            </div>
            
            <h1 class="result-title">Ödeme Başarısız</h1>
            
            <div class="error-message">
                <div class="d-flex align-items-start">
                    <i class="fas fa-exclamation-circle me-2 mt-1"></i>
                    <div>
                        <strong>Ödeme işleminiz tamamlanamadı.</strong>
                        <?php if ($error_reason && $error_reason !== 'Bilinmeyen hata'): ?>
                            <br>
                            <span class="small">Sebep: <?php echo htmlspecialchars($error_reason); ?></span>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <div class="reasons-box">
                <h5><i class="fas fa-question-circle me-2"></i>Muhtemel Nedenler</h5>
                <ul>
                    <li><strong>Kart bakiyesi yetersiz:</strong> Kartınızda yeterli bakiye bulunmuyor olabilir</li>
                    <li><strong>Hatalı kart bilgisi:</strong> Kart numarası, son kullanma tarihi veya CVV kodu yanlış girilmiş olabilir</li>
                    <li><strong>Kartın geçerlilik süresi:</strong> Kartınızın geçerlilik süresi dolmuş olabilir</li>
                    <li><strong>3D Secure hatası:</strong> SMS doğrulama kodu yanlış girilmiş veya zaman aşımına uğramış olabilir</li>
                    <li><strong>Banka reddi:</strong> Bankanız işlemi güvenlik nedeniyle reddetmiş olabilir</li>
                    <li><strong>İnternet bağlantısı:</strong> Ödeme sırasında bağlantı kesilmiş olabilir</li>
                    <li><strong>Kart limiti:</strong> Günlük veya aylık harcama limitinizi aşmış olabilirsiniz</li>
                </ul>
            </div>
            
            <div class="suggestion-box">
                <h5><i class="fas fa-lightbulb me-2"></i>Önerilerimiz</h5>
                <ul>
                    <li>Kart bilgilerinizi dikkatlice kontrol edip tekrar deneyin</li>
                    <li>Farklı bir ödeme kartı kullanmayı deneyin</li>
                    <li>Bankanızı arayarak işlemin neden reddedildiğini öğrenin</li>
                    <li>Kartınızın internet ödemelerine açık olduğundan emin olun</li>
                    <li>Birkaç dakika sonra tekrar deneyin</li>
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
            
            <div class="border-top mt-4 pt-3">
                <div class="alert alert-info mb-0">
                    <h6 class="alert-heading"><i class="fas fa-headset me-2"></i>Destek Gereksinimi</h6>
                    <p class="mb-2 small">Sorun devam ediyorsa bizimle iletişime geçin:</p>
                    <div class="d-flex flex-column flex-sm-row justify-content-center gap-3">
                        <a href="tel:02421234567" class="text-decoration-none">
                            <i class="fas fa-phone text-primary me-1"></i>
                            <strong>0242 123 45 67</strong>
                        </a>
                        <a href="mailto:info@gurbuzoyuncak.com" class="text-decoration-none">
                            <i class="fas fa-envelope text-primary me-1"></i>
                            <strong>info@gurbuzoyuncak.com</strong>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
