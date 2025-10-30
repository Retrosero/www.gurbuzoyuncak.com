<?php
/**
 * Ödül ve Puan Yönetimi Sınıfı
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

class Reward {
    private $conn;
    private $transaction_table = "reward_transactions";
    private $rules_table = "reward_rules";
    private $vip_levels_table = "vip_levels";
    private $users_table = "users";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Kullanıcı puan bakiyesini getir
     */
    public function getUserPoints($user_id) {
        $query = "SELECT reward_points, total_spent, vip_level_id 
                  FROM " . $this->users_table . " 
                  WHERE id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            // VIP seviye bilgisini ekle
            $vip_level = $this->getVIPLevel($user['vip_level_id']);
            $user['vip_level'] = $vip_level;
            
            // Yaklaşan puan sona erme bilgisi
            $user['expiring_soon'] = $this->getExpiringPoints($user_id);
        }
        
        return $user;
    }
    
    /**
     * Puan kazan
     */
    public function earnPoints($user_id, $source_type, $amount_or_percentage, $source_id = null, $description = '') {
        // Kural bilgisini al
        $rule = $this->getRewardRule($source_type);
        
        if (!$rule || !$rule['is_active']) {
            return ['success' => false, 'error' => 'Geçersiz puan kazanma kuralı'];
        }
        
        // Puan hesapla
        $points = 0;
        if ($rule['calculation_method'] == 'percentage') {
            $points = floor(($amount_or_percentage * $rule['points_amount']) / 100);
        } else {
            $points = $rule['points_amount'];
        }
        
        // Maksimum puan limiti kontrolü
        if ($rule['max_points_per_action'] && $points > $rule['max_points_per_action']) {
            $points = $rule['max_points_per_action'];
        }
        
        if ($points <= 0) {
            return ['success' => false, 'error' => 'Geçersiz puan miktarı'];
        }
        
        // Mevcut puanı al
        $current_user = $this->getUserPoints($user_id);
        $current_points = $current_user['reward_points'];
        $new_points = $current_points + $points;
        
        // Kullanıcı puanını güncelle
        $update_query = "UPDATE " . $this->users_table . "
                        SET reward_points = :new_points
                        WHERE id = :user_id";
        
        $stmt = $this->conn->prepare($update_query);
        $stmt->bindParam(':new_points', $new_points);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            // İşlemi kaydet
            $expires_at = null;
            if ($rule['expiry_days']) {
                $expires_at = date('Y-m-d H:i:s', strtotime("+{$rule['expiry_days']} days"));
            }
            
            $this->recordTransaction(
                $user_id,
                'earn',
                $points,
                $new_points,
                $source_type,
                $source_id,
                $description ?: $rule['description'],
                $expires_at
            );
            
            // VIP seviye kontrolü ve güncelleme
            $this->updateVIPLevel($user_id, $new_points);
            
            return [
                'success' => true,
                'points_earned' => $points,
                'new_balance' => $new_points,
                'message' => "{$points} puan kazandınız!"
            ];
        }
        
        return ['success' => false, 'error' => 'Puan eklenemedi'];
    }
    
    /**
     * Puan harca
     */
    public function spendPoints($user_id, $points, $order_id = null, $description = '') {
        if ($points <= 0) {
            return ['success' => false, 'error' => 'Geçersiz puan miktarı'];
        }
        
        $current_user = $this->getUserPoints($user_id);
        $current_points = $current_user['reward_points'];
        
        if ($points > $current_points) {
            return [
                'success' => false,
                'error' => 'Yetersiz puan',
                'current_points' => $current_points,
                'required_points' => $points
            ];
        }
        
        $new_points = $current_points - $points;
        
        // Kullanıcı puanını güncelle
        $update_query = "UPDATE " . $this->users_table . "
                        SET reward_points = :new_points
                        WHERE id = :user_id";
        
        $stmt = $this->conn->prepare($update_query);
        $stmt->bindParam(':new_points', $new_points);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            // İşlemi kaydet
            $this->recordTransaction(
                $user_id,
                'spend',
                $points,
                $new_points,
                'reward_spend',
                $order_id,
                $description ?: 'Puan kullanımı'
            );
            
            // VIP seviye kontrolü (puan azaldığında da kontrol et)
            $this->updateVIPLevel($user_id, $new_points);
            
            return [
                'success' => true,
                'points_spent' => $points,
                'new_balance' => $new_points,
                'message' => "{$points} puan harcandı"
            ];
        }
        
        return ['success' => false, 'error' => 'Puan harcanamadı'];
    }
    
    /**
     * İşlem kaydı oluştur
     */
    private function recordTransaction($user_id, $type, $points, $balance_after, $source_type, 
                                      $source_id = null, $description = '', $expires_at = null) {
        $query = "INSERT INTO " . $this->transaction_table . "
                  (user_id, transaction_type, points, balance_after, source_type,
                   source_id, description, expires_at)
                  VALUES 
                  (:user_id, :transaction_type, :points, :balance_after, :source_type,
                   :source_id, :description, :expires_at)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':transaction_type', $type);
        $stmt->bindParam(':points', $points);
        $stmt->bindParam(':balance_after', $balance_after);
        $stmt->bindParam(':source_type', $source_type);
        $stmt->bindParam(':source_id', $source_id);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':expires_at', $expires_at);
        
        return $stmt->execute();
    }
    
    /**
     * Puan kazanma kuralını getir
     */
    public function getRewardRule($rule_type) {
        $query = "SELECT * FROM " . $this->rules_table . "
                  WHERE rule_type = :rule_type AND is_active = 1
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':rule_type', $rule_type);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Tüm aktif kuralları listele
     */
    public function getAllRules() {
        $query = "SELECT * FROM " . $this->rules_table . "
                  WHERE is_active = 1
                  ORDER BY rule_type";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * VIP seviyesini getir
     */
    public function getVIPLevel($level_id) {
        if (!$level_id) {
            // Varsayılan seviye
            $level_id = 1;
        }
        
        $query = "SELECT * FROM " . $this->vip_levels_table . "
                  WHERE id = :level_id AND is_active = 1
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':level_id', $level_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Tüm VIP seviyelerini listele
     */
    public function getAllVIPLevels() {
        $query = "SELECT * FROM " . $this->vip_levels_table . "
                  WHERE is_active = 1
                  ORDER BY display_order, min_points";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Puan bazında uygun VIP seviyesini bul
     */
    public function findVIPLevelByPoints($points) {
        $query = "SELECT * FROM " . $this->vip_levels_table . "
                  WHERE is_active = 1
                  AND min_points <= :points
                  AND (max_points IS NULL OR max_points >= :points)
                  ORDER BY min_points DESC
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':points', $points);
        $stmt->execute();
        
        $level = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Eğer bulunamazsa en düşük seviyeyi al
        if (!$level) {
            $query = "SELECT * FROM " . $this->vip_levels_table . "
                      WHERE is_active = 1
                      ORDER BY min_points ASC
                      LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $level = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        return $level;
    }
    
    /**
     * VIP seviyesini güncelle
     */
    public function updateVIPLevel($user_id, $current_points) {
        $appropriate_level = $this->findVIPLevelByPoints($current_points);
        
        if ($appropriate_level) {
            $query = "UPDATE " . $this->users_table . "
                      SET vip_level_id = :vip_level_id
                      WHERE id = :user_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':vip_level_id', $appropriate_level['id']);
            $stmt->bindParam(':user_id', $user_id);
            
            return $stmt->execute();
        }
        
        return false;
    }
    
    /**
     * İşlem geçmişi
     */
    public function getTransactionHistory($user_id, $limit = 50, $offset = 0) {
        $query = "SELECT * FROM " . $this->transaction_table . "
                  WHERE user_id = :user_id
                  ORDER BY created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Yaklaşan sona erecek puanlar
     */
    public function getExpiringPoints($user_id, $days = 30) {
        $future_date = date('Y-m-d H:i:s', strtotime("+{$days} days"));
        
        $query = "SELECT SUM(points) as expiring_points, MIN(expires_at) as earliest_expiry
                  FROM " . $this->transaction_table . "
                  WHERE user_id = :user_id
                  AND transaction_type = 'earn'
                  AND is_expired = 0
                  AND expires_at IS NOT NULL
                  AND expires_at <= :future_date";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':future_date', $future_date);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Süresi dolan puanları işaretle ve düş
     */
    public function expirePoints() {
        $now = date('Y-m-d H:i:s');
        
        // Süresi dolan kazanılmış puanları bul
        $query = "SELECT user_id, SUM(points) as expired_points
                  FROM " . $this->transaction_table . "
                  WHERE transaction_type = 'earn'
                  AND is_expired = 0
                  AND expires_at IS NOT NULL
                  AND expires_at <= :now
                  GROUP BY user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':now', $now);
        $stmt->execute();
        
        $expired_users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($expired_users as $user) {
            // Kullanıcı puanını azalt
            $current_user = $this->getUserPoints($user['user_id']);
            $new_points = max(0, $current_user['reward_points'] - $user['expired_points']);
            
            $update_query = "UPDATE " . $this->users_table . "
                            SET reward_points = :new_points
                            WHERE id = :user_id";
            
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(':new_points', $new_points);
            $update_stmt->bindParam(':user_id', $user['user_id']);
            $update_stmt->execute();
            
            // Süresi dolan puanları işaretle
            $mark_query = "UPDATE " . $this->transaction_table . "
                          SET is_expired = 1
                          WHERE user_id = :user_id
                          AND transaction_type = 'earn'
                          AND is_expired = 0
                          AND expires_at <= :now";
            
            $mark_stmt = $this->conn->prepare($mark_query);
            $mark_stmt->bindParam(':user_id', $user['user_id']);
            $mark_stmt->bindParam(':now', $now);
            $mark_stmt->execute();
            
            // Süre dolumu işlemi kaydet
            $this->recordTransaction(
                $user['user_id'],
                'expire',
                $user['expired_points'],
                $new_points,
                'admin_adjustment',
                null,
                'Puanların süresi doldu'
            );
            
            // VIP seviye güncelle
            $this->updateVIPLevel($user['user_id'], $new_points);
        }
        
        return count($expired_users);
    }
    
    /**
     * Puan - TL dönüşüm oranını hesapla
     */
    public function calculatePointsToMoney($points, $conversion_rate = 0.1) {
        // Varsayılan: 1 puan = 0.10 TL
        return round($points * $conversion_rate, 2);
    }
    
    /**
     * TL - Puan dönüşümü (kazanım için)
     */
    public function calculateMoneyToPoints($amount, $conversion_rate = 1) {
        // Varsayılan: 1 TL = 1 puan
        return floor($amount * $conversion_rate);
    }
    
    /**
     * Sipariş sonrası otomatik puan kazandır
     */
    public function awardPurchasePoints($user_id, $order_id, $order_total) {
        return $this->earnPoints(
            $user_id,
            'purchase',
            $order_total,
            $order_id,
            "Sipariş #{$order_id} için puan kazancı"
        );
    }
    
    /**
     * Yorum sonrası puan kazandır
     */
    public function awardReviewPoints($user_id, $review_id, $product_name) {
        return $this->earnPoints(
            $user_id,
            'review',
            1, // Fixed amount
            $review_id,
            "'{$product_name}' ürünü için yorum"
        );
    }
    
    /**
     * Admin puan düzeltme
     */
    public function adjustPoints($user_id, $points, $description = 'Admin düzeltmesi') {
        $current_user = $this->getUserPoints($user_id);
        $current_points = $current_user['reward_points'];
        $new_points = max(0, $current_points + $points);
        
        $update_query = "UPDATE " . $this->users_table . "
                        SET reward_points = :new_points
                        WHERE id = :user_id";
        
        $stmt = $this->conn->prepare($update_query);
        $stmt->bindParam(':new_points', $new_points);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            $this->recordTransaction(
                $user_id,
                $points >= 0 ? 'earn' : 'spend',
                abs($points),
                $new_points,
                'admin_adjustment',
                null,
                $description
            );
            
            $this->updateVIPLevel($user_id, $new_points);
            
            return ['success' => true, 'new_balance' => $new_points];
        }
        
        return ['success' => false, 'error' => 'Puan düzeltilemedi'];
    }
    
    /**
     * Kullanıcı istatistikleri
     */
    public function getUserStatistics($user_id) {
        $points_data = $this->getUserPoints($user_id);
        
        // Toplam kazanılan puan
        $query = "SELECT SUM(points) as total_earned
                  FROM " . $this->transaction_table . "
                  WHERE user_id = :user_id AND transaction_type = 'earn'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $earned = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Toplam harcanan puan
        $query = "SELECT SUM(points) as total_spent
                  FROM " . $this->transaction_table . "
                  WHERE user_id = :user_id AND transaction_type = 'spend'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $spent = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Bir sonraki VIP seviye
        $current_points = $points_data['reward_points'];
        $next_level = $this->getNextVIPLevel($current_points);
        
        return [
            'current_points' => $current_points,
            'total_earned' => $earned['total_earned'] ?? 0,
            'total_spent' => $spent['total_spent'] ?? 0,
            'vip_level' => $points_data['vip_level'],
            'next_level' => $next_level,
            'points_to_next_level' => $next_level ? max(0, $next_level['min_points'] - $current_points) : 0,
            'expiring_soon' => $points_data['expiring_soon']
        ];
    }
    
    /**
     * Bir sonraki VIP seviye
     */
    private function getNextVIPLevel($current_points) {
        $query = "SELECT * FROM " . $this->vip_levels_table . "
                  WHERE is_active = 1
                  AND min_points > :current_points
                  ORDER BY min_points ASC
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':current_points', $current_points);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
