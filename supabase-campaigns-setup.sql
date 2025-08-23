-- ============================================================================
-- SETUP TABLE CAMPAGNES EMAIL - MAXIMARKET
-- ============================================================================

-- Créer la table des campagnes email
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  data JSONB DEFAULT '{}',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_email_campaigns_type ON email_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_date ON email_campaigns(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);

-- Créer la table des logs d'envoi
CREATE TABLE IF NOT EXISTS email_campaign_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  sendgrid_message_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'
);

-- Index pour les logs
CREATE INDEX IF NOT EXISTS idx_email_campaign_logs_campaign_id ON email_campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_logs_email ON email_campaign_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_campaign_logs_status ON email_campaign_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_campaign_logs_sent_at ON email_campaign_logs(sent_at);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour email_campaigns
CREATE TRIGGER update_email_campaigns_updated_at 
  BEFORE UPDATE ON email_campaigns 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour incrémenter les compteurs de campagne
CREATE OR REPLACE FUNCTION increment_campaign_counter()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter le compteur approprié selon le statut
  IF NEW.status = 'sent' THEN
    UPDATE email_campaigns 
    SET recipient_count = recipient_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF NEW.status = 'opened' THEN
    UPDATE email_campaigns 
    SET open_count = open_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF NEW.status = 'clicked' THEN
    UPDATE email_campaigns 
    SET click_count = click_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF NEW.status = 'bounced' THEN
    UPDATE email_campaigns 
    SET bounce_count = bounce_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF NEW.status = 'unsubscribed' THEN
    UPDATE email_campaigns 
    SET unsubscribe_count = unsubscribe_count + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour les logs
CREATE TRIGGER increment_campaign_counters
  AFTER INSERT ON email_campaign_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_campaign_counter();

-- RLS (Row Level Security) pour email_campaigns
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (peuvent tout faire)
CREATE POLICY "Admins can manage all campaigns" ON email_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Politique pour les créateurs (peuvent voir et modifier leurs campagnes)
CREATE POLICY "Users can manage their own campaigns" ON email_campaigns
  FOR ALL USING (
    created_by = auth.uid()
  );

-- RLS pour email_campaign_logs
ALTER TABLE email_campaign_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins
CREATE POLICY "Admins can view all campaign logs" ON email_campaign_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Fonction pour obtenir les statistiques des campagnes
CREATE OR REPLACE FUNCTION get_campaign_stats()
RETURNS TABLE (
  total_campaigns BIGINT,
  sent_campaigns BIGINT,
  draft_campaigns BIGINT,
  scheduled_campaigns BIGINT,
  failed_campaigns BIGINT,
  total_recipients BIGINT,
  total_opens BIGINT,
  total_clicks BIGINT,
  total_bounces BIGINT,
  total_unsubscribes BIGINT,
  avg_open_rate DECIMAL,
  avg_click_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_campaigns,
    COUNT(*) FILTER (WHERE status = 'sent')::BIGINT as sent_campaigns,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft_campaigns,
    COUNT(*) FILTER (WHERE status = 'scheduled')::BIGINT as scheduled_campaigns,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_campaigns,
    COALESCE(SUM(recipient_count), 0)::BIGINT as total_recipients,
    COALESCE(SUM(open_count), 0)::BIGINT as total_opens,
    COALESCE(SUM(click_count), 0)::BIGINT as total_clicks,
    COALESCE(SUM(bounce_count), 0)::BIGINT as total_bounces,
    COALESCE(SUM(unsubscribe_count), 0)::BIGINT as total_unsubscribes,
    CASE 
      WHEN SUM(recipient_count) > 0 THEN 
        ROUND((SUM(open_count)::DECIMAL / SUM(recipient_count)::DECIMAL) * 100, 2)
      ELSE 0 
    END as avg_open_rate,
    CASE 
      WHEN SUM(recipient_count) > 0 THEN 
        ROUND((SUM(click_count)::DECIMAL / SUM(recipient_count)::DECIMAL) * 100, 2)
      ELSE 0 
    END as avg_click_rate
  FROM email_campaigns;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les anciens logs (plus de 90 jours)
CREATE OR REPLACE FUNCTION cleanup_old_campaign_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM email_campaign_logs 
  WHERE sent_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un job pour nettoyer automatiquement les anciens logs
-- (À configurer dans Supabase Dashboard > Database > Functions)

-- Insérer des données de test
INSERT INTO email_campaigns (type, subject, data, status, recipient_count, open_count, click_count) VALUES
('weeklyNewsletter', 'Votre résumé MaxiMarket de la semaine', '{"weekStart": "1er janvier 2024", "newListings": "150+", "activeUsers": "2.5k"}', 'sent', 150, 117, 35),
('specialOffer', 'Offre spéciale -20% sur tous les services', '{"discount": "20%", "code": "NEWSLETTER20", "expiryDate": "31 décembre 2024"}', 'sent', 320, 208, 144),
('monthlyNewsletter', 'Rapport mensuel MaxiMarket - Janvier 2024', '{"month": "Janvier 2024", "totalListings": "1,250", "totalUsers": "5,200"}', 'draft', 0, 0, 0),
('reengagementCampaign', 'On vous a manqué sur MaxiMarket !', '{"firstName": "John", "daysInactive": "30 jours", "newListings": "500"}', 'scheduled', 0, 0, 0);

-- Insérer des logs de test
INSERT INTO email_campaign_logs (campaign_id, email, status, sendgrid_message_id) 
SELECT 
  ec.id,
  'test' || generate_series(1, 10) || '@example.com',
  CASE (random() * 4)::INT
    WHEN 0 THEN 'sent'
    WHEN 1 THEN 'opened'
    WHEN 2 THEN 'clicked'
    WHEN 3 THEN 'bounced'
    ELSE 'unsubscribed'
  END,
  'msg_' || generate_series(1, 10)
FROM email_campaigns ec
WHERE ec.status = 'sent'
LIMIT 50;

-- Afficher les statistiques de test
SELECT * FROM get_campaign_stats();

-- ============================================================================
-- FIN DU SETUP
-- ============================================================================
