<?php
/**
 * XML Import API Endpoint
 * XML dosyasından ürün import işlemlerini yönetir
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../classes/XMLImporter.php';

$database = new Database();
$db = $database->getConnection();
$importer = new XMLImporter($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // XML import işlemi
        if (isset($_FILES['xml_file'])) {
            // Dosya yükleme ile import
            $file = $_FILES['xml_file'];
            
            // Dosya kontrolü
            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Dosya yükleme hatası']);
                exit;
            }
            
            // Dosya türü kontrolü
            $allowed = ['xml', 'txt'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            
            if (!in_array($ext, $allowed)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Sadece XML dosyaları yüklenebilir']);
                exit;
            }
            
            try {
                $result = $importer->importXML($file['tmp_name'], 'file');
                
                http_response_code(200);
                echo json_encode($result);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            }
            
        } elseif (isset($_POST['xml_url'])) {
            // URL'den import
            $xml_url = $_POST['xml_url'];
            
            if (empty($xml_url) || !filter_var($xml_url, FILTER_VALIDATE_URL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Geçersiz URL']);
                exit;
            }
            
            try {
                $result = $importer->importXML($xml_url, 'url');
                
                http_response_code(200);
                echo json_encode($result);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            }
            
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'XML dosyası veya URL gerekli']);
        }
        break;
    
    case 'GET':
        if (isset($_GET['status']) && isset($_GET['import_id'])) {
            // Import durumu sorgula
            $import_id = intval($_GET['import_id']);
            $status = $importer->getImportStatus($import_id);
            
            if ($status) {
                echo json_encode(['success' => true, 'data' => $status]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Import kaydı bulunamadı']);
            }
            
        } elseif (isset($_GET['test'])) {
            // Test endpoint
            echo json_encode([
                'success' => true, 
                'message' => 'XML Import API çalışıyor',
                'timestamp' => date('Y-m-d H:i:s'),
                'version' => '2.0'
            ]);
        } else {
            // Import geçmişini getir
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
            $stmt = $importer->getImportHistory($limit);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $history, 'count' => count($history)]);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method desteklenmiyor']);
        break;
}
