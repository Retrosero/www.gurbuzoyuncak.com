<?php
/**
 * Müşteri Grubu Yönetim Sınıfı
 * B2C, B2B, Wholesale gibi müşteri tiplerini yönetir
 */
class CustomerType {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }
    
    /**
     * Yeni müşteri grubu oluştur
     */
    public function create($data) {
        try {
            $sql = "INSERT INTO customer_types (name, code, price_multiplier, discount_percentage, min_order_amount, is_active) 
                    VALUES (:name, :code, :price_multiplier, :discount_percentage, :min_order_amount, :is_active)";
            
            $stmt = $this->db->prepare($sql);
            
            $result = $stmt->execute([
                ':name' => $data['name'],
                ':code' => $data['code'],
                ':price_multiplier' => $data['price_multiplier'],
                ':discount_percentage' => $data['discount_percentage'],
                ':min_order_amount' => $data['min_order_amount'],
                ':is_active' => $data['is_active']
            ]);
            
            return $result;
        } catch (PDOException $e) {
            error_log("CustomerType create error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Müşteri grubunu güncelle
     */
    public function update($id, $data) {
        try {
            $sql = "UPDATE customer_types 
                    SET name = :name, code = :code, price_multiplier = :price_multiplier, 
                        discount_percentage = :discount_percentage, min_order_amount = :min_order_amount, 
                        is_active = :is_active, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            
            $result = $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':code' => $data['code'],
                ':price_multiplier' => $data['price_multiplier'],
                ':discount_percentage' => $data['discount_percentage'],
                ':min_order_amount' => $data['min_order_amount'],
                ':is_active' => $data['is_active']
            ]);
            
            return $result;
        } catch (PDOException $e) {
            error_log("CustomerType update error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Müşteri grubunu sil
     */
    public function delete($id) {
        try {
            // Müşteri grubu silinmeden önce kullanan kullanıcı var mı kontrol et
            $checkSql = "SELECT COUNT(*) as count FROM users WHERE customer_type = (SELECT code FROM customer_types WHERE id = :id)";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->execute([':id' => $id]);
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] > 0) {
                // Kullanan kullanıcı varsa silme, sadece pasif yap
                $updateSql = "UPDATE customer_types SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
                $updateStmt = $this->db->prepare($updateSql);
                return $updateStmt->execute([':id' => $id]);
            }
            
            $sql = "DELETE FROM customer_types WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':id' => $id]);
            
        } catch (PDOException $e) {
            error_log("CustomerType delete error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * ID ile müşteri grubunu getir
     */
    public function getById($id) {
        try {
            $sql = "SELECT * FROM customer_types WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("CustomerType getById error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Kod ile müşteri grubunu getir
     */
    public function getByCode($code) {
        try {
            $sql = "SELECT * FROM customer_types WHERE code = :code AND is_active = 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':code' => $code]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("CustomerType getByCode error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Tüm müşteri gruplarını getir
     */
    public function getAll($active_only = false) {
        try {
            $sql = "SELECT * FROM customer_types";
            if ($active_only) {
                $sql .= " WHERE is_active = 1";
            }
            $sql .= " ORDER BY name ASC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("CustomerType getAll error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Aktif müşteri gruplarını getir
     */
    public function getActive() {
        return $this->getAll(true);
    }
    
    /**
     * Kullanıcının müşteri grubunu güncelle
     */
    public function updateUserCustomerType($user_id, $customer_type_code) {
        try {
            // Müşteri grubunun aktif olduğunu kontrol et
            $customerType = $this->getByCode($customer_type_code);
            if (!$customerType) {
                return false;
            }
            
            $sql = "UPDATE users SET customer_type = :customer_type WHERE id = :user_id";
            $stmt = $this->db->prepare($sql);
            
            return $stmt->execute([
                ':customer_type' => $customer_type_code,
                ':user_id' => $user_id
            ]);
        } catch (PDOException $e) {
            error_log("CustomerType updateUserCustomerType error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Müşteri grubu istatistiklerini getir
     */
    public function getStats() {
        try {
            $sql = "SELECT 
                        ct.name,
                        ct.code,
                        ct.price_multiplier,
                        ct.discount_percentage,
                        COUNT(u.id) as user_count,
                        COALESCE(SUM(o.total_amount), 0) as total_sales
                    FROM customer_types ct
                    LEFT JOIN users u ON ct.code = u.customer_type
                    LEFT JOIN orders o ON u.id = o.user_id
                    GROUP BY ct.id, ct.name, ct.code, ct.price_multiplier, ct.discount_percentage
                    ORDER BY user_count DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("CustomerType getStats error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Fiyat hesaplama
     * Base price'dan müşteri grubu fiyatı hesaplar
     */
    public function calculatePrice($basePrice, $customerTypeCode) {
        try {
            $customerType = $this->getByCode($customerTypeCode);
            if (!$customerType) {
                return $basePrice;
            }
            
            // Önce fiyat çarpanını uygula
            $multipliedPrice = $basePrice * $customerType['price_multiplier'];
            
            // Sonra ek indirimi uygula
            $finalPrice = $multipliedPrice * (1 - $customerType['discount_percentage'] / 100);
            
            return round($finalPrice, 2);
        } catch (Exception $e) {
            error_log("CustomerType calculatePrice error: " . $e->getMessage());
            return $basePrice;
        }
    }
    
    /**
     * Minimum sipariş tutarı kontrolü
     */
    public function checkMinimumOrder($customerTypeCode, $orderAmount) {
        try {
            $customerType = $this->getByCode($customerTypeCode);
            if (!$customerType) {
                return ['valid' => true, 'required' => 0, 'current' => $orderAmount];
            }
            
            $minimumRequired = $customerType['min_order_amount'];
            $isValid = $orderAmount >= $minimumRequired;
            
            return [
                'valid' => $isValid,
                'required' => $minimumRequired,
                'current' => $orderAmount,
                'shortage' => max(0, $minimumRequired - $orderAmount)
            ];
        } catch (Exception $e) {
            error_log("CustomerType checkMinimumOrder error: " . $e->getMessage());
            return ['valid' => true, 'required' => 0, 'current' => $orderAmount];
        }
    }
    
    /**
     * Tüm müşteri gruplarını opsiyonlar olarak getir (HTML select için)
     */
    public function getOptions($selectedCode = '') {
        $customerTypes = $this->getActive();
        $options = '<option value="">Seçiniz</option>';
        
        foreach ($customerTypes as $type) {
            $selected = ($type['code'] === $selectedCode) ? 'selected' : '';
            $options .= '<option value="' . htmlspecialchars($type['code']) . '" ' . $selected . '>';
            $options .= htmlspecialchars($type['name']) . ' (' . $type['code'] . ')';
            $options .= '</option>';
        }
        
        return $options;
    }
}
?>