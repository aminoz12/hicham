# 🚀 Configuration Rapide: Bucket Supabase Storage

## ⚠️ Erreur: "Bucket not found"

Si vous voyez cette erreur, vous devez créer le bucket de stockage dans Supabase.

## ⚡ Configuration Rapide (2 minutes)

### Étape 1: Créer le Bucket

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet
3. Cliquez sur **Storage** dans le menu de gauche
4. Cliquez sur le bouton **New bucket**
5. Remplissez:
   - **Name**: `products` (exactement ce nom, en minuscules)
   - **Public bucket**: ✅ **COCHEZ cette case** (important!)
   - Cliquez sur **Create bucket**

### Étape 2: Configurer les Politiques (Recommandé)

Après avoir créé le bucket, cliquez dessus, puis allez dans l'onglet **Policies**.

Cliquez sur **New Policy** → **For full customization**

Collez ce SQL:

```sql
-- Permettre la lecture publique
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Permettre l'upload pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated'
);

-- Permettre la mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated'
);

-- Permettre la suppression pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND 
  auth.role() = 'authenticated'
);
```

Cliquez sur **Review** → **Save policy**

### Étape 3: Tester

1. Allez sur `/admin/products/new`
2. Essayez d'uploader une image
3. Ça devrait fonctionner maintenant! ✅

## 🔄 Alternative: Utiliser l'URL d'Image

Si vous ne voulez pas configurer le stockage maintenant, vous pouvez toujours utiliser l'option URL:
- Après avoir cliqué sur "Télécharger une image", descendez
- Vous verrez l'option "Ou utilisez une URL"
- Entrez une URL d'image directement

## 🐛 Dépannage

### Toujours "Bucket not found"?
- Assurez-vous que le nom du bucket est exactement `products` (minuscules, pas d'espaces)
- Vérifiez que vous êtes dans le bon projet Supabase
- Rafraîchissez la page après avoir créé le bucket

### Erreur de permissions?
- Vérifiez que vous avez créé les politiques comme indiqué ci-dessus
- Assurez-vous que le bucket est **Public**

### Images ne s'affichent pas?
- Vérifiez que le bucket est marqué comme **Public bucket**
- Vérifiez que la politique "Public Access" est active
- Vérifiez la console du navigateur pour les erreurs CORS

## 📸 Capture d'écran des étapes

1. **Dashboard Supabase** → **Storage**
2. **New bucket** → Nom: `products` → ✅ Public → **Create**
3. Cliquez sur le bucket → **Policies** → **New Policy** → Collez le SQL ci-dessus

C'est tout! 🎉
