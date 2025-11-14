-- Migration: update_campaign_type_constraint
-- Created at: 1761947414

-- Campaign type constraint'ini güncelle
ALTER TABLE campaigns 
DROP CONSTRAINT campaigns_campaign_type_check;

ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_campaign_type_check 
CHECK (campaign_type = ANY (ARRAY['seasonal'::text, 'category'::text, 'brand'::text, 'product'::text, 'cart'::text, 'x_for_y'::text, 'customer_type'::text]));;