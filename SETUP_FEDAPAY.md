# 🏦 Configuration FedaPay - MaxiMarket

## 📋 Vue d'ensemble

FedaPay est un fournisseur de paiement spécialisé pour le Bénin, supportant :
- 🟠 Orange Money
- 🟡 MTN Mobile Money  
- 🔵 Moov Money
- 💳 Cartes bancaires (Visa/Mastercard)

## 🚀 Configuration

### 1. Créer un compte FedaPay

1. Allez sur [FedaPay](https://fedapay.com)
2. Créez un compte développeur
3. Complétez la vérification d'identité
4. Activez votre compte

### 2. Obtenir les clés API

Dans votre dashboard FedaPay :
- **Clé Publique** : Pour l'intégration frontend
- **Clé Secrète** : Pour les appels API backend
- **Mode Test** : Pour les tests sans frais

### 3. Configurer les variables d'environnement

Dans Vercel Dashboard → Settings → Environment Variables :

```bash
VITE_FEDAPAY_PUBLIC_KEY=pk_test_votre_cle_publique
VITE_FEDAPAY_SECRET_KEY=sk_test_votre_cle_secrete
VITE_FEDAPAY_TEST_MODE=true
```

### 4. Configurer les URLs de callback

Dans votre dashboard FedaPay :
- **Success URL** : `https://maxiimarket.com/payment-callback?status=success`
- **Cancel URL** : `https://maxiimarket.com/payment-callback?status=cancelled`
- **Webhook URL** : `https://maxiimarket.com/api/webhooks/fedapay`

## 🧪 Test de l'intégration

### URL de test
```
https://maxiimarket.com/fedapay-test
```

### Données de test recommandées
- **Montant** : 1000 FCFA
- **Email** : test@maxiimarket.com
- **Téléphone** : +229 90 12 34 56
- **Nom** : Test Utilisateur

## 💰 Frais de transaction

- **Pourcentage** : 2.5%
- **Frais fixes** : 50 FCFA
- **Devise** : XOF (FCFA)

### Exemple de calcul
- Montant : 1000 FCFA
- Frais : (1000 × 2.5%) + 50 = 75 FCFA
- **Total** : 1075 FCFA

## 🔧 Intégration technique

### Service FedaPay
```javascript
// src/services/fedapay.service.js
import { fedapayService } from '@/services/fedapay.service';

// Initialiser un paiement
const result = await fedapayService.initializePayment({
  amount: 1000,
  currency: 'XOF',
  description: 'Test FedaPay',
  email: 'user@example.com',
  phone: '+229 90 12 34 56',
  name: 'Nom Utilisateur',
  payment_method: 'orange_money'
});
```

### Méthodes disponibles
```javascript
// Obtenir les méthodes de paiement
const methods = fedapayService.getPaymentMethods();

// Calculer les frais
const fees = fedapayService.calculateFees(1000);

// Vérifier un paiement
const status = await fedapayService.verifyPayment(transactionId);
```

## 🛠️ Dépannage

### Erreurs courantes

1. **"Clé API incorrecte"**
   - Vérifiez les variables d'environnement dans Vercel
   - Assurez-vous d'utiliser les bonnes clés (test/production)

2. **"Numéro de téléphone invalide"**
   - Format requis : +229 XX XX XX XX
   - Utilisez le formatateur : `fedapayService.formatPhoneNumber(phone)`

3. **"Montant invalide"**
   - Minimum : 100 FCFA
   - Maximum : 500,000 FCFA (mobile money) / 1,000,000 FCFA (carte)

### Support FedaPay
- **Email** : support@fedapay.com
- **Téléphone** : +229 XX XX XX XX
- **Documentation** : https://docs.fedapay.com

## 🔄 Migration depuis KkiaPay

### Changements effectués
1. ✅ Supprimé tous les composants KkiaPay
2. ✅ Créé le service FedaPay
3. ✅ Mis à jour le service de paiement principal
4. ✅ Créé la page de test FedaPay
5. ✅ Ajouté la route `/fedapay-test`

### Prochaines étapes
1. 🔄 Créer un compte FedaPay
2. 🔄 Obtenir les clés API
3. 🔄 Configurer les variables d'environnement
4. 🔄 Tester l'intégration
5. 🔄 Passer en mode production

## 📞 Contact

Pour toute question sur l'intégration FedaPay :
- **Email** : admin@maxiimarket.com
- **Support** : support@maxiimarket.com
