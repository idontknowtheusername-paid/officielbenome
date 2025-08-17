-- ============================================================================
-- CONFIGURATION DES PAIEMENTS PREMIUM - MAXIMARKET
-- ============================================================================

-- Types pour les statuts de paiement
CREATE TYPE IF NOT EXISTS payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE IF NOT EXISTS payment_method AS ENUM ('orange_money', 'mtn_mobile_money', 'card', 'refund');

-- Table pour les transactions de paiement
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  payment_method payment_method NOT NULL,
  payment_gateway VARCHAR(50) NOT NULL,
  status payment_status DEFAULT 'pending',
  metadata JSONB, -- {boost_id, package_name, listing_id, description, phone_number, card_data, etc.}
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les reçus
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  status VARCHAR(20) DEFAULT 'generated',
  file_url VARCHAR(500),
  metadata JSONB, -- {transaction_id, payment_method, generated_at}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_receipts_payment ON receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_payment_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER IF NOT EXISTS update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at_column();

-- Fonction pour calculer les statistiques de paiement
CREATE OR REPLACE FUNCTION get_payment_stats(user_id_param UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_payments', COUNT(*),
    'total_amount', COALESCE(SUM(amount), 0),
    'success_rate', CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0 
    END,
    'average_amount', CASE 
      WHEN COUNT(*) FILTER (WHERE status = 'completed') > 0 THEN 
        ROUND(SUM(amount) FILTER (WHERE status = 'completed') / COUNT(*) FILTER (WHERE status = 'completed'), 2)
      ELSE 0 
    END,
    'completed_payments', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending_payments', COUNT(*) FILTER (WHERE status = 'pending'),
    'failed_payments', COUNT(*) FILTER (WHERE status = 'failed'),
    'refunded_payments', COUNT(*) FILTER (WHERE status = 'refunded')
  ) INTO result
  FROM payments
  WHERE (user_id_param IS NULL OR user_id = user_id_param);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Politiques RLS pour les nouvelles tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Politiques pour payments
CREATE POLICY IF NOT EXISTS "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour receipts
CREATE POLICY IF NOT EXISTS "Users can view their own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create receipts" ON receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les admins
CREATE POLICY IF NOT EXISTS "Admins can do everything on payment tables" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can do everything on receipt tables" ON receipts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Commentaires pour la documentation
COMMENT ON TABLE payments IS 'Transactions de paiement pour les boosts premium';
COMMENT ON TABLE receipts IS 'Reçus générés pour les paiements';
COMMENT ON FUNCTION get_payment_stats IS 'Calcule les statistiques de paiement pour un utilisateur ou globalement';

-- ============================================================================
-- CONFIGURATION TERMINÉE
-- ============================================================================
