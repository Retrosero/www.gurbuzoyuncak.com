CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    customer_type TEXT CHECK (customer_type IN ('B2C',
    'B2B',
    'Toptan',
    'Kurumsal')) DEFAULT 'B2C',
    vip_level INTEGER DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    tax_number TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);