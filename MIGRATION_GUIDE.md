# Guide de Migration vers Supabase

Ce guide vous explique comment migrer vos produits statiques vers Supabase et configurer le bucket de stockage.

## 📋 Étapes de Migration

### 1. Configuration du Bucket Supabase Storage

Suivez les instructions dans `SUPABASE_STORAGE_BUCKET_SETUP.md` pour:
- Créer le bucket "products"
- Configurer les politiques de stockage
- Tester l'upload d'images

### 2. Migration des Produits vers Supabase

Vous avez deux options:

#### Option A: Script TypeScript (Recommandé)

1. Installez les dépendances nécessaires:
```bash
npm install --save-dev tsx dotenv
```

2. Assurez-vous que votre `.env.local` contient:
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

3. Exécutez le script de migration:
```bash
npx tsx scripts/migrate-products-to-supabase.ts
```

#### Option B: Script SQL

1. Ouvrez l'éditeur SQL dans votre dashboard Supabase
2. Copiez-collez le contenu de `scripts/migrate-products-sql.sql`
3. Adaptez les INSERT avec tous vos produits depuis `src/data/products.ts`
4. Exécutez le script

### 3. Vérification

Après la migration, vérifiez que:
- ✅ Tous les produits sont dans la table `products`
- ✅ Les catégories sont correctement liées
- ✅ Les images sont accessibles
- ✅ L'admin panel peut charger les produits

## 🔄 Changements dans le Code

Le code a été mis à jour pour utiliser Supabase au lieu des produits statiques:

### Fichiers modifiés:
- ✅ `src/services/productService.ts` - Nouveau service pour Supabase
- ✅ `src/pages/admin/AdminProducts.tsx` - Utilise maintenant Supabase
- ✅ `src/pages/admin/AdminProductEdit.tsx` - Utilise maintenant Supabase
- ✅ `src/pages/Products.tsx` - Charge depuis Supabase
- ✅ `src/pages/ProductDetail.tsx` - Charge depuis Supabase
- ✅ `src/components/FeaturedProducts.tsx` - Charge depuis Supabase

### Fallback automatique

Si Supabase n'est pas disponible ou en cas d'erreur, le code utilise automatiquement les produits statiques comme fallback pour éviter les erreurs.

## 🚀 Prochaines Étapes

1. **Exécutez la migration** des produits
2. **Testez l'admin panel** - Créez/modifiez un produit
3. **Testez le site public** - Vérifiez que les produits s'affichent
4. **Testez l'upload d'images** - Assurez-vous que le bucket fonctionne

## ⚠️ Notes Importantes

- Les produits statiques dans `src/data/products.ts` sont toujours utilisés comme fallback
- Vous pouvez les supprimer une fois que tout fonctionne avec Supabase
- Les images doivent être uploadées dans Supabase Storage ou hébergées ailleurs
- Les URLs d'images locales (`/beige1.png`) doivent être remplacées par des URLs Supabase

## 🐛 Dépannage

### Erreur "Bucket not found"
→ Suivez `SUPABASE_STORAGE_BUCKET_SETUP.md`

### Produits ne s'affichent pas
→ Vérifiez les politiques RLS dans Supabase
→ Vérifiez que les catégories existent

### Erreur de connexion Supabase
→ Vérifiez vos variables d'environnement
→ Vérifiez que votre projet Supabase est actif









