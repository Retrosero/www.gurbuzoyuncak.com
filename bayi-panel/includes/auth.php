<?php
/**
 * Bayi Panel Auth İşlemleri
 */

require_once '../backend/config/database.php';
require_once '../backend/classes/Bayi.php';

/**
 * Input temizleme
 */
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Bayi girişi
 */
function bayiLogin($email, $password) {
    $database = new Database();
    $db = $database->getConnection();
    
    $bayi = new Bayi($db);
    $bayi->email = $email;
    $bayi->password_hash = $password;
    
    $result = $bayi->girisYap();
    
    if ($result['success']) {
        // Session oluştur
        $_SESSION['bayi_logged_in'] = true;
        $_SESSION['bayi_id'] = $result['bayi']['bayi_id'];
        $_SESSION['bayi_email'] = $result['bayi']['email'];
        $_SESSION['bayi_company'] = $result['bayi']['company_name'];
        $_SESSION['bayi_name'] = $result['bayi']['contact_person'];
        $_SESSION['bayi_balance'] = $result['bayi']['balance'];
        $_SESSION['bayi_status'] = $result['bayi']['status'];
        $_SESSION['bayi_login_time'] = time();
        
        // Session güvenliği
        session_regenerate_id(true);
        
        return true;
    }
    
    return false;
}

/**
 * Bayi çıkışı
 */
function bayiLogout() {
    session_unset();
    session_destroy();
}

/**
 * Bayi giriş kontrolü
 */
function checkBayiLogin() {
    if (!isset($_SESSION['bayi_logged_in']) || $_SESSION['bayi_logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
    
    // Session timeout kontrolü (4 saat)
    if (isset($_SESSION['bayi_login_time']) && (time() - $_SESSION['bayi_login_time']) > 14400) {
        bayiLogout();
        header('Location: login.php?timeout=1');
        exit;
    }
    
    // Bayi aktif mi kontrol et
    if (!isset($_SESSION['bayi_status']) || $_SESSION['bayi_status'] !== 'active') {
        bayiLogout();
        header('Location: login.php?inactive=1');
        exit;
    }
}

/**
 * Mevcut bayi bilgilerini getir
 */
function getCurrentBayi() {
    if (!isset($_SESSION['bayi_id'])) {
        return false;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $bayi = new Bayi($db);
    $bayi->bayi_id = $_SESSION['bayi_id'];
    
    return $bayi->bilgileriGetir();
}

/**
 * Bakiye güncelle (session'da)
 */
function updateSessionBalance() {
    $bayi_data = getCurrentBayi();
    if ($bayi_data) {
        $_SESSION['bayi_balance'] = $bayi_data['balance'];
    }
}

/**
 * CSRF token oluştur
 */
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * CSRF token doğrula
 */
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Güvenli yönlendirme
 */
function safeRedirect($url) {
    $allowed_hosts = [$_SERVER['HTTP_HOST']];
    $parsed_url = parse_url($url);
    
    if (isset($parsed_url['host']) && !in_array($parsed_url['host'], $allowed_hosts)) {
        $url = '/bayi-panel/';
    }
    
    header('Location: ' . $url);
    exit;
}

/**
 * Hata mesajı göster
 */
function showError($message) {
    return '<div class="alert alert-error">' . htmlspecialchars($message) . '</div>';
}

/**
 * Başarı mesajı göster
 */
function showSuccess($message) {
    return '<div class="alert alert-success">' . htmlspecialchars($message) . '</div>';
}

/**
 * Para formatla
 */
function formatMoney($amount, $currency = 'TL') {
    return number_format($amount, 2, ',', '.') . ' ' . $currency;
}

/**
 * Tarih formatla
 */
function formatDate($date, $format = 'd.m.Y H:i') {
    return date($format, strtotime($date));
}

/**
 * İşlem türü metni
 */
function getTransactionTypeText($type) {
    $types = [
        'deposit' => 'Bakiye Yükleme',
        'withdrawal' => 'Bakiye Çekme',
        'order_payment' => 'Sipariş Ödemesi',
        'refund' => 'İade',
        'commission' => 'Komisyon',
        'adjustment' => 'Düzeltme'
    ];
    
    return $types[$type] ?? $type;
}

/**
 * Ödeme yöntemi metni
 */
function getPaymentMethodText($method) {
    $methods = [
        'bank_transfer' => 'Banka Havalesi',
        'credit_card' => 'Kredi Kartı',
        'paytr' => 'PayTR',
        'manual' => 'Manuel',
        'system' => 'Sistem',
        'test' => 'Test'
    ];
    
    return $methods[$method] ?? $method;
}

/**
 * İşlem durumu badge'i
 */
function getStatusBadge($status) {
    $badges = [
        'pending' => '<span class="badge badge-warning">Bekleyen</span>',
        'completed' => '<span class="badge badge-success">Tamamlandı</span>',
        'cancelled' => '<span class="badge badge-danger">İptal</span>',
        'failed' => '<span class="badge badge-danger">Başarısız</span>',
        'active' => '<span class="badge badge-success">Aktif</span>',
        'suspended' => '<span class="badge badge-warning">Askıda</span>',
        'success' => '<span class="badge badge-success">Başarılı</span>'
    ];
    
    return $badges[$status] ?? '<span class="badge badge-secondary">' . $status . '</span>';
}
?>