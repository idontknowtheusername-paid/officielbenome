# 🚀 GUIDE DE CONFIGURATION SUPABASE - OFFICIEL BENOME

## 📋 ÉTAPES DE CONFIGURATION

### **ÉTAPE 1 : CRÉER LE PROJET SUPABASE**

1. **Aller sur Supabase.com**
   - Ouvrez [https://supabase.com](https://supabase.com)
   - Cliquez sur "Start your project" ou "Sign up"
   - Connectez-vous avec GitHub ou créez un compte

2. **Créer un nouveau projet**
   - Cliquez sur "New Project"
   - Choisissez votre organisation
   - **Nom du projet** : `officiel-benome`
   - **Mot de passe de base de données** : Créez un mot de passe fort (gardez-le en sécurité)
   - **Région** : Choisissez la plus proche (Europe pour la France)
   - Cliquez sur "Create new project"

3. **Attendre l'initialisation**
   - Le projet prend 2-3 minutes à s'initialiser
   - Vous verrez "Project is ready" quand c'est fait

---

### **ÉTAPE 2 : RÉCUPÉRER LES CLÉS D'API**

1. **Aller dans Settings > API**
   - Dans votre projet Supabase, cliquez sur l'icône ⚙️ (Settings)
   - Cliquez sur "API" dans le menu de gauche

2. **Copier les informations**
   - **Project URL** : `https://your-project-id.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Mettre à jour le fichier .env**
   ```bash
   # Ouvrir le fichier .env
   nano .env
   
   # Remplacer les valeurs par défaut
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

### **ÉTAPE 3 : CONFIGURER L'AUTHENTIFICATION**

1. **Aller dans Authentication > Settings**
   - Dans votre projet Supabase, cliquez sur "Authentication"
   - Puis "Settings"

2. **Configurer les URLs de redirection**
   - **Site URL** : `http://localhost:5173` (pour le développement)
   - **Redirect URLs** : 
     ```
     http://localhost:5173
     http://localhost:5173/auth/callback
     http://localhost:5173/reset-password
     ```

3. **Activer les providers (optionnel)**
   - **Email** : Activé par défaut
   - **Google** : Si vous voulez l'authentification Google
   - **Facebook** : Si vous voulez l'authentification Facebook

---

### **ÉTAPE 4 : CRÉER LES TABLES DE BASE**

1. **Aller dans SQL Editor**
   - Dans votre projet Supabase, cliquez sur "SQL Editor"
   - Cliquez sur "New query"

2. **Créer les types ENUM**
   ```sql
   -- Types pour les rôles et statuts
   CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
   CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
   CREATE TYPE listing_category AS ENUM ('real_estate', 'automobile', 'services', 'marketplace');
   CREATE TYPE listing_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
   CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
   CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
   ```

3. **Créer la table users**
   ```sql
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     first_name VARCHAR(50) NOT NULL,
     last_name VARCHAR(50) NOT NULL,
     phone_number VARCHAR(20),
     role user_role DEFAULT 'user',
     is_verified BOOLEAN DEFAULT false,
     profile_image TEXT,
     status user_status DEFAULT 'active',
     last_login_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Créer la table listings**
   ```sql
   CREATE TABLE listings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     price DECIMAL(10,2),
     category listing_category NOT NULL,
     subcategory VARCHAR(100),
     status listing_status DEFAULT 'pending',
     images TEXT[],
     location JSONB,
     contact_info JSONB,
     views_count INTEGER DEFAULT 0,
     favorites_count INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Créer les autres tables**
   ```sql
   -- Table payments
   CREATE TABLE payments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
     amount DECIMAL(10,2) NOT NULL,
     currency VARCHAR(3) DEFAULT 'EUR',
     status payment_status DEFAULT 'pending',
     payment_method VARCHAR(50),
     transaction_id VARCHAR(255),
     metadata JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Table notifications
   CREATE TABLE notifications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     message TEXT NOT NULL,
     type notification_type NOT NULL,
     is_read BOOLEAN DEFAULT false,
     metadata JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Table favorites
   CREATE TABLE favorites (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, listing_id)
   );
   ```

---

### **ÉTAPE 5 : CONFIGURER ROW LEVEL SECURITY (RLS)**

1. **Activer RLS sur toutes les tables**
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
   ```

2. **Créer les politiques pour users**
   ```sql
   -- Les utilisateurs peuvent voir leur propre profil
   CREATE POLICY "Users can view their own profile" ON users
     FOR SELECT USING (auth.uid() = id);

   -- Les utilisateurs peuvent mettre à jour leur propre profil
   CREATE POLICY "Users can update their own profile" ON users
     FOR UPDATE USING (auth.uid() = id);

   -- Les utilisateurs peuvent créer leur profil
   CREATE POLICY "Users can create their own profile" ON users
     FOR INSERT WITH CHECK (auth.uid() = id);
   ```

3. **Créer les politiques pour listings**
   ```sql
   -- Tout le monde peut voir les annonces approuvées
   CREATE POLICY "Public can view approved listings" ON listings
     FOR SELECT USING (status = 'approved');

   -- Les utilisateurs peuvent créer leurs propres annonces
   CREATE POLICY "Users can create listings" ON listings
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Les utilisateurs peuvent mettre à jour leurs propres annonces
   CREATE POLICY "Users can update their own listings" ON listings
     FOR UPDATE USING (auth.uid() = user_id);

   -- Les utilisateurs peuvent supprimer leurs propres annonces
   CREATE POLICY "Users can delete their own listings" ON listings
     FOR DELETE USING (auth.uid() = user_id);
   ```

4. **Créer les politiques pour les admins**
   ```sql
   -- Les admins peuvent tout faire sur les listings
   CREATE POLICY "Admins can do everything on listings" ON listings
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM users 
         WHERE users.id = auth.uid() 
         AND users.role = 'admin'
       )
     );
   ```

---

### **ÉTAPE 6 : CRÉER LES TRIGGERS ET FONCTIONS**

1. **Fonction pour mettre à jour updated_at**
   ```sql
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';
   ```

2. **Triggers pour updated_at**
   ```sql
   CREATE TRIGGER update_users_updated_at 
     BEFORE UPDATE ON users 
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   CREATE TRIGGER update_listings_updated_at 
     BEFORE UPDATE ON listings 
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   CREATE TRIGGER update_payments_updated_at 
     BEFORE UPDATE ON payments 
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

