-- Migration: create_favorite_tables_v2
-- Created at: 1761979261

-- Favori fiyat geçmişi tablosu
CREATE TABLE IF NOT EXISTS favorite_price_history (
    id BIGSERIAL PRIMARY KEY,
    favorite_id BIGINT REFERENCES user_favorites(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
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
    id BIGSERIAL PRIMARY KEY,
    favorite_id BIGINT REFERENCES user_favorites(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
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
    id BIGSERIAL PRIMARY KEY,
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
);;