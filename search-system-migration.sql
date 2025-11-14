-- Arama ve filtreleme sistemi tabloları

-- Arama sorguları geçmişi tablosu
CREATE TABLE IF NOT EXISTS search_queries (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_text VARCHAR(255) NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_result_id INTEGER,
    search_type VARCHAR(50) DEFAULT 'general', -- general, category, brand, price
    filters_applied JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arama önerileri tablosu
CREATE TABLE IF NOT EXISTS search_suggestions (
    id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    brand_name VARCHAR(100),
    popularity_score INTEGER DEFAULT 0,
    search_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Son görüntülenen ürünler tablosu
CREATE TABLE IF NOT EXISTS recently_viewed_products (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Arama geçmişi indexleri
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_text ON search_queries USING gin(to_tsvector('turkish', query_text));

-- Öneriler indexleri
CREATE INDEX IF NOT EXISTS idx_search_suggestions_term ON search_suggestions(term);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_popularity ON search_suggestions(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_category ON search_suggestions(category);

-- Son görüntülenen ürünler indexleri
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON recently_viewed_products(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_product_id ON recently_viewed_products(product_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON recently_viewed_products(viewed_at DESC);

-- Products tablosu için full-text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('turkish', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('turkish', name));
CREATE INDEX IF NOT EXISTS idx_products_category_search ON products USING gin(to_tsvector('turkish', category_id::text));

-- Arama performansını artırmak için composite indexler
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products(is_active, stock) WHERE is_active = true AND stock > 0;

-- RLS politikaları
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed_products ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi arama geçmişlerini görebilir
CREATE POLICY "Users can view own search queries" ON search_queries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search queries" ON search_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Öneriler herkese açık (sadece okuma)
CREATE POLICY "Anyone can view active suggestions" ON search_suggestions
    FOR SELECT USING (is_active = true);

-- Kullanıcılar kendi son görüntüledikleri ürünleri görebilir
CREATE POLICY "Users can view own recently viewed" ON recently_viewed_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recently viewed" ON recently_viewed_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recently viewed" ON recently_viewed_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recently viewed" ON recently_viewed_products
    FOR DELETE USING (auth.uid() = user_id);

-- Fonksiyonlar

-- Arama sorgusu kaydetme fonksiyonu
CREATE OR REPLACE FUNCTION save_search_query(
    p_user_id UUID,
    p_query_text VARCHAR(255),
    p_results_count INTEGER DEFAULT 0,
    p_clicked_result_id INTEGER DEFAULT NULL,
    p_search_type VARCHAR(50) DEFAULT 'general',
    p_filters_applied JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO search_queries (
        user_id, 
        query_text, 
        results_count, 
        clicked_result_id, 
        search_type, 
        filters_applied
    ) VALUES (
        p_user_id,
        p_query_text,
        p_results_count,
        p_clicked_result_id,
        p_search_type,
        p_filters_applied
    );
    
    -- Arama önerilerini güncelle
    INSERT INTO search_suggestions (term, search_count, popularity_score)
    VALUES (p_query_text, 1, 1)
    ON CONFLICT (term) 
    DO UPDATE SET 
        search_count = search_suggestions.search_count + 1,
        popularity_score = search_suggestions.search_count + 1,
        updated_at = NOW();
END;
$$;

-- Son görüntülenen ürün ekleme fonksiyonu
CREATE OR REPLACE FUNCTION add_recently_viewed(
    p_user_id UUID,
    p_product_id BIGINT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO recently_viewed_products (user_id, product_id)
    VALUES (p_user_id, p_product_id)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET viewed_at = NOW();
    
    -- En fazla 20 ürün tut
    DELETE FROM recently_viewed_products 
    WHERE user_id = p_user_id 
    AND id NOT IN (
        SELECT id FROM recently_viewed_products 
        WHERE user_id = p_user_id 
        ORDER BY viewed_at DESC 
        LIMIT 20
    );
END;
$$;

-- Popüler arama terimlerini getiren fonksiyon
CREATE OR REPLACE FUNCTION get_popular_searches(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    term VARCHAR(255),
    search_count INTEGER,
    category VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.term, s.search_count, s.category
    FROM search_suggestions s
    WHERE s.is_active = true
    ORDER BY s.popularity_score DESC, s.search_count DESC
    LIMIT limit_count;
END;
$$;