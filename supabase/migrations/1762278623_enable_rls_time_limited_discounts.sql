-- Migration: enable_rls_time_limited_discounts
-- Created at: 1762278623

-- Time limited discounts için RLS aç
ALTER TABLE time_limited_discounts ENABLE ROW LEVEL SECURITY;

-- Public okuma erişimi
CREATE POLICY "Enable read access for all users" ON time_limited_discounts
FOR SELECT USING (true);

-- Public ekleme/güncelleme erişimi (eğer gerekliyse)
CREATE POLICY "Enable all access for all users" ON time_limited_discounts
FOR ALL USING (true);;