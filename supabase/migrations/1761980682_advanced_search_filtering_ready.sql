-- Migration: advanced_search_filtering_ready
-- Created at: 1761980682

-- GELİŞMİŞ ARAMA VE FİLTRELEME SİSTEMİ
-- Tarih: 2025-11-01
-- Bu migration gelişmiş arama ve filtreleme özelliklerini tamamlar

-- Arama sorguları tablosu
CREATE TABLE IF NOT EXISTS search_queries (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255), -- Oturum bazlı takip için
    query_text VARCHAR(500) NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_result_id INTEGER REFERENCES products(id),
    search_type VARCHAR(50) DEFAULT 'general', -- general, category, brand, price_range
    filters_applied JSONB, -- Uygulanan filtreler
    execution_time_ms INTEGER, -- Sorgu yürütme süresi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arama önerileri tablosu
CREATE TABLE IF NOT EXISTS search_suggestions (
    id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- null means general suggestion
    brand VARCHAR(100), -- null means general suggestion
    popularity_score INTEGER DEFAULT 0,
    search_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'tr',
    suggestion_type VARCHAR(50) DEFAULT 'product', -- product, brand, category, generic
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for term + category + brand combination
    UNIQUE(term, category, brand, suggestion_type)
);

-- Popüler aramalar tablosu
CREATE TABLE IF NOT EXISTS popular_searches (
    id SERIAL PRIMARY KEY,
    query_text VARCHAR(500) NOT NULL,
    search_count INTEGER DEFAULT 1,
    click_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00, -- Click-through rate
    category VARCHAR(100),
    date_range VARCHAR(20) DEFAULT 'all_time', -- today, week, month, all_time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for query + date_range + category
    UNIQUE(query_text, date_range, category)
);

-- Son görüntülenen ürünler tablosu
CREATE TABLE IF NOT EXISTS recently_viewed_products (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    view_duration_seconds INTEGER, -- Görüntüleme süresi
    view_count INTEGER DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for user/product or session/product
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id)
);

