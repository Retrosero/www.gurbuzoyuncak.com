<?php
/**
 * Kategori Sınıfı
 */

class Category {
    private $conn;
    private $table_name = "categories";
    
    public $id;
    public $name;
    public $slug;
    public $description;
    public $parent_id;
    public $image_url;
    public $display_order;
    public $is_active;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Tüm kategorileri getir
     */
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE is_active = 1 
                  ORDER BY display_order ASC, name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Ana kategorileri getir
     */
    public function getParentCategories() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE is_active = 1 AND parent_id IS NULL 
                  ORDER BY display_order ASC, name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Alt kategorileri getir
     */
    public function getSubCategories($parent_id) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE is_active = 1 AND parent_id = :parent_id 
                  ORDER BY display_order ASC, name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Tek bir kategoriyi getir
     */
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE slug = :slug AND is_active = 1 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slug', $this->slug);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->slug = $row['slug'];
            $this->description = $row['description'];
            $this->parent_id = $row['parent_id'];
            $this->image_url = $row['image_url'];
            
            return $row;
        }
        
        return false;
    }
}
