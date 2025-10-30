<?php
/**
 * Bayi Kayıt Formu
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
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once '../backend/config/database.php';
    require_once '../backend/classes/Bayi.php';
    require_once 'includes/auth.php';
    
    // Form verilerini al ve temizle
    $email = cleanInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $password_confirm = $_POST['password_confirm'] ?? '';
    $company_name = cleanInput($_POST['company_name'] ?? '');
    $contact_person = cleanInput($_POST['contact_person'] ?? '');
    $phone = cleanInput($_POST['phone'] ?? '');
    $address = cleanInput($_POST['address'] ?? '');
    $tax_number = cleanInput($_POST['tax_number'] ?? '');
    $city = cleanInput($_POST['city'] ?? '');
    $district = cleanInput($_POST['district'] ?? '');
    $postal_code = cleanInput($_POST['postal_code'] ?? '');
    $website = cleanInput($_POST['website'] ?? '');
    
    // Validasyon
    if (empty($email) || empty($password) || empty($company_name) || empty($contact_person) || 
        empty($phone) || empty($address)) {
        $error = 'Zorunlu alanları doldurun.';
    } elseif ($password !== $password_confirm) {
        $error = 'Şifreler eşleşmiyor.';
    } elseif (strlen($password) < 6) {
        $error = 'Şifre en az 6 karakter olmalıdır.';
    } else {
        // Bayi kaydı oluştur
        $database = new Database();
        $db = $database->getConnection();
        
        $bayi = new Bayi($db);
        $bayi->email = $email;
        $bayi->password_hash = $password;
        $bayi->company_name = $company_name;
        $bayi->contact_person = $contact_person;
        $bayi->phone = $phone;
        $bayi->address = $address;
        $bayi->tax_number = $tax_number;
        $bayi->city = $city;
        $bayi->district = $district;
        $bayi->postal_code = $postal_code;
        $bayi->website = $website;
        
        $result = $bayi->kayitOl();
        
        if ($result['success']) {
            $success = 'Başvurunuz alındı! Admin onayından sonra giriş yapabilirsiniz. Size e-posta ile bilgi verilecektir.';
        } else {
            $error = $result['error'];
        }
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
    <title>Bayi Başvuru Formu - Gürbüz Oyuncak B2B</title>
    
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
            padding: 2rem 1rem;
        }
        
        .register-container {
            max-width: 900px;
            margin: 0 auto;
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
        
        .register-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .register-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .register-header h1 {
            color: #2c3e50;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .register-header p {
            color: #7f8c8d;
            font-size: 1rem;
        }
        
        .form-section {
            margin-bottom: 2rem;
        }
        
        .section-title {
            color: #2c3e50;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #667eea;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .section-title i {
            color: #667eea;
        }
        
        .form-label {
            color: #495057;
            font-weight: 500;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .form-label .required {
            color: #e74c3c;
            margin-left: 0.25rem;
        }
        
        .form-control,
        .form-select {
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            min-height: 48px;
        }
        
        .form-control:focus,
        .form-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }
        
        textarea.form-control {
            min-height: 100px;
            resize: vertical;
        }
        
        .info-box {
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border-left: 4px solid #667eea;
            border-radius: 10px;
            padding: 1.25rem;
            margin: 1.5rem 0;
        }
        
        .info-box strong {
            color: #2c3e50;
            display: block;
            margin-bottom: 0.75rem;
            font-size: 1rem;
        }
        
        .info-box ul {
            margin: 0;
            padding-left: 1.5rem;
            color: #5a6c7d;
        }
        
        .info-box li {
            margin-bottom: 0.5rem;
            line-height: 1.6;
        }
        
        .btn-register {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 1rem;
            border-radius: 10px;
            font-weight: 600;
            font-size: 1rem;
            width: 100%;
            transition: all 0.3s ease;
            min-height: 52px;
        }
        
        .btn-register:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .btn-register:active {
            transform: translateY(0);
        }
        
        .alert {
            border-radius: 10px;
            padding: 1rem 1.25rem;
            margin-bottom: 1.5rem;
            border: none;
        }
        
        .alert-danger {
            background: #fee;
            color: #c33;
            border-left: 4px solid #e74c3c;
        }
        
        .alert-success {
            background: #efe;
            color: #383;
            border-left: 4px solid #27ae60;
        }
        
        .bottom-links {
            text-align: center;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e9ecef;
        }
        
        .bottom-links a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-block;
            margin: 0.5rem 0;
        }
        
        .bottom-links a:hover {
            color: #764ba2;
            transform: translateX(5px);
        }
        
        .bottom-links .secondary-link {
            color: #95a5a6;
            font-size: 0.9rem;
            display: block;
            margin-top: 1rem;
        }
        
        .bottom-links .secondary-link:hover {
            color: #7f8c8d;
        }
        
        .password-strength {
            height: 4px;
            border-radius: 2px;
            margin-top: 0.5rem;
            background: #e9ecef;
            overflow: hidden;
        }
        
        .password-strength-bar {
            height: 100%;
            width: 0;
            transition: all 0.3s ease;
            border-radius: 2px;
        }
        
        .password-match-indicator {
            font-size: 0.85rem;
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 5px;
            display: none;
        }
        
        .password-match-indicator.match {
            background: #d4edda;
            color: #155724;
            display: block;
        }
        
        .password-match-indicator.no-match {
            background: #f8d7da;
            color: #721c24;
            display: block;
        }
        
        /* Mobile Optimizations */
        @media (max-width: 768px) {
            body {
                padding: 1rem 0.5rem;
            }
            
            .register-card {
                padding: 1.5rem;
                border-radius: 15px;
            }
            
            .register-header h1 {
                font-size: 1.5rem;
            }
            
            .section-title {
                font-size: 1.1rem;
            }
            
            .form-control,
            .form-select {
                font-size: 16px; /* Prevents zoom on iOS */
            }
        }
        
        @media (max-width: 576px) {
            .register-card {
                padding: 1.25rem;
            }
        }
    </style>
