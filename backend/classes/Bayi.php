<?php
/**
 * Bayi Sınıfı - B2B Bayi Sistemi
 * Bayi Kayıt, Giriş, Profil Yönetimi ve Bakiye Sistemi
 */

class Bayi {
    private $conn;
    private $table_name = "bayiler";
    private $profile_table = "bayi_profiles";
    private $transactions_table = "bayi_balance_transactions";
    
    // Bayi özellikleri
    public $bayi_id;
    public $email;
    public $password_hash;
    public $company_name;
    public $contact_person;
    public $phone;
    public $address;
    public $tax_number;
    public $city;
    public $district;
    public $postal_code;
    public $website;
    public $notes;
    public $is_active;
    public $email_verified;
    
    // Profil özellikleri
    public $balance;
    public $credit_limit;
    public $status;
    public $discount_rate;
    public $commission_rate;
    public $last_login;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Bayi kaydı oluştur
     */
    public function kayitOl() {
        // Email kontrolü
        if ($this->emailVarMi()) {
            return ['error' => 'Bu e-posta adresi zaten kullanılıyor'];
        }
        
        // Vergi numarası kontrolü
        if ($this->vergiNumarasiVarMi()) {
            return ['error' => 'Bu vergi numarası zaten kayıtlı'];
        }
        
        $this->conn->beginTransaction();
        
        try {
            // Bayi kaydı oluştur
            $query = "INSERT INTO " . $this->table_name . "
                    SET email = :email,
                        password_hash = :password_hash,
                        company_name = :company_name,
                        contact_person = :contact_person,
                        phone = :phone,
                        address = :address,
                        tax_number = :tax_number,
                        city = :city,
                        district = :district,
                        postal_code = :postal_code,
                        website = :website,
                        is_active = 0,
                        email_verified = 0";
            
            $stmt = $this->conn->prepare($query);
            
            // Şifreyi hash'le
            $this->password_hash = password_hash($this->password_hash, PASSWORD_DEFAULT);
            
            $stmt->bindParam(':email', $this->email);
            $stmt->bindParam(':password_hash', $this->password_hash);
            $stmt->bindParam(':company_name', $this->company_name);
            $stmt->bindParam(':contact_person', $this->contact_person);
            $stmt->bindParam(':phone', $this->phone);
            $stmt->bindParam(':address', $this->address);
            $stmt->bindParam(':tax_number', $this->tax_number);
            $stmt->bindParam(':city', $this->city);
            $stmt->bindParam(':district', $this->district);
            $stmt->bindParam(':postal_code', $this->postal_code);
            $stmt->bindParam(':website', $this->website);
            
            if ($stmt->execute()) {
                $this->bayi_id = $this->conn->lastInsertId();
                
                // Profil oluştur
                $profile_query = "INSERT INTO " . $this->profile_table . "
                                SET bayi_id = :bayi_id,
                                    balance = 0.00,
                                    credit_limit = 0.00,
                                    status = 'pending',
                                    discount_rate = 0.00,
                                    commission_rate = 0.00";
                
                $profile_stmt = $this->conn->prepare($profile_query);
                $profile_stmt->bindParam(':bayi_id', $this->bayi_id);
                
                if ($profile_stmt->execute()) {
                    $this->conn->commit();
                    return ['success' => true, 'bayi_id' => $this->bayi_id];
                }
            }
            
            $this->conn->rollBack();
            return ['error' => 'Kayıt oluşturulamadı'];
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return ['error' => 'Veritabanı hatası: ' . $e->getMessage()];
        }
    }
    
