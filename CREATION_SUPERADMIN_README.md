# 🔐 Création du Compte Super Admin MaxiMarket

Ce guide explique comment créer le compte super administrateur principal pour MaxiMarket.

**Email**: `superadmin@maxiimarket.com`

---

## 📋 Méthodes de Création

Vous avez **3 méthodes** pour créer le compte super admin :

### 🎯 Méthode 1 : Script Node.js (Recommandé)

La méthode la plus simple et automatisée.

#### Prérequis
- Node.js installé
- Variables d'environnement configurées dans `.env.local`

#### Étapes

1. **Vérifier les variables d'environnement**

Assurez-vous que `.env.local` contient :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

> ⚠️ La `SUPABASE_SERVICE_ROLE_KEY` se trouve dans :
> Supabase Dashboard > Settings > API > service_role (secret)

2. **Exécuter le script**

```bash
node create-superadmin.js
```

3. **Résultat attendu**

```
🚀 Création du compte Super Admin MaxiMarket

ℹ Vérification si le compte existe déjà...
ℹ Création du compte d'authentification...
✓ Compte créé avec succès !
ℹ ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ℹ Création de l'entrée dans la table users...
✓ Entrée créée dans la table users

✅ Super Admin créé avec succès !

Informations de connexion :
  Email    : superadmin@maxiimarket.com
  Password : SuperAdmin2025!@MaxiMarket

⚠️  IMPORTANT : Changez le mot de passe après la première connexion !
```

---

### 🗄️ Méthode 2 : Script SQL

Création manuelle via l'éditeur SQL de Supabase.

#### Étapes

1. **Ouvrir Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet MaxiMarket

2. **Ouvrir l'éditeur SQL**
   - Menu latéral > SQL Editor
   - Cliquez sur "New Query"

3. **Exécuter le script**
   - Copiez le contenu de `insert-superadmin-maximarket.sql`
   - Collez dans l'éditeur
   - Cliquez sur "Run"

4. **Créer le compte d'authentification**
   - Allez dans Authentication > Users
   - Cliquez sur "Add User"
   - Remplissez :
     - Email: `superadmin@maxiimarket.com`
     - Password: `[Mot de passe fort]`
     - Auto Confirm User: ✓ (coché)
   - Cliquez sur "Create User"

---

### 🌐 Méthode 3 : Interface Supabase

Création 100% via l'interface graphique.

#### Étapes

1. **Créer le compte d'authentification**
   - Supabase Dashboard > Authentication > Users
   - Cliquez sur "Add User"
   - Email: `superadmin@maxiimarket.com`
   - Password: `[Mot de passe fort]`
   - Auto Confirm User: ✓
   - Cliquez sur "Create User"

2. **Mettre à jour le rôle**
   - Allez dans Table Editor > users
   - Trouvez l'utilisateur avec l'email `superadmin@maxiimarket.com`
   - Modifiez les champs :
     - `role` → `admin`
     - `is_verified` → `true`
     - `status` → `active`
   - Sauvegardez

---

## 🔑 Informations de Connexion

### Identifiants par défaut

```
Email    : superadmin@maxiimarket.com
Password : SuperAdmin2025!@MaxiMarket
```

> ⚠️ **SÉCURITÉ CRITIQUE** : Changez ce mot de passe immédiatement après la première connexion !

### Première connexion

1. Allez sur votre application : `https://votre-app.com/connexion`
2. Connectez-vous avec les identifiants ci-dessus
3. Vous serez automatiquement redirigé vers `/admin`
4. Changez le mot de passe dans Profil > Sécurité

---

## ✅ Vérification

### Vérifier que le compte est créé

Exécutez cette requête SQL dans Supabase :

```sql
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_verified,
    status,
    created_at
FROM users 
WHERE email = 'superadmin@maxiimarket.com';
```

### Résultat attendu

| id | email | first_name | last_name | role | is_verified | status |
|----|-------|------------|-----------|------|-------------|--------|
| uuid | superadmin@maxiimarket.com | Super | Admin | admin | true | active |

---

## 🔒 Recommandations de Sécurité

### Mot de passe fort

Le mot de passe doit contenir :
- ✅ Minimum 12 caractères
- ✅ Majuscules (A-Z)
- ✅ Minuscules (a-z)
- ✅ Chiffres (0-9)
- ✅ Caractères spéciaux (!@#$%^&*)

**Exemples de mots de passe forts** :
- `MaxiMarket2025!Admin@Secure`
- `SuperAdmin#2025$MaxiMarket`
- `Admin!MaxiMarket@2025#Secure`

### Bonnes pratiques

1. **Changez le mot de passe** après la première connexion
2. **Ne partagez jamais** les identifiants
3. **Utilisez un gestionnaire de mots de passe** (1Password, Bitwarden, etc.)
4. **Activez l'authentification à deux facteurs** si disponible
5. **Surveillez les connexions** dans le dashboard admin
6. **Créez des comptes séparés** pour chaque administrateur (ne partagez pas ce compte)

---

## 🛠️ Dépannage

### Erreur : "User already exists"

Le compte existe déjà. Utilisez la méthode de réinitialisation du mot de passe :
1. Allez sur `/mot-de-passe-oublie`
2. Entrez `superadmin@maxiimarket.com`
3. Suivez le lien dans l'email

### Erreur : "SUPABASE_SERVICE_ROLE_KEY not found"

1. Allez dans Supabase Dashboard > Settings > API
2. Copiez la clé `service_role` (secret)
3. Ajoutez-la dans `.env.local` :
   ```env
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   ```

### Le rôle n'est pas "admin"

Exécutez cette requête SQL :
```sql
UPDATE users 
SET role = 'admin', is_verified = true, status = 'active'
WHERE email = 'superadmin@maxiimarket.com';
```

### Impossible de se connecter

1. Vérifiez que l'email est confirmé dans Authentication > Users
2. Vérifiez que `is_verified = true` dans la table users
3. Vérifiez que `status = 'active'` dans la table users
4. Réinitialisez le mot de passe si nécessaire

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Supabase : Dashboard > Logs
2. Vérifiez la console du navigateur (F12)
3. Consultez la documentation Supabase Auth
4. Contactez l'équipe de développement

---

## 📝 Fichiers Associés

- `insert-superadmin-maximarket.sql` - Script SQL de création
- `create-superadmin.js` - Script Node.js automatisé
- `CREATION_SUPERADMIN_README.md` - Ce fichier (documentation)

---

**Date de création** : 29 novembre 2025  
**Version** : 1.0  
**Auteur** : Équipe MaxiMarket
