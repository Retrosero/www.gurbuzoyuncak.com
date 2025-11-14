-- Gelişmiş Ürün Detay Sayfası için Database Tabloları

-- Ürün Yorumları Tablosu
CREATE TABLE product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- İndeksler
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_product_reviews_created_at ON product_reviews(created_at);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);

-- Ürün Görselleri Tablosu
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    image_type VARCHAR(20) DEFAULT 'gallery' CHECK (image_type IN ('gallery', 'thumbnail', '360', 'video_thumbnail')),
    file_size BIGINT,
    dimensions VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON product_images(sort_order);
CREATE INDEX idx_product_images_is_primary ON product_images(is_primary);

-- Ürün Spesifikasyonları Tablosu
CREATE TABLE product_specifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    spec_name VARCHAR(255) NOT NULL,
    spec_value TEXT NOT NULL,
    spec_group VARCHAR(100) DEFAULT 'Genel',
    sort_order INTEGER DEFAULT 0,
    is_highlighted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_product_specifications_product_id ON product_specifications(product_id);
CREATE INDEX idx_product_specifications_spec_group ON product_specifications(spec_group);
CREATE INDEX idx_product_specifications_sort_order ON product_specifications(sort_order);

-- Benzer Ürünler Tablosu
CREATE TABLE related_products (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    related_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    relation_type VARCHAR(20) DEFAULT 'similar' CHECK (relation_type IN ('similar', 'alternative', 'complementary', 'bought_together', 'viewed_together')),
    relevance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, related_product_id, relation_type)
);

-- İndeksler
CREATE INDEX idx_related_products_product_id ON related_products(product_id);
CREATE INDEX idx_related_products_related_product_id ON related_products(related_product_id);
CREATE INDEX idx_related_products_relation_type ON related_products(relation_type);

-- Ürün Fiyat Geçmişi Tablosu
CREATE TABLE product_price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    change_type VARCHAR(20) DEFAULT 'manual' CHECK (change_type IN ('manual', 'discount', 'promotion', 'bulk_price', 'dynamic_pricing')),
    discount_percentage DECIMAL(5,2),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_product_price_history_product_id ON product_price_history(product_id);
CREATE INDEX idx_product_price_history_valid_from ON product_price_history(valid_from);
CREATE INDEX idx_product_price_history_created_at ON product_price_history(created_at);

-- Ürün Stok Hareketleri Tablosu
CREATE TABLE product_stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'return', 'damage')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_product_stock_movements_product_id ON product_stock_movements(product_id);
CREATE INDEX idx_product_stock_movements_created_at ON product_stock_movements(created_at);
CREATE INDEX idx_product_stock_movements_type ON product_stock_movements(movement_type);

-- Kullanıcı Görüntüleme Geçmişi Tablosu
CREATE TABLE user_product_views (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- İndeksler
CREATE INDEX idx_user_product_views_user_id ON user_product_views(user_id);
CREATE INDEX idx_user_product_views_product_id ON user_product_views(product_id);
CREATE INDEX idx_user_product_views_viewed_at ON user_product_views(viewed_at);

-- Ürün İstatistikleri Tablosu (Analytics için)
CREATE TABLE product_analytics (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    cart_additions INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    average_time_on_page INTEGER, -- saniye cinsinden
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, date)
);

-- İndeksler
CREATE INDEX idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX idx_product_analytics_date ON product_analytics(date);

-- Review Helpfulness Tablosu
CREATE TABLE review_votes (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES product_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- İndeksler
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);

-- Güncelleme trigger fonksiyonları
CREATE OR REPLACE FUNCTION update_product_review_helpfulness()
RETURNS TRIGGER AS $$
BEGIN
    -- Update helpful count based on votes
    UPDATE product_reviews 
    SET helpful_count = (
        SELECT COUNT(*) FROM review_votes 
        WHERE review_id = NEW.review_id AND vote_type = 'helpful'
    ),
    not_helpful_count = (
        SELECT COUNT(*) FROM review_votes 
        WHERE review_id = NEW.review_id AND vote_type = 'not_helpful'
    )
    WHERE id = NEW.review_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for review votes
CREATE TRIGGER trigger_update_review_helpfulness
    AFTER INSERT ON review_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_product_review_helpfulness();

-- Ürün stok seviyesi güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_product_stock_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Stok hareketi kaydedildiğinde analytics tablosunu güncelle
    INSERT INTO product_analytics (product_id, date, views, unique_views, cart_additions, purchases)
    VALUES (NEW.product_id, CURRENT_DATE, 0, 0, 0, 0)
    ON CONFLICT (product_id, date) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Analytics update trigger
CREATE TRIGGER trigger_update_stock_analytics
    AFTER INSERT ON product_stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock_analytics();

-- RLS (Row Level Security) politikaları

-- Product reviews policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approved reviews" ON product_reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can insert their own reviews" ON product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON product_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Review votes policies
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view review votes" ON review_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_votes
    FOR UPDATE USING (auth.uid() = user_id);

-- User product views policies
ALTER TABLE user_product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own product views" ON user_product_views
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product views" ON user_product_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for analytics
CREATE POLICY "Admins can view all product analytics" ON product_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Sample data for testing
INSERT INTO product_specifications (product_id, spec_name, spec_value, spec_group, sort_order, is_highlighted) VALUES
(1, 'Yaş Grubu', '3-6 yaş', 'Genel', 1, true),
(1, 'Malzeme', 'Plastik', 'Genel', 2, false),
(1, 'Boyutlar', '25 x 15 x 10 cm', 'Fiziksel', 3, false),
(1, 'Ağırlık', '500g', 'Fiziksel', 4, false),
(1, 'Pil', '3xAA (dahil değil)', 'Teknik', 5, false),
(1, 'Garanti', '2 yıl', 'Garanti', 6, true);

-- Default related products (empty, will be populated by system)
-- Related products will be generated automatically based on category, brand, price range