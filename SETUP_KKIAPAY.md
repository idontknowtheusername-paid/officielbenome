# 💳 Configuration Kkiapay - Paiements Benome

## 🚀 **ÉTAPES RAPIDES (10 minutes)**

### **1. Créer un compte Kkiapay**
1. Allez sur [https://kkiapay.me](https://kkiapay.me)
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire avec vos informations
4. Vérifiez votre email

### **2. Accéder au Dashboard**
1. Connectez-vous à votre compte
2. Allez dans "Dashboard" → "API Keys"
3. Vous verrez vos clés publiques et secrètes

### **3. Configurer dans l'Application**
```bash
# Éditer le fichier .env
nano .env
```

Remplacez ces lignes :
```env
VITE_KKIAPAY_PUBLIC_KEY=votre_cle_publique_kkiapay
VITE_KKIAPAY_SECRET_KEY=votre_cle_secrete_kkiapay
```

### **4. Configurer les URLs de Callback**
Dans votre dashboard Kkiapay :
- **Success URL** : `https://votre-domaine.com/payment-success`
- **Failure URL** : `https://votre-domaine.com/payment-failure`
- **Webhook URL** : `https://votre-domaine.com/api/payment-webhook`

### **5. Tester avec un Petit Montant**
1. Créez une annonce test
2. Essayez d'acheter un boost
3. Utilisez le mode test de Kkiapay

---

## 💰 **COÛTS KKIAPAY**

- **Commission** : 2.5% par transaction
- **Frais de retrait** : Variables selon la méthode
- **Pas de frais mensuels**

---

## ✅ **VÉRIFICATION**

Après configuration, testez :
1. Créer une annonce
2. Acheter un boost
3. Vérifier que le paiement fonctionne

---

## 🔧 **SUPPORT**

- **Documentation** : [docs.kkiapay.me](https://docs.kkiapay.me)
- **Support** : support@kkiapay.me
- **WhatsApp** : +225 27 22 49 95 95
