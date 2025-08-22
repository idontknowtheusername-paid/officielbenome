# 📧 Système de Newsletter - MaxiMarket

## 🎯 Vue d'ensemble

Le système de newsletter de MaxiMarket permet aux utilisateurs de s'inscrire pour recevoir des mises à jour, des offres spéciales et des nouveautés de la plateforme.

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Inscription à la newsletter** via le footer (desktop et mobile)
- **Validation d'email** avec regex
- **Gestion des doublons** (évite les inscriptions multiples)
- **Réactivation d'inscription** (si désinscrit précédemment)
- **Feedback utilisateur** avec toasts de confirmation/erreur
- **État de chargement** avec spinner
- **Base de données** avec table `newsletter_subscribers`
- **Sécurité** avec RLS (Row Level Security)

### 🔄 En cours / À venir
- **Envoi d'emails** via service externe (SendGrid, Mailgun, etc.)
- **Templates d'emails** personnalisés
- **Campagnes marketing** automatisées
- **Statistiques avancées** (taux d'ouverture, clics, etc.)
- **Segmentation** des abonnés
- **Désinscription** en un clic

## 🗄️ Structure de la base de données

### Table `newsletter_subscribers`
```sql
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'footer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Champs
- `id` : Identifiant unique
- `email` : Adresse email (unique, en minuscules)
- `is_active` : Statut d'inscription (true/false)
- `subscribed_at` : Date d'inscription
- `unsubscribed_at` : Date de désinscription
- `source` : Source d'inscription (footer, popup, landing, etc.)
- `created_at` : Date de création
- `updated_at` : Date de dernière modification

## 🔧 Configuration

### 1. Base de données
Exécutez le script SQL :
```bash
# Dans votre dashboard Supabase
# Copiez et exécutez le contenu de supabase-newsletter-setup.sql
```

### 2. Variables d'environnement
```env
# Service d'envoi d'emails (à configurer)
SENDGRID_API_KEY=votre_cle_sendgrid
MAILGUN_API_KEY=votre_cle_mailgun

# Configuration email
NEWSLETTER_FROM_EMAIL=newsletter@maximarket.com
NEWSLETTER_FROM_NAME=MaxiMarket Newsletter
```

## 📱 Utilisation

### Dans le Footer
```jsx
import { newsletterService } from '@/services/newsletter.service';

const handleNewsletterSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const result = await newsletterService.subscribe(email);
    // Afficher toast de succès
  } catch (error) {
    // Afficher toast d'erreur
  }
};
```

### Service API
```javascript
// S'inscrire
const result = await newsletterService.subscribe('user@example.com');

// Vérifier le statut
const status = await newsletterService.checkStatus('user@example.com');

// Se désinscrire
await newsletterService.unsubscribe('user@example.com');

// Statistiques (admin)
const stats = await newsletterService.getStats();
```

## 🎨 Interface utilisateur

### Desktop
- Formulaire dans le footer avec champ email et bouton d'envoi
- Validation en temps réel
- Feedback visuel avec spinner de chargement

### Mobile
- Formulaire compact centré
- Même fonctionnalités que desktop
- Optimisé pour le tactile

## 🔒 Sécurité

### RLS (Row Level Security)
- **Lecture publique** : Pour vérifier les inscriptions
- **Insertion publique** : Pour les nouvelles inscriptions
- **Mise à jour publique** : Pour les désinscriptions

### Validation
- **Email** : Format valide avec regex
- **Doublons** : Vérification avant insertion
- **Sanitisation** : Email en minuscules

## 📊 Statistiques

### Fonction `get_newsletter_stats()`
Retourne :
- `total_subscribers` : Nombre total d'abonnés
- `active_subscribers` : Abonnés actifs
- `inactive_subscribers` : Abonnés désinscrits
- `this_month_subscribers` : Nouveaux ce mois
- `this_week_subscribers` : Nouveaux cette semaine

## 🚀 Prochaines étapes

### Phase 1 : Envoi d'emails
1. Intégrer un service d'envoi (SendGrid, Mailgun)
2. Créer des templates d'emails
3. Système de queue pour les envois en masse

### Phase 2 : Marketing automation
1. Emails de bienvenue
2. Campagnes saisonnières
3. Emails de réactivation

### Phase 3 : Analytics avancés
1. Taux d'ouverture
2. Taux de clic
3. Segmentation des abonnés

## 🐛 Dépannage

### Problèmes courants
1. **Email déjà inscrit** : Géré automatiquement
2. **Email invalide** : Validation côté client et serveur
3. **Erreur de base de données** : Logs dans la console

### Logs de debug
```javascript
// Dans le footer, les réseaux sociaux sont loggés
console.log("🔍 Réseaux sociaux disponibles:", personalData.socials);
console.log("🔍 Réseaux sociaux filtrés:", socialLinks);
```

## 📝 Notes techniques

- **Performance** : Index sur email et is_active
- **Scalabilité** : Prêt pour des milliers d'abonnés
- **Maintenance** : Triggers automatiques pour updated_at
- **Compatibilité** : Fonctionne avec l'architecture existante
