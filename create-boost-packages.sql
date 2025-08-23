-- ============================================================================
-- CRÉATION TABLE BOOST_PACKAGES - SCRIPT SIMPLE
-- ============================================================================

-- 1. Créer le type enum boost_status s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'boost_status') THEN
    CREATE TYPE boost_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
  END IF;
END $$;

-- 2. Créer la table boost_packages
CREATE TABLE IF NOT EXISTS boost_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table listing_boosts
CREATE TABLE IF NOT EXISTS listing_boosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  package_id UUID REFERENCES boost_packages(id),
  user_id UUID REFERENCES users(id),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status boost_status DEFAULT 'active',
  payment_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la table boost_history
CREATE TABLE IF NOT EXISTS boost_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  boost_id UUID REFERENCES listing_boosts(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Activer RLS
ALTER TABLE boost_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_history ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS simples
DROP POLICY IF EXISTS "boost_packages_public_read" ON boost_packages;
CREATE POLICY "boost_packages_public_read" ON boost_packages FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "listing_boosts_owner_access" ON listing_boosts;
CREATE POLICY "listing_boosts_owner_access" ON listing_boosts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "boost_history_owner_access" ON boost_history;
CREATE POLICY "boost_history_owner_access" ON boost_history FOR ALL USING (auth.uid() = user_id);

-- 7. Vider les données existantes (éviter doublons)
-- IMPORTANT: Supprimer dans l'ordre des dépendances
DELETE FROM boost_history;
DELETE FROM listing_boosts;
DELETE FROM boost_packages;

-- 8. Insérer les packages de boost
INSERT INTO boost_packages (name, description, duration_days, price, features, sort_order, is_active) VALUES
('Boost Basique', 'Visibilité améliorée pendant 7 jours', 7, 5000.00, '{"priority": "medium", "badge": "boosted", "featured": false, "analytics": "basic"}', 1, true),
('Boost Premium', 'Mise en avant complète pendant 14 jours', 14, 12000.00, '{"priority": "high", "badge": "boosted", "featured": true, "analytics": "detailed"}', 2, true),
('Boost VIP', 'Visibilité maximale pendant 30 jours', 30, 25000.00, '{"priority": "highest", "badge": "boosted", "featured": true, "analytics": "premium", "support": "priority"}', 3, true),
('Boost Flash', 'Visibilité intensive pendant 3 jours', 3, 3000.00, '{"priority": "high", "badge": "boosted", "featured": false, "analytics": "basic"}', 4, true);

-- 9. Vérifier que les données sont bien insérées
SELECT 'Packages de boost créés:' as info, COUNT(*) as total FROM boost_packages WHERE is_active = true;
