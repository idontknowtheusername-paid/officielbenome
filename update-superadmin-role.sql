-- ============================================================================
-- MISE À JOUR DU RÔLE SUPER ADMIN
-- ============================================================================
-- Ce script met à jour le rôle de 'user' vers 'admin'

-- 1. Mettre à jour le rôle vers admin
UPDATE users 
SET 
    role = 'admin',
    is_verified = true,
    status = 'active',
    updated_at = NOW()
WHERE email = 'superadmin@maxiimarket.com';

-- 2. Vérifier la mise à jour
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_verified,
    status,
    created_at,
    updated_at
FROM users 
WHERE email = 'superadmin@maxiimarket.com';

-- ============================================================================
-- RÉSULTAT ATTENDU :
-- ============================================================================
-- role = 'admin'
-- is_verified = true
-- status = 'active'
-- ============================================================================
