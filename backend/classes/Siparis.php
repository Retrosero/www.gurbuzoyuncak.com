<?php
/**
 * Sipariş Sınıfı (Türkçe Şema)
 * Sipariş oluşturma ve yönetimi
 */

class Siparis {
    private $conn;
    private $table_name = "siparisler";
    private $items_table = "siparis_kalemleri";
    
    // Temel sipariş özellikleri
    public $id;
    public $siparis_no;
    public $kullanici_id;
    
    // Müşteri bilgileri
    public $musteri_adi;
    public $musteri_eposta;
    public $musteri_telefon;
    
    // Teslimat adresi
    public $teslimat_adresi;
    public $teslimat_il;
    public $teslimat_ilce;
    public $teslimat_posta_kodu;
    
    // Fiyat bilgileri
    public $ara_toplam;
    public $vergi_toplami;
    public $kargo_ucreti;
    public $indirim_tutari;
    public $kullanilan_bakiye;
    public $kupon_kodu;
    public $toplam_tutar;
    
    // Durum
    public $durum;
    public $odeme_durumu;
    
    // Notlar
    public $siparis_notu;
    public $admin_notu;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Yeni sipariş oluştur
     */
    public function olustur($kalemler) {
        try {
            $this->conn->beginTransaction();
            
            // Sipariş numarası oluştur
            $this->siparis_no = 'GO-' . date('Ymd') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            
            // Benzersizlik kontrolü
            while ($this->siparisNoVarMi($this->siparis_no)) {
                $this->siparis_no = 'GO-' . date('Ymd') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            }
            
            // Siparişi kaydet
            $query = "INSERT INTO " . $this->table_name . "
                    SET siparis_no = :siparis_no,
                        kullanici_id = :kullanici_id,
                        musteri_adi = :musteri_adi,
                        musteri_eposta = :musteri_eposta,
                        musteri_telefon = :musteri_telefon,
                        teslimat_adresi = :teslimat_adresi,
                        teslimat_il = :teslimat_il,
                        teslimat_ilce = :teslimat_ilce,
                        teslimat_posta_kodu = :teslimat_posta_kodu,
                        ara_toplam = :ara_toplam,
                        vergi_toplami = :vergi_toplami,
                        kargo_ucreti = :kargo_ucreti,
                        indirim_tutari = :indirim_tutari,
                        kullanilan_bakiye = :kullanilan_bakiye,
                        kupon_kodu = :kupon_kodu,
                        toplam_tutar = :toplam_tutar,
                        durum = :durum,
                        odeme_durumu = :odeme_durumu,
                        siparis_notu = :siparis_notu";
            
            $stmt = $this->conn->prepare($query);
            
            // Varsayılan değerler
            $this->durum = $this->durum ?? 'beklemede';
            $this->odeme_durumu = $this->odeme_durumu ?? 'beklemede';
            
            // Bind parametreler
            $stmt->bindParam(':siparis_no', $this->siparis_no);
            $stmt->bindParam(':kullanici_id', $this->kullanici_id);
            $stmt->bindParam(':musteri_adi', $this->musteri_adi);
            $stmt->bindParam(':musteri_eposta', $this->musteri_eposta);
            $stmt->bindParam(':musteri_telefon', $this->musteri_telefon);
            $stmt->bindParam(':teslimat_adresi', $this->teslimat_adresi);
            $stmt->bindParam(':teslimat_il', $this->teslimat_il);
            $stmt->bindParam(':teslimat_ilce', $this->teslimat_ilce);
            $stmt->bindParam(':teslimat_posta_kodu', $this->teslimat_posta_kodu);
            $stmt->bindParam(':ara_toplam', $this->ara_toplam);
            $stmt->bindParam(':vergi_toplami', $this->vergi_toplami);
            $stmt->bindParam(':kargo_ucreti', $this->kargo_ucreti);
            $stmt->bindParam(':indirim_tutari', $this->indirim_tutari);
            $stmt->bindParam(':kullanilan_bakiye', $this->kullanilan_bakiye);
            $stmt->bindParam(':kupon_kodu', $this->kupon_kodu);
            $stmt->bindParam(':toplam_tutar', $this->toplam_tutar);
            $stmt->bindParam(':durum', $this->durum);
            $stmt->bindParam(':odeme_durumu', $this->odeme_durumu);
            $stmt->bindParam(':siparis_notu', $this->siparis_notu);
            
            if (!$stmt->execute()) {
                throw new Exception("Sipariş kaydedilemedi");
            }
            
            $siparis_id = $this->conn->lastInsertId();
            $this->id = $siparis_id;
            
            // Sipariş kalemlerini kaydet
            $query = "INSERT INTO " . $this->items_table . " 
                     (siparis_id, urun_id, urun_adi, urun_kodu, miktar, birim_fiyat, toplam_fiyat)
                     VALUES (:siparis_id, :urun_id, :urun_adi, :urun_kodu, :miktar, :birim_fiyat, :toplam_fiyat)";
            
            $stmt = $this->conn->prepare($query);
            
            foreach ($kalemler as $kalem) {
                $toplam_fiyat = $kalem['birim_fiyat'] * $kalem['miktar'];
                
                $stmt->bindParam(':siparis_id', $siparis_id);
                $stmt->bindParam(':urun_id', $kalem['urun_id']);
                $stmt->bindParam(':urun_adi', $kalem['urun_adi']);
                $stmt->bindParam(':urun_kodu', $kalem['urun_kodu']);
                $stmt->bindParam(':miktar', $kalem['miktar']);
                $stmt->bindParam(':birim_fiyat', $kalem['birim_fiyat']);
                $stmt->bindParam(':toplam_fiyat', $toplam_fiyat);
                
                if (!$stmt->execute()) {
                    throw new Exception("Sipariş kalemi kaydedilemedi");
                }
                
                // Stok güncelle
                $this->stokGuncelle($kalem['urun_id'], $kalem['miktar']);
            }
            
            $this->conn->commit();
            return $siparis_id;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
    
    /**
     * Sipariş numarası var mı kontrol et
     */
    private function siparisNoVarMi($siparis_no) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE siparis_no = :siparis_no";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':siparis_no', $siparis_no);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'] > 0;
    }
    
    /**
     * Stok güncelle (urunler tablosunu kullan)
     */
    private function stokGuncelle($urun_id, $miktar) {
        $query = "UPDATE urunler SET stok_miktari = stok_miktari - :miktar WHERE id = :urun_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':miktar', $miktar);
        $stmt->bindParam(':urun_id', $urun_id);
        $stmt->execute();
    }
    
    /**
     * Kullanıcının siparişlerini getir
     */
    public function kullaniciSiparisleri($kullanici_id) {
        $query = "SELECT * FROM " . $this->table_name . " 
                 WHERE kullanici_id = :kullanici_id 
                 ORDER BY siparis_tarihi DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':kullanici_id', $kullanici_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Sipariş detaylarını getir
     */
    public function detayGetir($siparis_id, $kullanici_id = null) {
        $query = "SELECT s.*
                FROM " . $this->table_name . " s
                WHERE s.id = :siparis_id";
        
        if ($kullanici_id) {
            $query .= " AND s.kullanici_id = :kullanici_id";
        }
        
        $query .= " LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':siparis_id', $siparis_id);
        if ($kullanici_id) {
            $stmt->bindParam(':kullanici_id', $kullanici_id);
        }
        $stmt->execute();
        
        $siparis = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($siparis) {
            // Sipariş kalemlerini getir
            $siparis['kalemler'] = $this->siparisKalemleri($siparis_id);
        }
        
        return $siparis;
    }
    
    /**
     * Sipariş numarası ile sipariş getir
     */
    public function siparisNoIleGetir($siparis_no, $kullanici_id = null) {
        $query = "SELECT s.*
                FROM " . $this->table_name . " s
                WHERE s.siparis_no = :siparis_no";
        
        if ($kullanici_id) {
            $query .= " AND s.kullanici_id = :kullanici_id";
        }
        
        $query .= " LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':siparis_no', $siparis_no);
        if ($kullanici_id) {
            $stmt->bindParam(':kullanici_id', $kullanici_id);
        }
        $stmt->execute();
        
        $siparis = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($siparis) {
            // Sipariş kalemlerini getir
            $siparis['kalemler'] = $this->siparisKalemleri($siparis['id']);
        }
        
        return $siparis;
    }
    
    /**
     * Sipariş kalemlerini getir
     */
    public function siparisKalemleri($siparis_id) {
        $query = "SELECT sk.*, u.ana_gorsel, u.seo_url 
                  FROM " . $this->items_table . " sk
                  LEFT JOIN urunler u ON sk.urun_id = u.id
                  WHERE sk.siparis_id = :siparis_id 
                  ORDER BY sk.id ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':siparis_id', $siparis_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Sipariş durumunu güncelle
     */
    public function durumGuncelle($siparis_id, $durum) {
        $query = "UPDATE " . $this->table_name . " 
                  SET durum = :durum, guncelleme_tarihi = NOW() 
                  WHERE id = :siparis_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':durum', $durum);
        $stmt->bindParam(':siparis_id', $siparis_id);
        
        return $stmt->execute();
    }
    
    /**
     * Ödeme durumunu güncelle
     */
    public function odemeDurumuGuncelle($siparis_id, $odeme_durumu) {
        $query = "UPDATE " . $this->table_name . " 
                  SET odeme_durumu = :odeme_durumu, guncelleme_tarihi = NOW() 
                  WHERE id = :siparis_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':odeme_durumu', $odeme_durumu);
        $stmt->bindParam(':siparis_id', $siparis_id);
        
        return $stmt->execute();
    }
    
    /**
     * Admin notu ekle/güncelle
     */
    public function adminNotuGuncelle($siparis_id, $admin_notu) {
        $query = "UPDATE " . $this->table_name . " 
                  SET admin_notu = :admin_notu, guncelleme_tarihi = NOW() 
                  WHERE id = :siparis_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':admin_notu', $admin_notu);
        $stmt->bindParam(':siparis_id', $siparis_id);
        
        return $stmt->execute();
    }
    
