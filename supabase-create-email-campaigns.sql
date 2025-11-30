-- ============================================================================
-- TABLE EMAIL_CAMPAIGNS - Gestion des campagnes email
-- ============================================================================

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  data JSONB DEFAULT '{}'::jsonb,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft',
  recipient_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_type ON email_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);

-- Activer RLS (Row Level Security)
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Politique: Les admins peuvent tout faire
CREATE POLICY "Admins can manage campaigns" ON email_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role IN ('admin', 'superadmin')
    )
  );

-- Politique: Lecture publique des campagnes envoyées (pour stats)
CREATE POLICY "Public can view sent campaigns" ON email_campaigns
  FOR SELECT
  USING (status = 'sent');

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER trigger_update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_email_campaigns_updated_at();

-- Commentaires
COMMENT ON TABLE email_campaigns IS 'Campagnes email envoyées via Brevo';
COMMENT ON COLUMN email_campaigns.type IS 'Type de campagne (weeklyNewsletter, monthlyNewsletter, specialOffer, etc.)';
COMMENT ON COLUMN email_campaigns.status IS 'Statut: draft, scheduled, sending, sent, failed';
COMMENT ON COLUMN email_campaigns.data IS 'Données JSON de la campagne (paramètres du template)';
COMMENT ON COLUMN email_campaigns.recipient_count IS 'Nombre de destinataires';

-- Insérer quelques données de test (optionnel)
INSERT INTO email_campaigns (type, subject, status, recipient_count, sent_at, data)
VALUES 
  ('weeklyNewsletter', 'Newsletter hebdomadaire - Semaine du 25 novembre', 'sent', 7, NOW() - INTERVAL '2 days', 
   '{"weekStart": "25 novembre 2024", "newListings": "150+", "activeUsers": "2.5k"}'::jsonb),
  ('specialOffer', 'Offre spéciale Black Friday', 'sent', 7, NOW() - INTERVAL '5 days',
   '{"discount": "30%", "code": "BLACKFRIDAY30", "expiryDate": "30 novembre 2024"}'::jsonb),
  ('monthlyNewsletter', 'Bilan mensuel - Novembre 2024', 'draft', 0, NULL,
   '{"month": "Novembre 2024", "totalListings": "1250", "totalUsers": "5200"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Afficher le résultat
SELECT 
  'email_campaigns' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_campaigns,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_campaigns
FROM email_campaigns;
