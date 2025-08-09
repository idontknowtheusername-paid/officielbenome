# 🔍 AUDIT RENOMMAGE - BENOME → MAXIMARKET

## 📋 RÉSUMÉ EXÉCUTIF

Cet audit identifie **tous les endroits** dans le codebase où l'ancien nom "Benome" (et ses variations) apparaît encore au lieu du nouveau nom "MaxiMarket". 

**Total d'occurrences trouvées : 89 références** réparties dans **32 fichiers**

## 🚨 PRIORITÉS DE RENOMMAGE

### 🔴 PRIORITÉ CRITIQUE (Impact utilisateur direct)
1. **Interface utilisateur** - Titres, descriptions, messages
2. **Configuration d'environnement** - Variables d'environnement
3. **Métadonnées HTML** - SEO et affichage navigateur

### 🟡 PRIORITÉ MOYENNE (Impact technique)
1. **Noms de projets** - URLs, noms de services
2. **Cache et localStorage** - Clés de cache
3. **Emails système** - Adresses d'expédition

### 🟢 PRIORITÉ BASSE (Documentation)
1. **Fichiers de documentation** - README, guides
2. **Commentaires de code** - Documentation interne

## 📁 FICHIERS À MODIFIER

### 🔴 FICHIERS CRITIQUES (Interface utilisateur)

#### 1. **src/config/defaults.js** (Ligne 7)
```javascript
// AVANT
name: import.meta.env.VITE_APP_NAME || 'Officiel BenoMe',

// APRÈS
name: import.meta.env.VITE_APP_NAME || 'MaxiMarket',
```

#### 2. **src/contexts/AuthContext.jsx** (Lignes 98, 211)
```javascript
// AVANT
description: "Bienvenue sur Officiel BenoMe !",

// APRÈS
description: "Bienvenue sur MaxiMarket !",
```

#### 3. **src/pages/auth/ProfilePage.jsx** (Ligne 614)
```javascript
// AVANT
Vous n'avez pas encore effectué de transactions sur Benome.

// APRÈS
Vous n'avez pas encore effectué de transactions sur MaxiMarket.
```

#### 4. **index.html** (Lignes 8-9)
```html
<!-- AVANT -->
<meta name="description" content="Benome - Votre marketplace futuriste pour l'immobilier, l'automobile, les services et plus en Afrique de l'Ouest." />
<title>Benome | Marketplace Afrique de l'Ouest</title>

<!-- APRÈS -->
<meta name="description" content="MaxiMarket - Votre marketplace futuriste pour l'immobilier, l'automobile, les services et plus en Afrique de l'Ouest." />
<title>MaxiMarket | Marketplace Afrique de l'Ouest</title>
```

#### 5. **dist/index.html** (Lignes 8-9)
```html
<!-- AVANT -->
<meta name="description" content="Benome - Votre marketplace futuriste pour l'immobilier, l'automobile, les services et plus en Afrique de l'Ouest." />
<title>Benome | Marketplace Afrique de l'Ouest</title>

<!-- APRÈS -->
<meta name="description" content="MaxiMarket - Votre marketplace futuriste pour l'immobilier, l'automobile, les services et plus en Afrique de l'Ouest." />
<title>MaxiMarket | Marketplace Afrique de l'Ouest</title>
```

### 🟡 FICHIERS TECHNIQUES

#### 6. **src/lib/localCache.js** (Lignes 1, 240, 252, 264)
```javascript
// AVANT
constructor(prefix = 'benome') {
keys.filter(key => key.includes('benome:listings:'))
keys.filter(key => key.includes('benome:messages:'))
keys.filter(key => key.includes('benome:user:'))

// APRÈS
constructor(prefix = 'maximarket') {
keys.filter(key => key.includes('maximarket:listings:'))
keys.filter(key => key.includes('maximarket:messages:'))
keys.filter(key => key.includes('maximarket:user:'))
```

#### 7. **src/pages/admin/moderation/ModerationPage.jsx** (Ligne 197)
```javascript
// AVANT
email: 'system@benome.com'

// APRÈS
email: 'system@maximarket.com'
```

