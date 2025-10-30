<?php
/**
 * Yaş Grupları API Endpoint
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
            // Tüm yaş gruplarını getir
            $query = "SELECT 
                        id,
                        name,
                        slug,
                        min_age,
                        max_age,
                        description,
                        is_active,
                        display_order
                      FROM age_groups 
                      WHERE is_active = 1
                      ORDER BY min_age ASC, display_order ASC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $age_groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response['success'] = true;
            $response['data'] = $age_groups;
            $response['message'] = count($age_groups) . ' yaş grubu bulundu';
            break;
            
        case 'POST':
            // Yeni yaş grubu ekle (Admin only)
            $data = json_decode(file_get_contents("php://input"));
            
            if (empty($data->name)) {
                throw new Exception('Yaş grubu adı gereklidir');
            }
            
            $query = "INSERT INTO age_groups 
                      SET name = :name,
                          slug = :slug,
                          min_age = :min_age,
                          max_age = :max_age,
                          description = :description,
                          is_active = :is_active,
                          display_order = :display_order";
            
            $stmt = $db->prepare($query);
            
            $slug = !empty($data->slug) ? $data->slug : strtolower(str_replace(' ', '-', $data->name));
            $min_age = $data->min_age ?? 0;
            $max_age = $data->max_age ?? null;
            $description = $data->description ?? null;
            $is_active = isset($data->is_active) ? $data->is_active : 1;
            $display_order = $data->display_order ?? 0;
            
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':slug', $slug);
            $stmt->bindParam(':min_age', $min_age);
            $stmt->bindParam(':max_age', $max_age);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':is_active', $is_active);
            $stmt->bindParam(':display_order', $display_order);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Yaş grubu başarıyla eklendi';
                $response['data'] = ['id' => $db->lastInsertId()];
            } else {
                throw new Exception('Yaş grubu eklenirken hata oluştu');
            }
            break;
            
        case 'PUT':
            // Yaş grubu güncelle (Admin only)
            $data = json_decode(file_get_contents("php://input"));
            
            if (empty($data->id)) {
                throw new Exception('Yaş grubu ID gereklidir');
            }
            
            $query = "UPDATE age_groups 
                      SET name = :name,
                          slug = :slug,
                          min_age = :min_age,
                          max_age = :max_age,
                          description = :description,
                          is_active = :is_active,
                          display_order = :display_order
                      WHERE id = :id";
            
            $stmt = $db->prepare($query);
            
            $slug = !empty($data->slug) ? $data->slug : strtolower(str_replace(' ', '-', $data->name));
            
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':slug', $slug);
            $stmt->bindParam(':min_age', $data->min_age);
            $stmt->bindParam(':max_age', $data->max_age);
            $stmt->bindParam(':description', $data->description);
            $stmt->bindParam(':is_active', $data->is_active);
            $stmt->bindParam(':display_order', $data->display_order);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Yaş grubu başarıyla güncellendi';
            } else {
                throw new Exception('Yaş grubu güncellenirken hata oluştu');
            }
            break;
            
        case 'DELETE':
            // Yaş grubu sil (Admin only)
            $data = json_decode(file_get_contents("php://input"));
            
            if (empty($data->id)) {
                throw new Exception('Yaş grubu ID gereklidir');
            }
            
            // Önce bu yaş grubuna ait ürün var mı kontrol et
            $check_query = "SELECT COUNT(*) as count FROM products WHERE age_group_id = :age_group_id";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->bindParam(':age_group_id', $data->id);
            $check_stmt->execute();
            $check_result = $check_stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($check_result['count'] > 0) {
                throw new Exception('Bu yaş grubuna ait ürünler bulunmaktadır. Önce ürünleri güncellemelisiniz.');
            }
            
            $query = "DELETE FROM age_groups WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Yaş grubu başarıyla silindi';
            } else {
                throw new Exception('Yaş grubu silinirken hata oluştu');
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
