-- ============================================
-- ADD STOCK QUANTITY AND MULTIPLE IMAGES SUPPORT
-- ============================================
-- This script adds stock quantity tracking and ensures support for 3 images per product
-- Run this in Supabase SQL Editor

-- 1. Add stock_quantity column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0 NOT NULL;
    COMMENT ON COLUMN products.stock_quantity IS 'Number of items in stock. When 0, product is out of stock.';
  END IF;
END $$;

-- 2. Ensure images column exists and is TEXT[] array (should already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
    COMMENT ON COLUMN products.images IS 'Array of up to 3 image URLs for the product';
  END IF;
END $$;

-- 3. Update existing products: if images is empty but image is set, populate images array
UPDATE products 
SET images = ARRAY[image] 
WHERE (images IS NULL OR array_length(images, 1) IS NULL) AND image IS NOT NULL;

-- 4. Update in_stock based on stock_quantity for existing products
UPDATE products 
SET in_stock = (stock_quantity > 0)
WHERE stock_quantity IS NOT NULL;

-- 5. Create function to decrement stock when order is placed
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  product_record RECORD;
  new_stock INTEGER;
BEGIN
  -- Get the product
  SELECT * INTO product_record 
  FROM products 
  WHERE id = NEW.product_id;
  
  -- Check if product exists
  IF product_record IS NULL THEN
    RAISE EXCEPTION 'Product with id % not found', NEW.product_id;
  END IF;
  
  -- Calculate new stock
  new_stock := product_record.stock_quantity - NEW.quantity;
  
  -- Prevent negative stock
  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', 
      product_record.name, 
      product_record.stock_quantity, 
      NEW.quantity;
  END IF;
  
  -- Update product stock
  UPDATE products 
  SET 
    stock_quantity = new_stock,
    in_stock = (new_stock > 0),
    updated_at = NOW()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically decrement stock when order item is created
DROP TRIGGER IF EXISTS trigger_decrement_stock_on_order_item ON order_items;
CREATE TRIGGER trigger_decrement_stock_on_order_item
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION decrement_product_stock();

-- 7. Create function to restore stock when order is cancelled
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
BEGIN
  -- Only restore stock if order status changed to cancelled
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    -- Loop through all order items
    FOR item_record IN 
      SELECT product_id, quantity 
      FROM order_items 
      WHERE order_id = NEW.id
    LOOP
      -- Restore stock
      UPDATE products 
      SET 
        stock_quantity = stock_quantity + item_record.quantity,
        in_stock = true,
        updated_at = NOW()
      WHERE id = item_record.product_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to restore stock when order is cancelled
DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON orders;
CREATE TRIGGER trigger_restore_stock_on_cancel
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled'))
  EXECUTE FUNCTION restore_product_stock();

-- 9. Add constraint to ensure stock_quantity is non-negative
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_stock_quantity_non_negative'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_stock_quantity_non_negative 
    CHECK (stock_quantity >= 0);
  END IF;
END $$;

-- 10. Add index on stock_quantity for faster queries
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity) WHERE stock_quantity > 0;

-- 11. Create a view to show products with low stock (less than 10 items)
CREATE OR REPLACE VIEW products_low_stock AS
SELECT 
  id,
  name,
  sku,
  stock_quantity,
  in_stock,
  category_id
FROM products
WHERE stock_quantity > 0 AND stock_quantity < 10
ORDER BY stock_quantity ASC;

COMMENT ON VIEW products_low_stock IS 'Products with low stock (less than 10 items remaining)';

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ Added stock_quantity column (default: 0)
-- ✅ Ensured images column supports array of up to 3 images
-- ✅ Created function to decrement stock when order item is created
-- ✅ Created trigger to automatically decrement stock on order
-- ✅ Created function to restore stock when order is cancelled
-- ✅ Added constraint to prevent negative stock
-- ✅ Added index for faster stock queries
-- ✅ Created view for low stock products

-- Next steps:
-- 1. Update existing products with stock quantities
-- 2. Test order creation to verify stock decrement works
-- 3. Test order cancellation to verify stock restoration works

