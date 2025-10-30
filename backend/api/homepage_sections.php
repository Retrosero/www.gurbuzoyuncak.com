<?php
/**
 * Ana Sayfa Bölümleri API Endpoint
 * Ana sayfa dinamik içerik yönetimi için REST API
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../classes/HomepageSection.php';

$database = new Database();
$db = $database->getConnection();
$section = new HomepageSection($db);

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// ID parametresini al
$id = null;
$action = isset($_GET['action']) ? $_GET['action'] : null;

if (preg_match('/\/homepage-sections\/(\d+)\/products/', $request_uri, $matches)) {
    $id = intval($matches[1]);
    $action = 'products';
} elseif (preg_match('/\/homepage-sections\/(\d+)/', $request_uri, $matches)) {
    $id = intval($matches[1]);
}

switch ($method) {
    case 'GET':
        // Özel action'lar
        if ($action === 'get_countdown_banners') {
            // Aktif countdown banner'ları getir
            $banners = $section->getActiveCountdownBanners();
            echo json_encode([
                'success' => true,
                'banners' => $banners,
                'count' => count($banners)
            ]);
        } elseif ($action === 'get_all_countdown_banners') {
            // Tüm countdown banner'ları getir (admin için)
            $banners = $section->getAllCountdownBanners();
            echo json_encode([
                'success' => true,
                'banners' => $banners,
                'count' => count($banners)
            ]);
        } elseif ($action === 'get_countdown_banner' && isset($_GET['id'])) {
            // Belirli countdown banner'ı getir
            $banner = $section->getCountdownBannerForFrontend(intval($_GET['id']));
            if ($banner) {
                echo json_encode([
                    'success' => true,
                    'banner' => $banner
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Banner bulunamadı.']);
            }
        } elseif ($action === 'check_expired_banners') {
            // Süresi dolan banner'ları kontrol et ve deaktive et
            $result = $section->checkAndDeactivateExpiredBanners();
            echo json_encode($result);
        } elseif ($id && $action === 'products') {
            // Bölüm ürünlerini getir
            $section->id = $id;
            if ($section->readOne()) {
                $products = $section->getSectionProducts($id);
                echo json_encode([
                    'success' => true,
                    'data' => $products,
                    'count' => count($products)
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Bölüm bulunamadı.']);
            }
        } elseif ($id) {
            // Tek bölüm getir
            $section->id = $id;
            if ($section->readOne()) {
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'id' => $section->id,
                        'section_type' => $section->section_type,
                        'title' => $section->title,
                        'subtitle' => $section->subtitle,
                        'display_order' => $section->display_order,
                        'max_items' => $section->max_items,
                        'is_active' => $section->is_active,
                        'background_color' => $section->background_color
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Bölüm bulunamadı.']);
            }
        } else {
            // Tüm bölümleri getir
            $filters = [];
            
            if (isset($_GET['is_active'])) {
                $filters['is_active'] = intval($_GET['is_active']);
            }
            if (isset($_GET['section_type'])) {
                $filters['section_type'] = $_GET['section_type'];
            }
            
            $stmt = $section->read($filters);
            $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Eğer active_only isteniyorsa, her bölümün ürünlerini de getir
            if (isset($_GET['with_products']) && $_GET['with_products'] == '1') {
                foreach ($sections as &$sec) {
                    $section->id = $sec['id'];
                    $section->max_items = $sec['max_items'];
                    $sec['products'] = $section->getSectionProducts($sec['id']);
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => $sections,
                'count' => count($sections)
            ]);
        }
        break;
    
    case 'POST':
        if ($id && $action === 'products') {
            // Bölüme ürün ekle
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->product_id)) {
                $section->id = $id;
                $result = $section->addProduct($data->product_id, $data->display_order ?? 0);
                
                if ($result['success']) {
                    http_response_code(201);
                    echo json_encode($result);
                } else {
                    http_response_code(400);
                    echo json_encode($result);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Ürün ID gerekli.']);
            }
        } else {
            // Yeni bölüm oluştur
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->section_type) && !empty($data->title)) {
                $section->section_type = $data->section_type;
                $section->title = $data->title;
                $section->subtitle = $data->subtitle ?? null;
                $section->display_order = $data->display_order ?? 0;
                $section->max_items = $data->max_items ?? 8;
                $section->is_active = $data->is_active ?? 1;
                $section->background_color = $data->background_color ?? null;
                
                if ($section->create()) {
                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Bölüm başarıyla oluşturuldu.',
                        'data' => ['id' => $section->id]
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Bölüm oluşturulamadı.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Eksik veri. Bölüm türü ve başlık gerekli.']);
            }
        }
        break;
    
    case 'PUT':
        if ($id) {
            $data = json_decode(file_get_contents("php://input"));
            
            $section->id = $id;
            
            if (!empty($data->section_type) && !empty($data->title)) {
                $section->section_type = $data->section_type;
                $section->title = $data->title;
                $section->subtitle = $data->subtitle ?? null;
                $section->display_order = $data->display_order ?? 0;
                $section->max_items = $data->max_items ?? 8;
                $section->is_active = $data->is_active ?? 1;
                $section->background_color = $data->background_color ?? null;
                
                if ($section->update()) {
                    echo json_encode(['success' => true, 'message' => 'Bölüm başarıyla güncellendi.']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Bölüm güncellenemedi.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Eksik veri. Bölüm türü ve başlık gerekli.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Bölüm ID gerekli.']);
        }
        break;
    
    case 'DELETE':
        if ($id && $action === 'products') {
            // Bölümden ürün çıkar
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->product_id)) {
                $section->id = $id;
                $result = $section->removeProduct($data->product_id);
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Ürün ID gerekli.']);
            }
        } elseif ($id) {
            // Bölüm sil
            $section->id = $id;
            
            if ($section->delete()) {
                echo json_encode(['success' => true, 'message' => 'Bölüm başarıyla silindi.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Bölüm silinemedi.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Bölüm ID gerekli.']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method desteklenmiyor.']);
        break;
}
