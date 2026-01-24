-- ============================================
-- HIJABI NOUR E-commerce - Supabase Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  name_it TEXT,
  name_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  name_it TEXT,
  name_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  description_it TEXT,
  description_es TEXT,
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROMOTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  min_purchase_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  applicable_to_all_products BOOLEAN DEFAULT false,
  applicable_category_ids UUID[] DEFAULT '{}',
  applicable_product_ids UUID[] DEFAULT '{}',
  usage_limit_per_user INTEGER,
  total_usage_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCT PROMOTIONS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS product_promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, promotion_id)
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_method TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  notes TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_id UUID,
  variant_name TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDER PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  method TEXT NOT NULL,
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_product_promotions_product ON product_promotions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_promotions_promotion ON product_promotions(promotion_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_payments_updated_at BEFORE UPDATE ON order_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO order_count FROM orders;
  new_order_number := 'ORD-' || LPAD(order_count::TEXT, 6, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) LOOP
    order_count := order_count + 1;
    new_order_number := 'ORD-' || LPAD(order_count::TEXT, 6, '0');
  END LOOP;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Admin Users Policies
CREATE POLICY "Admins can view own record"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert own record"
  ON admin_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Categories Policies (Public read, Admin write)
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Products Policies (Public read, Admin write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Promotions Policies (Public read, Admin write)
CREATE POLICY "Anyone can view active promotions"
  ON promotions FOR SELECT
  USING (is_active = true AND NOW() >= start_date AND NOW() <= end_date);

CREATE POLICY "Admins can manage promotions"
  ON promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Product Promotions Policies
CREATE POLICY "Anyone can view product promotions"
  ON product_promotions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product promotions"
  ON product_promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Orders Policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Order Items Policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Order Payments Policies
CREATE POLICY "Users can view own order payments"
  ON order_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_payments.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Admins can view all order payments"
  ON order_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name, name_fr, slug, description, is_active) VALUES
  ('Hijabs', 'Hijabs', 'hijabs', 'Collection de hijabs', true),
  ('Abayas', 'Abayas', 'abayas', 'Collection d''abayas', true),
  ('Ensemble', 'Ensemble', 'ensemble', 'Ensembles complets', true),
  ('Boxes Cadeau', 'Boxes Cadeau', 'boxes-cadeau', 'Boxes cadeau', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- 1. Make sure to create an admin user in the admin_users table after creating a user in auth.users
-- 2. Update the admin_users table with your user_id after authentication
-- 3. Test RLS policies to ensure they work as expected
-- 4. Consider adding more indexes based on your query patterns
-- 5. Add foreign key constraints where needed
-- 6. Consider adding soft delete functionality if needed

