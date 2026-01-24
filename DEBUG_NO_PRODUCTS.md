# 🔍 Débogage: "No products found"

## Problème
La page `/products` affiche "No products found" même après avoir créé des produits.

## Solutions à vérifier

### 1. Vérifier que les produits existent dans la base de données

1. Allez sur **Supabase Dashboard** → **Table Editor**
2. Cliquez sur la table **products**
3. Vérifiez qu'il y a des produits dans la table
   - Si la table est vide, vous devez créer des produits via l'admin panel ou exécuter le script de migration

### 2. Vérifier les politiques RLS

Assurez-vous que les politiques RLS permettent la lecture des produits:

1. Allez sur **Database** → **Tables** → **products** → **Policies**
2. Vérifiez qu'il y a une politique **"Anyone can view products"** (SELECT)
3. Si elle n'existe pas, exécutez `scripts/setup-products-rls-policies.sql`

### 3. Vérifier la console du navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Rechargez la page `/products`
4. Cherchez les messages:
   - `Loading products from Supabase...`
   - `Products loaded: X`
   - `Mapped products: X`
   - Ou des erreurs

### 4. Vérifier les erreurs réseau

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Network**
3. Rechargez la page `/products`
4. Cherchez les requêtes vers Supabase (filtrez par "supabase")
5. Vérifiez si les requêtes sont réussies (200) ou échouent (400, 500, etc.)

### 5. Vérifier les variables d'environnement

Assurez-vous que vos variables d'environnement sont correctes:

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

### 6. Créer des produits via l'admin panel

1. Allez sur `/admin/products/new`
2. Remplissez le formulaire et créez un produit
3. Vérifiez qu'il apparaît dans `/admin/products`
4. Vérifiez ensuite qu'il apparaît sur `/products`

### 7. Exécuter le script de migration

Si vous voulez migrer les produits statiques:

1. Allez sur **Supabase Dashboard** → **SQL Editor**
2. Exécutez `scripts/migrate-products-sql-COMPLETE.sql`
3. Cela va créer 20 produits dans la base de données

### 8. Vérifier le mapping des catégories

Si les produits existent mais ne s'affichent pas, le problème peut être dans le mapping:

1. Vérifiez que les produits ont un `category_id` valide
2. Vérifiez que les catégories existent dans la table `categories`
3. Vérifiez que les slugs de catégories correspondent (hijabs, abayas, ensemble, boxes-cadeau)

## Messages de débogage

Le code affiche maintenant des messages dans la console:
- `Loading products from Supabase...` - Début du chargement
- `Products loaded: X` - Nombre de produits chargés
- `Mapped products: X` - Nombre de produits mappés
- `No products found in database` - Aucun produit dans la base de données

## Solution rapide

Si la base de données est vide:

1. **Option 1**: Créer des produits via l'admin panel (`/admin/products/new`)
2. **Option 2**: Exécuter le script de migration (`scripts/migrate-products-sql-COMPLETE.sql`)

Après avoir créé des produits, rafraîchissez la page `/products`.






