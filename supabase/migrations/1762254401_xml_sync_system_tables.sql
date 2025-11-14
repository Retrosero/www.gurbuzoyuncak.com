-- Migration: xml_sync_system_tables
-- Created at: 1762254401

-- XML Senkronizasyon Geçmişi Tablosu
CREATE TABLE IF NOT EXISTS xml_sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'scheduled', 'auto')),
    source_type TEXT NOT NULL CHECK (source_type IN ('file', 'url')),
    source_name TEXT NOT NULL,
    source_url TEXT,
    
    -- İstatistikler
    total_products INTEGER DEFAULT 0,
    new_products INTEGER DEFAULT 0,
    updated_products INTEGER DEFAULT 0,
    deactivated_products INTEGER DEFAULT 0,
    failed_products INTEGER DEFAULT 0,
    skipped_products INTEGER DEFAULT 0,
    
    -- Durum
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    
    -- Progress tracking
    current_stage TEXT,
    progress_percentage INTEGER DEFAULT 0,
    
    -- Zaman bilgileri
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    
    -- Metadata
    file_size_bytes BIGINT,
    xml_format TEXT,
    created_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Senkronizasyon Detay Logları
CREATE TABLE IF NOT EXISTS xml_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id UUID REFERENCES xml_sync_history(id) ON DELETE CASCADE,
    
    product_code TEXT NOT NULL,
    product_name TEXT,
    
    action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'deactivate', 'skip', 'error')),
    
    -- Değişiklik detayları (JSON)
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Otomatik Senkronizasyon Ayarları
CREATE TABLE IF NOT EXISTS xml_sync_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Otomatik senkronizasyon aktif mi?
    is_enabled BOOLEAN DEFAULT false,
    
    -- Zamanlama
    schedule_type TEXT CHECK (schedule_type IN ('minutes', 'hours', 'daily', 'weekly')),
    schedule_value INTEGER,
    cron_expression TEXT,
    
    -- XML Kaynağı
    xml_source_type TEXT CHECK (xml_source_type IN ('url', 'file')),
    xml_source_url TEXT,
    
    -- Son çalışma zamanı
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    
    -- Bildirimler
    send_email_notifications BOOLEAN DEFAULT false,
    notification_emails TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_xml_sync_history_status ON xml_sync_history(status);
CREATE INDEX IF NOT EXISTS idx_xml_sync_history_created_at ON xml_sync_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xml_sync_logs_sync_id ON xml_sync_logs(sync_id);
CREATE INDEX IF NOT EXISTS idx_xml_sync_logs_action ON xml_sync_logs(action);
CREATE INDEX IF NOT EXISTS idx_xml_sync_logs_product_code ON xml_sync_logs(product_code);

-- RLS Politikaları (Admin erişimi)
ALTER TABLE xml_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE xml_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE xml_sync_settings ENABLE ROW LEVEL SECURITY;

-- Admin okuma/yazma
CREATE POLICY "Admin full access to xml_sync_history" ON xml_sync_history
    FOR ALL USING (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Admin full access to xml_sync_logs" ON xml_sync_logs
    FOR ALL USING (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Admin full access to xml_sync_settings" ON xml_sync_settings
    FOR ALL USING (auth.role() IN ('anon', 'service_role'));;