-- ============================================================================
-- MISE À JOUR DES TABLES DE BOOST POUR LYGOS
-- ============================================================================
-- Ce script ajoute les colonnes nécessaires pour l'intégration Lygos

-- 1. Ajouter les colonnes de paiement Lygos à listing_boosts
DO $$ 
BEGIN
  -- Ajouter payment_reference si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_boosts' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE listing_boosts ADD COLUMN payment_reference VARCHAR(255);
    CREATE INDEX idx_listing_boosts_payment_ref ON listing_boosts(payment_reference);
  END IF;

  -- Ajouter payment_amount si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_boosts' AND column_name = 'payment_amount'
  ) THEN
    ALTER TABLE listing_boosts ADD COLUMN payment_amount DECIMAL(10,2);
  END IF;

  -- Ajouter payment_currency si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_boosts' AND column_name = 'payment_currency'
  ) THEN
    ALTER TABLE listing_boosts ADD COLUMN payment_currency VARCHAR(10) DEFAULT 'XOF';
  END IF;

  -- Ajouter payment_method si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_boosts' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE listing_boosts ADD COLUMN payment_method VARCHAR(50);
  END IF;

  -- Ajouter payment_status si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_boosts' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE listing_boosts ADD COLUMN payment_status VARCHAR(50);
  END IF;

  -- Ajouter refund_reference si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_boosts' AND column_name = 'refund_reference'
  ) THEN
    ALTER TABLE listing_boosts ADD COLUMN refund_reference VARCHAR(255);
  END IF;

  -- Ajouter refunded_at si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_boosts' AND column_name = 'refunded_at'
  ) THEN
    ALTER TABLE listing_boosts ADD COLUMN refunded_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Ajouter metadata si elle n'existe pas (pour stocker des infos supplémentaires)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_boosts' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE listing_boosts ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 2. Mettre à jour le type enum boost_status pour inclure 'failed' et 'refunded'
DO $$
BEGIN
  -- Ajouter 'failed' si pas déjà présent
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'failed' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'boost_status')
  ) THEN
    ALTER TYPE boost_status ADD VALUE 'failed';
  END IF;
  
  -- Ajouter 'refunded' si pas déjà présent
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'refunded' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'boost_status')
  ) THEN
    ALTER TYPE boost_status ADD VALUE 'refunded';
  END IF;
END $$;

-- 3. Créer une vue pour les statistiques de paiement
CREATE OR REPLACE VIEW boost_payment_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_boosts,
  COUNT(CASE WHEN status::text = 'active' THEN 1 END) as active_boosts,
  COUNT(CASE WHEN status::text = 'pending' THEN 1 END) as pending_boosts,
  COUNT(CASE WHEN status::text = 'failed' THEN 1 END) as failed_boosts,
  COUNT(CASE WHEN status::text = 'refunded' THEN 1 END) as refunded_boosts,
  SUM(CASE WHEN status::text = 'active' THEN payment_amount ELSE 0 END) as total_revenue,
  AVG(CASE WHEN status::text = 'active' THEN payment_amount END) as avg_payment
