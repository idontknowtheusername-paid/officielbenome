-- ============================================================================
-- INSERTION COMPTE SUPER ADMIN - MAXIMARKET
-- ============================================================================
-- Ce script insère le compte super admin principal dans la base de données
-- Email: superadmin@maxiimarket.com
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================================================
-- 1. INSERTION DU SUPER ADMIN
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
    'superadmin@maxiimarket.com',
    'Super',
    'Admin',
    '+221770000000',
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
-- 2. VÉRIFICATION DE L'INSERTION
-- ============================================================================

-- Afficher le compte créé
SELECT 
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
FROM users 
WHERE email = 'superadmin@maxiimarket.com';

-- ============================================================================
-- 3. LISTE DE TOUS LES ADMINS
-- ============================================================================

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
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================================================
-- 4. STATISTIQUES DES UTILISATEURS PAR RÔLE
-- ============================================================================

SELECT 
    role,
    COUNT(*) as nombre_utilisateurs,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verifies,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as actifs
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
-- ⚠️ ÉTAPES SUIVANTES OBLIGATOIRES :
-- 
-- 1. Après avoir exécuté ce script, vous DEVEZ créer le compte d'authentification :
--    
--    a) Allez dans Supabase Dashboard > Authentication > Users
--    b) Cliquez sur "Add User" (ou "Invite User")
--    c) Remplissez les informations :
--       - Email: superadmin@maxiimarket.com
--       - Password: [Choisissez un mot de passe fort]
--       - Auto Confirm User: ✓ (coché)
--    d) Cliquez sur "Create User"
--
-- 2. Le compte sera automatiquement lié à l'entrée dans la table users
--    grâce au trigger qui synchronise auth.users et public.users
--
-- 3. Mot de passe recommandé :
--    - Minimum 12 caractères
--    - Majuscules + minuscules + chiffres + caractères spéciaux
--    - Exemple: SuperAdmin2025!@MaxiMarket
--
-- 4. Première connexion :
--    - Connectez-vous sur https://votre-app.com/connexion
--    - Email: superadmin@maxiimarket.com
--    - Password: [le mot de passe défini]
--    - Vous serez redirigé vers /admin (dashboard admin)
--
-- 5. Sécurité :
--    - Changez le mot de passe après la première connexion
--    - Activez l'authentification à deux facteurs si disponible
--    - Ne partagez jamais les identifiants
--
-- ============================================================================
-- ALTERNATIVE : CRÉATION DIRECTE DANS SUPABASE AUTH
-- ============================================================================
--
-- Si vous préférez créer le compte directement via l'API Supabase Auth,
-- utilisez cette commande dans la console JavaScript du navigateur :
--
-- const { data, error } = await supabase.auth.admin.createUser({
--   email: 'superadmin@maxiimarket.com',
--   password: 'VotreMotDePasseFort123!',
--   email_confirm: true,
--   user_metadata: {
--     first_name: 'Super',
--     last_name: 'Admin',
--     role: 'admin'
--   }
-- });
--
-- ============================================================================

