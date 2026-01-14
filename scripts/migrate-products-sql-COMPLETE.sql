-- ============================================
-- Script SQL COMPLET pour migrer TOUS les produits vers Supabase
-- 
-- Ce script inclut les 17 produits de src/data/products.ts
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

-- ============================================
-- PRODUITS ABAYAS (10 produits)
-- ============================================

-- Produit 1: Ensemble Brodée de Perles (ID: 1)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('1'), 'PROD-1',
  'Ensemble Brodée de Perles', 'مجموعة مطرزة بالخرز', 'Ensemble Brodée de Perles',
  'Insieme Ricamato con Perline', 'Conjunto Bordado con Cuentas',
  generate_slug('Ensemble Brodée de Perles', '1'),
  38.00, 38.00, '/a1.png', ARRAY['/a1.png', '/a2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'embroidered',
  'Stunning embroidered abaya ensemble with beautiful beadwork and premium fabric. Perfect for special occasions.',
  'مجموعة عباية مطرزة مذهلة مع أعمال خرز جميلة وقماش عالي الجودة. مثالية للمناسبات الخاصة.',
  'Magnifique ensemble abaya brodé avec de beaux travaux de perles et un tissu de qualité supérieure. Parfait pour les occasions spéciales.',
  'Stupendo insieme abaya ricamato con bellissimi lavori di perline e tessuto di alta qualità. Perfetto per le occasioni speciali.',
  'Hermoso conjunto abaya bordado con hermosos trabajos de cuentas y tela de alta calidad. Perfecto para ocasiones especiales.',
  ARRAY['Black', 'Navy', 'Burgundy'], ARRAY['S', 'M', 'L', 'XL'],
  true, true, true, true, true, 4.9, 89,
  ARRAY['embroidered', 'beads', 'luxury', 'special occasion']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 2: Ensemble Brodée de Perles (ID: 2)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('2'), 'PROD-2',
  'Ensemble Brodée de Perles', 'مجموعة مطرزة بالخرز', 'Ensemble Brodée de Perles',
  'Insieme Ricamato con Perline', 'Conjunto Bordado con Cuentas',
  generate_slug('Ensemble Brodée de Perles', '2'),
  38.00, 38.00, '/b1.png', ARRAY['/b1.png', '/b2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'embroidered',
  'Elegant embroidered abaya ensemble with intricate beadwork and luxurious details. Perfect for formal events.',
  'مجموعة عباية مطرزة أنيقة مع أعمال خرز معقدة وتفاصيل فاخرة. مثالية للمناسبات الرسمية.',
  'Ensemble abaya brodé élégant avec des travaux de perles complexes et des détails luxueux. Parfait pour les événements formels.',
  'Insieme abaya ricamato elegante con lavori di perline complessi e dettagli lussuosi. Perfetto per eventi formali.',
  'Conjunto abaya bordado elegante con trabajos de cuentas complejos y detalles lujosos. Perfecto para eventos formales.',
  ARRAY['Black', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, true, true, false, true, 4.8, 156,
  ARRAY['embroidered', 'beads', 'elegant', 'formal']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 3: Ensemble Brodée de Perles (ID: 3)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('3'), 'PROD-3',
  'Ensemble Brodée de Perles', 'مجموعة مطرزة بالخرز', 'Ensemble Brodée de Perles',
  'Insieme Ricamato con Perline', 'Conjunto Bordado con Cuentas',
  generate_slug('Ensemble Brodée de Perles', '3'),
  38.00, 38.00, '/c1.png', ARRAY['/c1.png', '/c2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'embroidered',
  'Beautiful embroidered abaya ensemble with delicate beadwork and premium quality fabric. Perfect for evening wear.',
  'مجموعة عباية مطرزة جميلة مع أعمال خرز دقيقة وقماش عالي الجودة. مثالية للارتداء المسائي.',
  'Belle ensemble abaya brodé avec des travaux de perles délicats et un tissu de qualité supérieure. Parfait pour le port de soirée.',
  'Bello insieme abaya ricamato con lavori di perline delicati e tessuto di alta qualità. Perfetto per l''abbigliamento serale.',
  'Hermoso conjunto abaya bordado con trabajos de cuentas delicados y tela de alta calidad. Perfecto para ropa de noche.',
  ARRAY['Black', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['S', 'M', 'L', 'XL'],
  true, false, false, true, true, 4.7, 203,
  ARRAY['embroidered', 'beads', 'evening', 'premium']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 4: Ensemble Brodée de Perles (ID: 4)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('4'), 'PROD-4',
  'Ensemble Brodée de Perles', 'مجموعة مطرزة بالخرز', 'Ensemble Brodée de Perles',
  'Insieme Ricamato con Perline', 'Conjunto Bordado con Cuentas',
  generate_slug('Ensemble Brodée de Perles', '4'),
  38.00, 38.00, '/d1.png', ARRAY['/d1.png', '/d2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'embroidered',
  'Stunning embroidered abaya ensemble with exquisite beadwork and elegant design. Perfect for special occasions.',
  'مجموعة عباية مطرزة مذهلة مع أعمال خرز رائعة وتصميم أنيق. مثالية للمناسبات الخاصة.',
  'Magnifique ensemble abaya brodé avec des travaux de perles exquis et un design élégant. Parfait pour les occasions spéciales.',
  'Stupendo insieme abaya ricamato con lavori di perline squisiti e design elegante. Perfetto per le occasioni speciali.',
  'Hermoso conjunto abaya bordado con trabajos de cuentas exquisitos y diseño elegante. Perfecto para ocasiones especiales.',
  ARRAY['Black', 'Navy', 'Burgundy'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, true, true, false, true, 4.6, 127,
  ARRAY['embroidered', 'beads', 'elegant', 'special occasion']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 5: Ensemble Brodée de Perles (ID: 5)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('5'), 'PROD-5',
  'Ensemble Brodée de Perles', 'مجموعة مطرزة بالخرز', 'Ensemble Brodée de Perles',
  'Insieme Ricamato con Perline', 'Conjunto Bordado con Cuentas',
  generate_slug('Ensemble Brodée de Perles', '5'),
  38.00, 38.00, '/e1.png', ARRAY['/e1.png', '/e2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'embroidered',
  'Elegant embroidered abaya ensemble with beautiful beadwork and comfortable fit. Perfect for daily wear.',
  'مجموعة عباية مطرزة أنيقة مع أعمال خرز جميلة ومقاس مريح. مثالية للارتداء اليومي.',
  'Ensemble abaya brodé élégant avec de beaux travaux de perles et une coupe confortable. Parfait pour un usage quotidien.',
  'Insieme abaya ricamato elegante con bellissimi lavori di perline e vestibilità confortevole. Perfetto per l''uso quotidiano.',
  'Conjunto abaya bordado elegante con hermosos trabajos de cuentas y ajuste cómodo. Perfecto para uso diario.',
  ARRAY['Black', 'Navy', 'Gray', 'Beige'], ARRAY['S', 'M', 'L', 'XL'],
  true, false, false, false, true, 4.5, 94,
  ARRAY['embroidered', 'beads', 'comfortable', 'daily wear']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 6: Ensemble Brodée de Perles (ID: 6)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('6'), 'PROD-6',
  'Ensemble Brodée de Perles', 'مجموعة مطرزة بالخرز', 'Ensemble Brodée de Perles',
  'Insieme Ricamato con Perline', 'Conjunto Bordado con Cuentas',
  generate_slug('Ensemble Brodée de Perles', '6'),
  38.00, 38.00, '/f1.png', ARRAY['/f1.png', '/f2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'embroidered',
  'Beautiful embroidered abaya ensemble with intricate beadwork and versatile design. Perfect for any occasion.',
  'مجموعة عباية مطرزة جميلة مع أعمال خرز معقدة وتصميم متعدد الاستخدامات. مثالية لأي مناسبة.',
  'Belle ensemble abaya brodé avec des travaux de perles complexes et un design polyvalent. Parfait pour toute occasion.',
  'Bello insieme abaya ricamato con lavori di perline complessi e design versatile. Perfetto per ogni occasione.',
  'Hermoso conjunto abaya bordado con trabajos de cuentas complejos y diseño versátil. Perfecto para cualquier ocasión.',
  ARRAY['Black', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, true, true, true, true, 4.4, 67,
  ARRAY['embroidered', 'beads', 'versatile', 'any occasion']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 7: Ensemble Brodée de Perles (ID: 7)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('7'), 'PROD-7',
  'Ensemble Brodée de Perles', 'مجموعة مطرزة بالخرز', 'Ensemble Brodée de Perles',
  'Insieme Ricamato con Perline', 'Conjunto Bordado con Cuentas',
  generate_slug('Ensemble Brodée de Perles', '7'),
  38.00, 38.00, '/g1.png', ARRAY['/g1.png', '/g2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'embroidered',
  'Elegant embroidered abaya ensemble with beautiful beadwork and comfortable design. Perfect for everyday elegance.',
  'مجموعة عباية مطرزة أنيقة مع أعمال خرز جميلة وتصميم مريح. مثالية للأناقة اليومية.',
  'Ensemble abaya brodé élégant avec de beaux travaux de perles et un design confortable. Parfait pour l''élégance quotidienne.',
  'Insieme abaya ricamato elegante con bellissimi lavori di perline e design confortevole. Perfetto per l''eleganza quotidiana.',
  'Conjunto abaya bordado elegante con hermosos trabajos de cuentas y diseño cómodo. Perfecto para la elegancia diaria.',
  ARRAY['Black', 'Navy', 'Gray', 'Beige'], ARRAY['S', 'M', 'L', 'XL'],
  true, false, false, false, true, 4.3, 45,
  ARRAY['embroidered', 'beads', 'elegant', 'everyday']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 8: Abaya Longue Modérne (ID: 8)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('8'), 'PROD-8',
  'Abaya Longue Modérne', 'عباية طويلة عصرية', 'Abaya Longue Modérne',
  'Abaya Lunga Moderna', 'Abaya Larga Moderna',
  generate_slug('Abaya Longue Modérne', '8'),
  38.00, 38.00, '/h1.png', ARRAY['/h1.png', '/h2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'modern',
  'Elegant modern long abaya with contemporary design and premium fabric. Perfect for sophisticated occasions.',
  'عباية طويلة عصرية أنيقة مع تصميم معاصر وقماش عالي الجودة. مثالية للمناسبات الراقية.',
  'Abaya longue moderne élégante avec un design contemporain et un tissu de qualité supérieure. Parfaite pour les occasions sophistiquées.',
  'Abaya lunga moderna elegante con design contemporaneo e tessuto di alta qualità. Perfetta per occasioni sofisticate.',
  'Abaya larga moderna elegante con diseño contemporáneo y tela de alta calidad. Perfecta para ocasiones sofisticadas.',
  ARRAY['Black', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, true, true, true, true, 4.8, 92,
  ARRAY['modern', 'long', 'elegant', 'sophisticated']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 9: Abaya Longue Modérne (ID: 9)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('9'), 'PROD-9',
  'Abaya Longue Modérne', 'عباية طويلة عصرية', 'Abaya Longue Modérne',
  'Abaya Lunga Moderna', 'Abaya Larga Moderna',
  generate_slug('Abaya Longue Modérne', '9'),
  38.00, 38.00, '/g1.png', ARRAY['/g1.png', '/g2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'modern',
  'Beautiful modern long abaya with sleek design and comfortable fit. Perfect for daily elegance.',
  'عباية طويلة عصرية جميلة مع تصميم أنيق ومقاس مريح. مثالية للأناقة اليومية.',
  'Belle abaya longue moderne avec un design élégant et une coupe confortable. Parfaite pour l''élégance quotidienne.',
  'Bella abaya lunga moderna con design elegante e vestibilità confortevole. Perfetta per l''eleganza quotidiana.',
  'Hermosa abaya larga moderna con diseño elegante y ajuste cómodo. Perfecta para la elegancia diaria.',
  ARRAY['Black', 'Navy', 'Gray', 'Beige'], ARRAY['S', 'M', 'L', 'XL'],
  true, true, true, false, true, 4.7, 78,
  ARRAY['modern', 'long', 'comfortable', 'daily wear']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 10: Abaya Longue Modérne (ID: 10)
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('10'), 'PROD-10',
  'Abaya Longue Modérne', 'عباية طويلة عصرية', 'Abaya Longue Modérne',
  'Abaya Lunga Moderna', 'Abaya Larga Moderna',
  generate_slug('Abaya Longue Modérne', '10'),
  38.00, 38.00, '/i1.png', ARRAY['/i1.png', '/i2.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'modern',
  'Stunning modern long abaya with contemporary style and premium quality. Perfect for special events.',
  'عباية طويلة عصرية مذهلة مع أسلوب معاصر وجودة عالية. مثالية للمناسبات الخاصة.',
  'Magnifique abaya longue moderne avec un style contemporain et une qualité supérieure. Parfaite pour les événements spéciaux.',
  'Stupenda abaya lunga moderna con stile contemporaneo e qualità superiore. Perfetta per eventi speciali.',
  'Hermosa abaya larga moderna con estilo contemporáneo y calidad superior. Perfecta para eventos especiales.',
  ARRAY['Black', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, false, false, true, true, 4.6, 156,
  ARRAY['modern', 'long', 'premium', 'special events']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 18: Elegant Black Abaya
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('18'), 'PROD-18',
  'Elegant Black Abaya', 'عباية سوداء أنيقة', 'Abaya Noire Élégante',
  'Abaya Nera Elegante', 'Abaya Negra Elegante',
  generate_slug('Elegant Black Abaya', '18'),
  38.99, 38.99, '/black1.png', ARRAY['/black1.png', '/black2.png', '/black3.png', '/black4.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'classic',
  'Elegant black abaya made from high-quality fabric, perfect for both casual and formal occasions. Features a comfortable fit and timeless design.',
  'عباية سوداء أنيقة مصنوعة من قماش عالي الجودة، مثالية للمناسبات اليومية والرسمية. تتميز بقصتها المريحة وتصميمها الكلاسيكي الخالد.',
  'Abaya noire élégante en tissu de haute qualité, parfaite pour les occasions décontractées et formelles. Dotée d''une coupe confortable et d''un design intemporel.',
  'Elegante abaya nera in tessuto di alta qualità, perfetta per occasioni informali e formali. Caratterizzata da una vestibilità comoda e un design senza tempo.',
  'Elegante abaya negra en tela de alta calidad, perfecta para ocasiones informales y formales. Con un corte cómodo y un diseño atemporal.',
  ARRAY['Black'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, true, true, false, false, 0, 0,
  ARRAY['classic', 'versatile', 'modest', 'comfortable']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 19: Abaya Marron Élégante
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('19'), 'PROD-19',
  'Abaya Marron Élégante', 'عباية بنية أنيقة', 'Abaya Marron Élégante',
  'Abaya Marrone Elegante', 'Abaya Marrón Elegante',
  generate_slug('Abaya Marron Élégante', '19'),
  38.99, 38.99, '/brown1.png', ARRAY['/brown1.png', '/brown2.png', '/brown3.png', '/brown4.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'classic',
  'Élégante abaya marron en tissu de haute qualité, idéale pour toutes les occasions. Confortable et élégante, elle s''adapte à toutes les morphologies.',
  'عباية بنية أنيقة مصنوعة من قماش عالي الجودة، مثالية لجميع المناسبات. مريحة وأنيقة، تناسب جميع المقاسات.',
  'Élégante abaya marron en tissu de haute qualité, idéale pour toutes les occasions. Confortable et élégante, elle s''adapte à toutes les morphologies.',
  'Elegante abaya marrone in tessuto di alta qualità, ideale per ogni occasione. Comoda ed elegante, si adatta a tutte le forme del corpo.',
  'Elegante abaya marrón en tela de alta calidad, ideal para todas las ocasiones. Cómoda y elegante, se adapta a todas las siluetas.',
  ARRAY['Brown'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, true, true, false, false, 0, 0,
  ARRAY['classic', 'versatile', 'modest', 'comfortable']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 20: Abaya Beige Élégante
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('20'), 'PROD-20',
  'Abaya Beige Élégante', 'عباية بيج أنيقة', 'Abaya Beige Élégante',
  'Abaya Beige Elegante', 'Abaya Beige Elegante',
  generate_slug('Abaya Beige Élégante', '20'),
  38.99, 38.99, '/beige1.png', ARRAY['/beige1.png', '/beige2.png', '/beige3.png'],
  (SELECT id FROM categories WHERE slug = 'abayas' LIMIT 1), 'classic',
  'Élégante abaya beige en tissu de haute qualité, parfaite pour un look raffiné. Son design intemporel et sa couleur neutre en font un indispensable de la garde-robe.',
  'عباية بيج أنيقة مصنوعة من قماش عالي الجودة، مثالية لإطلالة أنيقة. يتميز تصميمها الخالد ولونها المحايد بأنهما أساسيان في خزانة الملابس.',
  'Élégante abaya beige en tissu de haute qualité, parfaite pour un look raffiné. Son design intemporel et sa couleur neutre en font un indispensable de la garde-robe.',
  'Elegante abaya beige in tessuto di alta qualità, perfetta per un look raffinato. Il suo design senza tempo e il colore neutro la rendono un must della moda.',
  'Elegante abaya beige en tela de alta calidad, perfecta para un look refinado. Su diseño atemporal y su color neutro la convierten en un básico del armario.',
  ARRAY['Beige'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, true, true, false, false, 0, 0,
  ARRAY['classic', 'versatile', 'modest', 'comfortable', 'neutral']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- ============================================
-- PRODUITS HIJABS (7 produits)
-- ============================================

-- Produit 11: Hijab Haute Qualité
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('11'), 'PROD-11',
  'Hijab Haute Qualité', 'حجاب عالي الجودة', 'Hijab Haute Qualité',
  'Hijab di Alta Qualità', 'Hijab de Alta Calidad',
  generate_slug('Hijab Haute Qualité', '11'),
  13.00, 13.00, '/ha1.png', ARRAY['/ha1.png', '/ha2.png'],
  (SELECT id FROM categories WHERE slug = 'hijabs' LIMIT 1), 'premium',
  'Premium quality hijab with elegant drape and comfortable fit. Made from high-quality fabric for all-day comfort.',
  'حجاب عالي الجودة مع ثني أنيق ومقاس مريح. مصنوع من قماش عالي الجودة للراحة طوال اليوم.',
  'Hijab de qualité supérieure avec drapé élégant et coupe confortable. Fabriqué en tissu de haute qualité pour un confort toute la journée.',
  'Hijab di alta qualità con drappeggio elegante e vestibilità confortevole. Realizzato con tessuto di alta qualità per comfort tutto il giorno.',
  'Hijab de alta calidad con drapeado elegante y ajuste cómodo. Hecho con tela de alta calidad para comodidad todo el día.',
  ARRAY['Black', 'White', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['One Size'],
  true, true, true, true, true, 4.8, 124,
  ARRAY['premium', 'elegant', 'comfortable', 'high quality']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 12: Hijab Moderne
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('12'), 'PROD-12',
  'Hijab Moderne', 'حجاب عصري', 'Hijab Moderne',
  'Hijab Moderno', 'Hijab Moderno',
  generate_slug('Hijab Moderne', '12'),
  13.00, 13.00, '/hb1.png', ARRAY['/hb1.png', '/hb2.png'],
  (SELECT id FROM categories WHERE slug = 'hijabs' LIMIT 1), 'modern',
  'Modern hijab with contemporary style and versatile design. Perfect for everyday wear and special occasions.',
  'حجاب عصري مع أسلوب معاصر وتصميم متعدد الاستخدامات. مثالي للارتداء اليومي والمناسبات الخاصة.',
  'Hijab moderne avec un style contemporain et un design polyvalent. Parfait pour un usage quotidien et les occasions spéciales.',
  'Hijab moderno con stile contemporaneo e design versatile. Perfetto per l''uso quotidiano e le occasioni speciali.',
  'Hijab moderno con estilo contemporáneo y diseño versátil. Perfecto para uso diario y ocasiones especiales.',
  ARRAY['Black', 'White', 'Gray', 'Beige', 'Navy'], ARRAY['One Size'],
  true, true, true, false, true, 4.6, 89,
  ARRAY['modern', 'versatile', 'contemporary', 'everyday']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 13: Hijab Classique
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('13'), 'PROD-13',
  'Hijab Classique', 'حجاب كلاسيكي', 'Hijab Classique',
  'Hijab Classico', 'Hijab Clásico',
  generate_slug('Hijab Classique', '13'),
  13.00, 13.00, '/hc1.png', ARRAY['/hc1.png', '/hc2.png'],
  (SELECT id FROM categories WHERE slug = 'hijabs' LIMIT 1), 'classic',
  'Classic hijab with timeless elegance and traditional style. Perfect for formal occasions and daily wear.',
  'حجاب كلاسيكي مع أناقة خالدة وأسلوب تقليدي. مثالي للمناسبات الرسمية والارتداء اليومي.',
  'Hijab classique avec une élégance intemporelle et un style traditionnel. Parfait pour les occasions formelles et l''usage quotidien.',
  'Hijab classico con eleganza senza tempo e stile tradizionale. Perfetto per occasioni formali e uso quotidiano.',
  'Hijab clásico con elegancia atemporal y estilo tradicional. Perfecto para ocasiones formales y uso diario.',
  ARRAY['Black', 'White', 'Navy', 'Burgundy'], ARRAY['One Size'],
  true, false, false, true, true, 4.7, 156,
  ARRAY['classic', 'timeless', 'traditional', 'formal']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 14: Hijab Décontracté
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('14'), 'PROD-14',
  'Hijab Décontracté', 'حجاب مريح', 'Hijab Décontracté',
  'Hijab Casual', 'Hijab Casual',
  generate_slug('Hijab Décontracté', '14'),
  13.00, 13.00, '/hd1.png', ARRAY['/hd1.png', '/hd2.png'],
  (SELECT id FROM categories WHERE slug = 'hijabs' LIMIT 1), 'casual',
  'Comfortable casual hijab perfect for everyday activities. Soft fabric with easy care and versatile styling.',
  'حجاب مريح مثالي للأنشطة اليومية. قماش ناعم مع سهولة العناية وتنسيق متعدد الاستخدامات.',
  'Hijab décontracté confortable parfait pour les activités quotidiennes. Tissu doux avec entretien facile et style polyvalent.',
  'Hijab casual comodo perfetto per le attività quotidiane. Tessuto morbido con facile manutenzione e stile versatile.',
  'Hijab casual cómodo perfecto para actividades diarias. Tela suave con fácil cuidado y estilo versátil.',
  ARRAY['Black', 'White', 'Gray', 'Beige', 'Navy'], ARRAY['One Size'],
  true, true, true, false, true, 4.5, 98,
  ARRAY['casual', 'comfortable', 'everyday', 'easy care']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 15: Hijab Élégant
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('15'), 'PROD-15',
  'Hijab Élégant', 'حجاب أنيق', 'Hijab Élégant',
  'Hijab Elegante', 'Hijab Elegante',
  generate_slug('Hijab Élégant', '15'),
  13.00, 13.00, '/he1.png', ARRAY['/he1.png', '/he2.png'],
  (SELECT id FROM categories WHERE slug = 'hijabs' LIMIT 1), 'elegant',
  'Elegant hijab with sophisticated design and premium feel. Perfect for special occasions and evening wear.',
  'حجاب أنيق مع تصميم متطور وملمس عالي الجودة. مثالي للمناسبات الخاصة والارتداء المسائي.',
  'Hijab élégant avec un design sophistiqué et une sensation premium. Parfait pour les occasions spéciales et le port de soirée.',
  'Hijab elegante con design sofisticato e sensazione premium. Perfetto per occasioni speciali e abbigliamento serale.',
  'Hijab elegante con diseño sofisticado y sensación premium. Perfecto para ocasiones especiales y ropa de noche.',
  ARRAY['Black', 'White', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['One Size'],
  true, true, true, true, true, 4.9, 203,
  ARRAY['elegant', 'sophisticated', 'premium', 'special occasion']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 16: Hijab Fantaisie
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('16'), 'PROD-16',
  'Hijab Fantaisie', 'حجاب فانتازيا', 'Hijab Fantaisie',
  'Hijab Fantasia', 'Hijab Fantasía',
  generate_slug('Hijab Fantaisie', '16'),
  13.00, 13.00, '/hf1.png', ARRAY['/hf1.png', '/hf2.png'],
  (SELECT id FROM categories WHERE slug = 'hijabs' LIMIT 1), 'fancy',
  'Fancy hijab with unique patterns and creative designs. Perfect for adding a touch of personality to your style.',
  'حجاب فانتازيا مع أنماط فريدة وتصاميم إبداعية. مثالي لإضافة لمسة من الشخصية إلى أسلوبك.',
  'Hijab fantaisie avec des motifs uniques et des designs créatifs. Parfait pour ajouter une touche de personnalité à votre style.',
  'Hijab fantasia con motivi unici e design creativi. Perfetto per aggiungere un tocco di personalità al tuo stile.',
  'Hijab fantasía con patrones únicos y diseños creativos. Perfecto para agregar un toque de personalidad a tu estilo.',
  ARRAY['Black', 'White', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['One Size'],
  true, false, false, false, true, 4.4, 67,
  ARRAY['fancy', 'unique', 'creative', 'personality']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- Produit 17: Hijab Glamour
INSERT INTO products (
  id, sku, name, name_ar, name_fr, name_it, name_es, slug,
  price, original_price, image, images, category_id, subcategory,
  description, description_ar, description_fr, description_it, description_es,
  colors, sizes, in_stock, is_new, new_arrival, is_best_seller, is_on_sale,
  rating, review_count, tags
) VALUES (
  generate_uuid_from_id('17'), 'PROD-17',
  'Hijab Glamour', 'حجاب جلامور', 'Hijab Glamour',
  'Hijab Glamour', 'Hijab Glamour',
  generate_slug('Hijab Glamour', '17'),
  13.00, 13.00, '/hg1.png', ARRAY['/hg1.png', '/hg2.png'],
  (SELECT id FROM categories WHERE slug = 'hijabs' LIMIT 1), 'glamour',
  'Glamorous hijab with luxurious details and stunning appeal. Perfect for making a statement at special events.',
  'حجاب جلامور مع تفاصيل فاخرة وجاذبية مذهلة. مثالي لإحداث تأثير في المناسبات الخاصة.',
  'Hijab glamour avec des détails luxueux et un attrait époustouflant. Parfait pour faire sensation lors d''événements spéciaux.',
  'Hijab glamour con dettagli lussuosi e appeal straordinario. Perfetto per fare colpo agli eventi speciali.',
  'Hijab glamour con detalles lujosos y atractivo impresionante. Perfecto para causar sensación en eventos especiales.',
  ARRAY['Black', 'White', 'Navy', 'Burgundy', 'Forest Green'], ARRAY['One Size'],
  true, true, true, true, true, 4.8, 145,
  ARRAY['glamour', 'luxurious', 'stunning', 'statement piece']
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, name_fr = EXCLUDED.name_fr, price = EXCLUDED.price,
  image = EXCLUDED.image, updated_at = NOW();

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_new THEN 1 END) as new_products,
  COUNT(CASE WHEN is_on_sale THEN 1 END) as on_sale_products,
  COUNT(CASE WHEN category_id IN (SELECT id FROM categories WHERE slug = 'abayas') THEN 1 END) as abayas_count,
  COUNT(CASE WHEN category_id IN (SELECT id FROM categories WHERE slug = 'hijabs') THEN 1 END) as hijabs_count
FROM products;

