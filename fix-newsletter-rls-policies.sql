-- ============================================================================
-- CORRECTION DES POLITIQUES RLS POUR NEWSLETTER ADMIN
-- ============================================================================

-- 1. Supprimer les anciennes politiques pour email_campaigns
DROP POLICY IF EXISTS "Admins can manage all campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Public can view sent campaigns" ON email_campaigns;

-- 2. Créer les nouvelles politiques pour email_campaigns
-- Politique: Les admins peuvent tout faire
CREATE POLICY "Admins full access to campaigns" ON email_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Politique: Les utilisateurs peuvent voir leurs propres campagnes
CREATE POLICY "Users can view own campaigns" ON email_campaigns
  FOR SELECT
  USING (created_by = auth.uid());

-- 3. Supprimer les anciennes politiques pour newsletter_subscribers
DROP POLICY IF EXISTS "Public read access for newsletter subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public insert access for newsletter subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public update access for newsletter subscribers" ON newsletter_subscribers;

-- 4. Créer les nouvelles politiques pour newsletter_subscribers
-- Politique: Lecture publique (pour vérifier les inscriptions)
CREATE POLICY "Public can read subscribers" ON newsletter_subscribers
  FOR SELECT
  USING (true);

-- Politique: Insertion publique (pour les inscriptions)
CREATE POLICY "Public can insert subscribers" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Politique: Mise à jour publique (pour les désinscriptions)
CREATE POLICY "Public can update subscribers" ON newsletter_subscribers
  FOR UPDATE
  USING (true);

-- Politique: Les admins peuvent tout faire
CREATE POLICY "Admins full access to subscribers" ON newsletter_subscribers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- 5. Vérification
SELECT 
  'Politiques RLS mises à jour' as status,
  COUNT(*) FILTER (WHERE tablename = 'email_campaigns') as policies_campaigns,
  COUNT(*) FILTER (WHERE tablename = 'newsletter_subscribers') as policies_subscribers
FROM pg_policies
WHERE tablename IN ('email_campaigns', 'newsletter_subscribers');

-- 6. Afficher les nouvelles politiques
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'No condition'
  END as condition
FROM pg_policies
WHERE tablename IN ('email_campaigns', 'newsletter_subscribers')
ORDER BY tablename, policyname;
