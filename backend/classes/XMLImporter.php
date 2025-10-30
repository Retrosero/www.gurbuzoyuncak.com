<?php
/**
 * XML Import Sınıfı
 * XML feed'den ürün import işlemlerini yönetir
 * Gürbüz Oyuncak E-Ticaret Sistemi
 */

class XMLImporter {
    private $conn;
    private $import_id;
    private $toplam_kayit = 0;
    private $basarili_kayit = 0;
    private $hatali_kayit = 0;
    private $hata_log = [];
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * XML dosyasını import et
     */
    public function importXML($xml_source, $source_type = 'file') {
        try {
            // Import kaydı oluştur
            $this->createImportRecord($xml_source);
            
            // XML'i yükle
            $xml = $this->loadXML($xml_source, $source_type);
            
            if (!$xml) {
                throw new Exception('XML yüklenemedi');
            }
            
            // Ürünleri işle
            $this->processProducts($xml);
            
            // Import kaydını güncelle
            $this->finalizeImport('tamamlandi');
            
            return [
                'success' => true,
                'import_id' => $this->import_id,
                'toplam' => $this->toplam_kayit,
                'basarili' => $this->basarili_kayit,
                'hatali' => $this->hatali_kayit,
                'hatalar' => $this->hata_log
            ];
            
        } catch (Exception $e) {
            $this->finalizeImport('basarisiz', $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * XML'i yükle
     */
    private function loadXML($source, $type) {
        libxml_use_internal_errors(true);
        
        try {
            if ($type === 'url') {
                $xml_content = @file_get_contents($source);
                if ($xml_content === false) {
                    throw new Exception('XML URL\'den indirilemedi');
                }
                $xml = simplexml_load_string($xml_content);
            } else {
                $xml = simplexml_load_file($source);
            }
            
            if ($xml === false) {
                $errors = libxml_get_errors();
                $error_messages = [];
                foreach ($errors as $error) {
                    $error_messages[] = $error->message;
                }
                throw new Exception('XML parse hatası: ' . implode(', ', $error_messages));
            }
            
            return $xml;
            
        } catch (Exception $e) {
            throw $e;
        }
    }
    
    /**
     * Ürünleri işle
     */
    private function processProducts($xml) {
        // XML yapısına göre ürünleri bul
        $products = $xml->xpath('//Product') ?: $xml->xpath('//product');
        
        if (empty($products)) {
            throw new Exception('XML\'de ürün bulunamadı');
        }
        
        $this->toplam_kayit = count($products);
        $this->updateImportProgress();
        
        foreach ($products as $product) {
            try {
                $this->importProduct($product);
                $this->basarili_kayit++;
            } catch (Exception $e) {
                $this->hatali_kayit++;
                $this->hata_log[] = [
                    'urun_kodu' => (string)$product->Product_code,
                    'hata' => $e->getMessage()
                ];
            }
            
            // Her 10 üründe bir progress güncelle
            if (($this->basarili_kayit + $this->hatali_kayit) % 10 == 0) {
                $this->updateImportProgress();
            }
        }
    }
    
    /**
     * Tek bir ürünü import et
     */
    private function importProduct($product) {
        // XML'den verileri çek
        $data = $this->extractProductData($product);
        
        // Kategori ve marka oluştur/bul
        $kategori_id = $this->getOrCreateCategory($data);
        $marka_id = $this->getOrCreateBrand($data['marka']);
        
        // SEO URL oluştur
        $seo_url = $this->createSeoUrl($data['urun_adi'], $data['urun_kodu']);
        
        // Görselleri indir ve kaydet
        $gorsel_urls = $this->downloadImages($data['gorseller'], $data['urun_kodu']);
        
        // Ürün var mı kontrol et
        $existing_id = $this->checkExistingProduct($data['urun_kodu']);
        
        if ($existing_id) {
            // Güncelle
            $this->updateProduct($existing_id, $data, $kategori_id, $marka_id, $seo_url, $gorsel_urls);
        } else {
            // Yeni ekle
            $this->insertProduct($data, $kategori_id, $marka_id, $seo_url, $gorsel_urls);
        }
    }
    
    /**
     * XML'den ürün verilerini çıkar
     */
    private function extractProductData($product) {
        return [
            'urun_kodu' => (string)$product->Product_code,
            'xml_urun_id' => (string)$product->Product_id,
            'barkod' => (string)$product->Barcode,
            'mpn' => (string)$product->mpn,
            'raf_no' => (string)$product->rafno,
            'urun_adi' => (string)$product->Name,
            'alt_baslik' => (string)$product->alt_baslik,
            'boyut_bilgisi' => (string)$product->alt_baslik2,
            'ana_kategori' => (string)$product->mainCategory,
            'ana_kategori_id_xml' => (string)$product->mainCategory_id,
            'kategori' => (string)$product->category,
            'kategori_id_xml' => (string)$product->category_id,
            'alt_kategori' => (string)$product->subCategory,
            'alt_kategori_id_xml' => (string)$product->subCategory_id,
            'fiyat' => (float)$product->Price,
            'para_birimi' => (string)$product->CurrencyType ?: 'TRY',
            'vergi' => (float)$product->Tax ?: 18.00,
            'stok_miktari' => (int)$product->Stock,
            'marka' => (string)$product->Brand,
            'urun_mensei' => (string)$product->urun_mensei,
            'genislik' => (float)$product->width,
            'yukseklik' => (float)$product->height,
            'derinlik' => (float)$product->depth,
            'desi' => (float)$product->desi,
            'agirlik' => (float)$product->agirlik,
            'xml_categories' => (string)$product->categories,
            'gorseller' => [
                (string)$product->Image1,
                (string)$product->Image2,
                (string)$product->Image3,
                (string)$product->Image4,
                (string)$product->Image5,
                (string)$product->Image6,
                (string)$product->Image7,
                (string)$product->Image8,
                (string)$product->Image9
            ]
        ];
    }
    
    /**
     * Kategori oluştur veya bul
     */
    private function getOrCreateCategory($data) {
        $kategori_adi = $data['alt_kategori'] ?: $data['kategori'] ?: $data['ana_kategori'];
        $xml_kategori_id = $data['alt_kategori_id_xml'] ?: $data['kategori_id_xml'] ?: $data['ana_kategori_id_xml'];
        
        if (empty($kategori_adi)) {
            return null;
        }
        
        // XML kategori ID ile ara
        if ($xml_kategori_id) {
            $query = "SELECT id FROM kategoriler WHERE xml_kategori_id = :xml_id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':xml_id', $xml_kategori_id);
            $stmt->execute();
            
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                return $row['id'];
            }
        }
        
        // Kategori adı ile ara
        $query = "SELECT id FROM kategoriler WHERE kategori_adi = :ad LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ad', $kategori_adi);
        $stmt->execute();
        
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            return $row['id'];
        }
        
        // Yeni kategori oluştur
        $seo_url = $this->createSeoUrl($kategori_adi);
        
        $query = "INSERT INTO kategoriler (kategori_adi, xml_kategori_id, seo_url) 
                  VALUES (:ad, :xml_id, :seo_url)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ad', $kategori_adi);
        $stmt->bindParam(':xml_id', $xml_kategori_id);
        $stmt->bindParam(':seo_url', $seo_url);
        $stmt->execute();
        
        return $this->conn->lastInsertId();
    }
    
    /**
     * Marka oluştur veya bul
     */
    private function getOrCreateBrand($marka_adi) {
        if (empty($marka_adi)) {
            return null;
        }
        
        $query = "SELECT id FROM markalar WHERE marka_adi = :ad LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ad', $marka_adi);
        $stmt->execute();
        
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            return $row['id'];
        }
        
        // Yeni marka oluştur
        $seo_url = $this->createSeoUrl($marka_adi);
        
        $query = "INSERT INTO markalar (marka_adi, seo_url) VALUES (:ad, :seo_url)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ad', $marka_adi);
        $stmt->bindParam(':seo_url', $seo_url);
        $stmt->execute();
        
        return $this->conn->lastInsertId();
    }
    
