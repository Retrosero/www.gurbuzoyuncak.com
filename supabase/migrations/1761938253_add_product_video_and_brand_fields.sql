-- Migration: add_product_video_and_brand_fields
-- Created at: 1761938253

-- Products tablosuna video ve marka alanları ekle
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS video_type TEXT CHECK (video_type IN ('youtube', 'file')),
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS has_video BOOLEAN DEFAULT false;;