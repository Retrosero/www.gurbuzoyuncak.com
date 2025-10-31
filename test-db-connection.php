<?php
/**
 * Veritabanı Bağlantı Test Dosyası
 * Bu dosyayı tarayıcıdan çalıştırarak veritabanı bağlantısını test edebilirsiniz.
 * Test sonrası bu dosyayı sunucudan silin!
 */

// Config dosyasını yükle
require_once __DIR__ . '/config.php';

// Güvenlik: Sadece localhost'tan erişime izin ver
if ($_SERVER['REMOTE_ADDR'] !== '127.0.0.1' && $_SERVER['REMOTE_ADDR'] !== '::1') {
    die('Bu dosyaya sadece localhost üzerinden erişilebilir.');
}

?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Veritabanı Bağlantı Testi</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 30px;
            font-size: 28px;
            text-align: center;
        }
        
        .test-section {
            margin-bottom: 25px;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            background: #f8f9fa;
        }
        
        .test-section h2 {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .status.success {
            background: #d4edda;
            color: #155724;
        }
        
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 10px;
            margin-top: 15px;
        }
        
        .info-label {
            font-weight: 600;
            color: #6c757d;
        }
        
        .info-value {
            color: #2c3e50;
            word-break: break-all;
        }
        
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .alert.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .alert.warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .icon {
            width: 24px;
            height: 24px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔌 Veritabanı Bağlantı Testi</h1>
        
        <?php
        $allTestsPassed = true;
        
        // Test 1: Config Dosyası
        echo '<div class="test-section">';
        echo '<h2>📄 Config Dosyası</h2>';
        if (defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER')) {
            echo '<span class="status success">✓ Yüklendi</span>';
            echo '<div class="info-grid">';
            echo '<div class="info-label">Host:</div><div class="info-value">' . DB_HOST . '</div>';
            echo '<div class="info-label">Port:</div><div class="info-value">' . DB_PORT . '</div>';
            echo '<div class="info-label">Database:</div><div class="info-value">' . DB_NAME . '</div>';
            echo '<div class="info-label">Username:</div><div class="info-value">' . DB_USER . '</div>';
            echo '<div class="info-label">Charset:</div><div class="info-value">' . DB_CHARSET . '</div>';
            echo '</div>';
        } else {
            echo '<span class="status error">✗ Yüklenemedi</span>';
            $allTestsPassed = false;
        }
        echo '</div>';
        
        // Test 2: PDO Extension
        echo '<div class="test-section">';
        echo '<h2>🔧 PDO Extension</h2>';
        if (extension_loaded('pdo') && extension_loaded('pdo_mysql')) {
            echo '<span class="status success">✓ Yüklü</span>';
            echo '<div class="info-grid">';
            echo '<div class="info-label">PDO Version:</div><div class="info-value">' . PDO::ATTR_DRIVER_NAME . '</div>';
            echo '<div class="info-label">PHP Version:</div><div class="info-value">' . phpversion() . '</div>';
            echo '</div>';
        } else {
            echo '<span class="status error">✗ Yüklü Değil</span>';
            echo '<p style="margin-top: 10px; color: #721c24;">PDO veya PDO_MySQL extension yüklü değil!</p>';
            $allTestsPassed = false;
        }
        echo '</div>';
        
        // Test 3: Veritabanı Bağlantısı
        echo '<div class="test-section">';
        echo '<h2>🔗 Veritabanı Bağlantısı</h2>';
        
        try {
            $conn = getDbConnection();
            echo '<span class="status success">✓ Başarılı</span>';
            
            // Veritabanı bilgilerini al
            $stmt = $conn->query("SELECT DATABASE() as db_name, VERSION() as version");
            $info = $stmt->fetch();
            
            echo '<div class="info-grid">';
            echo '<div class="info-label">Bağlantı:</div><div class="info-value">Aktif</div>';
            echo '<div class="info-label">Database:</div><div class="info-value">' . $info['db_name'] . '</div>';
            echo '<div class="info-label">MySQL Version:</div><div class="info-value">' . $info['version'] . '</div>';
            echo '</div>';
            
            // Test 4: Tablo Kontrolü
            echo '</div>';
            echo '<div class="test-section">';
            echo '<h2>📊 Tablo Kontrolü</h2>';
            
            $stmt = $conn->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (count($tables) > 0) {
                echo '<span class="status success">✓ ' . count($tables) . ' tablo bulundu</span>';
                echo '<div style="margin-top: 15px;">';
                echo '<strong>Tablolar:</strong><br>';
                echo '<div style="margin-top: 10px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">';
                foreach ($tables as $table) {
                    echo '<div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #dee2e6;">' . $table . '</div>';
                }
                echo '</div>';
                echo '</div>';
            } else {
                echo '<span class="status warning">⚠ Tablo bulunamadı</span>';
                echo '<p style="margin-top: 10px; color: #856404;">Veritabanı boş görünüyor. Schema dosyalarını import etmeyi unutmayın!</p>';
            }
            
        } catch (PDOException $e) {
            echo '<span class="status error">✗ Başarısız</span>';
            echo '<div style="margin-top: 15px; padding: 15px; background: #f8d7da; border-radius: 6px; color: #721c24;">';
            echo '<strong>Hata:</strong><br>';
            echo htmlspecialchars($e->getMessage());
            echo '</div>';
            $allTestsPassed = false;
        }
        echo '</div>';
        
        // Sonuç
        if ($allTestsPassed) {
            echo '<div class="alert success">';
            echo '<strong>✓ Tüm testler başarılı!</strong><br>';
            echo 'Veritabanı bağlantınız çalışıyor. Artık bu dosyayı silebilirsiniz.';
            echo '</div>';
        } else {
            echo '<div class="alert error">';
            echo '<strong>✗ Bazı testler başarısız!</strong><br>';
            echo 'Lütfen yukarıdaki hataları kontrol edin ve düzeltin.';
            echo '</div>';
        }
        ?>
        
        <div class="footer">
            <strong>⚠️ Güvenlik Uyarısı:</strong><br>
            Test tamamlandıktan sonra bu dosyayı sunucudan silin!
        </div>
    </div>
</body>
</html>
