<?php
/**
 * Veritabanı Bağlantı Test API
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

try {
    // Config dosyasını yükle
    require_once __DIR__ . '/../../config.php';
    
    // Veritabanı bağlantısını test et
    $conn = getDbConnection();
    
    // Basit bir sorgu çalıştır
    $stmt = $conn->query("SELECT DATABASE() as db_name, VERSION() as version, NOW() as current_time");
    $info = $stmt->fetch();
    
    // Tablo sayısını al
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Başarılı yanıt
    echo json_encode([
        'success' => true,
        'message' => 'Veritabanı bağlantısı başarılı',
        'data' => [
            'database' => $info['db_name'],
            'mysql_version' => $info['version'],
            'current_time' => $info['current_time'],
            'table_count' => count($tables),
            'tables' => $tables,
            'config' => [
                'host' => DB_HOST,
                'port' => DB_PORT,
                'database' => DB_NAME,
                'charset' => DB_CHARSET
            ]
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Veritabanı bağlantı hatası',
        'error' => $e->getMessage(),
        'trace' => DEBUG_MODE ? $e->getTraceAsString() : null
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
