<?php
/**
 * Veritabanı Bağlantı Yapılandırması
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

class Database {
    // Veritabanı bağlantı bilgileri
    private $host = "localhost";
    private $db_name = "gurbuz_oyuncak";
    private $username = "root";
    private $password = "";
    private $charset = "utf8mb4";
    
    public $conn;
    
    /**
     * Veritabanı bağlantısı oluştur
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            echo "Bağlantı hatası: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}
