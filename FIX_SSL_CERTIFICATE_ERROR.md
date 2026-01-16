# Fix SSL Certificate Error (ERR_PROXY_CERTIFICATE_INVALID)

## Problème
L'erreur `ERR_PROXY_CERTIFICATE_INVALID` indique qu'un proxy/VPN intercepte les connexions HTTPS vers Supabase.

## Solutions

### Solution 1: Désactiver le proxy/VPN (Recommandé)
1. Désactivez temporairement votre VPN ou proxy
2. Rechargez la page
3. Les produits devraient maintenant se charger depuis Supabase

### Solution 2: Configurer le navigateur pour accepter le certificat
1. Ouvrez Chrome/Edge
2. Allez dans Paramètres → Confidentialité et sécurité → Certificats
3. Cliquez sur "Gérer les certificats"
4. Vérifiez que les certificats sont valides

### Solution 3: Utiliser un autre réseau
- Essayez une connexion WiFi différente
- Ou utilisez les données mobiles

### Solution 4: Vérifier les paramètres proxy Windows
1. Ouvrez Paramètres Windows → Réseau et Internet → Proxy
2. Désactivez "Détection automatique des paramètres"
3. Ou configurez manuellement le proxy

## Vérification

Après avoir résolu le problème SSL, vérifiez que :
1. Les produits se chargent depuis Supabase
2. Les liens de produits fonctionnent (utilisent maintenant SKU ou slug)
3. La console ne montre plus d'erreurs SSL

## Note

Le code a été amélioré pour :
- Chercher les produits par ID (UUID), SKU, ou slug
- Gérer les erreurs SSL de manière plus claire
- Utiliser uniquement la base de données (pas de fallback statique)


