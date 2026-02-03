-- ============================================
-- ADD HIJAB SUBCATEGORIES
-- ============================================
-- This script adds subcategories for hijab category
-- Run this in Supabase SQL Editor

-- 1. Create subcategories table if it doesn't exist
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_fr TEXT,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Get hijabs category ID
DO $$
DECLARE
  hijab_category_id UUID;
BEGIN
  SELECT id INTO hijab_category_id FROM categories WHERE slug = 'hijabs' LIMIT 1;
  
  IF hijab_category_id IS NULL THEN
    RAISE EXCEPTION 'Hijabs category not found. Please create it first.';
  END IF;

  -- 3. Insert hijab subcategories
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Jersey Premium, Luxe Classique', 'Jersey Premium, Luxe Classique', 'jersey-premium-luxe-classique', hijab_category_id, 1)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Jersey Premium, Liquide', 'Jersey Premium, Liquide', 'jersey-premium-liquide', hijab_category_id, 2)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Jersey Premium, Bouclé', 'Jersey Premium, Bouclé', 'jersey-premium-boucle', hijab_category_id, 3)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Jersey Premium, Volant', 'Jersey Premium, Volant', 'jersey-premium-volant', hijab_category_id, 4)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Jersey Premium, Satiné Brillant', 'Jersey Premium, Satiné Brillant', 'jersey-premium-satine-brillant', hijab_category_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Jersey Premium, Bambou', 'Jersey Premium, Bambou', 'jersey-premium-bambou', hijab_category_id, 6)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Jersey Premium Strass, M', 'Jersey Premium Strass, M', 'jersey-premium-strass-m', hijab_category_id, 7)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Jersey Premium Strass', 'Jersey Premium Strass', 'jersey-premium-strass', hijab_category_id, 8)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Cagole Jersey Premium', 'Cagole Jersey Premium', 'cagole-jersey-premium', hijab_category_id, 9)
    ON CONFLICT (slug) DO NOTHING;
  
  INSERT INTO subcategories (name, name_fr, slug, category_id, display_order) VALUES
    ('Hijab à Strass Brillant', 'Hijab à Strass Brillant', 'hijab-strass-brillant', hijab_category_id, 10)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- 4. Update products table to reference subcategories
DO $$
BEGIN
  -- Add subcategory_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE products ADD COLUMN subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
  END IF;
END $$;

-- 5. Create trigger to update updated_at timestamp for subcategories
CREATE OR REPLACE FUNCTION update_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subcategories_updated_at ON subcategories;
CREATE TRIGGER trigger_update_subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_subcategories_updated_at();

-- 6. Enable RLS on subcategories table
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for subcategories (public read, admin write)
DROP POLICY IF EXISTS "Public can view active subcategories" ON subcategories;
CREATE POLICY "Public can view active subcategories"
  ON subcategories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can insert subcategories" ON subcategories;
CREATE POLICY "Public can insert subcategories"
  ON subcategories FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update subcategories" ON subcategories;
CREATE POLICY "Public can update subcategories"
  ON subcategories FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Public can delete subcategories" ON subcategories;
CREATE POLICY "Public can delete subcategories"
  ON subcategories FOR DELETE
  USING (true);

-- 8. Create function to get hijab subcategories
CREATE OR REPLACE FUNCTION get_hijab_subcategories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_fr TEXT,
  slug TEXT,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.name_fr,
    s.slug,
    s.display_order
  FROM subcategories s
  INNER JOIN categories c ON s.category_id = c.id
  WHERE c.slug = 'hijabs' AND s.is_active = true
  ORDER BY s.display_order ASC, s.name ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ Created subcategories table
-- ✅ Added 10 hijab subcategories
-- ✅ Added subcategory_id column to products table
-- ✅ Created RLS policies for subcategories
-- ✅ Created function to get hijab subcategories
-- ✅ Added indexes for better performance

-- Next steps:
-- 1. Update products to assign subcategories (optional)
-- 2. Update admin panel to show subcategory dropdown
-- 3. Update navigation to show subcategory dropdown
-- 4. Update product filtering to support subcategories










