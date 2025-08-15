# 🔔 Configuration des Notifications Push - MaxiMarket

Ce guide explique comment configurer les notifications push pour MaxiMarket en utilisant Supabase et le protocole VAPID.

## 📋 Prérequis

- Compte Supabase configuré
- Projet React avec Vite
- Service Worker configuré
- Variables d'environnement configurées

## 🚀 Configuration VAPID

### 1. Générer les clés VAPID

Utilisez l'outil en ligne ou la commande Node.js :

```bash
# Installer web-push
npm install -g web-push

# Générer les clés VAPID
web-push generate-vapid-keys
```

Vous obtiendrez :
- **Public Key** : Clé publique à utiliser côté client
- **Private Key** : Clé privée à utiliser côté serveur

### 2. Configurer les variables d'environnement

Créez ou modifiez votre fichier `.env` :

```env
# Clés VAPID
VITE_VAPID_PUBLIC_KEY=votre_cle_publique_vapid
SUPABASE_VAPID_PRIVATE_KEY=votre_cle_privee_vapid

# Supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

## 🔧 Configuration Supabase

### 1. Créer la table des subscriptions

Exécutez ce SQL dans votre dashboard Supabase :

```sql
-- Table pour stocker les subscriptions push
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Index pour améliorer les performances
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active);

-- RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique : utilisateurs peuvent voir/modifier leurs propres subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Créer la fonction Edge Function pour envoyer les notifications

Créez un dossier `supabase/functions/send-push-notification` :

```typescript
// supabase/functions/send-push-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webPush from 'https://esm.sh/web-push@3.6.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, body, icon, badge, tag, data, actions, userIds } = await req.json()

    // Vérifier les paramètres requis
    if (!title || !userIds || !Array.isArray(userIds)) {
      throw new Error('Paramètres manquants ou invalides')
    }

    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Configurer VAPID
    const vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('SUPABASE_VAPID_PRIVATE_KEY')!

    webPush.setVapidDetails(
      'mailto:contact@maximarket.com',
      vapidPublicKey,
      vapidPrivateKey
    )

    // Récupérer les subscriptions des utilisateurs
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', userIds)
      .eq('is_active', true)

    if (error) throw error

    // Envoyer les notifications
    const results = await Promise.allSettled(
      subscriptions.map(async ({ subscription }) => {
        try {
          const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/favicon.ico',
            badge: badge || '/favicon.ico',
            tag: tag || 'maximarket-notification',
            data: data || {},
            actions: actions || [
              {
                action: 'view',
                title: 'Voir',
                icon: '/favicon.ico'
              },
              {
                action: 'close',
                title: 'Fermer',
                icon: '/favicon.ico'
              }
            ]
          })

          await webPush.sendNotification(subscription, payload)
          return { success: true, subscription }
        } catch (error) {
          console.error('Erreur envoi notification:', error)
          return { success: false, subscription, error: error.message }
        }
      })
    )

    // Analyser les résultats
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications envoyées: ${successful} réussies, ${failed} échouées`,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erreur fonction Edge:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 3. Déployer la fonction Edge

```bash
# Dans le dossier de votre projet Supabase
supabase functions deploy send-push-notification
```

## 🎯 Utilisation dans l'Application

### 1. Envoyer une notification depuis le code

```javascript
// Exemple d'envoi de notification
const sendPushNotification = async (userIds, notificationData) => {
  try {
    const response = await fetch('/functions/v1/send-push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        title: 'Nouveau message',
        body: 'Vous avez reçu un nouveau message',
        icon: '/favicon.ico',
        data: {
          url: '/messaging',
          conversationId: '123'
        },
        userIds: userIds
      })
    })

    const result = await response.json()
    console.log('Notification envoyée:', result)
    
  } catch (error) {
    console.error('Erreur envoi notification:', error)
  }
}
```

### 2. Déclencher automatiquement les notifications

Configurez des triggers dans Supabase pour envoyer automatiquement des notifications :

```sql
-- Fonction pour envoyer une notification push automatiquement
CREATE OR REPLACE FUNCTION send_push_notification_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Ici vous pouvez appeler votre fonction Edge Function
  -- ou envoyer une notification via webhook
  
  -- Exemple avec http_request (extension pg_net)
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-push-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}',
    body := json_build_object(
      'title', 'Nouveau message',
      'body', 'Vous avez reçu un nouveau message',
      'userIds', ARRAY[NEW.receiver_id]
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les nouveaux messages
CREATE TRIGGER trigger_send_push_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION send_push_notification_trigger();
```

## 🔍 Test et Débogage

### 1. Tester les permissions

```javascript
// Vérifier le support
if ('Notification' in window) {
  console.log('Notifications supportées')
  console.log('Permission:', Notification.permission)
} else {
  console.log('Notifications non supportées')
}
```

### 2. Tester le Service Worker

```javascript
// Vérifier l'enregistrement
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers enregistrés:', registrations)
  })
}
```

### 3. Tester les notifications push

```javascript
// Notification de test
const testNotification = () => {
  if (Notification.permission === 'granted') {
    new Notification('Test MaxiMarket', {
      body: 'Ceci est une notification de test !',
      icon: '/favicon.ico'
    })
  }
}
```

## 🚨 Dépannage

### Problèmes courants

1. **Service Worker non enregistré**
   - Vérifiez que le fichier `/sw.js` existe
   - Vérifiez les erreurs dans la console

2. **Permissions refusées**
   - Guidez l'utilisateur vers les paramètres du navigateur
   - Proposez de réessayer plus tard

3. **Notifications non reçues**
   - Vérifiez la configuration VAPID
   - Vérifiez les logs de la fonction Edge
   - Testez avec une notification simple

4. **Erreurs CORS**
   - Vérifiez les headers CORS dans la fonction Edge
   - Vérifiez la configuration Supabase

### Logs utiles

```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'maximarket:*')

// Dans le Service Worker
self.addEventListener('push', (event) => {
  console.log('Push reçu:', event)
  console.log('Données:', event.data?.json())
})
```

## 📱 Support Mobile

### iOS (Safari)
- Support limité des notifications push
- Utilisez les notifications web standard

### Android (Chrome)
- Support complet des notifications push
- Peut installer l'app comme PWA

### PWA
- Ajoutez le manifest.json approprié
- Configurez l'installation sur l'écran d'accueil

## 🔒 Sécurité

### Bonnes pratiques

1. **Vérification des permissions** : Demandez toujours l'autorisation
2. **Validation des données** : Validez toutes les entrées
3. **Rate limiting** : Limitez le nombre de notifications par utilisateur
4. **Authentification** : Vérifiez l'identité de l'utilisateur
5. **Chiffrement** : Utilisez HTTPS partout

### Variables sensibles

- Ne jamais exposer la clé privée VAPID côté client
- Utilisez les variables d'environnement Supabase
- Limitez l'accès aux fonctions Edge

## 📊 Analytics et Monitoring

### Métriques à suivre

- Taux de permission accordée
- Taux de livraison des notifications
- Taux de clic sur les notifications
- Taux d'engagement

### Outils recommandés

- Supabase Analytics
- Google Analytics
- Sentry pour le monitoring des erreurs

---

## 🎉 Félicitations !

Vos notifications push sont maintenant configurées ! Les utilisateurs recevront des notifications en temps réel pour :

- ✉️ Nouveaux messages
- 🏠 Réponses à leurs annonces
- 🔔 Mises à jour importantes
- 🎁 Offres spéciales

N'oubliez pas de tester sur différents navigateurs et appareils ! 