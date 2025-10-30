<?php
require_once __DIR__ . '/../components/ComponentLoader.php';
$componentLoader = new ComponentLoader();

// Sayfa meta bilgileri
$pageTitle = "İletişim | Gürbüz Oyuncak";
$pageDescription = "Gürbüz Oyuncak ile iletişime geçin. Telefon, e-posta, WhatsApp ile 7/24 destek. Sorularınız için buradayız.";
$canonicalUrl = "https://gurbuzoyuncak.com/contact";
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="keywords" content="gürbüz oyuncak iletişim, oyuncak mağazası telefon, antalya oyuncak, müşteri hizmetleri">
    <title><?php echo $pageTitle; ?></title>
    
    <!-- Canonical URL -->
    <link rel="canonical" href="<?php echo $canonicalUrl; ?>">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="images/favicon.png">
    <link rel="apple-touch-icon" href="images/favicon.png">
    
    <!-- Open Graph -->
    <meta property="og:title" content="<?php echo $pageTitle; ?>">
    <meta property="og:description" content="<?php echo $pageDescription; ?>">
    <meta property="og:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://gurbuzoyuncak.com/images/og-contact.jpg">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo $pageTitle; ?>">
    <meta name="twitter:description" content="<?php echo $pageDescription; ?>">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <!-- Custom CSS -->
    <style>
        :root {
            --primary-color: #2563eb;
            --primary-light: #dbeafe;
            --primary-dark: #1d4ed8;
            --secondary-color: #64748b;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
            --light-gray: #f8fafc;
            --border-color: #e2e8f0;
            --text-color: #1e293b;
            --text-muted: #64748b;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            --radius-sm: 0.375rem;
            --radius-md: 0.5rem;
            --radius-lg: 0.75rem;
            --radius-xl: 1rem;
            --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #f8fafc;
            color: var(--text-color);
            line-height: 1.6;
        }
        
        /* Page Header */
        .page-hero {
            background: linear-gradient(135deg, var(--primary-color) 0%, #3b82f6 100%);
            color: white;
            padding: 4rem 0 3rem;
            position: relative;
            overflow: hidden;
        }
        
        .page-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="20" fill="url(%23grid)"/></svg>');
            opacity: 0.5;
        }
        
        .hero-content {
            position: relative;
            z-index: 2;
            text-align: center;
        }
        
        .hero-title {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ffffff, #e0f2fe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .hero-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .hero-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .hero-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: var(--radius-lg);
            font-weight: 600;
            transition: var(--transition);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            min-height: 48px;
        }
        
        .hero-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            color: white;
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .hero-btn.primary {
            background: white;
            color: var(--primary-color);
        }
        
        .hero-btn.primary:hover {
            background: #f8fafc;
            color: var(--primary-color);
        }
        
        /* Contact Layout */
        .contact-section {
            padding: 4rem 0;
        }
        
        .contact-container {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 3rem;
            align-items: start;
        }
        
        /* Contact Info */
        .contact-info {
            background: white;
            border-radius: var(--radius-xl);
            padding: 2.5rem;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            position: sticky;
            top: 100px;
        }
        
        .contact-info h2 {
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 2rem;
            color: var(--text-color);
        }
        
        .info-item {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
            transition: var(--transition);
        }
        
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .info-item:hover {
            transform: translateX(4px);
        }
        
        .info-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, var(--primary-color), #3b82f6);
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            box-shadow: var(--shadow-md);
        }
        
        .info-content h3 {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--text-color);
        }
        
        .info-content p {
            color: var(--text-muted);
            margin: 0.5rem 0;
            font-size: 0.875rem;
        }
        
        .info-content a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .info-content a:hover {
            color: var(--primary-dark);
        }
        
        .working-hours {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: var(--light-gray);
            border-radius: var(--radius-sm);
            display: inline-block;
        }
        
        /* Contact Form */
        .contact-form {
            background: white;
            border-radius: var(--radius-xl);
            padding: 2.5rem;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
        }
        
        .form-header {
            margin-bottom: 2rem;
        }
        
        .form-title {
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }
        
        .form-description {
            color: var(--text-muted);
            font-size: 0.875rem;
        }
        
        .form-grid {
            display: grid;
            gap: 1.5rem;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--text-color);
            font-size: 0.875rem;
        }
        
        .form-label.required::after {
            content: ' *';
            color: var(--danger-color);
        }
        
        .form-control {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 1rem;
            font-family: inherit;
            transition: var(--transition);
            background: white;
            min-height: 48px;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .form-control.is-invalid {
            border-color: var(--danger-color);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .form-control.is-valid {
            border-color: var(--success-color);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        .form-control::placeholder {
            color: #9ca3af;
        }
        
        .form-textarea {
            resize: vertical;
            min-height: 120px;
        }
        
        .form-feedback {
            font-size: 0.75rem;
            margin-top: 0.5rem;
        }
        
        .invalid-feedback {
            color: var(--danger-color);
        }
        
        .valid-feedback {
            color: var(--success-color);
        }
        
        /* File Upload */
        .file-upload {
            position: relative;
            display: inline-block;
            width: 100%;
        }
        
        .file-input {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        .file-label {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1rem;
            border: 2px dashed var(--border-color);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: var(--transition);
            background: #fafbfc;
            min-height: 48px;
        }
        
        .file-label:hover {
            border-color: var(--primary-color);
            background: var(--primary-light);
        }
        
        .file-label.has-file {
            border-color: var(--success-color);
            background: #f0fdfa;
        }
        
        .file-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-muted);
        }
        
        .file-name {
            color: var(--text-color);
            font-weight: 500;
        }
        
        /* Alert Messages */
        .alert {
            padding: 1rem 1.25rem;
            border-radius: var(--radius-md);
            margin-bottom: 1.5rem;
            border: 1px solid transparent;
            display: none;
        }
        
        .alert.show {
            display: block;
            animation: slideDown 0.3s ease-out;
        }
        
        .alert-success {
            background: #f0fdfa;
            color: #065f46;
            border-color: #a7f3d0;
        }
        
        .alert-error {
            background: #fef2f2;
            color: #991b1b;
            border-color: #fecaca;
        }
        
        .alert-warning {
            background: #fefbf0;
            color: #92400e;
            border-color: #fed7aa;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            border: none;
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            transition: var(--transition);
            cursor: pointer;
            text-align: center;
            min-height: 48px;
            justify-content: center;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
        
        .btn-primary:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-full {
            width: 100%;
        }
        
        .btn-loading {
            position: relative;
            color: transparent;
        }
        
        .btn-loading::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            top: 50%;
            left: 50%;
            margin-left: -10px;
            margin-top: -10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Map Section */
        .map-section {
            padding: 3rem 0;
        }
        
        .map-container {
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            position: relative;
        }
        
        .map-container iframe {
            width: 100%;
            height: 500px;
            border: none;
        }
        
        /* FAQ Section */
        .faq-section {
            padding: 4rem 0;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .faq-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .faq-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-color);
        }
        
        .faq-description {
            color: var(--text-muted);
            font-size: 1.125rem;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .faq-container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .faq-item {
            background: white;
            border-radius: var(--radius-lg);
            margin-bottom: 1rem;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
            overflow: hidden;
            transition: var(--transition);
        }
        
        .faq-item:hover {
            box-shadow: var(--shadow-md);
        }
        
        .faq-item.active {
            box-shadow: var(--shadow-md);
            border-color: var(--primary-color);
        }
        
        .faq-question {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            cursor: pointer;
            font-weight: 600;
            font-size: 1.125rem;
            transition: var(--transition);
            min-height: 60px;
        }
        
        .faq-question:hover {
            background: var(--light-gray);
        }
        
        .faq-item.active .faq-question {
            background: var(--primary-light);
            color: var(--primary-color);
        }
        
        .faq-icon {
            width: 24px;
            height: 24px;
            transition: transform 0.3s ease;
            color: var(--text-muted);
        }
        
        .faq-item.active .faq-icon {
            transform: rotate(180deg);
            color: var(--primary-color);
        }
        
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, padding 0.3s ease;
        }
        
        .faq-item.active .faq-answer {
            max-height: 500px;
            padding: 0 1.5rem 1.5rem;
        }
        
        .faq-answer p {
            color: var(--text-muted);
            line-height: 1.7;
            margin: 0;
        }
        
        /* Live Chat */
        .chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        .chat-button {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #25d366, #128c7e);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: var(--shadow-lg);
            cursor: pointer;
            transition: var(--transition);
            border: none;
        }
        
        .chat-button:hover {
            transform: scale(1.1);
            box-shadow: var(--shadow-xl);
        }
        
        .chat-modal {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 320px;
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--border-color);
            display: none;
            z-index: 1001;
        }
        
        .chat-modal.show {
            display: block;
            animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .chat-header {
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #25d366, #128c7e);
            color: white;
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }
        
        .chat-header h4 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
        }
        
        .chat-status {
            font-size: 0.75rem;
            opacity: 0.9;
            margin-top: 0.25rem;
        }
        
        .chat-content {
            padding: 1.5rem;
        }
        
        .chat-content p {
            margin-bottom: 1rem;
            color: var(--text-muted);
            font-size: 0.875rem;
            line-height: 1.6;
        }
        
        .chat-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .chat-btn {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            background: white;
            color: var(--text-color);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .chat-btn.primary {
            background: #25d366;
            color: white;
            border-color: #25d366;
        }
        
        .chat-btn:hover {
            background: var(--light-gray);
        }
        
        .chat-btn.primary:hover {
            background: #128c7e;
        }
        
        /* Mobile Responsive */
        @media (max-width: 992px) {
            .contact-container {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .contact-info {
                position: static;
                order: 2;
            }
            
            .contact-form {
                order: 1;
            }
        }
        
        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.5rem;
            }
            
            .hero-subtitle {
                font-size: 1.125rem;
            }
            
            .hero-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .hero-btn {
                width: 100%;
                max-width: 300px;
                justify-content: center;
            }
            
            .contact-section {
                padding: 2rem 0;
            }
            
            .contact-info,
            .contact-form {
                padding: 1.5rem;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .faq-title {
                font-size: 2rem;
            }
            
            .faq-description {
                font-size: 1rem;
            }
            
            .faq-question {
                font-size: 1rem;
                padding: 1rem;
            }
            
            .info-item {
                gap: 1rem;
            }
            
            .info-icon {
                width: 48px;
                height: 48px;
            }
            
            .chat-modal {
                right: 10px;
                left: 10px;
                width: auto;
                bottom: 80px;
            }
        }
        
        @media (max-width: 576px) {
            .hero-title {
                font-size: 2rem;
            }
            
            .contact-info,
            .contact-form {
                padding: 1rem;
            }
            
            .btn {
                padding: 1rem;
                font-size: 1rem;
            }
        }
        
        /* Touch Optimizations */
        @media (hover: none) and (pointer: coarse) {
            .info-item:hover {
                transform: none;
            }
            
            .faq-question:hover {
                background: none;
            }
            
            .btn:hover {
                transform: none;
                box-shadow: var(--shadow-sm);
            }
        }
        
        /* Swipe Gestures for FAQ */
        .faq-item {
            position: relative;
            overflow: hidden;
        }
        
        .faq-swipe-indicator {
            position: absolute;
            right: -100px;
            top: 50%;
            transform: translateY(-50%);
            background: var(--success-color);
            color: white;
            padding: 0.5rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            transition: var(--transition);
        }
        
        .faq-item.swiping .faq-swipe-indicator {
            right: 10px;
        }
        
        /* Utility Classes */
        .text-center { text-align: center; }
        .text-muted { color: var(--text-muted); }
        .mb-0 { margin-bottom: 0; }
        .mb-1 { margin-bottom: 0.5rem; }
        .mb-2 { margin-bottom: 1rem; }
        .mb-3 { margin-bottom: 1.5rem; }
        .mt-2 { margin-top: 1rem; }
        .d-none { display: none; }
        .d-block { display: block; }
        .d-flex { display: flex; }
        .align-items-center { align-items: center; }
        .justify-content-between { justify-content: space-between; }
        .gap-2 { gap: 1rem; }
    </style>
</head>
<body>
    <!-- Navbar Component -->
    <?php echo $componentLoader->loadComponent('navbar', ['variant' => 'public']); ?>

    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">İletişime Geçin</h1>
                <p class="hero-subtitle">Sorularınız için buradayız, size yardımcı olmaktan mutluluk duyarız. 7/24 destek ekibimizle iletişime geçebilirsiniz.</p>
                
                <div class="hero-actions">
                    <a href="tel:02424000000" class="hero-btn primary">
                        <i data-lucide="phone" width="20" height="20"></i>
                        Hemen Ara
                    </a>
                    <a href="https://wa.me/905551234567" class="hero-btn" target="_blank">
                        <i data-lucide="message-circle" width="20" height="20"></i>
                        WhatsApp
                    </a>
                    <a href="mailto:info@gurbuzoyuncak.com" class="hero-btn">
                        <i data-lucide="mail" width="20" height="20"></i>
                        E-posta Gönder
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
        <div class="container">
            <div class="contact-container">
                <!-- Contact Form -->
                <div class="contact-form">
                    <div class="form-header">
                        <h2 class="form-title">Mesaj Gönderiniz</h2>
                        <p class="form-description">Aşağıdaki formu doldurarak bizimle iletişime geçebilirsiniz. En kısa sürede size geri dönüş yapacağız.</p>
                    </div>
                    
                    <!-- Success/Error Messages -->
                    <div id="success-alert" class="alert alert-success">
                        <div class="d-flex align-items-center gap-2">
                            <i data-lucide="check-circle" width="20" height="20"></i>
                            <span>Mesajınız başarıyla gönderildi! En kısa sürede size geri dönüş yapacağız.</span>
                        </div>
                    </div>
                    
                    <div id="error-alert" class="alert alert-error">
                        <div class="d-flex align-items-center gap-2">
                            <i data-lucide="alert-circle" width="20" height="20"></i>
                            <span id="error-message">Bir hata oluştu. Lütfen tekrar deneyin.</span>
                        </div>
                    </div>
                    
                    <form id="contact-form" onsubmit="handleFormSubmit(event)" enctype="multipart/form-data">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Ad</label>
                                <input type="text" class="form-control" name="first_name" required>
                                <div class="invalid-feedback"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">Soyad</label>
                                <input type="text" class="form-control" name="last_name" required>
                                <div class="invalid-feedback"></div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">E-posta</label>
                                <input type="email" class="form-control" name="email" required>
                                <div class="invalid-feedback"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Telefon</label>
                                <input type="tel" class="form-control" name="phone" placeholder="0555 123 45 67">
                                <div class="invalid-feedback"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">Konu</label>
                            <select class="form-control" name="subject" required>
                                <option value="">Lütfen seçiniz</option>
                                <option value="general">Genel Bilgi</option>
                                <option value="order">Sipariş Hakkında</option>
                                <option value="product">Ürün Sorunu</option>
                                <option value="return">İade/İptal</option>
                                <option value="complaint">Öneri/Şikayet</option>
                                <option value="technical">Teknik Destek</option>
                                <option value="partnership">İş Ortaklığı</option>
                                <option value="other">Diğer</option>
                            </select>
                            <div class="invalid-feedback"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">Mesajınız</label>
                            <textarea class="form-control form-textarea" name="message" rows="6" placeholder="Mesajınızı buraya yazın..." required></textarea>
                            <div class="invalid-feedback"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Dosya Ekle</label>
                            <div class="file-upload">
                                <input type="file" id="file-input" class="file-input" name="attachment" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" multiple>
                                <label for="file-input" class="file-label">
                                    <div class="file-info">
                                        <i data-lucide="paperclip" width="20" height="20"></i>
                                        <span id="file-text">Dosya seçin (isteğe bağlı)</span>
                                    </div>
                                    <i data-lucide="upload" width="20" height="20"></i>
                                </label>
                            </div>
                            <small class="text-muted">Maksimum 5 dosya, her biri en fazla 5MB olabilir. Desteklenen formatlar: JPG, PNG, PDF, DOC, DOCX</small>
                        </div>
                        
                        <div class="form-group mb-0">
                            <button type="submit" class="btn btn-primary btn-full" id="submit-btn">
                                <i data-lucide="send" width="20" height="20"></i>
                                <span>Mesajı Gönder</span>
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Contact Info -->
                <div class="contact-info">
                    <h2>İletişim Bilgileri</h2>
                    
                    <div class="info-item">
                        <div class="info-icon">
                            <i data-lucide="phone" width="24" height="24"></i>
                        </div>
                        <div class="info-content">
                            <h3>Telefon</h3>
                            <p><a href="tel:02424000000">0242 400 00 00</a></p>
                            <p><a href="tel:05551234567">0555 123 45 67</a></p>
                            <div class="working-hours">Pazartesi - Cumartesi: 09:00 - 18:00</div>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-icon">
                            <i data-lucide="mail" width="24" height="24"></i>
                        </div>
                        <div class="info-content">
                            <h3>E-posta</h3>
                            <p><a href="mailto:info@gurbuzoyuncak.com">info@gurbuzoyuncak.com</a></p>
                            <p><a href="mailto:destek@gurbuzoyuncak.com">destek@gurbuzoyuncak.com</a></p>
                            <div class="working-hours">24 saat içinde yanıt veriyoruz</div>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-icon">
                            <i data-lucide="map-pin" width="24" height="24"></i>
                        </div>
                        <div class="info-content">
                            <h3>Adres</h3>
                            <p>Güzeloba Mahallesi<br>
                            Çağlayangil Caddesi No:1234<br>
                            Muratpaşa / Antalya</p>
                            <div class="working-hours">Mağaza Çalışma Saatleri: 10:00 - 20:00</div>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-icon">
                            <i data-lucide="message-circle" width="24" height="24"></i>
                        </div>
                        <div class="info-content">
                            <h3>WhatsApp Destek</h3>
                            <p><a href="https://wa.me/905551234567?text=Merhaba,%20Gürbüz%20Oyuncak%20hakkında%20bilgi%20almak%20istiyorum." target="_blank">0555 123 45 67</a></p>
                            <div class="working-hours">Hızlı destek için WhatsApp'tan yazın</div>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-icon">
                            <i data-lucide="clock" width="24" height="24"></i>
                        </div>
                        <div class="info-content">
                            <h3>Çalışma Saatleri</h3>
                            <p><strong>Hafta İçi:</strong> 09:00 - 18:00<br>
                            <strong>Cumartesi:</strong> 10:00 - 17:00<br>
                            <strong>Pazar:</strong> Kapalı</p>
                            <div class="working-hours">Online destek 7/24 aktif</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Map Section -->
    <section class="map-section">
        <div class="container">
            <h2 class="text-center mb-3">Konumumuz</h2>
            <p class="text-center text-muted mb-4">Antalya Güzeloba'da bulunan mağazamıza kolayca ulaşabilirsiniz</p>
            
            <div class="map-container">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.6260774080283!2d30.741897115436686!3d36.87892707993686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c391eb7a289b17%3A0x945da700e3a9f1db!2zR8O8emVsb2JhLCBNdXJhdHBhxZ9hL0FudGFseWE!5e0!3m2!1str!2str!4v1635123456789"
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade"
                    title="Gürbüz Oyuncak Konum">
                </iframe>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
        <div class="container">
            <div class="faq-header">
                <h2 class="faq-title">Sıkça Sorulan Sorular</h2>
                <p class="faq-description">En çok merak edilen sorular ve yanıtları. Aradığınızı bulamazsanız bizimle iletişime geçin.</p>
            </div>
            
            <div class="faq-container">
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span>Kargo ücreti ne kadar?</span>
                        <i data-lucide="chevron-down" class="faq-icon" width="24" height="24"></i>
                    </div>
                    <div class="faq-answer">
                        <p>500 TL ve üzeri siparişlerde kargo ücretsizdir. 500 TL altı siparişlerde kargo ücreti 29.90 TL'dir. Hızlı kargo seçeneği de mevcuttur (ek ücret karşılığında).</p>
                    </div>
                </div>
                
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span>Siparişim ne zaman kargoya verilir?</span>
                        <i data-lucide="chevron-down" class="faq-icon" width="24" height="24"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Stoklu ürünlerde siparişleriniz aynı gün kargoya verilir (15:00'e kadar verilen siparişler için). Stokta olmayan ürünlerde 1-3 iş günü içerisinde tedarik edilip kargoya verilir.</p>
                    </div>
                </div>
                
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span>İade nasıl yapılır?</span>
                        <i data-lucide="chevron-down" class="faq-icon" width="24" height="24"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Ürünü teslim aldıktan sonra 14 gün içerisinde iade edebilirsiniz. İade edilecek ürünler kullanılmamış, ambalajı açılmamış ve hasarsız olmalıdır. Hesabım sayfasından iade talebi oluşturabilir veya müşteri hizmetlerimizi arayabilirsiniz.</p>
                    </div>
                </div>
                
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span>Ürünler garantili mi?</span>
                        <i data-lucide="chevron-down" class="faq-icon" width="24" height="24"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Tüm ürünlerimiz minimum 2 yıl satıcı garantisi ile gönderilmektedir. Üretici garantisi olan ürünlerde ise üretici garantisi geçerlidir. Garanti kapsamında tüm teknik sorunlar ücretsiz çözülür.</p>
                    </div>
                </div>
                
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span>Ödeme seçenekleri nelerdir?</span>
                        <i data-lucide="chevron-down" class="faq-icon" width="24" height="24"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçenekleri mevcuttur. Tüm kartlarda 3D Secure güvenlik sistemi kullanılmaktadır. Taksit seçenekleri için kredi kartınızın limitini kontrol edebilirsiniz.</p>
                    </div>
                </div>
                
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span>Toptan alım yapabilir miyim?</span>
                        <i data-lucide="chevron-down" class="faq-icon" width="24" height="24"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Evet, toptan alımlar için özel fiyatlarımız bulunmaktadır. Minimum 10 adet veya 1000 TL üzeri siparişlerde toptan fiyat geçerlidir. Detaylar için satış temsilcilerimizle iletişime geçebilirsiniz.</p>
                    </div>
                </div>
                
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span>Hangi yaş grupları için ürün var?</span>
                        <i data-lucide="chevron-down" class="faq-icon" width="24" height="24"></i>
                    </div>
                    <div class="faq-answer">
                        <p>0-3 yaş bebek oyuncakları, 3-6 yaş okul öncesi, 6-12 yaş ilkokul ve 12+ yaş ergenlere kadar geniş bir yaş aralığında ürünlerimiz bulunmaktadır. Her ürünün detay sayfasında uygun yaş aralığı belirtilmiştir.</p>
                    </div>
                </div>
                
                <div class="faq-item" onclick="toggleFaq(this)">
                    <div class="faq-question">
                        <span>Ürün güvenlik sertifikaları var mı?</span>
                        <i data-lucide="chevron-down" class="faq-icon" width="24" height="24"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Tüm ürünlerimiz CE, TSE ve ilgili güvenlik standartlarına uygun olarak üretilmiştir. Özellikle 0-3 yaş grubu oyuncaklarında EN 71 standardına uygunluk zorunludur ve tüm ürünlerimizde mevcuttur.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Live Chat Widget -->
    <div class="chat-widget">
        <button class="chat-button" onclick="toggleChat()">
            <i data-lucide="message-circle" width="24" height="24"></i>
        </button>
        
        <div class="chat-modal" id="chat-modal">
            <div class="chat-header">
                <h4>Canlı Destek</h4>
                <div class="chat-status">
                    <i data-lucide="circle" width="8" height="8" style="fill: #4ade80; color: #4ade80;"></i>
                    Online - Ortalama yanıt süresi: 2 dakika
                </div>
            </div>
            <div class="chat-content">
                <p>Merhaba! Size nasıl yardımcı olabiliriz?</p>
                <p>Hızlı çözüm için aşağıdaki seçeneklerden birini kullanabilirsiniz:</p>
                
                <div class="chat-actions">
                    <button class="chat-btn primary" onclick="openWhatsApp()">
                        WhatsApp
                    </button>
                    <button class="chat-btn" onclick="callSupport()">
                        Ara
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer Component -->
    <?php echo $componentLoader->loadComponent('footer'); ?>

    <!-- Bootstrap 5.3.2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Component Loader JS -->
    <script src="../components/js/component-loader.js"></script>
    
    <!-- Main Script -->
    <script>
        // Contact Form Management System
        class ContactManager {
            constructor() {
                this.form = document.getElementById('contact-form');
                this.submitBtn = document.getElementById('submit-btn');
                this.fileInput = document.getElementById('file-input');
                this.fileText = document.getElementById('file-text');
                this.selectedFiles = [];
                
                this.init();
            }
            
            init() {
                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                
                this.setupFormValidation();
                this.setupFileUpload();
                this.setupSwipeGestures();
                
                // Auto-hide alerts
                this.autoHideAlerts();
            }
            
            setupFormValidation() {
                // Real-time validation
                this.form.querySelectorAll('.form-control').forEach(field => {
                    field.addEventListener('blur', (e) => {
                        this.validateField(e.target);
                    });
                    
                    field.addEventListener('input', (e) => {
                        if (field.classList.contains('is-invalid')) {
                            this.validateField(e.target);
                        }
                    });
                });
                
                // Phone number formatting
                const phoneField = this.form.querySelector('input[name="phone"]');
                if (phoneField) {
                    phoneField.addEventListener('input', (e) => {
                        this.formatPhoneNumber(e.target);
                    });
                }
            }
            
            validateField(field) {
                const value = field.value.trim();
                let isValid = true;
                let message = '';
                
                // Required field check
                if (field.required && !value) {
                    isValid = false;
                    message = 'Bu alan zorunludur';
                } else {
                    // Specific validations
                    switch (field.type) {
                        case 'email':
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            isValid = emailRegex.test(value);
                            message = isValid ? '' : 'Geçerli bir e-posta adresi girin';
                            break;
                        case 'tel':
                            if (value) {
                                const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
                                isValid = phoneRegex.test(value);
                                message = isValid ? '' : 'Geçerli bir telefon numarası girin';
                            }
                            break;
                        default:
                            if (field.name === 'first_name' || field.name === 'last_name') {
                                isValid = value.length >= 2;
                                message = isValid ? '' : 'En az 2 karakter olmalıdır';
                            } else if (field.name === 'message') {
                                isValid = value.length >= 10;
                                message = isValid ? '' : 'Mesajınız en az 10 karakter olmalıdır';
                            }
                    }
                }
                
                // Update field state
                field.classList.toggle('is-valid', isValid && value.length > 0);
                field.classList.toggle('is-invalid', !isValid);
                
                // Update feedback message
                const feedback = field.parentNode.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = message;
                }
                
                return isValid;
            }
            
            formatPhoneNumber(field) {
                let value = field.value.replace(/[^\d]/g, '');
                
                if (value.length > 0) {
                    if (value.startsWith('90')) {
                        value = value.substring(2);
                    }
                    if (value.startsWith('0')) {
                        value = value.substring(1);
                    }
                    
                    // Format as (0XXX) XXX XX XX
                    if (value.length >= 10) {
                        value = `0${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6, 8)} ${value.substring(8, 10)}`;
                    } else if (value.length >= 7) {
                        value = `0${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6)}`;
                    } else if (value.length >= 4) {
                        value = `0${value.substring(0, 3)} ${value.substring(3)}`;
                    } else if (value.length > 0) {
                        value = `0${value}`;
                    }
                }
                
                field.value = value;
            }
            
            setupFileUpload() {
                this.fileInput.addEventListener('change', (e) => {
                    this.handleFileSelection(e.target.files);
                });
                
                // Drag and drop support
                const fileLabel = document.querySelector('.file-label');
                
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    fileLabel.addEventListener(eventName, this.preventDefaults);
                });
                
                ['dragenter', 'dragover'].forEach(eventName => {
                    fileLabel.addEventListener(eventName, () => {
                        fileLabel.classList.add('drag-over');
                    });
                });
                
                ['dragleave', 'drop'].forEach(eventName => {
                    fileLabel.addEventListener(eventName, () => {
                        fileLabel.classList.remove('drag-over');
                    });
                });
                
                fileLabel.addEventListener('drop', (e) => {
                    const files = e.dataTransfer.files;
                    this.handleFileSelection(files);
                });
            }
            
            preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            handleFileSelection(files) {
                const maxFiles = 5;
                const maxSize = 5 * 1024 * 1024; // 5MB
                const allowedTypes = [
                    'image/jpeg', 'image/jpg', 'image/png',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];
                
                let validFiles = [];
                let errors = [];
                
                Array.from(files).forEach(file => {
                    if (validFiles.length >= maxFiles) {
                        errors.push(`En fazla ${maxFiles} dosya seçebilirsiniz`);
                        return;
                    }
                    
                    if (file.size > maxSize) {
                        errors.push(`${file.name} çok büyük (max 5MB)`);
                        return;
                    }
                    
                    if (!allowedTypes.includes(file.type)) {
                        errors.push(`${file.name} desteklenmeyen format`);
                        return;
                    }
                    
                    validFiles.push(file);
                });
                
                if (errors.length > 0) {
                    this.showAlert(errors.join(', '), 'error');
                }
                
                this.selectedFiles = validFiles;
                this.updateFileDisplay();
            }
            
            updateFileDisplay() {
                const fileLabel = document.querySelector('.file-label');
                
                if (this.selectedFiles.length > 0) {
                    fileLabel.classList.add('has-file');
                    const fileNames = this.selectedFiles.map(f => f.name).join(', ');
                    this.fileText.innerHTML = `
                        <span class="file-name">${this.selectedFiles.length} dosya seçildi</span>
                        <small style="display: block; margin-top: 0.25rem;">${fileNames}</small>
                    `;
                } else {
                    fileLabel.classList.remove('has-file');
                    this.fileText.textContent = 'Dosya seçin (isteğe bağlı)';
                }
            }
            
            setupSwipeGestures() {
                if ('ontouchstart' in window) {
                    document.querySelectorAll('.faq-item').forEach(item => {
                        let startX, startY, currentX, currentY;
                        
                        item.addEventListener('touchstart', (e) => {
                            startX = e.touches[0].clientX;
                            startY = e.touches[0].clientY;
                        });
                        
                        item.addEventListener('touchmove', (e) => {
                            if (!startX || !startY) return;
                            
                            currentX = e.touches[0].clientX;
                            currentY = e.touches[0].clientY;
                            
                            const diffX = startX - currentX;
                            const diffY = startY - currentY;
                            
                            // Horizontal swipe
                            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                                item.classList.add('swiping');
                                e.preventDefault();
                            }
                        });
                        
                        item.addEventListener('touchend', () => {
                            item.classList.remove('swiping');
                            startX = startY = currentX = currentY = null;
                        });
                    });
                }
            }
            
            async submitForm(formData) {
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Save to localStorage for demo
                    const contactData = {
                        id: Date.now(),
                        timestamp: new Date().toISOString(),
                        ...Object.fromEntries(formData),
                        files: this.selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
                    };
                    
                    const existingContacts = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
                    existingContacts.push(contactData);
                    localStorage.setItem('contact_submissions', JSON.stringify(existingContacts));
                    
                    return { success: true };
                } catch (error) {
                    throw new Error('Gönderme işlemi başarısız oldu');
                }
            }
            
            showAlert(message, type = 'success') {
                const alertId = type === 'success' ? 'success-alert' : 'error-alert';
                const alert = document.getElementById(alertId);
                
                if (type === 'error') {
                    document.getElementById('error-message').textContent = message;
                }
                
                // Hide all alerts first
                document.querySelectorAll('.alert').forEach(a => {
                    a.classList.remove('show');
                });
                
                // Show target alert
                alert.classList.add('show');
                
                // Auto hide after 5 seconds
                setTimeout(() => {
                    alert.classList.remove('show');
                }, 5000);
                
                // Re-initialize icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            
            autoHideAlerts() {
                document.querySelectorAll('.alert').forEach(alert => {
                    alert.addEventListener('click', () => {
                        alert.classList.remove('show');
                    });
                });
            }
            
            setLoading(isLoading) {
                if (isLoading) {
                    this.submitBtn.disabled = true;
                    this.submitBtn.classList.add('btn-loading');
                } else {
                    this.submitBtn.disabled = false;
                    this.submitBtn.classList.remove('btn-loading');
                }
            }
        }
        
        // Initialize Contact Manager
        let contactManager;
        document.addEventListener('DOMContentLoaded', function() {
            contactManager = new ContactManager();
        });
        
        // Form submission handler
        async function handleFormSubmit(event) {
            event.preventDefault();
            
            // Validate all fields
            let isValid = true;
            const formControls = event.target.querySelectorAll('.form-control');
            
            formControls.forEach(field => {
                if (!contactManager.validateField(field)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                contactManager.showAlert('Lütfen tüm alanları doğru şekilde doldurun', 'error');
                return;
            }
            
            // Set loading state
            contactManager.setLoading(true);
            
            try {
                const formData = new FormData(event.target);
                
                // Add files to form data
                contactManager.selectedFiles.forEach((file, index) => {
                    formData.append(`file_${index}`, file);
                });
                
                await contactManager.submitForm(formData);
                
                contactManager.showAlert('Mesajınız başarıyla gönderildi! En kısa sürede size geri dönüş yapacağız.');
                
                // Reset form
                event.target.reset();
                contactManager.selectedFiles = [];
                contactManager.updateFileDisplay();
                
                // Clear validation states
                formControls.forEach(field => {
                    field.classList.remove('is-valid', 'is-invalid');
                });
                
            } catch (error) {
                contactManager.showAlert(error.message, 'error');
            } finally {
                contactManager.setLoading(false);
            }
        }
        
        // FAQ Functions
        function toggleFaq(element) {
            const isActive = element.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                element.classList.add('active');
            }
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
        // Chat Functions
        function toggleChat() {
            const modal = document.getElementById('chat-modal');
            modal.classList.toggle('show');
        }
        
        function openWhatsApp() {
            const message = encodeURIComponent('Merhaba, Gürbüz Oyuncak hakkında bilgi almak istiyorum.');
            window.open(`https://wa.me/905551234567?text=${message}`, '_blank');
        }
        
        function callSupport() {
            window.location.href = 'tel:02424000000';
        }
        
        // Close chat modal when clicking outside
        document.addEventListener('click', function(event) {
            const chatModal = document.getElementById('chat-modal');
            const chatButton = document.querySelector('.chat-button');
            
            if (chatModal.classList.contains('show') && 
                !chatModal.contains(event.target) && 
                !chatButton.contains(event.target)) {
                chatModal.classList.remove('show');
            }
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Cart integration
        document.addEventListener('DOMContentLoaded', function() {
            // Update cart count if available
            if (typeof Cart !== 'undefined') {
                const cartCount = Cart.getItemCount();
                const cartCountElement = document.querySelector('.cart-count');
                if (cartCountElement) {
                    cartCountElement.textContent = cartCount;
                }
            }
        });
        
        // Performance optimizations
        function initIntersectionObserver() {
            const options = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, options);
            
            // Observe sections for animations
            document.querySelectorAll('section').forEach(section => {
                observer.observe(section);
            });
        }
        
        // Initialize on load
        if (typeof IntersectionObserver !== 'undefined') {
            initIntersectionObserver();
        }
    </script>
</body>
</html>