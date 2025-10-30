<?php
/**
 * Banner API Endpoint
 * Banner yönetimi için REST API
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../classes/Banner.php';

$database = new Database();
$db = $database->getConnection();
$banner = new Banner($db);

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// ID parametresini al
$id = null;
if (preg_match('/\/banners\/(\d+)/', $request_uri, $matches)) {
    $id = intval($matches[1]);
}

switch ($method) {
    case 'GET':
        if ($id) {
            // Tek banner getir
            $banner->id = $id;
            if ($banner->readOne()) {
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'id' => $banner->id,
                        'title' => $banner->title,
                        'subtitle' => $banner->subtitle,
                        'image_url' => $banner->image_url,
                        'link_url' => $banner->link_url,
                        'link_text' => $banner->link_text,
                        'background_color' => $banner->background_color,
                        'text_color' => $banner->text_color,
                        'display_order' => $banner->display_order,
                        'is_active' => $banner->is_active,
                        'start_date' => $banner->start_date,
                        'end_date' => $banner->end_date
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Banner bulunamadı.']);
            }
        } else {
            // Tüm banner'ları getir
            $filters = [];
            
            if (isset($_GET['is_active'])) {
                $filters['is_active'] = intval($_GET['is_active']);
            }
            if (isset($_GET['active_only'])) {
                $filters['active_only'] = true;
            }
            if (isset($_GET['limit'])) {
                $filters['limit'] = intval($_GET['limit']);
            }
            
            $stmt = $banner->read($filters);
            $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $banners,
                'count' => count($banners)
            ]);
        }
        break;
    
    case 'POST':
        // Yeni banner oluştur veya dosya yükle
        
        // Dosya yükleme kontrolü
        if (isset($_FILES['image'])) {
            $result = $banner->uploadImage($_FILES['image']);
            echo json_encode($result);
            break;
        }
        
        // Banner oluştur
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->title) && !empty($data->image_url)) {
            $banner->title = $data->title;
            $banner->subtitle = $data->subtitle ?? null;
            $banner->image_url = $data->image_url;
            $banner->link_url = $data->link_url ?? null;
            $banner->link_text = $data->link_text ?? null;
            $banner->background_color = $data->background_color ?? '#1E88E5';
            $banner->text_color = $data->text_color ?? '#FFFFFF';
            $banner->display_order = $data->display_order ?? 0;
            $banner->is_active = $data->is_active ?? 1;
            $banner->start_date = $data->start_date ?? null;
            $banner->end_date = $data->end_date ?? null;
            
            if ($banner->create()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Banner başarıyla oluşturuldu.',
                    'data' => ['id' => $banner->id]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Banner oluşturulamadı.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Eksik veri. Başlık ve görsel URL gerekli.']);
        }
        break;
    
    case 'PUT':
        if ($id) {
            $data = json_decode(file_get_contents("php://input"));
            
            $banner->id = $id;
            
            if (!empty($data->title) && !empty($data->image_url)) {
                $banner->title = $data->title;
                $banner->subtitle = $data->subtitle ?? null;
                $banner->image_url = $data->image_url;
                $banner->link_url = $data->link_url ?? null;
                $banner->link_text = $data->link_text ?? null;
                $banner->background_color = $data->background_color ?? '#1E88E5';
                $banner->text_color = $data->text_color ?? '#FFFFFF';
                $banner->display_order = $data->display_order ?? 0;
                $banner->is_active = $data->is_active ?? 1;
                $banner->start_date = $data->start_date ?? null;
                $banner->end_date = $data->end_date ?? null;
                
                if ($banner->update()) {
                    echo json_encode(['success' => true, 'message' => 'Banner başarıyla güncellendi.']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Banner güncellenemedi.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Eksik veri. Başlık ve görsel URL gerekli.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Banner ID gerekli.']);
        }
        break;
    
    case 'DELETE':
        if ($id) {
            $banner->id = $id;
            
            if ($banner->delete()) {
                echo json_encode(['success' => true, 'message' => 'Banner başarıyla silindi.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Banner silinemedi.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Banner ID gerekli.']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method desteklenmiyor.']);
        break;
}