FROM listing_boosts
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- 4. Créer une fonction pour enregistrer l'historique des paiements
CREATE OR REPLACE FUNCTION log_boost_payment_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Enregistrer dans boost_history
  INSERT INTO boost_history (
    listing_id,
    boost_id,
    user_id,
    action,
    details,
    created_at
  ) VALUES (
    NEW.listing_id,
    NEW.id,
    NEW.user_id,
    CASE 
      WHEN NEW.status::text = 'active' AND OLD.status::text = 'pending' THEN 'payment_successful'
      WHEN NEW.status::text = 'failed' THEN 'payment_failed'
      WHEN NEW.status::text = 'refunded' THEN 'payment_refunded'
      ELSE 'status_changed'
    END,
    jsonb_build_object(
      'old_status', OLD.status::text,
      'new_status', NEW.status::text,
      'payment_reference', NEW.payment_reference,
      'payment_amount', NEW.payment_amount,
      'payment_method', NEW.payment_method
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le trigger pour l'historique
DROP TRIGGER IF EXISTS boost_payment_history_trigger ON listing_boosts;
CREATE TRIGGER boost_payment_history_trigger
  AFTER UPDATE ON listing_boosts
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_boost_payment_event();

-- 6. Créer une fonction pour nettoyer les boosts expirés
CREATE OR REPLACE FUNCTION cleanup_expired_boosts()
RETURNS void AS $$
BEGIN
  -- Mettre à jour les boosts expirés
  UPDATE listing_boosts
  SET status = 'expired'::boost_status
  WHERE status::text = 'active' 
    AND end_date < NOW();
  
  -- Mettre à jour les annonces correspondantes
  UPDATE listings l
  SET 
    is_boosted = false,
    boost_expires_at = NULL
  WHERE EXISTS (
    SELECT 1 FROM listing_boosts lb
    WHERE lb.listing_id = l.id
      AND lb.status::text = 'expired'
      AND l.is_boosted = true
  );
END;
$$ LANGUAGE plpgsql;

-- 7. Créer une fonction pour obtenir les statistiques Lygos
CREATE OR REPLACE FUNCTION get_lygos_payment_stats(
  start_date TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE (
  total_payments BIGINT,
  successful_payments BIGINT,
  failed_payments BIGINT,
  pending_payments BIGINT,
  refunded_payments BIGINT,
  total_revenue NUMERIC,
  avg_payment NUMERIC,
  payment_methods JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH payment_counts AS (
    SELECT 
      COUNT(*)::BIGINT as total,
      COUNT(CASE WHEN status::text = 'active' THEN 1 END)::BIGINT as successful,
      COUNT(CASE WHEN status::text = 'failed' THEN 1 END)::BIGINT as failed,
      COUNT(CASE WHEN status::text = 'pending' THEN 1 END)::BIGINT as pending,
      COUNT(CASE WHEN status::text = 'refunded' THEN 1 END)::BIGINT as refunded,
      COALESCE(SUM(CASE WHEN status::text = 'active' THEN payment_amount END), 0) as revenue,
      COALESCE(AVG(CASE WHEN status::text = 'active' THEN payment_amount END), 0) as avg_pay
    FROM listing_boosts
    WHERE created_at BETWEEN get_lygos_payment_stats.start_date AND get_lygos_payment_stats.end_date
  ),
  method_counts AS (
    SELECT 
      jsonb_object_agg(
        COALESCE(payment_method, 'unknown'),
        method_count
      ) as methods
    FROM (
      SELECT 
        payment_method,
        COUNT(*)::BIGINT as method_count
      FROM listing_boosts
      WHERE created_at BETWEEN get_lygos_payment_stats.start_date AND get_lygos_payment_stats.end_date
        AND payment_method IS NOT NULL
      GROUP BY payment_method
    ) method_data
  )
  SELECT 
    pc.total,
    pc.successful,
    pc.failed,
    pc.pending,
    pc.refunded,
    pc.revenue,
    pc.avg_pay,
    COALESCE(mc.methods, '{}'::jsonb)
  FROM payment_counts pc
  CROSS JOIN method_counts mc;
END;
$$ LANGUAGE plpgsql;

-- 8. Vérifier la structure mise à jour
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'listing_boosts'
  AND column_name IN (
    'payment_reference',
    'payment_amount',
    'payment_currency',
    'payment_method',
    'payment_status',
    'refund_reference',
    'refunded_at',
    'metadata'
  )
ORDER BY ordinal_position;

-- 9. Afficher les statistiques actuelles
SELECT * FROM get_lygos_payment_stats();

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================
-- 
-- 1. Nettoyer les boosts expirés :
--    SELECT cleanup_expired_boosts();
-- 
-- 2. Obtenir les statistiques des 7 derniers jours :
--    SELECT * FROM get_lygos_payment_stats(NOW() - INTERVAL '7 days', NOW());
-- 
-- 3. Voir l'historique d'un boost :
--    SELECT * FROM boost_history WHERE boost_id = 'uuid-here' ORDER BY created_at DESC;
-- 
-- 4. Voir les paiements Lygos récents :
--    SELECT 
--      payment_reference,
--      payment_amount,
--      payment_method,
--      status,
--      created_at
--    FROM listing_boosts
--    WHERE payment_reference IS NOT NULL
--    ORDER BY created_at DESC
--    LIMIT 20;
-- 
-- ============================================================================

COMMENT ON COLUMN listing_boosts.payment_reference IS 'Référence du paiement Lygos';
COMMENT ON COLUMN listing_boosts.payment_amount IS 'Montant payé via Lygos';
COMMENT ON COLUMN listing_boosts.payment_currency IS 'Devise du paiement (XOF, EUR, USD)';
COMMENT ON COLUMN listing_boosts.payment_method IS 'Méthode de paiement utilisée (Mobile Money, Carte, etc.)';
COMMENT ON COLUMN listing_boosts.refund_reference IS 'Référence du remboursement Lygos';
COMMENT ON COLUMN listing_boosts.metadata IS 'Métadonnées supplémentaires du paiement';
