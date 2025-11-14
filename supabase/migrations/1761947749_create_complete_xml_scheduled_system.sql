-- Migration: create_complete_xml_scheduled_system
-- Created at: 1761947749

-- profiles tablosuna role alanı ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- xml_scheduled_tasks tablosu oluştur
CREATE TABLE IF NOT EXISTS xml_scheduled_tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    xml_url TEXT NOT NULL,
    schedule_cron VARCHAR(50) NOT NULL DEFAULT '0 2 * * *',
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'disabled')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XML çekme geçmişi için tablo
CREATE TABLE IF NOT EXISTS xml_pull_history (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES xml_scheduled_tasks(id) ON DELETE CASCADE,
    run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
    products_processed INTEGER DEFAULT 0,
    products_imported INTEGER DEFAULT 0,
    products_failed INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time_ms INTEGER,
    response_data JSONB DEFAULT '{}'::jsonb
);

-- Cron işlerini yönetmek için trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_next_run_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Eğer cron ifadesi değiştiyse, bir sonraki çalışma zamanını hesapla
    IF NEW.schedule_cron IS NOT NULL THEN
        -- Basit bir sonraki tarih hesaplama (günlük/haftalık için)
        IF NEW.schedule_cron = '0 2 * * *' THEN
            NEW.next_run = DATE_TRUNC('day', CURRENT_DATE + INTERVAL '1 day') + INTERVAL '2 hours';
        ELSIF NEW.schedule_cron = '0 9 * * *' THEN
            NEW.next_run = DATE_TRUNC('day', CURRENT_DATE + INTERVAL '1 day') + INTERVAL '9 hours';
        ELSIF NEW.schedule_cron = '0 2 * * 1' THEN
            NEW.next_run = DATE_TRUNC('week', CURRENT_DATE + INTERVAL '1 week') + INTERVAL '2 hours';
        ELSE
            -- Genel cron hesaplama (basitleştirilmiş)
            NEW.next_run = CURRENT_DATE + INTERVAL '1 day';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS update_xml_task_trigger ON xml_scheduled_tasks;
CREATE TRIGGER update_xml_task_trigger
    BEFORE UPDATE ON xml_scheduled_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_next_run_time();

-- RLS policies
ALTER TABLE xml_scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE xml_pull_history ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin'lar tüm scheduled task'ları yönetebilir"
    ON xml_scheduled_tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin'lar tüm pull history'yi görüntüleyebilir"
    ON xml_pull_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- System policies (cron jobs için)
CREATE POLICY "Service role her şeyi yapabilir"
    ON xml_scheduled_tasks FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Service role her şeyi yapabilir"
    ON xml_pull_history FOR ALL
    TO service_role
    USING (true);

-- Örnek veri ekle
INSERT INTO xml_scheduled_tasks (name, xml_url, schedule_cron, is_active, next_run) 
VALUES 
('Günlük XML Çekme', 'https://example.com/xml/daily-products.xml', '0 2 * * *', true, DATE_TRUNC('day', CURRENT_DATE + INTERVAL '1 day') + INTERVAL '2 hours')
ON CONFLICT DO NOTHING;;