-- Migration: create_favorites_system_tables
-- Created at: 1761979224

-- Favoriler sistemi için temel tablolar
ALTER TABLE user_favorites 
ADD COLUMN IF NOT EXISTS added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS notified_price_change BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_change_threshold DECIMAL(5,2) DEFAULT 5.00;

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
    price_decrease_only BOOLEAN DEFAULT true,
    stock_alerts_enabled BOOLEAN DEFAULT true,
    restock_alerts_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    min_price_change_percentage DECIMAL(5,2) DEFAULT 3.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
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

CREATE INDEX IF NOT EXISTS idx_favorite_notification_settings_user_id ON favorite_notification_settings(user_id);;