<?php
/**
 * Ürün Sınıfı
 * Ürün işlemleri için tüm metodları içerir
 */

class Product {
    private $conn;
    private $table_name = "products";
    
    // Ürün özellikleri
    public $id;
    public $name;
    public $slug;
    public $sku;
    public $description;
    public $short_description;
    public $category_id;
    public $brand_id;
    public $age_group_id;
    public $price;
    public $compare_price;
    public $stock_quantity;
    public $is_featured;
    public $is_new;
    public $is_sale;
    public $is_active;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Tüm ürünleri getir
     */
    public function read($filters = []) {
        $query = "SELECT 
            p.*,
            c.name as category_name,
            c.slug as category_slug,
            b.name as brand_name,
            b.slug as brand_slug,
            a.name as age_group_name,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
            (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = 1) as avg_rating,
            (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) as review_count
        FROM " . $this->table_name . " p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN age_groups a ON p.age_group_id = a.id
        WHERE p.is_active = 1";
        
        // Filtreler uygula
        if (!empty($filters['category_id'])) {
            $query .= " AND p.category_id = :category_id";
        }
        if (!empty($filters['brand_id'])) {
            $query .= " AND p.brand_id = :brand_id";
        }
        if (!empty($filters['age_group_id'])) {
            $query .= " AND p.age_group_id = :age_group_id";
        }
        if (!empty($filters['is_featured'])) {
            $query .= " AND p.is_featured = 1";
        }
        if (!empty($filters['is_new'])) {
            $query .= " AND p.is_new = 1";
        }
        if (!empty($filters['is_sale'])) {
            $query .= " AND p.is_sale = 1";
        }
        if (!empty($filters['search'])) {
            $query .= " AND (p.name LIKE :search OR p.description LIKE :search)";
        }
        if (!empty($filters['min_price'])) {
            $query .= " AND p.price >= :min_price";
        }
        if (!empty($filters['max_price'])) {
            $query .= " AND p.price <= :max_price";
        }
        
        // Sıralama
        $order_by = !empty($filters['order_by']) ? $filters['order_by'] : 'created_at';
        $order_dir = !empty($filters['order_dir']) && $filters['order_dir'] === 'ASC' ? 'ASC' : 'DESC';
        $query .= " ORDER BY p." . $order_by . " " . $order_dir;
        
        // Sayfalama
        if (!empty($filters['limit'])) {
            $query .= " LIMIT :limit";
            if (!empty($filters['offset'])) {
                $query .= " OFFSET :offset";
            }
        }
        
        $stmt = $this->conn->prepare($query);
        
        // Parametreleri bağla
        if (!empty($filters['category_id'])) {
            $stmt->bindParam(':category_id', $filters['category_id']);
        }
        if (!empty($filters['brand_id'])) {
            $stmt->bindParam(':brand_id', $filters['brand_id']);
        }
        if (!empty($filters['age_group_id'])) {
            $stmt->bindParam(':age_group_id', $filters['age_group_id']);
        }
        if (!empty($filters['search'])) {
            $search_term = '%' . $filters['search'] . '%';
            $stmt->bindParam(':search', $search_term);
        }
        if (!empty($filters['min_price'])) {
            $stmt->bindParam(':min_price', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $stmt->bindParam(':max_price', $filters['max_price']);
        }
        if (!empty($filters['limit'])) {
            $stmt->bindParam(':limit', $filters['limit'], PDO::PARAM_INT);
            if (!empty($filters['offset'])) {
                $stmt->bindParam(':offset', $filters['offset'], PDO::PARAM_INT);
            }
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Tek bir ürünü slug ile getir
     */
    public function readOne() {
        $query = "SELECT 
            p.*,
            c.name as category_name,
            c.slug as category_slug,
            b.name as brand_name,
            b.slug as brand_slug,
            a.name as age_group_name,
            (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = 1) as avg_rating,
            (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) as review_count
        FROM " . $this->table_name . " p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN age_groups a ON p.age_group_id = a.id
        WHERE p.slug = :slug AND p.is_active = 1
        LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $this->slug);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->slug = $row['slug'];
            $this->sku = $row['sku'];
            $this->description = $row['description'];
            $this->short_description = $row['short_description'];
            $this->category_id = $row['category_id'];
            $this->brand_id = $row['brand_id'];
            $this->age_group_id = $row['age_group_id'];
            $this->price = $row['price'];
            $this->compare_price = $row['compare_price'];
            $this->stock_quantity = $row['stock_quantity'];
            
            // Ürün görsellerini getir
            $row['images'] = $this->getImages();
            
            return $row;
        }
        
        return false;
    }
    
    /**
     * Ürün görsellerini getir
     */
    public function getImages() {
        $query = "SELECT * FROM product_images WHERE product_id = :product_id ORDER BY is_primary DESC, display_order ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':product_id', $this->id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Yeni ürün oluştur
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    name = :name,
                    slug = :slug,
                    sku = :sku,
                    description = :description,
                    short_description = :short_description,
                    category_id = :category_id,
                    brand_id = :brand_id,
                    age_group_id = :age_group_id,
                    price = :price,
                    compare_price = :compare_price,
                    stock_quantity = :stock_quantity,
                    is_featured = :is_featured,
                    is_new = :is_new,
                    is_sale = :is_sale,
                    is_active = :is_active";
        
        $stmt = $this->conn->prepare($query);
        
        // Parametreleri bağla
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':slug', $this->slug);
        $stmt->bindParam(':sku', $this->sku);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':short_description', $this->short_description);
        $stmt->bindParam(':category_id', $this->category_id);
        $stmt->bindParam(':brand_id', $this->brand_id);
        $stmt->bindParam(':age_group_id', $this->age_group_id);
        $stmt->bindParam(':price', $this->price);
        $stmt->bindParam(':compare_price', $this->compare_price);
        $stmt->bindParam(':stock_quantity', $this->stock_quantity);
        $stmt->bindParam(':is_featured', $this->is_featured);
        $stmt->bindParam(':is_new', $this->is_new);
        $stmt->bindParam(':is_sale', $this->is_sale);
        $stmt->bindParam(':is_active', $this->is_active);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    /**
     * Ürün güncelle
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    name = :name,
                    slug = :slug,
                    sku = :sku,
                    description = :description,
                    short_description = :short_description,
                    category_id = :category_id,
                    brand_id = :brand_id,
                    age_group_id = :age_group_id,
                    price = :price,
                    compare_price = :compare_price,
                    stock_quantity = :stock_quantity,
                    is_featured = :is_featured,
                    is_new = :is_new,
                    is_sale = :is_sale,
                    is_active = :is_active
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Parametreleri bağla
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':slug', $this->slug);
        $stmt->bindParam(':sku', $this->sku);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':short_description', $this->short_description);
        $stmt->bindParam(':category_id', $this->category_id);
        $stmt->bindParam(':brand_id', $this->brand_id);
        $stmt->bindParam(':age_group_id', $this->age_group_id);
        $stmt->bindParam(':price', $this->price);
        $stmt->bindParam(':compare_price', $this->compare_price);
        $stmt->bindParam(':stock_quantity', $this->stock_quantity);
        $stmt->bindParam(':is_featured', $this->is_featured);
        $stmt->bindParam(':is_new', $this->is_new);
        $stmt->bindParam(':is_sale', $this->is_sale);
        $stmt->bindParam(':is_active', $this->is_active);
        
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Ürün sil
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        
        if ($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Toplam ürün sayısı
     */
    public function count($filters = []) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE is_active = 1";
        
        if (!empty($filters['category_id'])) {
            $query .= " AND category_id = :category_id";
        }
        if (!empty($filters['brand_id'])) {
            $query .= " AND brand_id = :brand_id";
        }
        if (!empty($filters['age_group_id'])) {
            $query .= " AND age_group_id = :age_group_id";
        }
        if (!empty($filters['search'])) {
            $query .= " AND (name LIKE :search OR description LIKE :search)";
        }
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($filters['category_id'])) {
            $stmt->bindParam(':category_id', $filters['category_id']);
        }
        if (!empty($filters['brand_id'])) {
            $stmt->bindParam(':brand_id', $filters['brand_id']);
        }
        if (!empty($filters['age_group_id'])) {
            $stmt->bindParam(':age_group_id', $filters['age_group_id']);
        }
        if (!empty($filters['search'])) {
            $search_term = '%' . $filters['search'] . '%';
            $stmt->bindParam(':search', $search_term);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['total'];
    }
}
