<?php
session_start();

// Admin session kontrolü
function checkAdminSession() {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
    
    // Session timeout kontrolü (30 dakika)
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
        session_unset();
        session_destroy();
        header('Location: login.php?timeout=1');
        exit;
    }
    
    $_SESSION['last_activity'] = time();
}

// Admin giriş kontrolü (boolean döner)
function isAdminLoggedIn() {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        return false;
    }
    
    // Session timeout kontrolü (30 dakika)
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
        session_unset();
        session_destroy();
        return false;
    }
    
    $_SESSION['last_activity'] = time();
    return true;
}

// CSRF token oluştur
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// CSRF token doğrula
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// XSS koruması
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Admin login işlemi
function adminLogin($username, $password) {
    // Veritabanından admin kontrolü (örnek - gerçek implementasyonda hash kontrolü yapılmalı)
    $validUsername = 'admin';
    $validPasswordHash = password_hash('admin123', PASSWORD_DEFAULT); // Gerçek uygulamada DB'den gelecek
    
    if ($username === $validUsername && password_verify($password, $validPasswordHash)) {
        session_regenerate_id(true); // Session fixation saldırılarına karşı
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['last_activity'] = time();
        return true;
    }
    return false;
}

// Admin logout işlemi
function adminLogout() {
    session_unset();
    session_destroy();
    header('Location: login.php');
    exit;
}
?>
