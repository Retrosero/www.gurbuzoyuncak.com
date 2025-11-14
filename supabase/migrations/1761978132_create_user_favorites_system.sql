-- Migration: create_user_favorites_system
-- Created at: 1761978132

-- User Favorites System Tables
-- Kullanıcı favorileri, fiyat takibi ve stok bildirimleri için tablo yapısı

-- Kullanıcı favorileri tablosu
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notified_price_change BOOLEAN DEFAULT false,
    notified_stock_change BOOLEAN DEFAULT false,
    price_change_notified_at TIMESTAMP WITH TIME ZONE,
    stock_change_notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Favori ürün fiyat geçmişi tablosu
CREATE TABLE favorite_price_history (
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
CREATE TABLE favorite_stock_alerts (
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
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX idx_favorite_price_history_favorite_id ON favorite_price_history(favorite_id);
CREATE INDEX idx_favorite_price_history_product_id ON favorite_price_history(product_id);
CREATE INDEX idx_favorite_stock_alerts_favorite_id ON favorite_stock_alerts(favorite_id);
CREATE INDEX idx_favorite_stock_alerts_product_id ON favorite_stock_alerts(product_id);

-- RLS Policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Kullanıcı favorileri politikaları
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON user_favorites
    FOR UPDATE USING (auth.uid() = user_id);

-- Fiyat geçmişi politikaları (sadece kendi favorilerindeki ürünler için)
CREATE POLICY "Users can view price history of their favorites" ON favorite_price_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_favorites 
            WHERE user_favorites.id = favorite_price_history.favorite_id 
            AND user_favorites.user_id = auth.uid()
        )
    );

-- Stok bildirimleri politikaları (sadece kendi favorilerindeki ürünler için)
CREATE POLICY "Users can view stock alerts of their favorites" ON favorite_stock_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_favorites 
            WHERE user_favorites.id = favorite_stock_alerts.favorite_id 
            AND user_favorites.user_id = auth.uid()
        )
    );

-- Updated_at trigger'ları
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_favorites_updated_at 
    BEFORE UPDATE ON user_favorites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Favori sistemi için fonksiyonlar
-- Favori ekleme/çıkarma fonksiyonu
CREATE OR REPLACE FUNCTION toggle_user_favorite(p_product_id BIGINT)
RETURNS JSON AS $$
DECLARE
    user_uuid UUID;
    existing_favorite_id INTEGER;
    result JSON;
    current_price DECIMAL(10,2);
    current_stock INTEGER;
BEGIN
    -- Kullanıcı ID'sini al
    SELECT auth.uid() INTO user_uuid;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Mevcut favoriyi kontrol et
    SELECT id INTO existing_favorite_id
    FROM user_favorites
    WHERE user_id = user_uuid AND product_id = p_product_id;
    
    IF existing_favorite_id IS NOT NULL THEN
        -- Favori varsa sil
        DELETE FROM user_favorites WHERE id = existing_favorite_id;
        
        result := json_build_object(
            'action', 'removed',
            'product_id', p_product_id
        );
    ELSE
        -- Favori yoksa ekle ve fiyat/stok bilgilerini kaydet
        SELECT base_price, stock INTO current_price, current_stock
        FROM products WHERE id = p_product_id;
        
        INSERT INTO user_favorites (user_id, product_id)
        VALUES (user_uuid, p_product_id)
        RETURNING id INTO existing_favorite_id;
        
        -- İlk fiyat geçmişini kaydet
        INSERT INTO favorite_price_history (
            favorite_id, product_id, old_price, new_price, 
            change_type, change_percentage, old_stock, new_stock
        ) VALUES (
            existing_favorite_id, p_product_id, 
            current_price, current_price, 'increase', 0, 
            current_stock, current_stock
        );
        
        result := json_build_object(
            'action', 'added',
            'product_id', p_product_id,
            'favorite_id', existing_favorite_id
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcı favori sayısını getiren fonksiyon
CREATE OR REPLACE FUNCTION get_user_favorites_count()
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
    user_uuid UUID;
BEGIN
    SELECT auth.uid() INTO user_uuid;
    
    IF user_uuid IS NULL THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO count_result
    FROM user_favorites
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(count_result, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;