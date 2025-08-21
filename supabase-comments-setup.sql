-- =====================================================
-- SYSTÈME DE COMMENTAIRES ET AVIS - MAXIMARKET
-- =====================================================

-- Table principale des commentaires
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Pour les réponses
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 1000),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Note de 1 à 5
  is_verified_purchase BOOLEAN DEFAULT false, -- Achat vérifié
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les signalements de commentaires
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'fake', 'other')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les commentaires
CREATE INDEX IF NOT EXISTS idx_comments_listing_id ON comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_rating ON comments(rating);

-- Index pour les signalements
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);
CREATE INDEX IF NOT EXISTS idx_comment_reports_reporter_id ON comment_reports(reporter_id);

-- =====================================================
-- TRIGGERS ET FONCTIONS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour comments
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour le compteur de réponses
CREATE OR REPLACE FUNCTION update_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments 
        SET replies_count = replies_count + 1 
        WHERE id = NEW.parent_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments 
        SET replies_count = replies_count - 1 
        WHERE id = OLD.parent_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour le compteur de réponses
CREATE TRIGGER update_replies_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_replies_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur les tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES POUR COMMENTS
-- =====================================================

-- Lecture publique des commentaires approuvés
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (status = 'approved');

-- Création par utilisateurs authentifiés
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Modification par l'auteur du commentaire
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Suppression par l'auteur du commentaire
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Lecture de ses propres commentaires (même en attente)
CREATE POLICY "Users can view own comments" ON comments
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES POUR COMMENT_REPORTS
-- =====================================================

-- Création de signalements par utilisateurs authentifiés
CREATE POLICY "Users can create reports" ON comment_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Lecture de ses propres signalements
CREATE POLICY "Users can view own reports" ON comment_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Lecture de tous les signalements par les admins
CREATE POLICY "Admins can view all reports" ON comment_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour obtenir les statistiques d'une annonce
CREATE OR REPLACE FUNCTION get_listing_comment_stats(listing_uuid UUID)
RETURNS TABLE (
  total_comments INTEGER,
  average_rating NUMERIC,
  verified_purchases INTEGER,
  rating_distribution JSON
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total,
      AVG(rating) as avg_rating,
      COUNT(*) FILTER (WHERE is_verified_purchase = true) as verified,
      json_build_object(
        '1', COUNT(*) FILTER (WHERE rating = 1),
        '2', COUNT(*) FILTER (WHERE rating = 2),
        '3', COUNT(*) FILTER (WHERE rating = 3),
        '4', COUNT(*) FILTER (WHERE rating = 4),
        '5', COUNT(*) FILTER (WHERE rating = 5)
      ) as distribution
    FROM comments 
    WHERE listing_id = listing_uuid AND status = 'approved'
  )
  SELECT 
    stats.total::INTEGER,
    stats.avg_rating::NUMERIC,
    stats.verified::INTEGER,
    stats.distribution::JSON
  FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer quelques commentaires de test si nécessaire
-- (Décommentez si vous voulez des données de test)

/*
INSERT INTO comments (listing_id, user_id, content, rating, status, is_verified_purchase) VALUES
('listing-uuid-1', 'user-uuid-1', 'Excellent produit, je recommande !', 5, 'approved', true),
('listing-uuid-1', 'user-uuid-2', 'Bon rapport qualité-prix', 4, 'approved', false),
('listing-uuid-2', 'user-uuid-1', 'Livraison rapide, très satisfait', 5, 'approved', true);
*/

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que les tables ont été créées
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('comments', 'comment_reports')
ORDER BY table_name, ordinal_position;

-- Vérifier les policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('comments', 'comment_reports');
