# 📧 Intégration Brevo pour MaxiMarket - Documentation Complète

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [Templates](#templates)
7. [Tests](#tests)
8. [Migration depuis SendGrid](#migration-depuis-sendgrid)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

L'intégration Brevo pour MaxiMarket offre une solution complète pour :

- ✅ **Emails transactionnels** : Confirmations, notifications, alertes
- ✅ **Campagnes marketing** : Newsletters, offres spéciales, réengagement
- ✅ **Gestion des contacts** : Synchronisation, segmentation, listes
- ✅ **Automation** : Workflows automatisés, séquences d'emails
- ✅ **Analytics** : Statistiques détaillées, tracking, rapports
- ✅ **Fallback automatique** : Bascule vers SendGrid en cas d'erreur

### Avantages de Brevo

- 🆓 **300 emails/jour gratuits** (vs 100 pour SendGrid)
- 📊 **CRM intégré** pour la gestion des contacts
- 🤖 **Automation avancée** avec workflows visuels
- 📱 **SMS et WhatsApp** inclus dans les plans payants
- 💬 **Chat en direct** pour le support client
- 🇫🇷 **Support en français** et interface traduite

---

## 🏗️ Architecture

### Structure des Services

```
src/services/email/
├── brevo.service.js              # Service principal Brevo (emails transactionnels)
├── brevo-campaigns.service.js    # Gestion des campagnes marketing
├── brevo-lists.service.js        # Gestion des listes et contacts
├── brevo-templates.service.js    # Configuration des templates
├── email-provider.service.js     # Abstraction avec fallback
└── index.js                      # Exports centralisés
```

### Flux d'Envoi d'Email

```
Application
    ↓
emailProviderService (abstraction)
    ↓
    ├─→ brevoService (provider principal)
    │       ↓
    │   [Succès] → Email envoyé
    │       ↓
    │   [Erreur] → Fallback activé?
    │
    └─→ sendgridService (fallback)
            ↓
        Email envoyé via SendGrid
```

---

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install @getbrevo/brevo
```

### 2. Vérifier l'installation

```bash
npm list @getbrevo/brevo
```

Résultat attendu :
```
maximarket-frontend@0.1.0
└── @getbrevo/brevo@2.x.x
```

---

## ⚙️ Configuration

### 1. Variables d'environnement

Ajoutez dans `.env.local` :

```bash
# Provider email principal
VITE_EMAIL_PROVIDER=brevo

# Activer le fallback
VITE_EMAIL_USE_FALLBACK=true

# Clé API Brevo
VITE_BREVO_API_KEY=xkeysib-votre_cle_api_ici

# Configuration expéditeur
VITE_FROM_EMAIL=noreply@maximarket.com
VITE_FROM_NAME=MaxiMarket

# Clé SendGrid (fallback)
VITE_SENDGRID_API_KEY=SG.votre_cle_sendgrid
```

### 2. Obtenir la clé API Brevo

1. Créez un compte sur [brevo.com](https://www.brevo.com)
2. Allez dans **Paramètres** > **Clés API SMTP & API**
3. Créez une nouvelle clé API
4. Copiez la clé et ajoutez-la dans `.env.local`

### 3. Configurer les templates

Consultez `BREVO_TEMPLATES_HTML.md` pour créer les templates dans Brevo.

Mettez à jour les IDs dans `src/services/email/brevo-templates.service.js` :

```javascript
export const BREVO_TEMPLATE_IDS = {
  WELCOME_NEWSLETTER: 1,
  WEEKLY_NEWSLETTER: 5,
  SPECIAL_OFFER: 7,
  PASSWORD_RESET: 12,
  // ... autres templates
};
```

---

## 🚀 Utilisation

### Import du Service

```javascript
import { emailProviderService } from '@/services/email';
// ou
import emailProviderService from '@/services/email';
```

### Exemples d'Utilisation

#### 1. Envoyer un email simple

```javascript
await emailProviderService.sendEmail(
  'user@example.com',
  'Bienvenue sur MaxiMarket',
  '<h1>Bienvenue !</h1><p>Merci de votre inscription.</p>'
);
```

#### 2. Envoyer un email avec template

```javascript
await emailProviderService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

#### 3. Envoyer une newsletter

```javascript
const subscribers = [
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com', name: 'User 2' }
];

await emailProviderService.sendWeeklyNewsletter(subscribers, {
  weekStart: '25 novembre 2024',
  newListings: '150+',
  activeUsers: '2.5k'
});
```

#### 4. Gérer les contacts

```javascript
import { brevoService } from '@/services/email';

// Créer ou mettre à jour un contact
await brevoService.createOrUpdateContact(
  'user@example.com',
  {
    FIRSTNAME: 'John',
    LASTNAME: 'Doe',
    SMS: '+221771234567'
  },
  [1] // IDs des listes
);

// Récupérer un contact
const contact = await brevoService.getContact('user@example.com');
```

#### 5. Gérer les campagnes

```javascript
import { brevoCampaignsService } from '@/services/email';

// Créer une campagne
const campaign = await brevoCampaignsService.createCampaign({
  name: 'Newsletter Novembre 2024',
  subject: 'Nouveautés MaxiMarket',
  htmlContent: '<h1>Newsletter</h1>...',
  recipients: { listIds: [1] }
});

// Envoyer la campagne
await brevoCampaignsService.sendCampaignNow(campaign.campaignId);

// Obtenir les statistiques
const stats = await brevoCampaignsService.getCampaignsStats();
```

---

## 📝 Templates

### Templates Disponibles

| Template | ID | Usage |
|----------|----|----|
| Welcome Newsletter | 1 | Bienvenue nouvel abonné |
| Reactivation Newsletter | 2 | Réactivation d'abonnement |
| Weekly Newsletter | 5 | Newsletter hebdomadaire |
| Monthly Newsletter | 6 | Newsletter mensuelle |
| Special Offer | 7 | Offres spéciales |
| Reengagement | 8 | Réengagement utilisateurs inactifs |
| Account Created | 11 | Création de compte |
| Password Reset | 12 | Réinitialisation mot de passe |

### Créer un Nouveau Template

1. **Dans Brevo** :
   - Créez le template avec l'éditeur visuel
   - Notez l'ID du template

2. **Dans le code** :
   ```javascript
   // brevo-templates.service.js
   export const BREVO_TEMPLATE_IDS = {
     // ... templates existants
     NEW_TEMPLATE: 99 // Votre nouvel ID
   };
   
   // Ajouter les paramètres
   export const getTemplateParams = (templateType, data = {}) => {
     const specificParams = {
       // ... params existants
       newTemplate: {
         PARAM1: data.param1,
         PARAM2: data.param2
       }
     };
   };
   ```

3. **Utiliser le template** :
   ```javascript
   await emailProviderService.sendTemplateEmail(
     'user@example.com',
     'newTemplate',
     { param1: 'value1', param2: 'value2' }
   );
   ```

---

## 🧪 Tests

### Exécuter les Tests

```bash
node test-brevo-integration.js
```

### Tests Inclus

1. ✅ Vérification de la configuration
2. ✅ Envoi d'email simple
3. ✅ Envoi avec template
4. ✅ Gestion des contacts
5. ✅ Gestion des listes
6. ✅ Gestion des campagnes
7. ✅ Envoi en batch
8. ✅ Provider avec fallback

### Résultat Attendu

```
🧪 Test de l'intégration Brevo pour MaxiMarket

═══════════════════════════════════════════════
📋 Test 1 : Vérification de la configuration
✅ Configuration Brevo: { brevoConfigured: true, ... }
...
═══════════════════════════════════════════════
📊 RÉSULTATS DES TESTS
═══════════════════════════════════════════════
✅ configuration: RÉUSSI
✅ simpleEmail: RÉUSSI
...
📈 Score: 8/8 tests réussis (100%)
═══════════════════════════════════════════════
🎉 Tous les tests sont passés ! L'intégration Brevo est fonctionnelle.
```

---

## 🔄 Migration depuis SendGrid

### Stratégie de Migration

1. **Phase 1 : Dual-mode** (Recommandé)
   - Brevo comme provider principal
   - SendGrid comme fallback
   - Durée : 1-2 semaines

2. **Phase 2 : Monitoring**
   - Surveiller les taux de succès
   - Comparer les performances
   - Ajuster si nécessaire

3. **Phase 3 : Migration complète**
   - Désactiver SendGrid
   - Brevo uniquement

### Configuration Dual-mode

```bash
# .env.local
VITE_EMAIL_PROVIDER=brevo
VITE_EMAIL_USE_FALLBACK=true
VITE_BREVO_API_KEY=xkeysib-...
VITE_SENDGRID_API_KEY=SG...
```

### Basculer vers SendGrid

```bash
# .env.local
VITE_EMAIL_PROVIDER=sendgrid
VITE_EMAIL_USE_FALLBACK=true
```

### Désactiver le Fallback

```bash
# .env.local
VITE_EMAIL_USE_FALLBACK=false
```

---

## 🔧 Troubleshooting

### Problème : Emails non envoyés

**Symptômes** : Les emails ne sont pas reçus

**Solutions** :
1. Vérifiez la clé API Brevo
2. Vérifiez les quotas (300/jour en gratuit)
3. Consultez les logs Brevo
4. Vérifiez le domaine d'envoi

```javascript
// Vérifier la configuration
const config = emailProviderService.checkConfiguration();
console.log(config);
```

### Problème : Template non trouvé

**Symptômes** : Erreur "Template not found"

**Solutions** :
1. Vérifiez l'ID du template dans Brevo
2. Vérifiez que le template est publié
3. Mettez à jour `BREVO_TEMPLATE_IDS`

```javascript
// Vérifier les templates disponibles
import { getAvailableTemplates } from '@/services/email';
console.log(getAvailableTemplates());
```

### Problème : Emails en spam

**Symptômes** : Les emails arrivent dans les spams

**Solutions** :
1. Authentifiez votre domaine (SPF, DKIM, DMARC)
2. Évitez les mots spam dans le sujet
3. Ajoutez un lien de désinscription
4. Nettoyez votre liste de contacts

### Problème : Erreur API 401

**Symptômes** : "Unauthorized" ou "Invalid API key"

**Solutions** :
1. Vérifiez que la clé API est correcte
2. Vérifiez qu'elle n'a pas expiré
3. Régénérez une nouvelle clé si nécessaire

### Problème : Fallback ne fonctionne pas

**Symptômes** : Pas de basculement vers SendGrid

**Solutions** :
1. Vérifiez `VITE_EMAIL_USE_FALLBACK=true`
2. Vérifiez la clé SendGrid
3. Consultez les logs de l'application

---

## 📚 Ressources

### Documentation

- [Guide de Configuration Brevo](./GUIDE_CONFIGURATION_BREVO.md)
- [Templates HTML](./BREVO_TEMPLATES_HTML.md)
- [Audit d'Intégration](./AUDIT_INTEGRATION_BREVO.md)

### Liens Utiles

- [Documentation Brevo](https://developers.brevo.com/)
- [API Reference](https://developers.brevo.com/reference)
- [SDK Node.js](https://github.com/getbrevo/brevo-node)
- [Support Brevo](https://help.brevo.com/)

### Support

- Email : support@maximarket.com
- Documentation : Ce fichier
- Issues : Créez une issue sur le repo

---

## 📊 Métriques et KPIs

### Métriques à Suivre

- **Taux de délivrabilité** : % d'emails délivrés
- **Taux d'ouverture** : % d'emails ouverts
- **Taux de clic** : % de clics sur les liens
- **Taux de désabonnement** : % de désinscriptions
- **Taux de bounce** : % d'emails rejetés
- **Taux de spam** : % d'emails marqués comme spam

### Dashboard Brevo

Accédez aux statistiques dans :
- **Statistiques** > **Emails** : Vue d'ensemble
- **Campagnes** > **Rapports** : Détails par campagne
- **Contacts** > **Statistiques** : Évolution des contacts

---

## 🎉 Conclusion

L'intégration Brevo est maintenant complète et prête à l'emploi. Vous disposez de :

- ✅ Services email complets (transactionnels + marketing)
- ✅ Gestion avancée des contacts et listes
- ✅ Templates HTML professionnels
- ✅ Système de fallback automatique
- ✅ Tests et monitoring
- ✅ Documentation complète

**Prochaines étapes** :

1. Configurez votre compte Brevo
2. Créez les templates
3. Testez l'intégration
4. Migrez progressivement depuis SendGrid
5. Surveillez les performances

Bon envoi d'emails ! 📧
