# 🌐 Configuration Google Translate API - MaxiMarket

## 📋 **Vue d'Ensemble**

Ce guide vous explique comment configurer Google Translate API pour activer la traduction automatique réelle dans MaxiMarket.

## 🚀 **Étapes de Configuration**

### **1. Créer un Projet Google Cloud**

1. **Accéder à Google Cloud Console**
   - Allez sur [console.cloud.google.com](https://console.cloud.google.com)
   - Connectez-vous avec votre compte Google

2. **Créer un nouveau projet**
   - Cliquez sur le sélecteur de projet en haut
   - Cliquez sur "Nouveau projet"
   - Nommez-le "maximarket-translate" (ou autre nom)
   - Cliquez sur "Créer"

3. **Activer l'API Translate**
   - Dans le menu, allez à "APIs & Services" > "Library"
   - Recherchez "Cloud Translation API"
   - Cliquez dessus et cliquez sur "Activer"

### **2. Configurer l'Authentification**

#### **Option A : Clé API (Recommandée pour le développement)**

1. **Créer une clé API**
   - Allez à "APIs & Services" > "Credentials"
   - Cliquez sur "Create Credentials" > "API Key"
   - Copiez la clé générée

2. **Restreindre la clé (optionnel mais recommandé)**
   - Cliquez sur la clé créée
   - Dans "Application restrictions", sélectionnez "HTTP referrers"
   - Ajoutez vos domaines (ex: `localhost:5173/*`, `yourdomain.com/*`)
   - Dans "API restrictions", sélectionnez "Restrict key"
   - Sélectionnez "Cloud Translation API"

#### **Option B : Compte de Service (Recommandée pour la production)**

1. **Créer un compte de service**
   - Allez à "IAM & Admin" > "Service Accounts"
   - Cliquez sur "Create Service Account"
   - Nommez-le "maximarket-translate-service"
   - Cliquez sur "Create and Continue"

2. **Attribuer les rôles**
   - Ajoutez le rôle "Cloud Translation API User"
   - Cliquez sur "Done"

3. **Créer une clé**
   - Cliquez sur le compte de service créé
   - Allez dans l'onglet "Keys"
   - Cliquez sur "Add Key" > "Create new key"
   - Sélectionnez "JSON"
   - Téléchargez le fichier JSON

### **3. Configuration dans l'Application**

#### **Option A : Clé API**

1. **Créer le fichier .env**
   ```bash
   # Copier le fichier d'exemple
   cp env.example .env
   ```

2. **Ajouter la clé API**
   ```env
   # Google Translate API Configuration
   VITE_GOOGLE_TRANSLATE_API_KEY=your_actual_api_key_here
   ```

#### **Option B : Compte de Service**

1. **Placer le fichier JSON**
   ```bash
   # Créer un dossier pour les clés
   mkdir -p keys
   # Placer le fichier JSON téléchargé
   mv ~/Downloads/maximarket-translate-service-*.json keys/
   ```

2. **Configurer les variables d'environnement**
   ```env
   # Google Cloud Project Configuration
   VITE_GOOGLE_CLOUD_PROJECT_ID=your-project-id
   VITE_GOOGLE_CLOUD_KEY_FILE=keys/maximarket-translate-service-*.json
   ```

### **4. Tester la Configuration**

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Accéder au test d'internationalisation**
   - Allez sur `/translation-test` (si configuré)
   - Ou utilisez le composant `TranslationTest`

3. **Vérifier le statut**
   - Cliquez sur "Tester la connexion API"
   - Vous devriez voir "✅ API connection successful"

## 💰 **Coûts et Quotas**

### **Tarification Google Translate API**
- **500,000 caractères/mois gratuits**
- **$20 par million de caractères** après le quota gratuit
- **Limite de 100,000 caractères par requête**

### **Estimation des Coûts**
- **1,000 annonces traduites** ≈ 50,000 caractères ≈ **Gratuit**
- **10,000 annonces traduites** ≈ 500,000 caractères ≈ **Gratuit**
- **100,000 annonces traduites** ≈ 5M caractères ≈ **$100/mois**

### **Optimisations pour Réduire les Coûts**
1. **Cache des traductions** (déjà implémenté)
2. **Traduction par lots** (à implémenter)
3. **Limitation des champs traduits**
4. **Détection de langue avant traduction**

## 🔧 **Configuration Avancée**

### **Variables d'Environnement Complètes**
```env
# Google Translate API
VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key

# OU Google Cloud Project
VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id
VITE_GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json

# Configuration de l'application
VITE_APP_NAME=MaxiMarket
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

### **Configuration de Production**

1. **Variables d'environnement Vercel**
   ```bash
   # Dans Vercel Dashboard
   VITE_GOOGLE_TRANSLATE_API_KEY=your_production_api_key
   ```

2. **Sécurité**
   - Utilisez des clés API restreintes
   - Activez la facturation d'alerte
   - Surveillez l'utilisation

### **Monitoring et Alertes**

1. **Google Cloud Monitoring**
   - Allez à "Monitoring" > "Dashboards"
   - Créez un dashboard pour l'API Translate

2. **Alertes de facturation**
   - Allez à "Billing" > "Budgets & alerts"
   - Créez une alerte à $50/mois

## 🧪 **Tests et Validation**

### **Test Manuel**
```javascript
// Dans la console du navigateur
import { translationService } from '@/services/translation.service';

// Tester la connexion
const status = await translationService.testConnection();
console.log(status);

// Tester une traduction
const result = await translationService.translateText('Bonjour', 'en', 'fr');
console.log(result); // Devrait afficher "Hello"
```

### **Test Automatisé**
```javascript
// Tests unitaires à ajouter
describe('Translation Service', () => {
  test('should translate text correctly', async () => {
    const result = await translationService.translateText('Hello', 'fr', 'en');
    expect(result).toBe('Bonjour');
  });
});
```

## 🚨 **Dépannage**

### **Erreurs Courantes**

1. **"API key not valid"**
   - Vérifiez que la clé API est correcte
   - Vérifiez les restrictions de domaine

2. **"Quota exceeded"**
   - Vérifiez votre quota dans Google Cloud Console
   - Activez la facturation si nécessaire

3. **"Project not found"**
   - Vérifiez l'ID du projet
   - Vérifiez que l'API est activée

### **Logs de Débogage**
```javascript
// Activer les logs détaillés
console.log('Translation service config:', {
  isConfigured: translationService.isConfigured,
  hasKey: !!import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY,
  hasProject: !!import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID
});
```

## 📊 **Métriques et Performance**

### **Statistiques du Cache**
```javascript
const stats = translationService.getCacheStats();
console.log('Cache hit rate:', stats.hitRate);
console.log('Total requests:', stats.totalRequests);
```

### **Optimisations Recommandées**
1. **Cache Redis** pour la production
2. **Traduction par lots** pour les listes
3. **Pré-traduction** des contenus populaires
4. **CDN** pour les traductions statiques

## ✅ **Checklist de Configuration**

- [ ] Projet Google Cloud créé
- [ ] API Translate activée
- [ ] Clé API ou compte de service créé
- [ ] Variables d'environnement configurées
- [ ] Test de connexion réussi
- [ ] Traduction de test fonctionnelle
- [ ] Alertes de facturation configurées
- [ ] Monitoring en place

## 🎉 **Résultat Final**

Une fois configuré, MaxiMarket aura :
- ✅ **Traduction automatique réelle** avec Google Translate
- ✅ **Cache intelligent** pour optimiser les coûts
- ✅ **Fallback gracieux** en cas d'erreur
- ✅ **Support multilingue complet**
- ✅ **Interface localisée** pour tous les utilisateurs

---

**Status** : 🔧 **CONFIGURATION REQUISE**  
**Priorité** : 🟡 **MOYENNE**  
**Coût estimé** : 💰 **$20-100/mois selon l'usage**
