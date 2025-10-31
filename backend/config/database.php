<?php
/**
 * Veritabanı Bağlantı Yapılandırması
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

// Ana config dosyasını yükle
require_once __DIR__ . '/../../config.php';

class Database {
    // Veritabanı bağlantı bilgileri (config.php'den alınıyor)
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    private $charset;
    
    public $conn;
    
    /**
     * Constructor - Config değerlerini yükle
     */
    public function __construct() {
        $this->host = DB_HOST;
        $this->port = DB_PORT;
        $this->db_name = DB_NAME;
        $this->username = DB_USER;
        $this->password = DB_PASS;
        $this->charset = DB_CHARSET;
    }
    
    /**
     * Veritabanı bağlantısı oluştur
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . $this->charset
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
            if (DEV_MODE) {
                error_log("Database connection successful");
            }
        } catch(PDOException $exception) {
            // Log the error
            error_log("Database connection error: " . $exception->getMessage());
            
            // Return JSON error for API calls
            if (php_sapi_name() !== 'cli' && strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
                header('Content-Type: application/json; charset=UTF-8');
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Veritabanı bağlantı hatası',
                    'error' => (defined('DEV_MODE') && DEV_MODE) ? $exception->getMessage() : null
                ]);
                exit;
            }
            
            // For non-API calls
            if (defined('DEV_MODE') && DEV_MODE) {
                die("Bağlantı hatası: " . $exception->getMessage());
            } else {
                die("Veritabanı bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyiniz.");
            }
        }
        
        return $this->conn;
    }
    
    /**
     * Bağlantıyı kapat
     */
    public function closeConnection() {
        $this->conn = null;
    }
}