-- Ürün arama index tablosu (performans için)
CREATE TABLE IF NOT EXISTS product_search_index (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    search_vector tsvector, -- Full-text search vector
    search_terms TEXT[], -- Aranacak terimler dizisi
    search_rank FLOAT DEFAULT 0, -- Arama relevance score
    search_weight TEXT DEFAULT 'A', -- A, B, C, D (importance weight)
    category_name VARCHAR(255),
    brand_name VARCHAR(255),
    product_name VARCHAR(500),
    description TEXT,
    tags TEXT[] DEFAULT '{}', -- Reserved for future use
    search_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arama istatistikleri tablosu (analytics)
CREATE TABLE IF NOT EXISTS search_analytics (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    total_searches INTEGER DEFAULT 0,
    unique_searchers INTEGER DEFAULT 0,
    avg_results_per_search DECIMAL(8,2) DEFAULT 0,
    avg_execution_time_ms INTEGER DEFAULT 0,
    no_result_searches INTEGER DEFAULT 0,
    popular_category VARCHAR(100),
    popular_term VARCHAR(255),
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    top_search_queries JSONB, -- Top 10 search terms
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for date
    UNIQUE(date)
);

-- İndeksler (performans optimizasyonu)
-- Search queries indexes
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_session_id ON search_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_search_queries_query_text ON search_queries USING gin(to_tsvector('turkish', query_text));
CREATE INDEX IF NOT EXISTS idx_search_queries_filters ON search_queries USING gin(filters_applied);

-- Search suggestions indexes
CREATE INDEX IF NOT EXISTS idx_search_suggestions_term ON search_suggestions(term);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_popularity ON search_suggestions(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_category ON search_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_active ON search_suggestions(is_active, popularity_score DESC);

-- Popular searches indexes
CREATE INDEX IF NOT EXISTS idx_popular_searches_query ON popular_searches(query_text);
CREATE INDEX IF NOT EXISTS idx_popular_searches_count ON popular_searches(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_searches_date_range ON popular_searches(date_range);

-- Recently viewed products indexes
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed_products(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_session ON recently_viewed_products(session_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_last_viewed ON recently_viewed_products(last_viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_product ON recently_viewed_products(product_id);

-- Product search index indexes
CREATE INDEX IF NOT EXISTS idx_product_search_index_vector ON product_search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_product_search_index_product ON product_search_index(product_id);
CREATE INDEX IF NOT EXISTS idx_product_search_index_rank ON product_search_index(search_rank DESC);
CREATE INDEX IF NOT EXISTS idx_product_search_index_category ON product_search_index(category_name);
CREATE INDEX IF NOT EXISTS idx_product_search_index_brand ON product_search_index(brand_name);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_search_analytics_date ON search_analytics(date DESC);

-- Products tablosuna full-text search index ekle
CREATE INDEX IF NOT EXISTS idx_products_search_fulltext ON products 
USING gin(to_tsvector('turkish', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand_name, '')));

-- Products tablosuna fuzzy search için levenshtein index ekle
CREATE INDEX IF NOT EXISTS idx_products_name_levenshtein ON products 
USING gin(name gin_trgm_ops);

-- Categories ve brands için arama indexleri
CREATE INDEX IF NOT EXISTS idx_categories_search ON categories 
USING gin(to_tsvector('turkish', name));

CREATE INDEX IF NOT EXISTS idx_brands_search ON brands 
USING gin(to_tsvector('turkish', name));

-- RLS (Row Level Security) Politikaları
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Search queries policies
CREATE POLICY "Users can view their search queries" ON search_queries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their search queries" ON search_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert search queries" ON search_queries
    FOR INSERT WITH CHECK (user_id IS NULL); -- Anonymous searches

CREATE POLICY "System can update search queries" ON search_queries
    FOR UPDATE USING (true);

-- Search suggestions policies (public read)
CREATE POLICY "Anyone can view active search suggestions" ON search_suggestions
    FOR SELECT USING (is_active = true);

CREATE POLICY "System can manage search suggestions" ON search_suggestions
    FOR ALL USING (true);

-- Popular searches policies (public read)
CREATE POLICY "Anyone can view popular searches" ON popular_searches
    FOR SELECT USING (true);

CREATE POLICY "System can manage popular searches" ON popular_searches
    FOR ALL USING (true);

-- Recently viewed products policies
CREATE POLICY "Users can view their recently viewed products" ON recently_viewed_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their recently viewed products" ON recently_viewed_products
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Session based recently viewed products" ON recently_viewed_products
    FOR SELECT USING (user_id IS NULL);

CREATE POLICY "System can insert recently viewed products" ON recently_viewed_products
    FOR INSERT WITH CHECK (true);

-- Product search index policies (public read)
CREATE POLICY "Anyone can search products" ON product_search_index
    FOR SELECT USING (true);

CREATE POLICY "System can manage product search index" ON product_search_index
    FOR ALL USING (true);

-- Search analytics policies (admin only read)
CREATE POLICY "Admins can view search analytics" ON search_analytics
    FOR SELECT USING (true);

CREATE POLICY "System can manage search analytics" ON search_analytics
    FOR ALL USING (true);

-- Fonksiyonlar ve trigger'lar

-- Search query trigger to update timestamps
CREATE OR REPLACE FUNCTION update_search_query_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_search_query_timestamp_trigger
    BEFORE UPDATE ON search_queries
    FOR EACH ROW
    EXECUTE FUNCTION update_search_query_timestamp();

-- Search suggestion trigger to update timestamps
CREATE OR REPLACE FUNCTION update_search_suggestion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_search_suggestion_timestamp_trigger
    BEFORE UPDATE ON search_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_search_suggestion_timestamp();

-- Popular search trigger to update timestamps
CREATE OR REPLACE FUNCTION update_popular_search_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_popular_search_timestamp_trigger
    BEFORE UPDATE ON popular_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_popular_search_timestamp();

-- Gelişmiş arama fonksiyonu
CREATE OR REPLACE FUNCTION advanced_product_search(
    p_query TEXT,
    p_category_ids INTEGER[] DEFAULT NULL,
    p_brand_ids INTEGER[] DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_in_stock_only BOOLEAN DEFAULT false,
    p_sort_by TEXT DEFAULT 'relevance', -- relevance, name, price_asc, price_desc, newest, popularity
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    product_id INTEGER,
    product_name VARCHAR(500),
    product_code VARCHAR(100),
    base_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    brand_name VARCHAR(255),
    category_name VARCHAR(255),
    stock INTEGER,
    is_featured BOOLEAN,
    search_rank FLOAT,
    snippet TEXT
) AS $$
DECLARE
    search_query TEXT;
    category_filter TEXT := '';
    brand_filter TEXT := '';
    price_filter TEXT := '';
    age_filter TEXT := '';
    stock_filter TEXT := '';
    sort_clause TEXT := '';
BEGIN
    -- Base search query
    search_query := 'to_tsvector(''turkish'', name || '' '' || COALESCE(description, '''') || '' '' || COALESCE(brand_name, '''')) @@ plainto_tsquery(''turkish'', $1)';
    
    -- Category filter
    IF p_category_ids IS NOT NULL AND array_length(p_category_ids, 1) > 0 THEN
        category_filter := ' AND category_id = ANY($2)';
    END IF;
    
    -- Brand filter
    IF p_brand_ids IS NOT NULL AND array_length(p_brand_ids, 1) > 0 THEN
        brand_filter := ' AND brand_id = ANY($3)';
    END IF;
    
    -- Price filter
    IF p_min_price IS NOT NULL THEN
        price_filter := price_filter || ' AND base_price >= $4';
    END IF;
    IF p_max_price IS NOT NULL THEN
        price_filter := price_filter || ' AND base_price <= $5';
    END IF;
    
    -- Stock filter
    IF p_in_stock_only THEN
        stock_filter := ' AND stock > 0';
    END IF;
    
    -- Sort clause
    CASE p_sort_by
        WHEN 'relevance' THEN sort_clause := ' ORDER BY ts_rank(to_tsvector(''turkish'', name || '' '' || COALESCE(description, '''') || '' '' || COALESCE(brand_name, '''')), plainto_tsquery(''turkish'', $1)) DESC';
        WHEN 'name' THEN sort_clause := ' ORDER BY name ASC';
        WHEN 'price_asc' THEN sort_clause := ' ORDER BY base_price ASC';
        WHEN 'price_desc' THEN sort_clause := ' ORDER BY base_price DESC';
        WHEN 'newest' THEN sort_clause := ' ORDER BY created_at DESC';
        WHEN 'popularity' THEN sort_clause := ' ORDER BY view_count DESC, stock DESC';
        ELSE sort_clause := ' ORDER BY ts_rank(to_tsvector(''turkish'', name || '' '' || COALESCE(description, '''') || '' '' || COALESCE(brand_name, '''')), plainto_tsquery(''turkish'', $1)) DESC';
    END CASE;
    
    -- Execute search query
    RETURN QUERY EXECUTE '
        SELECT 
            p.id,
            p.name,
            p.product_code,
            p.base_price,
            COALESCE(p.discount_price, p.base_price) as sale_price,
            b.name as brand_name,
            c.name as category_name,
            p.stock,
            p.is_featured,
            ts_rank(to_tsvector(''turkish'', p.name || '' '' || COALESCE(p.description, '''') || '' '' || COALESCE(p.brand_name, '''')), plainto_tsquery(''turkish'', $1)) as search_rank,
            substring(p.description from 1 for 200) as snippet
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        AND (' || search_query || ')
        ' || category_filter || brand_filter || price_filter || age_filter || stock_filter || '
        ' || sort_clause || '
        LIMIT $8 OFFSET $9'
    USING p_query, p_category_ids, p_brand_ids, p_min_price, p_max_price, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql;

-- Fuzzy search fonksiyonu
CREATE OR REPLACE FUNCTION fuzzy_product_search(
    p_query TEXT,
    p_similarity_threshold FLOAT DEFAULT 0.3,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    product_id INTEGER,
    product_name VARCHAR(500),
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        greatest(
            similarity(p.name, $1),
            similarity(COALESCE(p.product_code, ''), $1),
            similarity(COALESCE(b.name, ''), $1)
        ) as similarity
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = true
    AND (
        similarity(p.name, $1) > $2 OR
        similarity(COALESCE(p.product_code, ''), $1) > $2 OR
        similarity(COALESCE(b.name, ''), $1) > $2
    )
    ORDER BY similarity DESC
    LIMIT $3;
END;
$$ LANGUAGE plpgsql;

-- Auto-complete fonksiyonu
CREATE OR REPLACE FUNCTION get_search_suggestions(
    p_query TEXT,
    p_limit INTEGER DEFAULT 10,
    p_category VARCHAR(100) DEFAULT NULL,
    p_type VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE(
    suggestion VARCHAR(255),
    type VARCHAR(50),
    category VARCHAR(100),
    brand VARCHAR(100),
    count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.term as suggestion,
        ss.suggestion_type as type,
        ss.category,
        ss.brand,
        ss.search_count as count
    FROM search_suggestions ss
    WHERE ss.is_active = true
    AND (
        ss.term ILIKE '%' || p_query || '%' OR
        p_query ILIKE '%' || ss.term || '%'
    )
    AND (ss.category = p_category OR p_category IS NULL)
    AND (ss.suggestion_type = p_type OR p_type IS NULL)
    ORDER BY ss.popularity_score DESC, ss.search_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Yorumlar
COMMENT ON TABLE search_queries IS 'Arama sorgularını ve kullanıcı davranışlarını takip eder';
COMMENT ON TABLE search_suggestions IS 'Auto-complete ve arama önerileri için popüler terimler';
COMMENT ON TABLE popular_searches IS 'Popüler arama terimlerinin zaman bazlı istatistikleri';
COMMENT ON TABLE recently_viewed_products IS 'Kullanıcıların son görüntülediği ürünler';
COMMENT ON TABLE product_search_index IS 'Ürün arama performansını optimize etmek için index tablosu';
COMMENT ON TABLE search_analytics IS 'Arama performansı ve kullanıcı davranış analitikleri';

COMMENT ON FUNCTION advanced_product_search IS 'Gelişmiş ürün arama fonksiyonu - çoklu filtreleme ve sıralama desteği';
COMMENT ON FUNCTION fuzzy_product_search IS 'Fuzzy search için benzerlik bazlı arama';
COMMENT ON FUNCTION get_search_suggestions IS 'Auto-complete ve öneri sistemi için fonksiyon';;