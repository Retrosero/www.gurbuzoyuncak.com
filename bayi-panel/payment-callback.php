<?php
/**
 * PayTR Callback Handler
 * PayTR'den gelen ödeme bildirimlerini işler
 */

// Hata raporlamayı aç (sadece geliştirme için)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Callback verilerini al
$post_data = $_POST;

// Log dosyasına yaz (debugging için)
$log_file = __DIR__ . '/../backend/logs/paytr_callback_' . date('Y-m-d') . '.log';
$log_dir = dirname($log_file);
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

file_put_contents($log_file, date('[Y-m-d H:i:s] ') . json_encode($post_data) . "\n", FILE_APPEND);

// Gerekli dosyaları dahil et
require_once __DIR__ . '/../backend/config/database.php';
require_once __DIR__ . '/../backend/classes/Bayi.php';
require_once __DIR__ . '/../backend/classes/PayTRBayi.php';

try {
    // Zorunlu alanları kontrol et
    if (!isset($post_data['merchant_oid']) || !isset($post_data['status']) || !isset($post_data['total_amount']) || !isset($post_data['hash'])) {
        file_put_contents($log_file, date('[Y-m-d H:i:s] ') . "ERROR: Eksik callback parametreleri\n", FILE_APPEND);
        echo "ERROR: Missing parameters";
        exit;
    }
    
    // Veritabanı bağlantısı
    $database = new Database();
    $db = $database->getConnection();
    
    // PayTR işlemi
    $paytr = new PayTRBayi($db);
    $result = $paytr->verifyCallback($post_data);
    
    if (isset($result['success']) && $result['success']) {
        // Başarılı
        file_put_contents($log_file, date('[Y-m-d H:i:s] ') . "SUCCESS: " . $post_data['merchant_oid'] . " - " . $result['message'] . "\n", FILE_APPEND);
        echo "OK";
    } else {
        // Hatalı
        $error_message = $result['error'] ?? 'Bilinmeyen hata';
        file_put_contents($log_file, date('[Y-m-d H:i:s] ') . "ERROR: " . $post_data['merchant_oid'] . " - " . $error_message . "\n", FILE_APPEND);
        echo "ERROR: " . $error_message;
    }
    
} catch (Exception $e) {
    file_put_contents($log_file, date('[Y-m-d H:i:s] ') . "EXCEPTION: " . $e->getMessage() . "\n", FILE_APPEND);
    echo "ERROR: Exception - " . $e->getMessage();
}
?>
