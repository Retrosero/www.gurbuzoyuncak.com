-- Migration: create_admin_features_tables
-- Created at: 1762207143


-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'welcome', 'notification', 'promotion')),
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  target TEXT NOT NULL CHECK (target IN ('all', 'bayi', 'b2c', 'vip', 'specific')),
  target_users TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent')) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  read_count INTEGER DEFAULT 0,
  total_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Alerts Table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  target_price DECIMAL(10,2) NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'price_increase', 'threshold')),
  threshold_percentage DECIMAL(5,2),
  subscribers_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  triggered_count INTEGER DEFAULT 0,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Alert Subscribers Table
CREATE TABLE IF NOT EXISTS price_alert_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT,
  user_email TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Admin only access)
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alert_subscribers ENABLE ROW LEVEL SECURITY;

-- Admin read/write policies
CREATE POLICY "Admins can do everything on email_templates" ON email_templates FOR ALL USING (true);
CREATE POLICY "Admins can do everything on notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Admins can do everything on price_alerts" ON price_alerts FOR ALL USING (true);
CREATE POLICY "Admins can do everything on price_alert_subscribers" ON price_alert_subscribers FOR ALL USING (true);

-- Insert sample data
INSERT INTO email_templates (name, subject, type, content, variables, is_active) VALUES
('Sipariş Onay E-postası', 'Siparişiniz Alındı - #{{order_number}}', 'order', 
 E'Merhaba {{user_name}},\n\n#{{order_number}} numaralı siparişiniz başarıyla alındı.\nToplam tutar: {{order_total}} TL\n\nTeşekkür ederiz,\n{{company_name}}',
 ARRAY['{{user_name}}', '{{order_number}}', '{{order_total}}', '{{company_name}}'],
 true),
('Hoş Geldin E-postası', 'Hoş Geldiniz {{user_name}}!', 'welcome',
 E'Merhaba {{user_name}},\n\n{{company_name}} ailesine hoş geldiniz!\n\nHesabınız başarıyla oluşturuldu.\n\nİyi alışverişler!',
 ARRAY['{{user_name}}', '{{company_name}}'],
 true);

INSERT INTO notifications (title, message, type, target, status, sent_at, read_count, total_recipients) VALUES
('Yeni Kampanya Başladı', 'Oyuncak kategorisinde %30 indirim kampanyası başladı. Kampanyadan yararlanmak için hemen alışverişe başlayın!', 'info', 'all', 'sent', NOW() - INTERVAL '1 day', 234, 450),
('Bakiye Yükleme Hatırlatması', 'Bakiyeniz düşük seviyede. Kesintisiz alışveriş için bakiye yüklemeyi unutmayın.', 'warning', 'bayi', 'sent', NOW() - INTERVAL '2 days', 45, 67);

INSERT INTO price_alerts (product_id, product_name, current_price, target_price, alert_type, subscribers_count, is_active, triggered_count, last_triggered) VALUES
('prod_1', 'LEGO Classic Orta Boy Yapım Kutusu', 899, 799, 'price_drop', 45, true, 3, NOW() - INTERVAL '2 days'),
('prod_2', 'Barbie Sihirli Saç Tasarım Seti', 549, 600, 'price_increase', 23, true, 1, NOW() - INTERVAL '5 days'),
('prod_3', 'Hot Wheels 10''lu Araba Seti', 299, 299, 'threshold', 67, true, 5, NOW() - INTERVAL '1 day');
;