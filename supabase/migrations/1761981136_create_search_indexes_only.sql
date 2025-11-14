-- Migration: create_search_indexes_only
-- Created at: 1761981136

-- Indexler

-- Arama geçmişi indexleri
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_text ON search_queries USING gin(to_tsvector('turkish', query_text));

-- Öneriler indexleri
CREATE INDEX IF NOT EXISTS idx_search_suggestions_term ON search_suggestions(term);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_popularity ON search_suggestions(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_category ON search_suggestions(category);

-- Products tablosu için full-text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('turkish', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('turkish', name));
CREATE INDEX IF NOT EXISTS idx_products_category_search ON products USING gin(to_tsvector('turkish', category_id::text));

-- Arama performansını artırmak için composite indexler
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products(is_active, stock) WHERE is_active = true AND stock > 0;;