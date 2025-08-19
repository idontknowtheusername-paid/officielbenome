-- ============================================================================
-- TEST D'ACCÈS À LA MESSAGERIE APRÈS CORRECTION RLS
-- ============================================================================
-- Exécutez ce script après avoir appliqué fix-messaging-rls.sql
-- pour vérifier que la messagerie fonctionne correctement

-- 1. Test : Vérifier l'accès aux utilisateurs (devrait maintenant fonctionner)
SELECT 
  'Test accès utilisateurs' as test_name,
  COUNT(*) as user_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ SUCCÈS - Accès aux utilisateurs autorisé'
    ELSE '❌ ÉCHEC - Accès aux utilisateurs bloqué'
  END as result
FROM users 
LIMIT 5;

-- 2. Test : Vérifier l'accès aux conversations de l'utilisateur connecté
-- Remplacez '61050e2d-327a-471b-83fc-4316e80aadcc' par l'ID de l'utilisateur connecté
SELECT 
  'Test accès conversations' as test_name,
  COUNT(*) as conversation_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ SUCCÈS - Accès aux conversations autorisé'
    ELSE '❌ ÉCHEC - Accès aux conversations bloqué'
  END as result
FROM conversations 
WHERE participant1_id = '61050e2d-327a-471b-83fc-4316e80aadcc' 
   OR participant2_id = '61050e2d-327a-471b-83fc-4316e80aadcc';

-- 3. Test : Vérifier l'accès aux messages des conversations
SELECT 
  'Test accès messages' as test_name,
  COUNT(*) as message_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ SUCCÈS - Accès aux messages autorisé'
    ELSE '❌ ÉCHEC - Accès aux messages bloqué'
  END as result
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.participant1_id = '61050e2d-327a-471b-83fc-4316e80aadcc' 
   OR c.participant2_id = '61050e2d-327a-471b-83fc-4316e80aadcc';

-- 4. Test : Vérifier la récupération des détails des participants
SELECT 
  'Test détails participants' as test_name,
  c.id as conversation_id,
  p1.first_name as participant1_name,
  p2.first_name as participant2_name,
  l.title as listing_title,
  CASE 
    WHEN p1.first_name IS NOT NULL AND p2.first_name IS NOT NULL THEN '✅ SUCCÈS - Détails participants récupérés'
    ELSE '❌ ÉCHEC - Détails participants manquants'
  END as result
FROM conversations c
LEFT JOIN users p1 ON c.participant1_id = p1.id
LEFT JOIN users p2 ON c.participant2_id = p2.id
LEFT JOIN listings l ON c.listing_id = l.id
WHERE c.participant1_id = '61050e2d-327a-471b-83fc-4316e80aadcc' 
   OR c.participant2_id = '61050e2d-327a-471b-83fc-4316e80aadcc'
LIMIT 3;

-- 5. Résumé des tests
SELECT 
  'RÉSUMÉ DES TESTS' as summary,
  'Vérifiez que tous les tests retournent "SUCCÈS"' as instruction,
  'Si des tests échouent, vérifiez les politiques RLS' as troubleshooting;

-- 6. Vérification des politiques RLS actives
SELECT 
  'Politiques RLS actives' as check_type,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN 'Permissive'
    ELSE 'Restrictive'
  END as policy_type
FROM pg_policies 
WHERE tablename IN ('users', 'conversations', 'messages')
ORDER BY tablename, policyname;
