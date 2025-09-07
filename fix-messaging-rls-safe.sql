-- SCRIPT DE CORRECTION SÉCURISÉ POUR LES POLITIQUES RLS
-- Ce script gère les politiques existantes et corrige le problème "utilisateur inconnu"

-- ============================================================================
-- 1. SUPPRESSION SÉCURISÉE DES ANCIENNES POLITIQUES
-- ============================================================================

-- Supprimer les politiques existantes (sans erreur si elles n'existent pas)
DO $$ 
BEGIN
    -- Supprimer les anciennes politiques
    DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON users;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
    DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
    DROP POLICY IF EXISTS "Enable delete for users based on id" ON users;
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can view other users basic info" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    DROP POLICY IF EXISTS "Enable read access for all users" ON users;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
    DROP POLICY IF EXISTS "Allow all authenticated users to read user profiles" ON users;
    DROP POLICY IF EXISTS "Allow users to create their own profile" ON users;
    DROP POLICY IF EXISTS "Allow users to update their own profile" ON users;
    DROP POLICY IF EXISTS "Allow users to delete their own profile" ON users;
    
    RAISE NOTICE '✅ Anciennes politiques supprimées avec succès';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Certaines politiques n''existaient pas (normal)';
END $$;

-- ============================================================================
-- 2. CRÉATION DE NOUVELLES POLITIQUES RLS OPTIMISÉES
-- ============================================================================

-- POLITIQUE 1: Permettre à TOUS les utilisateurs authentifiés de LIRE les profils
CREATE POLICY "messaging_users_read_policy" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- POLITIQUE 2: Permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "messaging_users_insert_policy" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- POLITIQUE 3: Permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "messaging_users_update_policy" ON users
    FOR UPDATE USING (auth.uid() = id);

-- POLITIQUE 4: Permettre aux utilisateurs de supprimer leur propre profil
CREATE POLICY "messaging_users_delete_policy" ON users
    FOR DELETE USING (auth.uid() = id);

-- ============================================================================
-- 3. POLITIQUES POUR LES CONVERSATIONS
-- ============================================================================

-- Supprimer les anciennes politiques sur conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

-- Créer les nouvelles politiques pour conversations
CREATE POLICY "messaging_conversations_read_policy" ON conversations
    FOR SELECT USING (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

CREATE POLICY "messaging_conversations_insert_policy" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

CREATE POLICY "messaging_conversations_update_policy" ON conversations
    FOR UPDATE USING (
        auth.uid() = participant1_id OR 
        auth.uid() = participant2_id
    );

-- ============================================================================
-- 4. POLITIQUES POUR LES MESSAGES
-- ============================================================================

-- Supprimer les anciennes politiques sur messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Créer les nouvelles politiques pour messages
CREATE POLICY "messaging_messages_read_policy" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

CREATE POLICY "messaging_messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "messaging_messages_update_policy" ON messages
    FOR UPDATE USING (
        auth.uid() = sender_id
    );

-- ============================================================================
-- 5. S'ASSURER QUE RLS EST ACTIVÉ
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CORRECTION DES NOMS D'UTILISATEURS MANQUANTS
-- ============================================================================

-- Mettre à jour les utilisateurs avec des noms manquants
UPDATE users 
SET 
    first_name = COALESCE(first_name, SPLIT_PART(email, '@', 1)),
    last_name = COALESCE(last_name, 'Utilisateur')
WHERE 
    (first_name IS NULL OR first_name = '') 
    OR (last_name IS NULL OR last_name = '');

-- ============================================================================
-- 7. VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que les politiques sont créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('users', 'conversations', 'messages')
ORDER BY tablename, cmd;

-- Compter les utilisateurs avec des noms complets
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 1 END) as with_first_name,
    COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as with_last_name,
    COUNT(CASE WHEN first_name IS NOT NULL AND first_name != '' AND last_name IS NOT NULL AND last_name != '' THEN 1 END) as complete_names
FROM users;

-- Message de fin
DO $$
BEGIN
    RAISE NOTICE '🎉 CORRECTION SÉCURISÉE TERMINÉE !';
    RAISE NOTICE '✅ Politiques RLS mises à jour';
    RAISE NOTICE '✅ Noms d''utilisateurs corrigés';
    RAISE NOTICE '🔍 Testez maintenant la messagerie !';
END $$;