    /**
     * Tüm siparişleri getir (Admin için)
     */
    public function tumSiparisleriGetir($filtreler = []) {
        $query = "SELECT s.*, k.ad, k.soyad, k.eposta
                FROM " . $this->table_name . " s
                LEFT JOIN kullanicilar k ON s.kullanici_id = k.id
                WHERE 1=1";
        
        // Filtreler
        if (!empty($filtreler['durum'])) {
            $query .= " AND s.durum = :durum";
        }
        if (!empty($filtreler['odeme_durumu'])) {
            $query .= " AND s.odeme_durumu = :odeme_durumu";
        }
        if (!empty($filtreler['siparis_no'])) {
            $query .= " AND s.siparis_no LIKE :siparis_no";
        }
        if (!empty($filtreler['musteri_adi'])) {
            $query .= " AND (s.musteri_adi LIKE :musteri_adi OR k.ad LIKE :musteri_adi OR k.soyad LIKE :musteri_adi)";
        }
        if (!empty($filtreler['baslangic_tarihi'])) {
            $query .= " AND DATE(s.siparis_tarihi) >= :baslangic_tarihi";
        }
        if (!empty($filtreler['bitis_tarihi'])) {
            $query .= " AND DATE(s.siparis_tarihi) <= :bitis_tarihi";
        }
        
        // Sıralama
        $siralama = $filtreler['siralama'] ?? 'yeni';
        switch ($siralama) {
            case 'eski':
                $query .= " ORDER BY s.siparis_tarihi ASC";
                break;
            case 'tutar_yuksek':
                $query .= " ORDER BY s.toplam_tutar DESC";
                break;
            case 'tutar_dusuk':
                $query .= " ORDER BY s.toplam_tutar ASC";
                break;
            default:
                $query .= " ORDER BY s.siparis_tarihi DESC";
        }
        
        // Sayfalama
        if (!empty($filtreler['limit'])) {
            $query .= " LIMIT :limit";
            if (!empty($filtreler['offset'])) {
                $query .= " OFFSET :offset";
            }
        }
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parametreler
        if (!empty($filtreler['durum'])) {
            $stmt->bindParam(':durum', $filtreler['durum']);
        }
        if (!empty($filtreler['odeme_durumu'])) {
            $stmt->bindParam(':odeme_durumu', $filtreler['odeme_durumu']);
        }
        if (!empty($filtreler['siparis_no'])) {
            $siparis_no = '%' . $filtreler['siparis_no'] . '%';
            $stmt->bindParam(':siparis_no', $siparis_no);
        }
        if (!empty($filtreler['musteri_adi'])) {
            $musteri_adi = '%' . $filtreler['musteri_adi'] . '%';
            $stmt->bindParam(':musteri_adi', $musteri_adi);
        }
        if (!empty($filtreler['baslangic_tarihi'])) {
            $stmt->bindParam(':baslangic_tarihi', $filtreler['baslangic_tarihi']);
        }
        if (!empty($filtreler['bitis_tarihi'])) {
            $stmt->bindParam(':bitis_tarihi', $filtreler['bitis_tarihi']);
        }
        if (!empty($filtreler['limit'])) {
            $stmt->bindParam(':limit', $filtreler['limit'], PDO::PARAM_INT);
            if (!empty($filtreler['offset'])) {
                $stmt->bindParam(':offset', $filtreler['offset'], PDO::PARAM_INT);
            }
        }
        
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Toplam sipariş sayısı (sayfalama için)
     */
    public function toplamSayi($filtreler = []) {
        $query = "SELECT COUNT(*) as toplam FROM " . $this->table_name . " s 
                  LEFT JOIN kullanicilar k ON s.kullanici_id = k.id 
                  WHERE 1=1";
        
        // Filtreler
        if (!empty($filtreler['durum'])) {
            $query .= " AND s.durum = :durum";
        }
        if (!empty($filtreler['odeme_durumu'])) {
            $query .= " AND s.odeme_durumu = :odeme_durumu";
        }
        if (!empty($filtreler['siparis_no'])) {
            $query .= " AND s.siparis_no LIKE :siparis_no";
        }
        if (!empty($filtreler['musteri_adi'])) {
            $query .= " AND (s.musteri_adi LIKE :musteri_adi OR k.ad LIKE :musteri_adi OR k.soyad LIKE :musteri_adi)";
        }
        if (!empty($filtreler['baslangic_tarihi'])) {
            $query .= " AND DATE(s.siparis_tarihi) >= :baslangic_tarihi";
        }
        if (!empty($filtreler['bitis_tarihi'])) {
            $query .= " AND DATE(s.siparis_tarihi) <= :bitis_tarihi";
        }
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parametreler
        if (!empty($filtreler['durum'])) {
            $stmt->bindParam(':durum', $filtreler['durum']);
        }
        if (!empty($filtreler['odeme_durumu'])) {
            $stmt->bindParam(':odeme_durumu', $filtreler['odeme_durumu']);
        }
        if (!empty($filtreler['siparis_no'])) {
            $siparis_no = '%' . $filtreler['siparis_no'] . '%';
            $stmt->bindParam(':siparis_no', $siparis_no);
        }
        if (!empty($filtreler['musteri_adi'])) {
            $musteri_adi = '%' . $filtreler['musteri_adi'] . '%';
            $stmt->bindParam(':musteri_adi', $musteri_adi);
        }
        if (!empty($filtreler['baslangic_tarihi'])) {
            $stmt->bindParam(':baslangic_tarihi', $filtreler['baslangic_tarihi']);
        }
        if (!empty($filtreler['bitis_tarihi'])) {
            $stmt->bindParam(':bitis_tarihi', $filtreler['bitis_tarihi']);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['toplam'];
    }
    
    /**
     * Günlük satış istatistikleri
     */
    public function gunlukSatislar($gun_sayisi = 30) {
        $query = "SELECT 
                    DATE(siparis_tarihi) as tarih,
                    COUNT(*) as siparis_sayisi,
                    SUM(toplam_tutar) as toplam_satis,
                    AVG(toplam_tutar) as ortalama_sepet
                  FROM " . $this->table_name . "
                  WHERE siparis_tarihi >= DATE_SUB(NOW(), INTERVAL :gun_sayisi DAY)
                  AND durum NOT IN ('iptal_edildi')
                  GROUP BY DATE(siparis_tarihi)
                  ORDER BY tarih DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':gun_sayisi', $gun_sayisi, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Aylık satış özeti
     */
    public function aylikOzet() {
        $query = "SELECT 
                    YEAR(siparis_tarihi) as yil,
                    MONTH(siparis_tarihi) as ay,
                    COUNT(*) as siparis_sayisi,
                    SUM(toplam_tutar) as toplam_satis,
                    AVG(toplam_tutar) as ortalama_sepet
                  FROM " . $this->table_name . "
                  WHERE siparis_tarihi >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                  AND durum NOT IN ('iptal_edildi')
                  GROUP BY YEAR(siparis_tarihi), MONTH(siparis_tarihi)
                  ORDER BY yil DESC, ay DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Sipariş durumları dağılımı
     */
    public function durumDagilimi() {
        $query = "SELECT 
                    durum,
                    COUNT(*) as siparis_sayisi,
                    SUM(toplam_tutar) as toplam_tutar
                  FROM " . $this->table_name . "
                  WHERE siparis_tarihi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                  GROUP BY durum
                  ORDER BY siparis_sayisi DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * En çok sipariş veren müşteriler
     */
    public function enCokSiparisVerenler($limit = 10) {
        $query = "SELECT 
                    s.kullanici_id,
                    s.musteri_adi,
                    s.musteri_eposta,
                    COUNT(*) as siparis_sayisi,
                    SUM(s.toplam_tutar) as toplam_harcama,
                    AVG(s.toplam_tutar) as ortalama_sepet,
                    MAX(s.siparis_tarihi) as son_siparis
                  FROM " . $this->table_name . " s
                  WHERE s.durum NOT IN ('iptal_edildi')
                  GROUP BY s.kullanici_id, s.musteri_adi, s.musteri_eposta
                  HAVING siparis_sayisi > 1
                  ORDER BY toplam_harcama DESC
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Kargo ücreti hesapla (basit hesaplama)
     */
    public function kargoUcretiHesapla($il, $toplam_tutar, $toplam_agirlik = 0) {
        // Basit kargo ücreti hesaplama
        // Gerçek projede kargo firması API'si kullanılabilir
        
        $kargo_ucreti = 0;
        
        // Ücretsiz kargo limiti
        $ucretsiz_kargo_limiti = 150;
        
        if ($toplam_tutar >= $ucretsiz_kargo_limiti) {
            return 0;
        }
        
        // İl bazlı hesaplama
        $buyuk_sehirler = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
        
        if (in_array($il, $buyuk_sehirler)) {
            $kargo_ucreti = 15;
        } else {
            $kargo_ucreti = 25;
        }
        
        return $kargo_ucreti;
    }
}