<?php
/**
 * Ana Sayfa Bölümleri Sınıfı
 * Ana sayfa dinamik içerik yönetimi
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

class HomepageSection {
    private $conn;
    private $table_name = "homepage_sections";
    private $products_table = "homepage_section_products";
    
    // Bölüm özellikleri
    public $id;
    public $section_type;
    public $title;
    public $subtitle;
    public $display_order;
    public $max_items;
    public $is_active;
    public $background_color;
    
    // Bölüm türleri
    const TYPE_POPULAR = 'populer';
    const TYPE_NEW = 'yeni_gelenler';
    const TYPE_FEATURED = 'sectiklerimiz';
    const TYPE_SALE = 'indirimli';
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Tüm bölümleri getir
     */
    public function read($filters = []) {
        $query = "SELECT 
            hs.*,
            COUNT(hsp.id) as product_count
        FROM " . $this->table_name . " hs
        LEFT JOIN " . $this->products_table . " hsp ON hs.id = hsp.section_id
        WHERE 1=1";
        
        // Filtreler
        if (isset($filters['is_active'])) {
            $query .= " AND hs.is_active = :is_active";
        }
        if (!empty($filters['section_type'])) {
            $query .= " AND hs.section_type = :section_type";
        }
        
        $query .= " GROUP BY hs.id ORDER BY hs.display_order ASC, hs.id DESC";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parametreler
        if (isset($filters['is_active'])) {
            $stmt->bindParam(':is_active', $filters['is_active'], PDO::PARAM_INT);
        }
        if (!empty($filters['section_type'])) {
            $stmt->bindParam(':section_type', $filters['section_type']);
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Aktif bölümleri getir (frontend için)
     */
    public function getActiveSections() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE is_active = 1 
                  ORDER BY display_order ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Tek bir bölümü getir
     */
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->section_type = $row['section_type'];
            $this->title = $row['title'];
            $this->subtitle = $row['subtitle'];
            $this->display_order = $row['display_order'];
            $this->max_items = $row['max_items'];
            $this->is_active = $row['is_active'];
            $this->background_color = $row['background_color'];
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Bölüm ürünlerini getir
     */
    public function getSectionProducts($section_id = null) {
        $id = $section_id ?? $this->id;
        
        // Önce manuel olarak eklenen ürünleri kontrol et
        $query = "SELECT 
            p.*,
            c.name as category_name,
            b.name as brand_name,
            a.name as age_group_name,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
            hsp.display_order as section_order
        FROM " . $this->products_table . " hsp
        INNER JOIN products p ON hsp.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN age_groups a ON p.age_group_id = a.id
        WHERE hsp.section_id = :section_id 
        AND p.is_active = 1
        AND p.stock_quantity > 0
        ORDER BY hsp.display_order ASC
        LIMIT :max_items";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':section_id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':max_items', $this->max_items, PDO::PARAM_INT);
        $stmt->execute();
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Eğer manuel ürün yoksa, otomatik ürün seçimi yap
        if (count($products) == 0) {
            $products = $this->getAutoProducts($id);
        }
        
        return $products;
    }
    
    /**
     * Otomatik ürün seçimi (bölüm türüne göre)
     */
    private function getAutoProducts($section_id) {
        // Bölüm bilgisini al
        $this->id = $section_id;
        $this->readOne();
        
        $query = "SELECT 
            p.*,
            c.name as category_name,
            b.name as brand_name,
            a.name as age_group_name,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
            (SELECT COUNT(*) FROM order_items oi 
             INNER JOIN orders o ON oi.order_id = o.id 
             WHERE oi.product_id = p.id AND o.status != 'cancelled') as sales_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN age_groups a ON p.age_group_id = a.id
        WHERE p.is_active = 1 AND p.stock_quantity > 0";
        
        // Bölüm türüne göre filtreleme
        switch ($this->section_type) {
            case self::TYPE_POPULAR:
                // Popüler ürünler: Satış sayısına göre
                $query .= " ORDER BY sales_count DESC, p.created_at DESC";
                break;
            
            case self::TYPE_NEW:
                // Yeni gelen ürünler: Tarihe göre
                $query .= " AND p.is_new = 1 ORDER BY p.created_at DESC";
                break;
            
            case self::TYPE_FEATURED:
                // Seçtiklerimiz: Öne çıkan ürünler
                $query .= " AND p.is_featured = 1 ORDER BY p.created_at DESC";
                break;
            
            case self::TYPE_SALE:
                // İndirimli ürünler
                $query .= " AND p.is_sale = 1 ORDER BY p.created_at DESC";
                break;
            
            default:
                $query .= " ORDER BY p.created_at DESC";
        }
        
        $query .= " LIMIT :max_items";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':max_items', $this->max_items, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Yeni bölüm oluştur
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET section_type = :section_type,
                      title = :title,
                      subtitle = :subtitle,
                      display_order = :display_order,
                      max_items = :max_items,
                      is_active = :is_active,
                      background_color = :background_color";
        
        $stmt = $this->conn->prepare($query);
        
        // Parametreleri temizle
        $this->section_type = htmlspecialchars(strip_tags($this->section_type));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->subtitle = htmlspecialchars(strip_tags($this->subtitle ?? ''));
        $this->display_order = intval($this->display_order ?? 0);
        $this->max_items = intval($this->max_items ?? 8);
        $this->is_active = intval($this->is_active ?? 1);
        $this->background_color = htmlspecialchars(strip_tags($this->background_color ?? ''));
        
        // Bind parametreler
        $stmt->bindParam(':section_type', $this->section_type);
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':subtitle', $this->subtitle);
        $stmt->bindParam(':display_order', $this->display_order);
        $stmt->bindParam(':max_items', $this->max_items);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':background_color', $this->background_color);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Bölüm güncelle
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET section_type = :section_type,
                      title = :title,
                      subtitle = :subtitle,
                      display_order = :display_order,
                      max_items = :max_items,
                      is_active = :is_active,
                      background_color = :background_color
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Parametreleri temizle
        $this->section_type = htmlspecialchars(strip_tags($this->section_type));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->subtitle = htmlspecialchars(strip_tags($this->subtitle ?? ''));
        $this->display_order = intval($this->display_order ?? 0);
        $this->max_items = intval($this->max_items ?? 8);
        $this->is_active = intval($this->is_active ?? 1);
        $this->background_color = htmlspecialchars(strip_tags($this->background_color ?? ''));
        $this->id = intval($this->id);
        
        // Bind parametreler
        $stmt->bindParam(':section_type', $this->section_type);
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':subtitle', $this->subtitle);
        $stmt->bindParam(':display_order', $this->display_order);
        $stmt->bindParam(':max_items', $this->max_items);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':background_color', $this->background_color);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Bölüm sil
     */
    public function delete() {
        // Önce bölüme ait ürünleri sil
        $query = "DELETE FROM " . $this->products_table . " WHERE section_id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        // Sonra bölümü sil
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Bölüme ürün ekle
     */
    public function addProduct($product_id, $display_order = 0) {
        // Önce var mı kontrol et
        $query = "SELECT id FROM " . $this->products_table . " 
                  WHERE section_id = :section_id AND product_id = :product_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':section_id', $this->id, PDO::PARAM_INT);
        $stmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return ['success' => false, 'message' => 'Bu ürün zaten bu bölümde mevcut.'];
        }
        
        // Ekle
        $query = "INSERT INTO " . $this->products_table . " 
                  SET section_id = :section_id,
                      product_id = :product_id,
                      display_order = :display_order";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':section_id', $this->id, PDO::PARAM_INT);
        $stmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Ürün bölüme eklendi.'];
        }
        
        return ['success' => false, 'message' => 'Ürün eklenirken hata oluştu.'];
    }
    
    /**
     * Bölümden ürün çıkar
     */
    public function removeProduct($product_id) {
        $query = "DELETE FROM " . $this->products_table . " 
                  WHERE section_id = :section_id AND product_id = :product_id";
        
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $product_id = intval($product_id);
        $stmt->bindParam(':section_id', $this->id, PDO::PARAM_INT);
        $stmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Ürün bölümden çıkarıldı.'];
        }
        
        return ['success' => false, 'message' => 'Ürün çıkarılırken hata oluştu.'];
    }
    
    /**
     * Bölüm durumunu değiştir (aktif/pasif)
     */
    public function toggleStatus() {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_active = IF(is_active = 1, 0, 1) 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
}
