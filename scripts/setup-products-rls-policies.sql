-- Script SQL pour configurer les politiques RLS de la table products
-- À exécuter dans l'éditeur SQL de Supabase

-- IMPORTANT: Ce script configure des politiques permissives pour permettre
-- l'insertion/mise à jour de produits sans authentification Supabase
-- (utile pour l'admin panel avec authentification simple)

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Public can insert products" ON products;
DROP POLICY IF EXISTS "Public can update products" ON products;
DROP POLICY IF EXISTS "Public can delete products" ON products;

-- Politique 1: Permettre la lecture publique (SELECT) - Tout le monde peut voir les produits
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (true);

-- Politique 2: Permettre l'insertion publique (INSERT) - Permet la création sans authentification
-- ⚠️ ATTENTION: Cette politique permet à n'importe qui d'insérer des produits
-- Pour la production, vous devriez utiliser une authentification Supabase appropriée
CREATE POLICY "Public can insert products"
ON products FOR INSERT
WITH CHECK (true);

-- Politique 3: Permettre la mise à jour publique (UPDATE)
CREATE POLICY "Public can update products"
ON products FOR UPDATE
USING (true)
WITH CHECK (true);

-- Politique 4: Permettre la suppression publique (DELETE)
CREATE POLICY "Public can delete products"
ON products FOR DELETE
USING (true);

-- Vérification: Afficher les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products' AND schemaname = 'public'
ORDER BY policyname;





