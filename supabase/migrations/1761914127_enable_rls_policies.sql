-- Migration: enable_rls_policies
-- Created at: 1761914127

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_limited_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE xml_imports ENABLE ROW LEVEL SECURITY;

-- Public read access for product-related tables
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read brands" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read product_variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public can read home_sections" ON home_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read pricing_rules" ON pricing_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read time_limited_discounts" ON time_limited_discounts FOR SELECT USING (is_active = true);

-- User profile policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can insert profiles" ON profiles FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Order policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Balance and loyalty policies
CREATE POLICY "Users can view own balance transactions" ON balance_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own loyalty rewards" ON loyalty_rewards FOR SELECT USING (auth.uid() = user_id);

-- Admin access (service_role can do everything)
CREATE POLICY "Service role full access categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access brands" ON brands FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access products" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access variants" ON product_variants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access images" ON product_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access pricing" ON pricing_rules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access coupons" ON coupons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access discounts" ON time_limited_discounts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access order items" ON order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access balance" ON balance_transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access loyalty" ON loyalty_rewards FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access home sections" ON home_sections FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access xml imports" ON xml_imports FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');;