<?php
/**
 * Kategoriler API Endpoint (Türkçe Şema)
 * Hiyerarşik kategori yapısı yönetimi
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../classes/Kategori.php';

$database = new Database();
$db = $database->getConnection();
$kategori = new Kategori($db);

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// URL parametrelerini parse et
$path_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$endpoint_index = array_search('kategoriler.php', $path_parts);

$id = null;
$action = null;

if ($endpoint_index !== false) {
    // kategoriler.php/123 formatı
    if (isset($path_parts[$endpoint_index + 1]) && is_numeric($path_parts[$endpoint_index + 1])) {
        $id = intval($path_parts[$endpoint_index + 1]);
    }
    // kategoriler.php/action formatı
    if (isset($path_parts[$endpoint_index + 1]) && !is_numeric($path_parts[$endpoint_index + 1])) {
        $action = $path_parts[$endpoint_index + 1];
    }
}

// Alternatif: Query parameter olarak ID
if (!$id && isset($_GET['id'])) {
    $id = intval($_GET['id']);
}

switch ($method) {
    case 'GET':
        handleGetRequests($kategori, $action, $id);
        break;
    
    case 'POST':
        handlePostRequests($kategori);
        break;
    
    case 'PUT':
        if ($id) {
            handlePutRequests($kategori, $id);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Kategori ID gerekli']);
        }
        break;
    
    case 'DELETE':
        if ($id) {
            $kategori->id = $id;
            $result = $kategori->sil();
            
            if (isset($result['success'])) {
                echo json_encode(['success' => true, 'message' => 'Kategori başarıyla silindi']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $result['error']]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Kategori ID gerekli']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method desteklenmiyor']);
        break;
}

/**
 * GET istekleri işleme
 */
function handleGetRequests($kategori, $action, $id) {
    switch ($action) {
        case 'hiyerarşik':
        case 'hiyerarsik':
        case 'tree':
            // Hiyerarşik kategori yapısı
            $kategoriler = $kategori->hiyerarşikGetir();
            echo json_encode([
                'success' => true,
                'data' => $kategoriler
            ]);
            break;
            
        case 'ana-kategoriler':
        case 'parent':
            // Ana kategoriler
            $ana_kategoriler = $kategori->anaKategorileriGetir();
            echo json_encode([
                'success' => true,
                'data' => $ana_kategoriler
            ]);
            break;
            
        case 'alt-kategoriler':
            // Alt kategoriler
            $ust_kategori_id = $_GET['ust_kategori_id'] ?? null;
            if ($ust_kategori_id) {
                $alt_kategoriler = $kategori->altKategorileriGetir($ust_kategori_id, true);
                echo json_encode([
                    'success' => true,
                    'data' => $alt_kategoriler
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Üst kategori ID gerekli']);
            }
            break;
            
        case 'seo':
            // SEO URL ile kategori getir
            $seo_url = $_GET['seo_url'] ?? null;
            if ($seo_url) {
                $kategori_data = $kategori->seoUrlIleGetir($seo_url);
                
                if ($kategori_data) {
                    echo json_encode([
                        'success' => true,
                        'data' => $kategori_data
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Kategori bulunamadı']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'SEO URL gerekli']);
            }
            break;
            
        case 'istatistikler':
            // Kategori istatistikleri
            $istatistikler = $kategori->istatistikleriGetir();
            echo json_encode([
                'success' => true,
                'data' => $istatistikler
            ]);
            break;
            
        case 'en-cok-urunlu':
            // En çok ürünü olan kategoriler
            $limit = $_GET['limit'] ?? 10;
            $kategoriler = $kategori->enCokUrunluKategoriler($limit);
            echo json_encode([
                'success' => true,
                'data' => $kategoriler
            ]);
            break;
            
        case 'yol':
        case 'breadcrumb':
            // Kategori yolu (breadcrumb)
            if ($id) {
                $yol = $kategori->kategoriYoluGetir($id);
                echo json_encode([
                    'success' => true,
                    'data' => $yol
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Kategori ID gerekli']);
            }
            break;
            
        default:
            if ($id) {
                // Tek kategori getir
                $kategori->id = $id;
                $kategori_data = $kategori->tekGetir();
                
                if ($kategori_data) {
                    echo json_encode([
                        'success' => true,
                        'data' => $kategori_data
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Kategori bulunamadı']);
                }
            } else {
                // Tüm kategorileri getir
                handleCategoryList($kategori);
            }
            break;
    }
}

/**
 * POST istekleri işleme (Yeni kategori oluştur)
 */
function handlePostRequests($kategori) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz JSON verisi']);
        return;
    }
    
    // Gerekli alanları kontrol et
    if (empty($data['kategori_adi'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Kategori adı gerekli']);
        return;
    }
    
    $kategori->kategori_adi = $data['kategori_adi'];
    $kategori->ust_kategori_id = $data['ust_kategori_id'] ?? null;
    $kategori->xml_kategori_id = $data['xml_kategori_id'] ?? null;
    $kategori->seo_url = $data['seo_url'] ?? null;
    $kategori->aciklama = $data['aciklama'] ?? null;
    $kategori->gorsel_url = $data['gorsel_url'] ?? null;
    $kategori->sira = $data['sira'] ?? 0;
    $kategori->aktif = $data['aktif'] ?? 1;
    
    if ($kategori->ekle()) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Kategori başarıyla eklendi',
            'data' => ['id' => $kategori->id]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Kategori eklenemedi']);
    }
}

/**
 * PUT istekleri işleme (Kategori güncelle)
 */
function handlePutRequests($kategori, $id) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz JSON verisi']);
        return;
    }
    
    $kategori->id = $id;
    $kategori->kategori_adi = $data['kategori_adi'] ?? '';
    $kategori->ust_kategori_id = $data['ust_kategori_id'] ?? null;
    $kategori->xml_kategori_id = $data['xml_kategori_id'] ?? null;
    $kategori->seo_url = $data['seo_url'] ?? null;
    $kategori->aciklama = $data['aciklama'] ?? null;
    $kategori->gorsel_url = $data['gorsel_url'] ?? null;
    $kategori->sira = $data['sira'] ?? 0;
    $kategori->aktif = $data['aktif'] ?? 1;
    
    if ($kategori->guncelle()) {
        echo json_encode(['success' => true, 'message' => 'Kategori başarıyla güncellendi']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Kategori güncellenemedi']);
    }
}

/**
 * Kategori listesi
 */
function handleCategoryList($kategori) {
    $ust_kategori_id = null;
    $hiyerarşik = false;
    
    // URL parametreleri
    if (isset($_GET['ust_kategori_id'])) {
        $ust_kategori_id = intval($_GET['ust_kategori_id']);
    }
    
    if (isset($_GET['parent'])) {
        $ust_kategori_id = 0; // Ana kategoriler
    }
    
    if (isset($_GET['hiyerarşik']) || isset($_GET['tree'])) {
        $hiyerarşik = true;
    }
    
    try {
        if ($hiyerarşik) {
            // Hiyerarşik yapı
            $kategoriler = $kategori->hiyerarşikGetir();
            echo json_encode([
                'success' => true,
                'data' => $kategoriler,
                'type' => 'hierarchical'
            ]);
        } else {
            // Düz liste
            $stmt = $kategori->tumunuGetir($ust_kategori_id);
            $kategoriler = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $kategoriler,
                'count' => count($kategoriler),
                'type' => 'flat'
            ]);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Kategoriler getirilemedi: ' . $e->getMessage()
        ]);
    }
}