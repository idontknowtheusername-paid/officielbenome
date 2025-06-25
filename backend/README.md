# Backend Officiel BenoMe

Ce dépôt contient le backend de l'application Officiel BenoMe, construit avec Node.js, Express et PostgreSQL.

## Prérequis

- Node.js (version 14 ou supérieure)
- PostgreSQL (version 12 ou supérieure)
- npm ou yarn

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone [URL_DU_REPO]
   cd officielbenome_backup/backend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn
   ```

3. **Configurer l'environnement**
   - Copier le fichier `.env.example` vers `.env`
   - Modifier les variables d'environnement selon votre configuration

   ```bash
   cp .env.example .env
   ```

4. **Configurer la base de données**
   - Créer une base de données PostgreSQL
   - Mettre à jour les informations de connexion dans le fichier `.env`

## Configuration de la base de données

### Variables d'environnement requises

```env
# Configuration PostgreSQL - Développement
PG_USER=postgres
PG_PASSWORD=votre_mot_de_passe
PG_DATABASE=officielbenome_dev
PG_HOST=localhost
PG_PORT=5432

# Configuration JWT
JWT_SECRET=votre_clé_secrète_très_longue_et_sécurisée
JWT_EXPIRES_IN=30d

# ===================================
# SESSIONS ET SÉCURITÉ
# ===================================
SESSION_SECRET=your_session_secret_key
SESSION_COOKIE_MAX_AGE=86400000 # 1 jour en ms
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=strict

# Protection contre les attaques par force brute
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MINUTES=15
BCRYPT_SALT_ROUNDS=12
CSRF_SECRET=your_csrf_secret

# ===================================
# DÉBOGAGE ET MAINTENANCE
# ===================================
MAINTENANCE_MODE=false
DEBUG_DB_LOGGING=false
DEBUG_REDIS_LOGGING=false

# ===================================
# VERSIONS ET MÉTADONNÉES
# ===================================
API_VERSION=v1
MIN_APP_VERSION=1.0.0
REQUIRE_UPDATE=false
APP_NAME=OfficielBenoMe
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# ===================================
# MÉTRIQUES ET SURVEILLANCE
# ===================================
ENABLE_METRICS=true
METRICS_ENDPOINT=/metrics
METRICS_PORT=9090
PROMETHEUS_METRICS_ENABLED=true
PROMETHEUS_METRICS_PATH=/metrics
SENTRY_DSN=

# ===================================
# SÉCURITÉ AVANCÉE
# ===================================
# Headers de sécurité
CONTENT_SECURITY_POLICY=default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;
PERMISSIONS_POLICY=geolocation=(), microphone=(), camera=()
REFERRER_POLICY=no-referrer-when-downgrade
EXPECT_CT_MAX_AGE=86400
X_DNS_PREFETCH_CONTROL=on
X_DOWNLOAD_OPTIONS=noopen
X_PERMITTED_CROSS_DOMAIN_POLICIES=none
X_XSS_PROTECTION=1; mode=block
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
STRICT_TRANSPORT_SECURITY=max-age=31536000; includeSubDomains; preload
```

### Création de la base de données

1. Se connecter à PostgreSQL :
   ```bash
   psql -U postgres
   ```

2. Créer la base de données :
   ```sql
   CREATE DATABASE officielbenome_dev;
   CREATE USER your_username WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE officielbenome_dev TO your_username;
   ```

## Démarrage du serveur

### Mode développement

```bash
# Démarrer le serveur avec rechargement automatique
npm run dev

# ou

# Démarrer le serveur en production
npm start
```

Le serveur sera accessible à l'adresse : `http://localhost:3000`

### Documentation de l'API

La documentation de l'API est disponible à l'adresse : `http://localhost:3000/api-docs`

## Structure du projet

```
backend/
├── config/               # Fichiers de configuration
│   └── database.js       # Configuration de la base de données
├── controllers/          # Contrôleurs de l'application
├── middleware/           # Middleware personnalisés
│   ├── auth.js           # Authentification
│   └── errorHandler.js   # Gestion des erreurs
├── models/               # Modèles de données
│   ├── index.js          # Point d'entrée des modèles
│   └── User.js           # Modèle utilisateur
├── routes/               # Définition des routes
│   ├── auth.routes.js    # Routes d'authentification
│   └── users.routes.js   # Routes utilisateurs
├── .env.example          # Exemple de fichier d'environnement
├── package.json          # Dépendances et scripts
└── server.js             # Point d'entrée de l'application
```

## Tests

```bash
# Exécuter les tests
npm test

# Exécuter les tests avec couverture de code
npm run test:coverage
```

## Déploiement

### Préparation pour la production

1. Mettre à jour les variables d'environnement pour la production
2. Construire l'application
   ```bash
   npm run build
   ```

### Déploiement avec PM2

1. Installer PM2 globalement :
   ```bash
   npm install -g pm2
   ```

2. Démarrer l'application avec PM2 :
   ```bash
   pm2 start dist/server.js --name "officielbenome-backend"
   ```

3. Configurer le démarrage automatique :
   ```bash
   pm2 startup
   pm2 save
   ```

## Sécurité

- Ne jamais exposer les clés secrètes dans le code source
- Utiliser HTTPS en production
- Mettre à jour régulièrement les dépendances
- Implémenter un système de rate limiting
- Valider et assainir toutes les entrées utilisateur

## Licence

[MIT](LICENSE)
