# Benome Marketplace - Frontend

Benome est une plateforme marketplace moderne et innovante conçue pour l'Afrique de l'Ouest, facilitant l'achat et la vente de biens immobiliers, véhicules, services professionnels et divers autres produits.

## 🚀 Fonctionnalités

### Frontend Complet
- **Interface utilisateur moderne** avec React 18 et TailwindCSS
- **Animations fluides** avec Framer Motion
- **Composants UI réutilisables** basés sur shadcn/ui et Radix UI
- **Design responsive** optimisé pour mobile et desktop
- **Thème sombre/clair** avec support complet
- **Authentification complète** (inscription, connexion, profil, récupération de mot de passe)
- **Marketplace multi-catégories** (immobilier, automobile, services, général)
- **Système de blog** intégré (gestion via localStorage pour le prototypage)
- **Pages administratives** pour la gestion du contenu (via localStorage pour le prototypage)
- **Pages statiques** (À propos, FAQ, Politique de confidentialité, etc.)

### Architecture Frontend
- **React Router** pour la navigation
- **Context API** pour la gestion d'état globale (ex: authentification)
- **Hooks personnalisés** pour la logique métier
- **Services API** structurés et modulaires (`src/lib/api.js`)
- **Gestion d'erreurs** robuste avec notifications toast
- **Validation de formulaires** avec React Hook Form et Zod
- **Optimisations de performance** (lazy loading implicite avec Vite, memoization si applicable)

## 📦 Installation et Configuration

### Prérequis
- Node.js 20.x ou supérieur
- npm (ou yarn)

