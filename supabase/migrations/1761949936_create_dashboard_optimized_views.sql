-- Migration: create_dashboard_optimized_views
-- Created at: 1761949936

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
  (SELECT COUNT(*) FROM products WHERE stock_quantity < 10 AND stock_quantity > 0) as low_stock_products,
  -- Tükenmiş ürünler  
  (SELECT COUNT(*) FROM products WHERE stock_quantity = 0) as out_of_stock_products,
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
  COALESCE(AVG(p.price), 0) as avg_price,
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
  COALESCE(AVG(p.rating), 0) as avg_rating,
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
  p.stock_quantity,
  c.name as category_name,
  b.name as brand_name,
  CASE 
    WHEN p.stock_quantity = 0 THEN 'out_of_stock'
    WHEN p.stock_quantity < 10 THEN 'low_stock'
    ELSE 'normal'
  END as stock_status,
  CASE 
    WHEN p.stock_quantity = 0 THEN 'critical'
    WHEN p.stock_quantity < 10 THEN 'medium'
    ELSE 'low'
  END as alert_priority
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE (p.stock_quantity < 10 OR p.stock_quantity = 0) 
  AND p.is_active = true
ORDER BY 
  CASE WHEN p.stock_quantity = 0 THEN 1 ELSE 2 END,
  p.stock_quantity ASC;

-- 8. Son aktiviteler için view
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
  'order' as activity_type,
  o.id::text as activity_id,
  'Yeni sipariş #' || o.id as activity_description,
  o.created_at as activity_time,
  o.total_amount as activity_value,
  'orders' as reference_table
FROM orders o
WHERE o.created_at >= (CURRENT_TIMESTAMP - INTERVAL '7 days')

UNION ALL

SELECT 
  'product' as activity_type,
  p.id::text as activity_id,
  'Yeni ürün eklendi: ' || p.name as activity_description,
  p.created_at as activity_time,
  p.price as activity_value,
  'products' as reference_table
FROM products p
WHERE p.created_at >= (CURRENT_TIMESTAMP - INTERVAL '7 days')

UNION ALL

SELECT 
  'customer' as activity_type,
  pr.id::text as activity_id,
  'Yeni müşteri kaydı' as activity_description,
  pr.created_at as activity_time,
  0 as activity_value,
  'profiles' as reference_table
FROM profiles pr
WHERE pr.created_at >= (CURRENT_TIMESTAMP - INTERVAL '7 days')
  AND (pr.role IS NULL OR pr.role != 'admin')

ORDER BY activity_time DESC
LIMIT 20;

-- Performans için indexler ekle
CREATE INDEX IF NOT EXISTS idx_orders_date_payment ON orders(created_at, payment_status);
CREATE INDEX IF NOT EXISTS idx_products_stock_category ON products(stock_quantity, category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id, order_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_status_priority ON stock_alerts(status, priority);

-- Materialized view'lar (düzenli refresh gerekir)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT * FROM dashboard_stats;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_sales AS
SELECT * FROM daily_sales_trend;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_performance AS
SELECT * FROM category_performance;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_brand_performance AS
SELECT * FROM brand_performance;

CREATE INDEX IF NOT EXISTS idx_mv_daily_sales_date ON mv_daily_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_mv_category_perf_sales ON mv_category_performance(total_sales);
CREATE INDEX IF NOT EXISTS idx_mv_brand_perf_sales ON mv_brand_performance(total_sales);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_mviews()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_brand_performance;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh specific materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_mview(view_name text)
RETURNS void AS $$
BEGIN
  CASE view_name
    WHEN 'dashboard_stats' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
    WHEN 'daily_sales' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales;
    WHEN 'category_performance' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_performance;
    WHEN 'brand_performance' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_brand_performance;
    ELSE
      RAISE EXCEPTION 'Unknown view: %', view_name;
  END CASE;
END;
$$ LANGUAGE plpgsql;;