-- Migration: create_materialized_views_for_dashboard
-- Created at: 1761949992

-- Materialized view'lar oluştur (performans için)

-- Materialized view'lar (düzenli refresh gerekir)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT * FROM dashboard_stats;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_sales AS
SELECT * FROM daily_sales_trend;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_weekly_sales AS
SELECT * FROM weekly_sales_trend;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_sales AS
SELECT * FROM monthly_sales_trend;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_performance AS
SELECT * FROM category_performance;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_brand_performance AS
SELECT * FROM brand_performance;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_stock_alerts_summary AS
SELECT * FROM stock_alerts_summary;

CREATE INDEX IF NOT EXISTS idx_mv_daily_sales_date ON mv_daily_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_mv_weekly_sales_date ON mv_weekly_sales(week_start);
CREATE INDEX IF NOT EXISTS idx_mv_monthly_sales_date ON mv_monthly_sales(month_start);
CREATE INDEX IF NOT EXISTS idx_mv_category_perf_sales ON mv_category_performance(total_sales);
CREATE INDEX IF NOT EXISTS idx_mv_brand_perf_sales ON mv_brand_performance(total_sales);
CREATE INDEX IF NOT EXISTS idx_mv_stock_alerts_status ON mv_stock_alerts_summary(stock_status);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_mviews()
RETURNS void AS $$
BEGIN
  -- CONCURRENTLY kullanamadığımız için normal refresh
  REFRESH MATERIALIZED VIEW mv_dashboard_stats;
  REFRESH MATERIALIZED VIEW mv_daily_sales;
  REFRESH MATERIALIZED VIEW mv_weekly_sales;
  REFRESH MATERIALIZED VIEW mv_monthly_sales;
  REFRESH MATERIALIZED VIEW mv_category_performance;
  REFRESH MATERIALIZED VIEW mv_brand_performance;
  REFRESH MATERIALIZED VIEW mv_stock_alerts_summary;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh specific materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_mview(view_name text)
RETURNS void AS $$
BEGIN
  CASE view_name
    WHEN 'dashboard_stats' THEN
      REFRESH MATERIALIZED VIEW mv_dashboard_stats;
    WHEN 'daily_sales' THEN
      REFRESH MATERIALIZED VIEW mv_daily_sales;
    WHEN 'weekly_sales' THEN
      REFRESH MATERIALIZED VIEW mv_weekly_sales;
    WHEN 'monthly_sales' THEN
      REFRESH MATERIALIZED VIEW mv_monthly_sales;
    WHEN 'category_performance' THEN
      REFRESH MATERIALIZED VIEW mv_category_performance;
    WHEN 'brand_performance' THEN
      REFRESH MATERIALIZED VIEW mv_brand_performance;
    WHEN 'stock_alerts' THEN
      REFRESH MATERIALIZED VIEW mv_stock_alerts_summary;
    ELSE
      RAISE EXCEPTION 'Unknown view: %', view_name;
  END CASE;
END;
$$ LANGUAGE plpgsql;;