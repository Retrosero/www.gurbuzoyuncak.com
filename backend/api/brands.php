<?php
/**
 * Markalar API Endpoint
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

// Database bağlantısı
$database = new Database();
$db = $database->getConnection();

// HTTP metodu kontrolü
$method = $_SERVER['REQUEST_METHOD'];

// Response dizisi
$response = [
    'success' => false,
    'message' => '',
    'data' => null
];

try {
    switch ($method) {
        case 'GET':
            // Tüm markaları getir
            $query = "SELECT 
                        id,
                        name,
                        slug,
                        logo_url,
                        is_active,
                        display_order
                      FROM brands 
                      WHERE is_active = 1
                      ORDER BY display_order ASC, name ASC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $brands = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response['success'] = true;
            $response['data'] = $brands;
            $response['message'] = count($brands) . ' marka bulundu';
            break;
            
        case 'POST':
            // Yeni marka ekle (Admin only)
            $data = json_decode(file_get_contents("php://input"));
            
            if (empty($data->name)) {
                throw new Exception('Marka adı gereklidir');
            }
            
            $query = "INSERT INTO brands 
                      SET name = :name,
                          slug = :slug,
                          logo_url = :logo_url,
                          is_active = :is_active,
                          display_order = :display_order";
            
            $stmt = $db->prepare($query);
            
            $slug = !empty($data->slug) ? $data->slug : strtolower(str_replace(' ', '-', $data->name));
            $logo_url = $data->logo_url ?? null;
            $is_active = isset($data->is_active) ? $data->is_active : 1;
            $display_order = $data->display_order ?? 0;
            
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':slug', $slug);
            $stmt->bindParam(':logo_url', $logo_url);
            $stmt->bindParam(':is_active', $is_active);
            $stmt->bindParam(':display_order', $display_order);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Marka başarıyla eklendi';
                $response['data'] = ['id' => $db->lastInsertId()];
            } else {
                throw new Exception('Marka eklenirken hata oluştu');
            }
            break;
            
        case 'PUT':
            // Marka güncelle (Admin only)
            $data = json_decode(file_get_contents("php://input"));
            
            if (empty($data->id)) {
                throw new Exception('Marka ID gereklidir');
            }
            
            $query = "UPDATE brands 
                      SET name = :name,
                          slug = :slug,
                          logo_url = :logo_url,
                          is_active = :is_active,
                          display_order = :display_order
                      WHERE id = :id";
            
            $stmt = $db->prepare($query);
            
            $slug = !empty($data->slug) ? $data->slug : strtolower(str_replace(' ', '-', $data->name));
            
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':slug', $slug);
            $stmt->bindParam(':logo_url', $data->logo_url);
            $stmt->bindParam(':is_active', $data->is_active);
            $stmt->bindParam(':display_order', $data->display_order);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Marka başarıyla güncellendi';
            } else {
                throw new Exception('Marka güncellenirken hata oluştu');
            }
            break;
            
        case 'DELETE':
            // Marka sil (Admin only)
            $data = json_decode(file_get_contents("php://input"));
            
            if (empty($data->id)) {
                throw new Exception('Marka ID gereklidir');
            }
            
            // Önce bu markaya ait ürün var mı kontrol et
            $check_query = "SELECT COUNT(*) as count FROM products WHERE brand_id = :brand_id";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->bindParam(':brand_id', $data->id);
            $check_stmt->execute();
            $check_result = $check_stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($check_result['count'] > 0) {
                throw new Exception('Bu markaya ait ürünler bulunmaktadır. Önce ürünleri silmelisiniz.');
            }
            
            $query = "DELETE FROM brands WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Marka başarıyla silindi';
            } else {
                throw new Exception('Marka silinirken hata oluştu');
            }
            break;
            
        default:
            throw new Exception('Geçersiz HTTP metodu');
    }
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

// JSON response döndür
echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
