<?php
session_start();
require_once '../includes/auth.php';

// Giriş kontrolü
if (!isset($_SESSION['bayi_logged_in']) || $_SESSION['bayi_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');

try {
    // Güncel bayi bilgilerini getir
    $bayi_data = getCurrentBayi();
    
    if ($bayi_data) {
        // Session'u güncelle
        $_SESSION['bayi_balance'] = $bayi_data['balance'];
        
        echo json_encode([
            'success' => true,
            'balance' => formatMoney($bayi_data['balance']),
            'balance_raw' => floatval($bayi_data['balance']),
            'credit_limit' => formatMoney($bayi_data['credit_limit']),
            'credit_limit_raw' => floatval($bayi_data['credit_limit']),
            'status' => $bayi_data['status']
        ]);
    } else {
        echo json_encode([
            'error' => 'Bayi bilgileri alınamadı'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Sistem hatası'
    ]);
}
?>