<?php
/**
 * Kullanıcı API - Kayıt, Giriş, Profil
 */

session_start();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';
include_once '../classes/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz veri']);
            exit;
        }
        
        $action = isset($data->action) ? $data->action : '';
        
        if ($action === 'register') {
            // Kayıt
            if (empty($data->email) || empty($data->password) || empty($data->first_name) || empty($data->last_name)) {
                http_response_code(400);
                echo json_encode(['error' => 'Tüm alanları doldurun']);
                exit;
            }
            
            $user->email = $data->email;
            
            // Email kontrolü
            if ($user->emailExists()) {
                http_response_code(400);
                echo json_encode(['error' => 'Bu email adresi zaten kullanılıyor']);
                exit;
            }
            
            $user->password = $data->password;
            $user->first_name = $data->first_name;
            $user->last_name = $data->last_name;
            $user->phone = isset($data->phone) ? $data->phone : '';
            
            $user_id = $user->register();
            
            if ($user_id) {
                $_SESSION['user_id'] = $user_id;
                $_SESSION['user_email'] = $data->email;
                $_SESSION['user_name'] = $data->first_name . ' ' . $data->last_name;
                $_SESSION['user_role'] = 'customer';
                
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Kayıt başarılı',
                    'user' => [
                        'id' => $user_id,
                        'email' => $data->email,
                        'first_name' => $data->first_name,
                        'last_name' => $data->last_name
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Kayıt başarısız']);
            }
            
        } elseif ($action === 'login') {
            // Giriş
            if (empty($data->email) || empty($data->password)) {
                http_response_code(400);
                echo json_encode(['error' => 'Email ve şifre gerekli']);
                exit;
            }
            
            $user->email = $data->email;
            $user->password = $data->password;
            
            $user_data = $user->login();
            
            if ($user_data && !isset($user_data['error'])) {
                $_SESSION['user_id'] = $user_data['id'];
                $_SESSION['user_email'] = $user_data['email'];
                $_SESSION['user_name'] = $user_data['first_name'] . ' ' . $user_data['last_name'];
                $_SESSION['user_role'] = $user_data['role'];
                
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Giriş başarılı',
                    'user' => $user_data
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => isset($user_data['error']) ? $user_data['error'] : 'Email veya şifre hatalı']);
            }
            
        } elseif ($action === 'logout') {
            // Çıkış
            session_destroy();
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Çıkış başarılı']);
            
        } elseif ($action === 'check_session') {
            // Oturum kontrolü
            if (isset($_SESSION['user_id'])) {
                http_response_code(200);
                echo json_encode([
                    'logged_in' => true,
                    'user' => [
                        'id' => $_SESSION['user_id'],
                        'email' => $_SESSION['user_email'],
                        'name' => $_SESSION['user_name'],
                        'role' => $_SESSION['user_role']
                    ]
                ]);
            } else {
                http_response_code(200);
                echo json_encode(['logged_in' => false]);
            }
            
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Geçersiz işlem']);
        }
        break;
        
    case 'GET':
        // Kullanıcı bilgilerini getir
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Giriş yapmanız gerekiyor']);
            exit;
        }
        
        $user->id = $_SESSION['user_id'];
        $user_data = $user->read();
        
        if ($user_data) {
            http_response_code(200);
            echo json_encode($user_data);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Kullanıcı bulunamadı']);
        }
        break;
        
    case 'PUT':
        // Profil güncelle
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Giriş yapmanız gerekiyor']);
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        $user->id = $_SESSION['user_id'];
        $user->first_name = $data->first_name;
        $user->last_name = $data->last_name;
        $user->phone = $data->phone;
        
        if ($user->update()) {
            $_SESSION['user_name'] = $data->first_name . ' ' . $data->last_name;
            
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Profil güncellendi']);
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
