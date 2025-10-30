<?php
/**
 * Bakiye API
 * Gürbüz Oyuncak E-Ticaret Sistemi - B2B/Bayi Bakiye Sistemi
 */

session_start();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';
include_once '../classes/Balance.php';

$database = new Database();
$db = $database->getConnection();

$balance = new Balance($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Kullanıcı giriş kontrolü
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Oturum açmanız gerekli']);
            exit;
        }
        
        if (isset($_GET['action']) && $_GET['action'] == 'balance') {
            // Kullanıcı bakiyesi
            $user_id = $_GET['user_id'] ?? $_SESSION['user_id'];
            
            // Yetki kontrolü
            if ($user_id != $_SESSION['user_id'] && $_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $result = $balance->getUserBalance($user_id);
            echo json_encode($result);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'transactions') {
            // İşlem geçmişi
            $user_id = $_GET['user_id'] ?? $_SESSION['user_id'];
            
            // Yetki kontrolü
            if ($user_id != $_SESSION['user_id'] && $_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $limit = $_GET['limit'] ?? 50;
            $offset = $_GET['offset'] ?? 0;
            
            $transactions = $balance->getTransactionHistory($user_id, $limit, $offset);
            echo json_encode(['data' => $transactions]);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'check') {
            // Bakiye kontrolü (sipariş öncesi)
            $user_id = $_GET['user_id'] ?? $_SESSION['user_id'];
            $required_amount = floatval($_GET['amount'] ?? 0);
            
            $check_result = $balance->checkSufficientBalance($user_id, $required_amount);
            echo json_encode($check_result);
            
        } elseif (isset($_GET['action']) && $_GET['action'] == 'all') {
            // Tüm bakiye hesapları (Admin)
            if ($_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $filters = [];
            
            if (isset($_GET['customer_type'])) {
                $filters['customer_type'] = $_GET['customer_type'];
            }
            
            if (isset($_GET['low_balance'])) {
                $filters['low_balance'] = $_GET['low_balance'];
            }
            
            if (isset($_GET['search'])) {
                $filters['search'] = $_GET['search'];
            }
            
            $balances = $balance->getAllBalances($filters);
            echo json_encode(['data' => $balances]);
            
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
        
        if ($data->action === 'load') {
            // Bakiye yükleme (Admin)
            if ($_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            if (empty($data->user_id) || empty($data->amount) || $data->amount <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Kullanıcı ve geçerli tutar gerekli']);
                exit;
            }
            
            $result = $balance->loadBalance(
                $data->user_id,
                $data->amount,
                $data->description ?? '',
                $_SESSION['user_id']
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'spend') {
            // Bakiye harcama (sipariş ödemesi)
            if (empty($data->user_id) || empty($data->amount) || empty($data->order_id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Kullanıcı, tutar ve sipariş ID gerekli']);
                exit;
            }
            
            $result = $balance->spendBalance(
                $data->user_id,
                $data->amount,
                $data->order_id,
                $data->description ?? ''
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'refund') {
            // Bakiye iadesi (Admin veya sistem)
            if ($_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            if (empty($data->user_id) || empty($data->amount) || empty($data->order_id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Kullanıcı, tutar ve sipariş ID gerekli']);
                exit;
            }
            
            $result = $balance->refundBalance(
                $data->user_id,
                $data->amount,
                $data->order_id,
                $data->description ?? ''
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'transfer') {
            // Bakiye transferi
            if (empty($data->from_user_id) || empty($data->to_user_id) || empty($data->amount)) {
                http_response_code(400);
                echo json_encode(['error' => 'Gönderen, alıcı ve tutar gerekli']);
                exit;
            }
            
            // Yetki kontrolü: Kendi bakiyesinden veya admin
            if ($data->from_user_id != $_SESSION['user_id'] && $_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            $result = $balance->transferBalance(
                $data->from_user_id,
                $data->to_user_id,
                $data->amount,
                $data->description ?? ''
            );
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode($result);
            }
            
        } elseif ($data->action === 'create_account') {
            // Bakiye hesabı oluştur (Admin)
            if ($_SESSION['user_role'] != 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Yetkiniz yok']);
                exit;
            }
            
            if (empty($data->user_id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Kullanıcı ID gerekli']);
                exit;
            }
            
            $initial_balance = $data->initial_balance ?? 0;
            $credit_limit = $data->credit_limit ?? 0;
            
            if ($balance->createBalanceAccount($data->user_id, $initial_balance, $credit_limit)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Bakiye hesabı oluşturuldu'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Bakiye hesabı oluşturulamadı']);
            }
            
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz işlem']);
        }
        break;
        
    case 'PUT':
        // Bakiye ayarlarını güncelle (Admin)
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] != 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Yetkiniz yok']);
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || empty($data->user_id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz veri']);
            exit;
        }
        
        $credit_limit = $data->credit_limit ?? 0;
        $low_balance_threshold = $data->low_balance_threshold ?? 100;
        
        if ($balance->updateSettings($data->user_id, $credit_limit, $low_balance_threshold)) {
            echo json_encode([
                'success' => true,
                'message' => 'Ayarlar güncellendi'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Ayarlar güncellenemedi']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
