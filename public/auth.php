<?php
require_once '../components/ComponentLoader.php';
$loader = new ComponentLoader();

// Get action from URL parameter
$action = isset($_GET['action']) ? $_GET['action'] : 'login';
$redirect = isset($_GET['redirect']) ? $_GET['redirect'] : '';

// Generate CSRF token
session_start();
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Giriş Yap / Kayıt Ol | Gürbüz Oyuncak</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../components/css/components.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Mobile-first Auth System */
        .auth-main {
            min-height: 80vh;
            padding: 1rem 0;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .auth-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        .auth-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .auth-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }
        
        .auth-subtitle {
            color: #6b7280;
            font-size: 1rem;
        }
        
        /* Enhanced Tab System */
        .auth-tabs {
            background: white;
            border-radius: 12px;
            padding: 0.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            display: flex;
            gap: 0.5rem;
        }
        
        .auth-tab {
            flex: 1;
            padding: 1rem;
            border: none;
            background: transparent;
            color: #6b7280;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            min-height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }
        
        .auth-tab:hover {
            background: #f8fafc;
            color: #374151;
        }
        
        .auth-tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        /* Form Container */
        .auth-form-container {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
        }
        
        .auth-form {
            display: none;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        }
        
        .auth-form.active {
            display: block;
            opacity: 1;
            transform: translateY(0);
        }
        
        .form-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #374151;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        /* Enhanced Form Inputs */
        .form-group {
            margin-bottom: 1.5rem;
            position: relative;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.75rem;
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
        }
        
        .form-input {
            width: 100%;
            height: 56px;
            padding: 1rem 1rem 1rem 3rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: #f8fafc;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        
        .form-input.valid {
            border-color: #10b981;
            background: #f0fdf4;
        }
        
        .form-input.invalid {
            border-color: #ef4444;
            background: #fef2f2;
        }
        
        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            width: 20px;
            height: 20px;
            z-index: 1;
        }
        
        .password-toggle {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        
        .password-toggle:hover {
            color: #667eea;
            background: #f8fafc;
        }
        
        /* Password Strength Indicator */
        .password-strength {
            margin-top: 0.75rem;
            display: none;
        }
        
        .strength-bar {
            height: 4px;
            background: #e2e8f0;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-text {
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .strength-weak { background: #ef4444; }
        .strength-medium { background: #f59e0b; }
        .strength-strong { background: #10b981; }
        
        /* Form Validation Messages */
        .form-feedback {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            min-height: 1.2rem;
        }
        
        .form-feedback.valid {
            color: #10b981;
        }
        
        .form-feedback.invalid {
            color: #ef4444;
        }
        
        /* Remember Me & Links */
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 1.5rem 0;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .remember-me input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #667eea;
        }
        
        .forgot-password {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
            transition: color 0.2s ease;
        }
        
        .forgot-password:hover {
            color: #5a67d8;
            text-decoration: underline;
        }
        
        /* Action Buttons */
        .auth-btn {
            width: 100%;
            height: 56px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            border-radius: 12px;
            font-weight: 700;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .auth-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
        
        .auth-btn:active {
            transform: translateY(0);
        }
        
        .auth-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .auth-btn.loading {
            pointer-events: none;
        }
        
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Social Login */
        .social-login {
            margin: 2rem 0;
        }
        
        .divider {
            display: flex;
            align-items: center;
            margin: 1.5rem 0;
            color: #9ca3af;
            font-size: 0.9rem;
        }
        
        .divider::before,
        .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e2e8f0;
        }
        
        .divider span {
            padding: 0 1rem;
            background: white;
        }
        
        .social-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .social-btn {
            height: 48px;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-weight: 600;
            color: #374151;
        }
        
        .social-btn:hover {
            border-color: #667eea;
            background: #f8fafc;
            transform: translateY(-1px);
        }
        
        .social-btn.google:hover {
            border-color: #ea4335;
            color: #ea4335;
        }
        
        .social-btn.facebook:hover {
            border-color: #1877f2;
            color: #1877f2;
        }
        
        /* Alert Messages */
        .alert-custom {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            display: none;
            align-items: center;
            gap: 0.75rem;
        }
        
        .alert-custom.show {
            display: flex;
        }
        
        .alert-success {
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        
        .alert-error {
            background: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        
        .alert-warning {
            background: #fffbeb;
            color: #92400e;
            border: 1px solid #fed7aa;
        }
        
        /* Modal for Mobile */
        .mobile-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 1060;
            display: none;
            flex-direction: column;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }
        
        .mobile-modal.active {
            display: flex;
            transform: translateY(0);
        }
        
        .mobile-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
        }
        
        .mobile-modal-close {
            width: 48px;
            height: 48px;
            border: none;
            background: none;
            color: #6b7280;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        
        .mobile-modal-close:hover {
            background: #e2e8f0;
            color: #374151;
        }
        
        .mobile-modal-body {
            flex: 1;
            padding: 1.5rem;
            overflow-y: auto;
        }
        
        /* Newsletter Signup */
        .newsletter-signup {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            text-align: center;
        }
        
        .newsletter-title {
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 0.5rem;
        }
        
        .newsletter-text {
            color: #3730a3;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .newsletter-input {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .newsletter-input input {
            flex: 1;
            height: 44px;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 0 1rem;
        }
        
        .newsletter-input button {
            height: 44px;
            padding: 0 1.5rem;
            background: #1e40af;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .newsletter-input button:hover {
            background: #1d4ed8;
        }
        
        /* Responsive Design */
        @media (min-width: 576px) {
            .auth-container {
                padding: 0 2rem;
            }
            
            .auth-form-container {
                padding: 3rem;
            }
            
            .auth-tab {
                font-size: 1rem;
            }
            
            .social-buttons {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        @media (min-width: 768px) {
            .auth-main {
                padding: 3rem 0;
            }
            
            .auth-title {
                font-size: 2.25rem;
            }
            
            .auth-subtitle {
                font-size: 1.125rem;
            }
            
            .form-options {
                flex-wrap: nowrap;
            }
            
            .mobile-modal {
                display: none !important;
            }
        }
        
        @media (min-width: 992px) {
            .auth-container {
                max-width: 600px;
            }
        }
        
        /* Forgot Password Modal */
        .forgot-password-modal .modal-content {
            border-radius: 16px;
            border: none;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
        
        .forgot-password-modal .modal-header {
            border-bottom: 1px solid #e2e8f0;
            padding: 1.5rem;
        }
        
        .forgot-password-modal .modal-body {
            padding: 1.5rem;
        }
        
        /* Animations */
        .fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .slide-in {
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
        
        /* Touch Gestures */
        .swipe-container {
            touch-action: pan-y;
            overflow-x: hidden;
        }
        
        /* Enhanced Focus States for Accessibility */
        .form-input:focus,
        .auth-btn:focus,
        .social-btn:focus,
        .auth-tab:focus {
            outline: 2px solid #667eea;
            outline-offset: 2px;
        }
        
        /* Guest Checkout Link */
        .guest-checkout {
            text-align: center;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
        }
        
        .guest-checkout-text {
            color: #6b7280;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }
        
        .guest-checkout-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .guest-checkout-btn:hover {
            color: #5a67d8;
            border-color: #667eea;
            background: #f8fafc;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <?php echo $loader->loadComponent('navbar', 'Public'); ?>
    
    <main class="auth-main">
        <div class="auth-container">
            <!-- Auth Header -->
            <div class="auth-header">
                <h1 class="auth-title">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Hesap İşlemleri
                </h1>
                <p class="auth-subtitle">Güvenli alışveriş deneyimi için giriş yapın veya yeni hesap oluşturun</p>
            </div>
            
            <!-- Auth Tabs -->
            <div class="auth-tabs">
                <button class="auth-tab <?php echo $action === 'login' ? 'active' : ''; ?>" data-tab="login">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10,17 15,12 10,7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Giriş Yap
                </button>
                <button class="auth-tab <?php echo $action === 'register' ? 'active' : ''; ?>" data-tab="register">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <path d="M20 8v6"></path>
                        <path d="M23 11h-6"></path>
                    </svg>
                    Kayıt Ol
                </button>
                <button class="auth-tab <?php echo $action === 'subscribe' ? 'active' : ''; ?>" data-tab="subscribe">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Bülten
                </button>
            </div>
            
            <!-- Auth Forms Container -->
            <div class="auth-form-container">
                <!-- Alert Messages -->
                <div class="alert-custom alert-success" id="successAlert">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    <span id="successMessage"></span>
                </div>
                
                <div class="alert-custom alert-error" id="errorAlert">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span id="errorMessage"></span>
                </div>
                
                <!-- Login Form -->
                <form class="auth-form <?php echo $action === 'login' ? 'active' : ''; ?>" id="loginForm" data-form="login">
                    <h2 class="form-title">Hesabınıza Giriş Yapın</h2>
                    
                    <!-- Social Login -->
                    <div class="social-login">
                        <div class="social-buttons">
                            <button type="button" class="social-btn google" onclick="socialLogin('google')">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Google
                            </button>
                            <button type="button" class="social-btn facebook" onclick="socialLogin('facebook')">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </button>
                        </div>
                        
                        <div class="divider">
                            <span>veya e-posta ile</span>
                        </div>
                    </div>
                    
                    <!-- Email Input -->
                    <div class="form-group">
                        <label class="form-label" for="loginEmail">E-posta Adresi *</label>
                        <div class="position-relative">
                            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <input type="email" class="form-input" id="loginEmail" name="email" 
                                   placeholder="E-posta adresinizi girin" required 
                                   autocomplete="email" data-validate="email">
                        </div>
                        <div class="form-feedback" id="loginEmailFeedback"></div>
                    </div>
                    
                    <!-- Password Input -->
                    <div class="form-group">
                        <label class="form-label" for="loginPassword">Şifre *</label>
                        <div class="position-relative">
                            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <input type="password" class="form-input" id="loginPassword" name="password" 
                                   placeholder="Şifrenizi girin" required 
                                   autocomplete="current-password" data-validate="password">
                            <button type="button" class="password-toggle" data-target="loginPassword">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                        <div class="form-feedback" id="loginPasswordFeedback"></div>
                    </div>
                    
                    <!-- Form Options -->
                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" name="remember" id="rememberMe">
                            <span>Beni hatırla</span>
                        </label>
                        <a href="#" class="forgot-password" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal">
                            Şifremi unuttum
                        </a>
                    </div>
                    
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="redirect" value="<?php echo htmlspecialchars($redirect); ?>">
                    
                    <button type="submit" class="auth-btn" id="loginBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10,17 15,12 10,7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        <span>Güvenli Giriş</span>
                    </button>
                </form>
                
                <!-- Register Form -->
                <form class="auth-form <?php echo $action === 'register' ? 'active' : ''; ?>" id="registerForm" data-form="register">
                    <h2 class="form-title">Yeni Hesap Oluşturun</h2>
                    
                    <!-- Name Fields -->
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label" for="firstName">Ad *</label>
                                <div class="position-relative">
                                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <input type="text" class="form-input" id="firstName" name="first_name" 
                                           placeholder="Adınız" required 
                                           autocomplete="given-name" data-validate="name">
                                </div>
                                <div class="form-feedback" id="firstNameFeedback"></div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label" for="lastName">Soyad *</label>
                                <div class="position-relative">
                                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <input type="text" class="form-input" id="lastName" name="last_name" 
                                           placeholder="Soyadınız" required 
                                           autocomplete="family-name" data-validate="name">
                                </div>
                                <div class="form-feedback" id="lastNameFeedback"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Email Input -->
                    <div class="form-group">
                        <label class="form-label" for="registerEmail">E-posta Adresi *</label>
                        <div class="position-relative">
                            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <input type="email" class="form-input" id="registerEmail" name="email" 
                                   placeholder="E-posta adresinizi girin" required 
                                   autocomplete="email" data-validate="email">
                        </div>
                        <div class="form-feedback" id="registerEmailFeedback"></div>
                    </div>
                    
                    <!-- Phone Input -->
                    <div class="form-group">
                        <label class="form-label" for="phone">Telefon Numarası</label>
                        <div class="position-relative">
                            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <input type="tel" class="form-input" id="phone" name="phone" 
                                   placeholder="+90 (5XX) XXX XX XX" 
                                   autocomplete="tel" data-validate="phone">
                        </div>
                        <div class="form-feedback" id="phoneFeedback"></div>
                    </div>
                    
                    <!-- Password Fields -->
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label" for="registerPassword">Şifre *</label>
                                <div class="position-relative">
                                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    <input type="password" class="form-input" id="registerPassword" name="password" 
                                           placeholder="Güçlü bir şifre oluşturun" required 
                                           autocomplete="new-password" data-validate="new-password">
                                    <button type="button" class="password-toggle" data-target="registerPassword">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </div>
                                <div class="password-strength" id="passwordStrength">
                                    <div class="strength-bar">
                                        <div class="strength-fill" id="strengthFill"></div>
                                    </div>
                                    <div class="strength-text" id="strengthText">Şifre gücü: Zayıf</div>
                                </div>
                                <div class="form-feedback" id="registerPasswordFeedback"></div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label" for="confirmPassword">Şifre Tekrar *</label>
                                <div class="position-relative">
                                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    <input type="password" class="form-input" id="confirmPassword" name="confirm_password" 
                                           placeholder="Şifrenizi tekrar girin" required 
                                           autocomplete="new-password" data-validate="confirm-password">
                                    <button type="button" class="password-toggle" data-target="confirmPassword">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </div>
                                <div class="form-feedback" id="confirmPasswordFeedback"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Terms & Privacy -->
                    <div class="form-group">
                        <label class="remember-me">
                            <input type="checkbox" name="terms" id="termsAccept" required>
                            <span>
                                <a href="#" class="forgot-password">Kullanım Şartları</a> ve 
                                <a href="#" class="forgot-password">Gizlilik Politikası</a>'nı okudum, kabul ediyorum
                            </span>
                        </label>
                    </div>
                    
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="redirect" value="<?php echo htmlspecialchars($redirect); ?>">
                    
                    <button type="submit" class="auth-btn" id="registerBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <path d="M20 8v6"></path>
                            <path d="M23 11h-6"></path>
                        </svg>
                        <span>Hesap Oluştur</span>
                    </button>
                </form>
                
                <!-- Newsletter Signup Form -->
                <form class="auth-form <?php echo $action === 'subscribe' ? 'active' : ''; ?>" id="subscribeForm" data-form="subscribe">
                    <h2 class="form-title">E-Bülten Aboneliği</h2>
                    
                    <div class="newsletter-signup" style="margin-top: 0;">
                        <div class="newsletter-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2" style="display: inline;">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Özel Fırsatlardan Haberdar Olun
                        </div>
                        <p class="newsletter-text">
                            Yeni ürünler, kampanyalar ve özel indirimlerden ilk siz haberdar olun. 
                            Haftalık e-bültenimize ücretsiz abone olun.
                        </p>
                        
                        <div class="form-group">
                            <label class="form-label" for="subscribeEmail">E-posta Adresi *</label>
                            <div class="position-relative">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <input type="email" class="form-input" id="subscribeEmail" name="email" 
                                       placeholder="E-posta adresinizi girin" required 
                                       autocomplete="email" data-validate="email">
                            </div>
                            <div class="form-feedback" id="subscribeEmailFeedback"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="subscribeName">Ad Soyad (İsteğe bağlı)</label>
                            <div class="position-relative">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input type="text" class="form-input" id="subscribeName" name="name" 
                                       placeholder="Ad ve soyadınız" 
                                       autocomplete="name" data-validate="name">
                            </div>
                            <div class="form-feedback" id="subscribeNameFeedback"></div>
                        </div>
                        
                        <!-- Subscription Preferences -->
                        <div class="form-group">
                            <label class="form-label">Hangi konularda bilgilendirilmek istiyorsunuz?</label>
                            <div class="mt-2">
                                <label class="remember-me mb-2">
                                    <input type="checkbox" name="preferences[]" value="new_products" checked>
                                    <span>Yeni ürün duyuruları</span>
                                </label>
                                <label class="remember-me mb-2">
                                    <input type="checkbox" name="preferences[]" value="campaigns" checked>
                                    <span>Kampanya ve indirimler</span>
                                </label>
                                <label class="remember-me mb-2">
                                    <input type="checkbox" name="preferences[]" value="tips">
                                    <span>Oyun önerileri ve ipuçları</span>
                                </label>
                                <label class="remember-me">
                                    <input type="checkbox" name="preferences[]" value="events">
                                    <span>Etkinlik duyuruları</span>
                                </label>
                            </div>
                        </div>
                        
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        
                        <button type="submit" class="auth-btn" id="subscribeBtn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <span>Bültene Abone Ol</span>
                        </button>
                    </div>
                </form>
                
                <!-- Guest Checkout Option -->
                <?php if ($redirect && strpos($redirect, 'cart') !== false): ?>
                <div class="guest-checkout">
                    <p class="guest-checkout-text">Hesap oluşturmadan devam etmek mi istiyorsunuz?</p>
                    <a href="checkout.php?type=guest" class="guest-checkout-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <path d="M20 8v6"></path>
                            <path d="M23 11h-6"></path>
                        </svg>
                        Misafir Olarak Devam Et
                    </a>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </main>
    
    <!-- Forgot Password Modal -->
    <div class="modal fade forgot-password-modal" id="forgotPasswordModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Şifre Sıfırlama</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted mb-3">
                        E-posta adresinizi girin, şifre sıfırlama bağlantısını gönderelim.
                    </p>
                    
                    <form id="forgotPasswordForm">
                        <div class="form-group">
                            <label class="form-label" for="forgotEmail">E-posta Adresi</label>
                            <div class="position-relative">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <input type="email" class="form-input" id="forgotEmail" name="email" 
                                       placeholder="Kayıtlı e-posta adresiniz" required>
                            </div>
                        </div>
                        
                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                        
                        <button type="submit" class="auth-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <span>Sıfırlama Bağlantısı Gönder</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <?php echo $loader->loadComponent('footer', 'Public'); ?>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../components/js/component-loader.js"></script>
    <script src="js/main.js"></script>
    
    <script>
        // Global variables
        let currentTab = '<?php echo $action; ?>';
        let isLoading = false;
        
        // Initialize auth system
        document.addEventListener('DOMContentLoaded', function() {
            initializeAuth();
            updateCartCount();
        });
        
        // Initialize authentication system
        function initializeAuth() {
            setupTabSwitching();
            setupFormValidation();
            setupPasswordToggles();
            setupPasswordStrength();
            setupSocialLogin();
            
            // Auto-focus first input
            const activeForm = document.querySelector('.auth-form.active');
            if (activeForm) {
                const firstInput = activeForm.querySelector('.form-input');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 300);
                }
            }
        }
        
        // Tab switching functionality
        function setupTabSwitching() {
            const tabs = document.querySelectorAll('.auth-tab');
            const forms = document.querySelectorAll('.auth-form');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    if (isLoading) return;
                    
                    const targetTab = this.getAttribute('data-tab');
                    switchTab(targetTab);
                });
            });
            
            // Handle URL changes
            window.addEventListener('popstate', function(e) {
                if (e.state && e.state.tab) {
                    switchTab(e.state.tab, false);
                }
            });
        }
        
        // Switch between auth tabs
        function switchTab(tab, updateURL = true) {
            if (currentTab === tab) return;
            
            // Update tabs
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            const activeTab = document.querySelector(`[data-tab="${tab}"]`);
            const activeForm = document.querySelector(`[data-form="${tab}"]`);
            
            if (activeTab && activeForm) {
                activeTab.classList.add('active');
                
                // Animate form transition
                setTimeout(() => {
                    activeForm.classList.add('active');
                    
                    // Focus first input
                    const firstInput = activeForm.querySelector('.form-input');
                    if (firstInput) {
                        setTimeout(() => firstInput.focus(), 100);
                    }
                }, 150);
                
                currentTab = tab;
                
                // Update URL
                if (updateURL) {
                    const url = new URL(window.location);
                    url.searchParams.set('action', tab);
                    window.history.pushState({tab: tab}, '', url);
                }
                
                // Clear alerts
                hideAlerts();
            }
        }
        
        // Form validation setup
        function setupFormValidation() {
            const forms = document.querySelectorAll('.auth-form');
            
            forms.forEach(form => {
                const inputs = form.querySelectorAll('[data-validate]');
                
                inputs.forEach(input => {
                    input.addEventListener('input', function() {
                        validateField(this);
                    });
                    
                    input.addEventListener('blur', function() {
                        validateField(this);
                    });
                });
                
                form.addEventListener('submit', function(e) {
                    handleFormSubmit(e, this);
                });
            });
        }
        
        // Validate individual field
        function validateField(input) {
            const type = input.getAttribute('data-validate');
            const value = input.value.trim();
            const feedback = document.getElementById(input.id + 'Feedback');
            
            let isValid = true;
            let message = '';
            
            switch (type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    isValid = emailRegex.test(value);
                    message = isValid ? 'Geçerli e-posta adresi' : 'Geçerli bir e-posta adresi girin';
                    break;
                    
                case 'name':
                    isValid = value.length >= 2 && /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/.test(value);
                    message = isValid ? 'Geçerli isim' : 'En az 2 karakter, sadece harf';
                    break;
                    
                case 'phone':
                    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
                    isValid = !value || phoneRegex.test(value.replace(/\s/g, ''));
                    message = isValid ? 'Geçerli telefon numarası' : 'Geçerli bir telefon numarası girin';
                    break;
                    
                case 'password':
                    isValid = value.length >= 6;
                    message = isValid ? 'Şifre geçerli' : 'En az 6 karakter olmalı';
                    break;
                    
                case 'new-password':
                    const strength = calculatePasswordStrength(value);
                    isValid = strength.score >= 2;
                    message = isValid ? 'Şifre yeterince güçlü' : 'Daha güçlü bir şifre seçin';
                    updatePasswordStrength(value);
                    break;
                    
                case 'confirm-password':
                    const originalPassword = document.getElementById('registerPassword').value;
                    isValid = value === originalPassword && value.length > 0;
                    message = isValid ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor';
                    break;
            }
            
            // Update UI
            input.classList.remove('valid', 'invalid');
            input.classList.add(isValid ? 'valid' : 'invalid');
            
            if (feedback) {
                feedback.textContent = message;
                feedback.classList.remove('valid', 'invalid');
                feedback.classList.add(isValid ? 'valid' : 'invalid');
            }
            
            return isValid;
        }
        
        // Password toggle functionality
        function setupPasswordToggles() {
            const toggles = document.querySelectorAll('.password-toggle');
            
            toggles.forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    const input = document.getElementById(targetId);
                    const icon = this.querySelector('svg');
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.innerHTML = `
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        `;
                    } else {
                        input.type = 'password';
                        icon.innerHTML = `
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        `;
                    }
                });
            });
        }
        
        // Password strength functionality
        function setupPasswordStrength() {
            const passwordInput = document.getElementById('registerPassword');
            if (passwordInput) {
                passwordInput.addEventListener('input', function() {
                    updatePasswordStrength(this.value);
                });
            }
        }
        
        function calculatePasswordStrength(password) {
            let score = 0;
            let feedback = [];
            
            if (password.length >= 8) score += 1;
            else feedback.push('En az 8 karakter');
            
            if (/[a-z]/.test(password)) score += 1;
            else feedback.push('Küçük harf');
            
            if (/[A-Z]/.test(password)) score += 1;
            else feedback.push('Büyük harf');
            
            if (/[0-9]/.test(password)) score += 1;
            else feedback.push('Rakam');
            
            if (/[^A-Za-z0-9]/.test(password)) score += 1;
            else feedback.push('Özel karakter');
            
            return { score, feedback };
        }
        
        function updatePasswordStrength(password) {
            const strengthContainer = document.getElementById('passwordStrength');
            const strengthFill = document.getElementById('strengthFill');
            const strengthText = document.getElementById('strengthText');
            
            if (!password) {
                strengthContainer.style.display = 'none';
                return;
            }
            
            strengthContainer.style.display = 'block';
            
            const result = calculatePasswordStrength(password);
            const percentage = (result.score / 5) * 100;
            
            strengthFill.style.width = percentage + '%';
            
            let strengthClass = '';
            let strengthLabel = '';
            
            if (result.score <= 2) {
                strengthClass = 'strength-weak';
                strengthLabel = 'Zayıf';
            } else if (result.score <= 3) {
                strengthClass = 'strength-medium';
                strengthLabel = 'Orta';
            } else {
                strengthClass = 'strength-strong';
                strengthLabel = 'Güçlü';
            }
            
            strengthFill.className = 'strength-fill ' + strengthClass;
            strengthText.textContent = `Şifre gücü: ${strengthLabel}`;
            
            if (result.feedback.length > 0) {
                strengthText.textContent += ` (Eksik: ${result.feedback.join(', ')})`;
            }
        }
        
        // Social login setup
        function setupSocialLogin() {
            window.socialLogin = function(provider) {
                showLoading();
                
                // Simulate social login (replace with actual implementation)
                setTimeout(() => {
                    hideLoading();
                    showAlert('success', `${provider.charAt(0).toUpperCase() + provider.slice(1)} ile giriş özelliği yakında aktif olacak!`);
                }, 1500);
            };
        }
        
        // Handle form submissions
        function handleFormSubmit(e, form) {
            e.preventDefault();
            
            if (isLoading) return;
            
            const formData = new FormData(form);
            const formType = form.getAttribute('data-form');
            
            // Validate form
            const inputs = form.querySelectorAll('[data-validate]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            // Check required checkboxes
            if (formType === 'register') {
                const termsAccept = document.getElementById('termsAccept');
                if (!termsAccept.checked) {
                    showAlert('error', 'Kullanım şartlarını kabul etmelisiniz');
                    return;
                }
            }
            
            if (!isValid) {
                showAlert('error', 'Lütfen tüm alanları doğru şekilde doldurun');
                return;
            }
            
            // Submit form
            submitForm(formType, formData);
        }
        
        // Submit form via API
        async function submitForm(type, formData) {
            showLoading();
            hideAlerts();
            
            try {
                const data = Object.fromEntries(formData);
                data.action = type;
                
                let endpoint = '';
                switch (type) {
                    case 'login':
                    case 'register':
                        endpoint = '../backend/api/users.php';
                        break;
                    case 'subscribe':
                        endpoint = '../backend/api/newsletter.php';
                        break;
                    default:
                        throw new Error('Invalid form type');
                }
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    handleSuccessResponse(type, result, data);
                } else {
                    throw new Error(result.message || result.error || 'İşlem başarısız');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                showAlert('error', error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                hideLoading();
            }
        }
        
        // Handle successful responses
        function handleSuccessResponse(type, result, data) {
            switch (type) {
                case 'login':
                    showAlert('success', 'Giriş başarılı! Yönlendiriliyorsunuz...');
                    
                    // Store user data if provided
                    if (result.user) {
                        localStorage.setItem('user', JSON.stringify(result.user));
                    }
                    
                    // Redirect after delay
                    setTimeout(() => {
                        const redirect = data.redirect || 'account.php';
                        window.location.href = redirect;
                    }, 1500);
                    break;
                    
                case 'register':
                    showAlert('success', 'Kayıt başarılı! Hoş geldiniz. Yönlendiriliyorsunuz...');
                    
                    // Store user data if provided
                    if (result.user) {
                        localStorage.setItem('user', JSON.stringify(result.user));
                    }
                    
                    // Redirect after delay
                    setTimeout(() => {
                        const redirect = data.redirect || 'account.php';
                        window.location.href = redirect;
                    }, 1500);
                    break;
                    
                case 'subscribe':
                    showAlert('success', 'E-bülten aboneliğiniz başarıyla oluşturuldu! Teşekkürler.');
                    
                    // Reset form
                    document.getElementById('subscribeForm').reset();
                    break;
                    
                default:
                    showAlert('success', 'İşlem başarıyla tamamlandı!');
            }
        }
        
        // Forgot password form handling
        document.getElementById('forgotPasswordForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (isLoading) return;
            
            const formData = new FormData(this);
            const email = formData.get('email');
            
            if (!email) {
                showAlert('error', 'E-posta adresi gerekli');
                return;
            }
            
            showLoading();
            
            try {
                const response = await fetch('../backend/api/users.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'forgot_password',
                        email: email,
                        csrf_token: formData.get('csrf_token')
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert('success', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
                    
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                    modal.hide();
                    
                    // Reset form
                    this.reset();
                } else {
                    throw new Error(result.message || 'Şifre sıfırlama başarısız');
                }
                
            } catch (error) {
                console.error('Forgot password error:', error);
                showAlert('error', error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                hideLoading();
            }
        });
        
        // Utility functions
        function showLoading() {
            isLoading = true;
            const buttons = document.querySelectorAll('.auth-btn');
            
            buttons.forEach(btn => {
                if (!btn.disabled) {
                    const span = btn.querySelector('span');
                    const originalText = span ? span.textContent : btn.textContent;
                    
                    btn.setAttribute('data-original-text', originalText);
                    btn.classList.add('loading');
                    btn.disabled = true;
                    
                    btn.innerHTML = `
                        <div class="loading-spinner"></div>
                        <span>İşleniyor...</span>
                    `;
                }
            });
        }
        
        function hideLoading() {
            isLoading = false;
            const buttons = document.querySelectorAll('.auth-btn.loading');
            
            buttons.forEach(btn => {
                const originalText = btn.getAttribute('data-original-text');
                const icon = btn.getAttribute('data-form') === 'login' ? 
                    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10,17 15,12 10,7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>` : 
                    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <path d="M20 8v6"></path>
                        <path d="M23 11h-6"></path>
                    </svg>`;
                
                btn.classList.remove('loading');
                btn.disabled = false;
                btn.innerHTML = `${icon}<span>${originalText}</span>`;
            });
        }
        
        function showAlert(type, message) {
            hideAlerts();
            
            const alertId = type === 'success' ? 'successAlert' : 'errorAlert';
            const messageId = type === 'success' ? 'successMessage' : 'errorMessage';
            
            const alert = document.getElementById(alertId);
            const messageEl = document.getElementById(messageId);
            
            messageEl.textContent = message;
            alert.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                alert.classList.remove('show');
            }, 5000);
        }
        
        function hideAlerts() {
            document.querySelectorAll('.alert-custom').forEach(alert => {
                alert.classList.remove('show');
            });
        }
        
        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCountElements = document.querySelectorAll('#cart-count, [data-cart-count]');
            cartCountElements.forEach(el => el.textContent = totalItems);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideAlerts();
            }
            
            if (e.key === 'Enter' && e.target.classList.contains('form-input')) {
                const form = e.target.closest('.auth-form');
                if (form && form.classList.contains('active')) {
                    const submitBtn = form.querySelector('.auth-btn');
                    if (submitBtn && !submitBtn.disabled) {
                        submitBtn.click();
                    }
                }
            }
        });
    </script>
</body>
</html>