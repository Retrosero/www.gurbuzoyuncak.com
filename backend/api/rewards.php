<?php
/**
 * Ödül ve Puan API
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

session_start();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';
include_once '../classes/Reward.php';

$database = new Database();
$db = $database->getConnection();

$reward = new Reward($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] == 'points') {
            // Kullanıcı puan bakiyesi
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Oturum açmanız gerekli']);
                exit;
            }
            
            $user_id = $_GET['user_id'] ?? $_SESSION['user_id'];
            
            // Yetki kontrolü
            if ($user_id != $_SESSION['user_id'] && (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin')) {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $points_data = $reward->getUserPoints($user_id);
            echo json_encode($points_data);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'statistics') {
            // Kullanıcı istatistikleri
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Oturum açmanız gerekli']);
                exit;
            }
            
            $user_id = $_GET['user_id'] ?? $_SESSION['user_id'];
            
            // Yetki kontrolü
            if ($user_id != $_SESSION['user_id'] && (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin')) {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $stats = $reward->getUserStatistics($user_id);
            echo json_encode($stats);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'transactions') {
            // İşlem geçmişi
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Oturum açmanız gerekli']);
                exit;
            }
            
            $user_id = $_GET['user_id'] ?? $_SESSION['user_id'];
            
            // Yetki kontrolü
            if ($user_id != $_SESSION['user_id'] && (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin')) {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $limit = $_GET['limit'] ?? 50;
            $offset = $_GET['offset'] ?? 0;
            
            $transactions = $reward->getTransactionHistory($user_id, $limit, $offset);
            echo json_encode(['data' => $transactions]);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'vip_levels') {
            // Tüm VIP seviyeleri
            $levels = $reward->getAllVIPLevels();
            echo json_encode(['data' => $levels]);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'rules') {
            // Ödül kazanma kuralları
            $rules = $reward->getAllRules();
            echo json_encode(['data' => $rules]);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'convert') {
            // Puan - TL dönüşümü hesapla
            $points = intval($_GET['points'] ?? 0);
            $conversion_rate = floatval($_GET['rate'] ?? 0.1);
            
            $money = $reward->calculatePointsToMoney($points, $conversion_rate);
            echo json_encode([
                'points' => $points,
                'money' => $money,
                'conversion_rate' => $conversion_rate
            ]);
            
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz işlem']);
        }
        break;
        
    case 'POST':
        // Kullanıcı giriş kontrolü
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Oturum açmanız gerekli']);
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || empty($data->action)) {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz veri']);
            exit;
        }
        
        if ($data->action === 'earn') {
            // Puan kazan (Manuel - sadece admin veya sistem)
            if ($_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            if (empty($data->user_id) || empty($data->source_type) || empty($data->amount)) {
                http_response_code(400);
                echo json_encode(['error' => 'Kullanıcı, kaynak tipi ve tutar gerekli']);
                exit;
            }
            
            $result = $reward->earnPoints(
                $data->user_id,
                $data->source_type,
                $data->amount,
                $data->source_id ?? null,
                $data->description ?? ''
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'spend') {
            // Puan harca
            if (empty($data->points) || $data->points <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Geçerli puan miktarı gerekli']);
                exit;
            }
            
            $user_id = $data->user_id ?? $_SESSION['user_id'];
            
            // Yetki kontrolü
            if ($user_id != $_SESSION['user_id'] && $_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $result = $reward->spendPoints(
                $user_id,
                $data->points,
                $data->order_id ?? null,
                $data->description ?? ''
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'award_purchase') {
            // Sipariş sonrası otomatik puan kazandır
            if (empty($data->user_id) || empty($data->order_id) || empty($data->order_total)) {
                http_response_code(400);
                echo json_encode(['error' => 'Kullanıcı, sipariş ve tutar gerekli']);
                exit;
            }
            
            $result = $reward->awardPurchasePoints(
                $data->user_id,
                $data->order_id,
                $data->order_total
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'award_review') {
            // Yorum sonrası puan kazandır
            if (empty($data->user_id) || empty($data->review_id) || empty($data->product_name)) {
                http_response_code(400);
                echo json_encode(['error' => 'Kullanıcı, yorum ve ürün adı gerekli']);
                exit;
            }
            
            $result = $reward->awardReviewPoints(
                $data->user_id,
                $data->review_id,
                $data->product_name
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'adjust') {
            // Admin puan düzeltme
            if ($_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            if (empty($data->user_id) || !isset($data->points)) {
                http_response_code(400);
                echo json_encode(['error' => 'Kullanıcı ve puan miktarı gerekli']);
                exit;
            }
            
            $result = $reward->adjustPoints(
                $data->user_id,
                $data->points,
                $data->description ?? 'Admin düzeltmesi'
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'expire_points') {
            // Süresi dolan puanları işaretle (Cron job için)
            if ($_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $expired_count = $reward->expirePoints();
            
            echo json_encode([
                'success' => true,
                'expired_users' => $expired_count,
                'message' => "{$expired_count} kullanıcının puanları sona erdi"
            ]);
            
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz işlem']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
