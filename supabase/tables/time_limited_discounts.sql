CREATE TABLE time_limited_discounts (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    discount_percentage NUMERIC NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);