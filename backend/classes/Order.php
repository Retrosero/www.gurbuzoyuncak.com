<?php
/**
 * Sipariş Sınıfı - Sipariş Oluşturma ve Yönetimi
 */

class Order {
    private $conn;
    private $table_name = "orders";
    
    public $id;
    public $order_number;
    public $user_id;
    public $status;
    public $payment_status;
    public $payment_method;
    public $subtotal;
    public $shipping_cost;
    public $tax;
    public $discount;
    public $total;
    public $shipping_address_id;
    public $billing_address_id;
    public $notes;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Yeni sipariş oluştur
     */
    public function create($items) {
        try {
            $this->conn->beginTransaction();
            
            // Sipariş numarası oluştur
            $this->order_number = 'GO-' . date('Ymd') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            
            // Siparişi kaydet
            $query = "INSERT INTO " . $this->table_name . "
                    SET
                        order_number = :order_number,
                        user_id = :user_id,
                        status = :status,
                        payment_status = :payment_status,
                        payment_method = :payment_method,
                        subtotal = :subtotal,
                        shipping_cost = :shipping_cost,
                        tax = :tax,
                        discount = :discount,
                        total = :total,
                        shipping_address_id = :shipping_address_id,
                        billing_address_id = :billing_address_id,
                        notes = :notes";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':order_number', $this->order_number);
            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->bindParam(':status', $this->status);
            $stmt->bindParam(':payment_status', $this->payment_status);
            $stmt->bindParam(':payment_method', $this->payment_method);
            $stmt->bindParam(':subtotal', $this->subtotal);
            $stmt->bindParam(':shipping_cost', $this->shipping_cost);
            $stmt->bindParam(':tax', $this->tax);
            $stmt->bindParam(':discount', $this->discount);
            $stmt->bindParam(':total', $this->total);
            $stmt->bindParam(':shipping_address_id', $this->shipping_address_id);
            $stmt->bindParam(':billing_address_id', $this->billing_address_id);
            $stmt->bindParam(':notes', $this->notes);
            
            if (!$stmt->execute()) {
                throw new Exception("Sipariş kaydedilemedi");
            }
            
            $order_id = $this->conn->lastInsertId();
            
            // Sipariş kalemlerini kaydet
            $query = "INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, subtotal)
                     VALUES (:order_id, :product_id, :product_name, :product_sku, :quantity, :price, :subtotal)";
            
            $stmt = $this->conn->prepare($query);
            
            foreach ($items as $item) {
                $stmt->bindParam(':order_id', $order_id);
                $stmt->bindParam(':product_id', $item['product_id']);
                $stmt->bindParam(':product_name', $item['product_name']);
                $stmt->bindParam(':product_sku', $item['product_sku']);
                $stmt->bindParam(':quantity', $item['quantity']);
                $stmt->bindParam(':price', $item['price']);
                
                $item_subtotal = $item['price'] * $item['quantity'];
                $stmt->bindParam(':subtotal', $item_subtotal);
                
                if (!$stmt->execute()) {
                    throw new Exception("Sipariş kalemi kaydedilemedi");
                }
                
                // Stok güncelle
                $this->updateStock($item['product_id'], $item['quantity']);
            }
            
            $this->conn->commit();
            return $order_id;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
    
    /**
     * Stok güncelle
     */
    private function updateStock($product_id, $quantity) {
        $query = "UPDATE products SET stock_quantity = stock_quantity - :quantity WHERE id = :product_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();
    }
    
    /**
     * Kullanıcının siparişlerini getir
     */
    public function getUserOrders($user_id) {
        $query = "SELECT * FROM " . $this->table_name . " 
                 WHERE user_id = :user_id 
                 ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Sipariş detaylarını getir
     */
    public function getOrderDetails($order_id, $user_id = null) {
        $query = "SELECT o.*, 
                        sa.address_line1 as shipping_address, sa.city as shipping_city,
                        ba.address_line1 as billing_address, ba.city as billing_city
                FROM " . $this->table_name . " o
                LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
                LEFT JOIN addresses ba ON o.billing_address_id = ba.id
                WHERE o.id = :order_id";
        
        if ($user_id) {
            $query .= " AND o.user_id = :user_id";
        }
        
        $query .= " LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':order_id', $order_id);
        if ($user_id) {
            $stmt->bindParam(':user_id', $user_id);
        }
        $stmt->execute();
        
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($order) {
            // Sipariş kalemlerini getir
            $order['items'] = $this->getOrderItems($order_id);
        }
        
        return $order;
    }
    
    /**
     * Sipariş kalemlerini getir
     */
    public function getOrderItems($order_id) {
        $query = "SELECT * FROM order_items WHERE order_id = :order_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Sipariş durumunu güncelle
     */
    public function updateStatus($order_id, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :order_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':order_id', $order_id);
        
        return $stmt->execute();
    }
    
    /**
     * Ödeme durumunu güncelle
     */
    public function updatePaymentStatus($order_id, $payment_status) {
        $query = "UPDATE " . $this->table_name . " SET payment_status = :payment_status WHERE id = :order_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':payment_status', $payment_status);
        $stmt->bindParam(':order_id', $order_id);
        
        return $stmt->execute();
    }
    
    /**
     * Tüm siparişleri getir (Admin için)
     */
    public function getAllOrders($filters = []) {
        $query = "SELECT o.*, u.email, u.first_name, u.last_name
                FROM " . $this->table_name . " o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE 1=1";
        
        if (!empty($filters['status'])) {
            $query .= " AND o.status = :status";
        }
        if (!empty($filters['payment_status'])) {
            $query .= " AND o.payment_status = :payment_status";
        }
        
        $query .= " ORDER BY o.created_at DESC";
        
        if (!empty($filters['limit'])) {
            $query .= " LIMIT :limit";
            if (!empty($filters['offset'])) {
                $query .= " OFFSET :offset";
            }
        }
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($filters['status'])) {
            $stmt->bindParam(':status', $filters['status']);
        }
        if (!empty($filters['payment_status'])) {
            $stmt->bindParam(':payment_status', $filters['payment_status']);
        }
        if (!empty($filters['limit'])) {
            $stmt->bindParam(':limit', $filters['limit'], PDO::PARAM_INT);
            if (!empty($filters['offset'])) {
                $stmt->bindParam(':offset', $filters['offset'], PDO::PARAM_INT);
            }
        }
        
        $stmt->execute();
        return $stmt;
    }
}
