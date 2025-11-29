-- ============================================================================
-- CORRECTION COMPLÈTE DU COMPTE SUPER ADMIN
-- ============================================================================
-- Ce script met à jour TOUS les champs nécessaires pour le compte superadmin

-- 1. Mettre à jour le compte avec tous les champs requis
UPDATE users 
SET 
    first_name = COALESCE(first_name, 'Super'),
    last_name = COALESCE(last_name, 'Admin'),
    phone_number = COALESCE(phone_number, '+221770000000'),
    role = 'admin',
    is_verified = true,
    status = 'active',
    updated_at = NOW()
WHERE email = 'superadmin@maxiimarket.com';

-- 2. Vérifier que tous les champs sont remplis
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

-- 3. Vérifier qu'il n'y a pas de champs NULL
SELECT 
    CASE 
        WHEN first_name IS NULL THEN 'first_name est NULL'
        WHEN last_name IS NULL THEN 'last_name est NULL'
        WHEN phone_number IS NULL THEN 'phone_number est NULL'
        WHEN role IS NULL THEN 'role est NULL'
        WHEN is_verified IS NULL THEN 'is_verified est NULL'
        WHEN status IS NULL THEN 'status est NULL'
        ELSE 'Tous les champs sont remplis ✓'
    END as verification
FROM users 
WHERE email = 'superadmin@maxiimarket.com';

-- ============================================================================
-- RÉSULTAT ATTENDU :
-- ============================================================================
-- first_name = 'Super'
-- last_name = 'Admin'
-- phone_number = '+221770000000'
-- role = 'admin'
-- is_verified = true
-- status = 'active'
-- verification = 'Tous les champs sont remplis ✓'
-- ============================================================================
