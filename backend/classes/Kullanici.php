<?php
/**
 * Kullanıcı Sınıfı (Türkçe Şema)
 * Kayıt, Giriş, Profil Yönetimi, Bakiye ve Puan Sistemi
 */

class Kullanici {
    private $conn;
    private $table_name = "kullanicilar";
    
    // Kullanıcı özellikleri
    public $id;
    public $ad;
    public $soyad;
    public $eposta;
    public $sifre;
    public $sifre_hash;
    public $telefon;
    public $bakiye;
    public $puan;
    public $aktif;
    public $eposta_onaylandi;
    public $son_giris;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Kullanıcı kaydı oluştur
     */
    public function kayitOl() {
        // Email kontrolü
        if ($this->epostaVarMi()) {
            return ['error' => 'Bu e-posta adresi zaten kullanılıyor'];
        }
        
        $query = "INSERT INTO " . $this->table_name . "
                SET ad = :ad,
                    soyad = :soyad,
                    eposta = :eposta,
                    sifre = :sifre,
                    telefon = :telefon,
                    bakiye = 0.00,
                    puan = 0,
                    aktif = 1,
                    eposta_onaylandi = 0";
        
        $stmt = $this->conn->prepare($query);
        
        // Şifreyi hash'le
        $this->sifre_hash = password_hash($this->sifre, PASSWORD_BCRYPT);
        
        // Temizle
        $this->ad = htmlspecialchars(strip_tags($this->ad ?? ''));
        $this->soyad = htmlspecialchars(strip_tags($this->soyad ?? ''));
        $this->eposta = htmlspecialchars(strip_tags($this->eposta ?? ''));
        $this->telefon = htmlspecialchars(strip_tags($this->telefon ?? ''));
        
        // Email validation
        if (!filter_var($this->eposta, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Geçersiz e-posta adresi'];
        }
        
        // Bind parametreler
        $stmt->bindParam(':ad', $this->ad);
        $stmt->bindParam(':soyad', $this->soyad);
        $stmt->bindParam(':eposta', $this->eposta);
        $stmt->bindParam(':sifre', $this->sifre_hash);
        $stmt->bindParam(':telefon', $this->telefon);
        
        if ($stmt->execute()) {
            $user_id = $this->conn->lastInsertId();
            return ['success' => true, 'user_id' => $user_id];
        }
        
        return ['error' => 'Kayıt işlemi başarısız'];
    }
    
    /**
     * Kullanıcı girişi
     */
    public function girisYap() {
        $query = "SELECT id, ad, soyad, eposta, sifre, telefon, bakiye, puan, aktif, eposta_onaylandi
                FROM " . $this->table_name . "
                WHERE eposta = :eposta
                LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':eposta', $this->eposta);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row && password_verify($this->sifre, $row['sifre'])) {
            if ($row['aktif'] == 1) {
                // Son giriş zamanını güncelle
                $this->sonGirisGuncelle($row['id']);
                
                return [
                    'success' => true,
                    'user' => [
                        'id' => $row['id'],
                        'ad' => $row['ad'],
                        'soyad' => $row['soyad'],
                        'eposta' => $row['eposta'],
                        'telefon' => $row['telefon'],
                        'bakiye' => $row['bakiye'],
                        'puan' => $row['puan'],
                        'eposta_onaylandi' => $row['eposta_onaylandi']
                    ]
                ];
            } else {
                return ['error' => 'Hesabınız aktif değil'];
            }
        }
        