</head>
<body>
    <div class="register-container">
        <div class="register-card">
            <div class="register-header">
                <h1><i class="fas fa-store"></i> Bayi Başvuru Formu</h1>
                <p>Gürbüz Oyuncak B2B Sistemi</p>
            </div>
            
            <?php if ($error): ?>
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <?php echo htmlspecialchars($success); ?>
                </div>
                <div class="text-center mt-4">
                    <a href="login.php" class="btn btn-register">
                        <i class="fas fa-sign-in-alt me-2"></i>Giriş Sayfasına Dön
                    </a>
                </div>
            <?php else: ?>
            
            <form method="POST" id="registerForm" novalidate>
                <!-- Firma Bilgileri -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-building"></i>
                        <span>Firma Bilgileri</span>
                    </div>
                    
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="company_name" class="form-label">
                                Firma Adı<span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="company_name" 
                                name="company_name" 
                                class="form-control" 
                                value="<?php echo htmlspecialchars($_POST['company_name'] ?? ''); ?>"
                                required
                                placeholder="Örnek Oyuncak Ltd. Şti.">
                        </div>
                        
                        <div class="col-md-6">
                            <label for="tax_number" class="form-label">Vergi Numarası</label>
                            <input 
                                type="text" 
                                id="tax_number" 
                                name="tax_number" 
                                class="form-control" 
                                value="<?php echo htmlspecialchars($_POST['tax_number'] ?? ''); ?>"
                                maxlength="10"
                                placeholder="1234567890">
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <label for="address" class="form-label">
                            Adres<span class="required">*</span>
                        </label>
                        <textarea 
                            id="address" 
                            name="address" 
                            class="form-control" 
                            rows="3"
                            required
                            placeholder="Tam adres bilgisi"><?php echo htmlspecialchars($_POST['address'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="row g-3 mt-0">
                        <div class="col-md-4">
                            <label for="city" class="form-label">Şehir</label>
                            <input 
                                type="text" 
                                id="city" 
                                name="city" 
                                class="form-control" 
                                value="<?php echo htmlspecialchars($_POST['city'] ?? ''); ?>"
                                placeholder="İstanbul">
                        </div>
                        
                        <div class="col-md-4">
                            <label for="district" class="form-label">İlçe</label>
                            <input 
                                type="text" 
                                id="district" 
                                name="district" 
                                class="form-control" 
                                value="<?php echo htmlspecialchars($_POST['district'] ?? ''); ?>"
                                placeholder="Kadıköy">
                        </div>
                        
                        <div class="col-md-4">
                            <label for="postal_code" class="form-label">Posta Kodu</label>
                            <input 
                                type="text" 
                                id="postal_code" 
                                name="postal_code" 
                                class="form-control" 
                                value="<?php echo htmlspecialchars($_POST['postal_code'] ?? ''); ?>"
                                maxlength="5"
                                placeholder="34000">
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <label for="website" class="form-label">Web Sitesi</label>
                        <input 
                            type="url" 
                            id="website" 
                            name="website" 
                            class="form-control" 
                            value="<?php echo htmlspecialchars($_POST['website'] ?? ''); ?>"
                            placeholder="https://www.firmaniz.com">
                    </div>
                </div>
                
                <!-- İletişim Bilgileri -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-user-tie"></i>
                        <span>İletişim Bilgileri</span>
                    </div>
                    
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="contact_person" class="form-label">
                                Yetkili Kişi<span class="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="contact_person" 
                                name="contact_person" 
                                class="form-control" 
                                value="<?php echo htmlspecialchars($_POST['contact_person'] ?? ''); ?>"
                                required
                                placeholder="Ad Soyad">
                        </div>
                        
                        <div class="col-md-6">
                            <label for="phone" class="form-label">
                                Telefon<span class="required">*</span>
                            </label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                class="form-control" 
                                value="<?php echo htmlspecialchars($_POST['phone'] ?? ''); ?>"
                                required
                                placeholder="0532 123 45 67">
                        </div>
                    </div>
                </div>
                
                <!-- Giriş Bilgileri -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-key"></i>
                        <span>Giriş Bilgileri</span>
                    </div>
                    
                    <div class="mb-3">
                        <label for="email" class="form-label">
                            E-posta Adresi<span class="required">*</span>
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            class="form-control" 
                            value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                            required
                            placeholder="ornek@firma.com">
                    </div>
                    
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="password" class="form-label">
                                Şifre<span class="required">*</span>
                            </label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="form-control" 
                                required
                                minlength="6"
                                placeholder="En az 6 karakter">
                            <div class="password-strength">
                                <div class="password-strength-bar" id="strengthBar"></div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <label for="password_confirm" class="form-label">
                                Şifre Tekrar<span class="required">*</span>
                            </label>
                            <input 
                                type="password" 
                                id="password_confirm" 
                                name="password_confirm" 
                                class="form-control" 
                                required
                                placeholder="Şifreyi tekrar girin">
                            <div class="password-match-indicator" id="matchIndicator"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Başvuru Bilgilendirme -->
                <div class="info-box">
                    <strong><i class="fas fa-info-circle me-2"></i>Başvuru Süreci Hakkında</strong>
                    <ul>
                        <li>Başvurunuz 1-2 iş günü içinde değerlendirilecektir</li>
                        <li>Onay durumu e-posta ile bildirilecektir</li>
                        <li>Onaylandıktan sonra sisteme giriş yapabilirsiniz</li>
                        <li>İlk bakiye yüklemesi için banka bilgileri paylaşılacaktır</li>
                        <li>Bayi hesabınıza özel indirim oranları belirlenecektir</li>
                    </ul>
                </div>
                
                <button type="submit" class="btn btn-register">
                    <i class="fas fa-paper-plane me-2"></i>Başvuru Gönder
                </button>
            </form>
            
            <?php endif; ?>
            
            <div class="bottom-links">
                <a href="login.php">
                    <i class="fas fa-sign-in-alt me-2"></i>Zaten hesabınız var mı? Giriş Yapın
                </a>
                <a href="../" class="secondary-link">
                    <i class="fas fa-home me-2"></i>Ana Siteye Dön
                </a>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Form validation ve kullanıcı deneyimi iyileştirmeleri
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('registerForm');
            const passwordInput = document.getElementById('password');
            const confirmInput = document.getElementById('password_confirm');
            const strengthBar = document.getElementById('strengthBar');
            const matchIndicator = document.getElementById('matchIndicator');
            
            // Şifre gücü göstergesi
            if (passwordInput && strengthBar) {
                passwordInput.addEventListener('input', function() {
                    const password = this.value;
                    let strength = 0;
                    
                    if (password.length >= 6) strength += 25;
                    if (password.length >= 8) strength += 25;
                    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
                    if (/\d/.test(password)) strength += 25;
                    
                    strengthBar.style.width = strength + '%';
                    
                    if (strength <= 25) {
                        strengthBar.style.background = '#e74c3c';
                    } else if (strength <= 50) {
                        strengthBar.style.background = '#f39c12';
                    } else if (strength <= 75) {
                        strengthBar.style.background = '#f1c40f';
                    } else {
                        strengthBar.style.background = '#27ae60';
                    }
                });
            }
            
            // Şifre eşleşme kontrolü
            function checkPasswordMatch() {
                if (!confirmInput || !passwordInput) return;
                
                const password = passwordInput.value;
                const confirm = confirmInput.value;
                
                if (confirm.length === 0) {
                    matchIndicator.style.display = 'none';
                    return;
                }
                
                if (password === confirm) {
                    matchIndicator.className = 'password-match-indicator match';
                    matchIndicator.innerHTML = '<i class="fas fa-check-circle me-1"></i>Şifreler eşleşiyor';
                } else {
                    matchIndicator.className = 'password-match-indicator no-match';
                    matchIndicator.innerHTML = '<i class="fas fa-times-circle me-1"></i>Şifreler eşleşmiyor';
                }
            }
            
            if (confirmInput) {
                confirmInput.addEventListener('input', checkPasswordMatch);
                passwordInput.addEventListener('input', checkPasswordMatch);
            }
            
            // Telefon formatı
            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                phoneInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 11) value = value.slice(0, 11);
                    
                    if (value.length > 0) {
                        if (value.length <= 4) {
                            e.target.value = value;
                        } else if (value.length <= 7) {
                            e.target.value = value.slice(0, 4) + ' ' + value.slice(4);
                        } else {
                            e.target.value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
                        }
                    }
                });
            }
            
            // Form submit kontrolü
            if (form) {
                form.addEventListener('submit', function(e) {
                    const password = passwordInput.value;
                    const confirm = confirmInput.value;
                    
                    if (password !== confirm) {
                        e.preventDefault();
                        matchIndicator.className = 'password-match-indicator no-match';
                        matchIndicator.innerHTML = '<i class="fas fa-times-circle me-1"></i>Şifreler eşleşmiyor';
                        confirmInput.focus();
                        return false;
                    }
                    
                    // Form gönderiliyor göstergesi
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gönderiliyor...';
                        submitBtn.disabled = true;
                    }
                });
            }
            
            // Bootstrap form validation
            const forms = document.querySelectorAll('form[novalidate]');
            Array.from(forms).forEach(form => {
                form.addEventListener('submit', function(event) {
                    if (!form.checkValidity()) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        });
    </script>
</body>
</html>
