CREATE TABLE home_sections (
    id BIGSERIAL PRIMARY KEY,
    section_type TEXT CHECK (section_type IN ('best_sellers',
    'new_arrivals',
    'editor_picks',
    'featured_categories')) NOT NULL,
    title TEXT NOT NULL,
    product_ids JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);