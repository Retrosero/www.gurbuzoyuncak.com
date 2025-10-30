<?php
/**
 * Siparisler API Endpoint (Türkçe Şema)
 * Sipariş oluşturma, yönetimi ve sorgulama
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../classes/Siparis.php';
require_once '../classes/Kullanici.php';

$database = new Database();
$db = $database->getConnection();
$siparis = new Siparis($db);

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// URL parametrelerini parse et
$path_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$endpoint_index = array_search('siparisler.php', $path_parts);

$id = null;
$action = null;

if ($endpoint_index !== false) {
    // siparisler.php/123 formatı
    if (isset($path_parts[$endpoint_index + 1]) && is_numeric($path_parts[$endpoint_index + 1])) {
        $id = intval($path_parts[$endpoint_index + 1]);
    }
    // siparisler.php/action formatı
    if (isset($path_parts[$endpoint_index + 1]) && !is_numeric($path_parts[$endpoint_index + 1])) {
        $action = $path_parts[$endpoint_index + 1];
    }
}

// Alternatif: Query parameter olarak ID
if (!$id && isset($_GET['id'])) {
    $id = intval($_GET['id']);
}

switch ($method) {
    case 'GET':
        if ($action === 'istatistikler') {
            // İstatistikler endpoint
            handleStatistics($siparis);
        } elseif ($action === 'durum-dagilimi') {
            // Durum dağılımı
            $dagilim = $siparis->durumDagilimi();
            echo json_encode([
                'success' => true,
                'data' => $dagilim
            ]);
        } elseif ($action === 'gunluk-satislar') {
            // Günlük satışlar
            $gun_sayisi = $_GET['gun_sayisi'] ?? 30;
            $satislar = $siparis->gunlukSatislar($gun_sayisi);
            echo json_encode([
                'success' => true,
                'data' => $satislar
            ]);
        } elseif ($action === 'en-cok-siparis-verenler') {
            // En çok sipariş veren müşteriler
            $limit = $_GET['limit'] ?? 10;
            $musteriler = $siparis->enCokSiparisVerenler($limit);
            echo json_encode([
                'success' => true,
                'data' => $musteriler
            ]);
        } elseif ($id) {
            // Tek sipariş getir
            $kullanici_id = $_GET['kullanici_id'] ?? null;
            $siparis_data = $siparis->detayGetir($id, $kullanici_id);
            
            if ($siparis_data) {
                echo json_encode([
                    'success' => true,
                    'data' => $siparis_data
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Sipariş bulunamadı']);
            }
        } else {
            // Sipariş listesi
            handleOrderList($siparis);
        }
        break;
    
    case 'POST':
        // Yeni sipariş oluştur
        handleCreateOrder($siparis, $db);
        break;
    
    case 'PUT':
        if ($id) {
            handleUpdateOrder($siparis, $id);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Sipariş ID gerekli']);
        }
        break;
    
    case 'DELETE':
        if ($id) {
            // Sipariş iptali (soft delete)
            if ($siparis->durumGuncelle($id, 'iptal_edildi')) {
                echo json_encode(['success' => true, 'message' => 'Sipariş iptal edildi']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Sipariş iptal edilemedi']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Sipariş ID gerekli']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method desteklenmiyor']);
        break;
}

/**
 * Sipariş listesi işlemi
 */
function handleOrderList($siparis) {
    $filtreler = [
        'durum' => $_GET['durum'] ?? null,
        'odeme_durumu' => $_GET['odeme_durumu'] ?? null,
        'siparis_no' => $_GET['siparis_no'] ?? null,
        'musteri_adi' => $_GET['musteri_adi'] ?? null,
        'baslangic_tarihi' => $_GET['baslangic_tarihi'] ?? null,
        'bitis_tarihi' => $_GET['bitis_tarihi'] ?? null,
        'siralama' => $_GET['siralama'] ?? 'yeni',
        'limit' => $_GET['limit'] ?? 20,
        'offset' => $_GET['offset'] ?? 0
    ];
    
    // Kullanıcıya özel siparişler
    if (isset($_GET['kullanici_id'])) {
        $kullanici_id = intval($_GET['kullanici_id']);
        $stmt = $siparis->kullaniciSiparisleri($kullanici_id);
        $siparisler = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $siparisler,
            'count' => count($siparisler)
        ]);
        return;
    }
    
    // Tüm siparişler (Admin)
    $stmt = $siparis->tumSiparisleriGetir($filtreler);
    $siparisler = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Toplam sayı
    $toplam = $siparis->toplamSayi($filtreler);
    
    echo json_encode([
        'success' => true,
        'data' => $siparisler,
        'count' => count($siparisler),
        'total' => $toplam,
        'pagination' => [
            'current_page' => floor($filtreler['offset'] / $filtreler['limit']) + 1,
            'per_page' => $filtreler['limit'],
            'total_pages' => ceil($toplam / $filtreler['limit'])
        ]
    ]);
}

/**
 * Yeni sipariş oluşturma
 */
