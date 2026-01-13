# Configuration du Bucket Supabase Storage

## Étape 1: Créer le bucket "products"

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **Storage** dans le menu de gauche
4. Cliquez sur **New bucket**
5. Configurez le bucket:
   - **Name**: `products` (exactement, en minuscules)
   - **Public bucket**: ✅ **COCHER** (important pour que les images soient accessibles publiquement)
6. Cliquez sur **Create bucket**

## Étape 2: Configurer les politiques de stockage (Storage Policies)

1. Dans la page Storage, cliquez sur le bucket **products**
2. Allez dans l'onglet **Policies**
3. Cliquez sur **New Policy**

### Politique 1: Permettre la lecture publique (SELECT)

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');
```

### Politique 2: Permettre l'upload pour les admins (INSERT)

```sql
CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);
```

### Politique 3: Permettre la mise à jour pour les admins (UPDATE)

```sql
CREATE POLICY "Admins can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);
```

### Politique 4: Permettre la suppression pour les admins (DELETE)

```sql
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);
```

## Étape 3: Vérification

1. Testez l'upload d'une image depuis l'admin panel
2. Vérifiez que l'image est accessible publiquement via l'URL générée

## Note importante

Si vous utilisez l'authentification simple (username/password hardcodé), vous devrez peut-être ajuster les politiques pour permettre l'upload sans authentification Supabase. Dans ce cas, utilisez:

```sql
CREATE POLICY "Anyone can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');
```

**⚠️ Attention**: Cette dernière politique permet à n'importe qui d'uploader. Utilisez-la uniquement en développement ou si vous avez une autre couche de sécurité.

