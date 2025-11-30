# 📧 Guide de Configuration Brevo pour MaxiMarket

## 🚀 Étape 1 : Créer un Compte Brevo

1. Allez sur [https://www.brevo.com](https://www.brevo.com)
2. Cliquez sur "S'inscrire gratuitement"
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email
5. Complétez votre profil

### Plan Gratuit Brevo
- ✅ 300 emails/jour
- ✅ Contacts illimités
- ✅ Templates illimités
- ✅ Automation de base
- ✅ Support email

## 🔑 Étape 2 : Obtenir la Clé API

1. Connectez-vous à votre compte Brevo
2. Allez dans **Paramètres** (icône engrenage en haut à droite)
3. Cliquez sur **Clés API SMTP & API**
4. Cliquez sur **Créer une nouvelle clé API**
5. Donnez un nom à votre clé : `MaxiMarket Production`
6. Copiez la clé API (elle ne sera affichée qu'une seule fois !)

### Configuration dans .env.local

```bash
# Configuration Brevo
VITE_BREVO_API_KEY=xkeysib-votre_cle_api_ici
VITE_EMAIL_PROVIDER=brevo
VITE_EMAIL_USE_FALLBACK=true
VITE_FROM_EMAIL=noreply@maximarket.com
VITE_FROM_NAME=MaxiMarket
```

## 📝 Étape 3 : Créer les Templates Email

### Templates à Créer dans Brevo

Allez dans **Campagnes** > **Templates** > **Créer un template**

#### 1. Welcome Newsletter (ID: 1)
- **Nom**: Welcome Newsletter MaxiMarket
- **Sujet**: 🎉 Bienvenue sur MaxiMarket !
- **Variables**: `{{params.FIRST_NAME}}`, `{{params.EMAIL}}`, `{{params.APP_URL}}`

#### 2. Reactivation Newsletter (ID: 2)
- **Nom**: Reactivation Newsletter
- **Sujet**: 🔄 Bienvenue de retour sur MaxiMarket !
- **Variables**: `{{params.EMAIL}}`, `{{params.APP_URL}}`

#### 3. Weekly Newsletter (ID: 5)
- **Nom**: Weekly Newsletter
- **Sujet**: 📊 Votre résumé MaxiMarket de la semaine
- **Variables**: `{{params.WEEK_START}}`, `{{params.NEW_LISTINGS}}`, `{{params.ACTIVE_USERS}}`

#### 4. Monthly Newsletter (ID: 6)
- **Nom**: Monthly Newsletter
- **Sujet**: 📈 Rapport mensuel MaxiMarket
- **Variables**: `{{params.MONTH}}`, `{{params.TOTAL_LISTINGS}}`, `{{params.TOTAL_USERS}}`

#### 5. Special Offer (ID: 7)
- **Nom**: Special Offer
- **Sujet**: 🎁 Offre spéciale MaxiMarket
- **Variables**: `{{params.OFFER_TITLE}}`, `{{params.DISCOUNT}}`, `{{params.PROMO_CODE}}`

#### 6. Account Created (ID: 11)
- **Nom**: Account Created
- **Sujet**: ✅ Votre compte MaxiMarket a été créé
- **Variables**: `{{params.FIRST_NAME}}`, `{{params.EMAIL}}`, `{{params.VERIFICATION_URL}}`

#### 7. Password Reset (ID: 12)
- **Nom**: Password Reset
- **Sujet**: 🔐 Réinitialisation de votre mot de passe
- **Variables**: `{{params.FIRST_NAME}}`, `{{params.RESET_URL}}`, `{{params.EXPIRY_TIME}}`

### Astuce : Utiliser l'Éditeur Drag & Drop

1. Utilisez l'éditeur visuel de Brevo
2. Ajoutez des blocs de contenu
3. Personnalisez les couleurs (utilisez #667eea pour MaxiMarket)
4. Ajoutez des boutons CTA
5. Testez le rendu sur mobile
6. Sauvegardez le template

### Variables Communes à Tous les Templates

```
{{params.APP_NAME}} - MaxiMarket
{{params.APP_URL}} - URL de l'application
{{params.CURRENT_YEAR}} - Année actuelle
{{params.SUPPORT_EMAIL}} - support@maximarket.com
{{params.UNSUBSCRIBE_URL}} - Lien de désinscription
```

## 📋 Étape 4 : Créer les Listes de Contacts

1. Allez dans **Contacts** > **Listes**
2. Cliquez sur **Créer une liste**

### Listes Recommandées

#### Liste 1 : Newsletter Subscribers (ID: 1)
- **Nom**: Newsletter Subscribers
- **Description**: Tous les abonnés à la newsletter MaxiMarket

#### Liste 2 : Active Users (ID: 2)
- **Nom**: Active Users
- **Description**: Utilisateurs actifs sur la plateforme

#### Liste 3 : Premium Users (ID: 3)
- **Nom**: Premium Users
- **Description**: Utilisateurs avec compte premium

#### Liste 4 : Inactive Users (ID: 4)
- **Nom**: Inactive Users
- **Description**: Utilisateurs inactifs (réengagement)

## 🔄 Étape 5 : Synchroniser les Contacts Existants

### Script de Synchronisation

```javascript
import { brevoListsService } from './src/services/email/brevo-lists.service.js';
import { supabase } from './src/lib/supabase.js';

async function syncNewsletterSubscribers() {
  // Récupérer les abonnés depuis Supabase
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_active', true);

  // Synchroniser avec Brevo (Liste ID: 1)
  const result = await brevoListsService.syncNewsletterSubscribers(subscribers, 1);
  
  console.log('✅ Synchronisation terminée:', result);
}

syncNewsletterSubscribers();
```

## 🎯 Étape 6 : Configurer les Webhooks (Optionnel)

### Webhooks pour le Tracking

1. Allez dans **Paramètres** > **Webhooks**
2. Cliquez sur **Ajouter un webhook**
3. URL du webhook : `https://votre-domaine.com/api/webhooks/brevo`
4. Événements à suivre :
   - ✅ Email ouvert
   - ✅ Email cliqué
   - ✅ Email bounced
   - ✅ Email spam
   - ✅ Désinscription

### Exemple de Webhook Handler

```javascript
// api/webhooks/brevo.js
export async function POST(request) {
  const event = await request.json();
  
  switch(event.event) {
    case 'opened':
      // Traiter l'ouverture d'email
      break;
    case 'click':
      // Traiter le clic
      break;
    case 'unsubscribed':
      // Traiter la désinscription
      break;
  }
  
  return new Response('OK', { status: 200 });
}
```

## 🧪 Étape 7 : Tester l'Intégration

### Test 1 : Envoi d'Email Simple

```javascript
import { brevoService } from './src/services/email/brevo.service.js';

await brevoService.sendEmail(
  'test@example.com',
  'Test MaxiMarket',
  '<h1>Email de test</h1><p>Ceci est un test.</p>'
);
```

### Test 2 : Envoi avec Template

```javascript
import { brevoService } from './src/services/email/brevo.service.js';

await brevoService.sendTemplateEmail(
  'test@example.com',
  1, // ID du template Welcome Newsletter
  {
    FIRST_NAME: 'John',
    EMAIL: 'test@example.com',
    APP_URL: 'https://maximarket.com'
  }
);
```

### Test 3 : Créer un Contact

```javascript
import { brevoService } from './src/services/email/brevo.service.js';

await brevoService.createOrUpdateContact(
  'test@example.com',
  {
    FIRSTNAME: 'John',
    LASTNAME: 'Doe',
    SMS: '+221771234567'
  },
  [1] // Ajouter à la liste Newsletter Subscribers
);
```

## 📊 Étape 8 : Configurer les Automations

### Automation 1 : Bienvenue Nouveau Abonné

1. Allez dans **Automation** > **Créer un workflow**
2. Déclencheur : Contact ajouté à la liste "Newsletter Subscribers"
3. Action : Envoyer le template "Welcome Newsletter"
4. Délai : Immédiat
5. Activez le workflow

### Automation 2 : Réengagement Utilisateurs Inactifs

1. Déclencheur : Contact inactif depuis 30 jours
2. Action : Envoyer le template "Reengagement Email"
3. Délai : 30 jours après la dernière activité
4. Activez le workflow

### Automation 3 : Série de Bienvenue (3 emails)

1. Email 1 : Bienvenue (immédiat)
2. Email 2 : Découverte des fonctionnalités (J+3)
3. Email 3 : Conseils et astuces (J+7)

## 🔐 Étape 9 : Vérifier le Domaine d'Envoi

### Authentification SPF, DKIM, DMARC

1. Allez dans **Paramètres** > **Expéditeurs & IP**
2. Cliquez sur **Authentifier votre domaine**
3. Ajoutez les enregistrements DNS fournis par Brevo :

```
Type: TXT
Nom: @
Valeur: v=spf1 include:spf.brevo.com ~all

Type: TXT
Nom: mail._domainkey
Valeur: [fourni par Brevo]

Type: TXT
Nom: _dmarc
Valeur: v=DMARC1; p=none; rua=mailto:dmarc@maximarket.com
```

4. Attendez la propagation DNS (24-48h)
5. Vérifiez l'authentification dans Brevo

## 📈 Étape 10 : Monitoring et Analytics

### Dashboard Brevo

- **Statistiques en temps réel** : Taux d'ouverture, clics, bounces
- **Rapports de campagnes** : Performance de chaque campagne
- **Heatmaps** : Zones les plus cliquées
- **A/B Testing** : Tester différentes versions

### Intégration avec Google Analytics

1. Ajoutez les paramètres UTM à vos liens :
```
https://maximarket.com?utm_source=brevo&utm_medium=email&utm_campaign=newsletter
```

2. Suivez les conversions dans Google Analytics

## 🎓 Ressources Utiles

- [Documentation Brevo](https://developers.brevo.com/)
- [API Reference](https://developers.brevo.com/reference)
- [Templates Gallery](https://www.brevo.com/fr/email-templates/)
- [Best Practices](https://www.brevo.com/fr/blog/email-marketing-best-practices/)
- [Support Brevo](https://help.brevo.com/)

## ⚠️ Limites et Quotas

### Plan Gratuit
- 300 emails/jour
- Contacts illimités
- Logo Brevo dans les emails

### Plan Starter (25€/mois)
- 20,000 emails/mois
- Pas de logo Brevo
- Support prioritaire

### Plan Business (65€/mois)
- 100,000 emails/mois
- Automation avancée
- Multi-utilisateurs

## 🔧 Dépannage

### Problème : Emails non reçus
- ✅ Vérifiez la clé API
- ✅ Vérifiez le domaine d'envoi
- ✅ Vérifiez les quotas
- ✅ Consultez les logs Brevo

### Problème : Emails en spam
- ✅ Authentifiez votre domaine (SPF, DKIM)
- ✅ Évitez les mots spam
- ✅ Ajoutez un lien de désinscription
- ✅ Nettoyez votre liste de contacts

### Problème : Template non trouvé
- ✅ Vérifiez l'ID du template
- ✅ Vérifiez que le template est publié
- ✅ Vérifiez les variables du template

## ✅ Checklist de Mise en Production

- [ ] Compte Brevo créé et vérifié
- [ ] Clé API configurée dans .env
- [ ] Domaine d'envoi authentifié (SPF, DKIM, DMARC)
- [ ] Templates créés et testés
- [ ] Listes de contacts créées
- [ ] Contacts synchronisés
- [ ] Webhooks configurés
- [ ] Automations activées
- [ ] Tests d'envoi réussis
- [ ] Monitoring configuré
- [ ] Documentation à jour

## 🎉 Félicitations !

Votre intégration Brevo est maintenant complète. Vous pouvez commencer à envoyer des emails professionnels à vos utilisateurs !
