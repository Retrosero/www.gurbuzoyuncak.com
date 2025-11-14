-- Migration: add_missing_foreign_keys_and_tables
-- Created at: 1762278616

-- Brand ve Category foreign key'leri ekle
ALTER TABLE products 
ADD CONSTRAINT products_brand_id_fkey 
FOREIGN KEY (brand_id) REFERENCES brands(id);

ALTER TABLE products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id);

-- Time limited discounts tablosu oluştur
CREATE TABLE IF NOT EXISTS time_limited_discounts (
  id SERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  discount_percentage DECIMAL(5,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);;