        return ['error' => 'E-posta veya şifre hatalı'];
    }
    
    /**
     * Email'in zaten kullanılıp kullanılmadığını kontrol et
     */
    public function epostaVarMi() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE eposta = :eposta LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':eposta', $this->eposta);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
    
    /**
     * Kullanıcı bilgilerini getir
     */
    public function bilgileriGetir() {
        $query = "SELECT id, ad, soyad, eposta, telefon, bakiye, puan, aktif, eposta_onaylandi, son_giris, olusturma_tarihi
                FROM " . $this->table_name . "
                WHERE id = :id
                LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * E-posta ile kullanıcı bilgilerini getir
     */
    public function epostaIleBilgileriGetir($eposta) {
        $query = "SELECT id, ad, soyad, eposta, telefon, bakiye, puan, aktif, eposta_onaylandi, son_giris, olusturma_tarihi
                FROM " . $this->table_name . "
                WHERE eposta = :eposta
                LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':eposta', $eposta);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Profil güncelle
     */
    public function profilGuncelle() {
        $query = "UPDATE " . $this->table_name . "
                SET ad = :ad,
                    soyad = :soyad,
                    telefon = :telefon,
                    guncelleme_tarihi = NOW()
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->ad = htmlspecialchars(strip_tags($this->ad ?? ''));
        $this->soyad = htmlspecialchars(strip_tags($this->soyad ?? ''));
        $this->telefon = htmlspecialchars(strip_tags($this->telefon ?? ''));
        
        $stmt->bindParam(':ad', $this->ad);
        $stmt->bindParam(':soyad', $this->soyad);
        $stmt->bindParam(':telefon', $this->telefon);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Son giriş zamanını güncelle
     */
    private function sonGirisGuncelle($kullanici_id) {
        $query = "UPDATE " . $this->table_name . " SET son_giris = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $kullanici_id);
        $stmt->execute();
    }
    
    /**
     * Şifre değiştir
     */
    public function sifreDegistir($eski_sifre, $yeni_sifre) {
        // Önce mevcut şifreyi kontrol et
        $query = "SELECT sifre FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row && password_verify($eski_sifre, $row['sifre'])) {
            // Yeni şifreyi güncelle
            $query = "UPDATE " . $this->table_name . " 
                      SET sifre = :sifre, guncelleme_tarihi = NOW() 
                      WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            $yeni_hash = password_hash($yeni_sifre, PASSWORD_BCRYPT);
            
            $stmt->bindParam(':sifre', $yeni_hash);
            $stmt->bindParam(':id', $this->id);
            
            return $stmt->execute();
        }
        
        return false;
    }
    
    /**
     * Şifre sıfırlama (e-posta ile)
     */
    public function sifreSifirla($eposta, $yeni_sifre) {
        $query = "UPDATE " . $this->table_name . " 
                  SET sifre = :sifre, guncelleme_tarihi = NOW() 
                  WHERE eposta = :eposta";
        
        $stmt = $this->conn->prepare($query);
        
        $yeni_hash = password_hash($yeni_sifre, PASSWORD_BCRYPT);
        
        $stmt->bindParam(':sifre', $yeni_hash);
        $stmt->bindParam(':eposta', $eposta);
        
        return $stmt->execute();
    }
    
    /**
     * E-posta onaylama
     */
    public function epostaOnayla($kullanici_id) {
        $query = "UPDATE " . $this->table_name . " 
                  SET eposta_onaylandi = 1, guncelleme_tarihi = NOW() 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $kullanici_id);
        
        return $stmt->execute();
    }
    
    /**
     * Bakiye getir
     */
    public function bakiyeGetir($kullanici_id = null) {
        $id = $kullanici_id ?? $this->id;
        
        $query = "SELECT bakiye FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['bakiye'] : 0;
    }
    
    /**
     * Bakiye ekle
     */
    public function bakiyeEkle($miktar, $aciklama = 'Bakiye yükleme') {
        try {
            $this->conn->beginTransaction();
            
            // Bakiyeyi güncelle
            $query = "UPDATE " . $this->table_name . " 
                      SET bakiye = bakiye + :miktar, guncelleme_tarihi = NOW() 
                      WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':miktar', $miktar);
            $stmt->bindParam(':id', $this->id);
            
            if (!$stmt->execute()) {
                throw new Exception("Bakiye güncellenemedi");
            }
            
            // Bakiye geçmişine kaydet
            $this->bakiyeGecmisiEkle($this->id, 'ekleme', $miktar, $aciklama);
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
    
    /**
     * Bakiye düş
     */
    public function bakiyeDus($miktar, $aciklama = 'Satın alma') {
        try {
            $this->conn->beginTransaction();
            
            // Yeterli bakiye var mı kontrol et
            $mevcut_bakiye = $this->bakiyeGetir();
            
            if ($mevcut_bakiye < $miktar) {
                throw new Exception("Yetersiz bakiye");
            }
            
            // Bakiyeyi güncelle
            $query = "UPDATE " . $this->table_name . " 
                      SET bakiye = bakiye - :miktar, guncelleme_tarihi = NOW() 
                      WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':miktar', $miktar);
            $stmt->bindParam(':id', $this->id);
            
            if (!$stmt->execute()) {
                throw new Exception("Bakiye güncellenemedi");
            }
            
            // Bakiye geçmişine kaydet
            $this->bakiyeGecmisiEkle($this->id, 'dusme', $miktar, $aciklama);
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
    
    /**
     * Puan getir
     */
    public function puanGetir($kullanici_id = null) {
        $id = $kullanici_id ?? $this->id;
        
        $query = "SELECT puan FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['puan'] : 0;
    }
    
    /**
     * Puan ekle (alışveriş sonrası)
     */
    public function puanEkle($miktar, $aciklama = 'Alışveriş puanı') {
        $query = "UPDATE " . $this->table_name . " 
                  SET puan = puan + :miktar, guncelleme_tarihi = NOW() 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':miktar', $miktar);
        $stmt->bindParam(':id', $this->id);
        
        if ($stmt->execute()) {
            // Puan geçmişine kaydet
            $this->puanGecmisiEkle($this->id, 'kazanma', $miktar, $aciklama);
            return true;
        }
        
        return false;
    }
    
    /**
     * Puan kullan (indirim için)
     */
    public function puanKullan($miktar, $aciklama = 'Puan indirimi') {
        $mevcut_puan = $this->puanGetir();
        
        if ($mevcut_puan < $miktar) {
            return false; // Yetersiz puan
        }
        
        $query = "UPDATE " . $this->table_name . " 
                  SET puan = puan - :miktar, guncelleme_tarihi = NOW() 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':miktar', $miktar);
        $stmt->bindParam(':id', $this->id);
        
        if ($stmt->execute()) {
            // Puan geçmişine kaydet
            $this->puanGecmisiEkle($this->id, 'kullanma', $miktar, $aciklama);
            return true;
        }
        
        return false;
    }
    
    /**
     * Bakiye geçmişi ekle
     */
    private function bakiyeGecmisiEkle($kullanici_id, $islem_tipi, $miktar, $aciklama) {
        // Bakiye geçmişi tablosu yoksa oluşturma gerekebilir
        // Şimdilik basit bir implementasyon
        $query = "INSERT INTO bakiye_gecmisi (kullanici_id, islem_tipi, miktar, aciklama, olusturma_tarihi)
                  VALUES (:kullanici_id, :islem_tipi, :miktar, :aciklama, NOW())";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':kullanici_id', $kullanici_id);
            $stmt->bindParam(':islem_tipi', $islem_tipi);
            $stmt->bindParam(':miktar', $miktar);
            $stmt->bindParam(':aciklama', $aciklama);
            $stmt->execute();
        } catch (Exception $e) {
            // Tablo yoksa sessizce atla
        }
    }
    
    /**
     * Puan geçmişi ekle
     */
    private function puanGecmisiEkle($kullanici_id, $islem_tipi, $miktar, $aciklama) {
        $query = "INSERT INTO puan_gecmisi (kullanici_id, islem_tipi, miktar, aciklama, olusturma_tarihi)
                  VALUES (:kullanici_id, :islem_tipi, :miktar, :aciklama, NOW())";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':kullanici_id', $kullanici_id);
            $stmt->bindParam(':islem_tipi', $islem_tipi);
            $stmt->bindParam(':miktar', $miktar);
            $stmt->bindParam(':aciklama', $aciklama);
            $stmt->execute();
        } catch (Exception $e) {
            // Tablo yoksa sessizce atla
        }
    }
    
    /**
     * Kullanıcı istatistikleri
     */
    public function istatistikleriGetir($kullanici_id = null) {
        $id = $kullanici_id ?? $this->id;
        
        // Toplam sipariş sayısı ve tutarı
        $query = "SELECT 
                    COUNT(*) as toplam_siparis,
                    SUM(CASE WHEN durum = 'teslim_edildi' THEN toplam_tutar ELSE 0 END) as toplam_harcama,
                    AVG(CASE WHEN durum = 'teslim_edildi' THEN toplam_tutar ELSE NULL END) as ortalama_sepet,
                    MAX(siparis_tarihi) as son_siparis_tarihi
                  FROM siparisler 
                  WHERE kullanici_id = :kullanici_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':kullanici_id', $id);
        $stmt->execute();
        
        $siparis_stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Kullanıcı bilgileri
        $kullanici_bilgi = $this->bilgileriGetir();
        
        return [
            'kullanici' => $kullanici_bilgi,
            'siparisler' => $siparis_stats
        ];
    }
    
    /**
     * Tüm kullanıcıları getir (Admin için)
     */
    public function tumKullanicilariGetir($filtreler = []) {
        $query = "SELECT k.*, 
                         COUNT(s.id) as siparis_sayisi,
                         SUM(s.toplam_tutar) as toplam_harcama
                  FROM " . $this->table_name . " k
                  LEFT JOIN siparisler s ON k.id = s.kullanici_id AND s.durum = 'teslim_edildi'
                  WHERE 1=1";
        
        // Filtreler
        if (!empty($filtreler['aktif'])) {
            $query .= " AND k.aktif = :aktif";
        }
        if (!empty($filtreler['eposta_onaylandi'])) {
            $query .= " AND k.eposta_onaylandi = :eposta_onaylandi";
        }
        if (!empty($filtreler['arama'])) {
            $query .= " AND (k.ad LIKE :arama OR k.soyad LIKE :arama OR k.eposta LIKE :arama)";
        }
        
        $query .= " GROUP BY k.id";
        
        // Sıralama
        $siralama = $filtreler['siralama'] ?? 'yeni';
        switch ($siralama) {
            case 'eski':
                $query .= " ORDER BY k.olusturma_tarihi ASC";
                break;
            case 'ad':
                $query .= " ORDER BY k.ad ASC";
                break;
            case 'harcama':
                $query .= " ORDER BY toplam_harcama DESC";
                break;
            default:
                $query .= " ORDER BY k.olusturma_tarihi DESC";
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
        if (!empty($filtreler['aktif'])) {
            $stmt->bindParam(':aktif', $filtreler['aktif']);
        }
        if (!empty($filtreler['eposta_onaylandi'])) {
            $stmt->bindParam(':eposta_onaylandi', $filtreler['eposta_onaylandi']);
        }
        if (!empty($filtreler['arama'])) {
            $arama = '%' . $filtreler['arama'] . '%';
            $stmt->bindParam(':arama', $arama);
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
     * Kullanıcı aktiflik durumunu değiştir
     */
    public function aktiflikDurumunu Degistir($kullanici_id, $aktif_durum) {
        $query = "UPDATE " . $this->table_name . " 
                  SET aktif = :aktif, guncelleme_tarihi = NOW() 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':aktif', $aktif_durum);
        $stmt->bindParam(':id', $kullanici_id);
        
        return $stmt->execute();
    }
}