function handleCreateOrder($siparis, $db) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz JSON verisi']);
        return;
    }
    
    // Gerekli alanları kontrol et
    $required_fields = ['musteri_adi', 'musteri_eposta', 'musteri_telefon', 'teslimat_adresi', 
                       'teslimat_il', 'teslimat_ilce', 'ara_toplam', 'toplam_tutar', 'kalemler'];
    
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Eksik alan: $field"]);
            return;
        }
    }
    
    if (empty($data['kalemler']) || !is_array($data['kalemler'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Sipariş kalemleri gerekli']);
        return;
    }
    
    try {
        // Sipariş verilerini ata
        $siparis->kullanici_id = $data['kullanici_id'] ?? null;
        $siparis->musteri_adi = $data['musteri_adi'];
        $siparis->musteri_eposta = $data['musteri_eposta'];
        $siparis->musteri_telefon = $data['musteri_telefon'];
        $siparis->teslimat_adresi = $data['teslimat_adresi'];
        $siparis->teslimat_il = $data['teslimat_il'];
        $siparis->teslimat_ilce = $data['teslimat_ilce'];
        $siparis->teslimat_posta_kodu = $data['teslimat_posta_kodu'] ?? null;
        $siparis->ara_toplam = $data['ara_toplam'];
        $siparis->vergi_toplami = $data['vergi_toplami'] ?? 0;
        $siparis->kargo_ucreti = $data['kargo_ucreti'] ?? 0;
        $siparis->indirim_tutari = $data['indirim_tutari'] ?? 0;
        $siparis->kullanilan_bakiye = $data['kullanilan_bakiye'] ?? 0;
        $siparis->kupon_kodu = $data['kupon_kodu'] ?? null;
        $siparis->toplam_tutar = $data['toplam_tutar'];
        $siparis->durum = $data['durum'] ?? 'beklemede';
        $siparis->odeme_durumu = $data['odeme_durumu'] ?? 'beklemede';
        $siparis->siparis_notu = $data['siparis_notu'] ?? null;
        
        // Sipariş oluştur
        $siparis_id = $siparis->olustur($data['kalemler']);
        
        if ($siparis_id) {
            // Kullanıcı bakiyesi kullanıldıysa düş
            if (!empty($data['kullanilan_bakiye']) && $data['kullanilan_bakiye'] > 0 && !empty($data['kullanici_id'])) {
                $kullanici = new Kullanici($db);
                $kullanici->id = $data['kullanici_id'];
                $kullanici->bakiyeDus($data['kullanilan_bakiye'], 'Sipariş ödemesi - ' . $siparis->siparis_no);
            }
            
            // Sipariş tamamlandıysa puan ver
            if ($data['durum'] === 'teslim_edildi' && !empty($data['kullanici_id'])) {
                $kullanici = new Kullanici($db);
                $kullanici->id = $data['kullanici_id'];
                $puan = floor($data['toplam_tutar'] / 10); // Her 10 TL için 1 puan
                $kullanici->puanEkle($puan, 'Sipariş puanı - ' . $siparis->siparis_no);
            }
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Sipariş başarıyla oluşturuldu',
                'data' => [
                    'siparis_id' => $siparis_id,
                    'siparis_no' => $siparis->siparis_no
                ]
            ]);
        } else {
            throw new Exception('Sipariş oluşturulamadı');
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Sipariş oluşturulurken hata: ' . $e->getMessage()
        ]);
    }
}

/**
 * Sipariş güncelleme
 */
function handleUpdateOrder($siparis, $id) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz JSON verisi']);
        return;
    }
    
    $success = false;
    $message = '';
    
    try {
        // Durum güncelleme
        if (isset($data['durum'])) {
            $success = $siparis->durumGuncelle($id, $data['durum']);
            $message = 'Sipariş durumu güncellendi';
        }
        
        // Ödeme durumu güncelleme
        if (isset($data['odeme_durumu'])) {
            $success = $siparis->odemeDurumuGuncelle($id, $data['odeme_durumu']);
            $message = 'Ödeme durumu güncellendi';
        }
        
        // Admin notu güncelleme
        if (isset($data['admin_notu'])) {
            $success = $siparis->adminNotuGuncelle($id, $data['admin_notu']);
            $message = 'Admin notu güncellendi';
        }
        
        if ($success) {
            echo json_encode(['success' => true, 'message' => $message]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Sipariş güncellenemedi']);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Güncelleme hatası: ' . $e->getMessage()
        ]);
    }
}

/**
 * İstatistikler
 */
function handleStatistics($siparis) {
    try {
        $gunluk_satislar = $siparis->gunlukSatislar(7); // Son 7 gün
        $aylik_ozet = $siparis->aylikOzet();
        $durum_dagilimi = $siparis->durumDagilimi();
        
        echo json_encode([
            'success' => true,
            'data' => [
                'gunluk_satislar' => $gunluk_satislar,
                'aylik_ozet' => $aylik_ozet,
                'durum_dagilimi' => $durum_dagilimi
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'İstatistik hatası: ' . $e->getMessage()
        ]);
    }
}