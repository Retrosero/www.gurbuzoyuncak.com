<?php
/**
 * Kullanıcı Sınıfı - Kayıt, Giriş, Profil Yönetimi
 */

class User {
    private $conn;
    private $table_name = "users";
    
    public $id;
    public $email;
    public $password;
    public $password_hash;
    public $first_name;
    public $last_name;
    public $phone;
    public $role;
    public $is_active;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Kullanıcı kaydı oluştur
     */
    public function register() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    email = :email,
                    password_hash = :password_hash,
                    first_name = :first_name,
                    last_name = :last_name,
                    phone = :phone,
                    role = 'customer',
                    is_active = 1,
                    email_verified = 0";
        
        $stmt = $this->conn->prepare($query);
        
        // Şifreyi hash'le
        $this->password_hash = password_hash($this->password, PASSWORD_BCRYPT);
        
        // Temizle
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        
        // Bağla
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password_hash', $this->password_hash);
        $stmt->bindParam(':first_name', $this->first_name);
        $stmt->bindParam(':last_name', $this->last_name);
        $stmt->bindParam(':phone', $this->phone);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    /**
     * Kullanıcı girişi
     */
    public function login() {
        $query = "SELECT id, email, password_hash, first_name, last_name, role, is_active
                FROM " . $this->table_name . "
                WHERE email = :email
                LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row && password_verify($this->password, $row['password_hash'])) {
            if ($row['is_active'] == 1) {
                // Son giriş zamanını güncelle
                $this->updateLastLogin($row['id']);
                
                return [
                    'id' => $row['id'],
                    'email' => $row['email'],
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'],
                    'role' => $row['role']
                ];
            } else {
                return ['error' => 'Hesabınız aktif değil'];
            }
        }
        
        return false;
    }
    
    /**
     * Email'in zaten kullanılıp kullanılmadığını kontrol et
     */
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
    
    /**
     * Kullanıcı bilgilerini getir
     */
    public function read() {
        $query = "SELECT id, email, first_name, last_name, phone, role, created_at
                FROM " . $this->table_name . "
                WHERE id = :id
                LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Profil güncelle
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    first_name = :first_name,
                    last_name = :last_name,
                    phone = :phone
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        
        $stmt->bindParam(':first_name', $this->first_name);
        $stmt->bindParam(':last_name', $this->last_name);
        $stmt->bindParam(':phone', $this->phone);
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }
    
    /**
     * Son giriş zamanını güncelle
     */
    private function updateLastLogin($user_id) {
        $query = "UPDATE " . $this->table_name . " SET last_login = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
    }
    
    /**
     * Şifre değiştir
     */
    public function changePassword($old_password, $new_password) {
        // Önce mevcut şifreyi kontrol et
        $query = "SELECT password_hash FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row && password_verify($old_password, $row['password_hash'])) {
            // Yeni şifreyi güncelle
            $query = "UPDATE " . $this->table_name . " SET password_hash = :password_hash WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
            
            $stmt->bindParam(':password_hash', $new_hash);
            $stmt->bindParam(':id', $this->id);
            
            return $stmt->execute();
        }
        
        return false;
    }
}
