-- Migration: create_seo_performance_tables
-- Created at: 1761980212

-- SEO Settings Tablosu
CREATE TABLE seo_settings (
    id SERIAL PRIMARY KEY,
    page_type VARCHAR(50) NOT NULL, -- product, category, home, brand
    entity_id INTEGER, -- product_id, category_id, brand_id
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    structured_data JSONB, -- JSON-LD structured data
    breadcrumbs JSONB, -- Breadcrumb navigation data
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Performance Monitoring Tablosu
CREATE TABLE page_performance (
    id SERIAL PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    load_time INTEGER, -- milliseconds
    page_size INTEGER, -- bytes
    performance_score INTEGER, -- 0-100 score
    first_contentful_paint INTEGER,
    largest_contentful_paint INTEGER,
    cumulative_layout_shift INTEGER,
    first_input_delay INTEGER,
    resource_timings JSONB, -- Detailed resource timing data
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_seo_settings_page_type ON seo_settings(page_type);
CREATE INDEX idx_seo_settings_entity_id ON seo_settings(entity_id);
CREATE INDEX idx_seo_settings_active ON seo_settings(is_active);
CREATE INDEX idx_page_performance_page_url ON page_performance(page_url);
CREATE INDEX idx_page_performance_created_at ON page_performance(created_at);

-- RLS Policies
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_performance ENABLE ROW LEVEL SECURITY;

-- Public read access for SEO settings
CREATE POLICY "SEO settings are viewable by everyone" ON seo_settings
FOR SELECT USING (is_active = true);

-- Admin can manage SEO settings
CREATE POLICY "Admins can manage SEO settings" ON seo_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Performance data can be inserted by anyone (for monitoring)
CREATE POLICY "Anyone can insert performance data" ON page_performance
FOR INSERT WITH CHECK (true);

-- Only admins can read performance data
CREATE POLICY "Admins can read performance data" ON page_performance
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for SEO settings
CREATE TRIGGER update_seo_settings_updated_at 
    BEFORE UPDATE ON seo_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;