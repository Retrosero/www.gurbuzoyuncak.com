CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    customer_type TEXT CHECK (customer_type IN ('B2C',
    'B2B',
    'Toptan',
    'Kurumsal')),
    discount_percentage NUMERIC NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);