<?php
/**
 * Kullanicilar API Endpoint (Türkçe Şema)
 * Kullanıcı kaydı, girişi, profil yönetimi, bakiye/puan işlemleri
 */

session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../classes/Kullanici.php';

$database = new Database();
$db = $database->getConnection();
$kullanici = new Kullanici($db);

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// URL parametrelerini parse et
$path_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$endpoint_index = array_search('kullanicilar.php', $path_parts);

$id = null;
$action = null;

if ($endpoint_index !== false) {
    // kullanicilar.php/123 formatı
    if (isset($path_parts[$endpoint_index + 1]) && is_numeric($path_parts[$endpoint_index + 1])) {
        $id = intval($path_parts[$endpoint_index + 1]);
    }
    // kullanicilar.php/action formatı
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
        handleGetRequests($kullanici, $action, $id);
        break;
    
    case 'POST':
        handlePostRequests($kullanici, $action);
        break;
    
    case 'PUT':
        if ($id) {
            handlePutRequests($kullanici, $id, $action);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Kullanıcı ID gerekli']);
        }
        break;
    
    case 'DELETE':
        if ($id) {
            // Kullanıcı deaktive et (soft delete)
            if ($kullanici->aktiflikDurumunuDegistir($id, 0)) {
                echo json_encode(['success' => true, 'message' => 'Kullanıcı deaktive edildi']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Kullanıcı deaktive edilemedi']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Kullanıcı ID gerekli']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method desteklenmiyor']);
        break;
}

/**
 * GET istekleri işleme
 */
function handleGetRequests($kullanici, $action, $id) {
    switch ($action) {
        case 'profil':
            // Kullanıcı profili
            if ($id) {
                $kullanici->id = $id;
                $profil = $kullanici->bilgileriGetir();
                
                if ($profil) {
                    echo json_encode(['success' => true, 'data' => $profil]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Kullanıcı ID gerekli']);
            }
            break;
            
        case 'bakiye':
            // Kullanıcı bakiyesi
            if ($id) {
                $bakiye = $kullanici->bakiyeGetir($id);
                echo json_encode(['success' => true, 'data' => ['bakiye' => $bakiye]]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Kullanıcı ID gerekli']);
            }
            break;
            
        case 'puan':
            // Kullanıcı puanı
            if ($id) {
                $puan = $kullanici->puanGetir($id);
                echo json_encode(['success' => true, 'data' => ['puan' => $puan]]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Kullanıcı ID gerekli']);
            }
            break;
            
        case 'istatistikler':
            // Kullanıcı istatistikleri
            if ($id) {
                $istatistikler = $kullanici->istatistikleriGetir($id);
                echo json_encode(['success' => true, 'data' => $istatistikler]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Kullanıcı ID gerekli']);
            }
            break;
            
        case 'oturum':
            // Mevcut oturum kontrolü
            if (isset($_SESSION['kullanici_id'])) {
                $kullanici->id = $_SESSION['kullanici_id'];
                $profil = $kullanici->bilgileriGetir();
                echo json_encode(['success' => true, 'logged_in' => true, 'data' => $profil]);
            } else {
                echo json_encode(['success' => true, 'logged_in' => false]);
            }
            break;
            
        default:
            if ($id) {
                // Tek kullanıcı bilgileri
                $kullanici->id = $id;
                $profil = $kullanici->bilgileriGetir();
                
                if ($profil) {
                    echo json_encode(['success' => true, 'data' => $profil]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Kullanıcı bulunamadı']);
                }
            } else {
                // Tüm kullanıcılar (Admin)
                handleUserList($kullanici);
            }
            break;
    }
}

/**
 * POST istekleri işleme
 */
function handlePostRequests($kullanici, $action) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz JSON verisi']);
        return;
    }
    
    switch ($action) {
        case 'kayit':
        case 'register':
            // Kullanıcı kaydı
            handleRegister($kullanici, $data);
            break;
            
        case 'giris':
        case 'login':
            // Kullanıcı girişi
            handleLogin($kullanici, $data);
            break;
            
        case 'cikis':
        case 'logout':
            // Kullanıcı çıkışı
            session_destroy();
            echo json_encode(['success' => true, 'message' => 'Başarıyla çıkış yapıldı']);
            break;
            
        case 'sifre-sifirla':
            // Şifre sıfırlama
            if (empty($data['eposta']) || empty($data['yeni_sifre'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'E-posta ve yeni şifre gerekli']);
                return;
            }
            
            if ($kullanici->sifreSifirla($data['eposta'], $data['yeni_sifre'])) {
                echo json_encode(['success' => true, 'message' => 'Şifre başarıyla sıfırlandı']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Şifre sıfırlanamadı']);
            }
            break;
            
        case 'bakiye-ekle':
            // Bakiye ekleme
            if (empty($data['kullanici_id']) || empty($data['miktar'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Kullanıcı ID ve miktar gerekli']);
                return;
            }
            
            $kullanici->id = $data['kullanici_id'];
            $aciklama = $data['aciklama'] ?? 'Bakiye yükleme';
            
            if ($kullanici->bakiyeEkle($data['miktar'], $aciklama)) {
                echo json_encode(['success' => true, 'message' => 'Bakiye başarıyla eklendi']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Bakiye eklenemedi']);
            }
            break;
            
        case 'puan-kullan':
            // Puan kullanma
            if (empty($data['kullanici_id']) || empty($data['miktar'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Kullanıcı ID ve miktar gerekli']);
                return;
            }
            
            $kullanici->id = $data['kullanici_id'];
            $aciklama = $data['aciklama'] ?? 'Puan indirimi';
            
            if ($kullanici->puanKullan($data['miktar'], $aciklama)) {
                echo json_encode(['success' => true, 'message' => 'Puan başarıyla kullanıldı']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Yetersiz puan veya hata']);
            }
            break;
            
        default:
            // Varsayılan: Yeni kullanıcı oluştur
            handleRegister($kullanici, $data);
            break;
    }
}

/**
 * PUT istekleri işleme
 */
function handlePutRequests($kullanici, $id, $action) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz JSON verisi']);
        return;
    }
    
    switch ($action) {
        case 'profil':
            // Profil güncelleme
            $kullanici->id = $id;
            $kullanici->ad = $data['ad'] ?? '';
            $kullanici->soyad = $data['soyad'] ?? '';
            $kullanici->telefon = $data['telefon'] ?? '';
            
            if ($kullanici->profilGuncelle()) {
                echo json_encode(['success' => true, 'message' => 'Profil başarıyla güncellendi']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Profil güncellenemedi']);
            }
            break;
            
        case 'sifre':
            // Şifre değiştirme
            if (empty($data['eski_sifre']) || empty($data['yeni_sifre'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Eski ve yeni şifre gerekli']);
                return;
            }
            
            $kullanici->id = $id;
            
            if ($kullanici->sifreDegistir($data['eski_sifre'], $data['yeni_sifre'])) {
                echo json_encode(['success' => true, 'message' => 'Şifre başarıyla değiştirildi']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Eski şifre hatalı veya güncelleme başarısız']);
            }
            break;
            
        case 'aktiflik':
            // Aktiflik durumu değiştirme
            $aktif_durum = $data['aktif'] ?? 1;
            
            if ($kullanici->aktiflikDurumunuDegistir($id, $aktif_durum)) {
                $mesaj = $aktif_durum ? 'Kullanıcı aktive edildi' : 'Kullanıcı deaktive edildi';
                echo json_encode(['success' => true, 'message' => $mesaj]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Aktiflik durumu güncellenemedi']);
            }
            break;
            
        case 'eposta-onayla':
            // E-posta onaylama
            if ($kullanici->epostaOnayla($id)) {
                echo json_encode(['success' => true, 'message' => 'E-posta başarıyla onaylandı']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'E-posta onaylanamadı']);
            }
            break;
            
        default:
            // Varsayılan profil güncelleme
            $kullanici->id = $id;
            $kullanici->ad = $data['ad'] ?? '';
            $kullanici->soyad = $data['soyad'] ?? '';
            $kullanici->telefon = $data['telefon'] ?? '';
            
            if ($kullanici->profilGuncelle()) {
                echo json_encode(['success' => true, 'message' => 'Profil başarıyla güncellendi']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Profil güncellenemedi']);
            }
            break;
    }
}

/**
 * Kullanıcı kaydı
 */
function handleRegister($kullanici, $data) {
    // Gerekli alanları kontrol et
    $required_fields = ['ad', 'soyad', 'eposta', 'sifre'];
    
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Eksik alan: $field"]);
            return;
        }
    }
    
    // Şifre uzunluğu kontrolü
    if (strlen($data['sifre']) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Şifre en az 6 karakter olmalıdır']);
        return;
    }
    
    $kullanici->ad = $data['ad'];
    $kullanici->soyad = $data['soyad'];
    $kullanici->eposta = $data['eposta'];
    $kullanici->sifre = $data['sifre'];
    $kullanici->telefon = $data['telefon'] ?? '';
    
    $result = $kullanici->kayitOl();
    
    if ($result['success'] ?? false) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Kullanıcı başarıyla kaydedildi',
            'data' => ['user_id' => $result['user_id']]
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $result['error'] ?? 'Kayıt başarısız'
        ]);
    }
}

/**
 * Kullanıcı girişi
 */
function handleLogin($kullanici, $data) {
    if (empty($data['eposta']) || empty($data['sifre'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'E-posta ve şifre gerekli']);
        return;
    }
    
    $kullanici->eposta = $data['eposta'];
    $kullanici->sifre = $data['sifre'];
    
    $result = $kullanici->girisYap();
    
    if ($result['success'] ?? false) {
        // Session oluştur
        $_SESSION['kullanici_id'] = $result['user']['id'];
        $_SESSION['kullanici_eposta'] = $result['user']['eposta'];
        $_SESSION['kullanici_ad'] = $result['user']['ad'];
        $_SESSION['kullanici_soyad'] = $result['user']['soyad'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Başarıyla giriş yapıldı',
            'data' => $result['user']
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => $result['error'] ?? 'Giriş başarısız'
        ]);
    }
}

/**
 * Kullanıcı listesi (Admin)
 */
function handleUserList($kullanici) {
    $filtreler = [
        'aktif' => $_GET['aktif'] ?? null,
        'eposta_onaylandi' => $_GET['eposta_onaylandi'] ?? null,
        'arama' => $_GET['arama'] ?? null,
        'siralama' => $_GET['siralama'] ?? 'yeni',
        'limit' => $_GET['limit'] ?? 20,
        'offset' => $_GET['offset'] ?? 0
    ];
    
    $stmt = $kullanici->tumKullanicilariGetir($filtreler);
    $kullanicilar = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Şifreleri gizle
    foreach ($kullanicilar as &$user) {
        unset($user['sifre']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $kullanicilar,
        'count' => count($kullanicilar),
        'pagination' => [
            'current_page' => floor($filtreler['offset'] / $filtreler['limit']) + 1,
            'per_page' => $filtreler['limit']
        ]
    ]);
}