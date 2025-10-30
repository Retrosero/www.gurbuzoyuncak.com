<?php
/**
 * Bakiye Yönetimi Sınıfı
 * Gürbüz Oyuncak E-Ticaret Sistemi - B2B/Bayi Bakiye Sistemi
 */

class Balance {
    private $conn;
    private $balance_table = "user_balance";
    private $transaction_table = "balance_transactions";
    
    public $user_id;
    public $current_balance;
    public $credit_limit;
    public $low_balance_threshold;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Kullanıcı bakiyesini getir
     */
    public function getUserBalance($user_id) {
        $query = "SELECT * FROM " . $this->balance_table . " 
                  WHERE user_id = :user_id AND is_active = 1 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        $balance = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Bakiye hesabı yoksa oluştur
        if (!$balance) {
            $this->createBalanceAccount($user_id);
            return $this->getUserBalance($user_id);
        }
        
        return $balance;
    }
    
    /**
     * Bakiye hesabı oluştur
     */
    public function createBalanceAccount($user_id, $initial_balance = 0, $credit_limit = 0) {
        $query = "INSERT INTO " . $this->balance_table . "
                  (user_id, current_balance, credit_limit, low_balance_threshold)
                  VALUES (:user_id, :current_balance, :credit_limit, :low_balance_threshold)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':current_balance', $initial_balance);
        $stmt->bindParam(':credit_limit', $credit_limit);
        
        $default_threshold = 100;
        $stmt->bindParam(':low_balance_threshold', $default_threshold);
        
