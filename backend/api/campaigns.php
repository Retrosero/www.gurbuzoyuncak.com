<?php
/**
 * Kampanya API
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

session_start();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';
include_once '../classes/Campaign.php';

$database = new Database();
$db = $database->getConnection();

$campaign = new Campaign($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Tek kampanya getir
            $campaign->id = $_GET['id'];
            $result = $campaign->readOne();
            
            if ($result) {
                echo json_encode($result);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Kampanya bulunamadı']);
            }
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'active') {
            // Aktif kampanyalar
            $customer_type = $_GET['customer_type'] ?? 'all';
            $campaigns = $campaign->getActiveCampaigns($customer_type);
            echo json_encode(['data' => $campaigns]);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'applicable') {
            // Sepet için uygulanabilir kampanyalar
            $cart_total = floatval($_GET['cart_total'] ?? 0);
            $customer_type = $_GET['customer_type'] ?? 'B2C';
            $user_id = $_GET['user_id'] ?? null;
            
            // Sepet ürünleri (JSON formatında)
            $cart_items = [];
            if (!empty($_GET['cart_items'])) {
                $cart_items = json_decode($_GET['cart_items'], true);
            }
            
            $applicable = $campaign->findApplicableCampaigns($cart_total, $cart_items, $customer_type, $user_id);
            echo json_encode(['data' => $applicable]);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'best') {
            // En iyi kampanyayı bul
            $cart_total = floatval($_GET['cart_total'] ?? 0);
            $customer_type = $_GET['customer_type'] ?? 'B2C';
            $user_id = $_GET['user_id'] ?? null;
            
            // Sepet ürünleri (JSON formatında)
            $cart_items = [];
            if (!empty($_GET['cart_items'])) {
                $cart_items = json_decode($_GET['cart_items'], true);
            }
            
            $best = $campaign->getBestCampaign($cart_total, $cart_items, $customer_type, $user_id);
            echo json_encode($best);
            
        } else {
            // Tüm kampanyaları listele (Admin)
            if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $filters = [];
            
            if (isset($_GET['is_active'])) {
                $filters['is_active'] = $_GET['is_active'];
            }
            
            if (isset($_GET['campaign_type'])) {
                $filters['campaign_type'] = $_GET['campaign_type'];
            }
            
            if (isset($_GET['search'])) {
                $filters['search'] = $_GET['search'];
            }
            
            $stmt = $campaign->readAll($filters);
            $campaigns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['data' => $campaigns]);
        }
        break;
        
    case 'POST':
        // Yeni kampanya oluştur
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
        if (empty($data->name) || empty($data->campaign_type) || empty($data->discount_type) || 
            empty($data->discount_value) || empty($data->start_date) || empty($data->end_date)) {
            http_response_code(400);
            echo json_encode(['error' => 'Zorunlu alanları doldurun']);
            exit;
        }
        
        $campaign->name = $data->name;
        $campaign->description = $data->description ?? '';
        $campaign->campaign_type = $data->campaign_type;
        $campaign->customer_type = $data->customer_type ?? 'all';
        $campaign->discount_type = $data->discount_type;
        $campaign->discount_value = $data->discount_value;
        $campaign->min_cart_amount = $data->min_cart_amount ?? null;
        $campaign->min_item_count = $data->min_item_count ?? null;
        $campaign->buy_quantity = $data->buy_quantity ?? null;
        $campaign->pay_quantity = $data->pay_quantity ?? null;
        $campaign->start_date = $data->start_date;
        $campaign->end_date = $data->end_date;
        $campaign->max_usage_per_user = $data->max_usage_per_user ?? null;
        $campaign->priority = $data->priority ?? 0;
        $campaign->is_active = $data->is_active ?? 1;
        
        if ($campaign->create()) {
            // Kategori/ürün ilişkilendirme
            if (!empty($data->category_ids)) {
                $campaign->attachCategories($data->category_ids);
            }
            
            if (!empty($data->product_ids)) {
                $campaign->attachProducts($data->product_ids);
            }
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Kampanya başarıyla oluşturuldu',
                'id' => $campaign->id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Kampanya oluşturulamadı']);
        }
        break;
        
    case 'PUT':
        // Kampanya güncelle
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
        
        $campaign->id = $data->id;
        $campaign->name = $data->name;
        $campaign->description = $data->description ?? '';
        $campaign->campaign_type = $data->campaign_type;
        $campaign->customer_type = $data->customer_type ?? 'all';
        $campaign->discount_type = $data->discount_type;
        $campaign->discount_value = $data->discount_value;
        $campaign->min_cart_amount = $data->min_cart_amount ?? null;
        $campaign->min_item_count = $data->min_item_count ?? null;
        $campaign->buy_quantity = $data->buy_quantity ?? null;
        $campaign->pay_quantity = $data->pay_quantity ?? null;
        $campaign->start_date = $data->start_date;
        $campaign->end_date = $data->end_date;
        $campaign->max_usage_per_user = $data->max_usage_per_user ?? null;
        $campaign->priority = $data->priority ?? 0;
        $campaign->is_active = $data->is_active ?? 1;
        
        if ($campaign->update()) {
            // Kategori/ürün ilişkilendirme güncelle
            if (isset($data->category_ids)) {
                $campaign->attachCategories($data->category_ids);
            }
            
            if (isset($data->product_ids)) {
                $campaign->attachProducts($data->product_ids);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Kampanya başarıyla güncellendi'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Kampanya güncellenemedi']);
        }
        break;
        
    case 'DELETE':
        // Kampanya sil
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || empty($data->id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Kampanya ID gerekli']);
            exit;
        }
        
        // Yetki kontrolü
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Yetkiniz yok']);
            exit;
        }
        
        $campaign->id = $data->id;
        
        if ($campaign->delete()) {
            echo json_encode([
                'success' => true,
                'message' => 'Kampanya başarıyla silindi'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Kampanya silinemedi']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
