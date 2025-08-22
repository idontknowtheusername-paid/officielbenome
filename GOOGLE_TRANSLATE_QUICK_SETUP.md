# 🚀 Configuration Rapide Google Translate API

## ⚡ **ÉTAPES RAPIDES (5 minutes)**

### **1. Créer un Projet Google Cloud**
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur "Sélectionner un projet" → "Nouveau projet"
3. Nommez-le : `maximarket-translate`
4. Cliquez sur "Créer"

### **2. Activer l'API**
1. Dans le menu, allez à "APIs & Services" → "Library"
2. Recherchez "Cloud Translation API"
3. Cliquez dessus → "Activer"

### **3. Créer une Clé API**
1. "APIs & Services" → "Credentials"
2. "Create Credentials" → "API Key"
3. Copiez la clé générée

### **4. Configurer l'Application**
```bash
# Créer le fichier .env
cp env.example .env

# Éditer le fichier .env
nano .env
```

Ajoutez votre clé :
```env
VITE_GOOGLE_TRANSLATE_API_KEY=votre_clé_api_ici
```

### **5. Redémarrer l'Application**
```bash
npm run dev
```

---

## 💰 **COÛTS ESTIMÉS**

- **Gratuit** : 500,000 caractères/mois
- **Payant** : $20 par million de caractères
- **Estimation MaxiMarket** : ~$5-10/mois

---

## ✅ **VÉRIFICATION**

Après configuration, vous devriez voir :
```
Translation service initialized with API key (REST mode)
```

Au lieu de :
```
Translation service not configured, using mock mode
```

---

## 🔧 **RESTRICTIONS DE SÉCURITÉ (Optionnel)**

1. Cliquez sur votre clé API
2. "Application restrictions" → "HTTP referrers"
3. Ajoutez : `localhost:5173/*`, `votre-domaine.com/*`
4. "API restrictions" → "Restrict key"
5. Sélectionnez "Cloud Translation API"

---

## 🎯 **RÉSULTAT**

- ✅ **Traduction réelle** des annonces
- ✅ **Traduction automatique** du contenu
- ✅ **Cache intelligent** pour optimiser les coûts
- ✅ **Fallback** vers le mode simulé en cas d'erreur

**Votre application sera entièrement bilingue avec traduction automatique !** 🌍✨
