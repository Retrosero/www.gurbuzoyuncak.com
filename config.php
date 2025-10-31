<?php
/**
 * Ana Yapılandırma Dosyası
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

// Hata raporlama ayarları
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php-errors.log');

// Timezone ayarı
date_default_timezone_set('Europe/Istanbul');

// Veritabanı Yapılandırması
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'u2101458_gurbuz_oyuncak');
define('DB_USER', 'u2101458_gurbuzoyuncak');
define('DB_PASS', '?S3rhanK6l6y?');
define('DB_CHARSET', 'utf8mb4');

// Site Yapılandırması
define('SITE_URL', 'https://www.gurbuzoyuncak.com');
define('SITE_NAME', 'Gürbüz Oyuncak');
define('SITE_EMAIL', 'info@gurbuzoyuncak.com');
define('SITE_PHONE', '+90 (XXX) XXX XX XX');

// Dizin Yapılandırması
define('ROOT_PATH', __DIR__);
define('UPLOAD_PATH', ROOT_PATH . '/uploads');
define('PRODUCT_IMAGE_PATH', UPLOAD_PATH . '/products');
define('BANNER_IMAGE_PATH', UPLOAD_PATH . '/banners');
define('LOG_PATH', ROOT_PATH . '/logs');

// URL Yapılandırması
define('BASE_URL', SITE_URL);
define('ADMIN_URL', BASE_URL . '/admin');
define('API_URL', BASE_URL . '/backend/api');
define('ASSETS_URL', BASE_URL . '/assets');
define('UPLOADS_URL', BASE_URL . '/uploads');

// Güvenlik Yapılandırması
define('SESSION_LIFETIME', 1800);
define('CSRF_TOKEN_NAME', 'csrf_token');
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_TIMEOUT', 900);

// Dosya Yükleme Yapılandırması
define('MAX_FILE_SIZE', 5 * 1024 * 1024);
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_IMAGE_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Ödeme Yapılandırması
define('PAYMENT_CURRENCY', 'TRY');
define('PAYMENT_LOCALE', 'tr');

// Cache Yapılandırması
define('CACHE_ENABLED', true);
define('CACHE_LIFETIME', 3600);

// Sayfalama Yapılandırması
define('ITEMS_PER_PAGE', 20);
define('ADMIN_ITEMS_PER_PAGE', 50);

// Ürün Yapılandırması
define('LOW_STOCK_THRESHOLD', 10);
define('OUT_OF_STOCK_THRESHOLD', 0);

// Kampanya Yapılandırması
define('MAX_DISCOUNT_PERCENTAGE', 90);
define('MIN_CART_AMOUNT', 0);

// Puan Sistemi Yapılandırması
define('POINTS_PER_TRY', 1);
define('POINTS_EXPIRY_DAYS', 365);
define('POINTS_TO_TRY_RATIO', 0.01);

// Kargo Yapılandırması
define('FREE_SHIPPING_THRESHOLD', 150);
define('DEFAULT_SHIPPING_COST', 29.90);

// Geliştirme Modu
define('DEV_MODE', true);
define('DEBUG_MODE', true);

// Bakım Modu
define('MAINTENANCE_MODE', false);
define('MAINTENANCE_MESSAGE', 'Sitemiz şu anda bakımdadır. Lütfen daha sonra tekrar deneyiniz.');

// Session Yapılandırması
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_secure', 0); // Localhost için 0
    ini_set('session.cookie_samesite', 'Strict');
    session_start();
}

/**
 * Veritabanı bağlantısı oluştur
 */
function getDbConnection() {
    static $conn = null;
    
    if ($conn === null) {
        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];
            
            $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            if (DEV_MODE) {
                die("Veritabanı bağlantı hatası: " . $e->getMessage());
            } else {
                error_log("DB Connection Error: " . $e->getMessage());
                die("Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
            }
        }
    }
    
    return $conn;
}

/**
 * Güvenli çıktı için helper fonksiyon
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * URL oluştur
 */
function url($path = '') {
    return BASE_URL . '/' . ltrim($path, '/');
}

/**
 * Redirect fonksiyonu
 */
function redirect($url, $statusCode = 302) {
    header('Location: ' . $url, true, $statusCode);
    exit;
}

/**
 * JSON response gönder
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Bakım modu kontrolü
 */
function checkMaintenanceMode() {
    if (MAINTENANCE_MODE && !isset($_SESSION['admin_logged_in'])) {
        http_response_code(503);
        die(MAINTENANCE_MESSAGE);
    }
}

checkMaintenanceMode();
