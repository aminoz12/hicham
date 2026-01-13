-- ============================================
-- UPDATE PRODUCTS TABLE - Add Sizes and Colors
-- ============================================
-- Run this SQL in your Supabase SQL Editor to update the products table
-- This adds proper support for sizes and colors arrays

-- Check if columns exist, if not add them
DO $$ 
BEGIN
  -- Add sizes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'sizes'
  ) THEN
    ALTER TABLE products ADD COLUMN sizes TEXT[] DEFAULT '{}';
  END IF;

  -- Add colors column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'colors'
  ) THEN
    ALTER TABLE products ADD COLUMN colors TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Update existing products to have empty arrays if they're null
UPDATE products 
SET sizes = '{}' 
WHERE sizes IS NULL;

UPDATE products 
SET colors = '{}' 
WHERE colors IS NULL;

-- Add constraints to ensure arrays are never null
ALTER TABLE products 
  ALTER COLUMN sizes SET DEFAULT '{}',
  ALTER COLUMN colors SET DEFAULT '{}',
  ALTER COLUMN sizes SET NOT NULL,
  ALTER COLUMN colors SET NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_sizes ON products USING GIN(sizes);
CREATE INDEX IF NOT EXISTS idx_products_colors ON products USING GIN(colors);

-- ============================================
-- EXAMPLE: How to insert a product with sizes and colors
-- ============================================
/*
INSERT INTO products (
  name,
  name_fr,
  price,
  image,
  category_id,
  sizes,
  colors,
  in_stock
) VALUES (
  'Hijab en soie',
  'Hijab en soie',
  29.99,
  'https://example.com/image.jpg',
  (SELECT id FROM categories WHERE slug = 'hijabs' LIMIT 1),
  ARRAY['S', 'M', 'L', 'XL', 'One Size'],
  ARRAY['Noir', 'Beige', 'Marron'],
  true
);
*/

-- ============================================
-- EXAMPLE: How to query products by size or color
-- ============================================
/*
-- Find products with size 'M'
SELECT * FROM products 
WHERE 'M' = ANY(sizes);

-- Find products with color 'Noir'
SELECT * FROM products 
WHERE 'Noir' = ANY(colors);

-- Find products with both size 'L' and color 'Beige'
SELECT * FROM products 
WHERE 'L' = ANY(sizes) 
AND 'Beige' = ANY(colors);
*/

-- ============================================
-- VERIFICATION: Check the updated schema
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('sizes', 'colors')
ORDER BY column_name;

