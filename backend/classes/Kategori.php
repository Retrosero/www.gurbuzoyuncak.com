<?php
/**
 * Kategori Sınıfı (Türkçe Şema)
 * Hiyerarşik kategori yapısı yönetimi
 */

class Kategori {
    private $conn;
    private $table_name = "kategoriler";
    
    // Kategori özellikleri
    public $id;
    public $kategori_adi;
    public $ust_kategori_id;
    public $xml_kategori_id;
    public $seo_url;
    public $aciklama;
    public $gorsel_url;
    public $sira;
    public $aktif;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Tüm kategorileri getir (hiyerarşik yapı ile)
     */
    public function tumunuGetir($ust_kategori_id = null, $hiyerarşik = false) {
        if ($hiyerarşik) {
            return $this->hiyerarşikGetir();
        }
        
        $query = "SELECT k.*, 
                         uk.kategori_adi as ust_kategori_adi,
                         (SELECT COUNT(*) FROM urunler WHERE kategori_id = k.id AND aktif = 1) as urun_sayisi
                  FROM " . $this->table_name . " k
                  LEFT JOIN " . $this->table_name . " uk ON k.ust_kategori_id = uk.id
                  WHERE k.aktif = 1";
        
        if ($ust_kategori_id !== null) {
            if ($ust_kategori_id === 0) {
                $query .= " AND k.ust_kategori_id IS NULL";
            } else {
                $query .= " AND k.ust_kategori_id = :ust_id";
            }
        }
        
        $query .= " ORDER BY k.sira ASC, k.kategori_adi ASC";
        
        $stmt = $this->conn->prepare($query);
        
        if ($ust_kategori_id !== null && $ust_kategori_id > 0) {
            $stmt->bindParam(':ust_id', $ust_kategori_id);
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Hiyerarşik kategori yapısını getir
     */
    public function hiyerarşikGetir() {
        // Ana kategorileri getir
        $query = "SELECT k.*, 
                         (SELECT COUNT(*) FROM urunler WHERE kategori_id = k.id AND aktif = 1) as urun_sayisi
                  FROM " . $this->table_name . " k
                  WHERE k.aktif = 1 AND k.ust_kategori_id IS NULL
                  ORDER BY k.sira ASC, k.kategori_adi ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $kategoriler = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['alt_kategoriler'] = $this->altKategorileriGetir($row['id'], true);
            $kategoriler[] = $row;
        }
        
        return $kategoriler;
    }
    
    /**
     * Tek kategori getir
     */
    public function tekGetir() {
        $query = "SELECT k.*, 
                         uk.kategori_adi as ust_kategori_adi,
                         (SELECT COUNT(*) FROM urunler WHERE kategori_id = k.id AND aktif = 1) as urun_sayisi
                  FROM " . $this->table_name . " k
                  LEFT JOIN " . $this->table_name . " uk ON k.ust_kategori_id = uk.id
                  WHERE k.id = :id AND k.aktif = 1 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        $kategori = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($kategori) {
            // Alt kategorileri ekle
            $kategori['alt_kategoriler'] = $this->altKategorileriGetir($kategori['id'], true);
        }
        
        return $kategori;
    }
    
    /**
     * SEO URL ile kategori getir
     */
    public function seoUrlIleGetir($seo_url) {
        $query = "SELECT k.*, 
                         uk.kategori_adi as ust_kategori_adi,
                         (SELECT COUNT(*) FROM urunler WHERE kategori_id = k.id AND aktif = 1) as urun_sayisi
                  FROM " . $this->table_name . " k
                  LEFT JOIN " . $this->table_name . " uk ON k.ust_kategori_id = uk.id
                  WHERE k.seo_url = :seo_url AND k.aktif = 1 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':seo_url', $seo_url);
        $stmt->execute();
        
        $kategori = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($kategori) {
            // Alt kategorileri ekle
            $kategori['alt_kategoriler'] = $this->altKategorileriGetir($kategori['id'], true);
            // Kategori yolunu ekle (breadcrumb için)
            $kategori['kategori_yolu'] = $this->kategoriYoluGetir($kategori['id']);
        }
        
        return $kategori;
    }
    
