-- TEST DIRECT POUR VÉRIFIER LA RÉCUPÉRATION DES UTILISATEURS
-- Exécuter ce script dans Supabase pour voir si le problème vient de la base ou du code

-- ============================================================================
-- 1. TEST DE LECTURE DIRECTE DE LA TABLE USERS
-- ============================================================================

SELECT 
    'TEST 1: Lecture directe de la table users' as test_name,
    COUNT(*) as total_users
FROM users;

-- ============================================================================
-- 2. TEST DE RÉCUPÉRATION DES PARTICIPANTS DE LA CONVERSATION
-- ============================================================================

-- Récupérer les IDs des participants de la conversation test
WITH conversation_test AS (
    SELECT 
        participant1_id,
        participant2_id
    FROM conversations 
    WHERE id = '6bafdc38-7f68-4a4a-be30-cbfe1dbba55e'
    LIMIT 1
)
SELECT 
    'TEST 2: Récupération des participants' as test_name,
    ct.participant1_id,
    ct.participant2_id
FROM conversation_test ct;

-- ============================================================================
-- 3. TEST DE RÉCUPÉRATION DES DÉTAILS DES PARTICIPANTS
-- ============================================================================

-- Récupérer les détails du participant 1
SELECT 
    'TEST 3: Détails du participant 1' as test_name,
    id,
    first_name,
    last_name,
    email,
    avatar_url,
    profile_image
FROM users 
WHERE id = '1b49077e-e6d1-409d-beae-3f1137b1cf84';

-- Récupérer les détails du participant 2
SELECT 
    'TEST 4: Détails du participant 2' as test_name,
    id,
    first_name,
    last_name,
    email,
    avatar_url,
    profile_image
FROM users 
WHERE id = '61050e2d-327a-471b-83fc-4316e80aadcc';

-- ============================================================================
-- 4. TEST DE SIMULATION DE LA REQUÊTE DU SERVICE
-- ============================================================================

-- Simuler exactement la requête du service messageService
SELECT 
    'TEST 5: Simulation de la requête du service' as test_name,
    u.id,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.profile_image
FROM users u
WHERE u.id IN ('1b49077e-e6d1-409d-beae-3f1137b1cf84', '61050e2d-327a-471b-83fc-4316e80aadcc');

-- ============================================================================
-- 5. VÉRIFICATION DES POLITIQUES RLS
-- ============================================================================

SELECT 
    'TEST 6: Vérification des politiques RLS' as test_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd;

-- ============================================================================
-- 6. TEST DE CONNEXION AUTH
-- ============================================================================

-- Vérifier si l'utilisateur actuel peut lire la table users
SELECT 
    'TEST 7: Test de connexion auth' as test_name,
    current_user as current_db_user,
    session_user as session_user,
    current_setting('role') as current_role;

-- Message de fin
DO $$
BEGIN
    RAISE NOTICE '🧪 TESTS TERMINÉS !';
    RAISE NOTICE '🔍 Vérifiez les résultats ci-dessus';
    RAISE NOTICE '📝 Si les tests 3 et 4 retournent des données, le problème est dans le code JavaScript';
    RAISE NOTICE '📝 Si les tests 3 et 4 sont vides, le problème est dans les politiques RLS';
END $$;
