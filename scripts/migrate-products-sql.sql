-- ============================================
-- Script SQL pour migrer les produits statiques vers Supabase
-- 
-- Instructions:
-- 1. Assurez-vous que les catégories existent (voir SUPABASE_SCHEMA.sql)
-- 2. Copiez-collez ce script dans l'éditeur SQL de Supabase
-- 3. Exécutez le script
-- ============================================

-- Note: Ce script contient des exemples de produits
-- Pour migrer tous les produits, utilisez le script TypeScript migrate-products-to-supabase.ts
-- ou adaptez ce script SQL avec tous vos produits

-- Fonction helper pour générer un slug
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, id TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(
    unaccent(name || '-' || id),
    '[^a-z0-9]+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- Exemple: Insérer quelques produits
-- Remplacez ces exemples par vos vrais produits depuis src/data/products.ts

-- Produit 1: Abaya Beige
INSERT INTO products (
  id,
  name,
  name_ar,
  name_fr,
  name_it,
  name_es,
  slug,
  price,
  original_price,
  image,
  images,
  category_id,
  subcategory,
  description,
  description_ar,
  description_fr,
  description_it,
  description_es,
  colors,
  sizes,
  in_stock,
  is_new,
  new_arrival,
  is_best_seller,
  is_on_sale,
  rating,
  review_count,
  tags
) VALUES (
  '20',
  'Abaya Beige Élégante',
  'عباية بيج أنيقة',
  'Abaya Beige Élégante',
  'Abaya Beige Elegante',
  'Abaya Beige Elegante',
  generate_slug('Abaya Beige Élégante', '20'),
  38.99,
  38.99,
  '/beige1.png',
  ARRAY['/beige1.png', '/beige2.png', '/beige3.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1),
  'classic',
  'Élégante abaya beige en tissu de haute qualité, parfaite pour un look raffiné.',
  'عباية بيج أنيقة مصنوعة من قماش عالي الجودة، مثالية لإطلالة أنيقة.',
  'Élégante abaya beige en tissu de haute qualité, parfaite pour un look raffiné.',
  'Elegante abaya beige in tessuto di alta qualità, perfetta per un look raffinato.',
  'Elegante abaya beige en tela de alta calidad, perfecta para un look refinado.',
  ARRAY['Beige'],
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true,
  true,
  true,
  false,
  false,
  0,
  0,
  ARRAY['classic', 'versatile', 'modest', 'comfortable', 'neutral']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_fr = EXCLUDED.name_fr,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  updated_at = NOW();

-- Produit 2: Abaya Marron
INSERT INTO products (
  id,
  name,
  name_ar,
  name_fr,
  name_it,
  name_es,
  slug,
  price,
  original_price,
  image,
  images,
  category_id,
  subcategory,
  description,
  description_ar,
  description_fr,
  description_it,
  description_es,
  colors,
  sizes,
  in_stock,
  is_new,
  new_arrival,
  is_best_seller,
  is_on_sale,
  rating,
  review_count,
  tags
) VALUES (
  '19',
  'Abaya Marron Élégante',
  'عباية بنية أنيقة',
  'Abaya Marron Élégante',
  'Abaya Marrone Elegante',
  'Abaya Marrón Elegante',
  generate_slug('Abaya Marron Élégante', '19'),
  38.99,
  38.99,
  '/brown1.png',
  ARRAY['/brown1.png', '/brown2.png', '/brown3.png', '/brown4.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1),
  'classic',
  'Élégante abaya marron en tissu de haute qualité, idéale pour toutes les occasions.',
  'عباية بنية أنيقة مصنوعة من قماش عالي الجودة، مثالية لجميع المناسبات.',
  'Élégante abaya marron en tissu de haute qualité, idéale pour toutes les occasions.',
  'Elegante abaya marrone in tessuto di alta qualità, ideale per ogni occasione.',
  'Elegante abaya marrón en tela de alta calidad, ideal para todas las ocasiones.',
  ARRAY['Brown'],
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true,
  true,
  true,
  false,
  false,
  0,
  0,
  ARRAY['classic', 'versatile', 'modest', 'comfortable']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_fr = EXCLUDED.name_fr,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  updated_at = NOW();

-- Note: Pour migrer tous les produits, vous pouvez:
-- 1. Utiliser le script TypeScript (recommandé)
-- 2. Répéter les INSERT ci-dessus pour chaque produit
-- 3. Créer un script personnalisé qui lit src/data/products.ts et génère les INSERT

-- Vérification
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_new THEN 1 END) as new_products,
  COUNT(CASE WHEN is_on_sale THEN 1 END) as on_sale_products
FROM products;

