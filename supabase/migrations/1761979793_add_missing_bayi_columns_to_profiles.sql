-- Migration: add_missing_bayi_columns_to_profiles
-- Created at: 1761979793

-- Profiles tablosuna eksik bayi kolonlarını ekle (zaten var olanları skip et)
DO $$
BEGIN
    -- is_bayi kolonu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_bayi'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_bayi BOOLEAN DEFAULT false;
    END IF;
    
    -- bayi_discount_percentage kolonu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bayi_discount_percentage'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bayi_discount_percentage DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- bayi_status kolonu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bayi_status'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bayi_status TEXT DEFAULT 'pending';
    END IF;
    
    -- bayi_code kolonu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bayi_code'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bayi_code TEXT;
    END IF;
END $$;;