<?php
/**
 * İyzico Ödeme Entegrasyonu
 * 
 * Kurulum:
 * composer require iyzico/iyzipay-php
 * 
 * API Anahtarları .env dosyasından veya config'den alınmalıdır
 */

class IyzicoPayment {
    private $apiKey;
    private $secretKey;
    private $baseUrl;
    
    public function __construct() {
        // Production için gerçek anahtarlar kullanılmalı
        $this->apiKey = getenv('IYZICO_API_KEY') ?: 'sandbox-api-key';
        $this->secretKey = getenv('IYZICO_SECRET_KEY') ?: 'sandbox-secret-key';
        $this->baseUrl = getenv('IYZICO_BASE_URL') ?: 'https://sandbox-api.iyzipay.com';
    }
    
    /**
     * Ödeme başlatma
     */
    public function createPayment($orderData) {
        require_once('iyzipay/IyzipayBootstrap.php');
        
        \Iyzipay\Options::$apiKey = $this->apiKey;
        \Iyzipay\Options::$secretKey = $this->secretKey;
        \Iyzipay\Options::$baseUrl = $this->baseUrl;
        
        $request = new \Iyzipay\Request\CreatePaymentRequest();
        $request->setLocale(\Iyzipay\Model\Locale::TR);
        $request->setConversationId($orderData['order_id']);
        $request->setPrice($orderData['total_amount']);
        $request->setPaidPrice($orderData['total_amount']);
        $request->setCurrency(\Iyzipay\Model\Currency::TL);
        $request->setInstallment(1);
        $request->setBasketId($orderData['order_id']);
        $request->setPaymentChannel(\Iyzipay\Model\PaymentChannel::WEB);
        $request->setPaymentGroup(\Iyzipay\Model\PaymentGroup::PRODUCT);
        
        // Kart bilgileri
        $paymentCard = new \Iyzipay\Model\PaymentCard();
        $paymentCard->setCardHolderName($orderData['card_holder_name']);
        $paymentCard->setCardNumber($orderData['card_number']);
        $paymentCard->setExpireMonth($orderData['expire_month']);
        $paymentCard->setExpireYear($orderData['expire_year']);
        $paymentCard->setCvc($orderData['cvc']);
        $paymentCard->setRegisterCard(0);
        $request->setPaymentCard($paymentCard);
        
        // Alıcı bilgileri
        $buyer = new \Iyzipay\Model\Buyer();
        $buyer->setId($orderData['user_id']);
        $buyer->setName($orderData['buyer_name']);
        $buyer->setSurname($orderData['buyer_surname']);
        $buyer->setEmail($orderData['buyer_email']);
        $buyer->setIdentityNumber("11111111111"); // TC kimlik no
        $buyer->setRegistrationAddress($orderData['buyer_address']);
        $buyer->setCity($orderData['buyer_city']);
        $buyer->setCountry("Turkey");
        $buyer->setZipCode($orderData['buyer_zip']);
        $buyer->setIp($orderData['buyer_ip']);
        $request->setBuyer($buyer);
        
        // Teslimat adresi
        $shippingAddress = new \Iyzipay\Model\Address();
        $shippingAddress->setContactName($orderData['shipping_name']);
        $shippingAddress->setCity($orderData['shipping_city']);
        $shippingAddress->setCountry("Turkey");
        $shippingAddress->setAddress($orderData['shipping_address']);
        $shippingAddress->setZipCode($orderData['shipping_zip']);
        $request->setShippingAddress($shippingAddress);
        
        // Fatura adresi
        $billingAddress = new \Iyzipay\Model\Address();
        $billingAddress->setContactName($orderData['billing_name']);
        $billingAddress->setCity($orderData['billing_city']);
        $billingAddress->setCountry("Turkey");
        $billingAddress->setAddress($orderData['billing_address']);
        $billingAddress->setZipCode($orderData['billing_zip']);
        $request->setBillingAddress($billingAddress);
        
        // Sepet ürünleri
        $basketItems = [];
        foreach ($orderData['items'] as $item) {
            $basketItem = new \Iyzipay\Model\BasketItem();
            $basketItem->setId($item['product_id']);
            $basketItem->setName($item['name']);
            $basketItem->setCategory1("Oyuncak");
            $basketItem->setItemType(\Iyzipay\Model\BasketItemType::PHYSICAL);
            $basketItem->setPrice($item['price'] * $item['quantity']);
            $basketItems[] = $basketItem;
        }
        $request->setBasketItems($basketItems);
        
        // Ödeme isteğini gönder
        $payment = \Iyzipay\Model\Payment::create($request);
        
        return [
            'status' => $payment->getStatus(),
            'payment_id' => $payment->getPaymentId(),
            'fraud_status' => $payment->getFraudStatus(),
            'error_message' => $payment->getErrorMessage()
        ];
    }
    
