# 🚨 CORRECTION RAPIDE - Annonces qui ne s'affichent pas

## Problème actuel
- Les annonces ne s'affichent pas en production
- Le service retourne des données de test au lieu des vraies annonces
- Variables d'environnement Supabase manquantes

## ✅ SOLUTION IMMÉDIATE

### Option 1: Configuration manuelle (RECOMMANDÉ)

1. **Allez sur Vercel Dashboard :**
   - https://vercel.com/dashboard
   - Sélectionnez le projet `officielbenome`

2. **Ajoutez les variables d'environnement Supabase :**
   - Settings > Environment Variables
   - Cliquez sur "Add New" pour chaque variable :

   **Première variable :**
   - **Name :** `VITE_SUPABASE_URL`
   - **Value :** `https://vvlpgviacinsbggfsexs.supabase.co`
   - **Environment :** Production (et Preview)

   **Deuxième variable :**
   - **Name :** `VITE_SUPABASE_ANON_KEY`
   - **Value :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bHBndmlhY2luc2JnZ2ZzZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjMzNjUsImV4cCI6MjA3MDA5OTM2NX0.YsZUDyYfgGHD7jNDKAVaR4Y0yzulwLo2NGo85ohHefY`
   - **Environment :** Production (et Preview)

3. **Redéployez :**
   - Allez dans "Deployments"
   - Cliquez sur "Redeploy" sur le dernier déploiement
   - Ou faites un nouveau commit pour déclencher le déploiement

### Option 2: Configuration automatique

Si vous avez un token Vercel :

```bash
# Obtenir le token : https://vercel.com/account/tokens
# Obtenir l'ID du projet : https://vercel.com/dashboard > officielbenome > Settings > General > Project ID

VERCEL_TOKEN=votre_token VERCEL_PROJECT_ID=votre_id node setup-supabase-env.js
```

## 🔍 Vérification

Après la configuration :

1. **Attendez 2-3 minutes** que le déploiement se termine
2. **Testez les annonces** sur https://officielbenome.vercel.app
3. **Vérifiez la console** - Plus de message "Supabase non configuré"

## 📋 Résumé

- **Problème :** Variables d'environnement Supabase manquantes
- **Solution :** Ajouter VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Vercel
- **Temps estimé :** 5 minutes
- **Résultat :** Annonces fonctionnelles en production

## 🆘 Si le problème persiste

1. Vérifiez les logs Vercel : Dashboard > Functions
2. Testez la connexion Supabase directement
3. Vérifiez que les tables existent dans Supabase
4. Consultez le guide complet de dépannage

## 🔧 Diagnostic

Pour vérifier si Supabase est configuré :

```javascript
// Dans la console du navigateur
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Définie' : 'Manquante');
``` 