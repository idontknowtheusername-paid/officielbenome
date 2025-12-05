-- ============================================================================
-- TEST NEWSLETTER ADMIN - Vérification des tables et permissions
-- ============================================================================

-- 1. Vérifier que les tables existent
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscribers') 
    THEN '✅ Existe'
    ELSE '❌ Manquante'
  END as newsletter_subscribers_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_campaigns') 
    THEN '✅ Existe'
    ELSE '❌ Manquante'
  END as email_campaigns_status
FROM (VALUES ('check')) AS t(table_name);

-- 2. Compter les abonnés newsletter
SELECT 
  'newsletter_subscribers' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as actifs,
  COUNT(*) FILTER (WHERE is_active = false) as inactifs
FROM newsletter_subscribers;

-- 3. Compter les campagnes
SELECT 
  'email_campaigns' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'sent') as envoyees,
  COUNT(*) FILTER (WHERE status = 'draft') as brouillons,
  COUNT(*) FILTER (WHERE status = 'scheduled') as programmees
FROM email_campaigns;

-- 4. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('newsletter_subscribers', 'email_campaigns')
ORDER BY tablename, policyname;

-- 5. Afficher les dernières campagnes
SELECT 
  id,
  type,
  subject,
  status,
  recipient_count,
  created_at,
  sent_at
FROM email_campaigns
ORDER BY created_at DESC
LIMIT 5;

-- 6. Afficher les derniers abonnés
SELECT 
  id,
  email,
  is_active,
  source,
  subscribed_at
FROM newsletter_subscribers
ORDER BY subscribed_at DESC
LIMIT 5;
