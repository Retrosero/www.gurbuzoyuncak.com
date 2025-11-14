-- Migration: create_favorites_notification_settings
-- Created at: 1761979298

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
);

CREATE INDEX IF NOT EXISTS idx_favorite_notification_settings_user_id ON favorite_notification_settings(user_id);;