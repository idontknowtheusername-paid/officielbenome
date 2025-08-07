# 🚀 Guide de Déploiement - Migration Supabase

## 📋 Vue d'ensemble

Ce guide vous accompagne dans le déploiement de votre application après la migration vers Supabase.

## 🔧 Prérequis

- ✅ Compte Supabase créé
- ✅ Projet Supabase configuré
- ✅ Variables d'environnement configurées
- ✅ Migration des composants terminée

## 📦 Étapes de déploiement

### 1. 🔍 Vérification de la migration

```bash
# Installer les dépendances si nécessaire
npm install

# Tester la migration
node test-migration.js
```

### 2. 🗄️ Configuration de la base de données

#### A. Exécuter les scripts SQL

1. **Tables de base** (déjà fait) :
   ```sql
   -- Exécuté via supabase-setup.sql
   ```

2. **Tables manquantes** :
   ```sql
   -- Exécuter dans l'éditeur SQL de Supabase
   -- Copier le contenu de supabase-missing-tables.sql
   ```

#### B. Vérifier les politiques RLS

Assurez-vous que toutes les tables ont les bonnes politiques :

```sql
-- Vérifier les politiques actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. 🔐 Configuration de l'authentification

#### A. Configurer les providers d'authentification

Dans le dashboard Supabase :
1. Aller à **Authentication > Providers**
2. Activer les providers souhaités (Email, Google, etc.)
3. Configurer les URLs de redirection

#### B. Configurer les templates d'email

1. Aller à **Authentication > Email Templates**
2. Personnaliser les templates :
   - Confirmation d'email
   - Réinitialisation de mot de passe
   - Invitation

### 4. 📁 Configuration du Storage

#### A. Créer les buckets

```sql
-- Dans l'éditeur SQL de Supabase
INSERT INTO storage.buckets (id, name, public) VALUES
  ('images', 'images', true),
  ('documents', 'documents', false),
  ('avatars', 'avatars', true);
```

#### B. Configurer les politiques de storage

```sql
-- Politiques pour le bucket images
CREATE POLICY "Images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politiques pour le bucket avatars
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 5. 🌐 Configuration des variables d'environnement

#### A. Fichier .env.local

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application
VITE_APP_NAME=MaxiMarket
VITE_APP_URL=http://localhost:5173

# Fonctionnalités
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

#### B. Variables de production

Pour Vercel/Netlify :
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-domain.com
```

### 6. 🧪 Tests de validation

#### A. Tests automatisés

```bash
# Tester la migration
node test-migration.js

# Tester l'application
npm run dev
```

#### B. Tests manuels

1. **Authentification** :
   - [ ] Inscription
   - [ ] Connexion
   - [ ] Réinitialisation de mot de passe
   - [ ] Déconnexion

2. **Fonctionnalités principales** :
   - [ ] Création d'annonces
   - [ ] Recherche d'annonces
   - [ ] Gestion des favoris
   - [ ] Messagerie

3. **Administration** :
   - [ ] Accès au dashboard admin
   - [ ] Gestion des utilisateurs
   - [ ] Modération des annonces
   - [ ] Analytics

### 7. 🚀 Déploiement

#### A. Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

#### B. Netlify

```bash
# Build de production
npm run build

# Déployer le dossier dist/
```

#### C. Autres plateformes

- **Railway** : Connecter le repo GitHub
- **Render** : Configurer le build et les variables
- **Heroku** : Utiliser le buildpack Node.js

### 8. 🔍 Post-déploiement

#### A. Monitoring

1. **Supabase Dashboard** :
   - Surveiller les requêtes
   - Vérifier les erreurs
   - Analyser les performances

2. **Logs d'application** :
   - Surveiller les erreurs client
   - Analyser les métriques de performance

#### B. Optimisations

1. **Cache** :
   ```javascript
   // Implémenter le cache côté client
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         cacheTime: 10 * 60 * 1000, // 10 minutes
       },
     },
   });
   ```

2. **Pagination** :
   ```javascript
   // Utiliser la pagination Supabase
   const { data, error } = await supabase
     .from('listings')
     .select('*')
     .range(0, 9); // 10 premiers résultats
   ```

## 🛠️ Dépannage

### Problèmes courants

#### 1. Erreurs de connexion Supabase

```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Tester la connexion
node test-migration.js
```

#### 2. Erreurs de politiques RLS

```sql
-- Désactiver temporairement RLS pour debug
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'users';
```

#### 3. Problèmes de CORS

Dans Supabase Dashboard :
1. Aller à **Settings > API**
2. Ajouter les domaines autorisés
3. Configurer les headers CORS

#### 4. Erreurs de storage

```sql
-- Vérifier les permissions
SELECT * FROM storage.buckets;
SELECT * FROM storage.policies;
```

## 📊 Métriques de succès

### Indicateurs de performance

- ✅ Temps de chargement < 2s
- ✅ Taux d'erreur < 1%
- ✅ Disponibilité > 99.9%

### Métriques Supabase

- 📈 Requêtes par seconde
- 💾 Utilisation du stockage
- 🔐 Authentifications réussies

## 🔄 Maintenance

### Tâches régulières

1. **Sauvegardes** :
   - Sauvegardes automatiques Supabase
   - Sauvegardes manuelles si nécessaire

2. **Mises à jour** :
   - Mettre à jour les dépendances
   - Vérifier les changements Supabase

3. **Monitoring** :
   - Surveiller les logs
   - Analyser les performances
   - Vérifier la sécurité

## 📞 Support

- **Documentation Supabase** : https://supabase.com/docs
- **Communauté** : https://github.com/supabase/supabase/discussions
- **Support** : https://supabase.com/support

---

## ✅ Checklist de déploiement

- [ ] Migration des composants terminée
- [ ] Tables Supabase créées
- [ ] Politiques RLS configurées
- [ ] Authentification configurée
- [ ] Storage configuré
- [ ] Variables d'environnement définies
- [ ] Tests de validation passés
- [ ] Application déployée
- [ ] Monitoring configuré
- [ ] Documentation mise à jour

🎉 **Félicitations ! Votre application est maintenant déployée avec Supabase !** 