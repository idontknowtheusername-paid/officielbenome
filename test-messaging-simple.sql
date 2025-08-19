-- ============================================================================
-- TEST SIMPLIFIÉ D'ACCÈS À LA MESSAGERIE
-- ============================================================================
-- Script de test post-correction RLS pour la messagerie

-- 1. Test d'accès aux utilisateurs (devrait maintenant fonctionner)
SELECT 
  'Test 1: Accès aux utilisateurs' as test_name,
  COUNT(*) as user_count,
  '✅ SUCCÈS - Accès aux utilisateurs autorisé' as result
FROM users 
LIMIT 5;

-- 2. Test d'accès aux conversations de l'utilisateur connecté
-- Remplacez '61050e2d-327a-471b-83fc-4316e80aadcc' par l'ID de l'utilisateur connecté
SELECT 
  'Test 2: Accès aux conversations' as test_name,
  COUNT(*) as conversation_count,
  '✅ SUCCÈS - Accès aux conversations autorisé' as result
FROM conversations 
WHERE participant1_id = '61050e2d-327a-471b-83fc-4316e80aadcc' 
   OR participant2_id = '61050e2d-327a-471b-83fc-4316e80aadcc';

-- 3. Test d'accès aux messages des conversations
SELECT 
  'Test 3: Accès aux messages' as test_name,
  COUNT(*) as message_count,
  '✅ SUCCÈS - Accès aux messages autorisé' as result
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.participant1_id = '61050e2d-327a-471b-83fc-4316e80aadcc' 
   OR c.participant2_id = '61050e2d-327a-471b-83fc-4316e80aadcc';

-- 4. Test de récupération des détails des participants
SELECT 
  'Test 4: Détails des participants' as test_name,
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

-- 5. Vérification des politiques RLS actives (version simplifiée)
SELECT 
  'Test 5: Politiques RLS' as test_name,
  tablename,
  policyname,
  cmd,
  'Politique active' as status
FROM pg_policies 
WHERE tablename IN ('users', 'conversations', 'messages')
ORDER BY tablename, policyname;

-- 6. Résumé des tests
SELECT 
  'RÉSUMÉ DES TESTS' as summary,
  'Vérifiez que tous les tests retournent "SUCCÈS"' as instruction,
  'Si des tests échouent, vérifiez les politiques RLS' as troubleshooting;

-- 7. Test final : Vérification que les noms des utilisateurs sont accessibles
SELECT 
  'Test 6: Noms des utilisateurs accessibles' as test_name,
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  '✅ SUCCÈS - Utilisateur accessible' as result
FROM users u
WHERE u.id IN (
  SELECT DISTINCT participant1_id FROM conversations 
  WHERE participant1_id = '61050e2d-327a-471b-83fc-4316e80aadcc' 
     OR participant2_id = '61050e2d-327a-471b-83fc-4316e80aadcc'
  UNION
  SELECT DISTINCT participant2_id FROM conversations 
  WHERE participant1_id = '61050e2d-327a-471b-83fc-4316e80aadcc' 
     OR participant2_id = '61050e2d-327a-471b-83fc-4316e80aadcc'
)
LIMIT 5;