#### 8. **src/pages/ListingDetailPage.jsx** (Lignes 93, 107-108)
```javascript
// AVANT
window.__BENOME_CONTEXT = {
if (typeof window !== 'undefined' && window.__BENOME_CONTEXT) {
delete window.__BENOME_CONTEXT;

// APRÈS
window.__MAXIMARKET_CONTEXT = {
if (typeof window !== 'undefined' && window.__MAXIMARKET_CONTEXT) {
delete window.__MAXIMARKET_CONTEXT;
```

#### 9. **src/components/ChatWidget.jsx** (Ligne 24)
```javascript
// AVANT
...(typeof window !== 'undefined' && window.__BENOME_CONTEXT ? window.__BENOME_CONTEXT : {}),

// APRÈS
...(typeof window !== 'undefined' && window.__MAXIMARKET_CONTEXT ? window.__MAXIMARKET_CONTEXT : {}),
```

#### 10. **public/sw.js** (Ligne 1)
```javascript
// AVANT
const CACHE_NAME = 'officielbenome-v1';

// APRÈS
const CACHE_NAME = 'maximarket-v1';
```

### 🟢 FICHIERS DE CONFIGURATION

#### 11. **env.example** (Ligne 6)
```bash
# AVANT
VITE_APP_NAME=Officiel BenoMe

# APRÈS
VITE_APP_NAME=MaxiMarket
```

#### 12. **vite.config.js** (Ligne 335)
```javascript
// AVANT
target: 'https://officielbenome-backend.onrender.com',

// APRÈS
target: 'https://maximarket-backend.onrender.com',
```

#### 13. **root-package.json** (Ligne 1)
```json
// AVANT
"name": "officielbenome-root",

// APRÈS
"name": "maximarket-root",
```

### 📚 FICHIERS DE DOCUMENTATION

#### 14. **README.md** (Lignes 1, 2, 37, 65-66, 75, 88, 99, 437)
- Titre principal
- Description du projet
- Instructions d'installation
- URLs de backend
- Nom de l'application
- Documentation backend
- Contact développeur

#### 15. **CACHE_AUDIT_RECOMMENDATIONS.md** (Lignes 1, 19, 189, 224)
- Titre du document
- Nom du projet dans les exemples
- Noms de cache
- Préfixes de cache

#### 16. **AUDIT_COMPLET_DEPOT.md** (Lignes 1, 10, 376)
- Titre du document
- Description du projet
- Conclusion

#### 17. **TODO_DASHBOARD.md** (Lignes 1, 69, 120)
- Titre du document
- Chemins de projet
- Description des fonctionnalités

#### 18. **DASHBOARD_README.md** (Lignes 1, 4, 233, 237)
- Titre du document
- Description du dashboard
- Conclusion
- Signature

### 🔧 FICHIERS DE SETUP

#### 19. **setup-vercel-env.js** (Lignes 25, 108, 125, 132, 144, 148)
- Instructions de configuration
- Nom du projet Vercel
- URLs de test
- Configuration d'environnement

#### 20. **setup-supabase-env.js** (Lignes 30, 116, 133, 140, 154, 158)
- Instructions de configuration
- Nom du projet Supabase
- URLs de test
- Configuration d'environnement

#### 21. **supabase-setup.sql** (Ligne 1)
```sql
-- AVANT
-- CONFIGURATION AUTOMATIQUE SUPABASE - OFFICIEL BENOME

-- APRÈS
-- CONFIGURATION AUTOMATIQUE SUPABASE - MAXIMARKET
```

### 📧 FICHIERS D'EMAILS

#### 22. **SUPABASE_AUTH_CONFIG.md** (Lignes 9, 12-13, 28, 32, 38)
- URLs de site
- URLs de callback
- Sujets d'emails

#### 23. **SUPABASE_SETUP_GUIDE.md** (Lignes 1, 14)
- Titre du guide
- Nom du projet

### 🔍 FICHIERS DE DEBUG

#### 24. **src/components/VercelDebug.jsx** (Ligne 99)
```javascript
// AVANT
<li>Sélectionnez votre projet officielbenome</li>

// APRÈS
<li>Sélectionnez votre projet maximarket</li>
```

