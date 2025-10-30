<?php
/**
 * Ürünler API Endpoint (Yeni Türkçe Şema)
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../classes/Urun.php';

$database = new Database();
$db = $database->getConnection();
$urun = new Urun($db);

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// ID parametresini al
$id = null;
if (preg_match('/\/urunler\/(\d+)/', $request_uri, $matches)) {
    $id = intval($matches[1]);
}

switch ($method) {
    case 'GET':
        if ($id) {
            // Tek ürün getir
            $urun->id = $id;
            $urun_data = $urun->tekGetir();
            
            if ($urun_data) {
                echo json_encode([
                    'success' => true,
                    'data' => $urun_data
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Ürün bulunamadı']);
            }
        } else {
            // Tüm ürünleri getir
            $filtreler = [
                'kategori_id' => $_GET['kategori_id'] ?? null,
                'marka_id' => $_GET['marka_id'] ?? null,
                'yeni_urun' => $_GET['yeni_urun'] ?? null,
                'vitrin_urunu' => $_GET['vitrin_urunu'] ?? null,
                'kampanyali' => $_GET['kampanyali'] ?? null,
                'arama' => $_GET['arama'] ?? null,
                'min_fiyat' => $_GET['min_fiyat'] ?? null,
                'max_fiyat' => $_GET['max_fiyat'] ?? null,
                'siralama' => $_GET['siralama'] ?? 'yeni',
                'limit' => $_GET['limit'] ?? null
            ];
            
            $stmt = $urun->tumunuGetir($filtreler);
            $urunler = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $urunler,
                'count' => count($urunler)
            ]);
        }
        break;
    
    case 'POST':
        // Yeni ürün ekle
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->urun_kodu) && !empty($data->urun_adi)) {
            $urun->urun_kodu = $data->urun_kodu;
            $urun->urun_adi = $data->urun_adi;
            $urun->kategori_id = $data->kategori_id ?? null;
            $urun->marka_id = $data->marka_id ?? null;
            $urun->fiyat = $data->fiyat ?? 0;
            $urun->stok_miktari = $data->stok_miktari ?? 0;
            $urun->ana_gorsel = $data->ana_gorsel ?? null;
            $urun->aktif = $data->aktif ?? 1;
            
            if ($urun->ekle()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Ürün başarıyla eklendi',
                    'data' => ['id' => $urun->id]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Ürün eklenemedi']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Eksik veri']);
        }
        break;
    
    case 'PUT':
        if ($id) {
            $data = json_decode(file_get_contents("php://input"));
            
            $urun->id = $id;
            $urun->urun_adi = $data->urun_adi;
            $urun->kategori_id = $data->kategori_id ?? null;
            $urun->marka_id = $data->marka_id ?? null;
            $urun->fiyat = $data->fiyat ?? 0;
            $urun->stok_miktari = $data->stok_miktari ?? 0;
            $urun->aktif = $data->aktif ?? 1;
            
            if ($urun->guncelle()) {
                echo json_encode(['success' => true, 'message' => 'Ürün güncellendi']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Ürün güncellenemedi']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Ürün ID gerekli']);
        }
        break;
    
    case 'DELETE':
        if ($id) {
            $urun->id = $id;
            
            if ($urun->sil()) {
                echo json_encode(['success' => true, 'message' => 'Ürün silindi']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Ürün silinemedi']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Ürün ID gerekli']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method desteklenmiyor']);
        break;
}
