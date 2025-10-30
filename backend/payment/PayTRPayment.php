<?php
/**
 * PayTR Ödeme Entegrasyonu
 * 
 * API Dökümanı: https://www.paytr.com/
 * 
 * API Anahtarları .env dosyasından veya config'den alınmalıdır
 */

class PayTRPayment {
    private $merchantId;
    private $merchantKey;
    private $merchantSalt;
    
    public function __construct() {
        // Production için gerçek anahtarlar kullanılmalı
        $this->merchantId = getenv('PAYTR_MERCHANT_ID') ?: 'XXXXXX';
        $this->merchantKey = getenv('PAYTR_MERCHANT_KEY') ?: 'XXXXXXXXXXXXXXXX';
        $this->merchantSalt = getenv('PAYTR_MERCHANT_SALT') ?: 'XXXXXXXXXXXXXXXX';
    }
    
    /**
     * Ödeme formu oluşturma (iframe)
     */
    public function createPaymentForm($orderData) {
        $merchant_id = $this->merchantId;
        $merchant_key = $this->merchantKey;
        $merchant_salt = $this->merchantSalt;
        
        // Sepet bilgisi hazırlama
        $user_basket = base64_encode(json_encode($orderData['basket']));
        
        // Toplam tutarı kuruşa çevir (100 TL = 10000 kuruş)
        $payment_amount = intval($orderData['total_amount'] * 100);
        
        $merchant_oid = $orderData['order_id'];
        $user_name = $orderData['user_name'];
        $user_address = $orderData['user_address'];
        $user_phone = $orderData['user_phone'];
        $merchant_ok_url = $orderData['success_url'];
        $merchant_fail_url = $orderData['fail_url'];
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $email = $orderData['email'];
        
        // Taksit bilgileri (tek çekim için boş, taksitli için sayı)
        $max_installment = $orderData['max_installment'] ?? 0;
        
        // Test modu (1 = test, 0 = canlı)
        $test_mode = $orderData['test_mode'] ?? 1;
        
        // Ödeme tipi (opsiyonel - boş bırakılabilir)
        $no_installment = $orderData['no_installment'] ?? 0;
        
        // Timeout limiti (dakika cinsinden)
        $timeout_limit = 30;
        
        // Para birimi
        $currency = "TL";
        
        // Dil
        $lang = "tr";
        
        // Hash oluşturma
        $hash_str = $merchant_id . $user_ip . $merchant_oid . $email . $payment_amount . 
                    $user_basket . $no_installment . $max_installment . $currency . $test_mode . $merchant_salt;
        $paytr_token = base64_encode(hash_hmac('sha256', $hash_str, $merchant_key, true));
        
        // API'ye gönderilecek POST verisi
        $post_vals = [
            'merchant_id' => $merchant_id,
            'user_ip' => $user_ip,
            'merchant_oid' => $merchant_oid,
            'email' => $email,
            'payment_amount' => $payment_amount,
            'paytr_token' => $paytr_token,
            'user_basket' => $user_basket,
            'debug_on' => 1,
            'no_installment' => $no_installment,
            'max_installment' => $max_installment,
            'user_name' => $user_name,
            'user_address' => $user_address,
            'user_phone' => $user_phone,
            'merchant_ok_url' => $merchant_ok_url,
            'merchant_fail_url' => $merchant_fail_url,
            'timeout_limit' => $timeout_limit,
            'currency' => $currency,
            'test_mode' => $test_mode,
            'lang' => $lang
        ];
        
        // cURL ile API'ye istek gönder
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.paytr.com/odeme/api/get-token");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_vals);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $result = @curl_exec($ch);
        
        if (curl_errno($ch)) {
            return [
                'status' => 'error',
                'message' => curl_error($ch)
            ];
        }
        
        curl_close($ch);
        
        $result = json_decode($result, true);
        
        if ($result['status'] == 'success') {
            return [
                'status' => 'success',
                'token' => $result['token'],
                'iframe_url' => 'https://www.paytr.com/odeme/guvenli/' . $result['token']
            ];
        } else {
            return [
                'status' => 'error',
                'message' => $result['reason']
            ];
        }
    }
    
    /**
     * Callback doğrulama (IPN - Instant Payment Notification)
     */
    public function verifyCallback($postData) {
        $merchant_key = $this->merchantKey;
        $merchant_salt = $this->merchantSalt;
        
        $hash = base64_encode(hash_hmac('sha256', 
            $postData['merchant_oid'] . $merchant_salt . $postData['status'] . $postData['total_amount'], 
            $merchant_key, true));
        
        if ($hash != $postData['hash']) {
            return [
                'status' => 'error',
                'message' => 'Hash doğrulaması başarısız'
            ];
        }
        
        if ($postData['status'] == 'success') {
            return [
                'status' => 'success',
                'order_id' => $postData['merchant_oid'],
                'payment_amount' => $postData['total_amount'] / 100, // Kuruştan TL'ye
                'payment_type' => $postData['payment_type']
            ];
        } else {
            return [
                'status' => 'failed',
                'order_id' => $postData['merchant_oid'],
                'failed_reason_code' => $postData['failed_reason_code'],
                'failed_reason_msg' => $postData['failed_reason_msg']
            ];
        }
    }
}

/**
 * Kullanım örneği:
 * 
 * // Ödeme formu oluşturma
 * $paytr = new PayTRPayment();
 * 
 * $orderData = [
 *     'order_id' => 'ORD-12345',
 *     'total_amount' => 150.00,
 *     'user_name' => 'Ahmet Yılmaz',
 *     'user_address' => 'Güzeloba Mah. Antalya',
 *     'user_phone' => '05551234567',
 *     'email' => 'ahmet@example.com',
 *     'success_url' => 'https://yourdomain.com/payment/success',
 *     'fail_url' => 'https://yourdomain.com/payment/fail',
 *     'max_installment' => 0, // Tek çekim
 *     'test_mode' => 1, // Test modu (0 = canlı)
 *     'basket' => [
 *         ['LEGO Classic', '75.00', 2],
 *         ['Hot Wheels Araba', '50.00', 1]
 *     ]
 * ];
 * 
 * $result = $paytr->createPaymentForm($orderData);
 * 
 * if ($result['status'] == 'success') {
 *     // Ödeme iframe'ini göster
 *     echo '<iframe src="' . $result['iframe_url'] . '" width="100%" height="600"></iframe>';
 * } else {
 *     echo 'Hata: ' . $result['message'];
 * }
 * 
 * 
 * // Callback sayfasında (payment_callback.php)
 * $paytr = new PayTRPayment();
 * $result = $paytr->verifyCallback($_POST);
 * 
 * if ($result['status'] == 'success') {
 *     // Ödeme başarılı - Siparişi onayla
 *     // Veritabanında sipariş durumunu güncelle
 *     echo "OK"; // PayTR'ye başarılı yanıt döndür
 * } else {
 *     // Ödeme başarısız
 *     echo "FAIL";
 * }
 */
?>
