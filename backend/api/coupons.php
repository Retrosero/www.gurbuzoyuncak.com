<?php
/**
 * Kupon API
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

session_start();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';
include_once '../classes/Coupon.php';

$database = new Database();
$db = $database->getConnection();

$coupon = new Coupon($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Kupon listesi veya tek kupon getir
        if (isset($_GET['id'])) {
            $coupon->id = $_GET['id'];
            $result = $coupon->readOne();
            
            if ($result) {
                echo json_encode($result);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Kupon bulunamadı']);
            }
        } elseif (isset($_GET['action']) && $_GET['action'] == 'validate') {
            // Kupon doğrulama
            if (empty($_GET['code'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Kupon kodu gerekli']);
                exit;
            }
            
            $code = $_GET['code'];
            $user_id = $_GET['user_id'] ?? null;
            $cart_total = floatval($_GET['cart_total'] ?? 0);
            $customer_type = $_GET['customer_type'] ?? 'B2C';
            
            // Sepet ürünleri (JSON formatında gönderilmeli)
            $cart_items = [];
            if (!empty($_GET['cart_items'])) {
                $cart_items = json_decode($_GET['cart_items'], true);
            }
            
            $validation = $coupon->validate($code, $user_id, $cart_total, $cart_items, $customer_type);
            
            if ($validation['valid']) {
                echo json_encode([
                    'valid' => true,
                    'discount' => $validation['discount'],
                    'coupon' => $validation['coupon'],
                    'message' => 'Kupon başarıyla uygulandı'
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'valid' => false,
                    'error' => $validation['error']
                ]);
            }
        } else {
            // Tüm kuponları listele
            $filters = [];
            
            if (isset($_GET['is_active'])) {
                $filters['is_active'] = $_GET['is_active'];
            }
            
            if (isset($_GET['customer_type'])) {
                $filters['customer_type'] = $_GET['customer_type'];
            }
            
            if (isset($_GET['search'])) {
                $filters['search'] = $_GET['search'];
            }
            
            $stmt = $coupon->readAll($filters);
            $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['data' => $coupons]);
        }
        break;
        
    case 'POST':
        // Yeni kupon oluştur
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz veri']);
            exit;
        }
        
        // Yetki kontrolü
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Yetkiniz yok']);
            exit;
        }
        
        // Zorunlu alanlar
        if (empty($data->code) || empty($data->name) || empty($data->discount_type) || 
            empty($data->discount_value) || empty($data->valid_from) || empty($data->valid_until)) {
            http_response_code(400);
            echo json_encode(['error' => 'Zorunlu alanları doldurun']);
            exit;
        }
        
        $coupon->code = strtoupper($data->code);
        $coupon->name = $data->name;
        $coupon->description = $data->description ?? '';
        $coupon->discount_type = $data->discount_type;
        $coupon->discount_value = $data->discount_value;
        $coupon->min_purchase_amount = $data->min_purchase_amount ?? 0;
        $coupon->max_discount_amount = $data->max_discount_amount ?? null;
        $coupon->usage_limit = $data->usage_limit ?? null;
        $coupon->usage_limit_per_user = $data->usage_limit_per_user ?? 1;
        $coupon->valid_from = $data->valid_from;
        $coupon->valid_until = $data->valid_until;
        $coupon->customer_type = $data->customer_type ?? 'all';
        $coupon->applicable_to = $data->applicable_to ?? 'all';
        $coupon->is_active = $data->is_active ?? 1;
        
        if ($coupon->create()) {
            // Kategori/ürün ilişkilendirme
            if ($coupon->applicable_to == 'categories' && !empty($data->category_ids)) {
                $coupon->attachCategories($data->category_ids);
            }
            
            if ($coupon->applicable_to == 'products' && !empty($data->product_ids)) {
                $coupon->attachProducts($data->product_ids);
            }
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Kupon başarıyla oluşturuldu',
                'id' => $coupon->id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Kupon oluşturulamadı']);
        }
        break;
        
    case 'PUT':
        // Kupon güncelle
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || empty($data->id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz veri']);
            exit;
        }
        
        // Yetki kontrolü
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Yetkiniz yok']);
            exit;
        }
        
        $coupon->id = $data->id;
        $coupon->name = $data->name;
        $coupon->description = $data->description ?? '';
        $coupon->discount_type = $data->discount_type;
        $coupon->discount_value = $data->discount_value;
        $coupon->min_purchase_amount = $data->min_purchase_amount ?? 0;
        $coupon->max_discount_amount = $data->max_discount_amount ?? null;
        $coupon->usage_limit = $data->usage_limit ?? null;
        $coupon->usage_limit_per_user = $data->usage_limit_per_user ?? 1;
        $coupon->valid_from = $data->valid_from;
        $coupon->valid_until = $data->valid_until;
        $coupon->customer_type = $data->customer_type ?? 'all';
        $coupon->applicable_to = $data->applicable_to ?? 'all';
        $coupon->is_active = $data->is_active ?? 1;
        
        if ($coupon->update()) {
            // Kategori/ürün ilişkilendirme güncelle
            if ($coupon->applicable_to == 'categories') {
                $category_ids = $data->category_ids ?? [];
                $coupon->attachCategories($category_ids);
            }
            
            if ($coupon->applicable_to == 'products') {
                $product_ids = $data->product_ids ?? [];
                $coupon->attachProducts($product_ids);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Kupon başarıyla güncellendi'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Kupon güncellenemedi']);
        }
        break;
        
    case 'DELETE':
        // Kupon sil
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || empty($data->id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Kupon ID gerekli']);
            exit;
        }
        
        // Yetki kontrolü
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Yetkiniz yok']);
            exit;
        }
        
        $coupon->id = $data->id;
        
        if ($coupon->delete()) {
            echo json_encode([
                'success' => true,
                'message' => 'Kupon başarıyla silindi'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Kupon silinemedi']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
