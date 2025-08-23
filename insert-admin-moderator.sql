-- ============================================================================
-- INSERTION COMPTES ADMIN ET MODÉRATEUR - OFFICIEL BENOME
-- ============================================================================
-- Ce script insère un compte admin et un compte modérateur dans la base de données
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- 1. COMPTE ADMIN
-- ============================================================================

INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    phone_number,
    role,
    is_verified,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'adminmaximarket@gmail.com',
    'Admin',
    'MaxiMarket',
    '+221701234567',
    'admin',
    true,
    'active',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    is_verified = true,
    status = 'active',
    updated_at = NOW();

-- ============================================================================
-- 2. COMPTE MODÉRATEUR
-- ============================================================================

INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    phone_number,
    role,
    is_verified,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'moderateur.maximarket@gmail.com',
    'Modérateur',
    'MaxiMarket',
    '+221702345678',
    'moderator',
    true,
    'active',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'moderator',
    is_verified = true,
    status = 'active',
    updated_at = NOW();

-- ============================================================================
-- 3. VÉRIFICATION DE L'INSERTION
-- ============================================================================

-- Afficher les comptes créés
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
-- 4. COMPTAGE DES UTILISATEURS PAR RÔLE
-- ============================================================================

SELECT 
    role,
    COUNT(*) as nombre_utilisateurs
FROM users 
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'moderator' THEN 2
        WHEN 'user' THEN 3
    END;

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================
-- 
-- 1. Les mots de passe ne sont pas définis ici car ils sont gérés par Supabase Auth
-- 2. Pour créer les comptes d'authentification, vous devrez :
--    - Aller dans l'interface Supabase > Authentication > Users
--    - Cliquer sur "Add User"
--    - Remplir les informations avec les emails ci-dessus
--    - Définir un mot de passe temporaire
--    - L'utilisateur devra changer son mot de passe à la première connexion
--
-- 3. Les comptes sont automatiquement vérifiés (is_verified = true)
-- 4. Le statut est défini sur 'active' pour permettre l'accès immédiat
-- 5. Les numéros de téléphone sont des exemples, modifiez-les selon vos besoins
--
-- ============================================================================
