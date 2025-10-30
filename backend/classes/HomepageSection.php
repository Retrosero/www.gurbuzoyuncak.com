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
    
    // Yeni countdown banner özellikleri
    public $start_date;
    public $end_date;
    public $banner_text;
    public $banner_button_text;
    public $banner_button_url;
    
    // Bölüm türleri
    const TYPE_POPULAR = 'populer';
    const TYPE_NEW = 'yeni_gelenler';
    const TYPE_FEATURED = 'sectiklerimiz';
    const TYPE_SALE = 'indirimli';
    const TYPE_COUNTDOWN_BANNER = 'countdown_banner';
    
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
    
    // =========================================================================
    // COUNTDOWN BANNER METODLAri
    // =========================================================================
    
    /**
     * Aktif countdown banner'ları getir
     */
    public function getActiveCountdownBanners() {
        $now = date('Y-m-d H:i:s');
        
        $query = "SELECT *, 
                  TIMESTAMPDIFF(SECOND, :now, end_date) as seconds_remaining
                  FROM " . $this->table_name . "
                  WHERE section_type = 'countdown_banner'
                  AND is_active = 1
                  AND start_date <= :now
                  AND end_date >= :now
                  AND TIMESTAMPDIFF(SECOND, :now, end_date) > 0
                  ORDER BY sort_order ASC, start_date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':now', $now);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Countdown banner oluştur
     */
    public function createCountdownBanner() {
        $query = "INSERT INTO " . $this->table_name . "
                  (section_type, title, description, start_date, end_date, 
                   banner_text, banner_button_text, banner_button_url, 
                   is_active, sort_order)
                  VALUES 
                  ('countdown_banner', :title, :description, :start_date, :end_date,
                   :banner_text, :banner_button_text, :banner_button_url,
                   :is_active, :sort_order)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':description', $this->subtitle);
        $stmt->bindParam(':start_date', $this->start_date);
        $stmt->bindParam(':end_date', $this->end_date);
        $stmt->bindParam(':banner_text', $this->banner_text);
        $stmt->bindParam(':banner_button_text', $this->banner_button_text);
        $stmt->bindParam(':banner_button_url', $this->banner_button_url);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':sort_order', $this->display_order);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return ['success' => true, 'id' => $this->id, 'message' => 'Countdown banner oluşturuldu'];
        }
        
        return ['error' => 'Countdown banner oluşturulamadı'];
    }
    
    /**
     * Countdown banner güncelle
     */
    public function updateCountdownBanner() {
        $query = "UPDATE " . $this->table_name . "
                  SET title = :title,
                      description = :description,
                      start_date = :start_date,
                      end_date = :end_date,
                      banner_text = :banner_text,
                      banner_button_text = :banner_button_text,
                      banner_button_url = :banner_button_url,
                      is_active = :is_active,
                      sort_order = :sort_order
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':description', $this->subtitle);
        $stmt->bindParam(':start_date', $this->start_date);
        $stmt->bindParam(':end_date', $this->end_date);
        $stmt->bindParam(':banner_text', $this->banner_text);
        $stmt->bindParam(':banner_button_text', $this->banner_button_text);
        $stmt->bindParam(':banner_button_url', $this->banner_button_url);
        $stmt->bindParam(':is_active', $this->is_active);
        $stmt->bindParam(':sort_order', $this->display_order);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Countdown banner güncellendi'];
        }
        
        return ['error' => 'Countdown banner güncellenemedi'];
    }
    
    /**
     * Belirli bir countdown banner'ı getir
     */
    public function getCountdownBanner($id) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE id = :id AND section_type = 'countdown_banner'
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Tüm countdown banner'ları listele (admin için)
     */
    public function getAllCountdownBanners() {
        $query = "SELECT *, 
                  CASE 
                    WHEN end_date < NOW() THEN 'expired'
                    WHEN start_date > NOW() THEN 'upcoming'
                    WHEN start_date <= NOW() AND end_date >= NOW() THEN 'active'
                    ELSE 'unknown'
                  END as status
                  FROM " . $this->table_name . "
                  WHERE section_type = 'countdown_banner'
                  ORDER BY start_date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Countdown banner süresini kontrol et ve otomatik deaktive et
     */
    public function checkAndDeactivateExpiredBanners() {
        $now = date('Y-m-d H:i:s');
        
        $query = "UPDATE " . $this->table_name . "
                  SET is_active = 0
                  WHERE section_type = 'countdown_banner'
                  AND is_active = 1
                  AND end_date < :now";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':now', $now);
        
        $affected_rows = $stmt->execute() ? $stmt->rowCount() : 0;
        
        return [
            'success' => true,
            'deactivated_count' => $affected_rows,
            'message' => $affected_rows > 0 ? "{$affected_rows} süresi dolan banner deaktive edildi" : "Deaktive edilecek banner yok"
        ];
    }
    
    /**
     * Banner için kalan süreyi hesapla
     */
    public function calculateRemainingTime($end_date) {
        $now = new DateTime();
        $end = new DateTime($end_date);
        
        if ($end <= $now) {
            return [
                'expired' => true,
                'days' => 0,
                'hours' => 0,
                'minutes' => 0,
                'seconds' => 0,
                'total_seconds' => 0
            ];
        }
        
        $diff = $now->diff($end);
        $total_seconds = ($end->getTimestamp() - $now->getTimestamp());
        
        return [
            'expired' => false,
            'days' => $diff->days,
            'hours' => $diff->h,
            'minutes' => $diff->i,
            'seconds' => $diff->s,
            'total_seconds' => $total_seconds
        ];
    }
    
    /**
     * Frontend için countdown banner verisi getir
     */
    public function getCountdownBannerForFrontend($id) {
        $banner = $this->getCountdownBanner($id);
        
        if (!$banner) {
            return null;
        }
        
        $time_data = $this->calculateRemainingTime($banner['end_date']);
        $banner['time_remaining'] = $time_data;
        
        return $banner;
    }
    
    /**
     * Ana sayfa için aktif countdown banner'ları getir (frontend)
     */
    public function getHomepageCountdownBanners() {
        $banners = $this->getActiveCountdownBanners();
        
        foreach ($banners as &$banner) {
            $banner['time_remaining'] = $this->calculateRemainingTime($banner['end_date']);
        }
        
        return $banners;
    }
}
