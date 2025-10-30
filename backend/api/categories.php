<?php
/**
 * Kategoriler API Endpoint
 */

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

include_once '../config/database.php';
include_once '../classes/Category.php';

$database = new Database();
$db = $database->getConnection();

$category = new Category($db);

// HTTP metodunu kontrol et
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['slug'])) {
            // Tek bir kategoriyi getir
            $category->slug = $_GET['slug'];
            $category_data = $category->readOne();
            
            if ($category_data) {
                http_response_code(200);
                echo json_encode($category_data);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Kategori bulunamadı']);
            }
        } elseif (isset($_GET['parent'])) {
            // Sadece ana kategorileri getir
            $stmt = $category->getParentCategories();
            $num = $stmt->rowCount();
            
            if ($num > 0) {
                $categories_arr = [];
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    array_push($categories_arr, $row);
                }
                
                http_response_code(200);
                echo json_encode($categories_arr);
            } else {
                http_response_code(200);
                echo json_encode([]);
            }
        } else {
            // Tüm kategorileri getir
            $stmt = $category->read();
            $num = $stmt->rowCount();
            
            if ($num > 0) {
                $categories_arr = [];
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    array_push($categories_arr, $row);
                }
                
                http_response_code(200);
                echo json_encode($categories_arr);
            } else {
                http_response_code(200);
                echo json_encode([]);
            }
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Metod desteklenmiyor']);
        break;
}
