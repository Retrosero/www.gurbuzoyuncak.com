-- Migration: create_search_tables
-- Created at: 1761981108

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
);;