3. **Fonction pour créer un profil utilisateur automatiquement**
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.users (id, email, first_name, last_name)
     VALUES (
       NEW.id,
       NEW.email,
       COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
       COALESCE(NEW.raw_user_meta_data->>'last_name', '')
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

---

### **ÉTAPE 7 : CONFIGURER LE STORAGE**

1. **Aller dans Storage**
   - Dans votre projet Supabase, cliquez sur "Storage"
   - Cliquez sur "New bucket"

2. **Créer les buckets**
   - **Nom** : `listings-images`
   - **Public** : ✅ (pour que les images soient accessibles publiquement)
   - **File size limit** : 10MB
   - **Allowed MIME types** : `image/*`

3. **Créer un autre bucket pour les avatars**
   - **Nom** : `avatars`
   - **Public** : ✅
   - **File size limit** : 5MB
   - **Allowed MIME types** : `image/*`

4. **Configurer les politiques RLS pour le storage**
   ```sql
   -- Politiques pour listings-images
   CREATE POLICY "Anyone can view listings images" ON storage.objects
     FOR SELECT USING (bucket_id = 'listings-images');

   CREATE POLICY "Authenticated users can upload listings images" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'listings-images' 
       AND auth.role() = 'authenticated'
     );

   CREATE POLICY "Users can update their own listings images" ON storage.objects
     FOR UPDATE USING (
       bucket_id = 'listings-images' 
       AND auth.uid()::text = (storage.foldername(name))[1]
     );

   -- Politiques pour avatars
   CREATE POLICY "Anyone can view avatars" ON storage.objects
     FOR SELECT USING (bucket_id = 'avatars');

   CREATE POLICY "Users can upload their own avatar" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'avatars' 
       AND auth.uid()::text = (storage.foldername(name))[1]
     );
   ```

---

### **ÉTAPE 8 : TESTER LA CONFIGURATION**

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Aller sur la page d'accueil**
   - Ouvrez [http://localhost:5173](http://localhost:5173)
   - Descendez jusqu'à la section "Test Supabase"

3. **Tester la connexion**
   - Cliquez sur "Tester la Connexion Supabase"
   - Vous devriez voir "✅ Connexion Supabase réussie !"

4. **Tester l'authentification**
   - Essayez de créer un compte avec un email valide
   - Vérifiez que vous recevez un email de confirmation
   - Essayez de vous connecter

---

### **ÉTAPE 9 : VÉRIFICATIONS FINALES**

1. **Vérifier dans Supabase Dashboard**
   - **Authentication > Users** : Voir les utilisateurs créés
   - **Table Editor** : Voir les données dans les tables
   - **Storage** : Voir les fichiers uploadés
   - **Logs** : Vérifier qu'il n'y a pas d'erreurs

2. **Vérifier les variables d'environnement**
   ```bash
   # Vérifier que le fichier .env contient les bonnes valeurs
   cat .env
   ```

3. **Tester les fonctionnalités**
   - ✅ Connexion à Supabase
   - ✅ Authentification
   - ✅ Création de profil utilisateur
   - ✅ Upload d'images (si configuré)

---

## 🎉 FÉLICITATIONS !

Votre projet Supabase est maintenant configuré et prêt à être utilisé ! 

### **Prochaines étapes :**
1. **Migrer les composants** existants vers Supabase
2. **Implémenter les fonctionnalités** marketplace
3. **Ajouter le real-time** pour les notifications
4. **Optimiser les performances**

### **Ressources utiles :**
- [Documentation Supabase](https://supabase.com/docs)
- [Exemples React](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)

---

**Besoin d'aide ?** Consultez la documentation ou posez vos questions ! 🚀 