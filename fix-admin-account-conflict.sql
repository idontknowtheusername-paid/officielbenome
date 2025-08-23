-- ============================================================================
-- CORRECTION DU CONFLIT COMPTE ADMIN - OFFICIEL BENOME
-- ============================================================================
-- Ce script résout le conflit entre l'insertion manuelle et le trigger automatique

-- ============================================================================
-- 1. SUPPRIMER L'UTILISATEUR EXISTANT POUR ÉVITER LE CONFLIT
-- ============================================================================

-- Supprimer l'utilisateur admin existant (s'il existe)
DELETE FROM users 
WHERE email = 'adminmaximarket@gmail.com';

-- Supprimer l'utilisateur modérateur existant (s'il existe)
DELETE FROM users 
WHERE email = 'moderateur.maximarket@gmail.com';

-- ============================================================================
-- 2. VÉRIFIER LA SUPPRESSION
-- ============================================================================

-- Vérifier que les utilisateurs ont été supprimés
SELECT 
    'Utilisateurs supprimés' as action,
    COUNT(*) as nombre_utilisateurs_restants
FROM users 
WHERE email IN ('adminmaximarket@gmail.com', 'moderateur.maximarket@gmail.com');

-- ============================================================================
-- 3. MAINTENANT VOUS POUVEZ CRÉER LES COMPTES D'AUTHENTIFICATION
-- ============================================================================
-- 
-- Étapes à suivre :
-- 1. Allez dans Supabase > Authentication > Users
-- 2. Cliquez sur "Add User"
-- 3. Créez le compte admin :
--    - Email: adminmaximarket@gmail.com
--    - Password: AdminMaxiMarket2024!
--    - Cochez "Email confirm"
-- 4. Le trigger handle_new_user créera automatiquement le profil dans la table users
-- 5. Ensuite, mettez à jour le rôle en admin avec le script ci-dessous
--
-- ============================================================================

-- ============================================================================
-- 4. SCRIPT POUR METTRE À JOUR LE RÔLE APRÈS CRÉATION DU COMPTE AUTH
-- ============================================================================
-- Exécutez ce script APRÈS avoir créé le compte d'authentification

-- Mettre à jour le rôle en admin
UPDATE users 
SET 
    role = 'admin',
    is_verified = true,
    status = 'active',
    updated_at = NOW()
WHERE email = 'adminmaximarket@gmail.com';

-- Mettre à jour le rôle en modérateur (si vous créez aussi ce compte)
UPDATE users 
SET 
    role = 'moderator',
    is_verified = true,
    status = 'active',
    updated_at = NOW()
WHERE email = 'moderateur.maximarket@gmail.com';

-- ============================================================================
-- 5. VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que les comptes sont bien configurés
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_verified,
    status,
    created_at
FROM users 
WHERE email IN ('adminmaximarket@gmail.com', 'moderateur.maximarket@gmail.com')
ORDER BY role;

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================
--
-- 1. Ce script supprime d'abord les utilisateurs existants pour éviter le conflit
-- 2. Ensuite, créez le compte d'authentification dans Supabase Auth
-- 3. Le trigger créera automatiquement le profil dans la table users
-- 4. Enfin, mettez à jour le rôle avec les requêtes UPDATE
--
-- ============================================================================
