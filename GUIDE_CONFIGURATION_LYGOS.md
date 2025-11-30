# 🔧 Guide de Configuration Lygos

## 📋 Prérequis

1. Compte Lygos créé sur https://pay.lygosapp.com
2. Clé API obtenue depuis le dashboard
3. Accès au projet Supabase

---

## 🔑 Étape 1: Configuration des variables d'environnement

### Développement local (.env.local)

```bash
VITE_LYGOS_API_KEY=lygosapp-5798fac9-f420-4aea-9196-d9b4313d6ab6
```

### Production (Vercel)

```bash
vercel env add VITE_LYGOS_API_KEY
# Entrer: lygosapp-5798fac9-f420-4aea-9196-d9b4313d6ab6
```

---

## 🗄️ Étape 2: Configuration de la base de données

Les tables nécessaires sont déjà créées :
- `boost_packages` - Packages de boost disponibles
- `listing_boosts` - Historique des boosts
- `listings` - Annonces (avec champs is_boosted, boost_expires_at)

### Vérifier les packages de boost

```sql
SELECT * FROM boost_packages WHERE is_active = true;
```

Si aucun package n'existe, créer des packages par défaut :

```sql
INSERT INTO boost_packages (name, description, price, duration_days, features, is_active)
VALUES
  ('Standard', 'Boost standard pour 7 jours', 5000, 7, 
   '["Mise en avant pendant 7 jours", "Apparition en haut des résultats", "Badge Boost visible"]', 
   true),
  ('Premium', 'Boost premium pour 14 jours', 8000, 14, 
   '["Mise en avant pendant 14 jours", "Apparition en haut des résultats", "Badge Premium visible", "Statistiques détaillées"]', 
   true),
  ('Ultimate', 'Boost ultimate pour 30 jours', 15000, 30, 
   '["Mise en avant pendant 30 jours", "Apparition en haut des résultats", "Badge Ultimate visible", "Statistiques détaillées", "Support prioritaire"]', 
   true);
```

---

## 🔗 Étape 3: Configuration du webhook Lygos

### 1. Déployer le webhook

Le webhook est déjà créé dans `api/webhooks/lygos.js`

### 2. Configurer l'URL dans Lygos Dashboard

1. Aller sur https://pay.lygosapp.com/dashboard/configurations
2. Section "Webhooks"
3. Ajouter l'URL : `https://votre-domaine.com/api/webhooks/lygos`
4. Sélectionner les événements :
   - `payment.successful`
   - `payment.completed`
   - `payment.failed`
   - `payment.cancelled`
   - `refund.successful`

### 3. Tester le webhook

```bash
# Utiliser l'outil de test de Lygos dans le dashboard
# Ou envoyer une requête de test :

curl -X POST https://votre-domaine.com/api/webhooks/lygos \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.successful",
    "data": {
      "reference": "LYG-TEST-123",
      "amount": 5000,
      "currency": "XOF",
      "status": "successful",
      "metadata": {
        "boostId": "test-boost-id",
        "listingId": "test-listing-id",
        "userId": "test-user-id"
      }
    }
  }'
```

---

## 🧪 Étape 4: Tests

### Test 1: Vérifier la configuration

```bash
node test-lygos-integration.js
```

### Test 2: Test de paiement complet

1. Se connecter à l'application
2. Créer une annonce
3. Aller sur `/boost`
4. Sélectionner l'annonce
5. Choisir un package
6. Effectuer un paiement de test

### Test 3: Vérifier dans le dashboard admin

1. Aller sur `/admin/payments`
2. Vérifier que le paiement apparaît
3. Vérifier le statut
4. Tester un remboursement si nécessaire

---

## 🔒 Étape 5: Sécurité

### 1. Vérifier les permissions Supabase

```sql
-- RLS pour listing_boosts
ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boosts"
  ON listing_boosts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boosts"
  ON listing_boosts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS pour boost_packages (lecture publique)
ALTER TABLE boost_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
  ON boost_packages FOR SELECT
  USING (is_active = true);
```

### 2. Protéger la clé API

- ✅ Ne jamais commiter la clé API dans Git
- ✅ Utiliser des variables d'environnement
- ✅ Restreindre l'accès au dashboard Lygos
- ✅ Activer l'authentification 2FA sur Lygos

---

## 📊 Étape 6: Monitoring

### Logs à surveiller

1. **Logs Vercel** : Vérifier les webhooks reçus
2. **Dashboard Lygos** : Suivre les transactions
3. **Supabase** : Vérifier les boosts activés

### Métriques importantes

- Taux de conversion (paiements réussis / initiés)
- Temps moyen de paiement
- Taux d'échec
- Montant total des transactions

---

## 🚨 Dépannage

### Problème : Paiement non activé après succès

1. Vérifier les logs du webhook
2. Vérifier que le boostId est dans les métadonnées
3. Vérifier les permissions Supabase
4. Relancer manuellement l'activation :

```javascript
import { boostService } from './src/services/boost.service.js';
await boostService.activateBoost('boost-id-here');
```

### Problème : Webhook non reçu

1. Vérifier l'URL du webhook dans Lygos
2. Vérifier que l'endpoint est accessible publiquement
3. Vérifier les logs Vercel
4. Tester avec curl

### Problème : Clé API invalide

1. Vérifier que la clé est correcte
2. Vérifier qu'elle est bien dans .env.local
3. Redémarrer le serveur de développement
4. Vérifier les variables d'environnement Vercel

---

## 📞 Support

- **Documentation Lygos** : https://docs.lygosapp.com
- **Support Lygos** : support@lygosapp.com
- **Dashboard** : https://pay.lygosapp.com/dashboard

---

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Packages de boost créés dans Supabase
- [ ] Webhook configuré dans Lygos
- [ ] Tests de paiement effectués
- [ ] Permissions RLS vérifiées
- [ ] Monitoring en place
- [ ] Documentation à jour

---

**🎉 Votre intégration Lygos est maintenant complète !**
