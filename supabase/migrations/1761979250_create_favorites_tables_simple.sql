-- Migration: create_favorites_tables_simple
-- Created at: 1761979250

-- Önce sadece kolonu ekle
ALTER TABLE user_favorites 
ADD COLUMN IF NOT EXISTS price_change_threshold DECIMAL(5,2) DEFAULT 5.00;

-- Mevcut user_favorites yapısını kontrol et
-- Kolon zaten var gibi görünüyor, sadece price_change_threshold ekleyelim;