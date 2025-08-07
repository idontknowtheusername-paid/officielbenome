-- ============================================================================
-- CORRECTION DES RELATIONS MANQUANTES SUPABASE
-- ============================================================================

-- 1. Créer la table categories si elle n'existe pas
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7) DEFAULT '#3B82F6',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table listings si elle n'existe pas (avec relation vers categories)
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'XOF',
  category VARCHAR(100), -- Pour compatibilité avec le code existant
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, archived
  is_featured BOOLEAN DEFAULT false,
  location JSONB,
  images TEXT[], -- Array d'URLs d'images
  videos TEXT[], -- Array d'URLs de vidéos
  contact_info JSONB,
  
  -- Détails spécifiques par type
  real_estate_details JSONB,
  automobile_details JSONB,
  service_details JSONB,
  product_details JSONB,
  
  -- Métadonnées
  metadata JSONB,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  
  -- Timestamps
  expires_at TIMESTAMP WITH TIME ZONE,
  featured_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_price_positive CHECK (price >= 0)
);

-- 3. Insérer des catégories par défaut
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Immobilier', 'real_estate', 'Vente et location de biens immobiliers', 'home', '#10B981'),
  ('Automobile', 'automobile', 'Véhicules neufs et d''occasion', 'car', '#F59E0B'),
  ('Services', 'services', 'Services professionnels et particuliers', 'briefcase', '#8B5CF6'),
  ('Produits', 'marketplace', 'Vente de produits divers', 'shopping-bag', '#EF4444'),
  ('Électronique', 'electronics', 'Appareils électroniques et informatique', 'smartphone', '#3B82F6')
ON CONFLICT (slug) DO NOTHING;

-- 4. Mettre à jour les listings existants pour associer les catégories
UPDATE listings 
SET category_id = (
  CASE 
    WHEN category = 'real_estate' THEN (SELECT id FROM categories WHERE slug = 'real_estate')
    WHEN category = 'automobile' THEN (SELECT id FROM categories WHERE slug = 'automobile')
    WHEN category = 'services' THEN (SELECT id FROM categories WHERE slug = 'services')
    WHEN category = 'marketplace' THEN (SELECT id FROM categories WHERE slug = 'marketplace')
    ELSE (SELECT id FROM categories WHERE slug = 'marketplace')
  END
)
WHERE category_id IS NULL;

-- 5. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings USING GIN(location);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- 6. Activer RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 7. Politiques RLS pour categories (lecture libre)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Categories can be managed by admins" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- 8. Politiques RLS pour listings
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all listings" ON listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- 9. Fonctions pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Fonction pour incrémenter les vues
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET views_count = views_count + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Vérifier que les relations fonctionnent
SELECT 
  l.id, 
  l.title, 
  l.category,
  c.name as category_name,
  c.slug as category_slug
FROM listings l
LEFT JOIN categories c ON l.category_id = c.id
LIMIT 5;