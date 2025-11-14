CREATE TABLE xml_imports (
    id BIGSERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    total_products INTEGER DEFAULT 0,
    imported_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('processing',
    'completed',
    'failed')) DEFAULT 'processing',
    error_log JSONB DEFAULT '[]'::jsonb,
    imported_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);