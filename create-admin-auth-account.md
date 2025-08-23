# GUIDE : Création du compte d'authentification admin

## Étape 1 : Accéder à l'interface Supabase Auth

1. **Connectez-vous à votre projet Supabase**
2. **Allez dans le menu de gauche** → **Authentication**
3. **Cliquez sur "Users"** dans le sous-menu

## Étape 2 : Créer le compte admin

1. **Cliquez sur le bouton "Add User"** (généralement en haut à droite)
2. **Remplissez les informations :**
   - **Email :** `adminmaximarket@gmail.com`
   - **Password :** `AdminMaxiMarket2024!` (ou un mot de passe sécurisé de votre choix)
   - **Email confirm :** Cochez la case pour confirmer l'email automatiquement

3. **Cliquez sur "Create User"**

## Étape 3 : Vérifier la création

1. **Le compte devrait apparaître** dans la liste des utilisateurs
2. **Le statut devrait être "Confirmed"**
3. **L'email devrait être "Confirmed"**

## Étape 4 : Se connecter à l'application

1. **Allez sur votre application** (votre site web)
2. **Cliquez sur "Se connecter" ou "Login"**
3. **Entrez les identifiants :**
   - **Email :** `adminmaximarket@gmail.com`
   - **Mot de passe :** `AdminMaxiMarket2024!` (ou celui que vous avez choisi)

## Étape 5 : Accéder au dashboard admin

Une fois connecté, vous devriez avoir accès au dashboard administrateur avec tous les privilèges admin.

---

## Alternative : Créer le compte via l'API

Si vous préférez créer le compte programmatiquement, voici un script Node.js :

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'VOTRE_URL_SUPABASE'
const supabaseServiceKey = 'VOTRE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'adminmaximarket@gmail.com',
    password: 'AdminMaxiMarket2024!',
    email_confirm: true,
    user_metadata: {
      first_name: 'Admin',
      last_name: 'MaxiMarket'
    }
  })

  if (error) {
    console.error('Erreur:', error)
  } else {
    console.log('Compte admin créé:', data.user)
  }
}

createAdminUser()
```

---

## Notes importantes :

- **Sécurité :** Changez le mot de passe après la première connexion
- **Récupération :** Configurez la récupération de mot de passe si nécessaire
- **Permissions :** Le compte aura automatiquement les permissions admin grâce au rôle dans la table `users`
