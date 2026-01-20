-- ============================================
-- PROMOTIONS AND ORDERS TABLES SETUP
-- Run this script in Supabase SQL Editor
-- ============================================

-- ============================================
-- OPTION 1: DROP AND RECREATE (RECOMMENDED FOR FRESH START)
-- Uncomment below if you want to start fresh
-- ============================================

DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;

-- ============================================
-- 1. CREATE PROMOTIONS TABLE
-- ============================================

CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  is_active BOOLEAN DEFAULT true,
  min_purchase_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  applicable_categories TEXT[],
  applicable_products UUID[],
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on code only for non-null values
CREATE UNIQUE INDEX idx_promotions_code ON promotions(code) WHERE code IS NOT NULL;
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

-- ============================================
-- 2. CREATE ORDERS TABLE
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  shipping_address JSONB,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
  promotion_code VARCHAR(50),
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for orders
CREATE INDEX idx_orders_reference ON orders(reference);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 3. CREATE FUNCTION TO INCREMENT PROMOTION USAGE
-- ============================================

CREATE OR REPLACE FUNCTION increment_promotion_usage(p_promotion_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE promotions 
  SET 
    usage_count = COALESCE(usage_count, 0) + 1,
    updated_at = NOW()
  WHERE id = p_promotion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. CREATE FUNCTION TO UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES FOR PROMOTIONS
-- ============================================

CREATE POLICY "Public can read all promotions" ON promotions
  FOR SELECT USING (true);

CREATE POLICY "Public can insert promotions" ON promotions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update promotions" ON promotions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public can delete promotions" ON promotions
  FOR DELETE USING (true);

-- ============================================
-- 7. CREATE RLS POLICIES FOR ORDERS
-- ============================================

CREATE POLICY "Public can read orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update orders" ON orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================
-- 8. VERIFICATION
-- ============================================

SELECT 'SUCCESS! Tables created:' as message;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN ('promotions', 'orders');
