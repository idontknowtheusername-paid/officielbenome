-- ============================================================================
-- TABLES MANQUANTES POUR SUPABASE
-- ============================================================================

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'purchase', -- purchase, subscription, refund
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(100),
  payment_reference VARCHAR(255),
  description TEXT,
  reason TEXT,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rapports/signalements (existe déjà - commenté)
-- CREATE TABLE IF NOT EXISTS reports (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
--   listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
--   type VARCHAR(50) NOT NULL, -- listing, user, comment, review
--   reason VARCHAR(255) NOT NULL,
--   description TEXT,
--   severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high
--   status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, ignored
--   moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
--   moderated_at TIMESTAMP WITH TIME ZONE,
--   moderator_reason TEXT,
--   evidence JSONB,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Table des logs de modération
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- approve, reject, ignore, delete
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des statistiques (pour le cache)
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES POUR LES PERFORMANCES
-- ============================================================================

-- Index pour les transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Index pour les rapports (si la table existe)
-- CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
-- CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON reports(listing_id);
-- CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
-- CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
-- CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Index pour les logs de modération
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator_id ON moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_report_id ON moderation_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at);

-- Index pour le cache analytics
CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(key);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires_at ON analytics_cache(expires_at);

-- ============================================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY; -- Table existe déjà
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Politiques pour les transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Politiques pour les rapports (si la table existe)
-- CREATE POLICY "Users can view their own reports" ON reports
--   FOR SELECT USING (auth.uid() = reporter_id);

-- CREATE POLICY "Users can create reports" ON reports
--   FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- CREATE POLICY "Admins can view all reports" ON reports
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );

-- CREATE POLICY "Admins can update reports" ON reports
--   FOR UPDATE USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );

-- Politiques pour les logs de modération
CREATE POLICY "Admins can view moderation logs" ON moderation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can create moderation logs" ON moderation_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Politiques pour le cache analytics
CREATE POLICY "Admins can manage analytics cache" ON analytics_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_reports_updated_at 
--   BEFORE UPDATE ON reports 
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un log de modération
CREATE OR REPLACE FUNCTION create_moderation_log()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO moderation_logs (
      moderator_id,
      report_id,
      action,
      reason
    ) VALUES (
      NEW.moderator_id,
      NEW.id,
      NEW.status,
      NEW.moderator_reason
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour les logs de modération (si la table reports existe)
-- CREATE TRIGGER create_moderation_log_trigger
--   AFTER UPDATE ON reports
--   FOR EACH ROW EXECUTE FUNCTION create_moderation_log();

-- ============================================================================
-- DONNÉES DE TEST
-- ============================================================================

-- Note: Les données de test peuvent être ajoutées manuellement via l'interface ou les services
-- Une fois que vous avez des utilisateurs et listings dans votre base de données,
-- vous pouvez insérer des transactions de test via l'application ou directement en SQL.

-- Insérer quelques rapports de test (si la table reports existe)
-- INSERT INTO reports (reporter_id, listing_id, type, reason, description, severity) VALUES
--   ((SELECT id FROM users LIMIT 1), (SELECT id FROM listings LIMIT 1), 'listing', 'Contenu inapproprié', 'Cette annonce contient du contenu inapproprié', 'high'),
--   ((SELECT id FROM users LIMIT 1), (SELECT id FROM listings LIMIT 1), 'listing', 'Prix incorrect', 'Le prix semble incorrect pour ce type de produit', 'medium'); 