        if ($stmt->execute()) {
            if ($initial_balance > 0) {
                $this->recordTransaction(
                    $user_id,
                    'load',
                    $initial_balance,
                    0,
                    $initial_balance,
                    'manual',
                    null,
                    'İlk bakiye yüklemesi'
                );
            }
            return true;
        }
        return false;
    }
    
    /**
     * Bakiye yükle
     */
    public function loadBalance($user_id, $amount, $description = '', $processed_by = null) {
        if ($amount <= 0) {
            return ['success' => false, 'error' => 'Geçersiz tutar'];
        }
        
        $balance = $this->getUserBalance($user_id);
        $new_balance = $balance['current_balance'] + $amount;
        
        // Bakiyeyi güncelle
        $update_query = "UPDATE " . $this->balance_table . "
                        SET current_balance = :new_balance,
                            total_loaded = total_loaded + :amount
                        WHERE user_id = :user_id";
        
        $stmt = $this->conn->prepare($update_query);
        $stmt->bindParam(':new_balance', $new_balance);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            // İşlemi kaydet
            $this->recordTransaction(
                $user_id,
                'load',
                $amount,
                $balance['current_balance'],
                $new_balance,
                'manual',
                null,
                $description ?: 'Bakiye yüklemesi',
                $processed_by
            );
            
            return [
                'success' => true,
                'new_balance' => $new_balance,
                'message' => 'Bakiye başarıyla yüklendi'
            ];
        }
        
        return ['success' => false, 'error' => 'Bakiye yüklenemedi'];
    }
    
    /**
     * Bakiye harca (sipariş ödemesi)
     */
    public function spendBalance($user_id, $amount, $order_id, $description = '') {
        if ($amount <= 0) {
            return ['success' => false, 'error' => 'Geçersiz tutar'];
        }
        
        $balance = $this->getUserBalance($user_id);
        $available_balance = $balance['current_balance'] + $balance['credit_limit'];
        
        if ($amount > $available_balance) {
            return [
                'success' => false,
                'error' => 'Yetersiz bakiye',
                'current_balance' => $balance['current_balance'],
                'credit_limit' => $balance['credit_limit'],
                'available' => $available_balance,
                'required' => $amount
            ];
        }
        
        $new_balance = $balance['current_balance'] - $amount;
        
        // Bakiyeyi güncelle
        $update_query = "UPDATE " . $this->balance_table . "
                        SET current_balance = :new_balance,
                            total_spent = total_spent + :amount
                        WHERE user_id = :user_id";
        
        $stmt = $this->conn->prepare($update_query);
        $stmt->bindParam(':new_balance', $new_balance);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            // İşlemi kaydet
            $this->recordTransaction(
                $user_id,
                'spend',
                $amount,
                $balance['current_balance'],
                $new_balance,
                'order',
                $order_id,
                $description ?: 'Sipariş ödemesi',
                null
            );
            
            // Düşük bakiye kontrolü ve bildirim
            if ($new_balance < $balance['low_balance_threshold']) {
                $this->sendLowBalanceNotification($user_id, $new_balance);
            }
            
            return [
                'success' => true,
                'new_balance' => $new_balance,
                'message' => 'Ödeme başarıyla gerçekleşti'
            ];
        }
        
        return ['success' => false, 'error' => 'Ödeme gerçekleştirilemedi'];
    }
    
    /**
     * İade/İptal durumunda bakiye iadesi
     */
    public function refundBalance($user_id, $amount, $order_id, $description = '') {
        if ($amount <= 0) {
            return ['success' => false, 'error' => 'Geçersiz tutar'];
        }
        
        $balance = $this->getUserBalance($user_id);
        $new_balance = $balance['current_balance'] + $amount;
        
        // Bakiyeyi güncelle
        $update_query = "UPDATE " . $this->balance_table . "
                        SET current_balance = :new_balance,
                            total_spent = total_spent - :amount
                        WHERE user_id = :user_id";
        
        $stmt = $this->conn->prepare($update_query);
        $stmt->bindParam(':new_balance', $new_balance);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            // İşlemi kaydet
            $this->recordTransaction(
                $user_id,
                'refund',
                $amount,
                $balance['current_balance'],
                $new_balance,
                'order',
                $order_id,
                $description ?: 'Sipariş iadesi',
                null
            );
            
            return [
                'success' => true,
                'new_balance' => $new_balance,
                'message' => 'İade başarıyla yapıldı'
            ];
        }
        
        return ['success' => false, 'error' => 'İade gerçekleştirilemedi'];
    }
    
    /**
     * Bakiye transferi (kullanıcılar arası)
     */
    public function transferBalance($from_user_id, $to_user_id, $amount, $description = '') {
        if ($amount <= 0) {
            return ['success' => false, 'error' => 'Geçersiz tutar'];
        }
        
        if ($from_user_id == $to_user_id) {
            return ['success' => false, 'error' => 'Kendinize transfer yapamazsınız'];
        }
        
        $from_balance = $this->getUserBalance($from_user_id);
        
        if ($amount > $from_balance['current_balance']) {
            return ['success' => false, 'error' => 'Yetersiz bakiye'];
        }
        
        $to_balance = $this->getUserBalance($to_user_id);
        
        try {
            $this->conn->beginTransaction();
            
            // Gönderen bakiyesini azalt
            $new_from_balance = $from_balance['current_balance'] - $amount;
            $update_query = "UPDATE " . $this->balance_table . "
                            SET current_balance = :new_balance
                            WHERE user_id = :user_id";
            
            $stmt = $this->conn->prepare($update_query);
            $stmt->bindParam(':new_balance', $new_from_balance);
            $stmt->bindParam(':user_id', $from_user_id);
            $stmt->execute();
            
            // Alıcı bakiyesini artır
            $new_to_balance = $to_balance['current_balance'] + $amount;
            $stmt->bindParam(':new_balance', $new_to_balance);
            $stmt->bindParam(':user_id', $to_user_id);
            $stmt->execute();
            
            // Her iki taraf için işlem kaydı oluştur
            $this->recordTransaction(
                $from_user_id,
                'transfer_out',
                $amount,
                $from_balance['current_balance'],
                $new_from_balance,
                'transfer',
                $to_user_id,
                $description ?: 'Bakiye transferi - gönderen'
            );
            
            $this->recordTransaction(
                $to_user_id,
                'transfer_in',
                $amount,
                $to_balance['current_balance'],
                $new_to_balance,
                'transfer',
                $from_user_id,
                $description ?: 'Bakiye transferi - alıcı'
            );
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'from_balance' => $new_from_balance,
                'to_balance' => $new_to_balance,
                'message' => 'Transfer başarıyla tamamlandı'
            ];
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return ['success' => false, 'error' => 'Transfer gerçekleştirilemedi'];
        }
    }
    
    /**
     * İşlem kaydı oluştur
     */
    private function recordTransaction($user_id, $type, $amount, $balance_before, $balance_after, 
                                      $reference_type = null, $reference_id = null, $description = '', $processed_by = null) {
        $query = "INSERT INTO " . $this->transaction_table . "
                  (user_id, transaction_type, amount, balance_before, balance_after,
                   reference_type, reference_id, description, processed_by)
                  VALUES 
                  (:user_id, :transaction_type, :amount, :balance_before, :balance_after,
                   :reference_type, :reference_id, :description, :processed_by)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':transaction_type', $type);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':balance_before', $balance_before);
        $stmt->bindParam(':balance_after', $balance_after);
        $stmt->bindParam(':reference_type', $reference_type);
        $stmt->bindParam(':reference_id', $reference_id);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':processed_by', $processed_by);
        
        return $stmt->execute();
    }
    
    /**
     * Kullanıcı işlem geçmişi
     */
    public function getTransactionHistory($user_id, $limit = 50, $offset = 0) {
        $query = "SELECT bt.*, 
                  CONCAT(u.first_name, ' ', u.last_name) as processed_by_name
                  FROM " . $this->transaction_table . " bt
                  LEFT JOIN users u ON bt.processed_by = u.id
                  WHERE bt.user_id = :user_id
                  ORDER BY bt.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Tüm bakiye hesaplarını listele (Admin)
     */
    public function getAllBalances($filters = []) {
        $query = "SELECT ub.*, 
                  u.email, u.first_name, u.last_name, u.customer_type,
                  (ub.current_balance + ub.credit_limit) as available_balance
                  FROM " . $this->balance_table . " ub
                  INNER JOIN users u ON ub.user_id = u.id
                  WHERE ub.is_active = 1";
        
        if (!empty($filters['customer_type'])) {
            $query .= " AND u.customer_type = :customer_type";
        }
        
        if (!empty($filters['low_balance'])) {
            $query .= " AND ub.current_balance < ub.low_balance_threshold";
        }
        
        if (!empty($filters['search'])) {
            $query .= " AND (u.email LIKE :search OR u.first_name LIKE :search OR u.last_name LIKE :search)";
        }
        
        $query .= " ORDER BY ub.current_balance ASC";
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($filters['customer_type'])) {
            $stmt->bindParam(':customer_type', $filters['customer_type']);
        }
        
        if (!empty($filters['search'])) {
            $search = "%" . $filters['search'] . "%";
            $stmt->bindParam(':search', $search);
        }
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Düşük bakiye bildirimi gönder
     */
    private function sendLowBalanceNotification($user_id, $current_balance) {
        // Son bildirim zamanını kontrol et
        $query = "SELECT last_notification_sent FROM " . $this->balance_table . "
                  WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $balance = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Son 24 saat içinde bildirim gönderilmişse tekrar gönderme
        if ($balance['last_notification_sent']) {
            $last_sent = strtotime($balance['last_notification_sent']);
            $now = time();
            if (($now - $last_sent) < 86400) { // 24 saat
                return;
            }
        }
        
        // Bildirim gönder (email, SMS vb.)
        // TODO: Email/SMS entegrasyonu
        
        // Bildirim zamanını güncelle
        $update_query = "UPDATE " . $this->balance_table . "
                        SET last_notification_sent = NOW()
                        WHERE user_id = :user_id";
        $update_stmt = $this->conn->prepare($update_query);
        $update_stmt->bindParam(':user_id', $user_id);
        $update_stmt->execute();
    }
    
    /**
     * Bakiye ayarlarını güncelle
     */
    public function updateSettings($user_id, $credit_limit, $low_balance_threshold) {
        $query = "UPDATE " . $this->balance_table . "
                  SET credit_limit = :credit_limit,
                      low_balance_threshold = :low_balance_threshold
                  WHERE user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':credit_limit', $credit_limit);
        $stmt->bindParam(':low_balance_threshold', $low_balance_threshold);
        $stmt->bindParam(':user_id', $user_id);
        
        return $stmt->execute();
    }
    
    /**
     * Bakiye kontrolü (sipariş öncesi)
     */
    public function checkSufficientBalance($user_id, $required_amount) {
        $balance = $this->getUserBalance($user_id);
        $available = $balance['current_balance'] + $balance['credit_limit'];
        
        return [
            'sufficient' => $available >= $required_amount,
            'current_balance' => $balance['current_balance'],
            'credit_limit' => $balance['credit_limit'],
            'available_balance' => $available,
            'required_amount' => $required_amount,
            'shortage' => max(0, $required_amount - $available)
        ];
    }
}
