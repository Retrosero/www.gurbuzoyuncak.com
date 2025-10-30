<?php
/**
 * PayTR Bayi Ödeme Entegrasyonu
 * 
 * Bayi bakiye yüklemeleri için özelleştirilmiş PayTR entegrasyonu
 */

class PayTRBayi {
    private $merchantId;
    private $merchantKey;
    private $merchantSalt;
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
        
        // Production için gerçek anahtarlar kullanılmalıdır
        $this->merchantId = getenv('PAYTR_MERCHANT_ID') ?: 'XXXXXX';
        $this->merchantKey = getenv('PAYTR_MERCHANT_KEY') ?: 'XXXXXXXXXXXXXXXX';
        $this->merchantSalt = getenv('PAYTR_MERCHANT_SALT') ?: 'XXXXXXXXXXXXXXXX';
    }
    
    /**
     * Bayi bakiye yükleme ödeme formu oluşturma
     */
    public function createBalancePaymentForm($bayiData, $amount, $test_mode = 1) {
        // Benzersiz sipariş numarası oluştur
        $merchant_oid = 'BAYI_BAL_' . $bayiData['bayi_id'] . '_' . time();
        
        // Sepet bilgisi (bayi bakiye yüklemesi)
        $basket = [
            [
                "name" => "Bayi Bakiye Yüklemesi",
                "category1" => "Bakiye",
                "category2" => "Yükleme",
                "type" => "Bakiye",
                "quantity" => "1",
                "price" => $amount * 100 // kuruş cinsinden
            ]
        ];
        
        $user_basket = base64_encode(json_encode($basket));
        
        // Toplam tutarı kuruşa çevir
        $payment_amount = intval($amount * 100);
        
        // Kullanıcı bilgileri
        $user_name = $bayiData['contact_person'];
        $user_address = $bayiData['address'];
        $user_phone = $bayiData['phone'];
        $email = $bayiData['email'];
        $user_ip = $_SERVER['REMOTE_ADDR'];
        
        // URL'ler
        $merchant_ok_url = $_SERVER['HTTP_HOST'] . '/bayi-panel/payment-success.php';
        $merchant_fail_url = $_SERVER['HTTP_HOST'] . '/bayi-panel/payment-fail.php';
        
        // Taksit (bayi bakiye yüklemesi için genellikle tek çekim)
        $max_installment = 0;
        
        // Hash oluşturma
        $hash_str = $this->merchantId . $user_ip . $merchant_oid . $email . $payment_amount . $user_basket . $max_installment . 
                   ($test_mode ? 1 : 0) . $this->merchantSalt;
        $paytr_token = base64_encode(hash_hmac('sha256', $hash_str, $this->merchantKey, true));
        
        // Veritabanına kaydet
        $this->savePaymentRecord($bayiData['bayi_id'], $merchant_oid, $amount, $paytr_token, $user_ip);
        
        // PayTR API'ye gönderilecek veriler
        $post_data = [
            'merchant_id' => $this->merchantId,
            'user_ip' => $user_ip,
            'merchant_oid' => $merchant_oid,
            'email' => $email,
            'payment_amount' => $payment_amount,
            'paytr_token' => $paytr_token,
            'user_basket' => $user_basket,
            'debug_on' => $test_mode,
            'no_installment' => ($max_installment == 0) ? 1 : 0,
            'max_installment' => $max_installment,
            'user_name' => $user_name,
            'user_address' => $user_address,
            'user_phone' => $user_phone,
            'merchant_ok_url' => $merchant_ok_url,
            'merchant_fail_url' => $merchant_fail_url,
            'timeout_limit' => 30,
            'currency' => 'TL'
        ];
        
        // PayTR'ye istek gönder
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.paytr.com/odeme/api/get-token");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
        curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $result = curl_exec($ch);
        
        if (curl_error($ch)) {
            curl_close($ch);
            return ['error' => 'CURL Error: ' . curl_error($ch)];
        }
        
        curl_close($ch);
        
        $response = json_decode($result, true);
        
        if ($response['status'] == 'success') {
            return [
                'success' => true,
                'token' => $response['token'],
                'merchant_oid' => $merchant_oid,
                'iframe_url' => 'https://www.paytr.com/odeme/guvenli/' . $response['token']
            ];
        } else {
            return ['error' => $response['reason'] ?? 'PayTR hatası'];
        }
    }
    
    /**
     * PayTR callback doğrulama
     */
    public function verifyCallback($post_data) {
        $merchant_oid = $post_data['merchant_oid'];
        $status = $post_data['status'];
        $total_amount = $post_data['total_amount'];
        $hash = $post_data['hash'];
        
        // Hash doğrulama
        $hash_str = $merchant_oid . $this->merchantSalt . $status . $total_amount;
        $calculated_hash = base64_encode(hash_hmac('sha256', $hash_str, $this->merchantKey, true));
        
        if ($hash !== $calculated_hash) {
            return ['error' => 'Hash doğrulama hatası'];
        }
        
        // Veritabanından işlemi bul
        $payment_record = $this->getPaymentRecord($merchant_oid);
        
        if (!$payment_record) {
            return ['error' => 'Ödeme kaydı bulunamadı'];
        }
        
        if ($status == 'success') {
            // Ödeme başarılı - bakiye yükle
            $amount = $total_amount / 100; // kuruştan TL'ye çevir
            
            $bayi = new Bayi($this->conn);
            $bayi->bayi_id = $payment_record['bayi_id'];
            
            $result = $bayi->bakiyeYukle($amount, 'PayTR ile bakiye yüklemesi', 'paytr', $merchant_oid);
            
            if ($result['success']) {
                // Ödeme durumunu güncelle
                $this->updatePaymentStatus($merchant_oid, 'success', json_encode($post_data));
                return ['success' => true, 'message' => 'Bakiye yüklendi'];
            } else {
                return ['error' => 'Bakiye yüklenirken hata oluştu'];
            }
        } else {
            // Ödeme başarısız
            $this->updatePaymentStatus($merchant_oid, 'failed', json_encode($post_data));
            return ['error' => 'Ödeme başarısız'];
        }
    }
    
    /**
     * Ödeme kaydı oluştur
     */
    private function savePaymentRecord($bayi_id, $merchant_oid, $amount, $hash, $user_ip) {
        $query = "INSERT INTO bayi_paytr_transactions 
                  SET bayi_id = :bayi_id,
                      merchant_oid = :merchant_oid,
                      payment_amount = :amount,
                      hash = :hash,
                      user_ip = :user_ip,
                      status = 'pending'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $bayi_id);
        $stmt->bindParam(':merchant_oid', $merchant_oid);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':hash', $hash);
        $stmt->bindParam(':user_ip', $user_ip);
        
        return $stmt->execute();
    }
    
    /**
     * Ödeme kaydını getir
     */
    private function getPaymentRecord($merchant_oid) {
        $query = "SELECT * FROM bayi_paytr_transactions WHERE merchant_oid = :merchant_oid";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':merchant_oid', $merchant_oid);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Ödeme durumunu güncelle
     */
    private function updatePaymentStatus($merchant_oid, $status, $callback_data) {
        $query = "UPDATE bayi_paytr_transactions 
                  SET status = :status,
                      callback_received = 1,
                      callback_data = :callback_data,
                      updated_at = NOW()
                  WHERE merchant_oid = :merchant_oid";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':callback_data', $callback_data);
        $stmt->bindParam(':merchant_oid', $merchant_oid);
        
        return $stmt->execute();
    }
    
    /**
     * Bayi ödeme geçmişi
     */
    public function getBayiPaymentHistory($bayi_id, $limit = 50, $offset = 0) {
        $query = "SELECT * FROM bayi_paytr_transactions 
                  WHERE bayi_id = :bayi_id 
                  ORDER BY created_at DESC 
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $bayi_id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Test modu için demo ödeme
     */
    public function createTestPayment($bayi_id, $amount) {
        // Test modunda direkt bakiye yükle
        $bayi = new Bayi($this->conn);
        $bayi->bayi_id = $bayi_id;
        
        $merchant_oid = 'TEST_BAYI_' . $bayi_id . '_' . time();
        
        $result = $bayi->bakiyeYukle($amount, 'Test modunda bakiye yüklemesi', 'test', $merchant_oid);
        
        if ($result['success']) {
            // Test ödeme kaydı oluştur
            $this->savePaymentRecord($bayi_id, $merchant_oid, $amount, 'test_hash', $_SERVER['REMOTE_ADDR']);
            $this->updatePaymentStatus($merchant_oid, 'success', json_encode(['test' => true, 'amount' => $amount]));
            
            return ['success' => true, 'message' => 'Test ödemesi tamamlandı', 'new_balance' => $result['new_balance']];
        }
        
        return ['error' => 'Test ödemesi başarısız'];
    }
}
?>