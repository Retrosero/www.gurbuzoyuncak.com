-- Migration: create_xml_scheduled_tasks_table
-- Created at: 1761947721

CREATE TABLE xml_scheduled_tasks (
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

-- Cron işlerini yönetmek için trigger
CREATE OR REPLACE FUNCTION update_next_run_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Eğer cron ifadesi değiştiyse, bir sonraki çalışma zamanını hesapla
    IF NEW.schedule_cron IS NOT NULL AND NEW.schedule_cron != OLD.schedule_cron THEN
        -- Basit bir sonraki tarih hesaplama (günlük için)
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

CREATE TRIGGER update_xml_task_trigger
    BEFORE UPDATE ON xml_scheduled_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_next_run_time();

-- RLS policies
ALTER TABLE xml_scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin'lar tüm scheduled task'ları yönetebilir"
    ON xml_scheduled_tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );;