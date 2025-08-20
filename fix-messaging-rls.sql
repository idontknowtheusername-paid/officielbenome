-- Script de correction pour le bug "utilisateur inconnu" dans la messagerie
-- Ce script corrige les politiques RLS et vérifie la structure des données

-- ============================================================================
-- 1. VÉRIFICATION DE LA STRUCTURE DE LA TABLE USERS
-- ============================================================================

-- Vérifier que les colonnes nécessaires existent
DO $$
BEGIN
    -- Vérifier si la colonne first_name existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        RAISE EXCEPTION 'La colonne first_name n''existe pas dans la table users';
    END IF;
    
    -- Vérifier si la colonne last_name existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) THEN
        RAISE EXCEPTION 'La colonne last_name n''existe pas dans la table users';
    END IF;
    
    RAISE NOTICE '✅ Structure de la table users vérifiée';
END $$;

-- ============================================================================
-- 2. SUPPRESSION DES ANCIENNES POLITIQUES RLS
-- ============================================================================

-- Supprimer toutes les anciennes politiques sur la table users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view other users basic info" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- ============================================================================
-- 3. CRÉATION DES NOUVELLES POLITIQUES RLS APPROPRIÉES
-- ============================================================================

-- Politique pour permettre à tous les utilisateurs authentifiés de voir les profils des autres
-- (NÉCESSAIRE pour afficher les noms dans les conversations)
CREATE POLICY "Enable read access for all authenticated users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de supprimer leur propre profil
CREATE POLICY "Enable delete for users based on id" ON users
    FOR DELETE USING (auth.uid() = id);

-- ============================================================================
-- 4. VÉRIFICATION DES POLITIQUES CRÉÉES
-- ============================================================================

-- Afficher toutes les politiques sur la table users
SELECT 
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
-- 5. VÉRIFICATION DES DONNÉES UTILISATEURS
-- ============================================================================

-- Vérifier que les utilisateurs ont bien first_name et last_name
SELECT 
    id,
    email,
    first_name,
    last_name,
    CASE 
        WHEN first_name IS NULL OR first_name = '' THEN '❌ MANQUANT'
        ELSE '✅ OK'
    END as first_name_status,
    CASE 
        WHEN last_name IS NULL OR last_name = '' THEN '❌ MANQUANT'
        ELSE '✅ OK'
    END as last_name_status
FROM users 
LIMIT 10;

-- Compter les utilisateurs avec des noms manquants
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN first_name IS NULL OR first_name = '' THEN 1 END) as missing_first_name,
    COUNT(CASE WHEN last_name IS NULL OR last_name = '' THEN 1 END) as missing_last_name
FROM users;

-- ============================================================================
-- 6. VÉRIFICATION DES CONVERSATIONS ET PARTICIPANTS
-- ============================================================================

-- Vérifier les conversations et leurs participants
SELECT 
    c.id as conversation_id,
    c.participant1_id,
    c.participant2_id,
    u1.first_name as p1_first_name,
    u1.last_name as p1_last_name,
    u2.first_name as p2_first_name,
    u2.last_name as p2_last_name,
    c.created_at,
    CASE 
        WHEN u1.first_name IS NULL OR u1.first_name = '' THEN '❌ MANQUANT'
        ELSE '✅ OK'
    END as p1_name_status,
    CASE 
        WHEN u2.first_name IS NULL OR u2.first_name = '' THEN '❌ MANQUANT'
        ELSE '✅ OK'
    END as p2_name_status
FROM conversations c
LEFT JOIN users u1 ON c.participant1_id = u1.id
LEFT JOIN users u2 ON c.participant2_id = u2.id
LIMIT 10;

-- ============================================================================
-- 7. VÉRIFICATION DES MESSAGES ET EXPÉDITEURS
-- ============================================================================

-- Vérifier les messages et leurs expéditeurs
SELECT 
    m.id as message_id,
    m.content,
    m.sender_id,
    u.first_name as sender_first_name,
    u.last_name as sender_last_name,
    m.created_at,
    CASE 
        WHEN u.first_name IS NULL OR u.first_name = '' THEN '❌ MANQUANT'
        ELSE '✅ OK'
    END as sender_name_status
FROM messages m
LEFT JOIN users u ON m.sender_id = u.id
LIMIT 10;

-- ============================================================================
-- 8. CORRECTION DES UTILISATEURS AVEC NOMS MANQUANTS
-- ============================================================================

-- Mettre à jour les utilisateurs avec des noms manquants (utiliser l'email comme fallback)
UPDATE users 
SET 
    first_name = COALESCE(first_name, SPLIT_PART(email, '@', 1)),
    last_name = COALESCE(last_name, 'Utilisateur')
WHERE 
    (first_name IS NULL OR first_name = '') 
    OR (last_name IS NULL OR last_name = '');

-- Vérifier le résultat de la correction
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN first_name IS NULL OR first_name = '' THEN 1 END) as missing_first_name,
    COUNT(CASE WHEN last_name IS NULL OR last_name = '' THEN 1 END) as missing_last_name
FROM users;

-- ============================================================================
-- 9. TEST DES REQUÊTES SIMILAIRES À CELLES DU SERVICE
-- ============================================================================

-- Simuler la requête du service messageService.getUserConversations()
-- pour récupérer les participants d'une conversation
WITH test_conversation AS (
    SELECT id, participant1_id, participant2_id 
    FROM conversations 
    LIMIT 1
)
SELECT 
    tc.id as conversation_id,
    tc.participant1_id,
    tc.participant2_id,
    u1.first_name as p1_first_name,
    u1.last_name as p1_last_name,
    u2.first_name as p2_first_name,
    u2.last_name as p2_last_name
FROM test_conversation tc
LEFT JOIN users u1 ON tc.participant1_id = u1.id
LEFT JOIN users u2 ON tc.participant2_id = u2.id;

-- ============================================================================
-- 10. RÉSUMÉ ET RECOMMANDATIONS
-- ============================================================================

-- Afficher un résumé de l'état de la base
SELECT 
    'RÉSUMÉ DE LA CORRECTION' as section,
    'Politiques RLS créées' as item,
    COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'users'
UNION ALL
SELECT 
    'RÉSUMÉ DE LA CORRECTION' as section,
    'Utilisateurs avec noms complets' as item,
    COUNT(*) as count
FROM users 
WHERE first_name IS NOT NULL AND first_name != '' 
  AND last_name IS NOT NULL AND last_name != '';

-- Message de fin
DO $$
BEGIN
    RAISE NOTICE '✅ Script de correction terminé avec succès !';
    RAISE NOTICE '🔍 Vérifiez maintenant que les noms s''affichent correctement dans la messagerie';
    RAISE NOTICE '📝 Si le problème persiste, vérifiez la console du navigateur pour les erreurs';
END $$;