    /**
     * Görselleri indir ve kaydet
     */
    private function downloadImages($image_urls, $urun_kodu) {
        $saved_urls = [];
        $upload_dir = '../public/images/products/';
        
        // Klasör yoksa oluştur
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        foreach ($image_urls as $index => $url) {
            if (empty($url)) {
                $saved_urls[] = null;
                continue;
            }
            
            try {
                // Resmi indir
                $image_data = @file_get_contents($url);
                
                if ($image_data === false) {
                    $saved_urls[] = null;
                    continue;
                }
                
                // Dosya uzantısını al
                $extension = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION);
                if (empty($extension)) {
                    $extension = 'jpg';
                }
                
                // Yeni dosya adı oluştur
                $new_filename = $urun_kodu . '_' . ($index + 1) . '.' . $extension;
                $new_filepath = $upload_dir . $new_filename;
                
                // Kaydet
                if (file_put_contents($new_filepath, $image_data)) {
                    $saved_urls[] = '/public/images/products/' . $new_filename;
                } else {
                    $saved_urls[] = null;
                }
                
            } catch (Exception $e) {
                $saved_urls[] = null;
            }
        }
        
        return $saved_urls;
    }
    
    /**
     * Mevcut ürünü kontrol et
     */
    private function checkExistingProduct($urun_kodu) {
        $query = "SELECT id FROM urunler WHERE urun_kodu = :kod LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':kod', $urun_kodu);
        $stmt->execute();
        
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            return $row['id'];
        }
        
        return null;
    }
    
    /**
     * Ürün ekle
     */
    private function insertProduct($data, $kategori_id, $marka_id, $seo_url, $gorsel_urls) {
        $query = "INSERT INTO urunler (
            urun_kodu, xml_urun_id, barkod, mpn, raf_no,
            urun_adi, alt_baslik, boyut_bilgisi,
            ana_kategori, ana_kategori_id_xml, kategori, kategori_id_xml,
            alt_kategori, alt_kategori_id_xml, kategori_id,
            fiyat, para_birimi, vergi, stok_miktari,
            marka, marka_id, urun_mensei,
            gorsel_1, gorsel_2, gorsel_3, gorsel_4, gorsel_5,
            gorsel_6, gorsel_7, gorsel_8, gorsel_9, ana_gorsel,
            genislik, yukseklik, derinlik, desi, agirlik,
            seo_url, xml_categories, son_xml_import, aktif
        ) VALUES (
            :urun_kodu, :xml_urun_id, :barkod, :mpn, :raf_no,
            :urun_adi, :alt_baslik, :boyut_bilgisi,
            :ana_kategori, :ana_kategori_id_xml, :kategori, :kategori_id_xml,
            :alt_kategori, :alt_kategori_id_xml, :kategori_id,
            :fiyat, :para_birimi, :vergi, :stok_miktari,
            :marka, :marka_id, :urun_mensei,
            :gorsel_1, :gorsel_2, :gorsel_3, :gorsel_4, :gorsel_5,
            :gorsel_6, :gorsel_7, :gorsel_8, :gorsel_9, :ana_gorsel,
            :genislik, :yukseklik, :derinlik, :desi, :agirlik,
            :seo_url, :xml_categories, NOW(), 1
        )";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parametreler
        $stmt->bindParam(':urun_kodu', $data['urun_kodu']);
        $stmt->bindParam(':xml_urun_id', $data['xml_urun_id']);
        $stmt->bindParam(':barkod', $data['barkod']);
        $stmt->bindParam(':mpn', $data['mpn']);
        $stmt->bindParam(':raf_no', $data['raf_no']);
        $stmt->bindParam(':urun_adi', $data['urun_adi']);
        $stmt->bindParam(':alt_baslik', $data['alt_baslik']);
        $stmt->bindParam(':boyut_bilgisi', $data['boyut_bilgisi']);
        $stmt->bindParam(':ana_kategori', $data['ana_kategori']);
        $stmt->bindParam(':ana_kategori_id_xml', $data['ana_kategori_id_xml']);
        $stmt->bindParam(':kategori', $data['kategori']);
        $stmt->bindParam(':kategori_id_xml', $data['kategori_id_xml']);
        $stmt->bindParam(':alt_kategori', $data['alt_kategori']);
        $stmt->bindParam(':alt_kategori_id_xml', $data['alt_kategori_id_xml']);
        $stmt->bindParam(':kategori_id', $kategori_id);
        $stmt->bindParam(':fiyat', $data['fiyat']);
        $stmt->bindParam(':para_birimi', $data['para_birimi']);
        $stmt->bindParam(':vergi', $data['vergi']);
        $stmt->bindParam(':stok_miktari', $data['stok_miktari']);
        $stmt->bindParam(':marka', $data['marka']);
        $stmt->bindParam(':marka_id', $marka_id);
        $stmt->bindParam(':urun_mensei', $data['urun_mensei']);
        
        // Görseller
        for ($i = 0; $i < 9; $i++) {
            $gorsel_param = ':gorsel_' . ($i + 1);
            $gorsel_value = $gorsel_urls[$i] ?? null;
            $stmt->bindParam($gorsel_param, $gorsel_value);
        }
        $ana_gorsel = $gorsel_urls[0] ?? null;
        $stmt->bindParam(':ana_gorsel', $ana_gorsel);
        
        // Ölçüler
        $stmt->bindParam(':genislik', $data['genislik']);
        $stmt->bindParam(':yukseklik', $data['yukseklik']);
        $stmt->bindParam(':derinlik', $data['derinlik']);
        $stmt->bindParam(':desi', $data['desi']);
        $stmt->bindParam(':agirlik', $data['agirlik']);
        
        $stmt->bindParam(':seo_url', $seo_url);
        $stmt->bindParam(':xml_categories', $data['xml_categories']);
        
        return $stmt->execute();
    }
    
    /**
     * Ürün güncelle
     */
    private function updateProduct($id, $data, $kategori_id, $marka_id, $seo_url, $gorsel_urls) {
        $query = "UPDATE urunler SET
            xml_urun_id = :xml_urun_id, barkod = :barkod, mpn = :mpn, raf_no = :raf_no,
            urun_adi = :urun_adi, alt_baslik = :alt_baslik, boyut_bilgisi = :boyut_bilgisi,
            ana_kategori = :ana_kategori, ana_kategori_id_xml = :ana_kategori_id_xml,
            kategori = :kategori, kategori_id_xml = :kategori_id_xml,
            alt_kategori = :alt_kategori, alt_kategori_id_xml = :alt_kategori_id_xml,
            kategori_id = :kategori_id,
            fiyat = :fiyat, para_birimi = :para_birimi, vergi = :vergi, stok_miktari = :stok_miktari,
            marka = :marka, marka_id = :marka_id, urun_mensei = :urun_mensei,
            gorsel_1 = :gorsel_1, gorsel_2 = :gorsel_2, gorsel_3 = :gorsel_3,
            gorsel_4 = :gorsel_4, gorsel_5 = :gorsel_5, gorsel_6 = :gorsel_6,
            gorsel_7 = :gorsel_7, gorsel_8 = :gorsel_8, gorsel_9 = :gorsel_9,
            ana_gorsel = :ana_gorsel,
            genislik = :genislik, yukseklik = :yukseklik, derinlik = :derinlik,
            desi = :desi, agirlik = :agirlik,
            seo_url = :seo_url, xml_categories = :xml_categories, son_xml_import = NOW()
        WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':xml_urun_id', $data['xml_urun_id']);
        $stmt->bindParam(':barkod', $data['barkod']);
        $stmt->bindParam(':mpn', $data['mpn']);
        $stmt->bindParam(':raf_no', $data['raf_no']);
        $stmt->bindParam(':urun_adi', $data['urun_adi']);
        $stmt->bindParam(':alt_baslik', $data['alt_baslik']);
        $stmt->bindParam(':boyut_bilgisi', $data['boyut_bilgisi']);
        $stmt->bindParam(':ana_kategori', $data['ana_kategori']);
        $stmt->bindParam(':ana_kategori_id_xml', $data['ana_kategori_id_xml']);
        $stmt->bindParam(':kategori', $data['kategori']);
        $stmt->bindParam(':kategori_id_xml', $data['kategori_id_xml']);
        $stmt->bindParam(':alt_kategori', $data['alt_kategori']);
        $stmt->bindParam(':alt_kategori_id_xml', $data['alt_kategori_id_xml']);
        $stmt->bindParam(':kategori_id', $kategori_id);
        $stmt->bindParam(':fiyat', $data['fiyat']);
        $stmt->bindParam(':para_birimi', $data['para_birimi']);
        $stmt->bindParam(':vergi', $data['vergi']);
        $stmt->bindParam(':stok_miktari', $data['stok_miktari']);
        $stmt->bindParam(':marka', $data['marka']);
        $stmt->bindParam(':marka_id', $marka_id);
        $stmt->bindParam(':urun_mensei', $data['urun_mensei']);
        
        // Görseller
        for ($i = 0; $i < 9; $i++) {
            $gorsel_param = ':gorsel_' . ($i + 1);
            $gorsel_value = $gorsel_urls[$i] ?? null;
            $stmt->bindParam($gorsel_param, $gorsel_value);
        }
        $ana_gorsel = $gorsel_urls[0] ?? null;
        $stmt->bindParam(':ana_gorsel', $ana_gorsel);
        
        $stmt->bindParam(':genislik', $data['genislik']);
        $stmt->bindParam(':yukseklik', $data['yukseklik']);
        $stmt->bindParam(':derinlik', $data['derinlik']);
        $stmt->bindParam(':desi', $data['desi']);
        $stmt->bindParam(':agirlik', $data['agirlik']);
        $stmt->bindParam(':seo_url', $seo_url);
        $stmt->bindParam(':xml_categories', $data['xml_categories']);
        
        return $stmt->execute();
    }
    
    /**
     * SEO URL oluştur
     */
    private function createSeoUrl($text, $suffix = '') {
        // Türkçe karakterleri dönüştür
        $turkish = ['ş', 'Ş', 'ı', 'İ', 'ğ', 'Ğ', 'ü', 'Ü', 'ö', 'Ö', 'ç', 'Ç'];
        $english = ['s', 's', 'i', 'i', 'g', 'g', 'u', 'u', 'o', 'o', 'c', 'c'];
        $text = str_replace($turkish, $english, $text);
        
        // Küçük harfe çevir ve özel karakterleri temizle
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
        $text = preg_replace('/[\s-]+/', '-', $text);
        $text = trim($text, '-');
        
        // Suffix ekle
        if ($suffix) {
            $text .= '-' . $suffix;
        }
        
        // Benzersizlik kontrolü
        $original_url = $text;
        $counter = 1;
        
        while ($this->urlExists($text)) {
            $text = $original_url . '-' . $counter;
            $counter++;
        }
        
        return $text;
    }
    
    /**
     * URL var mı kontrol et
     */
    private function urlExists($url) {
        $query = "SELECT id FROM urunler WHERE seo_url = :url LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':url', $url);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Import kaydı oluştur
     */
    private function createImportRecord($filename) {
        $query = "INSERT INTO xml_import_gecmisi (dosya_adi, durum) VALUES (:dosya, 'devam_ediyor')";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':dosya', $filename);
        $stmt->execute();
        
        $this->import_id = $this->conn->lastInsertId();
    }
    
    /**
     * Import progress güncelle
     */
    private function updateImportProgress() {
        $query = "UPDATE xml_import_gecmisi SET
            toplam_kayit = :toplam,
            basarili_kayit = :basarili,
            hatali_kayit = :hatali
        WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':toplam', $this->toplam_kayit);
        $stmt->bindParam(':basarili', $this->basarili_kayit);
        $stmt->bindParam(':hatali', $this->hatali_kayit);
        $stmt->bindParam(':id', $this->import_id);
        $stmt->execute();
    }
    
    /**
     * Import'u tamamla
     */
    private function finalizeImport($durum, $hata_mesaji = null) {
        $this->updateImportProgress();
        
        $query = "UPDATE xml_import_gecmisi SET
            durum = :durum,
            hata_mesaji = :hata,
            bitis_zamani = NOW()
        WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':durum', $durum);
        $stmt->bindParam(':hata', $hata_mesaji);
        $stmt->bindParam(':id', $this->import_id);
        $stmt->execute();
    }
    
    /**
     * Import geçmişini al
     */
    public function getImportHistory($limit = 10) {
        $query = "SELECT * FROM xml_import_gecmisi 
                  ORDER BY baslangic_zamani DESC LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Import durumunu al
     */
    public function getImportStatus($import_id) {
        $query = "SELECT * FROM xml_import_gecmisi WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $import_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
