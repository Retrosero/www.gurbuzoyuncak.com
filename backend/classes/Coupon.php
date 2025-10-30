<?php
/**
 * Kupon Yönetimi Sınıfı
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

class Coupon {
    private $conn;
    private $table_name = "coupons";
    
    public $id;
    public $code;
    public $name;
    public $description;
    public $discount_type;
    public $discount_value;
    public $min_purchase_amount;
    public $max_discount_amount;
    public $usage_limit;
    public $usage_limit_per_user;
    public $used_count;
    public $valid_from;
    public $valid_until;
    public $customer_type;
    public $applicable_to;
    public $is_active;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Tüm kuponları listele
     */
    public function readAll($filters = []) {
        $query = "SELECT c.*, 
                  COUNT(DISTINCT cu.id) as usage_count,
                  GROUP_CONCAT(DISTINCT cat.name) as categories,
                  GROUP_CONCAT(DISTINCT p.name) as products
                  FROM " . $this->table_name . " c
                  LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
                  LEFT JOIN coupon_categories cc ON c.id = cc.coupon_id
                  LEFT JOIN categories cat ON cc.category_id = cat.id
                  LEFT JOIN coupon_products cp ON c.id = cp.coupon_id
                  LEFT JOIN products p ON cp.product_id = p.id
                  WHERE 1=1";
        
        if (!empty($filters['is_active'])) {
            $query .= " AND c.is_active = :is_active";
        }
        
        if (!empty($filters['customer_type'])) {
            $query .= " AND (c.customer_type = :customer_type OR c.customer_type = 'all')";
        }
        
        if (!empty($filters['search'])) {
            $query .= " AND (c.code LIKE :search OR c.name LIKE :search)";
        }
        
        $query .= " GROUP BY c.id ORDER BY c.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($filters['is_active'])) {
            $stmt->bindParam(':is_active', $filters['is_active']);
        }
        
        if (!empty($filters['customer_type'])) {
            $stmt->bindParam(':customer_type', $filters['customer_type']);
        }
        
        if (!empty($filters['search'])) {
            $search = "%" . $filters['search'] . "%";
            $stmt->bindParam(':search', $search);
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Kupon kodu ile kupon getir
     */
    public function readByCode($code) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE code = :code AND is_active = 1
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':code', $code);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Kupon doğrulama
     */
    public function validate($code, $user_id, $cart_total, $cart_items = [], $customer_type = 'B2C') {
        $coupon = $this->readByCode($code);
        
        if (!$coupon) {
            return ['valid' => false, 'error' => 'Kupon bulunamadı'];
        }
        
        // Tarih kontrolü
        $now = date('Y-m-d H:i:s');
        if ($now < $coupon['valid_from'] || $now > $coupon['valid_until']) {
            return ['valid' => false, 'error' => 'Kupon geçerlilik tarihi dışında'];
        }
        
        // Müşteri tipi kontrolü
        if ($coupon['customer_type'] != 'all' && $coupon['customer_type'] != $customer_type) {
            return ['valid' => false, 'error' => 'Bu kupon sizin için geçerli değil'];
        }
        
        // Minimum tutar kontrolü
        if ($cart_total < $coupon['min_purchase_amount']) {
            return ['valid' => false, 'error' => 'Minimum sepet tutarı ' . $coupon['min_purchase_amount'] . ' TL olmalıdır'];
        }
        
        // Toplam kullanım limiti kontrolü
        if ($coupon['usage_limit'] !== null && $coupon['used_count'] >= $coupon['usage_limit']) {
            return ['valid' => false, 'error' => 'Kupon kullanım limiti doldu'];
        }
        
        // Kullanıcı başına kullanım limiti kontrolü
        $user_usage = $this->getUserUsageCount($coupon['id'], $user_id);
        if ($user_usage >= $coupon['usage_limit_per_user']) {
            return ['valid' => false, 'error' => 'Bu kuponu kullanım limitinizi aştınız'];
        }
        
        // Kategori/Ürün kontrolü
        if ($coupon['applicable_to'] == 'categories') {
            $applicable_categories = $this->getApplicableCategories($coupon['id']);
            $has_applicable = false;
            foreach ($cart_items as $item) {
                if (in_array($item['category_id'], $applicable_categories)) {
                    $has_applicable = true;
                    break;
                }
            }
            if (!$has_applicable) {
                return ['valid' => false, 'error' => 'Sepetinizde kupon için uygun ürün yok'];
            }
        } elseif ($coupon['applicable_to'] == 'products') {
            $applicable_products = $this->getApplicableProducts($coupon['id']);
            $has_applicable = false;
            foreach ($cart_items as $item) {
                if (in_array($item['product_id'], $applicable_products)) {
                    $has_applicable = true;
                    break;
                }
            }
            if (!$has_applicable) {
                return ['valid' => false, 'error' => 'Sepetinizde kupon için uygun ürün yok'];
            }
        }
        
        // İndirim hesapla
        $discount = $this->calculateDiscount($coupon, $cart_total, $cart_items);
        
        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount' => $discount
        ];
    }
    
    /**
     * İndirim hesaplama
     */
    public function calculateDiscount($coupon, $cart_total, $cart_items = []) {
        if ($coupon['discount_type'] == 'free_shipping') {
            return 0; // Ücretsiz kargo - ayrı hesaplanır
        }
        
        $applicable_total = $cart_total;
        
        // Sadece belirli kategoriler/ürünler için geçerliyse
        if ($coupon['applicable_to'] == 'categories') {
            $applicable_categories = $this->getApplicableCategories($coupon['id']);
            $applicable_total = 0;
            foreach ($cart_items as $item) {
                if (in_array($item['category_id'], $applicable_categories)) {
                    $applicable_total += $item['price'] * $item['quantity'];
                }
            }
        } elseif ($coupon['applicable_to'] == 'products') {
            $applicable_products = $this->getApplicableProducts($coupon['id']);
            $applicable_total = 0;
            foreach ($cart_items as $item) {
                if (in_array($item['product_id'], $applicable_products)) {
                    $applicable_total += $item['price'] * $item['quantity'];
                }
            }
        }
        
        if ($coupon['discount_type'] == 'percentage') {
            $discount = ($applicable_total * $coupon['discount_value']) / 100;
            
            // Maksimum indirim limiti kontrolü
            if ($coupon['max_discount_amount'] !== null && $discount > $coupon['max_discount_amount']) {
                $discount = $coupon['max_discount_amount'];
            }
        } else {
            $discount = min($coupon['discount_value'], $applicable_total);
        }
        
        return round($discount, 2);
    }
    
    /**
     * Kullanıcının kupon kullanım sayısı
     */
    private function getUserUsageCount($coupon_id, $user_id) {
        $query = "SELECT COUNT(*) as count FROM coupon_usage 
                  WHERE coupon_id = :coupon_id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':coupon_id', $coupon_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
    
    /**
     * Kupon uygulanabilir kategoriler
     */
    private function getApplicableCategories($coupon_id) {
        $query = "SELECT category_id FROM coupon_categories WHERE coupon_id = :coupon_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':coupon_id', $coupon_id);
        $stmt->execute();
        
        $categories = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $categories[] = $row['category_id'];
        }
        return $categories;
    }
    
    /**
     * Kupon uygulanabilir ürünler
     */
    private function getApplicableProducts($coupon_id) {
        $query = "SELECT product_id FROM coupon_products WHERE coupon_id = :coupon_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':coupon_id', $coupon_id);
        $stmt->execute();
        
        $products = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $products[] = $row['product_id'];
        }
        return $products;
    }
    
    /**
     * Kupon kullanımı kaydet
     */
    public function recordUsage($coupon_id, $user_id, $order_id, $discount_amount) {
        $query = "INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount) 
                  VALUES (:coupon_id, :user_id, :order_id, :discount_amount)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':coupon_id', $coupon_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->bindParam(':discount_amount', $discount_amount);
        
        if ($stmt->execute()) {
            // Kupon kullanım sayısını artır
            $update_query = "UPDATE coupons SET used_count = used_count + 1 WHERE id = :coupon_id";
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(':coupon_id', $coupon_id);
            $update_stmt->execute();
            
            return true;
        }
        return false;
    }
    
    /**
     * Yeni kupon oluştur
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  (code, name, description, discount_type, discount_value, 
                   min_purchase_amount, max_discount_amount, usage_limit, 
                   usage_limit_per_user, valid_from, valid_until, 
                   customer_type, applicable_to, is_active, created_by)
                  VALUES 
                  (:code, :name, :description, :discount_type, :discount_value,
                   :min_purchase_amount, :max_discount_amount, :usage_limit,
                   :usage_limit_per_user, :valid_from, :valid_until,
                   :customer_type, :applicable_to, :is_active, :created_by)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':code', $this->code);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':discount_type', $this->discount_type);
        $stmt->bindParam(':discount_value', $this->discount_value);
        $stmt->bindParam(':min_purchase_amount', $this->min_purchase_amount);
        $stmt->bindParam(':max_discount_amount', $this->max_discount_amount);
        $stmt->bindParam(':usage_limit', $this->usage_limit);
        $stmt->bindParam(':usage_limit_per_user', $this->usage_limit_per_user);
        $stmt->bindParam(':valid_from', $this->valid_from);
        $stmt->bindParam(':valid_until', $this->valid_until);
        $stmt->bindParam(':customer_type', $this->customer_type);
        $stmt->bindParam(':applicable_to', $this->applicable_to);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':created_by', $_SESSION['user_id'] ?? null);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }
    
    /**
     * Kupon güncelle
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET name = :name,
                      description = :description,
                      discount_type = :discount_type,
                      discount_value = :discount_value,
                      min_purchase_amount = :min_purchase_amount,
                      max_discount_amount = :max_discount_amount,
                      usage_limit = :usage_limit,
                      usage_limit_per_user = :usage_limit_per_user,
                      valid_from = :valid_from,
                      valid_until = :valid_until,
                      customer_type = :customer_type,
                      applicable_to = :applicable_to,
                      is_active = :is_active
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':discount_type', $this->discount_type);
        $stmt->bindParam(':discount_value', $this->discount_value);
        $stmt->bindParam(':min_purchase_amount', $this->min_purchase_amount);
        $stmt->bindParam(':max_discount_amount', $this->max_discount_amount);
        $stmt->bindParam(':usage_limit', $this->usage_limit);
        $stmt->bindParam(':usage_limit_per_user', $this->usage_limit_per_user);
        $stmt->bindParam(':valid_from', $this->valid_from);
        $stmt->bindParam(':valid_until', $this->valid_until);
        $stmt->bindParam(':customer_type', $this->customer_type);
        $stmt->bindParam(':applicable_to', $this->applicable_to);
        $stmt->bindParam(':is_active', $this->is_active);
        
        return $stmt->execute();
    }
    
    /**
     * Kupon sil
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        return $stmt->execute();
    }
    
    /**
     * Tek kupon getir
     */
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Kategorileri kuponla ilişkilendir
     */
    public function attachCategories($category_ids) {
        // Önce mevcut ilişkileri sil
        $delete_query = "DELETE FROM coupon_categories WHERE coupon_id = :coupon_id";
        $delete_stmt = $this->conn->prepare($delete_query);
        $delete_stmt->bindParam(':coupon_id', $this->id);
        $delete_stmt->execute();
        
        // Yeni ilişkileri ekle
        if (!empty($category_ids)) {
            $insert_query = "INSERT INTO coupon_categories (coupon_id, category_id) VALUES (:coupon_id, :category_id)";
            $insert_stmt = $this->conn->prepare($insert_query);
            
            foreach ($category_ids as $category_id) {
                $insert_stmt->bindParam(':coupon_id', $this->id);
                $insert_stmt->bindParam(':category_id', $category_id);
                $insert_stmt->execute();
            }
        }
    }
    
    /**
     * Ürünleri kuponla ilişkilendir
     */
    public function attachProducts($product_ids) {
        // Önce mevcut ilişkileri sil
        $delete_query = "DELETE FROM coupon_products WHERE coupon_id = :coupon_id";
        $delete_stmt = $this->conn->prepare($delete_query);
        $delete_stmt->bindParam(':coupon_id', $this->id);
        $delete_stmt->execute();
        
        // Yeni ilişkileri ekle
        if (!empty($product_ids)) {
            $insert_query = "INSERT INTO coupon_products (coupon_id, product_id) VALUES (:coupon_id, :product_id)";
            $insert_stmt = $this->conn->prepare($insert_query);
            
            foreach ($product_ids as $product_id) {
                $insert_stmt->bindParam(':coupon_id', $this->id);
                $insert_stmt->bindParam(':product_id', $product_id);
                $insert_stmt->execute();
            }
        }
    }
}
