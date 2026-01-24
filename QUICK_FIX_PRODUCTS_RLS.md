# ⚡ Solution Rapide: Erreur RLS Products

## Erreur: "new row violates row-level security policy for table 'products'"

Cette erreur signifie que les politiques RLS (Row Level Security) de la table `products` ne permettent pas l'insertion/mise à jour.

## Solution Immédiate

### Étape 1: Exécuter le script SQL

1. Allez sur **Supabase Dashboard** → **SQL Editor**
2. Ouvrez ou créez une nouvelle requête
3. Copiez-collez le contenu de `scripts/setup-products-rls-policies.sql`
4. Cliquez sur **Run** ou **Exécuter**

Ce script va créer des politiques publiques qui permettent l'insertion/mise à jour sans authentification Supabase.

### Étape 2: Vérifier que les politiques sont créées

1. Allez sur **Database** → **Tables** → Cliquez sur la table **products**
2. Allez dans l'onglet **Policies**
3. Vous devriez voir 4 politiques:
   - **Anyone can view products** (SELECT)
   - **Public can insert products** (INSERT)
   - **Public can update products** (UPDATE)
   - **Public can delete products** (DELETE)

### Étape 3: Tester la sauvegarde

1. Rafraîchissez la page admin (`/admin/products/new`)
2. Essayez de créer un produit
3. Ça devrait fonctionner maintenant! ✅

## Pourquoi cette solution?

Votre admin panel utilise une authentification simple (username/password hardcodé) qui ne crée pas de session Supabase. Les politiques qui vérifient `auth.uid()` et `admin_users` ne fonctionnent donc pas.

Les politiques publiques permettent l'insertion/mise à jour sans authentification Supabase, ce qui est nécessaire pour votre système actuel.

## ⚠️ Note de Sécurité

Ces politiques permettent à **n'importe qui** d'insérer/modifier des produits si elles ont l'URL de l'API. Pour la production, vous devriez:
1. Implémenter une authentification Supabase réelle
2. Ou restreindre l'accès avec des politiques plus strictes
3. Ou utiliser un service backend pour gérer les produits

Pour l'instant, cette solution fonctionne pour le développement et l'admin panel.

## Alternative: Désactiver RLS temporairement

Si vous voulez désactiver RLS complètement (moins sécurisé):

```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

Mais il est préférable d'utiliser les politiques publiques comme décrit ci-dessus.






