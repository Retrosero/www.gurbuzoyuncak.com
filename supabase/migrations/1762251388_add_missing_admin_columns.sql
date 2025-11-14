-- Migration: add_missing_admin_columns
-- Created at: 1762251388

-- Profiles tablosuna eksik kolonları ekle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dealer_approved BOOLEAN DEFAULT false;

-- Mevcut admin kullanıcıları işaretle
UPDATE profiles 
SET is_admin = true 
WHERE email IN (
    'admin@gurbuzoyuncak.com',
    'admin@example.com', 
    'admin@test.com'
);

-- Mevcut bayi kullanıcıları onaylanmış olarak işaretle
UPDATE profiles 
SET dealer_approved = true 
WHERE customer_type IN ('B2B', 'Toptan', 'Kurumsal');;