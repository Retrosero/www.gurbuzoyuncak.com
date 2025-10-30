<?php
/**
 * Veritabanı Bağlantı Yapılandırması
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

class Database {
    // Veritabanı bağlantı bilgileri
    private $host = "localhost";
    private $port = "3306";
    private $db_name = "u2101458_gurbuz_oyuncak";
    private $username = "gurbuz@gurbuzoyuncak.site";
    private $password = "?S3rhanK6l6y?";
    private $charset = "utf8mb4";
    
    public $conn;
    
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
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            echo "Bağlantı hatası: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}
