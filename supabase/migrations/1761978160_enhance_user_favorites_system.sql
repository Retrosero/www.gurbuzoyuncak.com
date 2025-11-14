-- Migration: enhance_user_favorites_system
-- Created at: 1761978160

-- Mevcut user_favorites tablosunu geliştir
ALTER TABLE user_favorites 
ADD COLUMN IF NOT EXISTS added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS notified_price_change BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notified_stock_change BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_change_notified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stock_change_notified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Mevcut created_at kolonunu added_at olarak güncelle
UPDATE user_favorites SET added_at = created_at WHERE added_at IS NULL;

-- Favori ürün fiyat geçmişi tablosu
CREATE TABLE IF NOT EXISTS favorite_price_history (
    id SERIAL PRIMARY KEY,
    favorite_id INTEGER REFERENCES user_favorites(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_type VARCHAR(20) CHECK (change_type IN ('increase', 'decrease')),
    change_percentage DECIMAL(5,2),
    old_stock INTEGER,
    new_stock INTEGER,
    notified BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favori ürün stok bildirimleri tablosu
CREATE TABLE IF NOT EXISTS favorite_stock_alerts (
    id SERIAL PRIMARY KEY,
    favorite_id INTEGER REFERENCES user_favorites(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    previous_stock INTEGER,
    current_stock INTEGER,
    alert_type VARCHAR(20) CHECK (alert_type IN ('restocked', 'low_stock', 'out_of_stock')),
    message TEXT,
    notified BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_favorite_id ON favorite_price_history(favorite_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_product_id ON favorite_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_favorite_id ON favorite_stock_alerts(favorite_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_product_id ON favorite_stock_alerts(product_id);

-- RLS Policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle ve yenilerini oluştur
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON user_favorites;

-- Kullanıcı favorileri politikaları
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON user_favorites
    FOR UPDATE USING (auth.uid() = user_id);

-- Fiyat geçmişi politikaları
DROP POLICY IF EXISTS "Users can view price history of their favorites" ON favorite_price_history;
CREATE POLICY "Users can view price history of their favorites" ON favorite_price_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_favorites 
            WHERE user_favorites.id = favorite_price_history.favorite_id 
            AND user_favorites.user_id = auth.uid()
        )
    );

-- Stok bildirimleri politikaları
DROP POLICY IF EXISTS "Users can view stock alerts of their favorites" ON favorite_stock_alerts;
CREATE POLICY "Users can view stock alerts of their favorites" ON favorite_stock_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_favorites 
            WHERE user_favorites.id = favorite_stock_alerts.favorite_id 
            AND user_favorites.user_id = auth.uid()
        )
    );

-- Updated_at trigger'ı
CREATE TRIGGER update_user_favorites_updated_at 
    BEFORE UPDATE ON user_favorites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;