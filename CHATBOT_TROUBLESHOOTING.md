# Guide de Dépannage - Chatbot MaxiMarket

## Problème : Le chatbot affiche le fallback en production

### Symptômes
- Le chatbot répond avec "Bonjour. Je reste à votre disposition..." au lieu d'une réponse intelligente
- Messages d'erreur génériques sans détails
- Fonctionne en local mais pas en production

### Causes possibles et solutions

#### 1. Variable d'environnement MISTRAL_API_KEY manquante

**Symptôme :** Erreur "API configuration error"

**Solution :**
1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Settings > Environment Variables
4. Ajoutez :
   - **Name :** `MISTRAL_API_KEY`
   - **Value :** Votre clé API Mistral (commence par 'r')
   - **Environment :** Production (et Preview si nécessaire)
5. Redéployez l'application

#### 2. Clé API Mistral invalide ou expirée

**Symptôme :** Erreur 401 Unauthorized

**Solution :**
1. Vérifiez votre clé API sur [Mistral AI Console](https://console.mistral.ai/)
2. Générez une nouvelle clé si nécessaire
3. Mettez à jour la variable d'environnement dans Vercel
4. Redéployez

#### 3. Limite de quota atteinte

**Symptôme :** Erreur 429 Too Many Requests

**Solution :**
1. Vérifiez votre quota sur [Mistral AI Console](https://console.mistral.ai/)
2. Attendez quelques minutes avant de réessayer
3. Considérez un plan avec plus de requêtes si nécessaire

#### 4. Problème de permissions

**Symptôme :** Erreur 403 Forbidden

**Solution :**
1. Vérifiez que votre compte Mistral a accès aux modèles utilisés
2. Vérifiez les permissions de votre clé API
3. Contactez le support Mistral si nécessaire

### Diagnostic

#### Utiliser le script de diagnostic

```bash
# Installer node-fetch si nécessaire
npm install node-fetch

# Exécuter le diagnostic
node debug-vercel.js
```

#### Vérifier les logs Vercel

1. Allez sur Vercel Dashboard > votre projet
2. Functions > /api/chat
3. Vérifiez les logs d'erreur

#### Tester l'API directement

```bash
curl -X POST https://api.mistral.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -d '{
    "model": "mistral-small-latest",
    "messages": [{"role": "user", "content": "Test"}],
    "max_tokens": 10
  }'
```

### Configuration recommandée

#### Variables d'environnement Vercel

```
MISTRAL_API_KEY=rJHJdTtKsu58p2k1j5jkBmUwyc56z5tP
```

#### Configuration du modèle

- **Modèle par défaut :** `mistral-small-latest`
- **Modèle alternatif :** `mistral-large-latest`
- **Température :** 0.4
- **Max tokens :** 600

### Améliorations apportées

1. **Gestion d'erreur améliorée** : Messages d'erreur spécifiques selon le type d'erreur
2. **Logging détaillé** : Logs d'erreur dans la console pour faciliter le diagnostic
3. **Variables d'environnement** : Plus de clé API hardcodée
4. **Script de diagnostic** : Outil pour tester l'API et identifier les problèmes

### Prévention

1. **Surveillance des quotas** : Vérifiez régulièrement votre utilisation Mistral
2. **Backup de clé API** : Gardez une clé API de secours
3. **Monitoring** : Surveillez les logs Vercel pour détecter les problèmes rapidement
4. **Tests réguliers** : Testez le chatbot périodiquement en production

### Support

Si le problème persiste après avoir essayé ces solutions :

1. Vérifiez les logs Vercel pour plus de détails
2. Testez avec le script de diagnostic
3. Contactez le support technique avec les logs d'erreur 