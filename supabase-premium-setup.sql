-- ============================================================================
-- CONFIGURATION PREMIUM ET BOOSTING - MAXIMARKET
-- ============================================================================

-- Types pour les statuts de boost
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'boost_status') THEN
    CREATE TYPE boost_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
  END IF;
END
$$;

-- Table pour les packages de boost
CREATE TABLE IF NOT EXISTS boost_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB, -- {priority, badge, analytics, featured, etc.}
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour tracker les boosts actifs
CREATE TABLE IF NOT EXISTS listing_boosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  package_id UUID REFERENCES boost_packages(id),
  user_id UUID REFERENCES users(id),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status boost_status DEFAULT 'active',
  payment_id UUID, -- Référence optionnelle vers payments (sera ajoutée plus tard)
  metadata JSONB, -- {views_before, views_after, contacts_before, contacts_after}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'historique des boosts
CREATE TABLE IF NOT EXISTS boost_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  boost_id UUID REFERENCES listing_boosts(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'purchased', 'activated', 'expired', 'cancelled', 'renewed'
  details JSONB, -- Détails de l'action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_boost_packages_active ON boost_packages(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_listing_boosts_listing ON listing_boosts(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_boosts_user ON listing_boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_boosts_status ON listing_boosts(status);
CREATE INDEX IF NOT EXISTS idx_listing_boosts_dates ON listing_boosts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_boost_history_listing ON boost_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_boost_history_user ON boost_history(user_id);

-- Données de test pour les packages de boost
INSERT INTO boost_packages (name, description, duration_days, price, features, sort_order) VALUES
(
  'Boost Basique',
  'Visibilité améliorée pendant 7 jours',
  7,
  5000.00,
  '{"priority": "medium", "badge": "boosted", "featured": false, "analytics": "basic"}',
  1
),
(
  'Boost Premium',
  'Mise en avant complète pendant 14 jours',
  14,
  12000.00,
  '{"priority": "high", "badge": "boosted", "featured": true, "analytics": "detailed"}',
  2
),
(
  'Boost VIP',
  'Visibilité maximale pendant 30 jours',
  30,
  25000.00,
  '{"priority": "highest", "badge": "boosted", "featured": true, "analytics": "premium", "support": "priority"}',
  3
),
(
  'Boost Flash',
  'Visibilité intensive pendant 3 jours',
  3,
  3000.00,
  '{"priority": "high", "badge": "boosted", "featured": false, "analytics": "basic"}',
  4
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_boost_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER IF NOT EXISTS update_boost_packages_updated_at 
  BEFORE UPDATE ON boost_packages 
  FOR EACH ROW EXECUTE FUNCTION update_boost_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_listing_boosts_updated_at 
  BEFORE UPDATE ON listing_boosts 
  FOR EACH ROW EXECUTE FUNCTION update_boost_updated_at_column();

-- Fonction pour vérifier l'expiration des boosts
CREATE OR REPLACE FUNCTION check_boost_expiration()
RETURNS void AS $$
BEGIN
  UPDATE listing_boosts 
  SET status = 'expired' 
  WHERE end_date < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les statistiques de boost
CREATE OR REPLACE FUNCTION get_boost_stats(listing_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_boosts', COUNT(*),
    'active_boosts', COUNT(*) FILTER (WHERE status = 'active'),
    'total_days', COALESCE(SUM(duration_days), 0),
    'total_investment', COALESCE(SUM(p.price), 0),
    'current_boost', (
      SELECT jsonb_build_object(
        'package_name', p.name,
        'days_remaining', EXTRACT(DAY FROM (lb.end_date - NOW())),
        'status', lb.status
      )
      FROM listing_boosts lb
      JOIN boost_packages p ON lb.package_id = p.id
      WHERE lb.listing_id = listing_id_param AND lb.status = 'active'
      LIMIT 1
    )
  ) INTO result
  FROM listing_boosts lb
  JOIN boost_packages p ON lb.package_id = p.id
  WHERE lb.listing_id = listing_id_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Politiques RLS pour les nouvelles tables
ALTER TABLE boost_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour boost_packages (lecture publique)
CREATE POLICY IF NOT EXISTS "Public can view active boost packages" ON boost_packages
  FOR SELECT USING (is_active = true);

-- Politiques pour listing_boosts
CREATE POLICY IF NOT EXISTS "Users can view their own boosts" ON listing_boosts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create boosts for their listings" ON listing_boosts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = listing_id AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can update their own boosts" ON listing_boosts
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour boost_history
CREATE POLICY IF NOT EXISTS "Users can view their own boost history" ON boost_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create boost history entries" ON boost_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les admins
CREATE POLICY IF NOT EXISTS "Admins can do everything on boost tables" ON boost_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can do everything on boost tables" ON listing_boosts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can do everything on boost tables" ON boost_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- MODIFICATION DE LA TABLE LISTINGS EXISTANTE
-- ============================================================================

-- Ajouter les colonnes premium à la table listings existante
DO $$
BEGIN
  -- Ajouter is_featured si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_featured') THEN
    ALTER TABLE listings ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  
  -- Ajouter is_boosted si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_boosted') THEN
    ALTER TABLE listings ADD COLUMN is_boosted BOOLEAN DEFAULT false;
  END IF;
  
  -- Ajouter is_premium si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_premium') THEN
    ALTER TABLE listings ADD COLUMN is_premium BOOLEAN DEFAULT false;
  END IF;
  
  -- Ajouter boost_expires_at si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'boost_expires_at') THEN
    ALTER TABLE listings ADD COLUMN boost_expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Ajouter premium_metadata si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'premium_metadata') THEN
    ALTER TABLE listings ADD COLUMN premium_metadata JSONB DEFAULT '{}';
  END IF;
END
$$;

-- Index pour les nouvelles colonnes premium
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_boosted ON listings(is_boosted) WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_listings_premium ON listings(is_premium) WHERE is_premium = true;

-- ============================================================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================================================

-- Commentaires pour la documentation
COMMENT ON TABLE boost_packages IS 'Packages de boost disponibles pour les annonces';
COMMENT ON TABLE listing_boosts IS 'Boosts actifs et historiques des annonces';
COMMENT ON TABLE boost_history IS 'Historique des actions sur les boosts';
COMMENT ON FUNCTION get_boost_stats IS 'Calcule les statistiques de boost pour une annonce';
COMMENT ON FUNCTION check_boost_expiration IS 'Marque les boosts expirés comme inactifs';
COMMENT ON COLUMN listings.is_featured IS 'Indique si l''annonce est mise en avant';
COMMENT ON COLUMN listings.is_boosted IS 'Indique si l''annonce est boostée';
COMMENT ON COLUMN listings.is_premium IS 'Indique si l''annonce est premium';
COMMENT ON COLUMN listings.boost_expires_at IS 'Date d''expiration du boost';
COMMENT ON COLUMN listings.premium_metadata IS 'Métadonnées premium de l''annonce';

-- ============================================================================
-- CONFIGURATION TERMINÉE
-- ============================================================================