    /**
     * Alt kategorileri getir
     */
    public function altKategorileriGetir($kategori_id = null, $recursive = false) {
        $id = $kategori_id ?? $this->id;
        
        $query = "SELECT k.*, 
                         (SELECT COUNT(*) FROM urunler WHERE kategori_id = k.id AND aktif = 1) as urun_sayisi
                  FROM " . $this->table_name . " k
                  WHERE k.ust_kategori_id = :id AND k.aktif = 1
                  ORDER BY k.sira ASC, k.kategori_adi ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        $kategoriler = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($recursive) {
                $row['alt_kategoriler'] = $this->altKategorileriGetir($row['id'], true);
            }
            $kategoriler[] = $row;
        }
        
        return $kategoriler;
    }
    
    /**
     * Ana kategorileri getir
     */
    public function anaKategorileriGetir() {
        $query = "SELECT k.*, 
                         (SELECT COUNT(*) FROM urunler WHERE kategori_id = k.id AND aktif = 1) as urun_sayisi,
                         (SELECT COUNT(*) FROM " . $this->table_name . " WHERE ust_kategori_id = k.id AND aktif = 1) as alt_kategori_sayisi
                  FROM " . $this->table_name . " k
                  WHERE k.aktif = 1 AND k.ust_kategori_id IS NULL
                  ORDER BY k.sira ASC, k.kategori_adi ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Kategori yolu getir (breadcrumb için)
     */
    public function kategoriYoluGetir($kategori_id) {
        $yol = [];
        $current_id = $kategori_id;
        
        while ($current_id) {
            $query = "SELECT id, kategori_adi, seo_url, ust_kategori_id 
                      FROM " . $this->table_name . " 
                      WHERE id = :id LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $current_id);
            $stmt->execute();
            
            $kategori = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($kategori) {
                array_unshift($yol, $kategori); // Başa ekle
                $current_id = $kategori['ust_kategori_id'];
            } else {
                break;
            }
        }
        
        return $yol;
    }
    
    /**
     * Yeni kategori ekle
     */
    public function ekle() {
        // SEO URL oluştur eğer boşsa
        if (empty($this->seo_url) && !empty($this->kategori_adi)) {
            $this->seo_url = $this->seoUrlOlustur($this->kategori_adi);
        }
        
        $query = "INSERT INTO " . $this->table_name . "
                  SET kategori_adi = :kategori_adi,
                      ust_kategori_id = :ust_kategori_id,
                      xml_kategori_id = :xml_kategori_id,
                      seo_url = :seo_url,
                      aciklama = :aciklama,
                      gorsel_url = :gorsel_url,
                      sira = :sira,
                      aktif = :aktif";
        
        $stmt = $this->conn->prepare($query);
        
        // Temizle
        $this->kategori_adi = htmlspecialchars(strip_tags($this->kategori_adi ?? ''));
        $this->aciklama = htmlspecialchars(strip_tags($this->aciklama ?? ''));
        
        // Default değerler
        $this->aktif = $this->aktif ?? 1;
        $this->sira = $this->sira ?? 0;
        
        $stmt->bindParam(':kategori_adi', $this->kategori_adi);
        $stmt->bindParam(':ust_kategori_id', $this->ust_kategori_id);
        $stmt->bindParam(':xml_kategori_id', $this->xml_kategori_id);
        $stmt->bindParam(':seo_url', $this->seo_url);
        $stmt->bindParam(':aciklama', $this->aciklama);
        $stmt->bindParam(':gorsel_url', $this->gorsel_url);
        $stmt->bindParam(':sira', $this->sira);
        $stmt->bindParam(':aktif', $this->aktif);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Kategori güncelle
     */
    public function guncelle() {
        $query = "UPDATE " . $this->table_name . "
                  SET kategori_adi = :kategori_adi,
                      ust_kategori_id = :ust_kategori_id,
                      xml_kategori_id = :xml_kategori_id,
                      seo_url = :seo_url,
                      aciklama = :aciklama,
                      gorsel_url = :gorsel_url,
                      sira = :sira,
                      aktif = :aktif,
                      guncelleme_tarihi = NOW()
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Temizle
        $this->kategori_adi = htmlspecialchars(strip_tags($this->kategori_adi ?? ''));
        $this->aciklama = htmlspecialchars(strip_tags($this->aciklama ?? ''));
        $this->id = intval($this->id);
        
        $stmt->bindParam(':kategori_adi', $this->kategori_adi);
        $stmt->bindParam(':ust_kategori_id', $this->ust_kategori_id);
        $stmt->bindParam(':xml_kategori_id', $this->xml_kategori_id);
        $stmt->bindParam(':seo_url', $this->seo_url);
        $stmt->bindParam(':aciklama', $this->aciklama);
        $stmt->bindParam(':gorsel_url', $this->gorsel_url);
        $stmt->bindParam(':sira', $this->sira);
        $stmt->bindParam(':aktif', $this->aktif);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Kategori sil (soft delete)
     */
    public function sil() {
        // Alt kategorileri kontrol et
        $alt_kategoriler = $this->altKategorileriGetir();
        if (!empty($alt_kategoriler)) {
            return ['error' => 'Bu kategorinin alt kategorileri var, önce onları silin'];
        }
        
        // Ürünleri kontrol et
        $query = "SELECT COUNT(*) as count FROM urunler WHERE kategori_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row['count'] > 0) {
            return ['error' => 'Bu kategoride ürünler var, önce onları başka kategoriye taşıyın'];
        }
        
        // Soft delete
        $query = "UPDATE " . $this->table_name . " SET aktif = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindParam(':id', $this->id);
        
        if ($stmt->execute()) {
            return ['success' => true];
        }
        
        return ['error' => 'Kategori silinemedi'];
    }
    
    /**
     * XML kategori ID ile kategori bul veya oluştur
     */
    public function xmlKategoriIdIleBulVeyaOlustur($xml_kategori_id, $kategori_adi, $ust_kategori_id = null) {
        // Önce var mı kontrol et
        $query = "SELECT id FROM " . $this->table_name . " WHERE xml_kategori_id = :xml_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':xml_id', $xml_kategori_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            return $row['id'];
        }
        
        // Yoksa oluştur
        $this->xml_kategori_id = $xml_kategori_id;
        $this->kategori_adi = $kategori_adi;
        $this->ust_kategori_id = $ust_kategori_id;
        $this->seo_url = $this->seoUrlOlustur($kategori_adi);
        $this->aktif = 1;
        
        if ($this->ekle()) {
            return $this->id;
        }
        
        return false;
    }
    
    /**
     * SEO URL oluştur
     */
    private function seoUrlOlustur($metin) {
        // Türkçe karakterleri değiştir
        $turkce = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'I', 'İ', 'Ö', 'Ş', 'Ü'];
        $ingilizce = ['c', 'g', 'i', 'o', 's', 'u', 'c', 'g', 'i', 'i', 'o', 's', 'u'];
        $metin = str_replace($turkce, $ingilizce, $metin);
        
        // Küçük harfe çevir ve temizle
        $metin = strtolower($metin);
        $metin = preg_replace('/[^a-z0-9\s-]/', '', $metin);
        $metin = preg_replace('/\s+/', '-', $metin);
        $metin = trim($metin, '-');
        
        // Benzersizlik için kontrol et
        $original_url = $metin;
        $counter = 1;
        
        while ($this->seoUrlVarMi($metin)) {
            $metin = $original_url . '-' . $counter;
            $counter++;
        }
        
        return $metin;
    }
    
    /**
     * SEO URL var mı kontrol et
     */
    private function seoUrlVarMi($seo_url) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE seo_url = :seo_url";
        if (!empty($this->id)) {
            $query .= " AND id != :id";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':seo_url', $seo_url);
        if (!empty($this->id)) {
            $stmt->bindParam(':id', $this->id);
        }
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'] > 0;
    }
    
    /**
     * Kategori istatistikleri
     */
    public function istatistikleriGetir() {
        $query = "SELECT 
                    COUNT(*) as toplam_kategori,
                    SUM(CASE WHEN ust_kategori_id IS NULL THEN 1 ELSE 0 END) as ana_kategori_sayisi,
                    SUM(CASE WHEN ust_kategori_id IS NOT NULL THEN 1 ELSE 0 END) as alt_kategori_sayisi,
                    (SELECT COUNT(*) FROM urunler u JOIN kategoriler k ON u.kategori_id = k.id WHERE k.aktif = 1 AND u.aktif = 1) as toplam_urun
                  FROM " . $this->table_name . " 
                  WHERE aktif = 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * En çok ürünü olan kategoriler
     */
    public function enCokUrunluKategoriler($limit = 10) {
        $query = "SELECT k.*, COUNT(u.id) as urun_sayisi
                  FROM " . $this->table_name . " k
                  LEFT JOIN urunler u ON k.id = u.kategori_id AND u.aktif = 1
                  WHERE k.aktif = 1
                  GROUP BY k.id
                  ORDER BY urun_sayisi DESC
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}