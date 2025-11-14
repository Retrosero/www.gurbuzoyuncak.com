-- Migration: create_notification_reporting_system
-- Created at: 1761977363

-- Email şablonları tablosu
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- stock_alert, sale_report, price_drop, daily_report, weekly_report
    variables JSONB, -- template değişkenleri için
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email gönderim logları tablosu
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    template_id INTEGER REFERENCES email_templates(id),
    subject VARCHAR(500) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL, -- sent, failed, pending
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fiyat düşüş bildirimleri tablosu
CREATE TABLE price_alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    product_id INTEGER REFERENCES products(id),
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    alert_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Kullanıcı bildirim ayarları
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    stock_alerts BOOLEAN DEFAULT true,
    price_drop_alerts BOOLEAN DEFAULT true,
    sale_reports BOOLEAN DEFAULT true,
    daily_reports BOOLEAN DEFAULT false,
    weekly_reports BOOLEAN DEFAULT true,
    notification_frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, daily, weekly
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rapor zamanlama tablosu
CREATE TABLE report_schedules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- sales, stock, revenue, products
    frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    recipients JSONB NOT NULL, -- email listesi
    last_sent TIMESTAMP WITH TIME ZONE,
    next_send TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    filters JSONB, -- rapor filtresi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bildirim geçmişi
CREATE TABLE notification_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type VARCHAR(50) NOT NULL, -- stock_low, price_drop, order_status, system_alert
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX idx_price_alerts_user_product ON price_alerts(user_id, product_id);
CREATE INDEX idx_price_alerts_alert_sent ON price_alerts(alert_sent);
CREATE INDEX idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX idx_notification_history_user ON notification_history(user_id);
CREATE INDEX idx_notification_history_created ON notification_history(created_at);
CREATE INDEX idx_report_schedules_next_send ON report_schedules(next_send);

-- RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;

-- Admin rolü için politikalar
CREATE POLICY "Admin can manage email templates" ON email_templates FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view email logs" ON email_logs FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Users can manage their price alerts" ON price_alerts FOR ALL TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Users can manage their notification settings" ON notification_settings FOR ALL TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Users can view their notifications" ON notification_history FOR ALL TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can manage report schedules" ON report_schedules FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);;