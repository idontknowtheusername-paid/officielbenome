# 🚨 CORRECTION RAPIDE - Chatbot en erreur 500

## Problème actuel
- Le chatbot affiche une erreur 500 en production
- `FUNCTION_INVOCATION_FAILED` sur `/api/chat`
- Variable d'environnement `MISTRAL_API_KEY` manquante

## ✅ SOLUTION IMMÉDIATE

### Option 1: Configuration manuelle (RECOMMANDÉ)

1. **Allez sur Vercel Dashboard :**
   - https://vercel.com/dashboard
   - Sélectionnez le projet `officielbenome`

2. **Ajoutez la variable d'environnement :**
   - Settings > Environment Variables
   - Cliquez sur "Add New"
   - **Name :** `MISTRAL_API_KEY`
   - **Value :** `rJHJdTtKsu58p2k1j5jkBmUwyc56z5tP`
   - **Environment :** Production (et Preview)
   - Cliquez sur "Save"

3. **Redéployez :**
   - Allez dans "Deployments"
   - Cliquez sur "Redeploy" sur le dernier déploiement
   - Ou faites un nouveau commit pour déclencher le déploiement

### Option 2: Configuration automatique

Si vous avez un token Vercel :

```bash
# Obtenir le token : https://vercel.com/account/tokenss
# Obtenir l'ID du projet : https://vercel.com/dashboard > officielbenome > Settings > General > Project ID

VERCEL_TOKEN=votre_token VERCEL_PROJECT_ID=votre_id node setup-vercel-env.js
```

## 🔍 Vérification

Après la configuration :

1. **Attendez 2-3 minutes** que le déploiement se termine
2. **Testez le chatbot** sur https://officielbenome.vercel.app
3. **Vérifiez avec le diagnostic :**
   ```bash
   node debug-vercel.js
   ```

## 📋 Résumé

- **Problème :** Variable d'environnement manquante
- **Solution :** Ajouter `MISTRAL_API_KEY = rJHJdTtKsu58p2k1j5jkBmUwyc56z5tP` dans Vercel
- **Temps estimé :** 5 minutes
- **Résultat :** Chatbot fonctionnel en production

## 🆘 Si le problème persiste

1. Vérifiez les logs Vercel : Dashboard > Functions > /api/chat
2. Testez l'API directement : `curl -X POST https://officielbenome.vercel.app/api/chat`
3. Consultez le guide complet : `CHATBOT_TROUBLESHOOTING.md` 