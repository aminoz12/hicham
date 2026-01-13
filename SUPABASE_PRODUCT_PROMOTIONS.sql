-- ============================================
-- PRODUCT-SPECIFIC PROMOTIONS UPDATE
-- ============================================
-- Add promotion fields to products table for product-specific offers

-- Add promotion columns to products table
DO $$ 
BEGIN
  -- Add promotion_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'promotion_type'
  ) THEN
    ALTER TABLE products ADD COLUMN promotion_type TEXT;
  END IF;

  -- Add promotion_value column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'promotion_value'
  ) THEN
    ALTER TABLE products ADD COLUMN promotion_value DECIMAL(10, 2);
  END IF;

  -- Add promotion_description column (for display)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'promotion_description'
  ) THEN
    ALTER TABLE products ADD COLUMN promotion_description TEXT;
  END IF;
END $$;

-- Add check constraint for promotion_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_promotion_type_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_promotion_type_check 
      CHECK (promotion_type IS NULL OR promotion_type IN ('buy2get1', 'buy2', 'buy3', 'percentage'));
  END IF;
END $$;

-- Create index for products with promotions
CREATE INDEX IF NOT EXISTS idx_products_promotion_type 
ON products(promotion_type) 
WHERE promotion_type IS NOT NULL;

-- ============================================
-- EXAMPLE: Update a product with promotion
-- ============================================
/*
-- Buy 2 Get 1 Free
UPDATE products 
SET 
  promotion_type = 'buy2get1',
  promotion_description = 'Achetez 2, obtenez 1 gratuit',
  is_on_sale = true
WHERE id = 'your-product-id';

-- Buy 2 at special price
UPDATE products 
SET 
  promotion_type = 'buy2',
  promotion_value = 59.99,
  promotion_description = '2 au prix de 59.99€',
  is_on_sale = true
WHERE id = 'your-product-id';

-- Buy 3 at special price
UPDATE products 
SET 
  promotion_type = 'buy3',
  promotion_value = 79.99,
  promotion_description = '3 au prix de 79.99€',
  is_on_sale = true
WHERE id = 'your-product-id';

-- Percentage discount
UPDATE products 
SET 
  promotion_type = 'percentage',
  promotion_value = 20,
  promotion_description = 'Réduction de 20%',
  is_on_sale = true
WHERE id = 'your-product-id';
*/

-- ============================================
-- EXAMPLE: Query products with promotions
-- ============================================
/*
-- Get all products with active promotions
SELECT 
  id,
  name,
  price,
  promotion_type,
  promotion_value,
  promotion_description
FROM products
WHERE promotion_type IS NOT NULL
AND is_on_sale = true;
*/

-- ============================================
-- FUNCTION: Calculate promotion price
-- ============================================
CREATE OR REPLACE FUNCTION calculate_promotion_price(
  product_price DECIMAL,
  promotion_type TEXT,
  promotion_value DECIMAL,
  quantity INTEGER
) RETURNS DECIMAL AS $$
DECLARE
  total_price DECIMAL;
BEGIN
  -- Buy 2 Get 1 Free
  IF promotion_type = 'buy2get1' THEN
    -- For every 2 items, customer gets 1 free
    -- So for 3 items, they pay for 2
    -- For 6 items, they pay for 4, etc.
    RETURN (CEIL(quantity::DECIMAL / 3) * 2) * product_price;
  
  -- Buy 2 at special price
  ELSIF promotion_type = 'buy2' THEN
    IF quantity >= 2 THEN
      -- Calculate how many sets of 2
      DECLARE
        sets_of_2 INTEGER := FLOOR(quantity / 2);
        remainder INTEGER := quantity % 2;
      BEGIN
        total_price := (sets_of_2 * promotion_value) + (remainder * product_price);
        RETURN total_price;
      END;
    ELSE
      RETURN quantity * product_price;
    END IF;
  
  -- Buy 3 at special price
  ELSIF promotion_type = 'buy3' THEN
    IF quantity >= 3 THEN
      -- Calculate how many sets of 3
      DECLARE
        sets_of_3 INTEGER := FLOOR(quantity / 3);
        remainder INTEGER := quantity % 3;
      BEGIN
        total_price := (sets_of_3 * promotion_value) + (remainder * product_price);
        RETURN total_price;
      END;
    ELSE
      RETURN quantity * product_price;
    END IF;
  
  -- Percentage discount
  ELSIF promotion_type = 'percentage' THEN
    RETURN quantity * product_price * (1 - promotion_value / 100);
  
  -- No promotion
  ELSE
    RETURN quantity * product_price;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('promotion_type', 'promotion_value', 'promotion_description')
ORDER BY column_name;

