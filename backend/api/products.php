<?php
/**
 * Ürünler API Endpoint
 */

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';
include_once '../classes/Product.php';

$database = new Database();
$db = $database->getConnection();

$product = new Product($db);

// HTTP metodunu kontrol et
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['slug'])) {
            // Tek bir ürünü getir
            $product->slug = $_GET['slug'];
            $product_data = $product->readOne();
            
            if ($product_data) {
                http_response_code(200);
                echo json_encode($product_data);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Ürün bulunamadı']);
            }
        } else {
            // Tüm ürünleri getir (filtrelerle)
            $filters = [];
            
            if (isset($_GET['category_id'])) {
                $filters['category_id'] = $_GET['category_id'];
            }
            if (isset($_GET['brand_id'])) {
                $filters['brand_id'] = $_GET['brand_id'];
            }
            if (isset($_GET['age_group_id'])) {
                $filters['age_group_id'] = $_GET['age_group_id'];
            }
            if (isset($_GET['is_featured'])) {
                $filters['is_featured'] = $_GET['is_featured'];
            }
            if (isset($_GET['is_new'])) {
                $filters['is_new'] = $_GET['is_new'];
            }
            if (isset($_GET['is_sale'])) {
                $filters['is_sale'] = $_GET['is_sale'];
            }
            if (isset($_GET['search'])) {
                $filters['search'] = $_GET['search'];
            }
            if (isset($_GET['min_price'])) {
                $filters['min_price'] = $_GET['min_price'];
            }
            if (isset($_GET['max_price'])) {
                $filters['max_price'] = $_GET['max_price'];
            }
            if (isset($_GET['order_by'])) {
                $filters['order_by'] = $_GET['order_by'];
            }
            if (isset($_GET['order_dir'])) {
                $filters['order_dir'] = $_GET['order_dir'];
            }
            
            // Sayfalama
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
            $offset = ($page - 1) * $limit;
            
            $filters['limit'] = $limit;
            $filters['offset'] = $offset;
            
            $stmt = $product->read($filters);
            $num = $stmt->rowCount();
            
            if ($num > 0) {
                $products_arr = [];
                $products_arr['data'] = [];
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $product_item = [
                        'id' => $id,
                        'name' => $name,
                        'slug' => $slug,
                        'sku' => $sku,
                        'short_description' => $short_description,
                        'price' => $price,
                        'compare_price' => $compare_price,
                        'stock_quantity' => $stock_quantity,
                        'primary_image' => $primary_image,
                        'category_name' => $category_name,
                        'category_slug' => $category_slug,
                        'brand_name' => $brand_name,
                        'brand_slug' => $brand_slug,
                        'age_group_name' => $age_group_name,
                        'avg_rating' => $avg_rating,
                        'review_count' => $review_count,
                        'is_featured' => $is_featured,
                        'is_new' => $is_new,
                        'is_sale' => $is_sale
                    ];
                    
                    array_push($products_arr['data'], $product_item);
                }
                
                // Toplam sayıyı ekle
                $total = $product->count($filters);
                $products_arr['total'] = $total;
                $products_arr['page'] = $page;
                $products_arr['limit'] = $limit;
                $products_arr['total_pages'] = ceil($total / $limit);
                
                http_response_code(200);
                echo json_encode($products_arr);
            } else {
                http_response_code(200);
                echo json_encode([
                    'data' => [],
                    'total' => 0,
                    'page' => $page,
                    'limit' => $limit,
                    'total_pages' => 0
                ]);
            }
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Metod desteklenmiyor']);
        break;
}
