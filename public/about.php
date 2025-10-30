<?php
require_once __DIR__ . '/../components/ComponentLoader.php';
$componentLoader = new ComponentLoader();

// Sayfa meta bilgileri
$pageTitle = "Hakkımızda | Gürbüz Oyuncak";
$pageDescription = "1989'dan beri Türkiye'nin en güvenilir oyuncak markası. 35+ yıllık deneyim, 5000+ ürün çeşidi, 50K+ mutlu aile.";
$canonicalUrl = "https://gurbuzoyuncak.com/about";
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="keywords" content="gürbüz oyuncak hakkında, oyuncak firması, antalya oyuncak, güvenilir oyuncak markası">
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
    <meta property="og:image" content="https://gurbuzoyuncak.com/images/og-about.jpg">
    
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
            background-color: #ffffff;
            color: var(--text-color);
            line-height: 1.6;
        }
        
        /* Page Hero */
        .page-hero {
            background: linear-gradient(135deg, var(--primary-color) 0%, #3b82f6 100%);
            color: white;
            padding: 5rem 0 4rem;
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
            font-size: 4rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            background: linear-gradient(45deg, #ffffff, #e0f2fe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .hero-subtitle {
            font-size: 1.5rem;
            opacity: 0.9;
            margin-bottom: 2rem;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .hero-stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            flex-wrap: wrap;
            margin-top: 3rem;
        }
        
        .hero-stat {
            text-align: center;
        }
        
        .hero-stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            display: block;
            margin-bottom: 0.5rem;
        }
        
        .hero-stat-label {
            font-size: 0.875rem;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        /* Content Sections */
        .content-section {
            padding: 5rem 0;
        }
        
        .content-section:nth-child(even) {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }
        
        .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-color);
        }
        
        .section-subtitle {
            font-size: 1.125rem;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* Story Section */
        .story-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            margin-bottom: 4rem;
        }
        
        .story-image {
            position: relative;
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: var(--shadow-xl);
        }
        
        .story-image img {
            width: 100%;
            height: 500px;
            object-fit: cover;
            transition: var(--transition);
        }
        
        .story-image:hover img {
            transform: scale(1.05);
        }
        
        .story-image::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.1));
        }
        
        .story-content h2 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: var(--text-color);
        }
        
        .story-content p {
            font-size: 1.125rem;
            line-height: 1.7;
            margin-bottom: 1.5rem;
            color: var(--text-muted);
        }
        
        .story-highlights {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .story-highlight {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: var(--light-gray);
            border-radius: var(--radius-md);
            border-left: 4px solid var(--primary-color);
        }
        
        .story-highlight-icon {
            width: 40px;
            height: 40px;
            background: var(--primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
            margin-top: 4rem;
        }
        
        .stat-card {
            text-align: center;
            padding: 2.5rem 1.5rem;
            background: white;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            position: relative;
            overflow: hidden;
            transition: var(--transition);
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), #3b82f6);
        }
        
        .stat-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-xl);
        }
        
        .stat-number {
            font-size: 3.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
            display: block;
            transition: var(--transition);
        }
        
        .stat-label {
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        /* Values Grid */
        .values-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2.5rem;
            margin-top: 4rem;
        }
        
        .value-card {
            text-align: center;
            padding: 2.5rem;
            background: white;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }
        
        .value-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.05) 100%);
            opacity: 0;
            transition: var(--transition);
        }
        
        .value-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-xl);
        }
        
        .value-card:hover::before {
            opacity: 1;
        }
        
        .value-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--primary-color), #3b82f6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: white;
            font-size: 2rem;
            transition: var(--transition);
            position: relative;
            z-index: 2;
        }
        
        .value-card:hover .value-icon {
            transform: scale(1.1);
        }
        
        .value-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-color);
            position: relative;
            z-index: 2;
        }
        
        .value-card p {
            color: var(--text-muted);
            line-height: 1.6;
            position: relative;
            z-index: 2;
        }
        
        /* Timeline */
        .timeline-section {
            position: relative;
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem 0;
        }
        
        .timeline {
            position: relative;
        }
        
        .timeline::before {
            content: '';
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, var(--primary-color), #3b82f6);
            border-radius: 2px;
        }
        
        .timeline-item {
            position: relative;
            margin-bottom: 4rem;
            display: flex;
            align-items: center;
        }
        
        .timeline-item:nth-child(odd) {
            flex-direction: row;
        }
        
        .timeline-item:nth-child(even) {
            flex-direction: row-reverse;
        }
        
        .timeline-content {
            flex: 1;
            padding: 2rem;
            background: white;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            margin: 0 2rem;
            position: relative;
            transition: var(--transition);
        }
        
        .timeline-content:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
        }
        
        .timeline-item:nth-child(odd) .timeline-content::before {
            content: '';
            position: absolute;
            right: -15px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-left: 15px solid white;
            border-top: 15px solid transparent;
            border-bottom: 15px solid transparent;
        }
        
        .timeline-item:nth-child(even) .timeline-content::before {
            content: '';
            position: absolute;
            left: -15px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-right: 15px solid white;
            border-top: 15px solid transparent;
            border-bottom: 15px solid transparent;
        }
        
        .timeline-dot {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 24px;
            background: white;
            border: 4px solid var(--primary-color);
            border-radius: 50%;
            z-index: 10;
            transition: var(--transition);
        }
        
        .timeline-item:hover .timeline-dot {
            transform: translateX(-50%) scale(1.2);
            box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.2);
        }
        
        .timeline-year {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.75rem;
        }
        
        .timeline-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--text-color);
        }
        
        .timeline-description {
            color: var(--text-muted);
            line-height: 1.6;
        }
        
        /* Team Grid */
        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2.5rem;
            margin-top: 4rem;
        }
        
        .team-card {
            text-align: center;
            padding: 2.5rem;
            background: white;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            transition: var(--transition);
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }
        
        .team-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.05) 100%);
            opacity: 0;
            transition: var(--transition);
        }
        
        .team-card:hover {
            transform: translateY(-12px);
            box-shadow: var(--shadow-xl);
        }
        
        .team-card:hover::before {
            opacity: 1;
        }
        
        .team-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, var(--primary-color), #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: white;
            position: relative;
            z-index: 2;
            transition: var(--transition);
            border: 4px solid white;
            box-shadow: var(--shadow-md);
        }
        
        .team-card:hover .team-avatar {
            transform: scale(1.1);
        }
        
        .team-name {
            font-size: 1.375rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-color);
            position: relative;
            z-index: 2;
        }
        
        .team-role {
            color: var(--text-muted);
            font-size: 1rem;
            margin-bottom: 1rem;
            position: relative;
            z-index: 2;
        }
        
        .team-description {
            color: var(--text-muted);
            font-size: 0.875rem;
            line-height: 1.6;
            position: relative;
            z-index: 2;
        }
        
        .team-social {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 1.5rem;
            position: relative;
            z-index: 2;
        }
        
        .team-social a {
            width: 40px;
            height: 40px;
            background: var(--light-gray);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            transition: var(--transition);
            text-decoration: none;
        }
        
        .team-social a:hover {
            background: var(--primary-color);
            color: white;
            transform: translateY(-2px);
        }
        
        /* Gallery Section */
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-top: 3rem;
        }
        
        .gallery-item {
            position: relative;
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-md);
            cursor: pointer;
            transition: var(--transition);
        }
        
        .gallery-item:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
        }
        
        .gallery-item img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            transition: var(--transition);
        }
        
        .gallery-item:hover img {
            transform: scale(1.1);
        }
        
        .gallery-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(37, 99, 235, 0.8), rgba(59, 130, 246, 0.8));
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: var(--transition);
        }
        
        .gallery-item:hover .gallery-overlay {
            opacity: 1;
        }
        
        .gallery-overlay i {
            color: white;
            font-size: 2rem;
        }
        
        /* CTA Section */
        .cta-section {
            background: linear-gradient(135deg, var(--primary-color) 0%, #3b82f6 100%);
            color: white;
            padding: 5rem 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .cta-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="20" fill="url(%23grid)"/></svg>');
            opacity: 0.5;
        }
        
        .cta-content {
            position: relative;
            z-index: 2;
        }
        
        .cta-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .cta-description {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            border: none;
            border-radius: var(--radius-md);
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            transition: var(--transition);
            cursor: pointer;
            text-align: center;
            min-height: 48px;
            justify-content: center;
        }
        
        .btn-white {
            background: white;
            color: var(--primary-color);
        }
        
        .btn-white:hover {
            background: #f8fafc;
            color: var(--primary-color);
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .btn-outline-white {
            background: transparent;
            color: white;
            border: 2px solid white;
        }
        
        .btn-outline-white:hover {
            background: white;
            color: var(--primary-color);
        }
        
        /* Mobile Responsive */
        @media (max-width: 1200px) {
            .timeline::before {
                left: 30px;
            }
            
            .timeline-item {
                flex-direction: row !important;
                padding-left: 70px;
            }
            
            .timeline-item .timeline-content {
                margin: 0 0 0 1rem;
            }
            
            .timeline-item .timeline-content::before {
                left: -15px !important;
                right: auto !important;
                border-right: 15px solid white !important;
                border-left: none !important;
            }
            
            .timeline-dot {
                left: 30px !important;
                transform: translateX(-50%);
            }
        }
        
        @media (max-width: 992px) {
            .hero-title {
                font-size: 3rem;
            }
            
            .story-grid {
                grid-template-columns: 1fr;
                gap: 3rem;
            }
            
            .story-image {
                order: -1;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .values-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .gallery-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 768px) {
            .content-section {
                padding: 3rem 0;
            }
            
            .hero-title {
                font-size: 2.5rem;
            }
            
            .hero-subtitle {
                font-size: 1.25rem;
            }
            
            .hero-stats {
                gap: 2rem;
            }
            
            .section-title {
                font-size: 2rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            
            .values-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .story-highlights {
                grid-template-columns: 1fr;
            }
            
            .gallery-grid {
                grid-template-columns: 1fr;
            }
            
            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .btn {
                width: 100%;
                max-width: 300px;
            }
        }
        
        @media (max-width: 576px) {
            .hero-title {
                font-size: 2rem;
            }
            
            .cta-title {
                font-size: 2rem;
            }
            
            .team-grid {
                grid-template-columns: 1fr;
            }
            
            .timeline-item {
                padding-left: 50px;
            }
            
            .timeline-dot {
                left: 20px !important;
            }
            
            .timeline::before {
                left: 20px;
            }
        }
        
        /* Touch Optimizations */
        @media (hover: none) and (pointer: coarse) {
            .team-card:hover,
            .value-card:hover,
            .stat-card:hover {
                transform: none;
            }
            
            .team-card:active {
                transform: scale(0.98);
            }
        }
        
        /* Swipe Indicators */
        .swipe-container {
            position: relative;
            overflow: hidden;
        }
        
        .swipe-indicator {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            padding: 0.5rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            display: none;
        }
        
        @media (max-width: 768px) {
            .swipe-indicator {
                display: block;
            }
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
        
        /* Animation Classes */
        .fade-in {
            animation: fadeIn 0.6s ease-out;
        }
        
        .slide-up {
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes countUp {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
        }
        
        .counter-animate {
            animation: countUp 0.6s ease-out;
        }
    </style>
</head>
<body>
    <!-- Navbar Component -->
    <?php echo $componentLoader->loadComponent('navbar', ['variant' => 'public']); ?>

    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">Hakkımızda</h1>
                <p class="hero-subtitle">1989'dan beri Türkiye'nin en güvenilir oyuncak markası. Çocukların hayal dünyasına katkıda bulunuyoruz.</p>
                
                <div class="hero-stats">
                    <div class="hero-stat">
                        <span class="hero-stat-number" data-count="35">0</span>
                        <span class="hero-stat-label">Yıllık Deneyim</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat-number" data-count="5000">0</span>
                        <span class="hero-stat-label">Ürün Çeşidi</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat-number" data-count="50000">0</span>
                        <span class="hero-stat-label">Mutlu Aile</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Story Section -->
    <section class="content-section">
        <div class="container">
            <div class="story-grid">
                <div class="story-image">
                    <img src="images/about/company-history.jpg" alt="Gürbüz Oyuncak Tarihi" 
                         onerror="this.src='https://via.placeholder.com/600x500/2563eb/FFFFFF?text=Gürbüz+Oyuncak+Tarihi'">
                </div>
                <div class="story-content">
                    <h2>Hikayemiz</h2>
                    <p>1989 yılında Antalya'da küçük bir dükkân olarak başlayan yolculuğumuz, bugün Türkiye'nin dört bir yanına kaliteli ve güvenli oyuncaklar ulaştıran köklü bir marka haline geldi.</p>
                    <p>Gürbüz Oyuncak olarak, çocukların hayal dünyasına katkıda bulunmak ve onların gelişimini destekleyen oyuncaklar sunmak bizim için her zaman öncelik olmuştur.</p>
                    <p>35 yılı aşkın tecrübemiz ve kalite odaklı yaklaşımımızla, binlerce ailenin güvenini kazandık ve çocukların yüzünü güldürmeye devam ediyoruz.</p>
                    
                    <div class="story-highlights">
                        <div class="story-highlight">
                            <div class="story-highlight-icon">
                                <i data-lucide="shield-check" width="20" height="20"></i>
                            </div>
                            <div>
                                <strong>Güvenlik Önceliği</strong><br>
                                <small>Tüm ürünlerimiz CE ve TSE sertifikalı</small>
                            </div>
                        </div>
                        <div class="story-highlight">
                            <div class="story-highlight-icon">
                                <i data-lucide="heart" width="20" height="20"></i>
                            </div>
                            <div>
                                <strong>Aile Odaklı</strong><br>
                                <small>Her yaş grubuna uygun ürün seçenekleri</small>
                            </div>
                        </div>
                        <div class="story-highlight">
                            <div class="story-highlight-icon">
                                <i data-lucide="award" width="20" height="20"></i>
                            </div>
                            <div>
                                <strong>Kalite Garantisi</strong><br>
                                <small>Premium markalar ve uzun ömürlü ürünler</small>
                            </div>
                        </div>
                        <div class="story-highlight">
                            <div class="story-highlight-icon">
                                <i data-lucide="truck" width="20" height="20"></i>
                            </div>
                            <div>
                                <strong>Hızlı Teslimat</strong><br>
                                <small>Türkiye geneline güvenli kargo</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-number" data-count="35">0</span>
                    <div class="stat-label">Yıllık Tecrübe</div>
                </div>
                <div class="stat-card">
                    <span class="stat-number" data-count="5000">0</span>
                    <div class="stat-label">Ürün Çeşidi</div>
                </div>
                <div class="stat-card">
                    <span class="stat-number" data-count="50000">0</span>
                    <div class="stat-label">Mutlu Aile</div>
                </div>
                <div class="stat-card">
                    <span class="stat-number" data-count="100">0</span>
                    <div class="stat-label">Müşteri Memnuniyeti %</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Values Section -->
    <section class="content-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Değerlerimiz</h2>
                <p class="section-subtitle">Gürbüz Oyuncak'ı her gün daha iyi yapan temel değerlerimiz ve prensiplerimiz</p>
            </div>
            
            <div class="values-grid">
                <div class="value-card">
                    <div class="value-icon">
                        <i data-lucide="shield-check" width="32" height="32"></i>
                    </div>
                    <h3>Güvenlik</h3>
                    <p>Tüm ürünlerimiz uluslararası güvenlik standartlarına uygun ve sertifikalıdır. Çocukların güvenliği bizim önceliğimizdir.</p>
                </div>
                <div class="value-card">
                    <div class="value-icon">
                        <i data-lucide="star" width="32" height="32"></i>
                    </div>
                    <h3>Kalite</h3>
                    <p>Yalnızca en kaliteli ve dayanıklı oyuncakları sizlerle buluşturuyoruz. Her ürün özenle seçilir ve test edilir.</p>
                </div>
                <div class="value-card">
                    <div class="value-icon">
                        <i data-lucide="heart" width="32" height="32"></i>
                    </div>
                    <h3>Güven</h3>
                    <p>35 yıllık tecrübemizle, binlerce ailenin güvenini kazandık ve bu güveni korumaya devam ediyoruz.</p>
                </div>
                <div class="value-card">
                    <div class="value-icon">
                        <i data-lucide="target" width="32" height="32"></i>
                    </div>
                    <h3>Çocuk Odaklı</h3>
                    <p>Her ürünü çocukların gelişimine katkı sağlaması ve eğitici olması açısından özenle değerlendiriyoruz.</p>
                </div>
                <div class="value-card">
                    <div class="value-icon">
                        <i data-lucide="leaf" width="32" height="32"></i>
                    </div>
                    <h3>Sürdürülebilirlik</h3>
                    <p>Çevre dostu ürünler ve ambalajlarla geleceği koruyoruz. Sürdürülebilir oyuncakları tercih ediyoruz.</p>
                </div>
                <div class="value-card">
                    <div class="value-icon">
                        <i data-lucide="users" width="32" height="32"></i>
                    </div>
                    <h3>Müşteri Memnuniyeti</h3>
                    <p>Müşterilerimizin memnuniyeti bizim için her şeyden önemlidir. 7/24 destek ve hızlı çözüm sunuyoruz.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Timeline Section -->
    <section class="content-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Yolculuğumuz</h2>
                <p class="section-subtitle">1989'dan günümüze kadar olan büyüme hikayemiz ve önemli kilometre taşlarımız</p>
            </div>
            
            <div class="timeline-section">
                <div class="timeline">
                    <div class="timeline-item fade-in">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-year">1989</div>
                            <h3 class="timeline-title">Kuruluş</h3>
                            <p class="timeline-description">Antalya'da küçük bir oyuncak dükkânı olarak kurulduk. İlk müşterilerimizin güvenini kazanmaya başladık.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item fade-in">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-year">1995</div>
                            <h3 class="timeline-title">Toptan Satış</h3>
                            <p class="timeline-description">İlk toptan satış departmanımızı açtık ve Akdeniz Bölgesi'nde büyümeye başladık. Diğer oyuncakçılarla iş ortaklıkları kurduk.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item fade-in">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-year">2005</div>
                            <h3 class="timeline-title">Türkiye Geneli</h3>
                            <p class="timeline-description">Yeni mağaza açılışlarıyla Türkiye geneline yayıldık. İstanbul, Ankara, İzmir'de şubelerimizi açtık.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item fade-in">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-year">2015</div>
                            <h3 class="timeline-title">E-Ticaret Başlangıcı</h3>
                            <p class="timeline-description">Online satış platformumuzu kurduk ve e-ticaret yolculuğumuza başladık. Dijital dönüşümün öncüsü olduk.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item fade-in">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-year">2020</div>
                            <h3 class="timeline-title">Büyük Platform</h3>
                            <p class="timeline-description">5000+ ürün çeşidi ile Türkiye'nin en büyük oyuncak platformlarından biri olduk. Pandemi döneminde güçlü durduğumuz dönem.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item fade-in">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-year">2025</div>
                            <h3 class="timeline-title">Yeni Nesil Platform</h3>
                            <p class="timeline-description">Yeni nesil e-ticaret platformumuz ve modern alışveriş deneyimi ile hizmetinizdeyiz! Geleceğe hazır teknoloji.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Team Section -->
    <section class="content-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Ekibimiz</h2>
                <p class="section-subtitle">Gürbüz Oyuncak ailesini oluşturan deneyimli ve tutkulu ekip üyelerimiz</p>
            </div>
            
            <div class="team-grid">
                <div class="team-card" onclick="showTeamModal('founder')">
                    <div class="team-avatar">
                        <i data-lucide="user" width="48" height="48"></i>
                    </div>
                    <h3 class="team-name">Ahmet Gürbüz</h3>
                    <p class="team-role">Kurucu & Genel Müdür</p>
                    <p class="team-description">35 yıllık oyuncak sektörü deneyimi. Şirketin vizyonunu belirleyen ve stratejik kararları alan kurucu ortağımız.</p>
                    <div class="team-social">
                        <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin" width="16" height="16"></i></a>
                        <a href="#" aria-label="Twitter"><i data-lucide="twitter" width="16" height="16"></i></a>
                        <a href="#" aria-label="Email"><i data-lucide="mail" width="16" height="16"></i></a>
                    </div>
                </div>
                
                <div class="team-card" onclick="showTeamModal('sales')">
                    <div class="team-avatar">
                        <i data-lucide="user" width="48" height="48"></i>
                    </div>
                    <h3 class="team-name">Ayşe Yılmaz</h3>
                    <p class="team-role">Satış Müdürü</p>
                    <p class="team-description">15 yıllık satış deneyimi. Müşteri ilişkileri ve satış stratejilerinden sorumlu deneyimli yöneticimiz.</p>
                    <div class="team-social">
                        <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin" width="16" height="16"></i></a>
                        <a href="#" aria-label="Email"><i data-lucide="mail" width="16" height="16"></i></a>
                    </div>
                </div>
                
                <div class="team-card" onclick="showTeamModal('ecommerce')">
                    <div class="team-avatar">
                        <i data-lucide="user" width="48" height="48"></i>
                    </div>
                    <h3 class="team-name">Mehmet Demir</h3>
                    <p class="team-role">E-Ticaret Müdürü</p>
                    <p class="team-description">10 yıllık dijital pazarlama deneyimi. Online platform ve dijital strateji geliştirmekten sorumlu.</p>
                    <div class="team-social">
                        <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin" width="16" height="16"></i></a>
                        <a href="#" aria-label="GitHub"><i data-lucide="github" width="16" height="16"></i></a>
                        <a href="#" aria-label="Email"><i data-lucide="mail" width="16" height="16"></i></a>
                    </div>
                </div>
                
                <div class="team-card" onclick="showTeamModal('quality')">
                    <div class="team-avatar">
                        <i data-lucide="user" width="48" height="48"></i>
                    </div>
                    <h3 class="team-name">Zeynep Kaya</h3>
                    <p class="team-role">Kalite Kontrol Uzmanı</p>
                    <p class="team-description">12 yıllık kalite yönetimi deneyimi. Ürün güvenliği ve kalite standartlarından sorumlu uzmanımız.</p>
                    <div class="team-social">
                        <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin" width="16" height="16"></i></a>
                        <a href="#" aria-label="Email"><i data-lucide="mail" width="16" height="16"></i></a>
                    </div>
                </div>
                
                <div class="team-card" onclick="showTeamModal('logistics')">
                    <div class="team-avatar">
                        <i data-lucide="user" width="48" height="48"></i>
                    </div>
                    <h3 class="team-name">Can Özkan</h3>
                    <p class="team-role">Lojistik Müdürü</p>
                    <p class="team-description">8 yıllık lojistik deneyimi. Depo yönetimi, kargo süreçleri ve teslimat operasyonlarından sorumlu.</p>
                    <div class="team-social">
                        <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin" width="16" height="16"></i></a>
                        <a href="#" aria-label="Email"><i data-lucide="mail" width="16" height="16"></i></a>
                    </div>
                </div>
                
                <div class="team-card" onclick="showTeamModal('customer')">
                    <div class="team-avatar">
                        <i data-lucide="user" width="48" height="48"></i>
                    </div>
                    <h3 class="team-name">Deniz Arslan</h3>
                    <p class="team-role">Müşteri Hizmetleri Müdürü</p>
                    <p class="team-description">6 yıllık müşteri hizmetleri deneyimi. 7/24 destek ve müşteri memnuniyetinden sorumlu ekip lideri.</p>
                    <div class="team-social">
                        <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin" width="16" height="16"></i></a>
                        <a href="#" aria-label="Email"><i data-lucide="mail" width="16" height="16"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Gallery Section -->
    <section class="content-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Fotoğraf Galerisi</h2>
                <p class="section-subtitle">Mağazalarımız, ekibimiz ve özel anlarımızdan kareler</p>
            </div>
            
            <div class="gallery-grid swipe-container">
                <div class="swipe-indicator">
                    <i data-lucide="move" width="16" height="16"></i>
                    Kaydırın
                </div>
                
                <div class="gallery-item" onclick="openGalleryModal('store1')">
                    <img src="images/gallery/store-front.jpg" alt="Mağaza Dış Görünüm" 
                         onerror="this.src='https://via.placeholder.com/400x250/2563eb/FFFFFF?text=Mağaza+Dış+Görünüm'">
                    <div class="gallery-overlay">
                        <i data-lucide="zoom-in" width="32" height="32"></i>
                    </div>
                </div>
                
                <div class="gallery-item" onclick="openGalleryModal('store2')">
                    <img src="images/gallery/store-interior.jpg" alt="Mağaza İç Görünüm" 
                         onerror="this.src='https://via.placeholder.com/400x250/2563eb/FFFFFF?text=Mağaza+İç+Görünüm'">
                    <div class="gallery-overlay">
                        <i data-lucide="zoom-in" width="32" height="32"></i>
                    </div>
                </div>
                
                <div class="gallery-item" onclick="openGalleryModal('team')">
                    <img src="images/gallery/team-photo.jpg" alt="Ekip Fotoğrafı" 
                         onerror="this.src='https://via.placeholder.com/400x250/2563eb/FFFFFF?text=Ekip+Fotoğrafı'">
                    <div class="gallery-overlay">
                        <i data-lucide="zoom-in" width="32" height="32"></i>
                    </div>
                </div>
                
                <div class="gallery-item" onclick="openGalleryModal('warehouse')">
                    <img src="images/gallery/warehouse.jpg" alt="Depo ve Lojistik" 
                         onerror="this.src='https://via.placeholder.com/400x250/2563eb/FFFFFF?text=Depo+ve+Lojistik'">
                    <div class="gallery-overlay">
                        <i data-lucide="zoom-in" width="32" height="32"></i>
                    </div>
                </div>
                
                <div class="gallery-item" onclick="openGalleryModal('awards')">
                    <img src="images/gallery/awards.jpg" alt="Ödüller ve Sertifikalar" 
                         onerror="this.src='https://via.placeholder.com/400x250/2563eb/FFFFFF?text=Ödüller+ve+Sertifikalar'">
                    <div class="gallery-overlay">
                        <i data-lucide="zoom-in" width="32" height="32"></i>
                    </div>
                </div>
                
                <div class="gallery-item" onclick="openGalleryModal('events')">
                    <img src="images/gallery/events.jpg" alt="Etkinlikler" 
                         onerror="this.src='https://via.placeholder.com/400x250/2563eb/FFFFFF?text=Özel+Etkinlikler'">
                    <div class="gallery-overlay">
                        <i data-lucide="zoom-in" width="32" height="32"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <div class="cta-content">
                <h2 class="cta-title">Bizimle Alışverişe Başlayın!</h2>
                <p class="cta-description">35 yıllık deneyimimiz, 5000+ ürün çeşitliliğimiz ve güvenli alışveriş garantimizle çocuklarınızın hayal dünyasını zenginleştirin.</p>
                
                <div class="cta-buttons">
                    <a href="products.php" class="btn btn-white">
                        <i data-lucide="shopping-cart" width="20" height="20"></i>
                        Ürünleri İncele
                    </a>
                    <a href="contact.php" class="btn btn-outline-white">
                        <i data-lucide="phone" width="20" height="20"></i>
                        Bize Ulaşın
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Gallery Modal -->
    <div class="modal fade" id="galleryModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="galleryModalTitle">Fotoğraf</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <img id="galleryModalImage" src="" alt="" class="img-fluid rounded">
                    <p id="galleryModalDescription" class="mt-3 text-muted"></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Team Modal -->
    <div class="modal fade" id="teamModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="teamModalTitle">Ekip Üyesi</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <div id="teamModalAvatar" class="team-avatar mx-auto mb-3"></div>
                    <h4 id="teamModalName">İsim</h4>
                    <p id="teamModalRole" class="text-muted">Rol</p>
                    <p id="teamModalBio">Biyografi</p>
                    <div id="teamModalAchievements"></div>
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
        // About Page Management System
        class AboutManager {
            constructor() {
                this.counters = [];
                this.animatedElements = new Set();
                this.teamData = this.getTeamData();
                this.galleryData = this.getGalleryData();
                
                this.init();
            }
            
            init() {
                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                
                this.setupCounters();
                this.setupScrollAnimations();
                this.setupSwipeGestures();
                this.initIntersectionObserver();
            }
            
            setupCounters() {
                const counterElements = document.querySelectorAll('[data-count]');
                counterElements.forEach(element => {
                    const target = parseInt(element.getAttribute('data-count'));
                    this.counters.push({
                        element: element,
                        target: target,
                        current: 0,
                        increment: target / 60, // 60 frames for smooth animation
                        animated: false
                    });
                });
            }
            
            animateCounter(counter) {
                if (counter.animated) return;
                
                counter.animated = true;
                counter.element.classList.add('counter-animate');
                
                const animate = () => {
                    if (counter.current < counter.target) {
                        counter.current += counter.increment;
                        if (counter.current > counter.target) {
                            counter.current = counter.target;
                        }
                        
                        // Format number
                        let displayValue = Math.floor(counter.current);
                        if (counter.target >= 1000) {
                            displayValue = displayValue.toLocaleString('tr-TR');
                        }
                        
                        counter.element.textContent = displayValue;
                        
                        if (counter.current < counter.target) {
                            requestAnimationFrame(animate);
                        }
                    }
                };
                
                animate();
            }
            
            setupScrollAnimations() {
                const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
                animatedElements.forEach(element => {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(30px)';
                });
            }
            
            animateElement(element) {
                if (this.animatedElements.has(element)) return;
                
                this.animatedElements.add(element);
                element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
            
            setupSwipeGestures() {
                if ('ontouchstart' in window) {
                    const swipeContainers = document.querySelectorAll('.swipe-container');
                    
                    swipeContainers.forEach(container => {
                        let startX, startY, currentX, currentY;
                        
                        container.addEventListener('touchstart', (e) => {
                            startX = e.touches[0].clientX;
                            startY = e.touches[0].clientY;
                        });
                        
                        container.addEventListener('touchmove', (e) => {
                            if (!startX || !startY) return;
                            
                            currentX = e.touches[0].clientX;
                            currentY = e.touches[0].clientY;
                            
                            const diffX = startX - currentX;
                            const diffY = startY - currentY;
                            
                            // Horizontal swipe for gallery
                            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                                e.preventDefault();
                                
                                // Add visual feedback
                                const indicator = container.querySelector('.swipe-indicator');
                                if (indicator) {
                                    indicator.style.opacity = '1';
                                    indicator.style.transform = `translateX(${diffX > 0 ? '-' : ''}10px)`;
                                }
                            }
                        });
                        
                        container.addEventListener('touchend', () => {
                            // Reset indicator
                            const indicator = container.querySelector('.swipe-indicator');
                            if (indicator) {
                                indicator.style.opacity = '0.7';
                                indicator.style.transform = 'translateX(0)';
                            }
                            
                            startX = startY = currentX = currentY = null;
                        });
                    });
                }
            }
            
            initIntersectionObserver() {
                const options = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Animate counters
                            if (entry.target.hasAttribute('data-count')) {
                                const counter = this.counters.find(c => c.element === entry.target);
                                if (counter) {
                                    this.animateCounter(counter);
                                }
                            }
                            
                            // Animate elements
                            if (entry.target.classList.contains('fade-in') || 
                                entry.target.classList.contains('slide-up')) {
                                this.animateElement(entry.target);
                            }
                            
                            // Animate stat cards
                            if (entry.target.classList.contains('stat-card')) {
                                const counter = this.counters.find(c => 
                                    entry.target.contains(c.element));
                                if (counter) {
                                    this.animateCounter(counter);
                                }
                            }
                        }
                    });
                }, options);
                
                // Observe all counter elements
                this.counters.forEach(counter => {
                    observer.observe(counter.element);
                });
                
                // Observe parent stat cards
                document.querySelectorAll('.stat-card').forEach(card => {
                    observer.observe(card);
                });
                
                // Observe animated elements
                document.querySelectorAll('.fade-in, .slide-up').forEach(element => {
                    observer.observe(element);
                });
            }
            
            getTeamData() {
                return {
                    founder: {
                        name: 'Ahmet Gürbüz',
                        role: 'Kurucu & Genel Müdür',
                        bio: '35 yıllık oyuncak sektörü deneyimi. Gürbüz Oyuncak\'ı 1989 yılında küçük bir dükkân olarak kurdu ve bugünkü seviyesine getirdi. Çocukların eğitimi ve gelişimi konularında uzman.',
                        achievements: [
                            'Antalya Ticaret Odası Başarı Ödülü (2010)',
                            'Türkiye Oyuncak Sektörü Onur Ödülü (2015)',
                            'Girişimcilik ve İnovasyon Ödülü (2020)'
                        ]
                    },
                    sales: {
                        name: 'Ayşe Yılmaz',
                        role: 'Satış Müdürü',
                        bio: '15 yıllık satış ve pazarlama deneyimi. Müşteri ilişkileri yönetimi ve satış stratejileri konularında uzman. Ekip liderliği ve motivasyon konularında başarılı.',
                        achievements: [
                            'En İyi Satış Performansı Ödülü (2018)',
                            'Müşteri Memnuniyeti Liderlik Ödülü (2021)',
                            'Kadın Girişimci Ödülü (2023)'
                        ]
                    },
                    ecommerce: {
                        name: 'Mehmet Demir',
                        role: 'E-Ticaret Müdürü',
                        bio: '10 yıllık dijital pazarlama ve e-ticaret deneyimi. Web teknolojileri, SEO ve sosyal medya pazarlama konularında uzman. Şirketin dijital dönüşümünde önemli rol oynadı.',
                        achievements: [
                            'Dijital Dönüşüm Liderlik Ödülü (2019)',
                            'E-Ticaret Başarı Ödülü (2022)',
                            'Google Partner Sertifikası (2020)'
                        ]
                    },
                    quality: {
                        name: 'Zeynep Kaya',
                        role: 'Kalite Kontrol Uzmanı',
                        bio: '12 yıllık kalite yönetimi ve ürün güvenliği deneyimi. Uluslararası standartlar ve sertifikasyon süreçleri konularında uzman. Ürün testleri ve güvenlik analizleri yapıyor.',
                        achievements: [
                            'ISO 9001 Kalite Yönetimi Sertifikası (2017)',
                            'CE Uygunluk Değerlendirme Uzmanı (2019)',
                            'Kalite Liderlik Ödülü (2021)'
                        ]
                    },
                    logistics: {
                        name: 'Can Özkan',
                        role: 'Lojistik Müdürü',
                        bio: '8 yıllık lojistik ve tedarik zinciri yönetimi deneyimi. Depo operasyonları, kargo süreçleri ve envanter yönetimi konularında uzman. Teslimat süreçlerini optimize ediyor.',
                        achievements: [
                            'Lojistik Verimliliği Ödülü (2020)',
                            'Tedarik Zinciri Optimizasyonu Sertifikası (2021)',
                            'Hızlı Teslimat Başarı Ödülü (2023)'
                        ]
                    },
                    customer: {
                        name: 'Deniz Arslan',
                        role: 'Müşteri Hizmetleri Müdürü',
                        bio: '6 yıllık müşteri hizmetleri ve destek deneyimi. İletişim becerileri ve problem çözme konularında uzman. 7/24 destek ekibini yönetiyor ve müşteri memnuniyetini sağlıyor.',
                        achievements: [
                            'Müşteri Memnuniyeti Ödülü (2021)',
                            'İletişim Becerileri Sertifikası (2020)',
                            'Takım Liderliği Ödülü (2022)'
                        ]
                    }
                };
            }
            
            getGalleryData() {
                return {
                    store1: {
                        title: 'Mağaza Dış Görünüm',
                        description: 'Antalya Güzeloba\'daki ana mağazamızın dış görünümü. Modern tasarım ve geniş vitrinlerimizle dikkat çekiyoruz.'
                    },
                    store2: {
                        title: 'Mağaza İç Görünüm',
                        description: 'Mağazamızın iç düzenlemesi. Kategorilere göre ayrılmış bölümler ve çocuk dostu tasarımımız.'
                    },
                    team: {
                        title: 'Ekip Fotoğrafı',
                        description: 'Gürbüz Oyuncak ailesinin bir araya geldiği özel anlardan biri. Deneyimli ve tutkulu ekibimiz.'
                    },
                    warehouse: {
                        title: 'Depo ve Lojistik',
                        description: 'Modern depo sistemimiz ve lojistik operasyonlarımız. Hızlı ve güvenli teslimat için gelişmiş altyapı.'
                    },
                    awards: {
                        title: 'Ödüller ve Sertifikalar',
                        description: 'Yıllar içinde aldığımız ödüller ve sertifikalar. Kalite ve başarımızın bir göstergesi.'
                    },
                    events: {
                        title: 'Özel Etkinlikler',
                        description: 'Çocuklar için düzenlediğimiz özel etkinlikler ve etkinliklerden kareler.'
                    }
                };
            }
        }
        
        // Initialize About Manager
        let aboutManager;
        document.addEventListener('DOMContentLoaded', function() {
            aboutManager = new AboutManager();
        });
        
        // Modal Functions
        function showTeamModal(teamKey) {
            const teamMember = aboutManager.teamData[teamKey];
            if (!teamMember) return;
            
            document.getElementById('teamModalTitle').textContent = teamMember.name;
            document.getElementById('teamModalName').textContent = teamMember.name;
            document.getElementById('teamModalRole').textContent = teamMember.role;
            document.getElementById('teamModalBio').textContent = teamMember.bio;
            
            // Update avatar
            const avatar = document.getElementById('teamModalAvatar');
            avatar.innerHTML = '<i data-lucide="user" width="48" height="48"></i>';
            
            // Update achievements
            const achievementsContainer = document.getElementById('teamModalAchievements');
            achievementsContainer.innerHTML = `
                <h6>Başarılar ve Ödüller:</h6>
                <ul class="list-unstyled">
                    ${teamMember.achievements.map(achievement => `<li>• ${achievement}</li>`).join('')}
                </ul>
            `;
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('teamModal'));
            modal.show();
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
        function openGalleryModal(galleryKey) {
            const galleryItem = aboutManager.galleryData[galleryKey];
            if (!galleryItem) return;
            
            document.getElementById('galleryModalTitle').textContent = galleryItem.title;
            document.getElementById('galleryModalDescription').textContent = galleryItem.description;
            
            // Set image source
            const modalImage = document.getElementById('galleryModalImage');
            modalImage.src = `images/gallery/${galleryKey}.jpg`;
            modalImage.alt = galleryItem.title;
            modalImage.onerror = function() {
                this.src = `https://via.placeholder.com/800x600/2563eb/FFFFFF?text=${encodeURIComponent(galleryItem.title)}`;
            };
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('galleryModal'));
            modal.show();
        }
        
        // Smooth scroll for timeline
        function scrollToTimeline() {
            document.querySelector('.timeline-section').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
        
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
        function optimizeImages() {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
        
        // Initialize optimizations
        if (typeof IntersectionObserver !== 'undefined') {
            optimizeImages();
        }
        
        // Add loading states for better UX
        document.addEventListener('DOMContentLoaded', function() {
            // Remove loading classes after images load
            const images = document.querySelectorAll('img');
            let loadedImages = 0;
            
            images.forEach(img => {
                if (img.complete) {
                    loadedImages++;
                } else {
                    img.addEventListener('load', () => {
                        loadedImages++;
                        if (loadedImages === images.length) {
                            document.body.classList.add('images-loaded');
                        }
                    });
                }
            });
            
            if (loadedImages === images.length) {
                document.body.classList.add('images-loaded');
            }
        });
    </script>
</body>
</html>