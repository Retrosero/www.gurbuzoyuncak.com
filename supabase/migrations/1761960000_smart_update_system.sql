-- Akıllı Ürün Güncelleme Sistemi için log tablosu oluştur
CREATE TABLE products_update_log (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL, -- 'insert', 'update', 'batch_update'
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    updated_by UUID,
    user_email VARCHAR(255),
    xml_import_id INTEGER REFERENCES xml_imports(id),
    batch_id VARCHAR(100), -- Batch işlem ID'si
    price_change_amount DECIMAL(10,2), -- Fiyat değişikliği miktarı
    stock_change_amount INTEGER, -- Stok değişikliği miktarı
    update_reason VARCHAR(50), -- 'price_update', 'stock_update', 'info_update', 'bulk_import'
    processing_time_ms INTEGER, -- İşlem süresi (ms)
    memory_usage_mb INTEGER, -- Bellek kullanımı (MB)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler performans için
CREATE INDEX idx_products_update_log_product_id ON products_update_log(product_id);
CREATE INDEX idx_products_update_log_xml_import_id ON products_update_log(xml_import_id);
CREATE INDEX idx_products_update_log_batch_id ON products_update_log(batch_id);
CREATE INDEX idx_products_update_log_created_at ON products_update_log(created_at DESC);

-- Geri dönüş log tablosu
CREATE TABLE products_rollback_log (
    id SERIAL PRIMARY KEY,
    product_update_log_id INTEGER REFERENCES products_update_log(id) ON DELETE CASCADE,
    rollback_data JSONB NOT NULL, -- Geri dönüş için gerekli tüm veri
    rollback_reason VARCHAR(100),
    rolled_back_by UUID,
    rolled_back_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performans izleme için tablo
CREATE TABLE xml_processing_performance (
    id SERIAL PRIMARY KEY,
    xml_import_id INTEGER REFERENCES xml_imports(id),
    batch_number INTEGER,
    batch_size INTEGER,
    processing_time_ms INTEGER,
    memory_peak_mb INTEGER,
    products_processed INTEGER,
    products_updated INTEGER,
    products_inserted INTEGER,
    products_failed INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Politikaları
ALTER TABLE products_update_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_rollback_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE xml_processing_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policy'ler (sadece admin ve import işlemini yapan kullanıcılar erişebilir)
CREATE POLICY "products_update_log_admin_policy" ON products_update_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "products_rollback_log_admin_policy" ON products_rollback_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "xml_processing_performance_admin_policy" ON xml_processing_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Function: İki JSON nesnesinin farkını bul
CREATE OR REPLACE FUNCTION jsonb_diff(old_json JSONB, new_json JSONB)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}'::JSONB;
    key TEXT;
    old_val JSONB;
    new_val JSONB;
BEGIN
    -- Yeni JSON'daki her alanı kontrol et
    FOR key IN SELECT jsonb_object_keys(new_json) LOOP
        old_val := old_json -> key;
        new_val := new_json -> key;
        
        -- Eğer değer değişmişse sonuçta sakla
        IF old_val IS DISTINCT FROM new_val THEN
            result := result || jsonb_build_object(key, jsonb_build_object('old', old_val, 'new', new_val));
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Stok değişikliği hesapla
CREATE OR REPLACE FUNCTION calculate_stock_change(old_stock INTEGER, new_stock INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(new_stock, 0) - COALESCE(old_stock, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Fiyat değişikliği hesapla
CREATE OR REPLACE FUNCTION calculate_price_change(old_price DECIMAL, new_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN COALESCE(new_price, 0) - COALESCE(old_price, 0);
END;
$$ LANGUAGE plpgsql;

-- View: Güncelleme istatistikleri
CREATE VIEW product_update_stats AS
SELECT 
    DATE(created_at) as update_date,
    action,
    update_reason,
    COUNT(*) as total_updates,
    COUNT(CASE WHEN price_change_amount != 0 THEN 1 END) as price_updates,
    COUNT(CASE WHEN stock_change_amount != 0 THEN 1 END) as stock_updates,
    AVG(processing_time_ms) as avg_processing_time_ms,
    AVG(memory_usage_mb) as avg_memory_usage_mb
FROM products_update_log 
GROUP BY DATE(created_at), action, update_reason
ORDER BY update_date DESC;

-- Trigger: Log tablosu için otomatik cleaning (eski kayıtları temizle)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS TRIGGER AS $$
BEGIN
    -- 30 günden eski kayıtları sil (performans için)
    DELETE FROM products_update_log 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Haftalık temizlik
SELECT cron.schedule('weekly-log-cleanup', '0 2 * * 0', 'SELECT cleanup_old_logs();');