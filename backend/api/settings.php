<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

class SettingsAPI {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Tüm ayarları getir
     */
    public function getSettings() {
        try {
            // Ayarlar tablosu yoksa oluştur
            $this->createSettingsTableIfNotExists();
            
            $query = "SELECT setting_key, setting_value, setting_group, setting_type 
                      FROM site_settings 
                      ORDER BY setting_group, setting_key";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $settings = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $group = $row['setting_group'];
                if (!isset($settings[$group])) {
                    $settings[$group] = [];
                }
                
                // Boolean değerleri dönüştür
                if ($row['setting_type'] === 'boolean') {
                    $row['setting_value'] = $row['setting_value'] === '1' || $row['setting_value'] === 'true';
                }
                
                $settings[$group][$row['setting_key']] = $row['setting_value'];
            }
            
            return [
                'success' => true,
                'data' => $settings
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Ayarlar yüklenirken hata: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Ayarları güncelle
     */
    public function updateSettings($settings) {
        try {
            $this->conn->beginTransaction();
            
            foreach ($settings as $group => $groupSettings) {
                foreach ($groupSettings as $key => $value) {
                    // Boolean değerleri string'e dönüştür
                    if (is_bool($value)) {
                        $value = $value ? '1' : '0';
                        $type = 'boolean';
                    } elseif (is_numeric($value)) {
                        $type = 'number';
                    } else {
                        $type = 'string';
                    }
                    
                    $query = "INSERT INTO site_settings 
                              (setting_key, setting_value, setting_group, setting_type, updated_at) 
                              VALUES (:key, :value, :group, :type, NOW())
                              ON DUPLICATE KEY UPDATE 
                              setting_value = :value, 
                              setting_type = :type,
                              updated_at = NOW()";
                    
                    $stmt = $this->conn->prepare($query);
                    $stmt->bindParam(':key', $key);
                    $stmt->bindParam(':value', $value);
                    $stmt->bindParam(':group', $group);
                    $stmt->bindParam(':type', $type);
                    $stmt->execute();
                }
            }
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'message' => 'Ayarlar başarıyla güncellendi'
            ];
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return [
                'success' => false,
                'message' => 'Ayarlar güncellenirken hata: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Ayarlar tablosunu oluştur (yoksa)
     */
    private function createSettingsTableIfNotExists() {
        $query = "CREATE TABLE IF NOT EXISTS site_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT,
            setting_group VARCHAR(50) NOT NULL,
            setting_type VARCHAR(20) DEFAULT 'string',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_group (setting_group),
            INDEX idx_key (setting_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $this->conn->exec($query);
        
        // Varsayılan ayarları ekle
        $this->insertDefaultSettings();
    }
    
    /**
     * Varsayılan ayarları ekle
     */
    private function insertDefaultSettings() {
        $defaults = [
            ['general', 'site-name', 'Gürbüz Oyuncak', 'string'],
            ['general', 'site-tagline', 'Oyuncak Dünyasının Lideri', 'string'],
            ['general', 'site-description', 'Gürbüz Oyuncak, 1989\'dan beri kaliteli oyuncaklar sunan Türkiye\'nin önde gelen oyuncak toptancısıdır.', 'string'],
            ['general', 'site-email', 'info@gurbuzoyuncak.com', 'string'],
            ['general', 'site-phone', '+90 242 123 45 67', 'string'],
            ['general', 'site-address', 'Güzeloba Mah. Çağlayangil Cad. No:1234 Muratpaşa/Antalya', 'string'],
            ['ecommerce', 'currency', 'TRY', 'string'],
            ['ecommerce', 'min-order-amount', '0', 'number'],
            ['ecommerce', 'free-shipping-limit', '500', 'number'],
            ['ecommerce', 'shipping-fee', '29.90', 'number'],
            ['ecommerce', 'tax-rate', '20', 'number'],
            ['ecommerce', 'guest-checkout', '0', 'boolean'],
            ['ecommerce', 'stock-management', '1', 'boolean'],
            ['seo', 'meta-title', 'Gürbüz Oyuncak - Oyuncak Dünyasının Lideri', 'string'],
            ['seo', 'meta-description', 'Gürbüz Oyuncak, 1989\'dan beri kaliteli oyuncaklar sunan Türkiye\'nin önde gelen oyuncak toptancısıdır.', 'string'],
            ['seo', 'meta-keywords', 'oyuncak, bebek, puzzle, kumandalı araç, lego, antalya', 'string']
        ];
        
        foreach ($defaults as $default) {
            list($group, $key, $value, $type) = $default;
            
            $query = "INSERT IGNORE INTO site_settings 
                      (setting_key, setting_value, setting_group, setting_type) 
                      VALUES (:key, :value, :group, :type)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':key', $key);
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':group', $group);
            $stmt->bindParam(':type', $type);
            $stmt->execute();
        }
    }
}

// API endpoint'i işle
try {
    $database = new Database();
    $db = $database->getConnection();
    $api = new SettingsAPI($db);
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            echo json_encode($api->getSettings());
            break;
            
        case 'POST':
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Geçersiz veri formatı'
                ]);
                break;
            }
            
            echo json_encode($api->updateSettings($data));
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Desteklenmeyen HTTP metodu'
            ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sunucu hatası: ' . $e->getMessage()
    ]);
}
