# 📧 Configuration SendGrid - Emails Benome

## 🚀 **ÉTAPES RAPIDES (15 minutes)**

### **1. Créer un compte SendGrid**
1. Allez sur [https://sendgrid.com](https://sendgrid.com)
2. Cliquez sur "Start for Free"
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email

### **2. Vérifier votre Domaine**
1. Dans le dashboard, allez à "Settings" → "Sender Authentication"
2. Cliquez sur "Authenticate Your Domain"
3. Suivez les instructions pour ajouter les enregistrements DNS
4. Attendez la vérification (peut prendre 24h)

### **3. Créer une API Key**
1. Allez à "Settings" → "API Keys"
2. Cliquez sur "Create API Key"
3. Nommez-la "Benome Newsletter"
4. Sélectionnez "Full Access" ou "Restricted Access" (Mail Send)
5. Copiez la clé générée

### **4. Configurer dans l'Application**
```bash
# Éditer le fichier .env
nano .env
```

Remplacez cette ligne :
```env
VITE_SENDGRID_API_KEY=votre_cle_api_sendgrid
```

### **5. Configurer l'Email d'Envoi**
```env
VITE_FROM_EMAIL=newsletter@votre-domaine.com
VITE_FROM_NAME=Benome Newsletter
```

---

## 💰 **COÛTS SENDGRID**

- **Gratuit** : 100 emails/jour
- **Payant** : À partir de $14.95/mois pour 50k emails
- **Pour Benome** : Probablement gratuit au début

---

## ✅ **VÉRIFICATION**

Après configuration, testez :
1. Inscription à la newsletter
2. Envoi d'email de confirmation
3. Vérifier les logs dans SendGrid

---

## 🔧 **SUPPORT**

- **Documentation** : [docs.sendgrid.com](https://docs.sendgrid.com)
- **Support** : Via le dashboard SendGrid
- **Chat** : Disponible dans le dashboard

---

## 📋 **FONCTIONNALITÉS ACTIVÉES**

- ✅ Newsletter automatique
- ✅ Emails de confirmation
- ✅ Notifications par email
- ✅ Rapports de livraison
