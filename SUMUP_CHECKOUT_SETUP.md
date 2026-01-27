# Configuration SumUp Checkout

Ce guide explique comment configurer SumUp Checkout pour que vos clients puissent payer par **carte bancaire**, **Apple Pay** et **Google Pay** sans avoir besoin d'un compte SumUp.

## 1. Obtenir votre clé API SumUp

1. Connectez-vous à votre compte SumUp : https://me.sumup.com/
2. Allez dans **Paramètres** → **Développeur** ou **API**
3. Créez une nouvelle clé API avec les permissions suivantes :
   - `payments` (pour créer des checkouts)
   - `transactions.history` (optionnel, pour voir les transactions)
4. Copiez votre **API Key** (elle ressemble à : `sup_sk_xxxxxxxxxxxx`)

## 2. Configurer Supabase Edge Function

### Option A : Via le Dashboard Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Edge Functions** → **Secrets**
4. Ajoutez un nouveau secret :
   - **Name:** `SUMUP_API_KEY`
   - **Value:** Votre clé API SumUp (ex: `sup_sk_xxxxxxxxxxxx`)

### Option B : Via la CLI Supabase

```bash
# Installer la CLI Supabase si nécessaire
npm install -g supabase

# Se connecter
supabase login

# Définir le secret
supabase secrets set SUMUP_API_KEY=sup_sk_xxxxxxxxxxxx --project-ref mrwfmdflbkbprkkwpkld
```

## 3. Déployer la Edge Function

```bash
# Depuis le dossier du projet
supabase functions deploy create-checkout --project-ref mrwfmdflbkbprkkwpkld
```

Ou via le dashboard Supabase :
1. Allez dans **Edge Functions**
2. Cliquez sur **Deploy a new function**
3. Uploadez le fichier `supabase/functions/create-checkout/index.ts`

## 4. Tester le paiement

1. Ajoutez des produits au panier
2. Allez au checkout
3. Cliquez sur "Procéder au paiement"
4. Vous serez redirigé vers la page de paiement SumUp
5. Le client peut payer avec :
   - 💳 Carte bancaire (Visa, Mastercard, etc.)
   - 🍎 Apple Pay
   - 📱 Google Pay

## Comment ça fonctionne

```
Client → Checkout Page → Supabase Edge Function → SumUp API → Page de paiement SumUp
                                                                      ↓
                                                           Client paie (Card/Apple/Google Pay)
                                                                      ↓
                                                           Retour vers votre site
```

1. Le client clique sur "Procéder au paiement"
2. Notre site appelle la Supabase Edge Function
3. La Edge Function appelle l'API SumUp avec votre clé secrète
4. SumUp crée une session de paiement et retourne une URL
5. Le client est redirigé vers cette URL pour payer
6. Après paiement, le client revient sur votre site

## Sécurité

- ✅ Votre clé API SumUp n'est JAMAIS exposée au frontend
- ✅ La clé est stockée de manière sécurisée dans Supabase Secrets
- ✅ Seule la Edge Function (côté serveur) a accès à la clé
- ✅ Les paiements sont traités sur les serveurs sécurisés de SumUp

## Troubleshooting

### Erreur "Payment service not configured"
→ Vérifiez que `SUMUP_API_KEY` est bien configuré dans Supabase Secrets

### Erreur CORS
→ La Edge Function inclut les headers CORS nécessaires. Si le problème persiste, vérifiez l'URL de votre site dans les paramètres SumUp.

### Erreur "Invalid API key"
→ Vérifiez que votre clé API est correcte et active dans le dashboard SumUp

## Variables d'environnement

| Variable | Où la configurer | Description |
|----------|------------------|-------------|
| `SUMUP_API_KEY` | Supabase Secrets | Votre clé API SumUp secrète |
| `VITE_SUPABASE_URL` | `.env.local` / Netlify | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` / Netlify | Clé publique Supabase |







