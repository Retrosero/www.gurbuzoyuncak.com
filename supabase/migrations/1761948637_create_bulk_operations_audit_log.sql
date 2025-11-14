-- Migration: create_bulk_operations_audit_log
-- Created at: 1761948637

-- Create audit log table for bulk operations
CREATE TABLE IF NOT EXISTS bulk_operations_log (
    id BIGSERIAL PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL, -- 'bulk_update', 'bulk_delete', 'bulk_status_change'
    table_name VARCHAR(100) NOT NULL DEFAULT 'products',
    total_records INTEGER NOT NULL,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    operation_details JSONB, -- Contains specific operation parameters
    error_details JSONB, -- Contains error information if any
    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bulk_operations_log_status ON bulk_operations_log(status);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_log_performed_by ON bulk_operations_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_log_created_at ON bulk_operations_log(created_at);

-- Enable RLS
ALTER TABLE bulk_operations_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON bulk_operations_log
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON bulk_operations_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON bulk_operations_log
    FOR UPDATE USING (auth.role() = 'authenticated');;