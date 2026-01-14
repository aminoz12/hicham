-- Script SQL pour configurer les politiques de stockage Supabase
-- À exécuter dans l'éditeur SQL de Supabase après avoir créé le bucket "products"

-- IMPORTANT: Vous devez d'abord créer le bucket "products" manuellement dans l'interface Supabase:
-- 1. Allez sur Storage dans le dashboard
-- 2. Cliquez sur "New bucket"
-- 3. Nom: "products"
-- 4. Cochez "Public bucket"
-- 5. Cliquez sur "Create bucket"

-- Ensuite, exécutez ce script pour configurer les politiques:

-- IMPORTANT: Ce script configure des politiques permissives pour permettre l'upload
-- sans authentification Supabase (utile pour l'admin panel avec authentification simple)

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Politique 1: Permettre la lecture publique (SELECT) - Tout le monde peut voir les images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Politique 2: Permettre l'upload public (INSERT) - Permet l'upload sans authentification
-- ⚠️ ATTENTION: Cette politique permet à n'importe qui d'uploader dans le bucket
-- Pour la production, vous devriez utiliser une authentification Supabase appropriée
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

-- Politique 3: Permettre la mise à jour publique (UPDATE)
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Politique 4: Permettre la suppression publique (DELETE)
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');

-- Vérification: Afficher les politiques créées
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

