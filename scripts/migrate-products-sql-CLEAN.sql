-- ============================================
-- Script SQL PROPRE pour migrer les produits vers Supabase
-- 
-- Ce script supprime d'abord les anciennes fonctions pour éviter les conflits
-- 
-- Instructions:
-- 1. Assurez-vous que les catégories existent (voir SUPABASE_SCHEMA.sql)
-- 2. Copiez-collez ce script dans l'éditeur SQL de Supabase
-- 3. Exécutez le script
-- ============================================

-- Activer l'extension uuid-ossp si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supprimer les anciennes fonctions si elles existent
DROP FUNCTION IF EXISTS generate_slug(TEXT, TEXT);
DROP FUNCTION IF EXISTS generate_uuid_from_id(TEXT);

-- Fonction helper pour générer un slug (sans dépendre de unaccent)
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, id TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Commencer avec le nom et l'ID
  result := name || '-' || id;
  
  -- Convertir en minuscules
  result := lower(result);
  
  -- Remplacer les caractères accentués
  result := regexp_replace(result, '[àáâãäå]', 'a', 'gi');
  result := regexp_replace(result, '[èéêë]', 'e', 'gi');
  result := regexp_replace(result, '[ìíîï]', 'i', 'gi');
  result := regexp_replace(result, '[òóôõö]', 'o', 'gi');
  result := regexp_replace(result, '[ùúûü]', 'u', 'gi');
  result := regexp_replace(result, '[ç]', 'c', 'gi');
  result := regexp_replace(result, '[ñ]', 'n', 'gi');
  
  -- Remplacer tous les caractères non alphanumériques par des tirets
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  
  -- Supprimer les tirets en début et fin
  result := trim(both '-' from result);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction helper pour générer un UUID déterministe à partir d'un ID
CREATE OR REPLACE FUNCTION generate_uuid_from_id(id TEXT)
RETURNS UUID AS $$
BEGIN
  -- Génère un UUID v5 déterministe à partir de l'ID
  -- Utilise un namespace UUID fixe pour la cohérence
  RETURN uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, id);
END;
$$ LANGUAGE plpgsql;

-- Produit 1: Abaya Beige
INSERT INTO products (
  id,
  sku,
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
  generate_uuid_from_id('20'),
  'PROD-20',
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
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  name_fr = EXCLUDED.name_fr,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  updated_at = NOW();

-- Produit 2: Abaya Marron
INSERT INTO products (
  id,
  sku,
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
  generate_uuid_from_id('19'),
  'PROD-19',
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
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  name_fr = EXCLUDED.name_fr,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  updated_at = NOW();

-- Vérification
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_new THEN 1 END) as new_products,
  COUNT(CASE WHEN is_on_sale THEN 1 END) as on_sale_products
FROM products;

