CREATE TABLE loyalty_rewards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    points INTEGER NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('earned',
    'redeemed',
    'expired')) NOT NULL,
    order_id BIGINT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);