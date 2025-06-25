# Backend Officiel BenoMe

[![Node.js CI](https://github.com/yourusername/officielbenome/actions/workflows/node.js.yml/badge.svg)](https://github.com/yourusername/officielbenome/actions/workflows/node.js.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Ce dépôt contient le backend de l'application Officiel BenoMe, construit avec Node.js, Express, PostgreSQL et Redis. Cette application fournit une API RESTful pour le tableau de bord d'administration et les fonctionnalités principales de la plateforme.

## Fonctionnalités principales

- Authentification et autorisation JWT
- Gestion des utilisateurs et des rôles
- Gestion des annonces et des transactions
- Tableau de bord d'administration
- Cache Redis pour les performances
- Documentation API avec Swagger
- Logs et surveillance
- Sécurité renforcée

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 18 ou supérieure)
- PostgreSQL (version 12 ou supérieure)
- Redis (version 6 ou supérieure)
- npm (version 8 ou supérieure) ou yarn (version 1.22 ou supérieure)

## 🔧 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/yourusername/officielbenome.git
   cd officielbenome/backend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn
   ```

3. **Configuration de l'environnement**
   - Copier le fichier `.env.example` vers `.env`
   - Modifier les variables d'environnement selon votre configuration

   ```bash
   cp .env.example .env
   ```

4. **Configuration de la base de données**
   - Démarrer les services requis avec Docker Compose :
     ```bash
     docker-compose up -d postgres redis
     ```
   - Créer la base de données et exécuter les migrations :
     ```bash
     npm run db:setup
     ```

5. **Lancer l'application en mode développement**
   ```bash
   npm run dev
   ```

   L'application sera disponible à l'adresse : http://localhost:3000
   
   La documentation de l'API sera disponible à : http://localhost:3000/api-docs

## 🛠 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# ===================================
# CONFIGURATION DE BASE
# ===================================
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
API_PREFIX=/api

# ===================================
# BASE DE DONNÉES
# ===================================
# Développement
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=officielbenome_dev
PG_HOST=localhost
PG_PORT=5432

# Production (remplacer par vos valeurs réelles en production)
DATABASE_URL=postgresql://user:password@host:5432/database_name?sslmode=require

# ===================================
# REDIS
# ===================================
REDIS_URL=redis://localhost:6379

# ===================================
# AUTHENTIFICATION ET SÉCURITÉ
# ===================================
JWT_SECRET=change_this_to_a_secure_random_string
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=30
SESSION_SECRET=your_session_secret_key
SESSION_COOKIE_MAX_AGE=86400000 # 1 jour en ms
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=strict
CORS_ORIGIN=http://localhost:3000

# ===================================
# CLOUDINARY (pour le stockage des fichiers)
# ===================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===================================
# EMAIL (SMTP)
# ===================================
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@benome.com

# ===================================
# SÉCURITÉ AVANCÉE
# ===================================
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY=default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;

# ===================================
# MÉTRIQUES ET SURVEILLANCE
# ===================================
ENABLE_METRICS=true
METRICS_ENDPOINT=/metrics
SENTRY_DSN=

# ===================================
# DÉBOGAGE
# ===================================
DEBUG=app:*,error:*
DEBUG_DB_LOGGING=false
DEBUG_REDIS_LOGGING=false
PERMISSIONS_POLICY=geolocation=(), microphone=(), camera=()
REFERRER_POLICY=no-referrer-when-downgrade
EXPECT_CT_MAX_AGE=86400

## 🚀 Déploiement

### Préparation au déploiement

1. **Configurer les variables d'environnement de production**
   - Mettre à jour le fichier `.env` avec les valeurs de production
   - S'assurer que `NODE_ENV=production`
   - Configurer une URL de base de données sécurisée
   - Générer des clés secrètes fortes pour JWT et les sessions

2. **Construire l'application**
   ```bash
   npm run build
   ```

### Options de déploiement

#### 1. Déploiement avec Docker (recommandé)

```bash
# Construire l'image Docker
docker build -t officielbenome-backend .

# Démarrer les conteneurs
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. Déploiement sur Render.com

1. Créer un nouveau service Web sur Render
2. Lier le dépôt GitHub
3. Configurer les variables d'environnement
4. Définir la commande de démarrage : `npm start`
5. Déployer

#### 3. Déploiement manuel

1. Installer les dépendances de production :
   ```bash
   npm ci --only=production
   ```
2. Démarrer le serveur :
   ```bash
   npm start
   ```

## 🛠 Développement

### Structure du projet

```
backend/
├── config/               # Fichiers de configuration
├── controllers/          # Contrôleurs pour les routes
├── middlewares/          # Middlewares personnalisés
├── models/               # Modèles de données
├── routes/               # Définition des routes
├── services/             # Logique métier
├── utils/                # Utilitaires
├── validators/           # Schémas de validation
├── .env.example          # Exemple de fichier d'environnement
├── server.js             # Point d'entrée de l'application
└── package.json          # Dépendances et scripts
```

### Commandes utiles

```bash
# Lancer en mode développement avec rechargement automatique
npm run dev

# Lancer les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Lancer le linter
npm run lint

# Formatter le code
npm run format

# Vérifier les vulnérabilités de sécurité
npm audit
```

## 🧪 Tests

### Exécuter les tests

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec couverture de code
npm run test:coverage

# Exécuter un fichier de test spécifique
npm test -- tests/unit/example.test.js
```

### Structure des tests

```
tests/
├── integration/     # Tests d'intégration
├── unit/            # Tests unitaires
└── utils/           # Utilitaires de test
```

## 🤝 Contribution

1. **Créer une branche**
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```

2. **Faire des commits atomiques**
   ```bash
   git commit -m "feat: ajouter une nouvelle fonctionnalité"
   ```

3. **Pousser les modifications**
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```

4. **Ouvrir une Pull Request**
   - Décrire les changements apportés
   - Lier les issues concernées
   - Demander une revue de code

### Convention de commits

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, point-virgule manquant, etc. (pas de changement de code)
- `refactor:` Refactorisation du code
- `test:` Ajout ou modification de tests
- `chore:` Mise à jour des tâches de construction, gestionnaire de paquets, etc.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Express](https://expressjs.com/) - Framework web rapide et minimaliste pour Node.js

### Documentation de l'API

La documentation complète de l'API est disponible à l'adresse `/api-docs` lorsque le serveur est en cours d'exécution en mode développement.

### Documentation supplémentaire

- [Guide de contribution](CONTRIBUTING.md)
- [Politique de sécurité](SECURITY.md)
- [Code de conduite](CODE_OF_CONDUCT.md)

## 🔐 Sécurité

### Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, veuillez nous en informer immédiatement à l'adresse security@benome.com. Nous apprécions votre aide pour sécuriser notre application.

### Bonnes pratiques de sécurité

- Ne jamais commiter de données sensibles dans le code source
- Utiliser des variables d'environnement pour les informations sensibles
- Maintenir les dépendances à jour
- Utiliser des outils d'analyse de sécurité comme `npm audit` et `snyk`

## 🌍 Environnements

### Développement

- **URL** : http://localhost:3000
- **Base de données** : PostgreSQL local
- **Cache** : Redis local

### Production

- **URL** : https://api.benome.com
- **Base de données** : PostgreSQL géré (RDS/Aurora)
- **Cache** : Redis Cloud

## 📊 Métriques et surveillance

### Métriques d'application

Les métriques de l'application sont disponibles à l'endpoint `/metrics` lorsque `ENABLE_METRICS=true`.

### Surveillance

- **Logs** : Centralisés avec Papertrail
- **Métriques** : Collectées avec Prometheus et visualisées avec Grafana
- **Alertes** : Configurées avec OpsGenie

## 🔄 Workflow CI/CD

1. **Développement**
   - Les développeurs poussent leur code sur des branches de fonctionnalités
   - Les tests unitaires et d'intégration sont exécutés automatiquement

2. **Revue de code**
   - Les PR sont examinées par au moins un autre développeur
   - Les tests doivent passer avant la fusion

3. **Déploiement en préproduction**
   - Déclenché par la fusion dans la branche `staging`
   - Déploiement automatique sur l'environnement de staging
   - Tests de charge et d'intégration exécutés

4. **Déploiement en production**
   - Déclenché manuellement depuis la branche `main`
   - Déploiement progressif avec vérification de santé
   - Rollback automatique en cas d'échec

## 🛠 Outils recommandés

- **Éditeur de code** : VS Code avec les extensions ESLint et Prettier
- **Client API** : Postman ou Insomnia
- **Client base de données** : TablePlus ou DBeaver
- **Gestion de versions** : Git avec GitLens

## 📞 Support

Pour toute question ou problème, veuillez :

1. Vérifier les [issues existantes](https://github.com/yourusername/officielbenome/issues)
2. Si le problème n'a pas été signalé, [ouvrir une nouvelle issue](https://github.com/yourusername/officielbenome/issues/new/choose)
3. Pour un support immédiat, contacter l'équipe à support@benome.com

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <p>Développé avec ❤️ par l'équipe Officiel BenoMe</p>
  <p>© 2025 Officiel BenoMe. Tous droits réservés.</p>
</div>
