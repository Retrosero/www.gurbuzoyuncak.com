-- Migration: add_favorites_indexes
-- Created at: 1761979269

-- Favoriler için performans indeksleri
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_favorite_id ON favorite_price_history(favorite_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_product_id ON favorite_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_user_id ON favorite_price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_created_at ON favorite_price_history(created_at);
CREATE INDEX IF NOT EXISTS idx_favorite_price_history_notified ON favorite_price_history(notified);

CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_favorite_id ON favorite_stock_alerts(favorite_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_product_id ON favorite_stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_user_id ON favorite_stock_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_created_at ON favorite_stock_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_favorite_stock_alerts_notified ON favorite_stock_alerts(notified);

CREATE INDEX IF NOT EXISTS idx_favorite_notification_settings_user_id ON favorite_notification_settings(user_id);;