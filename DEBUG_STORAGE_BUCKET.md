# 🔍 Débogage: Problème de Bucket Storage

## Problème
Vous avez créé le bucket "products" mais vous recevez toujours l'erreur "Le bucket 'products' n'existe pas".

## Solutions à essayer

### 1. Vérifier que le bucket existe vraiment

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **Storage** dans le menu de gauche
4. **Vérifiez que vous voyez le bucket "products"** dans la liste
   - Si vous ne le voyez pas, créez-le
   - Si vous le voyez, notez s'il est marqué comme "Public" ou "Private"

### 2. Vérifier le nom exact du bucket

⚠️ **Important**: Le nom doit être exactement `products` (en minuscules, pas d'espaces, pas de majuscules)

- ✅ Correct: `products`
- ❌ Incorrect: `Products`, `PRODUCTS`, `product`, `products-bucket`

### 3. Rafraîchir la page et réessayer

1. **Rafraîchissez complètement la page** (Ctrl+F5 ou Cmd+Shift+R)
2. Essayez à nouveau d'uploader une image

### 4. Vérifier les politiques RLS

Même si le bucket existe, vous devez configurer les politiques pour pouvoir uploader:

1. Dans Supabase Dashboard → Storage → Cliquez sur le bucket "products"
2. Allez dans l'onglet **Policies**
3. Vérifiez qu'il y a des politiques pour INSERT
4. Si pas de politiques, exécutez `scripts/setup-storage-policies.sql`

### 5. Vérifier la console du navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Essayez d'uploader une image
4. Regardez les messages d'erreur détaillés
5. Copiez les messages d'erreur pour le débogage

### 6. Vérifier les variables d'environnement

Assurez-vous que vos variables d'environnement sont correctes:

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

### 7. Tester avec l'API Supabase directement

Ouvrez la console du navigateur (F12) et exécutez:

```javascript
// Vérifier la connexion Supabase
const { data, error } = await supabase.storage.listBuckets();
console.log('Buckets:', data);
console.log('Error:', error);

// Essayer de lister les fichiers dans le bucket
const { data: files, error: filesError } = await supabase.storage
  .from('products')
  .list();
console.log('Files:', files);
console.log('Files Error:', filesError);
```

### 8. Solution alternative: Utiliser l'URL d'image

En attendant de résoudre le problème, vous pouvez utiliser l'option URL:

1. Dans le formulaire d'ajout de produit
2. Cliquez sur "Télécharger une image"
3. Descendez jusqu'à "Ou utilisez une URL"
4. Entrez l'URL d'une image hébergée ailleurs

## Erreurs courantes et solutions

### "Bucket not found"
- Le bucket n'existe pas → Créez-le dans Supabase Dashboard
- Le nom est incorrect → Vérifiez qu'il s'appelle exactement `products`

### "new row violates row-level security"
- Les politiques RLS ne sont pas configurées → Exécutez `scripts/setup-storage-policies.sql`

### "Permission denied"
- Vous n'avez pas les permissions → Vérifiez les politiques RLS du bucket

### Le bucket existe mais n'est pas détecté
- Problème de cache → Rafraîchissez la page (Ctrl+F5)
- Problème de permissions pour lister les buckets → Le code essaie maintenant directement l'upload, ce qui devrait contourner ce problème

## Contact

Si le problème persiste après avoir essayé toutes ces solutions, vérifiez:
1. Les logs de la console du navigateur
2. Les logs de Supabase Dashboard → Logs
3. Que vous êtes dans le bon projet Supabase









