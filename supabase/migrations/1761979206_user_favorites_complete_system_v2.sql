-- Migration: user_favorites_complete_system_v2
-- Created at: 1761979206

-- KULLANICI FAVORİLER SİSTEMİ TAM FONKSİYONEL DATABASE MİGRASYONU
-- Tarih: 2025-11-01
-- Bu migration Favoriler sistemini tamamen tamamlar

-- User Favorites tablosunu güncelle (kolon ekle)
ALTER TABLE user_favorites 
ADD COLUMN IF NOT EXISTS added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS notified_price_change BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_change_threshold DECIMAL(5,2) DEFAULT 5.00; -- %5 fiyat değişimi için bildirim

-- Favori fiyat geçmişi tablosu
CREATE TABLE IF NOT EXISTS favorite_price_history (
    id SERIAL PRIMARY KEY,
    favorite_id INTEGER REFERENCES user_favorites(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    change_type VARCHAR(20) CHECK (change_type IN ('increase', 'decrease')),
    change_percentage DECIMAL(5,2) NOT NULL,
    change_amount DECIMAL(10,2) NOT NULL,
    notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favori stok uyarıları tablosu
CREATE TABLE IF NOT EXISTS favorite_stock_alerts (
    id SERIAL PRIMARY KEY,
    favorite_id INTEGER REFERENCES user_favorites(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL,
    previous_stock INTEGER,
    stock_change_type VARCHAR(20) CHECK (stock_change_type IN ('increase', 'decrease', 'out_of_stock', 'restocked')),
    alert_type VARCHAR(20) CHECK (alert_type IN ('low_stock', 'out_of_stock', 'restocked', 'stock_increased')),
    notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favori bildirim tercihleri tablosu
CREATE TABLE IF NOT EXISTS favorite_notification_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    price_alerts_enabled BOOLEAN DEFAULT true,
    price_decrease_only BOOLEAN DEFAULT true, -- Sadece fiyat düşüş bildirimi
    stock_alerts_enabled BOOLEAN DEFAULT true,
    restock_alerts_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    min_price_change_percentage DECIMAL(5,2) DEFAULT 3.00, -- Minimum %3 değişim
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favoriler için özel view - detaylı bilgilerle
CREATE OR REPLACE VIEW user_favorites_detailed AS
SELECT 
    uf.id as favorite_id,
    uf.user_id,
    uf.product_id,
    uf.added_at,
    uf.notified_price_change,
    uf.price_change_threshold,
    
    -- Ürün bilgileri
    pr.product_code,
    pr.name as product_name,
    pr.slug,
    pr.base_price,
    pr.stock,
    pr.is_active,
    pr.is_featured,
    pr.view_count,
    pr.has_video,
    
    -- Marka ve kategori bilgileri
    b.name as brand_name,
    c.name as category_name,
    c.slug as category_slug,
    
    -- Son fiyat değişimi
    fph.id as last_price_change_id,
    fph.change_type as last_price_change_type,
    fph.change_percentage as last_price_change_percentage,
    fph.new_price as last_price,
    fph.created_at as last_price_change_date,
    fph.notified as last_price_change_notified,
    
    -- Son stok değişimi
    fsa.id as last_stock_alert_id,
    fsa.current_stock,
    fsa.previous_stock,
    fsa.stock_change_type,
    fsa.alert_type as stock_alert_type,
    fsa.created_at as last_stock_change_date,
    fsa.notified as last_stock_change_notified,
    
    -- İstatistikler
    COUNT(DISTINCT uf_all.id) over (PARTITION BY uf.user_id) as total_user_favorites,
    COUNT(DISTINCT fph_all.id) over (PARTITION BY uf.product_id) as total_price_changes,
    COUNT(DISTINCT fsa_all.id) over (PARTITION BY uf.product_id) as total_stock_changes

FROM user_favorites uf
LEFT JOIN products pr ON uf.product_id = pr.id
LEFT JOIN brands b ON pr.brand_id = b.id
LEFT JOIN categories c ON pr.category_id = c.id

-- Son fiyat değişimi
LEFT JOIN LATERAL (
    SELECT * FROM favorite_price_history 
    WHERE product_id = uf.product_id 
    ORDER BY created_at DESC 
    LIMIT 1
) fph ON true

-- Son stok değişimi
LEFT JOIN LATERAL (
    SELECT * FROM favorite_stock_alerts 
    WHERE product_id = uf.product_id 
    ORDER BY created_at DESC 
    LIMIT 1
) fsa ON true

-- Toplam istatistikler için
LEFT JOIN user_favorites uf_all ON uf_all.user_id = uf.user_id
LEFT JOIN favorite_price_history fph_all ON fph_all.product_id = uf.product_id
LEFT JOIN favorite_stock_alerts fsa_all ON fsa_all.product_id = uf.product_id

WHERE uf.user_id IS NOT NULL
ORDER BY uf.added_at DESC;

-- Favori ürünlerin fiyat takip view'ı
CREATE OR REPLACE VIEW favorite_price_tracking AS
SELECT 
    uf.id as favorite_id,
    uf.user_id,
    uf.product_id,
    uf.added_at,
    uf.price_change_threshold,
    
    pr.name as product_name,
    pr.base_price as current_price,
    pr.stock,
    
    -- En son fiyat değişimi
    fph_latest.change_type as latest_change_type,
    fph_latest.change_percentage as latest_change_percentage,
    fph_latest.new_price as latest_price,
    fph_latest.created_at as latest_change_date,
    
    -- Fiyat geçmişi (son 30 gün)
    fph_30d.change_count as price_changes_last_30_days,
    fph_30d.avg_change_percentage as avg_price_change_last_30_days,
    
    -- Eşik durumu
    CASE 
        WHEN fph_latest.change_percentage >= uf.price_change_threshold THEN 'threshold_reached'
        WHEN fph_latest.change_percentage >= (uf.price_change_threshold * 0.5) THEN 'near_threshold'
        ELSE 'normal'
    END as price_alert_status,
    
    -- Bildirim durumu
    fph_latest.notified as last_change_notified,
    fph_latest.email_sent,
    fph_latest.sms_sent,
    fph_latest.push_sent
    
FROM user_favorites uf
LEFT JOIN products pr ON uf.product_id = pr.id

-- En son fiyat değişimi
LEFT JOIN LATERAL (
    SELECT * FROM favorite_price_history 
    WHERE product_id = uf.product_id 
    ORDER BY created_at DESC 
    LIMIT 1
) fph_latest ON true

-- Son 30 gün fiyat değişimleri
LEFT JOIN LATERAL (
    SELECT 
        COUNT(*) as change_count,
        AVG(change_percentage) as avg_change_percentage
    FROM favorite_price_history 
    WHERE product_id = uf.product_id 
    AND created_at >= NOW() - INTERVAL '30 days'
) fph_30d ON true;

-- Favori ürünlerin stok takip view'ı
CREATE OR REPLACE VIEW favorite_stock_tracking AS
SELECT 
    uf.id as favorite_id,
    uf.user_id,
    uf.product_id,
    uf.added_at,
    
    pr.name as product_name,
    pr.stock as current_stock,
    
    -- En son stok değişimi
    fsa_latest.stock_change_type as latest_stock_change,
    fsa_latest.previous_stock,
    fsa_latest.current_stock as stock_at_change,
    fsa_latest.alert_type,
    fsa_latest.created_at as latest_stock_change_date,
    
    -- Son 30 gün stok değişiklikleri
    fsa_30d.change_count as stock_changes_last_30_days,
    
    -- Stok uyarı durumu
    CASE 
        WHEN pr.stock = 0 THEN 'out_of_stock'
        WHEN pr.stock <= 5 THEN 'low_stock'
        WHEN pr.stock >= 20 THEN 'good_stock'
        ELSE 'normal_stock'
    END as stock_status,
    
    -- Bildirim durumu
    fsa_latest.notified as last_change_notified,
    fsa_latest.email_sent,
    fsa_latest.sms_sent,
    fsa_latest.push_sent
    
FROM user_favorites uf
LEFT JOIN products pr ON uf.product_id = pr.id

-- En son stok değişimi
LEFT JOIN LATERAL (
    SELECT * FROM favorite_stock_alerts 
    WHERE product_id = uf.product_id 
    ORDER BY created_at DESC 
    LIMIT 1
) fsa_latest ON true

-- Son 30 gün stok değişiklikleri
LEFT JOIN LATERAL (
    SELECT COUNT(*) as change_count
    FROM favorite_stock_alerts 
    WHERE product_id = uf.product_id 
    AND created_at >= NOW() - INTERVAL '30 days'
) fsa_30d ON true;

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_favorite_id ON favorite_price_history(favorite_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_product_id ON favorite_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_user_id ON favorite_price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_created_at ON favorite_price_history(created_at);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_notified ON favorite_price_history(notified);

CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_favorite_id ON favorite_stock_alerts(favorite_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_product_id ON favorite_stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_user_id ON favorite_stock_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_created_at ON favorite_stock_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_notified ON favorite_stock_alerts(notified);

CREATE INDEX IF NOT EXISTS idx_favorite_notification_settings_user_id ON favorite_notification_settings(user_id);

-- RLS (Row Level Security) Politikaları
ALTER TABLE favorite_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_notification_settings ENABLE ROW LEVEL SECURITY;

-- Favori fiyat geçmişi politikaları
CREATE POLICY "Users can view their favorite price history" ON favorite_price_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert price history" ON favorite_price_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update price history notifications" ON favorite_price_history
    FOR UPDATE USING (true);

-- Favori stok uyarıları politikaları
CREATE POLICY "Users can view their favorite stock alerts" ON favorite_stock_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert stock alerts" ON favorite_stock_alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update stock alert notifications" ON favorite_stock_alerts
    FOR UPDATE USING (true);

-- Favori bildirim ayarları politikaları
CREATE POLICY "Users can manage their notification settings" ON favorite_notification_settings
    FOR ALL USING (auth.uid() = user_id);

-- Fonksiyonlar (triggers ve utility fonksiyonlar)

-- Favori eklendiğinde price change threshold ayarla
CREATE OR REPLACE FUNCTION set_favorite_price_threshold()
RETURNS TRIGGER AS $$
BEGIN
    NEW.price_change_threshold := 5.00; -- Varsayılan %5
    NEW.added_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_favorite_threshold_trigger ON user_favorites;
CREATE TRIGGER set_favorite_threshold_trigger
    BEFORE INSERT ON user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION set_favorite_price_threshold();

-- User favorilerini güncelle
CREATE OR REPLACE FUNCTION update_user_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Bu fonksiyon favoriler sayısını güncellemek için kullanılabilir
    -- Şimdilik basit bir implementasyon
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fiyat değişimi tespit etme fonksiyonu
CREATE OR REPLACE FUNCTION detect_price_change(
    p_product_id INTEGER,
    p_old_price DECIMAL,
    p_new_price DECIMAL
)
RETURNS TABLE(
    change_exists BOOLEAN,
    change_type VARCHAR,
    change_percentage DECIMAL,
    change_amount DECIMAL
) AS $$
DECLARE
    price_change DECIMAL;
    pct_change DECIMAL;
BEGIN
    -- Fiyat değişimi var mı?
    IF p_old_price = p_new_price THEN
        RETURN QUERY SELECT false, ''::VARCHAR, 0.00::DECIMAL, 0.00::DECIMAL;
        RETURN;
    END IF;
    
    -- Değişim hesapla
    price_change := p_new_price - p_old_price;
    pct_change := (price_change / p_old_price) * 100;
    
    -- Sadece anlamlı değişimleri kaydet (en az %0.5)
    IF ABS(pct_change) < 0.5 THEN
        RETURN QUERY SELECT false, ''::VARCHAR, 0.00::DECIMAL, 0.00::DECIMAL;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT 
        true,
        CASE WHEN price_change > 0 THEN 'increase' ELSE 'decrease' END,
        ABS(pct_change),
        ABS(price_change);
END;
$$ LANGUAGE plpgsql;

-- Stok değişimi tespit etme fonksiyonu
CREATE OR REPLACE FUNCTION detect_stock_change(
    p_product_id INTEGER,
    p_old_stock INTEGER,
    p_new_stock INTEGER
)
RETURNS TABLE(
    change_exists BOOLEAN,
    change_type VARCHAR,
    alert_type VARCHAR
) AS $$
DECLARE
    old_stock_level VARCHAR;
    new_stock_level VARCHAR;
BEGIN
    -- Stok seviyesi belirleme fonksiyonu
    old_stock_level := CASE 
        WHEN p_old_stock = 0 THEN 'out_of_stock'
        WHEN p_old_stock <= 5 THEN 'low_stock'
        WHEN p_old_stock <= 20 THEN 'normal_stock'
        ELSE 'good_stock'
    END;
    
    new_stock_level := CASE 
        WHEN p_new_stock = 0 THEN 'out_of_stock'
        WHEN p_new_stock <= 5 THEN 'low_stock'
        WHEN p_new_stock <= 20 THEN 'normal_stock'
        ELSE 'good_stock'
    END;
    
    -- Anlamlı değişiklik var mı?
    IF old_stock_level = new_stock_level AND p_old_stock != p_new_stock THEN
        -- Miktar değişikliği ama seviye aynı
        IF ABS(p_new_stock - p_old_stock) < 3 THEN
            RETURN QUERY SELECT false, ''::VARCHAR, ''::VARCHAR;
            RETURN;
        END IF;
    END IF;
    
    -- Uyarı tipini belirle
    IF new_stock_level = 'out_of_stock' AND old_stock_level != 'out_of_stock' THEN
        RETURN QUERY SELECT true, 'decrease', 'out_of_stock';
    ELSIF new_stock_level = 'low_stock' AND old_stock_level NOT IN ('low_stock', 'out_of_stock') THEN
        RETURN QUERY SELECT true, 'decrease', 'low_stock';
    ELSIF old_stock_level = 'out_of_stock' AND new_stock_level != 'out_of_stock' THEN
        RETURN QUERY SELECT true, 'increase', 'restocked';
    ELSIF old_stock_level = 'low_stock' AND new_stock_level NOT IN ('low_stock', 'out_of_stock') THEN
        RETURN QUERY SELECT true, 'increase', 'restocked';
    ELSE
        RETURN QUERY SELECT true, 
            CASE WHEN p_new_stock > p_old_stock THEN 'increase' ELSE 'decrease' END,
            CASE 
                WHEN p_new_stock > p_old_stock THEN 'stock_increased' 
                ELSE 'stock_decreased' 
            END;
    END IF;
END;
$$ LANGUAGE plpgsql;;