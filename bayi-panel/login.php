<?php
/**
 * Bayi Panel Girişi
 * Gürbüz Oyuncak E-Ticaret Sistemi
 * Mobile Responsive & Modern Design
 */

session_start();

// Eğer zaten giriş yapılmışsa dashboard'a yönlendir
if (isset($_SESSION['bayi_logged_in']) && $_SESSION['bayi_logged_in'] === true) {
    header('Location: index.php');
    exit;
}

$error = '';
$info = '';

// URL parametrelerine göre mesajlar
if (isset($_GET['timeout'])) {
    $info = 'Oturumunuz zaman aşımına uğradı. Lütfen tekrar giriş yapın.';
} elseif (isset($_GET['inactive'])) {
    $error = 'Hesabınız aktif değil. Lütfen admin ile iletişime geçin.';
} elseif (isset($_GET['logout'])) {
    $info = 'Başarıyla çıkış yaptınız.';
} elseif (isset($_GET['registered'])) {
    $info = 'Başvurunuz alındı. Onay sonrası giriş yapabilirsiniz.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once 'includes/auth.php';
    
    $email = cleanInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'E-posta ve şifre alanları gereklidir.';
    } elseif (bayiLogin($email, $password)) {
        header('Location: index.php');
        exit;
    } else {
        $error = 'E-posta veya şifre hatalı!';
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <title>Bayi Panel Girişi - Gürbüz Oyuncak B2B</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Custom Styles -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .login-container {
            width: 100%;
            max-width: 450px;
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
        
        .login-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .login-header .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
            color: white;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        
        .login-header h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        
        .login-header p {
            color: #6c757d;
            font-size: 0.95rem;
            margin: 0;
        }
        
        .form-label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .form-control {
            border-radius: 12px;
            border: 2px solid #e9ecef;
            padding: 0.875rem 1.125rem;
            font-size: 0.95rem;
            min-height: 52px;
            transition: all 0.2s;
        }
        
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }
        
        .form-control::placeholder {
            color: #adb5bd;
        }
        
        .input-group {
            position: relative;
        }
        
        .input-group-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            z-index: 10;
        }
        
        .input-group .form-control {
            padding-left: 3rem;
        }
        
        .btn-primary-custom {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            padding: 1rem;
            font-size: 1rem;
            font-weight: 600;
            color: white;
            min-height: 52px;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        
        .btn-primary-custom:active {
            transform: translateY(0);
        }
        
        .divider {
            text-align: center;
            margin: 1.5rem 0;
            position: relative;
        }
        
        .divider::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 100%;
            height: 1px;
            background: #e9ecef;
        }
        
        .divider span {
            background: white;
            padding: 0 1rem;
            color: #6c757d;
            font-size: 0.875rem;
            position: relative;
            z-index: 1;
        }
        
        .register-link {
            text-align: center;
            padding: 1.25rem;
            background: #f8f9fa;
            border-radius: 12px;
            margin-top: 1.5rem;
        }
        
        .register-link p {
            margin: 0 0 0.5rem 0;
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        .register-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s;
        }
        
        .register-link a:hover {
            color: #764ba2;
        }
        
        .demo-info {
            text-align: center;
            margin-top: 1rem;
            padding: 1rem;
            background: #fff3cd;
            border-radius: 12px;
            border: 1px solid #ffeaa7;
        }
        
        .demo-info i {
            color: #f59e0b;
            margin-right: 0.5rem;
        }
        
        .demo-info p {
            margin: 0;
            color: #856404;
            font-size: 0.85rem;
        }
        
        .footer-links {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-links a {
            color: #6c757d;
            text-decoration: none;
            font-size: 0.875rem;
            margin: 0 0.5rem;
            transition: color 0.2s;
        }
        
        .footer-links a:hover {
            color: #667eea;
        }
        
        .password-toggle {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #6c757d;
            z-index: 10;
            transition: color 0.2s;
        }
        
        .password-toggle:hover {
            color: #667eea;
        }
        
        /* Mobile Optimizations */
        @media (max-width: 576px) {
            .login-card {
                padding: 2rem 1.5rem;
                border-radius: 16px;
            }
            
            .login-header .logo {
                width: 70px;
                height: 70px;
                font-size: 2rem;
            }
            
            .login-header h1 {
                font-size: 1.5rem;
            }
            
            .form-control {
                padding: 0.75rem 1rem;
                min-height: 48px;
            }
            
            .btn-primary-custom {
                padding: 0.875rem;
                min-height: 48px;
            }
        }
        
        /* Accessibility */
        .form-control:focus {
            outline: none;
        }
        
        button:focus {
            outline: 2px solid #667eea;
            outline-offset: 2px;
        }
    </style>
</head>

<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="logo">
                    <i class="fas fa-store"></i>
                </div>
                <h1>Bayi Panel Girişi</h1>
                <p>Gürbüz Oyuncak B2B Sistemi</p>
            </div>
            
            <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <?php echo htmlspecialchars($error); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            
            <?php if ($info): ?>
                <div class="alert alert-info alert-dismissible fade show" role="alert">
                    <i class="fas fa-info-circle me-2"></i>
                    <?php echo htmlspecialchars($info); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            
            <form method="POST" id="loginForm">
                <div class="mb-3">
                    <label for="email" class="form-label">
                        <i class="fas fa-envelope me-1"></i> E-posta Adresi
                    </label>
                    <div class="input-group">
                        <span class="input-group-icon">
                            <i class="fas fa-user"></i>
                        </span>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            class="form-control" 
                            value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                            required
                            autocomplete="email"
                            placeholder="ornek@firma.com">
                    </div>
                </div>
                
                <div class="mb-4">
                    <label for="password" class="form-label">
                        <i class="fas fa-lock me-1"></i> Şifre
                    </label>
                    <div class="input-group">
                        <span class="input-group-icon">
                            <i class="fas fa-key"></i>
                        </span>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-control" 
                            required
                            autocomplete="current-password"
                            placeholder="••••••••">
                        <span class="password-toggle" onclick="togglePassword()">
                            <i class="fas fa-eye" id="toggleIcon"></i>
                        </span>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary-custom w-100">
                    <i class="fas fa-sign-in-alt me-2"></i> Giriş Yap
                </button>
            </form>
            
            <div class="register-link">
                <p>Henüz hesabınız yok mu?</p>
                <a href="register.php">
                    <i class="fas fa-user-plus me-1"></i> Bayi Başvurusu Yap
                </a>
            </div>
            
            <div class="demo-info">
                <p>
                    <i class="fas fa-info-circle"></i>
                    <strong>Demo Giriş:</strong> demo@bayipanel.com / 123456
                </p>
            </div>
            
            <div class="footer-links">
                <a href="../admin/">
                    <i class="fas fa-user-shield me-1"></i> Admin Panel
                </a>
                <span class="text-muted">|</span>
                <a href="../">
                    <i class="fas fa-home me-1"></i> Ana Site
                </a>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap Bundle JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom Scripts -->
    <script>
        // Password toggle
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.getElementById('toggleIcon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }
        
        // Form validation
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                e.preventDefault();
                alert('Lütfen tüm alanları doldurun.');
                return false;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                e.preventDefault();
                alert('Lütfen geçerli bir e-posta adresi girin.');
                return false;
            }
        });
        
        // Auto-dismiss alerts after 5 seconds
        setTimeout(function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
                bsAlert.close();
            });
        }, 5000);
    </script>
</body>
</html>
