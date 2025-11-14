-- Bulk Discount System Migration
-- Oluşturma Tarihi: 2025-11-01

-- Toplu İndirim Sistemi Tablosu
CREATE TABLE bulk_discounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- İndirim Türü
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'x_for_y')),
    discount_value DECIMAL(10,2) NOT NULL, -- percentage için yüzde, fixed için tutar, x_for_y için minimum miktar
    x_value INTEGER, -- X Al Y Öde için X değeri
    y_value INTEGER, -- X Al Y Öde için Y değeri
    
    -- Hedef Seçim Kriterleri
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('all', 'category', 'brand', 'products', 'price_range')),
    
    -- Kategori hedefleri
    target_categories INTEGER[],
    -- Marka hedefleri  
    target_brands INTEGER[],
    -- Ürün hedefleri
    target_products INTEGER[],
    -- Fiyat aralığı
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    
    -- Tarih ve Zaman Planlaması
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    -- Durum ve Ayarlar
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1,
    max_usage_limit INTEGER,
    current_usage_count INTEGER DEFAULT 0,
    
    -- Ek Ayarlar
    stackable BOOLEAN DEFAULT FALSE, -- Diğer indirimlerle birleşebilir mi
    min_order_amount DECIMAL(10,2), -- Minimum sipariş tutarı
    max_discount_amount DECIMAL(10,2), -- Maksimum indirim tutarı (yüzde indirimler için)
    
    -- Preview ve Test
    preview_mode BOOLEAN DEFAULT FALSE,
    preview_affected_products INTEGER[],
    
    -- Meta Bilgiler
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_bulk_discounts_active ON bulk_discounts(is_active) WHERE is_active = true;
CREATE INDEX idx_bulk_discounts_dates ON bulk_discounts(start_date, end_date) WHERE is_active = true;
CREATE INDEX idx_bulk_discounts_type ON bulk_discounts(target_type, discount_type);
CREATE INDEX idx_bulk_discounts_priority ON bulk_discounts(priority DESC) WHERE is_active = true;
CREATE INDEX idx_bulk_discounts_scheduled ON bulk_discounts(scheduled_for) WHERE is_scheduled = true;

