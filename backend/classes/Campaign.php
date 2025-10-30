<?php
/**
 * Kampanya Yönetimi Sınıfı
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

class Campaign {
    private $conn;
    private $table_name = "campaigns";
    
    public $id;
    public $name;
    public $description;
    public $campaign_type;
    public $customer_type;
    public $discount_type;
    public $discount_value;
    public $min_cart_amount;
    public $min_item_count;
    public $buy_quantity;
    public $pay_quantity;
    public $start_date;
    public $end_date;
    public $is_active;
    public $priority;
    
    // Yeni timed discount sistem özellikleri
    public $product_ids;
    public $min_purchase_amount;
    public $max_discount_amount;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Aktif timed discount kampanyalarını getir (ürün kartları için)
     */
    public function getActiveTimedDiscounts($product_id = null) {
        $now = date('Y-m-d H:i:s');
        
        $query = "SELECT c.* FROM " . $this->table_name . " c
                  WHERE c.is_active = 1
                  AND c.campaign_type = 'timed_discount'
                  AND c.start_date <= :now
                  AND c.end_date >= :now";
        
        if ($product_id) {
            $query .= " AND (c.product_ids IS NULL OR JSON_CONTAINS(c.product_ids, :product_id))";
        }
        
        $query .= " ORDER BY c.priority DESC, c.discount_value DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':now', $now);
        
        if ($product_id) {
            $product_id_json = json_encode((int)$product_id);
            $stmt->bindParam(':product_id', $product_id_json);
        }
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Belirli ürün için geçerli timed discount kampanyasını getir
     */
    public function getProductTimedDiscount($product_id) {
        $campaigns = $this->getActiveTimedDiscounts($product_id);
        return !empty($campaigns) ? $campaigns[0] : null;
    }
    
    /**
     * Countdown banner için aktif kampanyaları getir
     */
    public function getCountdownBannerCampaigns() {
        $now = date('Y-m-d H:i:s');
        
        $query = "SELECT c.*, 
                  TIMESTAMPDIFF(SECOND, :now, c.end_date) as seconds_remaining
                  FROM " . $this->table_name . " c
                  WHERE c.is_active = 1
                  AND c.campaign_type = 'timed_discount'
                  AND c.start_date <= :now
                  AND c.end_date >= :now
                  AND TIMESTAMPDIFF(SECOND, :now, c.end_date) > 0
                  ORDER BY c.priority DESC, c.end_date ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':now', $now);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Aktif kampanyaları getir (eski method - uyumluluk için)
     */
    public function getActiveCampaigns($customer_type = 'all') {
        $now = date('Y-m-d H:i:s');
        
        $query = "SELECT c.*, 
                  GROUP_CONCAT(DISTINCT cat.name) as categories,
                  GROUP_CONCAT(DISTINCT p.name) as products
                  FROM " . $this->table_name . " c
                  LEFT JOIN campaign_categories cc ON c.id = cc.campaign_id
                  LEFT JOIN categories cat ON cc.category_id = cat.id
                  LEFT JOIN campaign_products cp ON c.id = cp.campaign_id
                  LEFT JOIN products p ON cp.product_id = p.id
                  WHERE c.is_active = 1
                  AND c.start_date <= :now
                  AND c.end_date >= :now
                  AND (c.customer_type = :customer_type OR c.customer_type = 'all')
                  GROUP BY c.id
                  ORDER BY c.priority DESC, c.discount_value DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':now', $now);
        $stmt->bindParam(':customer_type', $customer_type);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Sepet için uygulanabilir kampanyaları bul
     */
    public function findApplicableCampaigns($cart_total, $cart_items, $customer_type, $user_id = null) {
        $active_campaigns = $this->getActiveCampaigns($customer_type);
        $applicable = [];
        
        foreach ($active_campaigns as $campaign) {
            $result = $this->validateCampaign($campaign, $cart_total, $cart_items, $customer_type, $user_id);
            
            if ($result['valid']) {
                $campaign['calculated_discount'] = $result['discount'];
                $campaign['discount_details'] = $result['details'] ?? [];
                $applicable[] = $campaign;
            }
        }
        
        // Öncelik ve indirim değerine göre sırala
        usort($applicable, function($a, $b) {
            if ($a['priority'] != $b['priority']) {
                return $b['priority'] - $a['priority']; // Yüksek öncelik önce
            }
            return $b['calculated_discount'] - $a['calculated_discount']; // Yüksek indirim önce
        });
        
        return $applicable;
    }
    
    /**
     * En iyi kampanyayı bul ve uygula
     */
    public function getBestCampaign($cart_total, $cart_items, $customer_type, $user_id = null) {
        $applicable = $this->findApplicableCampaigns($cart_total, $cart_items, $customer_type, $user_id);
        
        if (!empty($applicable)) {
            return [
                'found' => true,
                'campaign' => $applicable[0],
                'discount' => $applicable[0]['calculated_discount'],
                'all_applicable' => $applicable
            ];
        }
        
        return ['found' => false, 'discount' => 0];
    }
    
    /**
     * Kampanya doğrulama
     */
    public function validateCampaign($campaign, $cart_total, $cart_items, $customer_type, $user_id = null) {
        // Müşteri tipi kontrolü
        if ($campaign['customer_type'] != 'all' && $campaign['customer_type'] != $customer_type) {
            return ['valid' => false, 'error' => 'Müşteri tipi uygun değil'];
        }
        
        // Kullanıcı bazlı kullanım limiti kontrolü
        if ($user_id && $campaign['max_usage_per_user']) {
            $usage_count = $this->getUserCampaignUsage($campaign['id'], $user_id);
            if ($usage_count >= $campaign['max_usage_per_user']) {
                return ['valid' => false, 'error' => 'Kullanım limiti aşıldı'];
            }
        }
        
        // Kampanya tipine göre doğrulama
        switch ($campaign['campaign_type']) {
            case 'timed_discount':
                return $this->validateTimedDiscountCampaign($campaign, $cart_total, $cart_items);
                
            case 'customer_based':
                return $this->validateCustomerBasedCampaign($campaign, $cart_total, $cart_items);
                
            case 'cart_based':
                return $this->validateCartBasedCampaign($campaign, $cart_total, $cart_items);
                
            case 'buy_x_get_y':
                return $this->validateBuyXGetYCampaign($campaign, $cart_total, $cart_items);
                
            case 'category_based':
                return $this->validateCategoryBasedCampaign($campaign, $cart_total, $cart_items);
                
            case 'general':
            default:
                return $this->validateGeneralCampaign($campaign, $cart_total, $cart_items);
        }
    }
    
    /**
     * Genel kampanya doğrulama
     */
    private function validateGeneralCampaign($campaign, $cart_total, $cart_items) {
        $discount = $this->calculateDiscount($campaign, $cart_total);
        return ['valid' => true, 'discount' => $discount];
    }
    
    /**
     * Müşteri bazlı kampanya doğrulama
     */
    private function validateCustomerBasedCampaign($campaign, $cart_total, $cart_items) {
        // Minimum tutar kontrolü
        if ($campaign['min_cart_amount'] && $cart_total < $campaign['min_cart_amount']) {
            return ['valid' => false, 'error' => 'Minimum sepet tutarı yetersiz'];
        }
        
        $discount = $this->calculateDiscount($campaign, $cart_total);
        return ['valid' => true, 'discount' => $discount];
    }
    
    /**
     * Timed discount kampanya doğrulama
     */
    private function validateTimedDiscountCampaign($campaign, $cart_total, $cart_items) {
        // Minimum tutar kontrolü (min_purchase_amount)
        $min_amount = $campaign['min_purchase_amount'] ?? $campaign['min_cart_amount'];
        if ($min_amount && $cart_total < $min_amount) {
            return ['valid' => false, 'error' => "Minimum {$min_amount} TL alışveriş tutarı gerekli"];
        }
        
        // Ürün kontrolü (JSON product_ids)
        if (!empty($campaign['product_ids'])) {
            $product_ids = json_decode($campaign['product_ids'], true);
            if (is_array($product_ids)) {
                $has_applicable_product = false;
                foreach ($cart_items as $item) {
                    if (in_array($item['product_id'], $product_ids)) {
                        $has_applicable_product = true;
                        break;
                    }
                }
                if (!$has_applicable_product) {
                    return ['valid' => false, 'error' => 'Kampanya için uygun ürün sepetinizde yok'];
                }
            }
        }
        
        $discount = $this->calculateDiscount($campaign, $cart_total);
        return ['valid' => true, 'discount' => $discount];
    }
    
    /**
     * Sepet bazlı kampanya doğrulama
     */
    private function validateCartBasedCampaign($campaign, $cart_total, $cart_items) {
        // Minimum tutar kontrolü
        if ($campaign['min_cart_amount'] && $cart_total < $campaign['min_cart_amount']) {
            return ['valid' => false, 'error' => "Minimum {$campaign['min_cart_amount']} TL sepet tutarı gerekli"];
        }
        
        // Minimum ürün sayısı kontrolü
        if ($campaign['min_item_count']) {
            $total_items = 0;
            foreach ($cart_items as $item) {
                $total_items += $item['quantity'];
            }
            
            if ($total_items < $campaign['min_item_count']) {
                return ['valid' => false, 'error' => "Minimum {$campaign['min_item_count']} ürün gerekli"];
            }
        }
        
        $discount = $this->calculateDiscount($campaign, $cart_total);
        return ['valid' => true, 'discount' => $discount];
    }
    
    /**
     * X Al Y Öde kampanya doğrulama
     */
    private function validateBuyXGetYCampaign($campaign, $cart_total, $cart_items) {
        if (!$campaign['buy_quantity'] || !$campaign['pay_quantity']) {
            return ['valid' => false, 'error' => 'Kampanya parametreleri eksik'];
        }
        
        $applicable_items = $this->getApplicableItems($campaign, $cart_items);
        
        if (empty($applicable_items)) {
            return ['valid' => false, 'error' => 'Kampanya için uygun ürün yok'];
        }
        
        // Toplam uygun ürün sayısı
        $total_applicable = 0;
        foreach ($applicable_items as $item) {
            $total_applicable += $item['quantity'];
        }
        
        if ($total_applicable < $campaign['buy_quantity']) {
            return ['valid' => false, 'error' => "En az {$campaign['buy_quantity']} ürün gerekli"];
        }
        
        // İndirim hesapla: En pahalı ürünlerden başlayarak bedava olanları belirle
        $discount = $this->calculateBuyXGetYDiscount(
            $applicable_items,
            $campaign['buy_quantity'],
            $campaign['pay_quantity']
        );
        
        return [
            'valid' => true,
            'discount' => $discount,
            'details' => [
                'buy' => $campaign['buy_quantity'],
                'pay' => $campaign['pay_quantity'],
                'total_items' => $total_applicable
            ]
        ];
    }
    
    /**
     * Kategori bazlı kampanya doğrulama
     */
    private function validateCategoryBasedCampaign($campaign, $cart_total, $cart_items) {
        $applicable_categories = $this->getApplicableCategories($campaign['id']);
        
        if (empty($applicable_categories)) {
            return ['valid' => false, 'error' => 'Kategori belirtilmemiş'];
        }
        
        $applicable_total = 0;
        foreach ($cart_items as $item) {
            if (in_array($item['category_id'], $applicable_categories)) {
                $applicable_total += $item['price'] * $item['quantity'];
            }
        }
        
        if ($applicable_total == 0) {
            return ['valid' => false, 'error' => 'Kampanya için uygun ürün yok'];
        }
        
        $discount = $this->calculateDiscount($campaign, $applicable_total);
        return ['valid' => true, 'discount' => $discount];
    }
    
    /**
     * İndirim hesaplama (geliştirilmiş - max_discount_amount desteği ile)
     */
    private function calculateDiscount($campaign, $amount) {
        $discount = 0;
        
        if ($campaign['discount_type'] == 'percentage') {
            $discount = round(($amount * $campaign['discount_value']) / 100, 2);
            
            // Maksimum indirim tutarı kontrolü
            if (isset($campaign['max_discount_amount']) && $campaign['max_discount_amount'] > 0) {
                $discount = min($discount, $campaign['max_discount_amount']);
            }
        } else {
            $discount = min($campaign['discount_value'], $amount);
        }
        
        return $discount;
    }
    
    /**
     * X Al Y Öde indirimi hesaplama
     */
    private function calculateBuyXGetYDiscount($items, $buy_qty, $pay_qty) {
        // Ürünleri fiyata göre sırala (pahalıdan ucuza)
        $sorted_items = [];
        foreach ($items as $item) {
            for ($i = 0; $i < $item['quantity']; $i++) {
                $sorted_items[] = $item['price'];
            }
        }
        
        rsort($sorted_items); // Pahalıdan ucuza sırala
        
        $discount = 0;
        $free_qty = $buy_qty - $pay_qty;
        
        // Her X ürün için bedava olanları hesapla
        $groups = floor(count($sorted_items) / $buy_qty);
        
        for ($g = 0; $g < $groups; $g++) {
            $group_start = $g * $buy_qty;
            
            // Bu gruptaki en ucuz "free_qty" ürünü bedava yap
            $group_items = array_slice($sorted_items, $group_start, $buy_qty);
            sort($group_items); // Ucuzdan pahalıya
            
            for ($i = 0; $i < $free_qty && $i < count($group_items); $i++) {
                $discount += $group_items[$i];
            }
        }
        
        return round($discount, 2);
    }
    
    /**
     * Kampanya için uygun ürünleri getir (JSON product_ids desteği ile)
     */
    private function getApplicableItems($campaign, $cart_items) {
        // JSON product_ids field'ı kontrolü
        $applicable_products = [];
        if (!empty($campaign['product_ids'])) {
            $product_ids_json = json_decode($campaign['product_ids'], true);
            if (is_array($product_ids_json)) {
                $applicable_products = $product_ids_json;
            }
        } else {
            // Eski sistem desteği
            $applicable_products = $this->getApplicableProducts($campaign['id']);
        }
        
        $applicable_categories = $this->getApplicableCategories($campaign['id']);
        
        // Eğer özel ürün/kategori tanımlanmamışsa tüm sepet geçerli
        if (empty($applicable_products) && empty($applicable_categories)) {
            return $cart_items;
        }
        
        $applicable = [];
        foreach ($cart_items as $item) {
            if (!empty($applicable_products) && in_array($item['product_id'], $applicable_products)) {
                $applicable[] = $item;
            } elseif (!empty($applicable_categories) && in_array($item['category_id'], $applicable_categories)) {
                $applicable[] = $item;
            }
        }
        
        return $applicable;
    }
    
    /**
     * Kampanya uygulanabilir kategoriler
     */
    private function getApplicableCategories($campaign_id) {
        $query = "SELECT category_id FROM campaign_categories WHERE campaign_id = :campaign_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':campaign_id', $campaign_id);
        $stmt->execute();
        
        $categories = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $categories[] = $row['category_id'];
        }
        return $categories;
    }
    
    /**
     * Kampanya uygulanabilir ürünler
     */
    private function getApplicableProducts($campaign_id) {
        $query = "SELECT product_id FROM campaign_products WHERE campaign_id = :campaign_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':campaign_id', $campaign_id);
        $stmt->execute();
        
        $products = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $products[] = $row['product_id'];
        }
        return $products;
    }
    
    /**
     * Kullanıcının kampanya kullanım sayısı
     */
    private function getUserCampaignUsage($campaign_id, $user_id) {
        $query = "SELECT COUNT(*) as count FROM campaign_usage 
                  WHERE campaign_id = :campaign_id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':campaign_id', $campaign_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'];
    }
    
    /**
     * Kampanya kullanımı kaydet
     */
    public function recordUsage($campaign_id, $user_id, $order_id, $discount_amount) {
        $query = "INSERT INTO campaign_usage (campaign_id, user_id, order_id, discount_amount) 
                  VALUES (:campaign_id, :user_id, :order_id, :discount_amount)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':campaign_id', $campaign_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->bindParam(':discount_amount', $discount_amount);
        
        return $stmt->execute();
    }
    
    /**
     * Tüm kampanyaları listele (Admin)
     */
    public function readAll($filters = []) {
        $query = "SELECT c.*, 
                  COUNT(DISTINCT cu.id) as usage_count,
                  SUM(cu.discount_amount) as total_discount_given
                  FROM " . $this->table_name . " c
                  LEFT JOIN campaign_usage cu ON c.id = cu.campaign_id
                  WHERE 1=1";
        
        if (isset($filters['is_active'])) {
            $query .= " AND c.is_active = :is_active";
        }
        
        if (!empty($filters['campaign_type'])) {
            $query .= " AND c.campaign_type = :campaign_type";
        }
        
        if (!empty($filters['search'])) {
            $query .= " AND c.name LIKE :search";
        }
        
        $query .= " GROUP BY c.id ORDER BY c.priority DESC, c.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if (isset($filters['is_active'])) {
            $stmt->bindParam(':is_active', $filters['is_active'], PDO::PARAM_INT);
        }
        
        if (!empty($filters['campaign_type'])) {
            $stmt->bindParam(':campaign_type', $filters['campaign_type']);
        }
        
        if (!empty($filters['search'])) {
            $search = "%" . $filters['search'] . "%";
            $stmt->bindParam(':search', $search);
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Tek kampanya getir
     */
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Yeni kampanya oluştur (yeni field'larla)
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  (name, description, campaign_type, customer_type, discount_type, discount_value,
                   min_cart_amount, min_item_count, buy_quantity, pay_quantity,
                   start_date, end_date, product_ids, min_purchase_amount, max_discount_amount,
                   max_usage_per_user, priority, is_active)
                  VALUES 
                  (:name, :description, :campaign_type, :customer_type, :discount_type, :discount_value,
                   :min_cart_amount, :min_item_count, :buy_quantity, :pay_quantity,
                   :start_date, :end_date, :product_ids, :min_purchase_amount, :max_discount_amount,
                   :max_usage_per_user, :priority, :is_active)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':campaign_type', $this->campaign_type);
        $stmt->bindParam(':customer_type', $this->customer_type);
        $stmt->bindParam(':discount_type', $this->discount_type);
        $stmt->bindParam(':discount_value', $this->discount_value);
        $stmt->bindParam(':min_cart_amount', $this->min_cart_amount);
        $stmt->bindParam(':min_item_count', $this->min_item_count);
        $stmt->bindParam(':buy_quantity', $this->buy_quantity);
        $stmt->bindParam(':pay_quantity', $this->pay_quantity);
        $stmt->bindParam(':start_date', $this->start_date);
        $stmt->bindParam(':end_date', $this->end_date);
        $stmt->bindParam(':product_ids', $this->product_ids);
        $stmt->bindParam(':min_purchase_amount', $this->min_purchase_amount);
        $stmt->bindParam(':max_discount_amount', $this->max_discount_amount);
        $stmt->bindParam(':max_usage_per_user', $this->max_usage_per_user);
        $stmt->bindParam(':priority', $this->priority);
        $stmt->bindParam(':is_active', $this->is_active);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }
    
    /**
     * Kampanya güncelle (yeni field'larla)
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET name = :name,
                      description = :description,
                      campaign_type = :campaign_type,
                      customer_type = :customer_type,
                      discount_type = :discount_type,
                      discount_value = :discount_value,
                      min_cart_amount = :min_cart_amount,
                      min_item_count = :min_item_count,
                      buy_quantity = :buy_quantity,
                      pay_quantity = :pay_quantity,
                      start_date = :start_date,
                      end_date = :end_date,
                      product_ids = :product_ids,
                      min_purchase_amount = :min_purchase_amount,
                      max_discount_amount = :max_discount_amount,
                      max_usage_per_user = :max_usage_per_user,
                      priority = :priority,
                      is_active = :is_active
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':campaign_type', $this->campaign_type);
        $stmt->bindParam(':customer_type', $this->customer_type);
        $stmt->bindParam(':discount_type', $this->discount_type);
        $stmt->bindParam(':discount_value', $this->discount_value);
        $stmt->bindParam(':min_cart_amount', $this->min_cart_amount);
        $stmt->bindParam(':min_item_count', $this->min_item_count);
        $stmt->bindParam(':buy_quantity', $this->buy_quantity);
        $stmt->bindParam(':pay_quantity', $this->pay_quantity);
        $stmt->bindParam(':start_date', $this->start_date);
        $stmt->bindParam(':end_date', $this->end_date);
        $stmt->bindParam(':product_ids', $this->product_ids);
        $stmt->bindParam(':min_purchase_amount', $this->min_purchase_amount);
        $stmt->bindParam(':max_discount_amount', $this->max_discount_amount);
        $stmt->bindParam(':max_usage_per_user', $this->max_usage_per_user);
        $stmt->bindParam(':priority', $this->priority);
        $stmt->bindParam(':is_active', $this->is_active);
        
        return $stmt->execute();
    }
    
    /**
     * Kampanya sil
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        return $stmt->execute();
    }
    
    /**
     * Kategorileri kampanya ile ilişkilendir
     */
    public function attachCategories($category_ids) {
        // Önce mevcut ilişkileri sil
        $delete_query = "DELETE FROM campaign_categories WHERE campaign_id = :campaign_id";
        $delete_stmt = $this->conn->prepare($delete_query);
        $delete_stmt->bindParam(':campaign_id', $this->id);
        $delete_stmt->execute();
        
        // Yeni ilişkileri ekle
        if (!empty($category_ids)) {
            $insert_query = "INSERT INTO campaign_categories (campaign_id, category_id) VALUES (:campaign_id, :category_id)";
            $insert_stmt = $this->conn->prepare($insert_query);
            
            foreach ($category_ids as $category_id) {
                $insert_stmt->bindParam(':campaign_id', $this->id);
                $insert_stmt->bindParam(':category_id', $category_id);
                $insert_stmt->execute();
            }
        }
    }
    
    /**
     * Ürünleri kampanya ile ilişkilendir
     */
    public function attachProducts($product_ids) {
        // Önce mevcut ilişkileri sil
        $delete_query = "DELETE FROM campaign_products WHERE campaign_id = :campaign_id";
        $delete_stmt = $this->conn->prepare($delete_query);
        $delete_stmt->bindParam(':campaign_id', $this->id);
        $delete_stmt->execute();
        
        // Yeni ilişkileri ekle
        if (!empty($product_ids)) {
            $insert_query = "INSERT INTO campaign_products (campaign_id, product_id) VALUES (:campaign_id, :product_id)";
            $insert_stmt = $this->conn->prepare($insert_query);
            
            foreach ($product_ids as $product_id) {
                $insert_stmt->bindParam(':campaign_id', $this->id);
                $insert_stmt->bindParam(':product_id', $product_id);
                $insert_stmt->execute();
            }
        }
    }
}
