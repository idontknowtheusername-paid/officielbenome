-- ============================================================================
-- CONFIGURATION DES PAIEMENTS PREMIUM - MAXIMARKET
-- ============================================================================

-- Types pour les statuts de paiement
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('orange_money', 'mtn_mobile_money', 'card', 'refund');
  END IF;
END
$$;

-- Table pour les transactions de paiement
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    CREATE TABLE payments (
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
  END IF;
END
$$;

-- Table pour les reçus
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'receipts') THEN
    CREATE TABLE receipts (
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
  END IF;
END
$$;

-- Index pour améliorer les performances
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_user') THEN
    CREATE INDEX idx_payments_user ON payments(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_status') THEN
    CREATE INDEX idx_payments_status ON payments(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_method') THEN
    CREATE INDEX idx_payments_method ON payments(payment_method);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_created') THEN
    CREATE INDEX idx_payments_created ON payments(created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_receipts_payment') THEN
    CREATE INDEX idx_receipts_payment ON receipts(payment_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_receipts_user') THEN
    CREATE INDEX idx_receipts_user ON receipts(user_id);
  END IF;
END
$$;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_payment_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
    CREATE TRIGGER update_payments_updated_at 
      BEFORE UPDATE ON payments 
      FOR EACH ROW EXECUTE FUNCTION update_payment_updated_at_column();
  END IF;
END
$$;

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
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own payments' AND tablename = 'payments') THEN
    CREATE POLICY "Users can view their own payments" ON payments
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create payments' AND tablename = 'payments') THEN
    CREATE POLICY "Users can create payments" ON payments
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own payments' AND tablename = 'payments') THEN
    CREATE POLICY "Users can update their own payments" ON payments
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Politiques pour receipts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own receipts' AND tablename = 'receipts') THEN
    CREATE POLICY "Users can view their own receipts" ON receipts
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create receipts' AND tablename = 'receipts') THEN
    CREATE POLICY "Users can create receipts" ON receipts
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Politiques pour les admins
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can do everything on payment tables' AND tablename = 'payments') THEN
    CREATE POLICY "Admins can do everything on payment tables" ON payments
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role = 'admin'
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can do everything on receipt tables' AND tablename = 'receipts') THEN
    CREATE POLICY "Admins can do everything on receipt tables" ON receipts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role = 'admin'
        )
      );
  END IF;
END
$$;

-- Commentaires pour la documentation
COMMENT ON TABLE payments IS 'Transactions de paiement pour les boosts premium';
COMMENT ON TABLE receipts IS 'Reçus générés pour les paiements';
COMMENT ON FUNCTION get_payment_stats IS 'Calcule les statistiques de paiement pour un utilisateur ou globalement';

-- ============================================================================
-- CONFIGURATION TERMINÉE
-- ============================================================================
