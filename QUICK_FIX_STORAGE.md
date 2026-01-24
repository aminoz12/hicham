# ⚡ Solution Rapide: Erreur RLS Storage

## Erreur: "new row violates row-level security policy"

Cette erreur signifie que les politiques RLS (Row Level Security) ne permettent pas l'upload.

## Solution Immédiate

### Étape 1: Exécuter le script SQL mis à jour

1. Allez sur **Supabase Dashboard** → **SQL Editor**
2. Ouvrez ou créez une nouvelle requête
3. Copiez-collez le contenu de `scripts/setup-storage-policies.sql`
4. Cliquez sur **Run** ou **Exécuter**

Ce script va créer des politiques publiques qui permettent l'upload sans authentification Supabase.

### Étape 2: Vérifier que les politiques sont créées

1. Allez sur **Storage** → Cliquez sur le bucket **products**
2. Allez dans l'onglet **Policies**
3. Vous devriez voir 4 politiques:
   - **Public Access** (SELECT)
   - **Public Upload** (INSERT)
   - **Public Update** (UPDATE)
   - **Public Delete** (DELETE)

### Étape 3: Tester l'upload

1. Rafraîchissez la page admin (`/admin/products/new`)
2. Essayez d'uploader une image
3. Ça devrait fonctionner maintenant! ✅

## Pourquoi cette solution?

Votre admin panel utilise une authentification simple (username/password hardcodé) qui ne crée pas de session Supabase. Les politiques qui vérifient `auth.role() = 'authenticated'` ne fonctionnent donc pas.

Les politiques publiques permettent l'upload sans authentification Supabase, ce qui est nécessaire pour votre système actuel.

## ⚠️ Note de Sécurité

Ces politiques permettent à **n'importe qui** d'uploader dans le bucket si elles ont l'URL. Pour la production, vous devriez:
1. Implémenter une authentification Supabase réelle
2. Ou restreindre l'accès au bucket avec des politiques plus strictes
3. Ou utiliser un service backend pour gérer les uploads

Pour l'instant, cette solution fonctionne pour le développement et l'admin panel.






