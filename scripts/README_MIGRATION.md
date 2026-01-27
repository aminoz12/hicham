# Guide de Migration des Produits

## Problèmes Courants et Solutions

### Erreur: "invalid input syntax for type uuid"

**Cause:** Le champ `id` dans la table `products` est de type UUID, mais le script essaie d'insérer des chaînes comme '20'.

**Solution:** Utilisez `scripts/migrate-products-sql-fixed.sql` qui génère automatiquement des UUID à partir des IDs.

### Erreur: "function unaccent(text) does not exist"

**Cause:** L'extension `unaccent` n'est pas activée dans Supabase.

**Solution:** Le script corrigé n'utilise plus `unaccent`. Il utilise des remplacements regex pour les caractères accentués.

## Fichiers Disponibles

1. **`migrate-products-sql-fixed.sql`** ⭐ **RECOMMANDÉ**
   - Génère automatiquement des UUID
   - Pas de dépendance à `unaccent`
   - Utilise le champ `sku` pour éviter les doublons
   - Prêt à l'emploi

2. **`migrate-products-sql.sql`**
   - Version originale (corrigée mais moins complète)
   - Nécessite des modifications manuelles

3. **`migrate-products-to-supabase.ts`**
   - Script TypeScript complet
   - Migre TOUS les produits automatiquement
   - Nécessite Node.js et les dépendances

## Instructions Rapides

### Option 1: Script SQL (Rapide)

1. Ouvrez Supabase SQL Editor
2. Copiez-collez le contenu de `migrate-products-sql-fixed.sql`
3. Exécutez le script
4. Vérifiez avec la requête de vérification à la fin

### Option 2: Script TypeScript (Complet)

```bash
npm install --save-dev tsx dotenv
npx tsx scripts/migrate-products-to-supabase.ts
```

## Structure des UUID

Le script génère des UUID déterministes à partir des IDs originaux:
- ID '20' → UUID généré via `uuid_generate_v5`
- Le SKU conserve l'ID original: `PROD-20`

Cela permet de:
- ✅ Garder la cohérence des IDs
- ✅ Éviter les conflits
- ✅ Faciliter le débogage

## Vérification

Après la migration, exécutez:

```sql
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_new THEN 1 END) as new_products,
  COUNT(CASE WHEN is_on_sale THEN 1 END) as on_sale_products
FROM products;
```










