-- XML Progress Tracking için ek sütunlar
ALTER TABLE xml_imports 
ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'initializing',
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status_message TEXT DEFAULT 'Hazırlanıyor',
ADD COLUMN IF NOT EXISTS memory_usage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_progress_update TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_duration INTEGER DEFAULT 0;

-- Status enum'ını güncelle
ALTER TABLE xml_imports 
DROP CONSTRAINT IF EXISTS xml_imports_status_check;

ALTER TABLE xml_imports 
ADD CONSTRAINT xml_imports_status_check 
CHECK (status IN ('processing', 'completed', 'failed', 'cancelled', 'completed_with_errors'));

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_xml_imports_status ON xml_imports(status);
CREATE INDEX IF NOT EXISTS idx_xml_imports_progress ON xml_imports(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_xml_imports_current_stage ON xml_imports(current_stage);

-- Yorumlar
COMMENT ON COLUMN xml_imports.current_stage IS 'Mevcut işlem aşaması: initializing, parsing, parsing_completed, importing, completed';
COMMENT ON COLUMN xml_imports.progress_percentage IS 'Yüzde olarak tamamlanma oranı (0-100)';
COMMENT ON COLUMN xml_imports.status_message IS 'Detaylı durum açıklaması';
COMMENT ON COLUMN xml_imports.memory_usage IS 'MB cinsinden bellek kullanımı';
COMMENT ON COLUMN xml_imports.processing_duration IS 'Milisaniye cinsinden toplam işlem süresi';