    /**
     * 3D Secure ödeme başlatma
     */
    public function create3DPayment($orderData, $callbackUrl) {
        require_once('iyzipay/IyzipayBootstrap.php');
        
        \Iyzipay\Options::$apiKey = $this->apiKey;
        \Iyzipay\Options::$secretKey = $this->secretKey;
        \Iyzipay\Options::$baseUrl = $this->baseUrl;
        
        $request = new \Iyzipay\Request\CreatePaymentRequest();
        // ... (yukarıdaki gibi request ayarları)
        
        $request->setCallbackUrl($callbackUrl);
        
        $threedsInitialize = \Iyzipay\Model\ThreedsInitialize::create($request);
        
        return [
            'status' => $threedsInitialize->getStatus(),
            'html_content' => $threedsInitialize->getHtmlContent(),
            'error_message' => $threedsInitialize->getErrorMessage()
        ];
    }
    
    /**
     * 3D Secure callback doğrulama
     */
    public function verify3DPayment($token) {
        require_once('iyzipay/IyzipayBootstrap.php');
        
        \Iyzipay\Options::$apiKey = $this->apiKey;
        \Iyzipay\Options::$secretKey = $this->secretKey;
        \Iyzipay\Options::$baseUrl = $this->baseUrl;
        
        $request = new \Iyzipay\Request\CreateThreedsPaymentRequest();
        $request->setPaymentId($token);
        
        $threedsPayment = \Iyzipay\Model\ThreedsPayment::create($request);
        
        return [
            'status' => $threedsPayment->getStatus(),
            'payment_id' => $threedsPayment->getPaymentId(),
            'error_message' => $threedsPayment->getErrorMessage()
        ];
    }
}

/**
 * Kullanım örneği:
 * 
 * $iyzico = new IyzicoPayment();
 * 
 * $orderData = [
 *     'order_id' => 'ORD-12345',
 *     'user_id' => 1,
 *     'total_amount' => 150.00,
 *     'card_holder_name' => 'Ahmet Yılmaz',
 *     'card_number' => '5528790000000008',
 *     'expire_month' => '12',
 *     'expire_year' => '2030',
 *     'cvc' => '123',
 *     'buyer_name' => 'Ahmet',
 *     'buyer_surname' => 'Yılmaz',
 *     'buyer_email' => 'ahmet@example.com',
 *     'buyer_address' => 'Güzeloba Mah.',
 *     'buyer_city' => 'Antalya',
 *     'buyer_zip' => '07000',
 *     'buyer_ip' => $_SERVER['REMOTE_ADDR'],
 *     'shipping_name' => 'Ahmet Yılmaz',
 *     'shipping_address' => 'Güzeloba Mah.',
 *     'shipping_city' => 'Antalya',
 *     'shipping_zip' => '07000',
 *     'billing_name' => 'Ahmet Yılmaz',
 *     'billing_address' => 'Güzeloba Mah.',
 *     'billing_city' => 'Antalya',
 *     'billing_zip' => '07000',
 *     'items' => [
 *         [
 *             'product_id' => 1,
 *             'name' => 'LEGO Classic',
 *             'price' => 75.00,
 *             'quantity' => 2
 *         ]
 *     ]
 * ];
 * 
 * // Direkt ödeme
 * $result = $iyzico->createPayment($orderData);
 * 
 * // veya 3D Secure
 * $result = $iyzico->create3DPayment($orderData, 'https://yourdomain.com/payment/callback');
 */
?>