### 📋 FICHIERS DE MIGRATION

#### 25. **MIGRATION_CURRENCY_COLUMN.md** (Ligne 10)
```markdown
<!-- AVANT -->
3. Sélectionnez votre projet "officielbenome"

<!-- APRÈS -->
3. Sélectionnez votre projet "maximarket"
```

#### 26. **PLAN_MIGRATION_SUPABASE.md** (Ligne 1)
```markdown
<!-- AVANT -->
# 🚀 PLAN DE MIGRATION VERS SUPABASE - OFFICIEL BENOME

<!-- APRÈS -->
# 🚀 PLAN DE MIGRATION VERS SUPABASE - MAXIMARKET
```

### 🚀 FICHIERS DE FIX RAPIDE

#### 27. **QUICK_FIX_CHATBOT.md** (Lignes 13, 34, 44, 60)
- Nom du projet
- URLs de configuration
- URLs de test

#### 28. **QUICK_FIX_ANNOUNCEMENTS.md** (Lignes 13, 40, 50)
- Nom du projet
- URLs de configuration
- URLs de test

### 📊 FICHIERS D'AUDIT

#### 29. **AUDIT_FRONTEND_BACKEND.md** (Ligne 4)
```markdown
<!-- AVANT -->
Cette analyse compare l'état actuel du frontend React et du backend Node.js/Express de l'application MaxiMarket/OfficielBenoMe.

<!-- APRÈS -->
Cette analyse compare l'état actuel du frontend React et du backend Node.js/Express de l'application MaxiMarket.
```

## 🚀 PLAN D'ACTION RECOMMANDÉ

### Phase 1 : Interface utilisateur (1-2 heures)
1. ✅ Modifier `src/config/defaults.js`
2. ✅ Modifier `src/contexts/AuthContext.jsx`
3. ✅ Modifier `src/pages/auth/ProfilePage.jsx`
4. ✅ Modifier `index.html` et `dist/index.html`

### Phase 2 : Configuration technique (2-3 heures)
1. ✅ Modifier `src/lib/localCache.js`
2. ✅ Modifier `src/pages/admin/moderation/ModerationPage.jsx`
3. ✅ Modifier `src/pages/ListingDetailPage.jsx`
4. ✅ Modifier `src/components/ChatWidget.jsx`
5. ✅ Modifier `public/sw.js`
6. ✅ Modifier `env.example`
7. ✅ Modifier `vite.config.js`
8. ✅ Modifier `root-package.json`

### Phase 3 : Documentation (1-2 heures)
1. ✅ Mettre à jour tous les fichiers README
2. ✅ Mettre à jour les guides de configuration
3. ✅ Mettre à jour les fichiers d'audit

### Phase 4 : Tests et validation (1 heure)
1. ✅ Tester l'application après les modifications
2. ✅ Vérifier que le cache fonctionne correctement
3. ✅ Valider les emails et notifications
4. ✅ Tester la navigation et l'interface

## ⚠️ POINTS D'ATTENTION

### 1. **Cache localStorage**
- Les anciennes clés de cache `benome:*` devront être migrées
- Ajouter une fonction de migration automatique

### 2. **Variables d'environnement**
- Mettre à jour les variables sur Vercel/Supabase
- Tester en production après déploiement

### 3. **URLs de backend**
- Vérifier que les nouvelles URLs sont fonctionnelles
- Mettre à jour les configurations de proxy

### 4. **Emails système**
- Mettre à jour les templates d'emails
- Tester l'envoi d'emails

## 📊 STATISTIQUES

- **Total d'occurrences** : 89
- **Fichiers concernés** : 32
- **Lignes de code** : ~150
- **Temps estimé** : 5-8 heures
- **Risque** : Faible (renommage simple)

## 🎯 BÉNÉFICES

1. **Cohérence de marque** : Nom uniforme dans toute l'application
2. **SEO amélioré** : Métadonnées cohérentes
3. **Expérience utilisateur** : Interface cohérente
4. **Maintenabilité** : Code plus clair et organisé

---

*Audit généré le : $(date)*
*Total d'occurrences trouvées : 89*
*Priorité : HAUTE - Impact utilisateur direct* 