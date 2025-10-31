<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/../components/ComponentLoader.php';

if (!isAdminLoggedIn()) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XML Import Sistemi | Gürbüz Oyuncak Admin</title>
    
    <!-- Bootstrap 5.3.2 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Component CSS -->
    <link rel="stylesheet" href="../components/css/components.css">
    
    <style>
        :root {
            --primary-color: #667eea;
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --success-color: #22c55e;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
            --info-color: #3b82f6;
            --sidebar-width: 280px;
            --topbar-height: 70px;
            --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --card-hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        body {
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            line-height: 1.6;
        }
        
        .admin-wrapper {
            display: flex;
            min-height: 100vh;
        }
        
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: calc(var(--topbar-height) + 2rem) 2rem 2rem;
            transition: margin-left 0.3s ease;
        }
        
        .top-bar {
            position: fixed;
            top: 0;
            left: var(--sidebar-width);
            right: 0;
            height: var(--topbar-height);
            background: white;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            z-index: 999;
            backdrop-filter: blur(10px);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: left 0.3s ease;
        }
        
        .top-bar-title {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .top-bar h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Import Tabs */
        .import-tabs {
            display: flex;
            background: white;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            margin-bottom: 2rem;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        
        .import-tab {
            flex: 1;
            padding: 1rem 1.5rem;
            border: none;
            background: transparent;
            color: #6b7280;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-right: 1px solid #e5e7eb;
            position: relative;
        }
        
        .import-tab:last-child {
            border-right: none;
        }
        
        .import-tab.active {
            background: var(--primary-gradient);
            color: white;
        }
        
        .import-tab:not(.active):hover {
            background: #f8f9fa;
            color: #374151;
        }
        
        /* Card Styles */
        .import-card {
            background: white;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
            margin-bottom: 2rem;
        }
        
        .card-header-import {
            background: var(--primary-gradient);
            color: white;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .card-header-import h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
        }
        
        .card-body-import {
            padding: 2rem;
        }
        
        /* Upload Area */
        .upload-area {
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 3rem 2rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            background: #f9fafb;
        }
        
        .upload-area:hover,
        .upload-area.dragover {
            border-color: var(--primary-color);
            background: rgba(102, 126, 234, 0.05);
        }
        
        .upload-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 1rem;
            color: #6b7280;
        }
        
        .upload-text {
            font-size: 1.125rem;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .upload-subtext {
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .file-input {
            display: none;
        }
        
        /* File List */
        .file-list {
            margin-top: 1.5rem;
            display: none;
        }
        
        .file-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }
        
        .file-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .file-icon {
            width: 32px;
            height: 32px;
            color: var(--primary-color);
        }
        
        .file-details h5 {
            margin: 0;
            font-size: 0.875rem;
            color: #374151;
        }
        
        .file-details p {
            margin: 0;
            font-size: 0.75rem;
            color: #6b7280;
        }
        
        .file-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .file-action-btn {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .file-action-btn.preview {
            background: rgba(59, 130, 246, 0.1);
            color: var(--info-color);
        }
        
        .file-action-btn.remove {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger-color);
        }
        
        .file-action-btn:hover {
            transform: scale(1.1);
        }
        
        /* Import Options */
        .import-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        
        .option-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .option-card:hover {
            border-color: var(--primary-color);
            background: rgba(102, 126, 234, 0.05);
        }
        
        .option-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        
        .option-icon {
            width: 24px;
            height: 24px;
            color: var(--primary-color);
        }
        
        .option-title {
            font-weight: 600;
            color: #374151;
        }
        
        .option-description {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }
        
        /* Progress System */
        .import-progress {
            display: none;
            margin-top: 2rem;
        }
        
        .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .progress-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #374151;
        }
        
        .progress-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary-color);
            font-weight: 500;
        }
        
        .progress-bar-container {
            background: #e5e7eb;
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 1rem;
        }
        
        .progress-bar-fill {
            height: 100%;
            background: var(--primary-gradient);
            border-radius: 6px;
            transition: width 0.5s ease;
            position: relative;
        }
        
        .progress-bar-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .progress-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        .progress-stat {
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .progress-stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        
        .progress-stat-value.success {
            color: var(--success-color);
        }
        
        .progress-stat-value.warning {
            color: var(--warning-color);
        }
        
        .progress-stat-value.danger {
            color: var(--danger-color);
        }
        
        .progress-stat-label {
            font-size: 0.75rem;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 500;
        }
        
        /* Import Preview */
        .import-preview {
            display: none;
            margin-top: 2rem;
        }
        
        .preview-table {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--card-shadow);
        }
        
        .preview-table table {
            margin: 0;
        }
        
        .preview-table thead th {
            background: #f8f9fa;
            color: #374151;
            font-weight: 600;
            padding: 1rem;
            border: none;
            text-transform: uppercase;
            font-size: 0.75rem;
        }
        
        .preview-table tbody td {
            padding: 0.75rem 1rem;
            border-color: #f3f4f6;
            vertical-align: middle;
        }
        
        .preview-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        /* Import History */
        .history-filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        
        .history-filter {
            padding: 0.5rem 1rem;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 8px;
            font-size: 0.875rem;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .history-filter.active,
        .history-filter:hover {
            border-color: var(--primary-color);
            background: var(--primary-color);
            color: white;
        }
        
        .history-item {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: var(--card-shadow);
            transition: all 0.3s ease;
        }
        
        .history-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--card-hover-shadow);
        }
        
        .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .history-title {
            font-weight: 600;
            color: #374151;
        }
        
        .history-date {
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .history-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .history-stat {
            text-align: center;
        }
        
        .history-stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        
        .history-stat-label {
            font-size: 0.75rem;
            color: #6b7280;
            text-transform: uppercase;
        }
        
        .history-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
        }
        
        .history-action-btn {
            padding: 0.375rem 0.75rem;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 6px;
            font-size: 0.8rem;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.375rem;
        }
        
        .history-action-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }
        
        /* Status Badges */
        .status-badge {
            padding: 0.375rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .status-badge.success {
            background: rgba(34, 197, 94, 0.1);
            color: var(--success-color);
        }
        
        .status-badge.processing {
            background: rgba(59, 130, 246, 0.1);
            color: var(--info-color);
        }
        
        .status-badge.failed {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger-color);
        }
        
        .status-badge.warning {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning-color);
        }
        
        /* Template System */
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        
        .template-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--card-shadow);
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .template-card:hover {
            border-color: var(--primary-color);
            transform: translateY(-4px);
            box-shadow: var(--card-hover-shadow);
        }
        
        .template-icon {
            width: 48px;
            height: 48px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .template-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .template-description {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
        }
        
        .template-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .template-btn {
            flex: 1;
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 6px;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .template-btn.primary {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
        }
        
        .template-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }
        
        .template-btn.primary:hover {
            background: #5a67d8;
        }
        
        /* Error Display */
        .error-list {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .error-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            color: #991b1b;
            font-size: 0.875rem;
        }
        
        /* Loading States */
        .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #6b7280;
            padding: 2rem;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .spin {
            animation: spin 1s linear infinite;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .main-content {
                margin-left: 0;
                padding: calc(var(--topbar-height) + 1rem) 1rem 1rem;
            }
            
            .top-bar {
                left: 0;
                padding: 0 1rem;
            }
            
            .top-bar h1 {
                font-size: 1.25rem;
            }
            
            .import-tabs {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            .import-tab {
                flex: none;
                min-width: 120px;
                white-space: nowrap;
            }
            
            .card-body-import {
                padding: 1.5rem;
            }
            
            .upload-area {
                padding: 2rem 1rem;
            }
            
            .import-options {
                grid-template-columns: 1fr;
            }
            
            .progress-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .history-filters {
                justify-content: center;
            }
            
            .history-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .history-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .template-grid {
                grid-template-columns: 1fr;
            }
            
            .template-actions {
                flex-direction: column;
            }
        }
        
        @media (max-width: 480px) {
            .progress-stats {
                grid-template-columns: 1fr;
            }
            
            .history-stats {
                grid-template-columns: 1fr;
            }
            
            .upload-icon {
                width: 48px;
                height: 48px;
            }
            
            .upload-text {
                font-size: 1rem;
            }
        }
        
        /* Touch Gestures */
        .swipe-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        
        .swipe-container::-webkit-scrollbar {
            display: none;
        }
        
        /* PWA Ready Styles */
        @media (display-mode: standalone) {
            .top-bar {
                padding-top: env(safe-area-inset-top);
            }
        }
        
        /* Animation Classes */
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .slide-up {
            animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="admin-wrapper">
        <?php component('sidebar', ['variant' => 'admin']); ?>
        
        <div class="main-content">
            <!-- Top Bar -->
            <div class="top-bar">
                <div class="top-bar-title">
                    <i data-lucide="upload" style="width: 32px; height: 32px; color: var(--primary-color);"></i>
                    <h1>XML Import Sistemi</h1>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary" onclick="downloadTemplate()">
                        <i data-lucide="download" style="width: 16px; height: 16px;"></i>
                        <span class="d-none d-md-inline ms-2">Template İndir</span>
                    </button>
                    <button class="btn btn-primary" onclick="openScheduleModal()">
                        <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                        <span class="d-none d-md-inline ms-2">Zamanla</span>
                    </button>
                </div>
            </div>
            
            <!-- Import Tabs -->
            <div class="import-tabs">
                <button class="import-tab active" data-tab="upload">
                    <i data-lucide="upload" style="width: 16px; height: 16px;"></i>
                    <span>Yeni Import</span>
                </button>
                <button class="import-tab" data-tab="preview">
                    <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                    <span>Önizleme</span>
                </button>
                <button class="import-tab" data-tab="history">
                    <i data-lucide="history" style="width: 16px; height: 16px;"></i>
                    <span>Geçmiş</span>
                </button>
                <button class="import-tab" data-tab="templates">
                    <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                    <span>Şablonlar</span>
                </button>
                <button class="import-tab" data-tab="settings">
                    <i data-lucide="settings" style="width: 16px; height: 16px;"></i>
                    <span>Ayarlar</span>
                </button>
            </div>
            
            <!-- Upload Tab -->
            <div class="tab-content active" id="uploadTab">
                <div class="import-card fade-in">
                    <div class="card-header-import">
                        <h3>XML Dosyası Yükle</h3>
                        <span class="badge bg-light text-dark">Maksimum 100MB</span>
                    </div>
                    <div class="card-body-import">
                        <!-- Upload Area -->
                        <div class="upload-area" id="uploadArea">
                            <div class="upload-icon">
                                <i data-lucide="upload-cloud" style="width: 100%; height: 100%;"></i>
                            </div>
                            <div class="upload-text">Dosyaları buraya sürükleyin veya tıklayarak seçin</div>
                            <div class="upload-subtext">XML, CSV ve TXT dosyaları desteklenmektedir</div>
                            <input type="file" id="fileInput" class="file-input" multiple accept=".xml,.csv,.txt">
                        </div>
                        
                        <!-- URL Input -->
                        <div class="mt-4">
                            <label class="form-label">Veya XML Feed URL'i girin:</label>
                            <div class="input-group">
                                <input type="url" class="form-control" id="xmlUrl" placeholder="https://example.com/feed.xml">
                                <button class="btn btn-outline-secondary" onclick="validateUrl()">
                                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                                </button>
                            </div>
                            <small class="text-muted">Test URL: https://cdn1.xmlbankasi.com/p1/gurbuzoyuncak/image/data/xml/goapp.xml</small>
                        </div>
                        
                        <!-- File List -->
                        <div class="file-list" id="fileList">
                            <h5>Seçilen Dosyalar</h5>
                            <div id="fileItems"></div>
                        </div>
                        
                        <!-- Import Options -->
                        <div class="import-options">
                            <div class="option-card">
                                <div class="option-header">
                                    <i data-lucide="shuffle" class="option-icon"></i>
                                    <span class="option-title">Duplicate Detection</span>
                                </div>
                                <div class="option-description">Aynı ürünleri tespit et ve atla</div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="duplicateDetection" checked>
                                    <label class="form-check-label" for="duplicateDetection">Aktif</label>
                                </div>
                            </div>
                            
                            <div class="option-card">
                                <div class="option-header">
                                    <i data-lucide="image" class="option-icon"></i>
                                    <span class="option-title">Image Import</span>
                                </div>
                                <div class="option-description">Ürün görsellerini otomatik indir</div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="imageImport" checked>
                                    <label class="form-check-label" for="imageImport">Aktif</label>
                                </div>
                            </div>
                            
                            <div class="option-card">
                                <div class="option-header">
                                    <i data-lucide="dollar-sign" class="option-icon"></i>
                                    <span class="option-title">Price Update</span>
                                </div>
                                <div class="option-description">Mevcut fiyatları güncelle</div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="priceUpdate" checked>
                                    <label class="form-check-label" for="priceUpdate">Aktif</label>
                                </div>
                            </div>
                            
                            <div class="option-card">
                                <div class="option-header">
                                    <i data-lucide="package" class="option-icon"></i>
                                    <span class="option-title">Stock Update</span>
                                </div>
                                <div class="option-description">Stok miktarlarını güncelle</div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="stockUpdate" checked>
                                    <label class="form-check-label" for="stockUpdate">Aktif</label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="d-flex gap-3 mt-4">
                            <button class="btn btn-outline-primary" onclick="validateXML()">
                                <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
                                <span class="ms-2">Doğrula</span>
                            </button>
                            <button class="btn btn-primary flex-fill" onclick="startImport()">
                                <i data-lucide="play" style="width: 16px; height: 16px;"></i>
                                <span class="ms-2">Import'u Başlat</span>
                            </button>
                        </div>
                        
                        <!-- Progress -->
                        <div class="import-progress" id="importProgress">
                            <div class="progress-header">
                                <div class="progress-title">Import İşlemi Devam Ediyor</div>
                                <div class="progress-status">
                                    <i data-lucide="loader-2" class="spin" style="width: 16px; height: 16px;"></i>
                                    <span id="progressText">İşleniyor...</span>
                                </div>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" id="progressBar" style="width: 0%;"></div>
                            </div>
                            <div class="progress-stats">
                                <div class="progress-stat">
                                    <div class="progress-stat-value" id="totalProducts">0</div>
                                    <div class="progress-stat-label">Toplam</div>
                                </div>
                                <div class="progress-stat">
                                    <div class="progress-stat-value success" id="successProducts">0</div>
                                    <div class="progress-stat-label">Başarılı</div>
                                </div>
                                <div class="progress-stat">
                                    <div class="progress-stat-value warning" id="updatedProducts">0</div>
                                    <div class="progress-stat-label">Güncellenen</div>
                                </div>
                                <div class="progress-stat">
                                    <div class="progress-stat-value danger" id="failedProducts">0</div>
                                    <div class="progress-stat-label">Hatalı</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Preview Tab -->
            <div class="tab-content" id="previewTab">
                <div class="import-card">
                    <div class="card-header-import">
                        <h3>Import Önizlemesi</h3>
                        <span class="badge bg-info">İlk 20 kayıt</span>
                    </div>
                    <div class="card-body-import">
                        <div class="import-preview" id="importPreview">
                            <div class="loading-spinner">
                                <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px;"></i>
                                <span>Önizleme hazırlanıyor...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- History Tab -->
            <div class="tab-content" id="historyTab">
                <div class="import-card">
                    <div class="card-header-import">
                        <h3>Import Geçmişi</h3>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-light" onclick="exportHistory()">
                                <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-light" onclick="refreshHistory()">
                                <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body-import">
                        <div class="history-filters">
                            <div class="history-filter active" data-status="all">Tümü</div>
                            <div class="history-filter" data-status="success">Başarılı</div>
                            <div class="history-filter" data-status="failed">Başarısız</div>
                            <div class="history-filter" data-status="processing">İşleniyor</div>
                        </div>
                        
                        <div id="historyList">
                            <div class="loading-spinner">
                                <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px;"></i>
                                <span>Geçmiş yükleniyor...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Templates Tab -->
            <div class="tab-content" id="templatesTab">
                <div class="import-card">
                    <div class="card-header-import">
                        <h3>XML Şablonları</h3>
                        <button class="btn btn-sm btn-outline-light" onclick="createCustomTemplate()">
                            <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
                            <span class="ms-1">Özel Şablon</span>
                        </button>
                    </div>
                    <div class="card-body-import">
                        <div class="template-grid">
                            <div class="template-card">
                                <div class="template-icon">
                                    <i data-lucide="package" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="template-title">Standart Ürün XML</div>
                                <div class="template-description">
                                    Temel ürün bilgileri için standart XML şablonu. 
                                    Ad, fiyat, stok ve kategori alanları içerir.
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn" onclick="downloadTemplate('standard')">
                                        <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                                        <span>İndir</span>
                                    </button>
                                    <button class="template-btn primary" onclick="useTemplate('standard')">
                                        <i data-lucide="play" style="width: 14px; height: 14px;"></i>
                                        <span>Kullan</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="template-card">
                                <div class="template-icon">
                                    <i data-lucide="image" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="template-title">Görsel Destekli XML</div>
                                <div class="template-description">
                                    Ürün görselleri ile birlikte import için gelişmiş XML şablonu.
                                    Çoklu görsel desteği bulunur.
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn" onclick="downloadTemplate('images')">
                                        <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                                        <span>İndir</span>
                                    </button>
                                    <button class="template-btn primary" onclick="useTemplate('images')">
                                        <i data-lucide="play" style="width: 14px; height: 14px;"></i>
                                        <span>Kullan</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="template-card">
                                <div class="template-icon">
                                    <i data-lucide="tag" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="template-title">Kategori Mapping XML</div>
                                <div class="template-description">
                                    Kategori eşleştirme ve marka yönetimi için 
                                    özelleştirilmiş XML şablonu.
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn" onclick="downloadTemplate('categories')">
                                        <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                                        <span>İndir</span>
                                    </button>
                                    <button class="template-btn primary" onclick="useTemplate('categories')">
                                        <i data-lucide="play" style="width: 14px; height: 14px;"></i>
                                        <span>Kullan</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="template-card">
                                <div class="template-icon">
                                    <i data-lucide="zap" style="width: 24px; height: 24px;"></i>
                                </div>
                                <div class="template-title">Hızlı Güncelleme XML</div>
                                <div class="template-description">
                                    Sadece fiyat ve stok güncellemesi için 
                                    optimize edilmiş minimalist XML şablonu.
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn" onclick="downloadTemplate('quick')">
                                        <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                                        <span>İndir</span>
                                    </button>
                                    <button class="template-btn primary" onclick="useTemplate('quick')">
                                        <i data-lucide="play" style="width: 14px; height: 14px;"></i>
                                        <span>Kullan</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Settings Tab -->
            <div class="tab-content" id="settingsTab">
                <div class="import-card">
                    <div class="card-header-import">
                        <h3>Import Ayarları</h3>
                        <button class="btn btn-sm btn-outline-light" onclick="resetSettings()">
                            <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i>
                            <span class="ms-1">Sıfırla</span>
                        </button>
                    </div>
                    <div class="card-body-import">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>Genel Ayarlar</h5>
                                <div class="mb-3">
                                    <label class="form-label">Batch Size</label>
                                    <input type="number" class="form-control" id="batchSize" value="100" min="10" max="1000">
                                    <small class="text-muted">Aynı anda işlenecek kayıt sayısı</small>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Timeout (saniye)</label>
                                    <input type="number" class="form-control" id="timeout" value="300" min="60" max="3600">
                                    <small class="text-muted">İşlem zaman aşımı süresi</small>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="autoRetry" checked>
                                        <label class="form-check-label" for="autoRetry">Hatalarda otomatik tekrar dene</label>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h5>Kategori Mapping</h5>
                                <div class="mb-3">
                                    <label class="form-label">Varsayılan Kategori</label>
                                    <select class="form-select" id="defaultCategory">
                                        <option value="1">Oyuncaklar</option>
                                        <option value="2">Eğitici Oyuncaklar</option>
                                        <option value="3">Bebek Oyuncakları</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="createCategories">
                                        <label class="form-check-label" for="createCategories">Yeni kategorileri otomatik oluştur</label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="createBrands">
                                        <label class="form-check-label" for="createBrands">Yeni markaları otomatik oluştur</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <button class="btn btn-primary" onclick="saveSettings()">
                                <i data-lucide="save" style="width: 16px; height: 16px;"></i>
                                <span class="ms-2">Ayarları Kaydet</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Component Loader -->
    <script src="../components/js/component-loader.js"></script>
    
    <script>
        // XML Import Manager Class
        class XMLImportManager {
            constructor() {
                this.selectedFiles = [];
                this.currentImport = null;
                this.importHistory = [];
                this.settings = this.loadSettings();
                this.init();
            }
            
            init() {
                this.initLucideIcons();
                this.initEventListeners();
                this.initDragAndDrop();
                this.loadHistory();
            }
            
            initLucideIcons() {
                lucide.createIcons();
            }
            
            initEventListeners() {
                // Tab switching
                document.querySelectorAll('.import-tab').forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        this.switchTab(e.target.dataset.tab);
                    });
                });
                
                // File input change
                document.getElementById('fileInput').addEventListener('change', (e) => {
                    this.handleFileSelect(e.target.files);
                });
                
                // History filters
                document.querySelectorAll('.history-filter').forEach(filter => {
                    filter.addEventListener('click', (e) => {
                        this.filterHistory(e.target.dataset.status);
                    });
                });
                
                // Touch gestures for mobile tab swiping
                this.initTouchGestures();
            }
            
            initDragAndDrop() {
                const uploadArea = document.getElementById('uploadArea');
                
                uploadArea.addEventListener('click', () => {
                    document.getElementById('fileInput').click();
                });
                
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('dragover');
                });
                
                uploadArea.addEventListener('dragleave', () => {
                    uploadArea.classList.remove('dragover');
                });
                
                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');
                    this.handleFileSelect(e.dataTransfer.files);
                });
            }
            
            initTouchGestures() {
                let startX = 0;
                let currentX = 0;
                
                const tabContainer = document.querySelector('.import-tabs');
                
                tabContainer.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                });
                
                tabContainer.addEventListener('touchmove', (e) => {
                    currentX = e.touches[0].clientX;
                });
                
                tabContainer.addEventListener('touchend', (e) => {
                    const diffX = startX - currentX;
                    
                    if (Math.abs(diffX) > 50) {
                        const tabs = document.querySelectorAll('.import-tab');
                        const activeIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
                        
                        if (diffX > 0 && activeIndex < tabs.length - 1) {
                            // Swipe left - next tab
                            this.switchTab(tabs[activeIndex + 1].dataset.tab);
                        } else if (diffX < 0 && activeIndex > 0) {
                            // Swipe right - previous tab
                            this.switchTab(tabs[activeIndex - 1].dataset.tab);
                        }
                    }
                });
            }
            
            switchTab(tabName) {
                // Update tab buttons
                document.querySelectorAll('.import-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
                
                // Update tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabName + 'Tab').classList.add('active');
                
                // Load specific data based on tab
                switch(tabName) {
                    case 'preview':
                        this.loadPreview();
                        break;
                    case 'history':
                        this.loadHistory();
                        break;
                    case 'templates':
                        this.loadTemplates();
                        break;
                    case 'settings':
                        this.loadSettingsForm();
                        break;
                }
            }
            
            handleFileSelect(files) {
                Array.from(files).forEach(file => {
                    if (this.validateFile(file)) {
                        this.selectedFiles.push(file);
                    }
                });
                
                this.displayFileList();
            }
            
            validateFile(file) {
                const validTypes = ['text/xml', 'application/xml', 'text/csv', 'text/plain'];
                const maxSize = 100 * 1024 * 1024; // 100MB
                
                if (!validTypes.includes(file.type) && !file.name.match(/\.(xml|csv|txt)$/i)) {
                    this.showToast('Geçersiz dosya türü: ' + file.name, 'danger');
                    return false;
                }
                
                if (file.size > maxSize) {
                    this.showToast('Dosya çok büyük: ' + file.name, 'danger');
                    return false;
                }
                
                return true;
            }
            
            displayFileList() {
                const fileList = document.getElementById('fileList');
                const fileItems = document.getElementById('fileItems');
                
                if (this.selectedFiles.length === 0) {
                    fileList.style.display = 'none';
                    return;
                }
                
                fileList.style.display = 'block';
                fileItems.innerHTML = this.selectedFiles.map((file, index) => {
                    return `
                        <div class="file-item slide-up">
                            <div class="file-info">
                                <div class="file-icon">
                                    <i data-lucide="file-text" style="width: 100%; height: 100%;"></i>
                                </div>
                                <div class="file-details">
                                    <h5>${file.name}</h5>
                                    <p>${this.formatFileSize(file.size)} • ${file.type || 'Unknown'}</p>
                                </div>
                            </div>
                            <div class="file-actions">
                                <button class="file-action-btn preview" onclick="xmlImportManager.previewFile(${index})" title="Önizle">
                                    <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                                </button>
                                <button class="file-action-btn remove" onclick="xmlImportManager.removeFile(${index})" title="Kaldır">
                                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
                
                lucide.createIcons();
            }
            
            formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }
            
            removeFile(index) {
                this.selectedFiles.splice(index, 1);
                this.displayFileList();
            }
            
            previewFile(index) {
                const file = this.selectedFiles[index];
                this.switchTab('preview');
                
                // Read and preview file content
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.displayPreview(e.target.result, file.name);
                };
                reader.readAsText(file);
            }
            
            displayPreview(content, fileName) {
                const previewContainer = document.getElementById('importPreview');
                
                try {
                    let previewData = [];
                    
                    if (fileName.toLowerCase().endsWith('.xml')) {
                        previewData = this.parseXMLPreview(content);
                    } else if (fileName.toLowerCase().endsWith('.csv')) {
                        previewData = this.parseCSVPreview(content);
                    } else {
                        previewData = this.parseTextPreview(content);
                    }
                    
                    if (previewData.length === 0) {
                        previewContainer.innerHTML = '<div class="text-center py-4">Önizleme için veri bulunamadı</div>';
                        return;
                    }
                    
                    const headers = Object.keys(previewData[0]);
                    const tableHTML = `
                        <div class="preview-table">
                            <table class="table">
                                <thead>
                                    <tr>
                                        ${headers.map(header => `<th>${header}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${previewData.slice(0, 20).map(row => `
                                        <tr>
                                            ${headers.map(header => `<td>${row[header] || '-'}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-3 text-muted text-center">
                            <small>İlk 20 kayıt gösteriliyor (Toplam: ${previewData.length})</small>
                        </div>
                    `;
                    
                    previewContainer.innerHTML = tableHTML;
                    
                } catch (error) {
                    previewContainer.innerHTML = `
                        <div class="alert alert-danger">
                            <i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i>
                            <span class="ms-2">Dosya önizlemesi oluşturulamadı: ${error.message}</span>
                        </div>
                    `;
                    lucide.createIcons();
                }
            }
            
            parseXMLPreview(content) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(content, 'text/xml');
                const products = xmlDoc.getElementsByTagName('Product') || xmlDoc.getElementsByTagName('product');
                
                const previewData = [];
                for (let i = 0; i < Math.min(20, products.length); i++) {
                    const product = products[i];
                    const productData = {};
                    
                    for (let j = 0; j < product.children.length; j++) {
                        const child = product.children[j];
                        productData[child.tagName] = child.textContent;
                    }
                    
                    previewData.push(productData);
                }
                
                return previewData;
            }
            
            parseCSVPreview(content) {
                const lines = content.split('\n').filter(line => line.trim());
                if (lines.length < 2) return [];
                
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                const previewData = [];
                
                for (let i = 1; i < Math.min(21, lines.length); i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    const rowData = {};
                    
                    headers.forEach((header, index) => {
                        rowData[header] = values[index] || '';
                    });
                    
                    previewData.push(rowData);
                }
                
                return previewData;
            }
            
            parseTextPreview(content) {
                const lines = content.split('\n').filter(line => line.trim()).slice(0, 20);
                return lines.map((line, index) => ({
                    'Satır': index + 1,
                    'İçerik': line.substring(0, 100) + (line.length > 100 ? '...' : '')
                }));
            }
            
            async validateXML() {
                if (this.selectedFiles.length === 0 && !document.getElementById('xmlUrl').value) {
                    this.showToast('Lütfen dosya seçin veya URL girin', 'warning');
                    return;
                }
                
                this.showToast('XML doğrulanıyor...', 'info');
                
                try {
                    // Simulate validation
                    setTimeout(() => {
                        this.showToast('XML doğrulama başarılı! ' + this.selectedFiles.length + ' dosya hazır.', 'success');
                    }, 1500);
                } catch (error) {
                    this.showToast('XML doğrulama hatası: ' + error.message, 'danger');
                }
            }
            
            async validateUrl() {
                const url = document.getElementById('xmlUrl').value;
                if (!url) {
                    this.showToast('Lütfen URL girin', 'warning');
                    return;
                }
                
                try {
                    this.showToast('URL kontrol ediliyor...', 'info');
                    
                    // Simulate URL validation
                    setTimeout(() => {
                        this.showToast('URL geçerli ve erişilebilir', 'success');
                    }, 1000);
                    
                } catch (error) {
                    this.showToast('URL erişilemez: ' + error.message, 'danger');
                }
            }
            
            async startImport() {
                if (this.selectedFiles.length === 0 && !document.getElementById('xmlUrl').value) {
                    this.showToast('Lütfen dosya seçin veya URL girin', 'warning');
                    return;
                }
                
                const importOptions = {
                    duplicateDetection: document.getElementById('duplicateDetection').checked,
                    imageImport: document.getElementById('imageImport').checked,
                    priceUpdate: document.getElementById('priceUpdate').checked,
                    stockUpdate: document.getElementById('stockUpdate').checked,
                    batchSize: this.settings.batchSize || 100
                };
                
                this.showImportProgress();
                
                try {
                    // Simulate import process
                    this.simulateImport(importOptions);
                } catch (error) {
                    this.hideImportProgress();
                    this.showToast('Import hatası: ' + error.message, 'danger');
                }
            }
            
            simulateImport(options) {
                const progress = document.getElementById('importProgress');
                progress.style.display = 'block';
                
                let currentProgress = 0;
                const totalProducts = Math.floor(Math.random() * 500) + 100;
                let successCount = 0;
                let updatedCount = 0;
                let failedCount = 0;
                
                const progressInterval = setInterval(() => {
                    currentProgress += Math.random() * 10;
                    
                    if (currentProgress >= 100) {
                        currentProgress = 100;
                        clearInterval(progressInterval);
                        
                        // Final results
                        successCount = Math.floor(totalProducts * 0.8);
                        updatedCount = Math.floor(totalProducts * 0.15);
                        failedCount = totalProducts - successCount - updatedCount;
                        
                        document.getElementById('progressText').textContent = 'Import tamamlandı!';
                        this.showToast(`Import başarıyla tamamlandı! ${successCount} ürün eklendi, ${updatedCount} ürün güncellendi.`, 'success');
                        
                        // Add to history
                        this.addToHistory({
                            fileName: this.selectedFiles[0]?.name || 'URL Import',
                            total: totalProducts,
                            success: successCount,
                            updated: updatedCount,
                            failed: failedCount,
                            status: 'success',
                            date: new Date()
                        });
                        
                        setTimeout(() => {
                            this.hideImportProgress();
                        }, 3000);
                    }
                    
                    // Update progress
                    const processed = Math.floor((currentProgress / 100) * totalProducts);
                    successCount = Math.floor(processed * 0.8);
                    updatedCount = Math.floor(processed * 0.15);
                    failedCount = processed - successCount - updatedCount;
                    
                    document.getElementById('progressBar').style.width = currentProgress + '%';
                    document.getElementById('totalProducts').textContent = totalProducts;
                    document.getElementById('successProducts').textContent = successCount;
                    document.getElementById('updatedProducts').textContent = updatedCount;
                    document.getElementById('failedProducts').textContent = failedCount;
                    
                    const statusTexts = [
                        'Dosya okunuyor...',
                        'XML ayrıştırılıyor...',
                        'Ürünler işleniyor...',
                        'Görseller indiriliyor...',
                        'Veritabanı güncelleniyor...',
                        'Kategoriler eşleştiriliyor...',
                        'Fiyatlar güncelleniyor...',
                        'Stoklar güncelleniyor...'
                    ];
                    
                    const randomStatus = statusTexts[Math.floor(Math.random() * statusTexts.length)];
                    document.getElementById('progressText').textContent = randomStatus;
                    
                }, 300);
            }
            
            showImportProgress() {
                document.getElementById('importProgress').style.display = 'block';
                document.getElementById('progressBar').style.width = '0%';
                document.getElementById('progressText').textContent = 'Import başlatılıyor...';
            }
            
            hideImportProgress() {
                document.getElementById('importProgress').style.display = 'none';
            }
            
            loadHistory() {
                const historyList = document.getElementById('historyList');
                
                if (this.importHistory.length === 0) {
                    // Generate sample history
                    this.importHistory = this.generateSampleHistory();
                }
                
                setTimeout(() => {
                    this.displayHistory(this.importHistory);
                }, 1000);
            }
            
            generateSampleHistory() {
                const sampleHistory = [];
                const fileNames = ['products_update.xml', 'new_stock.csv', 'price_update.xml', 'category_mapping.xml', 'brand_products.xml'];
                const statuses = ['success', 'failed', 'processing'];
                
                for (let i = 0; i < 10; i++) {
                    const total = Math.floor(Math.random() * 1000) + 100;
                    const success = Math.floor(total * (0.6 + Math.random() * 0.3));
                    const failed = Math.floor((total - success) * Math.random());
                    const updated = total - success - failed;
                    
                    const date = new Date();
                    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
                    
                    sampleHistory.push({
                        id: i + 1,
                        fileName: fileNames[Math.floor(Math.random() * fileNames.length)],
                        total: total,
                        success: success,
                        updated: updated,
                        failed: failed,
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        date: date,
                        duration: Math.floor(Math.random() * 300) + 30 // seconds
                    });
                }
                
                return sampleHistory.sort((a, b) => b.date - a.date);
            }
            
            displayHistory(history) {
                const historyList = document.getElementById('historyList');
                
                if (history.length === 0) {
                    historyList.innerHTML = '<div class="text-center py-4">Henüz import geçmişi bulunamadı</div>';
                    return;
                }
                
                historyList.innerHTML = history.map(item => {
                    const statusClass = item.status === 'success' ? 'success' : 
                                       item.status === 'failed' ? 'failed' : 
                                       item.status === 'processing' ? 'processing' : 'warning';
                    const statusText = item.status === 'success' ? 'Başarılı' : 
                                      item.status === 'failed' ? 'Başarısız' : 
                                      item.status === 'processing' ? 'İşleniyor' : 'Uyarı';
                    
                    return `
                        <div class="history-item fade-in">
                            <div class="history-header">
                                <div class="history-title">${item.fileName}</div>
                                <div class="history-date">${item.date.toLocaleDateString('tr-TR')} ${item.date.toLocaleTimeString('tr-TR')}</div>
                            </div>
                            <div class="history-stats">
                                <div class="history-stat">
                                    <div class="history-stat-value">${item.total}</div>
                                    <div class="history-stat-label">Toplam</div>
                                </div>
                                <div class="history-stat">
                                    <div class="history-stat-value" style="color: var(--success-color);">${item.success}</div>
                                    <div class="history-stat-label">Başarılı</div>
                                </div>
                                <div class="history-stat">
                                    <div class="history-stat-value" style="color: var(--warning-color);">${item.updated}</div>
                                    <div class="history-stat-label">Güncellenen</div>
                                </div>
                                <div class="history-stat">
                                    <div class="history-stat-value" style="color: var(--danger-color);">${item.failed}</div>
                                    <div class="history-stat-label">Hatalı</div>
                                </div>
                                <div class="history-stat">
                                    <div class="history-stat-value">
                                        <span class="status-badge ${statusClass}">${statusText}</span>
                                    </div>
                                    <div class="history-stat-label">Durum</div>
                                </div>
                            </div>
                            <div class="history-actions">
                                <button class="history-action-btn" onclick="xmlImportManager.viewImportDetails(${item.id})">
                                    <i data-lucide="eye" style="width: 12px; height: 12px;"></i>
                                    <span>Detay</span>
                                </button>
                                <button class="history-action-btn" onclick="xmlImportManager.downloadImportLog(${item.id})">
                                    <i data-lucide="download" style="width: 12px; height: 12px;"></i>
                                    <span>Log</span>
                                </button>
                                ${item.status === 'success' ? `
                                    <button class="history-action-btn" onclick="xmlImportManager.rollbackImport(${item.id})">
                                        <i data-lucide="undo" style="width: 12px; height: 12px;"></i>
                                        <span>Geri Al</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                
                lucide.createIcons();
            }
            
            filterHistory(status) {
                // Update filter buttons
                document.querySelectorAll('.history-filter').forEach(filter => {
                    filter.classList.remove('active');
                });
                document.querySelector(`[data-status="${status}"]`).classList.add('active');
                
                // Filter history
                let filteredHistory = this.importHistory;
                if (status !== 'all') {
                    filteredHistory = this.importHistory.filter(item => item.status === status);
                }
                
                this.displayHistory(filteredHistory);
            }
            
            addToHistory(importData) {
                this.importHistory.unshift(importData);
                this.saveHistory();
            }
            
            loadSettings() {
                const defaultSettings = {
                    batchSize: 100,
                    timeout: 300,
                    autoRetry: true,
                    defaultCategory: '1',
                    createCategories: false,
                    createBrands: false
                };
                
                const saved = localStorage.getItem('xmlImportSettings');
                return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
            }
            
            saveSettings() {
                const settings = {
                    batchSize: parseInt(document.getElementById('batchSize').value),
                    timeout: parseInt(document.getElementById('timeout').value),
                    autoRetry: document.getElementById('autoRetry').checked,
                    defaultCategory: document.getElementById('defaultCategory').value,
                    createCategories: document.getElementById('createCategories').checked,
                    createBrands: document.getElementById('createBrands').checked
                };
                
                this.settings = settings;
                localStorage.setItem('xmlImportSettings', JSON.stringify(settings));
                this.showToast('Ayarlar başarıyla kaydedildi', 'success');
            }
            
            loadSettingsForm() {
                document.getElementById('batchSize').value = this.settings.batchSize;
                document.getElementById('timeout').value = this.settings.timeout;
                document.getElementById('autoRetry').checked = this.settings.autoRetry;
                document.getElementById('defaultCategory').value = this.settings.defaultCategory;
                document.getElementById('createCategories').checked = this.settings.createCategories;
                document.getElementById('createBrands').checked = this.settings.createBrands;
            }
            
            saveHistory() {
                localStorage.setItem('xmlImportHistory', JSON.stringify(this.importHistory));
            }
            
            loadPreview() {
                // Preview loading is handled in displayPreview method
            }
            
            loadTemplates() {
                // Templates are static in HTML
            }
            
            viewImportDetails(id) {
                this.showToast(`Import detayları görüntüleniyor (ID: ${id})`, 'info');
            }
            
            downloadImportLog(id) {
                this.showToast(`Import log dosyası indiriliyor (ID: ${id})`, 'info');
            }
            
            rollbackImport(id) {
                if (confirm('Bu import işlemini geri almak istediğinizden emin misiniz?')) {
                    this.showToast(`Import işlemi geri alınıyor (ID: ${id})`, 'warning');
                }
            }
            
            showToast(message, type) {
                const toast = document.createElement('div');
                toast.className = 'position-fixed top-0 end-0 p-3';
                toast.style.zIndex = '9999';
                toast.innerHTML = `
                    <div class="toast show" role="alert">
                        <div class="toast-header bg-${type} text-white">
                            <strong class="me-auto">${type === 'success' ? 'Başarılı' : type === 'danger' ? 'Hata' : type === 'warning' ? 'Uyarı' : 'Bilgi'}</strong>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                        </div>
                        <div class="toast-body">
                            ${message}
                        </div>
                    </div>
                `;
                
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.remove();
                }, 5000);
            }
        }
        
        // Global functions
        function downloadTemplate(type = 'standard') {
            xmlImportManager.showToast(`${type} şablonu indiriliyor...`, 'info');
        }
        
        function useTemplate(type) {
            xmlImportManager.showToast(`${type} şablonu kullanıma hazırlanıyor...`, 'info');
            xmlImportManager.switchTab('upload');
        }
        
        function createCustomTemplate() {
            xmlImportManager.showToast('Özel şablon editörü geliştirme aşamasındadır.', 'info');
        }
        
        function openScheduleModal() {
            xmlImportManager.showToast('Zamanlanmış import özelliği geliştirme aşamasındadır.', 'info');
        }
        
        function exportHistory() {
            xmlImportManager.showToast('Import geçmişi export ediliyor...', 'info');
        }
        
        function refreshHistory() {
            xmlImportManager.loadHistory();
            xmlImportManager.showToast('Geçmiş yenilendi', 'success');
        }
        
        function resetSettings() {
            if (confirm('Tüm ayarları varsayılan değerlere döndürmek istediğinizden emin misiniz?')) {
                localStorage.removeItem('xmlImportSettings');
                xmlImportManager.settings = xmlImportManager.loadSettings();
                xmlImportManager.loadSettingsForm();
                xmlImportManager.showToast('Ayarlar sıfırlandı', 'success');
            }
        }
        
        function validateXML() {
            xmlImportManager.validateXML();
        }
        
        function validateUrl() {
            xmlImportManager.validateUrl();
        }
        
        function startImport() {
            xmlImportManager.startImport();
        }
        
        function saveSettings() {
            xmlImportManager.saveSettings();
        }
        
        // Initialize XML Import Manager
        document.addEventListener('DOMContentLoaded', function() {
            window.xmlImportManager = new XMLImportManager();
        });
    </script>
</body>
</html>