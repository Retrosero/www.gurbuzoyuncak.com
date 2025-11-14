-- Migration: add_campaign_coupon_fields
-- Created at: 1761947209

-- Campaigns tablosuna kupon kodu ve kullanım alanları ekleme
ALTER TABLE campaigns 
ADD COLUMN coupon_code TEXT UNIQUE,
ADD COLUMN usage_limit INTEGER DEFAULT 0,
ADD COLUMN used_count INTEGER DEFAULT 0;;