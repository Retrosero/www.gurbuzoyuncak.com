<?php
/**
 * Ürün Sınıfı (XML Uyumlu Türkçe Şema)
 * Tüm XML alanları ve gelişmiş ürün işlemleri
 */

class Urun {
    private $conn;
    private $table_name = "urunler";
    
    // Temel ürün özellikleri
    public $id;
    public $urun_kodu;
    public $xml_urun_id;
    public $barkod;
    public $mpn;
    public $raf_no;
    
    // Ürün bilgileri
    public $urun_adi;
    public $alt_baslik;
    public $boyut_bilgisi;
    public $aciklama;
    public $kisa_aciklama;
    
    // Kategori bilgileri
    public $ana_kategori;
    public $ana_kategori_id_xml;
    public $kategori;
    public $kategori_id_xml;
    public $alt_kategori;
    public $alt_kategori_id_xml;
    public $kategori_id;
    
    // Fiyat ve stok
    public $fiyat;
    public $para_birimi;
    public $vergi;
    public $karsilastirma_fiyati;
    public $stok_miktari;
    
    // Marka ve menşei
    public $marka;
    public $marka_id;
    public $urun_mensei;
    
    // Görseller (9 resim)
    public $gorsel_1;
    public $gorsel_2;
    public $gorsel_3;
    public $gorsel_4;
    public $gorsel_5;
    public $gorsel_6;
    public $gorsel_7;
    public $gorsel_8;
    public $gorsel_9;
    public $ana_gorsel;
    
    // Ölçüler
    public $genislik;
    public $yukseklik;
    public $derinlik;
    public $desi;
    public $agirlik;
    
    // SEO
    public $seo_url;
    public $meta_baslik;
    public $meta_aciklama;
    public $anahtar_kelimeler;
    
    // Özellikler
    public $yeni_urun;
    public $vitrin_urunu;
    public $kampanyali;
    public $aktif;
    
