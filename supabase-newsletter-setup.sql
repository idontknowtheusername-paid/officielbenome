-- ============================================================================
-- CONFIGURATION NEWSLETTER - MAXIMARKET
-- ============================================================================

-- Table pour les abonnés à la newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'footer', -- footer, popup, landing, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_source ON newsletter_subscribers(source);

-- RLS (Row Level Security)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique (pour vérifier les inscriptions)
CREATE POLICY "Public read access for newsletter subscribers" ON newsletter_subscribers
  FOR SELECT USING (true);

-- Politique : Insertion publique (pour les inscriptions)
CREATE POLICY "Public insert access for newsletter subscribers" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Politique : Mise à jour publique (pour les désinscriptions)
CREATE POLICY "Public update access for newsletter subscribers" ON newsletter_subscribers
  FOR UPDATE USING (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_newsletter_updated_at_trigger
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- Fonction pour obtenir les statistiques de la newsletter
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS TABLE (
  total_subscribers BIGINT,
  active_subscribers BIGINT,
  inactive_subscribers BIGINT,
  this_month_subscribers BIGINT,
  this_week_subscribers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_subscribers,
    COUNT(*) FILTER (WHERE is_active = true) as active_subscribers,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_subscribers,
    COUNT(*) FILTER (WHERE subscribed_at >= date_trunc('month', NOW())) as this_month_subscribers,
    COUNT(*) FILTER (WHERE subscribed_at >= date_trunc('week', NOW())) as this_week_subscribers
  FROM newsletter_subscribers;
END;
$$ LANGUAGE plpgsql;

-- Données de test (optionnel)
INSERT INTO newsletter_subscribers (email, source) VALUES
  ('test1@maximarket.com', 'footer'),
  ('test2@maximarket.com', 'popup'),
  ('test3@maximarket.com', 'landing')
ON CONFLICT (email) DO NOTHING;

-- Vérification de la configuration
SELECT 'Newsletter setup completed successfully!' as status;
