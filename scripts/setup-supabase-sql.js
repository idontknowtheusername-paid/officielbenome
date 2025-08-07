import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vvlpgviacinsbggfsexs.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante dans .env')
  console.log('📝 Pour obtenir la clé service :')
  console.log('1. Allez dans votre projet Supabase')
  console.log('2. Settings > API')
  console.log('3. Copiez "service_role key"')
  console.log('4. Ajoutez-la à votre fichier .env')
  process.exit(1)
}

// Créer le client Supabase avec la clé service (pour les opérations admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🚀 Configuration automatique de Supabase...')
console.log('📡 URL:', supabaseUrl)

// Toutes les requêtes SQL en une seule fois
const setupSQL = `
-- Types pour les rôles et statuts
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE IF NOT EXISTS user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE IF NOT EXISTS listing_category AS ENUM ('real_estate', 'automobile', 'services', 'marketplace');
CREATE TYPE IF NOT EXISTS listing_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE IF NOT EXISTS payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE IF NOT EXISTS notification_type AS ENUM ('info', 'success', 'warning', 'error');

-- Table users
CREATE TABLE IF NOT EXISTS users (
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

-- Table listings
CREATE TABLE IF NOT EXISTS listings (
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

-- Table payments
CREATE TABLE IF NOT EXISTS payments (
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
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour créer un profil utilisateur automatiquement
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

-- Triggers pour updated_at
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_listings_updated_at 
  BEFORE UPDATE ON listings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour créer automatiquement un profil utilisateur
CREATE TRIGGER IF NOT EXISTS on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour listings
CREATE POLICY IF NOT EXISTS "Public can view approved listings" ON listings
  FOR SELECT USING (status = 'approved');

CREATE POLICY IF NOT EXISTS "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les admins
CREATE POLICY IF NOT EXISTS "Admins can do everything on listings" ON listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Politiques pour payments
CREATE POLICY IF NOT EXISTS "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour notifications
CREATE POLICY IF NOT EXISTS "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour favorites
CREATE POLICY IF NOT EXISTS "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
`

async function setupSupabase() {
  try {
    console.log('📝 Exécution du script SQL complet...')
    
    // Utiliser l'API REST pour exécuter le SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: setupSQL })
    })

    if (response.ok) {
      console.log('✅ Configuration Supabase terminée avec succès !')
      console.log('📊 Vérifiez dans votre dashboard Supabase :')
      console.log('   - Table Editor : Voir les tables créées')
      console.log('   - Authentication : Configurer les providers')
      console.log('   - Storage : Créer les buckets pour les images')
    } else {
      const error = await response.text()
      console.error('❌ Erreur lors de la configuration:', error)
    }

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
    console.log('💡 Essayez d\'exécuter le SQL manuellement dans l\'éditeur SQL de Supabase')
  }
}

// Exécuter la configuration
setupSupabase() 