-- Migration: create_dashboard_optimized_views_fixed
-- Created at: 1761949964

-- Dashboard için optimized view'lar oluşturuluyor

-- 1. Ana dashboard istatistikleri için view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
  (SELECT COUNT(*) FROM categories WHERE level = 1) as total_categories,
  (SELECT COUNT(*) FROM brands WHERE is_active = true) as total_brands,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM profiles WHERE role IS NULL OR role != 'admin') as total_customers,
  -- Düşük stoklu ürünler
  (SELECT COUNT(*) FROM products WHERE stock < 10 AND stock > 0) as low_stock_products,
  -- Tükenmiş ürünler  
  (SELECT COUNT(*) FROM products WHERE stock = 0) as out_of_stock_products,
  -- Aktif stok uyarıları
  (SELECT COUNT(*) FROM stock_alerts WHERE status = 'active') as active_stock_alerts,
  (SELECT COUNT(*) FROM stock_alerts WHERE status = 'active' AND priority IN ('critical', 'high')) as critical_stock_alerts,
  -- Sipariş durumları
  (SELECT COUNT(*) FROM orders WHERE order_status = 'pending') as pending_orders,
  (SELECT COUNT(*) FROM orders WHERE order_status = 'delivered') as completed_orders,
  (SELECT COUNT(*) FROM orders WHERE order_status = 'cancelled') as cancelled_orders,
  -- Ciro hesaplamaları
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = CURRENT_DATE) as daily_revenue,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= DATE_TRUNC('week', CURRENT_DATE)) as weekly_revenue,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_revenue,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid') as total_revenue;

-- 2. Günlük satış trendi için view
CREATE OR REPLACE VIEW daily_sales_trend AS
SELECT 
  DATE(created_at) as sale_date,
  COUNT(*) as order_count,
  COALESCE(SUM(total_amount), 0) as total_sales,
  AVG(total_amount) as avg_order_value
FROM orders 
WHERE payment_status = 'paid' 
  AND created_at >= (CURRENT_DATE - INTERVAL '30 days')
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- 3. Haftalık satış trendi için view
CREATE OR REPLACE VIEW weekly_sales_trend AS
SELECT 
  DATE_TRUNC('week', created_at) as week_start,
  COUNT(*) as order_count,
  COALESCE(SUM(total_amount), 0) as total_sales,
  AVG(total_amount) as avg_order_value
FROM orders 
WHERE payment_status = 'paid' 
  AND created_at >= (CURRENT_DATE - INTERVAL '12 weeks')
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- 4. Aylık satış trendi için view
CREATE OR REPLACE VIEW monthly_sales_trend AS
SELECT 
  DATE_TRUNC('month', created_at) as month_start,
  COUNT(*) as order_count,
  COALESCE(SUM(total_amount), 0) as total_sales,
  AVG(total_amount) as avg_order_value
FROM orders 
WHERE payment_status = 'paid' 
  AND created_at >= (CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month_start DESC;

-- 5. Kategori performansı için view
CREATE OR REPLACE VIEW category_performance AS
SELECT 
  c.id,
  c.name as category_name,
  COUNT(DISTINCT p.id) as product_count,
  COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_sales,
  COALESCE(AVG(p.base_price), 0) as avg_price,
  COUNT(DISTINCT o.id) as total_orders
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
WHERE c.level = 1 AND c.is_active = true
GROUP BY c.id, c.name
ORDER BY total_sales DESC;

-- 6. Marka performansı için view
CREATE OR REPLACE VIEW brand_performance AS
SELECT 
  b.id,
  b.name as brand_name,
  COUNT(DISTINCT p.id) as product_count,
  COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_sales,
  COALESCE(AVG(p.discount_price), 0) as avg_price,
  COUNT(DISTINCT o.id) as total_orders
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = true
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
WHERE b.is_active = true
GROUP BY b.id, b.name
ORDER BY total_sales DESC;

-- 7. Stok uyarıları için view
CREATE OR REPLACE VIEW stock_alerts_summary AS
SELECT 
  p.id,
  p.name,
  p.stock,
  c.name as category_name,
  b.name as brand_name,
  CASE 
    WHEN p.stock = 0 THEN 'out_of_stock'
    WHEN p.stock < 10 THEN 'low_stock'
    ELSE 'normal'
  END as stock_status,
  CASE 
    WHEN p.stock = 0 THEN 'critical'
    WHEN p.stock < 10 THEN 'medium'
    ELSE 'low'
  END as alert_priority
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE (p.stock < 10 OR p.stock = 0) 
  AND p.is_active = true
ORDER BY 
  CASE WHEN p.stock = 0 THEN 1 ELSE 2 END,
  p.stock ASC;

-- Performans için indexler ekle
CREATE INDEX IF NOT EXISTS idx_orders_date_payment ON orders(created_at, payment_status);
CREATE INDEX IF NOT EXISTS idx_products_stock_category ON products(stock, category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id, order_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_status_priority ON stock_alerts(status, priority);;