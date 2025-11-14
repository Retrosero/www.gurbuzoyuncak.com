-- Migration: add_product_advanced_pricing_and_files
-- Created at: 1762195000

-- products tablosuna çoklu fiyat kolonları ekle
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS campaign_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS b2b_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10, 2);

-- product_files tablosu oluştur (PDF/EXCEL ekleri için)
CREATE TABLE IF NOT EXISTS product_files (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'excel', 'document'
  file_size BIGINT, -- bytes cinsinden
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_product_files_product_id ON product_files(product_id);

-- RLS politikaları ekle
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "product_files_select_policy" ON product_files
  FOR SELECT USING (true);

-- Sadece admin ekleyebilir/güncelleyebilir/silebilir
CREATE POLICY "product_files_insert_policy" ON product_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND customer_type = 'Admin'
    )
  );

CREATE POLICY "product_files_update_policy" ON product_files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND customer_type = 'Admin'
    )
  );

CREATE POLICY "product_files_delete_policy" ON product_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND customer_type = 'Admin'
    )
  );

-- Comments
COMMENT ON COLUMN products.purchase_price IS 'Alış fiyatı (maliyet)';
COMMENT ON COLUMN products.campaign_price IS 'Kampanya fiyatı';
COMMENT ON COLUMN products.b2b_price IS 'B2B fiyatı';
COMMENT ON COLUMN products.wholesale_price IS 'Toptan fiyatı';
COMMENT ON TABLE product_files IS 'Ürün ekleri (PDF, Excel vb.)';
;