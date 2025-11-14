-- Migration: create_favorites_tracking_tables
-- Created at: 1761979289

-- Yeni favoriler tablosu oluştur (mevcut olanla çakışmayacak)
CREATE TABLE IF NOT EXISTS favorite_price_tracking (
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

-- Stok uyarıları tablosu
CREATE TABLE IF NOT EXISTS favorite_stock_tracking (
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

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_favorite_price_tracking_favorite_id ON favorite_price_tracking(favorite_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_tracking_product_id ON favorite_price_tracking(product_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_tracking_user_id ON favorite_price_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_tracking_created_at ON favorite_price_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_favorite_price_tracking_notified ON favorite_price_tracking(notified);

CREATE INDEX IF NOT EXISTS idx_favorite_stock_tracking_favorite_id ON favorite_stock_tracking(favorite_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_tracking_product_id ON favorite_stock_tracking(product_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_tracking_user_id ON favorite_stock_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_tracking_created_at ON favorite_stock_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_tracking_notified ON favorite_stock_tracking(notified);;