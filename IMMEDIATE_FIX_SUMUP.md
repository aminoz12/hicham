# Solution Immédiate pour le Problème CORS SumUp

## Problème
Les fonctions Edge Supabase ne sont pas encore déployées, causant des erreurs CORS.

## Solution Rapide (2 minutes)

### Option 1: Utiliser le Proxy Local (Recommandé pour le développement)

1. **Installer les dépendances** :
   ```bash
   npm install express cors
   ```

2. **Démarrer le serveur proxy** (dans un terminal séparé) :
   ```bash
   npm run proxy
   ```
   Ou directement :
   ```bash
   node proxy-server.js
   ```

3. **Ajouter dans votre `.env.local`** :
   ```env
   VITE_PROXY_URL=http://localhost:3002
   ```

4. **Redémarrer votre serveur de développement** :
   ```bash
   npm run dev
   ```

Le proxy tourne sur `http://localhost:3002` et contourne les problèmes CORS.

### Option 2: Déployer les Edge Functions Supabase (Pour la production)

Suivez les instructions dans `QUICK_START_SUMUP.md` pour déployer les fonctions Edge Supabase.

Une fois déployées, supprimez `VITE_PROXY_URL` de votre `.env.local` et l'application utilisera automatiquement les Edge Functions.

## Comment ça fonctionne

Le service `sumupService.ts` détecte automatiquement :
1. **Si `VITE_PROXY_URL` est défini** → Utilise le proxy local
2. **Sinon, si `VITE_SUPABASE_URL` est défini** → Utilise les Edge Functions Supabase
3. **Sinon** → Essaie l'API directe (échouera à cause de CORS)

## Fichiers

- `proxy-server.js` - Serveur proxy local pour le développement
- `src/services/sumupService.ts` - Service mis à jour avec support du proxy

## Note

Le proxy local est **uniquement pour le développement**. Pour la production, utilisez les Edge Functions Supabase ou un autre service backend.











