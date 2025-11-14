CREATE TABLE balance_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    transaction_type TEXT CHECK (transaction_type IN ('deposit',
    'withdrawal',
    'order_payment')) NOT NULL,
    amount NUMERIC NOT NULL,
    balance_before NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,
    description TEXT,
    payment_provider TEXT,
    payment_reference TEXT,
    status TEXT CHECK (status IN ('pending',
    'completed',
    'failed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);