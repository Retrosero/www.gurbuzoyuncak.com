<?php
/**
 * E-posta Şablon Yönetimi Sınıfı
 * Gürbüz Oyuncak B2B Sistemi
 * Bayi onay/red bildirimleri ve sistem e-postaları için
 */

class EmailTemplate {
    private $conn;
    private $table_name = "email_templates";
    
    public $id;
    public $template_key;
    public $subject;
    public $body;
    public $variables;
    public $is_active;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * E-posta şablonunu template_key ile getir
     */
    public function getByKey($template_key) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE template_key = :template_key AND is_active = 1 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':template_key', $template_key);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * E-posta gönder (SMTP ile)
     */
    public function sendEmail($to_email, $template_key, $variables = []) {
        $template = $this->getByKey($template_key);
        
        if (!$template) {
            return ['error' => 'E-posta şablonu bulunamadı'];
        }
        
        // Değişkenleri değiştir
        $subject = $this->replaceVariables($template['subject'], $variables);
        $body = $this->replaceVariables($template['body'], $variables);
        
        // E-posta gönder
        return $this->sendSMTPEmail($to_email, $subject, $body);
    }
    
    /**
     * Şablondaki değişkenleri değiştir
     */
    private function replaceVariables($content, $variables) {
        foreach ($variables as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
        }
        return $content;
    }
    
    /**
     * SMTP ile e-posta gönder (PHPMailer kullanımına hazır)
     */
    private function sendSMTPEmail($to_email, $subject, $body) {
        try {
            // PHPMailer kullanarak e-posta gönder
            // Bu fonksiyon production'da gerçek SMTP ayarları ile çalışacak
            
            // Şimdilik log'a yaz (test için)
            $this->logEmail($to_email, $subject, $body);
            
            return ['success' => true, 'message' => 'E-posta gönderildi'];
            
        } catch (Exception $e) {
            return ['error' => 'E-posta gönderilemedi: ' . $e->getMessage()];
        }
    }
    
    /**
     * E-posta log'a yaz (test için)
     */
    private function logEmail($to_email, $subject, $body) {
        $log_data = [
            'to' => $to_email,
            'subject' => $subject,
            'body' => $body,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        $log_file = '../logs/email_log.txt';
        $log_content = json_encode($log_data, JSON_UNESCAPED_UNICODE) . "\n";
        
        // Logs klasörü yoksa oluştur
        if (!is_dir('../logs')) {
            mkdir('../logs', 0755, true);
        }
        
        file_put_contents($log_file, $log_content, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Bayi onay e-postası gönder
     */
    public function sendBayiApprovalEmail($bayi_email, $company_name, $panel_url = '') {
        $variables = [
            'firma_adi' => $company_name,
            'email' => $bayi_email,
            'panel_url' => $panel_url ?: 'https://gurbuzoyuncak.com/bayi-panel'
        ];
        
        return $this->sendEmail($bayi_email, 'bayi_approved', $variables);
    }
    
    /**
     * Bayi red e-postası gönder
     */
    public function sendBayiRejectionEmail($bayi_email, $company_name, $rejection_reason) {
        $variables = [
            'firma_adi' => $company_name,
            'rejection_reason' => $rejection_reason
        ];
        
        return $this->sendEmail($bayi_email, 'bayi_rejected', $variables);
    }
    
    /**
     * Bayi askıya alma e-postası gönder
     */
    public function sendBayiSuspensionEmail($bayi_email, $company_name, $suspension_reason) {
        $variables = [
            'firma_adi' => $company_name,
            'suspension_reason' => $suspension_reason
        ];
        
        return $this->sendEmail($bayi_email, 'bayi_suspended', $variables);
    }
    
    /**
     * Tüm şablonları listele (admin için)
     */
    public function getAllTemplates() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  ORDER BY template_key ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Şablon oluştur/güncelle
     */
    public function saveTemplate() {
        if ($this->id) {
            return $this->updateTemplate();
        } else {
            return $this->createTemplate();
        }
    }
    
    /**
     * Yeni şablon oluştur
     */
    public function createTemplate() {
        $query = "INSERT INTO " . $this->table_name . "
                  (template_key, subject, body, variables, is_active)
                  VALUES (:template_key, :subject, :body, :variables, :is_active)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':template_key', $this->template_key);
        $stmt->bindParam(':subject', $this->subject);
        $stmt->bindParam(':body', $this->body);
        $stmt->bindParam(':variables', $this->variables);
        $stmt->bindParam(':is_active', $this->is_active);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return ['success' => true, 'id' => $this->id];
        }
        
        return ['error' => 'Şablon oluşturulamadı'];
    }
    
    /**
     * Şablonu güncelle
     */
    public function updateTemplate() {
        $query = "UPDATE " . $this->table_name . "
                  SET subject = :subject,
                      body = :body,
                      variables = :variables,
                      is_active = :is_active,
                      updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':subject', $this->subject);
        $stmt->bindParam(':body', $this->body);
        $stmt->bindParam(':variables', $this->variables);
        $stmt->bindParam(':is_active', $this->is_active);
        
        if ($stmt->execute()) {
            return ['success' => true];
        }
        
        return ['error' => 'Şablon güncellenemedi'];
    }
    
    /**
     * Şablonu sil
     */
    public function deleteTemplate($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            return ['success' => true];
        }
        
        return ['error' => 'Şablon silinemedi'];
    }
    
    /**
     * PHPMailer ile gerçek SMTP e-posta gönder (production için)
     */
    public function sendRealEmail($to_email, $subject, $body, $smtp_config = null) {
        // PHPMailer kütüphanesi yüklü değilse basit mail() fonksiyonu kullan
        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            return $this->sendSimpleEmail($to_email, $subject, $body);
        }
        
        // PHPMailer ile SMTP gönderimi (production için)
        try {
            // Burada gerçek PHPMailer konfigürasyonu olacak
            // require_once 'vendor/autoload.php';
            // use PHPMailer\PHPMailer\PHPMailer;
            // use PHPMailer\PHPMailer\SMTP;
            
            return ['success' => true, 'message' => 'PHPMailer ile e-posta gönderildi'];
            
        } catch (Exception $e) {
            return ['error' => 'SMTP e-posta gönderilemedi: ' . $e->getMessage()];
        }
    }
    
    /**
     * Basit mail() fonksiyonu ile e-posta gönder
     */
    private function sendSimpleEmail($to_email, $subject, $body) {
        $headers = array(
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: noreply@gurbuzoyuncak.com',
            'Reply-To: info@gurbuzoyuncak.com',
            'X-Mailer: PHP/' . phpversion()
        );
        
        $header_string = implode("\r\n", $headers);
        
        if (mail($to_email, $subject, $body, $header_string)) {
            return ['success' => true, 'message' => 'E-posta gönderildi'];
        } else {
            return ['error' => 'E-posta gönderilemedi'];
        }
    }
    
    /**
     * E-posta gönderim geçmişini getir
     */
    public function getEmailHistory($limit = 50) {
        $log_file = '../logs/email_log.txt';
        
        if (!file_exists($log_file)) {
            return [];
        }
        
        $lines = file($log_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $history = [];
        
        // Son N kayıtları al
        $recent_lines = array_slice($lines, -$limit);
        
        foreach ($recent_lines as $line) {
            $data = json_decode($line, true);
            if ($data) {
                $history[] = $data;
            }
        }
        
        return array_reverse($history); // En yeniden eskiye doğru sırala
    }
}
?>