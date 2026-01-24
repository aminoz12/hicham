-- =====================================================
-- COMPLETE ORDERS SYSTEM FOR HIJABI INOOR
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing orders table if needed (backup data first!)
-- DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table with complete shipping info
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  
  -- Shipping Address (stored as JSONB)
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "firstName": "...",
  --   "lastName": "...",
  --   "address": "...",
  --   "address2": "...",
  --   "city": "...",
  --   "postalCode": "...",
  --   "country": "FR",
  --   "countryName": "France"
  -- }
  
  -- Order Items (stored as JSONB array)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "product_id": "...",
  --   "product_name": "...",
  --   "product_image": "...",
  --   "quantity": 1,
  --   "price": 13.00,
  --   "color": "...",
  --   "size": "..."
  -- }]
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
  promotion_code VARCHAR(50),
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Order Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Possible values: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  
  -- Payment Information
  payment_method VARCHAR(50) DEFAULT 'sumup_card',
  payment_status VARCHAR(50) DEFAULT 'pending',
  -- Possible values: 'pending', 'paid', 'failed', 'refunded', 'cancelled'
  sumup_checkout_id VARCHAR(255),
  sumup_transaction_code VARCHAR(255),
  
  -- Shipping Information
  tracking_number VARCHAR(255),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Add shipping_address column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
    ALTER TABLE orders ADD COLUMN shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add tracking columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
    ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'shipped_at') THEN
    ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'delivered_at') THEN
    ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'admin_notes') THEN
    ALTER TABLE orders ADD COLUMN admin_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'sumup_checkout_id') THEN
    ALTER TABLE orders ADD COLUMN sumup_checkout_id VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'sumup_transaction_code') THEN
    ALTER TABLE orders ADD COLUMN sumup_transaction_code VARCHAR(255);
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS orders_updated_at_trigger ON orders;
CREATE TRIGGER orders_updated_at_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;
DROP POLICY IF EXISTS "Public can update orders" ON orders;

-- Create policies (allow all for admin panel without auth)
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Public can update orders" ON orders
  FOR UPDATE USING (true);

-- =====================================================
-- ORDER STATUS HISTORY TABLE (optional but recommended)
-- =====================================================

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- Enable RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access order_status_history" ON order_status_history;
CREATE POLICY "Public access order_status_history" ON order_status_history
  FOR ALL USING (true);

-- =====================================================
-- HELPER FUNCTION: Record status change
-- =====================================================

CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION record_order_status_change();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;




