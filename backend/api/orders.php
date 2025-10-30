<?php
/**
 * Sipariş API - Sipariş Oluşturma ve Yönetimi
 */

session_start();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';
include_once '../classes/Order.php';

$database = new Database();
$db = $database->getConnection();

$order = new Order($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        // Yeni sipariş oluştur
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Giriş yapmanız gerekiyor']);
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->items) || !is_array($data->items)) {
            http_response_code(400);
            echo json_encode(['error' => 'Sipariş kalemleri gerekli']);
            exit;
        }
        
        $order->user_id = $_SESSION['user_id'];
        $order->status = 'pending';
        $order->payment_status = 'pending';
        $order->payment_method = isset($data->payment_method) ? $data->payment_method : 'cash_on_delivery';
        $order->subtotal = $data->subtotal;
        $order->shipping_cost = $data->shipping_cost;
        $order->tax = isset($data->tax) ? $data->tax : 0;
        $order->discount = isset($data->discount) ? $data->discount : 0;
        $order->total = $data->total;
        $order->shipping_address_id = isset($data->shipping_address_id) ? $data->shipping_address_id : null;
        $order->billing_address_id = isset($data->billing_address_id) ? $data->billing_address_id : null;
        $order->notes = isset($data->notes) ? $data->notes : '';
        
        $order_id = $order->create($data->items);
        
        if ($order_id) {
            $order_details = $order->getOrderDetails($order_id);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Sipariş oluşturuldu',
                'order_id' => $order_id,
                'order_number' => $order_details['order_number'],
                'order' => $order_details
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Sipariş oluşturulamadı']);
        }
        break;
        
    case 'GET':
        if (isset($_GET['order_id'])) {
            // Tek sipariş detayı
            $order_id = $_GET['order_id'];
            $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
            
            // Admin değilse sadece kendi siparişlerini görebilir
            $is_admin = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
            
            $order_details = $order->getOrderDetails($order_id, $is_admin ? null : $user_id);
            
            if ($order_details) {
                http_response_code(200);
                echo json_encode($order_details);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Sipariş bulunamadı']);
            }
            
        } elseif (isset($_SESSION['user_id'])) {
            // Kullanıcının siparişleri
            $is_admin = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
            
            if ($is_admin) {
                // Admin tüm siparişleri görebilir
                $filters = [];
                
                if (isset($_GET['status'])) {
                    $filters['status'] = $_GET['status'];
                }
                if (isset($_GET['payment_status'])) {
                    $filters['payment_status'] = $_GET['payment_status'];
                }
                
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
                $offset = ($page - 1) * $limit;
                
                $filters['limit'] = $limit;
                $filters['offset'] = $offset;
                
                $stmt = $order->getAllOrders($filters);
            } else {
                // Normal kullanıcı sadece kendi siparişlerini görebilir
                $stmt = $order->getUserOrders($_SESSION['user_id']);
            }
            
            $num = $stmt->rowCount();
            
            if ($num > 0) {
                $orders_arr = [];
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    array_push($orders_arr, $row);
                }
                
                http_response_code(200);
                echo json_encode($orders_arr);
            } else {
                http_response_code(200);
                echo json_encode([]);
            }
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Giriş yapmanız gerekiyor']);
        }
        break;
        
    case 'PUT':
        // Sipariş durumu güncelle (sadece admin)
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Yetkiniz yok']);
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->order_id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Sipariş ID gerekli']);
            exit;
        }
        
        $success = false;
        
        if (isset($data->status)) {
            $success = $order->updateStatus($data->order_id, $data->status);
        }
        
        if (isset($data->payment_status)) {
            $success = $order->updatePaymentStatus($data->order_id, $data->payment_status);
        }
        
        if ($success) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Sipariş güncellendi']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Güncelleme başarısız']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Metod desteklenmiyor']);
        break;
}
