-- Migration: create_search_and_filtering_system_fixed
-- Created at: 1761981100

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
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products(is_active, stock) WHERE is_active = true AND stock > 0;;