### Installation
1.  **Clonez le repository** (si ce n'est pas déjà fait) :
    ```bash
    git clone [URL_DU_REPOSITORY_GIT_ICI]
    cd benome-marketplace-frontend 
    ```
    (Remplacez `[URL_DU_REPOSITORY_GIT_ICI]` par l'URL réelle de votre dépôt Git.)

2.  **Installez les dépendances** :
    ```bash
    npm install
    ```

3.  **Configurez les variables d'environnement** :
    Créez un fichier `.env` à la racine du projet et ajoutez-y les variables nécessaires. Voir la section "Variables d'Environnement" ci-dessous.

4.  **Démarrez le serveur de développement** :
    ```bash
    npm run dev
    ```
    L'application sera accessible à l'adresse indiquée (généralement `http://localhost:5173`).

### Variables d'Environnement (`.env`)
Le frontend utilise des variables d'environnement pour configurer son comportement, notamment l'URL de l'API backend.

**Créez un fichier `.env` à la racine du projet avec le contenu suivant :**

```env
# === Configuration de l'API Backend ===
# URL de base de votre API backend. 
# Le frontend ajoutera les endpoints spécifiques à cette URL.
# Exemple : VITE_API_BASE_URL=http://localhost:3001/api
# Pour la production : VITE_API_BASE_URL=https://benome4ubackend.onrender.com/api
VITE_API_BASE_URL=https://benome4ubackend.onrender.com/api

# === Clés pour Services Externes (Optionnel) ===
# Clé publique Stripe pour l'intégration des paiements (Mode Test).
# Remplacez par votre clé réelle lorsque vous êtes prêt.
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_STRIPE

# === Configuration Générale de l'Application ===
# Nom de l'application (utilisé pour l'affichage si nécessaire)
VITE_APP_NAME=Benome

# Version de l'application
VITE_APP_VERSION=1.0.0
```

**Important :**
*   Les variables commençant par `VITE_` sont automatiquement exposées au code frontend par Vite.
*   **Ne committez jamais de clés secrètes ou d'identifiants sensibles directement dans votre code ou dans des fichiers `.env` versionnés.** Pour la production, utilisez les systèmes de gestion des secrets de votre plateforme d'hébergement.
*   Le fichier `.env` est généralement listé dans `.gitignore` pour éviter de le versionner. Chaque développeur ou environnement de déploiement aura son propre fichier `.env` (ou configuration équivalente).

## 🔧 Intégration Backend : Guide pour le Développeur Backend

Cette section détaille tout ce dont un développeur backend a besoin pour connecter efficacement le frontend Benome à un service backend.

### A. Configuration de l'URL de l'API Backend

Le frontend s'attend à trouver l'URL de base de l'API backend dans une variable d'environnement : `VITE_API_BASE_URL`.

1.  **En Développement Local :**
    *   Le développeur backend fournira l'URL locale de son API (ex: `http://localhost:3001/api`).
    *   Le développeur frontend mettra cette URL dans son fichier `.env` local : `VITE_API_BASE_URL=http://localhost:3001/api`.

2.  **En Production :**
    *   L'URL de l'API de production (ex: `https://benome4ubackend.onrender.com/api`) sera configurée comme variable d'environnement sur la plateforme d'hébergement du frontend.

Le fichier `src/lib/api.js` utilise cette variable pour construire toutes les requêtes.

### B. Structure des Endpoints API Requis

Le frontend est conçu pour interagir avec les endpoints suivants. Assurez-vous que votre backend implémente ces routes avec les méthodes HTTP spécifiées.

#### Authentification (`/auth`)
*   `POST /auth/register` : Inscription d'un nouvel utilisateur.
    *   **Corps Attendu (Frontend -> Backend)** : `{ name: "String", email: "String", phone: "String", password: "String" }`
    *   **Réponse Attendue (Backend -> Frontend)** : `{ success: true, token: "JWT_TOKEN_STRING", user: { id: "String", name: "String", email: "String", phone: "String", role: "user|admin" } }`
*   `POST /auth/login` : Connexion d'un utilisateur existant.
    *   **Corps Attendu** : `{ email: "String", password: "String" }`
    *   **Réponse Attendue** : (Identique à `/register`)
*   `POST /auth/logout` : Déconnexion (invalide le token côté serveur si nécessaire).
    *   **Réponse Attendue** : `{ success: true, message: "Déconnecté avec succès" }`
*   `GET /auth/profile` : Récupérer le profil de l'utilisateur authentifié (via token JWT).
    *   **Réponse Attendue** : `{ success: true, user: { id: "String", name: "String", ... } }`
*   `PUT /auth/profile` : Mettre à jour le profil de l'utilisateur authentifié.
    *   **Corps Attendu** : `{ name?: "String", email?: "String", phone?: "String", avatarUrl?: "String" }` (Champs optionnels)
    *   **Réponse Attendue** : `{ success: true, user: { ... } }` (Utilisateur mis à jour)
*   `POST /auth/forgot-password` : Demande de réinitialisation de mot de passe.
    *   **Corps Attendu** : `{ email: "String" }`
    *   **Réponse Attendue** : `{ success: true, message: "Email de réinitialisation envoyé" }`
*   `POST /auth/reset-password` : Réinitialiser le mot de passe avec un token.
    *   **Corps Attendu** : `{ token: "RESET_TOKEN_STRING", newPassword: "String" }`
    *   **Réponse Attendue** : `{ success: true, message: "Mot de passe réinitialisé" }`

#### Annonces Immobilières (`/real-estate/listings`)
*   `GET /real-estate/listings` : Liste des annonces (avec filtres/pagination en query params, ex: `?page=1&limit=10&city=Dakar`).
*   `GET /real-estate/listings/:id` : Détail d'une annonce.
*   `POST /real-estate/listings` : Créer une annonce (nécessite authentification).
*   `PUT /real-estate/listings/:id` : Modifier une annonce (nécessite authentification, propriétaire).
*   `DELETE /real-estate/listings/:id` : Supprimer une annonce (nécessite authentification, propriétaire).

#### Annonces Automobiles (`/auto/listings`)
*   Structure similaire à `/real-estate/listings`.

#### Services (`/services`)
*   Structure similaire à `/real-estate/listings`.

#### Marketplace Générale (`/marketplace/listings`)
*   Structure similaire à `/real-estate/listings`.

#### Blog (`/blog/posts`)
*   `GET /blog/posts` : Liste des articles de blog.
*   `GET /blog/posts/:idOrSlug` : Détail d'un article.
*   `POST /blog/posts` : Créer un article (admin).
*   `PUT /blog/posts/:id` : Modifier un article (admin).
*   `DELETE /blog/posts/:id` : Supprimer un article (admin).
    *   *Note : Actuellement, la gestion du blog est gérée via `localStorage` pour le prototypage. Pour une version de production, ces endpoints API devront être implémentés.*

#### Autres Endpoints
*   `POST /contact` : Envoyer un message de contact depuis le formulaire de contact.
    *   **Corps Attendu** : `{ name: "String", email: "String", subject: "String", message: "String" }`
*   `GET /favorites` : Liste des favoris de l'utilisateur (authentifié).
*   `POST /favorites` : Ajouter un item aux favoris.
    *   **Corps Attendu** : `{ itemId: "String", itemType: "real-estate|auto|service|product" }`
*   `DELETE /favorites/:itemId` : Retirer un item des favoris.
*   `GET /notifications` : Notifications de l'utilisateur (authentifié).
*   `PUT /notifications/:notificationId/read` : Marquer une notification comme lue.
*   `GET /search?q=query&filter1=value` : Recherche globale.

### C. Format des Données Attendu (Réponses API)

Le frontend s'attend généralement à des réponses JSON.

#### Réponse Standard pour les Succès :
```json
{
  "success": true,
  "data": { /* Données spécifiques à la requête */ }, 
  "message": "Opération réussie.", // Optionnel
  "pagination": { // Pour les listes paginées
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10 
  }
}
```
*   Pour les requêtes `GET` retournant un seul objet, `data` sera cet objet.
*   Pour les requêtes `GET` retournant une liste, `data` sera un tableau d'objets.
*   Pour `POST`, `PUT`, `DELETE`, `data` peut contenir l'entité créée/mise à jour ou être omis si `message` suffit.

#### Réponse Standard pour les Erreurs :
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING", // Ex: "VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND"
    "message": "Description lisible de l'erreur.",
    "details": { /* Détails spécifiques à l'erreur, ex: champs invalides pour VALIDATION_ERROR */
      "field_name": "Message d'erreur pour ce champ." 
    } 
  }
}
```
*   Le frontend utilisera `error.message` pour afficher des notifications à l'utilisateur.
*   Les codes HTTP d'erreur (400, 401, 403, 404, 500, etc.) doivent être utilisés de manière appropriée.

### D. Authentification JWT (JSON Web Tokens)

1.  **Connexion (`/auth/login`) / Inscription (`/auth/register`)** :
    *   Le backend doit retourner un token JWT dans la réponse si l'authentification réussit.
    *   Réponse attendue : `{ success: true, token: "VOTRE_JWT_ICI", user: { ... } }`
2.  **Stockage du Token** :
    *   Le frontend stocke ce token dans `localStorage`.
3.  **Requêtes Authentifiées** :
    *   Pour chaque requête vers un endpoint protégé, le frontend inclura automatiquement le token dans le header `Authorization` :
        `Authorization: Bearer VOTRE_JWT_ICI`
4.  **Validation du Token** :
    *   Le backend doit valider ce token pour chaque requête protégée.
    *   Si le token est invalide ou expiré, le backend doit répondre avec un statut `401 Unauthorized`. Le frontend redirigera alors l'utilisateur vers la page de connexion.

### E. Modèles de Données Suggérés (Exemples)

Ces modèles illustrent les types de données que le frontend pourrait envoyer ou s'attendre à recevoir. Adaptez-les à la structure exacte de votre base de données.

#### Utilisateur (`user`)
```json
{
  "id": "string (UUID ou ID de base de données)",
  "name": "string",
  "email": "string (unique)",
  "phone": "string (optionnel, format international E.164 suggéré)",
  "avatarUrl": "string (URL vers l'image d'avatar, optionnel)",
  "role": "string ('user' ou 'admin')",
  "isVerified": "boolean (pour la vérification d'email/téléphone)",
  "emailVerifiedAt": "datetime (ISO 8601, optionnel)",
  "phoneVerifiedAt": "datetime (ISO 8601, optionnel)",
  "createdAt": "datetime (ISO 8601)",
  "updatedAt": "datetime (ISO 8601)"
}
```

#### Annonce Immobilière (`realEstateListing`)
```json
{
  "id": "string",
  "title": "string",
  "description": "string (texte long, peut supporter Markdown/HTML simple)",
  "price": "number",
  "currency": "string (ex: 'XOF', 'EUR', 'USD')",
  "type": "string ('sale' ou 'rent')", // Vente ou Location
  "propertyType": "string ('house', 'apartment', 'land', 'commercial', etc.)",
  "bedrooms": "number (optionnel)",
  "bathrooms": "number (optionnel)",
  "areaSqMeters": "number (surface en m²)",
  "location": {
    "address": "string (adresse complète)",
    "city": "string",
    "country": "string",
    "coordinates": { 
      "latitude": "number (optionnel)", 
      "longitude": "number (optionnel)"
    }
  },
  "images": ["string (tableau d'URLs d'images)"],
  "amenities": ["string (tableau de commodités, ex: 'Piscine', 'Parking', 'Climatisation')"],
  "userId": "string (ID de l'utilisateur propriétaire)",
  "status": "string ('active', 'pending_approval', 'sold', 'rented', 'inactive')",
  "isFeatured": "boolean (pour les annonces mises en avant)",
  "viewCount": "number (compteur de vues)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```
*(Des modèles similaires sont attendus pour `Automobile`, `Service`, `MarketplaceProduct`)*

### F. Gestion des Fichiers (Uploads d'Images)

*   Pour la création/mise à jour d'annonces, le frontend enverra probablement les images via `multipart/form-data`.
*   Le backend devra gérer la réception de ces fichiers, leur stockage (ex: S3, Cloudinary, stockage local si applicable) et retourner les URLs des images stockées.
*   Envisagez des endpoints dédiés pour l'upload si les fichiers sont volumineux ou si vous voulez les dissocier de la création d'entité (ex: `POST /uploads/images`).

### G. Tests et Communication

*   Utilisez des outils comme Postman ou Insomnia pour tester vos endpoints API indépendamment du frontend.
*   Communiquez clairement avec le développeur frontend sur toute modification des endpoints, des formats de données ou des mécanismes d'authentification.
*   Un `health check endpoint` (ex: `GET /health`) qui retourne un statut `200 OK` peut être utile pour vérifier la connectivité de base.

## 💳 Intégration Paiements

Le frontend est préparé pour intégrer des solutions de paiement. Le backend jouera un rôle crucial.

### PayPal
*   Le frontend peut utiliser le SDK JavaScript de PayPal pour initier le paiement.
*   Le backend devra fournir des endpoints pour :
    1.  Créer une commande PayPal (`POST /payments/paypal/create-order`).
    2.  Capturer le paiement après approbation de l'utilisateur (`POST /payments/paypal/capture-order`).
*   Référez-vous à la documentation de l'API REST de PayPal pour les détails d'implémentation serveur.

### PayDunya
*   L'intégration de PayDunya se fait généralement via une redirection vers leur page de paiement ou en utilisant leur API.
*   Le backend devra :
    1.  Préparer les informations de la transaction.
    2.  Initier la transaction avec l'API PayDunya.
    3.  Gérer les callbacks (IPN - Instant Payment Notification) de PayDunya pour confirmer le statut du paiement.
*   Le frontend aura besoin des clés publiques et des informations de configuration (fournies via variables d'environnement `VITE_PAYDUNYA_*`).

**Configuration des Clés (Frontend)** :
Les clés API pour les services de paiement (comme `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_PAYPAL_CLIENT_ID`, etc.) doivent être configurées dans le fichier `.env` du frontend. **N'exposez jamais de clés secrètes ici.**

```javascript
// Exemple de configuration dans src/lib/paymentConfig.js (conceptuel)
export const paypalConfig = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, // Clé publique uniquement
  currency: 'XOF', // ou une autre devise
  // ... autres options frontend
};

export const paydunyaConfig = {
  publicKey: import.meta.env.VITE_PAYDUNYA_PUBLIC_KEY,
  token: import.meta.env.VITE_PAYDUNYA_TOKEN,
  mode: import.meta.env.VITE_PAYDUNYA_MODE || 'test', // 'test' ou 'live'
  // ... autres options frontend
};
```
Le backend gérera les clés secrètes.

## 🛠️ Guide d'Intégration Détaillé (Résumé)

1.  **Vérification des Prérequis** : Assurez-vous que le backend et le frontend peuvent communiquer (ports, CORS).
2.  **Configuration Initiale** :
    *   Développeur Frontend : Mettre à jour `VITE_API_BASE_URL` dans `.env`.
    *   Développeur Backend : S'assurer que les endpoints listés sont disponibles et fonctionnels.
3.  **Test de Connectivité Basique** :
    *   Frontend : Faire un simple appel `fetch` (ou via `src/lib/api.js`) à un endpoint public du backend (ex: `GET /health` ou `GET /blog/posts`).
    *   Vérifier que la réponse est correcte et que les logs ne montrent pas d'erreurs CORS.
4.  **Implémentation de l'Authentification** :
    *   Commencer par `/auth/register` et `/auth/login`.
    *   Vérifier que le token JWT est bien retourné et stocké par le frontend.
    *   Tester un endpoint protégé (ex: `GET /auth/profile`) pour s'assurer que le token est correctement envoyé et validé.
5.  **Implémentation des Fonctionnalités CRUD** :
    *   Choisir une section (ex: Annonces Immobilières).
    *   Implémenter `GET` (liste et détail), puis `POST`, `PUT`, `DELETE`.
    *   Valider les formats de données échangés.
    *   S'assurer que la gestion des erreurs est correcte.
6.  **Gestion des Uploads** :
    *   Tester l'upload d'images pour les annonces.
7.  **Intégration des Paiements** :
    *   Implémenter les flux de paiement avec PayPal et/ou PayDunya, en étroite collaboration entre frontend et backend.
8.  **Tests Complets** :
    *   Tester tous les flux utilisateurs de bout en bout.
    *   Vérifier la gestion des cas d'erreur (réseau, validation, permissions).
9.  **Préparation pour la Production** :
    *   Configurer les variables d'environnement de production pour l'URL de l'API.
    *   S'assurer que HTTPS est utilisé.
    *   Revoir les configurations CORS du backend pour la production.

## 🔒 Sécurité

### Mesures Implémentées Côté Frontend
- **Validation des formulaires côté client** avec Zod (avant envoi à l'API).
- **Gestion des tokens JWT** : stockage sécurisé (localStorage) et inclusion automatique dans les requêtes.
- **HTTPS** : L'application doit être servie via HTTPS en production.
- **Échappement du contenu** : React échappe par défaut le contenu dynamique pour prévenir les attaques XSS.

### Recommandations Impératives pour le Backend
- **Validation Côté Serveur** : TOUJOURS valider et nettoyer toutes les données reçues du client. Ne jamais faire confiance aux données provenant du frontend.
- **Protection contre CSRF** : Implémenter des tokens CSRF si l'authentification est basée sur les sessions/cookies (moins pertinent pour JWT via `Authorization` header, mais bon à savoir).
- **Protection contre XSS** : Nettoyer toute donnée utilisateur avant de la stocker ou de la réafficher (surtout si elle est interprétée comme HTML/JS).
- **Protection contre les Injections SQL/NoSQL** : Utiliser des ORM/ODM ou des requêtes paramétrées.
- **Rate Limiting** : Protéger contre les abus et les attaques par déni de service.
- **Headers de Sécurité HTTP** : Configurer `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, etc.
- **CORS (Cross-Origin Resource Sharing)** : Configurer le backend pour n'autoriser que les origines du frontend.
- **Mots de Passe Sécurisés** : Hasher les mots de passe avec des algorithmes robustes (ex: bcrypt, Argon2).
- **Permissions et Contrôle d'Accès** : Vérifier rigoureusement les permissions pour chaque action.
- **Logging et Monitoring** : Journaliser les événements de sécurité et surveiller les activités suspectes.

## 📱 Responsive Design

Le frontend est conçu pour être entièrement responsive et s'adapter à toutes les tailles d'écran, en utilisant une approche "Mobile First" et les breakpoints standards de TailwindCSS.

## 🎨 Personnalisation

Le thème (couleurs, typographie, espacements) peut être personnalisé en modifiant `tailwind.config.js` et les variables CSS dans `src/index.css`. Les composants UI de `shadcn/ui` sont conçus pour être facilement personnalisables.

## 📊 Performance

Des optimisations de base sont en place :
- **Code splitting** par route (géré par Vite).
- **Lazy loading** des images est une bonne pratique à appliquer sur les images de contenu.
- **Minification** du code en production (géré par Vite).
- **Tree shaking** pour réduire la taille du bundle (géré par Vite).

## 🐛 Débogage

Utilisez les outils de développement de votre navigateur :
- **Console** pour les logs et erreurs.
- **Onglet Réseau (Network)** pour inspecter les appels API.
- **React Developer Tools** (extension navigateur) pour inspecter l'arbre des composants et l'état.

## 🤝 Contribution et Structure du Code

### Structure des Dossiers Principaux (`src/`)
```
src/
├── App.jsx                  # Composant racine et configuration des routes
├── main.jsx                 # Point d'entrée de l'application
├── index.css                # Styles globaux et configuration Tailwind
├── assets/                  # Images statiques, polices, etc.
├── components/              # Composants UI réutilisables
│   ├── ui/                  # Composants shadcn/ui de base (button, card, etc.)
│   ├── auth/                # Formulaires d'authentification
│   └── ...                  # Autres composants partagés (Navbar, Footer, etc.)
├── contexts/                # Contextes React (ex: AuthContext)
├── hooks/                   # Hooks personnalisés
├── layouts/                 # Composants de mise en page (MainLayout)
├── lib/                     # Utilitaires, services, configuration
│   ├── api.js               # Logique de communication avec le backend
│   ├── utils.js             # Fonctions utilitaires générales
│   ├── blogData.js          # Gestion des données du blog (actuellement localStorage)
│   ├── projectData.js       # Gestion des données des projets (actuellement localStorage)
│   └── personalData.js      # Données statiques de "personnalisation" du site
├── pages/                   # Composants de page (une page par route)
│   ├── auth/                # Pages d'authentification (Login, Register, Profile)
│   ├── marketplace/         # Pages des sections de la marketplace
│   ├── admin/               # Pages du tableau de bord admin
│   └── static/              # Pages statiques (About, FAQ, etc.)
└── styles/                  # (Optionnel) Fichiers CSS/SCSS spécifiques si Tailwind ne suffit pas
```

### Standards de Code
- Le projet est configuré avec ESLint et Prettier (via les dépendances `eslint-config-react-app`).
- Suivez les conventions de nommage et de style existantes pour la cohérence.

## 📞 Support et Questions

Pour toute question concernant l'intégration du frontend ou si vous rencontrez des difficultés :
- **Consultez ce `README.md`** en premier lieu.
- **Examinez le code source** :
    - `src/lib/api.js` pour comprendre comment les appels API sont effectués.
    - `src/contexts/AuthContext.jsx` pour la gestion de l'authentification.
    - Les composants dans `src/pages/` pour voir comment les données sont utilisées.
- **Utilisez les outils de développement de votre navigateur** pour inspecter les requêtes réseau et les erreurs console.
- En dernier recours, contactez le développeur frontend principal du projet Benome via `dev@benome.com`.

---

**Note** : Ce frontend est conçu pour être une base solide et moderne. Une collaboration étroite entre les équipes frontend et backend est essentielle pour une intégration réussie.
```
