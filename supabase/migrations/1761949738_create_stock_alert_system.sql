-- Migration: create_stock_alert_system
-- Created at: 1761949738

-- Stok uyarı sistemi için gerekli tablolar

-- Stok uyarılar tablosu
CREATE TABLE stock_alerts (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'critical_stock')),
    current_stock INTEGER NOT NULL,
    threshold_value INTEGER NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ NULL,
    resolved_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ NULL,
    email_recipients TEXT[]
);

-- Admin ayarları tablosu (genel admin ayarları)
CREATE TABLE admin_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Stok uyarı ayarları için örnek admin ayarları
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES 
('stock_low_threshold', '10', 'number', 'Düşük stok eşik değeri'),
('stock_critical_threshold', '5', 'number', 'Kritik stok eşik değeri'),
('stock_out_threshold', '0', 'number', 'Stok tükendi eşik değeri'),
('stock_alert_email_enabled', 'true', 'boolean', 'Stok uyarı e-postalarını etkinleştir'),
('stock_alert_email_recipients', '["admin@gurbuzoyuncak.com", "stok@gurbuzoyuncak.com"]', 'json', 'E-posta alıcı listesi'),
('stock_check_frequency', '60', 'number', 'Stok kontrol sıklığı (dakika)'),
('stock_auto_resolve', 'false', 'boolean', 'Stok dolduğunda uyarıları otomatik çöz'),
('stock_alert_webhook', '', 'text', 'Webhook URL (opsiyonel)');

-- RLS politikaları
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Stok uyarılar için RLS politikaları
CREATE POLICY "Enable read access for authenticated users" ON stock_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON stock_alerts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON stock_alerts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Admin ayarları için RLS politikaları (sadece admin kullanıcılar)
CREATE POLICY "Enable read access for admin users" ON admin_settings
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Enable update access for admin users" ON admin_settings
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Enable insert access for admin users" ON admin_settings
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- İndeksler
CREATE INDEX idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_status ON stock_alerts(status);
CREATE INDEX idx_stock_alerts_created_at ON stock_alerts(created_at);
CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);

-- Trigger: updated_at otomatik güncellemesi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;