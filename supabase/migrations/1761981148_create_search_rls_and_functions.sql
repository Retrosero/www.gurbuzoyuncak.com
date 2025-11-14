-- Migration: create_search_rls_and_functions
-- Created at: 1761981148

-- RLS politikaları
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi arama geçmişlerini görebilir
CREATE POLICY "Users can view own search queries" ON search_queries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search queries" ON search_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Öneriler herkese açık (sadece okuma)
CREATE POLICY "Anyone can view active suggestions" ON search_suggestions
    FOR SELECT USING (is_active = true);

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
$$;;