    /**
     * Bayi girişi
     */
    public function girisYap() {
        $query = "SELECT b.*, p.balance, p.credit_limit, p.status, p.discount_rate, p.last_login
                  FROM " . $this->table_name . " b
                  LEFT JOIN " . $this->profile_table . " p ON b.bayi_id = p.bayi_id
                  WHERE b.email = :email AND b.is_active = 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($this->password_hash, $row['password_hash'])) {
                // Profil durumu kontrolü
                if ($row['status'] !== 'active') {
                    return ['error' => 'Hesabınız henüz aktif değil. Admin onayı bekleniyor.'];
                }
                
                // Son giriş zamanını güncelle
                $this->sonGirisGuncelle($row['bayi_id']);
                
                // Hassas bilgileri kaldır
                unset($row['password_hash']);
                
                return ['success' => true, 'bayi' => $row];
            } else {
                return ['error' => 'E-posta veya şifre hatalı'];
            }
        }
        
        return ['error' => 'E-posta veya şifre hatalı'];
    }
    
    /**
     * Bayi bilgilerini getir
     */
    public function bilgileriGetir() {
        $query = "SELECT b.*, p.balance, p.credit_limit, p.status, p.discount_rate, 
                         p.commission_rate, p.last_login, p.total_orders, p.total_amount
                  FROM " . $this->table_name . " b
                  LEFT JOIN " . $this->profile_table . " p ON b.bayi_id = p.bayi_id
                  WHERE b.bayi_id = :bayi_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $this->bayi_id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            unset($row['password_hash']);
            return $row;
        }
        
        return false;
    }
    
    /**
     * Profil bilgilerini güncelle
     */
    public function profilGuncelle() {
        $query = "UPDATE " . $this->table_name . "
                  SET company_name = :company_name,
                      contact_person = :contact_person,
                      phone = :phone,
                      address = :address,
                      city = :city,
                      district = :district,
                      postal_code = :postal_code,
                      website = :website
                  WHERE bayi_id = :bayi_id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':company_name', $this->company_name);
        $stmt->bindParam(':contact_person', $this->contact_person);
        $stmt->bindParam(':phone', $this->phone);
        $stmt->bindParam(':address', $this->address);
        $stmt->bindParam(':city', $this->city);
        $stmt->bindParam(':district', $this->district);
        $stmt->bindParam(':postal_code', $this->postal_code);
        $stmt->bindParam(':website', $this->website);
        $stmt->bindParam(':bayi_id', $this->bayi_id);
        
        return $stmt->execute();
    }
    
    /**
     * Şifre değiştir
     */
    public function sifreDegistir($eski_sifre, $yeni_sifre) {
        // Mevcut şifreyi kontrol et
        $query = "SELECT password_hash FROM " . $this->table_name . " WHERE bayi_id = :bayi_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $this->bayi_id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($eski_sifre, $row['password_hash'])) {
                $yeni_hash = password_hash($yeni_sifre, PASSWORD_DEFAULT);
                
                $update_query = "UPDATE " . $this->table_name . "
                                SET password_hash = :password_hash
                                WHERE bayi_id = :bayi_id";
                
                $update_stmt = $this->conn->prepare($update_query);
                $update_stmt->bindParam(':password_hash', $yeni_hash);
                $update_stmt->bindParam(':bayi_id', $this->bayi_id);
                
                return $update_stmt->execute();
            }
        }
        
        return false;
    }
    
    /**
     * Bakiye yükle
     */
    public function bakiyeYukle($miktar, $aciklama = '', $payment_method = 'manual', $reference = '') {
        $this->conn->beginTransaction();
        
        try {
            // Mevcut bakiyeyi al
            $balance_query = "SELECT balance FROM " . $this->profile_table . " WHERE bayi_id = :bayi_id";
            $balance_stmt = $this->conn->prepare($balance_query);
            $balance_stmt->bindParam(':bayi_id', $this->bayi_id);
            $balance_stmt->execute();
            $current_balance = $balance_stmt->fetchColumn();
            
            $new_balance = $current_balance + $miktar;
            
            // Bakiyeyi güncelle
            $update_query = "UPDATE " . $this->profile_table . "
                           SET balance = :balance
                           WHERE bayi_id = :bayi_id";
            
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(':balance', $new_balance);
            $update_stmt->bindParam(':bayi_id', $this->bayi_id);
            
            if ($update_stmt->execute()) {
                // İşlem kaydı oluştur
                $transaction_query = "INSERT INTO " . $this->transactions_table . "
                                    SET bayi_id = :bayi_id,
                                        transaction_type = 'deposit',
                                        amount = :amount,
                                        balance_before = :balance_before,
                                        balance_after = :balance_after,
                                        description = :description,
                                        payment_method = :payment_method,
                                        payment_reference = :reference,
                                        status = 'completed'";
                
                $transaction_stmt = $this->conn->prepare($transaction_query);
                $transaction_stmt->bindParam(':bayi_id', $this->bayi_id);
                $transaction_stmt->bindParam(':amount', $miktar);
                $transaction_stmt->bindParam(':balance_before', $current_balance);
                $transaction_stmt->bindParam(':balance_after', $new_balance);
                $transaction_stmt->bindParam(':description', $aciklama);
                $transaction_stmt->bindParam(':payment_method', $payment_method);
                $transaction_stmt->bindParam(':reference', $reference);
                
                if ($transaction_stmt->execute()) {
                    $this->conn->commit();
                    return ['success' => true, 'new_balance' => $new_balance];
                }
            }
            
            $this->conn->rollBack();
            return ['error' => 'Bakiye yüklenemedi'];
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return ['error' => 'Veritabanı hatası: ' . $e->getMessage()];
        }
    }
    
    /**
     * Bakiye düş
     */
    public function bakiyeDus($miktar, $aciklama = '', $reference = '') {
        $this->conn->beginTransaction();
        
        try {
            // Mevcut bakiyeyi al
            $balance_query = "SELECT balance FROM " . $this->profile_table . " WHERE bayi_id = :bayi_id";
            $balance_stmt = $this->conn->prepare($balance_query);
            $balance_stmt->bindParam(':bayi_id', $this->bayi_id);
            $balance_stmt->execute();
            $current_balance = $balance_stmt->fetchColumn();
            
            if ($current_balance < $miktar) {
                $this->conn->rollBack();
                return ['error' => 'Yetersiz bakiye'];
            }
            
            $new_balance = $current_balance - $miktar;
            
            // Bakiyeyi güncelle
            $update_query = "UPDATE " . $this->profile_table . "
                           SET balance = :balance
                           WHERE bayi_id = :bayi_id";
            
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(':balance', $new_balance);
            $update_stmt->bindParam(':bayi_id', $this->bayi_id);
            
            if ($update_stmt->execute()) {
                // İşlem kaydı oluştur
                $transaction_query = "INSERT INTO " . $this->transactions_table . "
                                    SET bayi_id = :bayi_id,
                                        transaction_type = 'withdrawal',
                                        amount = :amount,
                                        balance_before = :balance_before,
                                        balance_after = :balance_after,
                                        description = :description,
                                        reference_id = :reference,
                                        status = 'completed'";
                
                $transaction_stmt = $this->conn->prepare($transaction_query);
                $transaction_stmt->bindParam(':bayi_id', $this->bayi_id);
                $transaction_stmt->bindParam(':amount', $miktar);
                $transaction_stmt->bindParam(':balance_before', $current_balance);
                $transaction_stmt->bindParam(':balance_after', $new_balance);
                $transaction_stmt->bindParam(':description', $aciklama);
                $transaction_stmt->bindParam(':reference', $reference);
                
                if ($transaction_stmt->execute()) {
                    $this->conn->commit();
                    return ['success' => true, 'new_balance' => $new_balance];
                }
            }
            
            $this->conn->rollBack();
            return ['error' => 'Bakiye düşülemiyor'];
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            return ['error' => 'Veritabanı hatası: ' . $e->getMessage()];
        }
    }
    
    /**
     * İşlem geçmişi getir
     */
    public function islemGecmisiGetir($limit = 50, $offset = 0) {
        $query = "SELECT *
                  FROM " . $this->transactions_table . "
                  WHERE bayi_id = :bayi_id
                  ORDER BY created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $this->bayi_id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Son giriş zamanını güncelle
     */
    private function sonGirisGuncelle($bayi_id) {
        $query = "UPDATE " . $this->profile_table . "
                  SET last_login = NOW()
                  WHERE bayi_id = :bayi_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $bayi_id);
        $stmt->execute();
    }
    
    /**
     * Email kontrolü
     */
    private function emailVarMi() {
        $query = "SELECT bayi_id FROM " . $this->table_name . " WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Vergi numarası kontrolü
     */
    private function vergiNumarasiVarMi() {
        if (empty($this->tax_number)) {
            return false;
        }
        
        $query = "SELECT bayi_id FROM " . $this->table_name . " WHERE tax_number = :tax_number";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':tax_number', $this->tax_number);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Bakiye getir
     */
    public function bakiyeGetir() {
        $query = "SELECT balance FROM " . $this->profile_table . " WHERE bayi_id = :bayi_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $this->bayi_id);
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }
    
    /**
     * Admin - Tüm bayileri getir
     */
    public function tumBayileriGetir($limit = 100, $offset = 0, $filters = []) {
        $where_conditions = [];
        $params = [];
        
        if (!empty($filters['search'])) {
            $where_conditions[] = "(b.company_name LIKE :search OR b.contact_person LIKE :search OR b.email LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }
        
        if (!empty($filters['status'])) {
            $where_conditions[] = "p.status = :status";
            $params[':status'] = $filters['status'];
        }
        
        if (!empty($filters['is_active'])) {
            $where_conditions[] = "b.is_active = :is_active";
            $params[':is_active'] = $filters['is_active'];
        }
        
        $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
        
        $query = "SELECT b.*, p.balance, p.credit_limit, p.status, p.discount_rate, 
                         p.last_login, p.total_orders, p.total_amount
                  FROM " . $this->table_name . " b
                  LEFT JOIN " . $this->profile_table . " p ON b.bayi_id = p.bayi_id
                  $where_clause
                  ORDER BY b.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Admin - Bayi durumu güncelle
     */
    public function durumGuncelle($status) {
        $query = "UPDATE " . $this->profile_table . "
                  SET status = :status
                  WHERE bayi_id = :bayi_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':bayi_id', $this->bayi_id);
        
        return $stmt->execute();
    }
    
    /**
     * Admin - Bayi aktiflik durumu güncelle
     */
    public function aktiflikDurumuGuncelle($is_active) {
        $query = "UPDATE " . $this->table_name . "
                  SET is_active = :is_active
                  WHERE bayi_id = :bayi_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':is_active', $is_active);
        $stmt->bindParam(':bayi_id', $this->bayi_id);
        
        return $stmt->execute();
    }
    
    /**
     * İstatistikler getir
     */
    public function istatistikleriGetir() {
        $query = "SELECT 
                    COUNT(*) as toplam_bayi,
                    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as aktif_bayi,
                    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as bekleyen_bayi,
                    SUM(p.balance) as toplam_bakiye,
                    AVG(p.balance) as ortalama_bakiye
                  FROM " . $this->table_name . " b
                  LEFT JOIN " . $this->profile_table . " p ON b.bayi_id = p.bayi_id
                  WHERE b.is_active = 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // =========================================================================
    // ADMİN ONAY SİSTEMİ METODLAri
    // =========================================================================
    
    /**
     * Bayi başvurusunu onayla
     */
    public function bayiOnayla($bayi_id, $admin_id, $admin_notes = '') {
        $this->conn->beginTransaction();
        
        try {
            // Bayi durumunu güncelle
            $query = "UPDATE " . $this->table_name . " 
                      SET status = 'approved', 
                          admin_notes = :admin_notes,
                          approved_at = NOW(),
                          approved_by = :admin_id
                      WHERE id = :bayi_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':bayi_id', $bayi_id);
            $stmt->bindParam(':admin_id', $admin_id);
            $stmt->bindParam(':admin_notes', $admin_notes);
            
            if (!$stmt->execute()) {
                throw new Exception('Bayi durumu güncellenemedi');
            }
            
            // Bayi profilini aktifleştir
            $profile_query = "UPDATE " . $this->profile_table . " 
                             SET status = 'active' 
                             WHERE bayi_id = :bayi_id";
            
            $profile_stmt = $this->conn->prepare($profile_query);
            $profile_stmt->bindParam(':bayi_id', $bayi_id);
            
            if (!$profile_stmt->execute()) {
                throw new Exception('Profil durumu güncellenemedi');
            }
            
            // Admin log kaydı
            $this->adminLogEkle($admin_id, 'bayi_approval', $bayi_id, "Bayi onaylandı: $admin_notes");
            
            // Bildirim ekle
            $this->bayiBildirimEkle($bayi_id, 'approval', 'Bayi Başvurunuz Onaylandı', 
                'Tebrikler! Bayi başvurunuz onaylanmıştır. Artık panel üzerinden alışveriş yapabilirsiniz.');
            
            $this->conn->commit();
            return ['success' => true, 'message' => 'Bayi başarıyla onaylandı'];
            
        } catch (Exception $e) {
            $this->conn->rollback();
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * Bayi başvurusunu reddet
     */
    public function bayiReddet($bayi_id, $admin_id, $rejection_reason) {
        $this->conn->beginTransaction();
        
        try {
            // Bayi durumunu güncelle
            $query = "UPDATE " . $this->table_name . " 
                      SET status = 'rejected', 
                          admin_notes = :rejection_reason,
                          approved_at = NOW(),
                          approved_by = :admin_id
                      WHERE id = :bayi_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':bayi_id', $bayi_id);
            $stmt->bindParam(':admin_id', $admin_id);
            $stmt->bindParam(':rejection_reason', $rejection_reason);
            
            if (!$stmt->execute()) {
                throw new Exception('Bayi durumu güncellenemedi');
            }
            
            // Admin log kaydı
            $this->adminLogEkle($admin_id, 'bayi_rejection', $bayi_id, "Bayi reddedildi: $rejection_reason");
            
            // Bildirim ekle
            $this->bayiBildirimEkle($bayi_id, 'rejection', 'Bayi Başvurunuz Hakkında', 
                "Maalesef bayi başvurunuz onaylanamamıştır. Gerekçe: $rejection_reason");
            
            $this->conn->commit();
            return ['success' => true, 'message' => 'Bayi başvurusu reddedildi'];
            
        } catch (Exception $e) {
            $this->conn->rollback();
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * Bayi hesabını askıya al
     */
    public function bayiAskiyaAl($bayi_id, $admin_id, $suspension_reason) {
        $this->conn->beginTransaction();
        
        try {
            // Bayi durumunu güncelle
            $query = "UPDATE " . $this->table_name . " 
                      SET status = 'suspended', 
                          admin_notes = :suspension_reason
                      WHERE id = :bayi_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':bayi_id', $bayi_id);
            $stmt->bindParam(':suspension_reason', $suspension_reason);
            
            if (!$stmt->execute()) {
                throw new Exception('Bayi durumu güncellenemedi');
            }
            
            // Profili deaktif et
            $profile_query = "UPDATE " . $this->profile_table . " 
                             SET status = 'suspended' 
                             WHERE bayi_id = :bayi_id";
            
            $profile_stmt = $this->conn->prepare($profile_query);
            $profile_stmt->bindParam(':bayi_id', $bayi_id);
            $profile_stmt->execute();
            
            // Admin log kaydı
            $this->adminLogEkle($admin_id, 'bayi_suspension', $bayi_id, "Bayi askıya alındı: $suspension_reason");
            
            // Bildirim ekle
            $this->bayiBildirimEkle($bayi_id, 'suspension', 'Hesap Durumu Hakkında', 
                "Hesabınız geçici olarak askıya alınmıştır. Gerekçe: $suspension_reason");
            
            $this->conn->commit();
            return ['success' => true, 'message' => 'Bayi hesabı askıya alındı'];
            
        } catch (Exception $e) {
            $this->conn->rollback();
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * Bekleyen bayi başvurularını listele
     */
    public function bekleyenBasvurulariGetir($limit = 50, $offset = 0) {
        $query = "SELECT b.*, bp.balance, bp.credit_limit, bp.created_at as profile_created
                  FROM " . $this->table_name . " b
                  LEFT JOIN " . $this->profile_table . " bp ON b.id = bp.bayi_id
                  WHERE b.status = 'pending'
                  ORDER BY b.created_at ASC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Tüm bayileri status'a göre listele
     */
    public function bayileriStatusaGoreListele($status = 'all', $limit = 50, $offset = 0) {
        $query = "SELECT b.*, bp.balance, bp.credit_limit, bp.status as profile_status,
                  a.username as approved_by_name
                  FROM " . $this->table_name . " b
                  LEFT JOIN " . $this->profile_table . " bp ON b.id = bp.bayi_id
                  LEFT JOIN admins a ON b.approved_by = a.id
                  WHERE 1=1";
        
        if ($status != 'all') {
            $query .= " AND b.status = :status";
        }
        
        $query .= " ORDER BY b.created_at DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        
        if ($status != 'all') {
            $stmt->bindParam(':status', $status);
        }
        
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Bayi istatistiklerini getir
     */
    public function bayiIstatistikleriGetir() {
        $query = "SELECT 
                    COUNT(*) as toplam_bayi,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as bekleyen,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as onaylanan,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as reddedilen,
                    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as askidaki
                  FROM " . $this->table_name;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * E-ticaret platform linklerini güncelle
     */
    public function eticaretLinkleriniGuncelle($bayi_id, $platform_links) {
        $fields = [];
        $params = [':bayi_id' => $bayi_id];
        
        $allowed_platforms = [
            'n11_link', 'hepsiburada_link', 'trendyol_link', 'pazarlama_link',
            'eptt_link', 'amazon_link', 'idefix_link', 'ciceksepeti_link',
            'whatsapp_no', 'instagram_account', 'facebook_account'
        ];
        
        foreach ($platform_links as $platform => $link) {
            if (in_array($platform, $allowed_platforms)) {
                $fields[] = "$platform = :$platform";
                $params[":$platform"] = $link;
            }
        }
        
        if (empty($fields)) {
            return ['error' => 'Güncellenecek link bulunamadı'];
        }
        
        $query = "UPDATE " . $this->table_name . " 
                  SET " . implode(', ', $fields) . "
                  WHERE id = :bayi_id";
        
        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $param => $value) {
            $stmt->bindValue($param, $value);
        }
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Platform linkleri güncellendi'];
        } else {
            return ['error' => 'Linkler güncellenemedi'];
        }
    }
    
    /**
     * Bayi platform linklerini getir
     */
    public function bayiPlatformLinkeriniGetir($bayi_id) {
        $query = "SELECT n11_link, hepsiburada_link, trendyol_link, pazarlama_link,
                         eptt_link, amazon_link, idefix_link, ciceksepeti_link,
                         whatsapp_no, instagram_account, facebook_account
                  FROM " . $this->table_name . " 
                  WHERE id = :bayi_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $bayi_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Admin log kaydı ekle
     */
    private function adminLogEkle($admin_id, $action_type, $target_id, $details) {
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        
        $query = "INSERT INTO admin_logs (admin_id, action_type, target_id, details, ip_address, user_agent)
                  VALUES (:admin_id, :action_type, :target_id, :details, :ip_address, :user_agent)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':admin_id', $admin_id);
        $stmt->bindParam(':action_type', $action_type);
        $stmt->bindParam(':target_id', $target_id);
        $stmt->bindParam(':details', $details);
        $stmt->bindParam(':ip_address', $ip_address);
        $stmt->bindParam(':user_agent', $user_agent);
        
        $stmt->execute();
    }
    
    /**
     * Bayi bildirimi ekle
     */
    private function bayiBildirimEkle($bayi_id, $notification_type, $title, $message) {
        $query = "INSERT INTO bayi_notifications (bayi_id, notification_type, title, message)
                  VALUES (:bayi_id, :notification_type, :title, :message)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $bayi_id);
        $stmt->bindParam(':notification_type', $notification_type);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':message', $message);
        
        $stmt->execute();
    }
    
    /**
     * Bayi bildirimlerini getir
     */
    public function bayiBildirimleriGetir($bayi_id, $limit = 20) {
        $query = "SELECT * FROM bayi_notifications 
                  WHERE bayi_id = :bayi_id 
                  ORDER BY created_at DESC 
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':bayi_id', $bayi_id);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Bildirimi okundu olarak işaretle
     */
    public function bildirimOkunduIsaretle($notification_id, $bayi_id) {
        $query = "UPDATE bayi_notifications 
                  SET is_read = 1, read_at = NOW() 
                  WHERE id = :notification_id AND bayi_id = :bayi_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':notification_id', $notification_id);
        $stmt->bindParam(':bayi_id', $bayi_id);
        
        return $stmt->execute();
    }
}
?>