-- SCRIPT DE CORRECTION D'URGENCE POUR LES POLITIQUES RLS
-- Ce script corrige immédiatement le problème "utilisateur inconnu"

-- ============================================================================
-- 1. SUPPRESSION IMMÉDIATE DE TOUTES LES POLITIQUES RLS SUR USERS
-- ============================================================================

-- Supprimer TOUTES les politiques existantes sur la table users
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

-- ============================================================================
-- 2. CRÉATION DE POLITIQUES RLS SIMPLES ET PERMISSIVES
-- ============================================================================

-- POLITIQUE 1: Permettre à TOUS les utilisateurs authentifiés de LIRE les profils
-- (NÉCESSAIRE pour la messagerie)
CREATE POLICY "Allow all authenticated users to read user profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- POLITIQUE 2: Permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Allow users to create their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- POLITIQUE 3: Permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Allow users to update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- POLITIQUE 4: Permettre aux utilisateurs de supprimer leur propre profil
CREATE POLICY "Allow users to delete their own profile" ON users
    FOR DELETE USING (auth.uid() = id);

-- ============================================================================
-- 3. VÉRIFICATION QUE RLS EST ACTIVÉ
-- ============================================================================

-- S'assurer que RLS est activé sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. TEST IMMÉDIAT DES POLITIQUES
-- ============================================================================

-- Vérifier que les politiques sont créées
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
-- 5. CORRECTION DES NOMS MANQUANTS (SI NÉCESSAIRE)
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
-- 6. VÉRIFICATION FINALE
-- ============================================================================

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
    RAISE NOTICE '🚨 CORRECTION D''URGENCE TERMINÉE !';
    RAISE NOTICE '✅ Toutes les anciennes politiques supprimées';
    RAISE NOTICE '✅ Nouvelles politiques simples créées';
    RAISE NOTICE '🔍 Testez maintenant la messagerie !';
END $$;
