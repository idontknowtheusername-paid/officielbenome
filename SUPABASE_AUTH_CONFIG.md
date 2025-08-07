# Configuration Authentification Supabase

## 🔧 Configuration dans Supabase Dashboard

### 1. Authentication Settings

Allez dans **Supabase Dashboard** → **Authentication** → **Settings**

#### URL Configuration :
- **Site URL :** `https://officielbenome.vercel.app`
- **Redirect URLs :** Ajoutez ces URLs :
  ```
  https://officielbenome.vercel.app/**
  https://officielbenome.vercel.app/auth/callback
  http://localhost:5173/**
  http://localhost:5173/auth/callback
  ```

#### Email Settings :
- **Enable email confirmations :** `ON`
- **Enable email change confirmations :** `ON`
- **Enable secure email change :** `ON`

### 2. Email Templates

Dans **Authentication** → **Email Templates** :

#### Confirm signup :
- **Subject :** `Confirmez votre inscription - Officiel BenoMe`
- **Body :** Gardez le template par défaut ou personnalisez

#### Magic Link :
- **Subject :** `Votre lien de connexion - Officiel BenoMe`

#### Change Email Address :
- **Subject :** `Confirmez votre nouvelle adresse email`

#### Reset Password :
- **Subject :** `Réinitialisez votre mot de passe - Officiel BenoMe`

### 3. Providers

Dans **Authentication** → **Providers** :
- **Email :** `Enabled`
- **Phone :** `Disabled` (ou configurez si besoin)

### 4. Trigger pour auto-création du profil

Exécutez ce SQL dans **SQL Editor** :

```sql
-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour appeler la fonction à chaque nouvel utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. RLS Policies pour users

```sql
-- Permettre à tout utilisateur connecté de lire les profils publics
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

-- Permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Permettre l'insertion (pour le trigger)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🚀 Test de l'inscription

Après cette configuration :
1. Testez l'inscription sur le site
2. Vérifiez que l'email de confirmation arrive
3. Cliquez sur le lien de confirmation
4. Vérifiez que l'utilisateur est connecté automatiquement
5. Vérifiez que le profil est créé dans `public.users`

## 🔧 Troubleshooting

Si l'inscription ne fonctionne toujours pas :
1. Vérifiez les logs dans **Supabase Dashboard** → **Logs**
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que les URLs de redirection sont correctes
4. Testez avec un email différent