-- Bulk Discount İstatistikleri
CREATE TABLE bulk_discount_stats (
    id SERIAL PRIMARY KEY,
    bulk_discount_id INTEGER REFERENCES bulk_discounts(id) ON DELETE CASCADE,
    
    -- İstatistik Verileri
    total_applications INTEGER DEFAULT 0,
    total_discount_amount DECIMAL(12,2) DEFAULT 0,
    affected_products_count INTEGER DEFAULT 0,
    
    -- Son Güncelleme
    last_applied_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bulk_discount_stats_id ON bulk_discount_stats(bulk_discount_id);

-- Trigger: bulk_discount_stats otomatik oluşturma
CREATE OR REPLACE FUNCTION create_bulk_discount_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bulk_discount_stats (bulk_discount_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_bulk_discount_stats
    AFTER INSERT ON bulk_discounts
    FOR EACH ROW
    EXECUTE FUNCTION create_bulk_discount_stats();

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_bulk_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bulk_discounts_updated_at
    BEFORE UPDATE ON bulk_discounts
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_discounts_updated_at();

-- RLS Policies
ALTER TABLE bulk_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_discount_stats ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politika
CREATE POLICY "Admin users can manage bulk discounts" ON bulk_discounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin users can manage bulk discount stats" ON bulk_discount_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Fonksiyonlar

-- Toplu indirim uygulama fonksiyonu
CREATE OR REPLACE FUNCTION apply_bulk_discount(discount_id INTEGER)
RETURNS JSON AS $$
DECLARE
    discount_record bulk_discounts;
    affected_count INTEGER := 0;
    result JSON;
BEGIN
    -- İndirim bilgilerini al
    SELECT * INTO discount_record FROM bulk_discounts WHERE id = discount_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'İndirim bulunamadı');
    END IF;
    
    -- Ürünleri güncelle
    CASE discount_record.target_type
        WHEN 'all' THEN
            -- Tüm ürünler
            UPDATE products SET
                discount_price = CASE 
                    WHEN discount_record.discount_type = 'percentage' THEN 
                        price * (1 - discount_record.discount_value / 100)
                    WHEN discount_record.discount_type = 'fixed' THEN 
                        GREATEST(0, price - discount_record.discount_value)
                    ELSE price
                END,
                bulk_discount_id = discount_id
            WHERE is_active = true;
            
        WHEN 'category' THEN
            -- Kategori bazlı
            UPDATE products SET
                discount_price = CASE 
                    WHEN discount_record.discount_type = 'percentage' THEN 
                        price * (1 - discount_record.discount_value / 100)
                    WHEN discount_record.discount_type = 'fixed' THEN 
                        GREATEST(0, price - discount_record.discount_value)
                    ELSE price
                END,
                bulk_discount_id = discount_id
            WHERE category_id = ANY(discount_record.target_categories)
            AND is_active = true;
            
        WHEN 'brand' THEN
            -- Marka bazlı  
            UPDATE products SET
                discount_price = CASE 
                    WHEN discount_record.discount_type = 'percentage' THEN 
                        price * (1 - discount_record.discount_value / 100)
                    WHEN discount_record.discount_type = 'fixed' THEN 
                        GREATEST(0, price - discount_record.discount_value)
                    ELSE price
                END,
                bulk_discount_id = discount_id
            WHERE brand_id = ANY(discount_record.target_brands)
            AND is_active = true;
            
        WHEN 'products' THEN
            -- Seçili ürünler
            UPDATE products SET
                discount_price = CASE 
                    WHEN discount_record.discount_type = 'percentage' THEN 
                        price * (1 - discount_record.discount_value / 100)
                    WHEN discount_record.discount_type = 'fixed' THEN 
                        GREATEST(0, price - discount_record.discount_value)
                    ELSE price
                END,
                bulk_discount_id = discount_id
            WHERE id = ANY(discount_record.target_products)
            AND is_active = true;
            
        WHEN 'price_range' THEN
            -- Fiyat aralığı bazlı
            UPDATE products SET
                discount_price = CASE 
                    WHEN discount_record.discount_type = 'percentage' THEN 
                        price * (1 - discount_record.discount_value / 100)
                    WHEN discount_record.discount_type = 'fixed' THEN 
                        GREATEST(0, price - discount_record.discount_value)
                    ELSE price
                END,
                bulk_discount_id = discount_id
            WHERE price >= discount_record.min_price 
            AND price <= discount_record.max_price
            AND is_active = true;
    END CASE;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    -- İstatistikleri güncelle
    UPDATE bulk_discount_stats SET
        affected_products_count = affected_count,
        last_applied_at = NOW(),
        updated_at = NOW()
    WHERE bulk_discount_id = discount_id;
    
    -- Bulk discount kullanım sayısını artır
    UPDATE bulk_discounts SET
        current_usage_count = current_usage_count + 1
    WHERE id = discount_id;
    
    RETURN json_build_object(
        'success', true, 
        'affected_products', affected_count,
        'message', 'İndirim başarıyla uygulandı'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toplu indirim kaldırma fonksiyonu
CREATE OR REPLACE FUNCTION remove_bulk_discount(discount_id INTEGER)
RETURNS JSON AS $$
DECLARE
    affected_count INTEGER := 0;
BEGIN
    -- İndirim uygulanan ürünleri sıfırla
    UPDATE products SET
        discount_price = NULL,
        bulk_discount_id = NULL
    WHERE bulk_discount_id = discount_id;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    -- İstatistikleri güncelle
    UPDATE bulk_discount_stats SET
        affected_products_count = 0,
        updated_at = NOW()
    WHERE bulk_discount_id = discount_id;
    
    RETURN json_build_object(
        'success', true, 
        'reset_products', affected_count,
        'message', 'İndirim başarıyla kaldırıldı'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ürünler tablosuna bulk discount alanları ekle
ALTER TABLE products ADD COLUMN IF NOT EXISTS bulk_discount_id INTEGER REFERENCES bulk_discounts(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2);

CREATE INDEX idx_products_bulk_discount ON products(bulk_discount_id);

-- Fonksiyon: Planlanmış indirimleri otomatik uygula
CREATE OR REPLACE FUNCTION apply_scheduled_discounts()
RETURNS JSON AS $$
DECLARE
    discount_record RECORD;
    result JSON;
    total_applied INTEGER := 0;
BEGIN
    -- Süresi gelmiş ve aktif planlanmış indirimleri uygula
    FOR discount_record IN 
        SELECT id FROM bulk_discounts 
        WHERE is_scheduled = true 
        AND is_active = true 
        AND scheduled_for <= NOW()
        AND (end_date IS NULL OR end_date > NOW())
    LOOP
        SELECT apply_bulk_discount(discount_record.id) INTO result;
        IF (result->>'success')::boolean THEN
            total_applied := total_applied + 1;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'total_applied', total_applied,
        'message', total_applied || ' planlanmış indirim uygulandı'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonksiyon: Süresi dolmuş indirimleri kaldır
CREATE OR REPLACE FUNCTION remove_expired_discounts()
RETURNS JSON AS $$
DECLARE
    discount_record RECORD;
    result JSON;
    total_removed INTEGER := 0;
BEGIN
    -- Süresi dolmuş aktif indirimleri kaldır
    FOR discount_record IN 
        SELECT id FROM bulk_discounts 
        WHERE is_active = true 
        AND end_date IS NOT NULL 
        AND end_date <= NOW()
    LOOP
        SELECT remove_bulk_discount(discount_record.id) INTO result;
        IF (result->>'success')::boolean THEN
            total_removed := total_removed + 1;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'total_removed', total_removed,
        'message', total_removed || ' süresi dolmuş indirim kaldırıldı'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Görünüm: Bulk discount özeti
CREATE OR REPLACE VIEW bulk_discount_summary AS
SELECT 
    bd.id,
    bd.name,
    bd.description,
    bd.discount_type,
    bd.discount_value,
    bd.target_type,
    bd.start_date,
    bd.end_date,
    bd.is_active,
    bd.current_usage_count,
    bd.max_usage_limit,
    bds.affected_products_count,
    bds.total_discount_amount,
    bds.last_applied_at
FROM bulk_discounts bd
LEFT JOIN bulk_discount_stats bds ON bd.id = bds.bulk_discount_id
ORDER BY bd.priority DESC, bd.created_at DESC;

-- Komentlar
COMMENT ON TABLE bulk_discounts IS 'Toplu indirim sistemi - admin paneli tarafından yönetilen toplu indirimler';
COMMENT ON TABLE bulk_discount_stats IS 'Bulk discount istatistikleri ve takip verileri';
COMMENT ON COLUMN bulk_discounts.target_type IS 'İndirim hedefi: all (tümü), category (kategori), brand (marka), products (ürünler), price_range (fiyat aralığı)';
COMMENT ON COLUMN bulk_discounts.discount_type IS 'İndirim türü: percentage (yüzde), fixed (sabit tutar), x_for_y (X Al Y Öde)';
COMMENT ON COLUMN bulk_discounts.is_scheduled IS 'İndirimin planlanmış olup olmadığı';
COMMENT ON COLUMN bulk_discounts.scheduled_for IS 'İndirimin uygulanacağı tarih ve saat';
COMMENT ON COLUMN bulk_discounts.preview_mode IS 'Önizleme modu - gerçek ürünler güncellenmez';
COMMENT ON COLUMN bulk_discounts.stackable IS 'Diğer indirimlerle birleştirilebilir mi';