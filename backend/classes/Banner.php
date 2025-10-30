<?php
/**
 * Banner Sınıfı
 * Banner işlemleri için tüm metodları içerir
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

class Banner {
    private $conn;
    private $table_name = "banners";
    
    // Banner özellikleri
    public $id;
    public $title;
    public $subtitle;
    public $image_url;
    public $link_url;
    public $link_text;
    public $background_color;
    public $text_color;
    public $display_order;
    public $is_active;
    public $start_date;
    public $end_date;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Tüm banner'ları getir
     */
    public function read($filters = []) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        
        // Filtreler
        if (isset($filters['is_active'])) {
            $query .= " AND is_active = :is_active";
        }
        
        // Tarih kontrolü (aktif banner'lar için)
        if (isset($filters['active_only']) && $filters['active_only']) {
            $query .= " AND is_active = 1";
            $query .= " AND (start_date IS NULL OR start_date <= NOW())";
            $query .= " AND (end_date IS NULL OR end_date >= NOW())";
        }
        
        $query .= " ORDER BY display_order ASC, id DESC";
        
        // Limit
        if (!empty($filters['limit'])) {
            $query .= " LIMIT :limit";
        }
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parametreler
        if (isset($filters['is_active'])) {
            $stmt->bindParam(':is_active', $filters['is_active'], PDO::PARAM_INT);
        }
        if (!empty($filters['limit'])) {
            $stmt->bindParam(':limit', $filters['limit'], PDO::PARAM_INT);
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Aktif banner'ları getir (frontend için)
     */
    public function getActiveBanners($limit = null) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE is_active = 1 
                  AND (start_date IS NULL OR start_date <= NOW())
                  AND (end_date IS NULL OR end_date >= NOW())
                  ORDER BY display_order ASC";
        
        if ($limit) {
            $query .= " LIMIT :limit";
        }
        
        $stmt = $this->conn->prepare($query);
        
        if ($limit) {
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Tek bir banner getir
     */
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->title = $row['title'];
            $this->subtitle = $row['subtitle'];
            $this->image_url = $row['image_url'];
            $this->link_url = $row['link_url'];
            $this->link_text = $row['link_text'];
            $this->background_color = $row['background_color'];
            $this->text_color = $row['text_color'];
            $this->display_order = $row['display_order'];
            $this->is_active = $row['is_active'];
            $this->start_date = $row['start_date'];
            $this->end_date = $row['end_date'];
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Yeni banner oluştur
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET title = :title,
                      subtitle = :subtitle,
                      image_url = :image_url,
                      link_url = :link_url,
                      link_text = :link_text,
                      background_color = :background_color,
                      text_color = :text_color,
                      display_order = :display_order,
                      is_active = :is_active,
                      start_date = :start_date,
                      end_date = :end_date";
        
        $stmt = $this->conn->prepare($query);
        
        // Parametreleri temizle
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->subtitle = htmlspecialchars(strip_tags($this->subtitle ?? ''));
        $this->image_url = htmlspecialchars(strip_tags($this->image_url));
        $this->link_url = htmlspecialchars(strip_tags($this->link_url ?? ''));
        $this->link_text = htmlspecialchars(strip_tags($this->link_text ?? ''));
        $this->background_color = htmlspecialchars(strip_tags($this->background_color ?? '#1E88E5'));
        $this->text_color = htmlspecialchars(strip_tags($this->text_color ?? '#FFFFFF'));
        $this->display_order = intval($this->display_order ?? 0);
        $this->is_active = intval($this->is_active ?? 1);
        
        // Bind parametreler
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':subtitle', $this->subtitle);
        $stmt->bindParam(':image_url', $this->image_url);
        $stmt->bindParam(':link_url', $this->link_url);
        $stmt->bindParam(':link_text', $this->link_text);
        $stmt->bindParam(':background_color', $this->background_color);
        $stmt->bindParam(':text_color', $this->text_color);
        $stmt->bindParam(':display_order', $this->display_order);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':start_date', $this->start_date);
        $stmt->bindParam(':end_date', $this->end_date);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Banner güncelle
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET title = :title,
                      subtitle = :subtitle,
                      image_url = :image_url,
                      link_url = :link_url,
                      link_text = :link_text,
                      background_color = :background_color,
                      text_color = :text_color,
                      display_order = :display_order,
                      is_active = :is_active,
                      start_date = :start_date,
                      end_date = :end_date
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Parametreleri temizle
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->subtitle = htmlspecialchars(strip_tags($this->subtitle ?? ''));
        $this->image_url = htmlspecialchars(strip_tags($this->image_url));
        $this->link_url = htmlspecialchars(strip_tags($this->link_url ?? ''));
        $this->link_text = htmlspecialchars(strip_tags($this->link_text ?? ''));
        $this->background_color = htmlspecialchars(strip_tags($this->background_color ?? '#1E88E5'));
        $this->text_color = htmlspecialchars(strip_tags($this->text_color ?? '#FFFFFF'));
        $this->display_order = intval($this->display_order ?? 0);
        $this->is_active = intval($this->is_active ?? 1);
        $this->id = intval($this->id);
        
        // Bind parametreler
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':subtitle', $this->subtitle);
        $stmt->bindParam(':image_url', $this->image_url);
        $stmt->bindParam(':link_url', $this->link_url);
        $stmt->bindParam(':link_text', $this->link_text);
        $stmt->bindParam(':background_color', $this->background_color);
        $stmt->bindParam(':text_color', $this->text_color);
        $stmt->bindParam(':display_order', $this->display_order);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':start_date', $this->start_date);
        $stmt->bindParam(':end_date', $this->end_date);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Banner sil
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Banner durumunu değiştir (aktif/pasif)
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
    
    /**
     * Dosya yükle
     */
    public function uploadImage($file) {
        $target_dir = "../public/images/banners/";
        
        // Klasör yoksa oluştur
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0755, true);
        }
        
        $file_extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
        $new_filename = 'banner_' . time() . '_' . uniqid() . '.' . $file_extension;
        $target_file = $target_dir . $new_filename;
        
        // Dosya türü kontrolü
        $allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($file_extension, $allowed_types)) {
            return ['success' => false, 'message' => 'Sadece JPG, PNG, GIF ve WEBP dosyaları yüklenebilir.'];
        }
        
        // Dosya boyutu kontrolü (max 5MB)
        if ($file["size"] > 5000000) {
            return ['success' => false, 'message' => 'Dosya boyutu 5MB\'dan küçük olmalıdır.'];
        }
        
        // Dosyayı yükle
        if (move_uploaded_file($file["tmp_name"], $target_file)) {
            return [
                'success' => true, 
                'url' => '/public/images/banners/' . $new_filename,
                'message' => 'Dosya başarıyla yüklendi.'
            ];
        } else {
            return ['success' => false, 'message' => 'Dosya yüklenirken bir hata oluştu.'];
        }
    }
}