    // XML import
    public $xml_categories;
    public $son_xml_import;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Tüm ürünleri getir (gelişmiş filtreleme ve sayfalama)
     */
    public function tumunuGetir($filtreler = []) {
        $query = "SELECT 
            u.*,
            k.kategori_adi,
            k.seo_url as kategori_seo_url,
            m.marka_adi,
            m.seo_url as marka_seo_url
        FROM " . $this->table_name . " u
        LEFT JOIN kategoriler k ON u.kategori_id = k.id
        LEFT JOIN markalar m ON u.marka_id = m.id
        WHERE u.aktif = 1";
        
        // Gelişmiş filtreler
        if (!empty($filtreler['kategori_id'])) {
            $query .= " AND u.kategori_id = :kategori_id";
        }
        if (!empty($filtreler['marka_id'])) {
            $query .= " AND u.marka_id = :marka_id";
        }
        if (!empty($filtreler['yeni_urun'])) {
            $query .= " AND u.yeni_urun = 1";
        }
        if (!empty($filtreler['vitrin_urunu'])) {
            $query .= " AND u.vitrin_urunu = 1";
        }
        if (!empty($filtreler['kampanyali'])) {
            $query .= " AND u.kampanyali = 1";
        }
        if (!empty($filtreler['arama'])) {
            $query .= " AND (u.urun_adi LIKE :arama OR u.urun_kodu LIKE :arama OR u.barkod LIKE :arama OR u.aciklama LIKE :arama)";
        }
        if (!empty($filtreler['min_fiyat'])) {
            $query .= " AND u.fiyat >= :min_fiyat";
        }
        if (!empty($filtreler['max_fiyat'])) {
            $query .= " AND u.fiyat <= :max_fiyat";
        }
        if (!empty($filtreler['xml_urun_id'])) {
            $query .= " AND u.xml_urun_id = :xml_urun_id";
        }
        if (!empty($filtreler['urun_kodu'])) {
            $query .= " AND u.urun_kodu = :urun_kodu";
        }
        if (!empty($filtreler['barkod'])) {
            $query .= " AND u.barkod = :barkod";
        }
        
        // Sıralama
        $siralama = $filtreler['siralama'] ?? 'yeni';
        switch ($siralama) {
            case 'fiyat_artan':
                $query .= " ORDER BY u.fiyat ASC";
                break;
            case 'fiyat_azalan':
                $query .= " ORDER BY u.fiyat DESC";
                break;
            case 'a-z':
                $query .= " ORDER BY u.urun_adi ASC";
                break;
            case 'z-a':
                $query .= " ORDER BY u.urun_adi DESC";
                break;
            case 'stok':
                $query .= " ORDER BY u.stok_miktari DESC";
                break;
            default:
                $query .= " ORDER BY u.olusturma_tarihi DESC";
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
        if (!empty($filtreler['kategori_id'])) {
            $stmt->bindParam(':kategori_id', $filtreler['kategori_id'], PDO::PARAM_INT);
        }
        if (!empty($filtreler['marka_id'])) {
            $stmt->bindParam(':marka_id', $filtreler['marka_id'], PDO::PARAM_INT);
        }
        if (!empty($filtreler['arama'])) {
            $arama = '%' . $filtreler['arama'] . '%';
            $stmt->bindParam(':arama', $arama);
        }
        if (!empty($filtreler['min_fiyat'])) {
            $stmt->bindParam(':min_fiyat', $filtreler['min_fiyat']);
        }
        if (!empty($filtreler['max_fiyat'])) {
            $stmt->bindParam(':max_fiyat', $filtreler['max_fiyat']);
        }
        if (!empty($filtreler['xml_urun_id'])) {
            $stmt->bindParam(':xml_urun_id', $filtreler['xml_urun_id']);
        }
        if (!empty($filtreler['urun_kodu'])) {
            $stmt->bindParam(':urun_kodu', $filtreler['urun_kodu']);
        }
        if (!empty($filtreler['barkod'])) {
            $stmt->bindParam(':barkod', $filtreler['barkod']);
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
     * Tek ürün getir (ID ile)
     */
    public function tekGetir() {
        $query = "SELECT 
            u.*,
            k.kategori_adi,
            k.seo_url as kategori_seo_url,
            m.marka_adi,
            m.seo_url as marka_seo_url
        FROM " . $this->table_name . " u
        LEFT JOIN kategoriler k ON u.kategori_id = k.id
        LEFT JOIN markalar m ON u.marka_id = m.id
        WHERE u.id = :id AND u.aktif = 1
        LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        $stmt->execute();
        
        $urun = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($urun) {
            // Görselleri ekle
            $urun['gorseller'] = $this->gorselleriGetir($urun['id']);
        }
        
        return $urun;
    }
    
    /**
     * SEO URL ile ürün getir
     */
    public function seoUrlIleGetir($seo_url) {
        $query = "SELECT 
            u.*,
            k.kategori_adi,
            k.seo_url as kategori_seo_url,
            m.marka_adi,
            m.seo_url as marka_seo_url
        FROM " . $this->table_name . " u
        LEFT JOIN kategoriler k ON u.kategori_id = k.id
        LEFT JOIN markalar m ON u.marka_id = m.id
        WHERE u.seo_url = :seo_url AND u.aktif = 1
        LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':seo_url', $seo_url);
        $stmt->execute();
        
        $urun = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($urun) {
            // Görselleri ekle
            $urun['gorseller'] = $this->gorselleriGetir($urun['id']);
            // Object properties'e ata
            $this->id = $urun['id'];
        }
        
        return $urun;
    }
    
    /**
     * Ürün kodu ile ürün getir (XML import için)
     */
    public function urunKoduIleGetir($urun_kodu) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE urun_kodu = :urun_kodu LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':urun_kodu', $urun_kodu);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Ürün görsellerini getir (9 resim desteği)
     */
    public function gorselleriGetir($urun_id = null) {
        $id = $urun_id ?? $this->id;
        
        $query = "SELECT gorsel_1, gorsel_2, gorsel_3, gorsel_4, gorsel_5, 
                         gorsel_6, gorsel_7, gorsel_8, gorsel_9, ana_gorsel 
                  FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $gorseller = [];
        
        if ($row) {
            // Ana görseli ilk sıraya koy
            if (!empty($row['ana_gorsel'])) {
                $gorseller[] = [
                    'url' => $row['ana_gorsel'],
                    'type' => 'ana',
                    'order' => 0
                ];
            }
            
            // Diğer görselleri ekle
            for ($i = 1; $i <= 9; $i++) {
                if (!empty($row['gorsel_' . $i])) {
                    $gorseller[] = [
                        'url' => $row['gorsel_' . $i],
                        'type' => 'gallery',
                        'order' => $i
                    ];
                }
            }
        }
        
        return $gorseller;
    }
    
    /**
     * Ürün ekle (Kapsamlı)
     */
    public function ekle() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET urun_kodu = :urun_kodu,
                      xml_urun_id = :xml_urun_id,
                      barkod = :barkod,
                      mpn = :mpn,
                      raf_no = :raf_no,
                      urun_adi = :urun_adi,
                      alt_baslik = :alt_baslik,
                      boyut_bilgisi = :boyut_bilgisi,
                      aciklama = :aciklama,
                      kisa_aciklama = :kisa_aciklama,
                      ana_kategori = :ana_kategori,
                      ana_kategori_id_xml = :ana_kategori_id_xml,
                      kategori = :kategori,
                      kategori_id_xml = :kategori_id_xml,
                      alt_kategori = :alt_kategori,
                      alt_kategori_id_xml = :alt_kategori_id_xml,
                      kategori_id = :kategori_id,
                      fiyat = :fiyat,
                      para_birimi = :para_birimi,
                      vergi = :vergi,
                      karsilastirma_fiyati = :karsilastirma_fiyati,
                      stok_miktari = :stok_miktari,
                      marka = :marka,
                      marka_id = :marka_id,
                      urun_mensei = :urun_mensei,
                      gorsel_1 = :gorsel_1,
                      gorsel_2 = :gorsel_2,
                      gorsel_3 = :gorsel_3,
                      gorsel_4 = :gorsel_4,
                      gorsel_5 = :gorsel_5,
                      gorsel_6 = :gorsel_6,
                      gorsel_7 = :gorsel_7,
                      gorsel_8 = :gorsel_8,
                      gorsel_9 = :gorsel_9,
                      ana_gorsel = :ana_gorsel,
                      genislik = :genislik,
                      yukseklik = :yukseklik,
                      derinlik = :derinlik,
                      desi = :desi,
                      agirlik = :agirlik,
                      seo_url = :seo_url,
                      meta_baslik = :meta_baslik,
                      meta_aciklama = :meta_aciklama,
                      anahtar_kelimeler = :anahtar_kelimeler,
                      yeni_urun = :yeni_urun,
                      vitrin_urunu = :vitrin_urunu,
                      kampanyali = :kampanyali,
                      aktif = :aktif,
                      xml_categories = :xml_categories,
                      son_xml_import = :son_xml_import";
        
        $stmt = $this->conn->prepare($query);
        
        // SEO URL oluştur eğer boşsa
        if (empty($this->seo_url) && !empty($this->urun_adi)) {
            $this->seo_url = $this->seoUrlOlustur($this->urun_adi);
        }
        
        // Meta başlık oluştur eğer boşsa
        if (empty($this->meta_baslik) && !empty($this->urun_adi)) {
            $this->meta_baslik = htmlspecialchars(strip_tags($this->urun_adi));
        }
        
        // Temizle
        $this->urun_kodu = htmlspecialchars(strip_tags($this->urun_kodu ?? ''));
        $this->urun_adi = htmlspecialchars(strip_tags($this->urun_adi ?? ''));
        $this->alt_baslik = htmlspecialchars(strip_tags($this->alt_baslik ?? ''));
        
        // Bind all parameters
        $stmt->bindParam(':urun_kodu', $this->urun_kodu);
        $stmt->bindParam(':xml_urun_id', $this->xml_urun_id);
        $stmt->bindParam(':barkod', $this->barkod);
        $stmt->bindParam(':mpn', $this->mpn);
        $stmt->bindParam(':raf_no', $this->raf_no);
        $stmt->bindParam(':urun_adi', $this->urun_adi);
        $stmt->bindParam(':alt_baslik', $this->alt_baslik);
        $stmt->bindParam(':boyut_bilgisi', $this->boyut_bilgisi);
        $stmt->bindParam(':aciklama', $this->aciklama);
        $stmt->bindParam(':kisa_aciklama', $this->kisa_aciklama);
        $stmt->bindParam(':ana_kategori', $this->ana_kategori);
        $stmt->bindParam(':ana_kategori_id_xml', $this->ana_kategori_id_xml);
        $stmt->bindParam(':kategori', $this->kategori);
        $stmt->bindParam(':kategori_id_xml', $this->kategori_id_xml);
        $stmt->bindParam(':alt_kategori', $this->alt_kategori);
        $stmt->bindParam(':alt_kategori_id_xml', $this->alt_kategori_id_xml);
        $stmt->bindParam(':kategori_id', $this->kategori_id);
        $stmt->bindParam(':fiyat', $this->fiyat);
        $stmt->bindParam(':para_birimi', $this->para_birimi);
        $stmt->bindParam(':vergi', $this->vergi);
        $stmt->bindParam(':karsilastirma_fiyati', $this->karsilastirma_fiyati);
        $stmt->bindParam(':stok_miktari', $this->stok_miktari);
        $stmt->bindParam(':marka', $this->marka);
        $stmt->bindParam(':marka_id', $this->marka_id);
        $stmt->bindParam(':urun_mensei', $this->urun_mensei);
        $stmt->bindParam(':gorsel_1', $this->gorsel_1);
        $stmt->bindParam(':gorsel_2', $this->gorsel_2);
        $stmt->bindParam(':gorsel_3', $this->gorsel_3);
        $stmt->bindParam(':gorsel_4', $this->gorsel_4);
        $stmt->bindParam(':gorsel_5', $this->gorsel_5);
        $stmt->bindParam(':gorsel_6', $this->gorsel_6);
        $stmt->bindParam(':gorsel_7', $this->gorsel_7);
        $stmt->bindParam(':gorsel_8', $this->gorsel_8);
        $stmt->bindParam(':gorsel_9', $this->gorsel_9);
        $stmt->bindParam(':ana_gorsel', $this->ana_gorsel);
        $stmt->bindParam(':genislik', $this->genislik);
        $stmt->bindParam(':yukseklik', $this->yukseklik);
        $stmt->bindParam(':derinlik', $this->derinlik);
        $stmt->bindParam(':desi', $this->desi);
        $stmt->bindParam(':agirlik', $this->agirlik);
        $stmt->bindParam(':seo_url', $this->seo_url);
        $stmt->bindParam(':meta_baslik', $this->meta_baslik);
        $stmt->bindParam(':meta_aciklama', $this->meta_aciklama);
        $stmt->bindParam(':anahtar_kelimeler', $this->anahtar_kelimeler);
        $stmt->bindParam(':yeni_urun', $this->yeni_urun);
        $stmt->bindParam(':vitrin_urunu', $this->vitrin_urunu);
        $stmt->bindParam(':kampanyali', $this->kampanyali);
        $stmt->bindParam(':aktif', $this->aktif);
        $stmt->bindParam(':xml_categories', $this->xml_categories);
        $stmt->bindParam(':son_xml_import', $this->son_xml_import);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Ürün güncelle (Kapsamlı)
     */
    public function guncelle() {
        $query = "UPDATE " . $this->table_name . " 
                  SET urun_adi = :urun_adi,
                      alt_baslik = :alt_baslik,
                      boyut_bilgisi = :boyut_bilgisi,
                      aciklama = :aciklama,
                      kisa_aciklama = :kisa_aciklama,
                      kategori_id = :kategori_id,
                      fiyat = :fiyat,
                      karsilastirma_fiyati = :karsilastirma_fiyati,
                      stok_miktari = :stok_miktari,
                      marka_id = :marka_id,
                      genislik = :genislik,
                      yukseklik = :yukseklik,
                      derinlik = :derinlik,
                      desi = :desi,
                      agirlik = :agirlik,
                      meta_baslik = :meta_baslik,
                      meta_aciklama = :meta_aciklama,
                      anahtar_kelimeler = :anahtar_kelimeler,
                      yeni_urun = :yeni_urun,
                      vitrin_urunu = :vitrin_urunu,
                      kampanyali = :kampanyali,
                      aktif = :aktif
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Temizle
        $this->urun_adi = htmlspecialchars(strip_tags($this->urun_adi ?? ''));
        $this->alt_baslik = htmlspecialchars(strip_tags($this->alt_baslik ?? ''));
        $this->id = intval($this->id);
        
        $stmt->bindParam(':urun_adi', $this->urun_adi);
        $stmt->bindParam(':alt_baslik', $this->alt_baslik);
        $stmt->bindParam(':boyut_bilgisi', $this->boyut_bilgisi);
        $stmt->bindParam(':aciklama', $this->aciklama);
        $stmt->bindParam(':kisa_aciklama', $this->kisa_aciklama);
        $stmt->bindParam(':kategori_id', $this->kategori_id);
        $stmt->bindParam(':fiyat', $this->fiyat);
        $stmt->bindParam(':karsilastirma_fiyati', $this->karsilastirma_fiyati);
        $stmt->bindParam(':stok_miktari', $this->stok_miktari);
        $stmt->bindParam(':marka_id', $this->marka_id);
        $stmt->bindParam(':genislik', $this->genislik);
        $stmt->bindParam(':yukseklik', $this->yukseklik);
        $stmt->bindParam(':derinlik', $this->derinlik);
        $stmt->bindParam(':desi', $this->desi);
        $stmt->bindParam(':agirlik', $this->agirlik);
        $stmt->bindParam(':meta_baslik', $this->meta_baslik);
        $stmt->bindParam(':meta_aciklama', $this->meta_aciklama);
        $stmt->bindParam(':anahtar_kelimeler', $this->anahtar_kelimeler);
        $stmt->bindParam(':yeni_urun', $this->yeni_urun);
        $stmt->bindParam(':vitrin_urunu', $this->vitrin_urunu);
        $stmt->bindParam(':kampanyali', $this->kampanyali);
        $stmt->bindParam(':aktif', $this->aktif);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * XML ile ürün güncelle (Import için özel)
     */
    public function xmlIleGuncelle() {
        $query = "UPDATE " . $this->table_name . " 
                  SET xml_urun_id = :xml_urun_id,
                      barkod = :barkod,
                      mpn = :mpn,
                      raf_no = :raf_no,
                      urun_adi = :urun_adi,
                      alt_baslik = :alt_baslik,
                      boyut_bilgisi = :boyut_bilgisi,
                      ana_kategori = :ana_kategori,
                      ana_kategori_id_xml = :ana_kategori_id_xml,
                      kategori = :kategori,
                      kategori_id_xml = :kategori_id_xml,
                      alt_kategori = :alt_kategori,
                      alt_kategori_id_xml = :alt_kategori_id_xml,
                      fiyat = :fiyat,
                      para_birimi = :para_birimi,
                      vergi = :vergi,
                      stok_miktari = :stok_miktari,
                      marka = :marka,
                      urun_mensei = :urun_mensei,
                      gorsel_1 = :gorsel_1,
                      gorsel_2 = :gorsel_2,
                      gorsel_3 = :gorsel_3,
                      gorsel_4 = :gorsel_4,
                      gorsel_5 = :gorsel_5,
                      gorsel_6 = :gorsel_6,
                      gorsel_7 = :gorsel_7,
                      gorsel_8 = :gorsel_8,
                      gorsel_9 = :gorsel_9,
                      genislik = :genislik,
                      yukseklik = :yukseklik,
                      derinlik = :derinlik,
                      desi = :desi,
                      agirlik = :agirlik,
                      xml_categories = :xml_categories,
                      son_xml_import = NOW()
                  WHERE urun_kodu = :urun_kodu";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        $stmt->bindParam(':xml_urun_id', $this->xml_urun_id);
        $stmt->bindParam(':barkod', $this->barkod);
        $stmt->bindParam(':mpn', $this->mpn);
        $stmt->bindParam(':raf_no', $this->raf_no);
        $stmt->bindParam(':urun_adi', $this->urun_adi);
        $stmt->bindParam(':alt_baslik', $this->alt_baslik);
        $stmt->bindParam(':boyut_bilgisi', $this->boyut_bilgisi);
        $stmt->bindParam(':ana_kategori', $this->ana_kategori);
        $stmt->bindParam(':ana_kategori_id_xml', $this->ana_kategori_id_xml);
        $stmt->bindParam(':kategori', $this->kategori);
        $stmt->bindParam(':kategori_id_xml', $this->kategori_id_xml);
        $stmt->bindParam(':alt_kategori', $this->alt_kategori);
        $stmt->bindParam(':alt_kategori_id_xml', $this->alt_kategori_id_xml);
        $stmt->bindParam(':fiyat', $this->fiyat);
        $stmt->bindParam(':para_birimi', $this->para_birimi);
        $stmt->bindParam(':vergi', $this->vergi);
        $stmt->bindParam(':stok_miktari', $this->stok_miktari);
        $stmt->bindParam(':marka', $this->marka);
        $stmt->bindParam(':urun_mensei', $this->urun_mensei);
        $stmt->bindParam(':gorsel_1', $this->gorsel_1);
        $stmt->bindParam(':gorsel_2', $this->gorsel_2);
        $stmt->bindParam(':gorsel_3', $this->gorsel_3);
        $stmt->bindParam(':gorsel_4', $this->gorsel_4);
        $stmt->bindParam(':gorsel_5', $this->gorsel_5);
        $stmt->bindParam(':gorsel_6', $this->gorsel_6);
        $stmt->bindParam(':gorsel_7', $this->gorsel_7);
        $stmt->bindParam(':gorsel_8', $this->gorsel_8);
        $stmt->bindParam(':gorsel_9', $this->gorsel_9);
        $stmt->bindParam(':genislik', $this->genislik);
        $stmt->bindParam(':yukseklik', $this->yukseklik);
        $stmt->bindParam(':derinlik', $this->derinlik);
        $stmt->bindParam(':desi', $this->desi);
        $stmt->bindParam(':agirlik', $this->agirlik);
        $stmt->bindParam(':xml_categories', $this->xml_categories);
        $stmt->bindParam(':urun_kodu', $this->urun_kodu);
        
        return $stmt->execute();
    }
    
    /**
     * Ürün sil
     */
    public function sil() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Soft delete (aktif durumunu 0 yap)
     */
    public function pasifYap() {
        $query = "UPDATE " . $this->table_name . " SET aktif = 0 WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Stok güncelle
     */
    public function stokGuncelle($miktar) {
        $query = "UPDATE " . $this->table_name . " 
                  SET stok_miktari = stok_miktari + :miktar
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':miktar', $miktar, PDO::PARAM_INT);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }
    
    /**
     * Benzer ürünleri getir
     */
    public function benzerleriGetir($limit = 8) {
        $query = "SELECT u.*, m.marka_adi FROM " . $this->table_name . " u
                  LEFT JOIN markalar m ON u.marka_id = m.id
                  WHERE u.kategori_id = :kategori_id 
                  AND u.id != :id 
                  AND u.aktif = 1
                  AND u.stok_miktari > 0
                  ORDER BY RAND()
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':kategori_id', $this->kategori_id, PDO::PARAM_INT);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Toplam ürün sayısı (sayfalama için)
     */
    public function toplamSayi($filtreler = []) {
        $query = "SELECT COUNT(*) as toplam FROM " . $this->table_name . " u WHERE u.aktif = 1";
        
        // Filtreler
        if (!empty($filtreler['kategori_id'])) {
            $query .= " AND u.kategori_id = :kategori_id";
        }
        if (!empty($filtreler['marka_id'])) {
            $query .= " AND u.marka_id = :marka_id";
        }
        if (!empty($filtreler['yeni_urun'])) {
            $query .= " AND u.yeni_urun = 1";
        }
        if (!empty($filtreler['vitrin_urunu'])) {
            $query .= " AND u.vitrin_urunu = 1";
        }
        if (!empty($filtreler['kampanyali'])) {
            $query .= " AND u.kampanyali = 1";
        }
        if (!empty($filtreler['arama'])) {
            $query .= " AND (u.urun_adi LIKE :arama OR u.urun_kodu LIKE :arama OR u.barkod LIKE :arama)";
        }
        if (!empty($filtreler['min_fiyat'])) {
            $query .= " AND u.fiyat >= :min_fiyat";
        }
        if (!empty($filtreler['max_fiyat'])) {
            $query .= " AND u.fiyat <= :max_fiyat";
        }
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parametreler
        if (!empty($filtreler['kategori_id'])) {
            $stmt->bindParam(':kategori_id', $filtreler['kategori_id'], PDO::PARAM_INT);
        }
        if (!empty($filtreler['marka_id'])) {
            $stmt->bindParam(':marka_id', $filtreler['marka_id'], PDO::PARAM_INT);
        }
        if (!empty($filtreler['arama'])) {
            $arama = '%' . $filtreler['arama'] . '%';
            $stmt->bindParam(':arama', $arama);
        }
        if (!empty($filtreler['min_fiyat'])) {
            $stmt->bindParam(':min_fiyat', $filtreler['min_fiyat']);
        }
        if (!empty($filtreler['max_fiyat'])) {
            $stmt->bindParam(':max_fiyat', $filtreler['max_fiyat']);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['toplam'];
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
     * En çok satan ürünleri getir
     */
    public function enCokSatanlar($limit = 10) {
        $query = "SELECT u.*, m.marka_adi, k.kategori_adi,
                         COUNT(sk.id) as satis_adedi
                  FROM " . $this->table_name . " u
                  LEFT JOIN markalar m ON u.marka_id = m.id
                  LEFT JOIN kategoriler k ON u.kategori_id = k.id
                  LEFT JOIN siparis_kalemleri sk ON u.id = sk.urun_id
                  LEFT JOIN siparisler s ON sk.siparis_id = s.id
                  WHERE u.aktif = 1 
                  AND s.durum IN ('tamamlandi', 'kargolandi')
                  AND s.olusturma_tarihi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                  GROUP BY u.id
                  ORDER BY satis_adedi DESC
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Düşük stoklu ürünleri getir
     */
    public function dusukStoklu($minimum_stok = 5) {
        $query = "SELECT u.*, m.marka_adi, k.kategori_adi
                  FROM " . $this->table_name . " u
                  LEFT JOIN markalar m ON u.marka_id = m.id
                  LEFT JOIN kategoriler k ON u.kategori_id = k.id
                  WHERE u.aktif = 1 
                  AND u.stok_miktari <= :minimum_stok
                  ORDER BY u.stok_miktari ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':minimum_stok', $minimum_stok, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Son eklenen ürünleri getir
     */
    public function sonEklenenler($limit = 20) {
        $query = "SELECT u.*, m.marka_adi, k.kategori_adi
                  FROM " . $this->table_name . " u
                  LEFT JOIN markalar m ON u.marka_id = m.id
                  LEFT JOIN kategoriler k ON u.kategori_id = k.id
                  WHERE u.aktif = 1
                  ORDER BY u.olusturma_tarihi DESC
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Stats - Toplam ürün sayısı
     */
    public function getTotalCount($filtreler = []) {
        $query = "SELECT COUNT(*) FROM " . $this->table_name;
        $where = [];
        $params = [];
        
        if (!empty($filtreler['aktif'])) {
            $where[] = "aktif = :aktif";
            $params[':aktif'] = $filtreler['aktif'];
        }
        
        if (!empty($filtreler['kategori_id'])) {
            $where[] = "kategori_id = :kategori_id";
            $params[':kategori_id'] = $filtreler['kategori_id'];
        }
        
        if (!empty($filtreler['arama'])) {
            $where[] = "(urun_adi LIKE :arama OR urun_kodu LIKE :arama OR barkod LIKE :arama)";
            $params[':arama'] = '%' . $filtreler['arama'] . '%';
        }
        
        if (!empty($filtreler['stok_filtre'])) {
            if ($filtreler['stok_filtre'] === 'low') {
                $where[] = "stok_miktari <= 5";
            } elseif ($filtreler['stok_filtre'] === 'out') {
                $where[] = "stok_miktari = 0";
            }
        }
        
        if (!empty($where)) {
            $query .= " WHERE " . implode(" AND ", $where);
        }
        
        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }
    
    /**
     * Stats - Aktif ürün sayısı
     */
    public function getActiveCount() {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE aktif = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }
    
    /**
     * Stats - Düşük stoklu ürün sayısı
     */
    public function getLowStockCount() {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE aktif = 1 AND stok_miktari <= 5";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }
    
    /**
     * Stats - Yeni ürün sayısı (son 30 gün)
     */
    public function getNewProductsCount() {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " 
                  WHERE aktif = 1 AND olusturma_tarihi >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }
}