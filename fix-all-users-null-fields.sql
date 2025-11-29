-- ============================================================================
-- CORRECTION DES CHAMPS NULL POUR TOUS LES UTILISATEURS
-- ============================================================================
-- Ce script corrige tous les utilisateurs qui ont des champs NULL obligatoires

-- 1. Identifier les utilisateurs avec des champs NULL
SELECT 
    id,
    email,
    first_name,
    last_name,
    phone_number,
    role,
    status,
    is_verified,
    CASE 
        WHEN first_name IS NULL THEN 'first_name NULL'
        WHEN last_name IS NULL THEN 'last_name NULL'
        WHEN phone_number IS NULL THEN 'phone_number NULL'
        WHEN role IS NULL THEN 'role NULL'
        WHEN status IS NULL THEN 'status NULL'
        WHEN is_verified IS NULL THEN 'is_verified NULL'
        ELSE 'OK'
    END as probleme
FROM users
WHERE first_name IS NULL 
   OR last_name IS NULL 
   OR phone_number IS NULL 
   OR role IS NULL 
   OR status IS NULL 
   OR is_verified IS NULL;

-- 2. Corriger tous les champs NULL avec des valeurs par défaut
UPDATE users 
SET 
    first_name = COALESCE(first_name, 'Utilisateur'),
    last_name = COALESCE(last_name, 'Anonyme'),
    phone_number = COALESCE(phone_number, '+221000000000'),
    role = COALESCE(role, 'user'),
    status = COALESCE(status, 'active'),
    is_verified = COALESCE(is_verified, false),
    updated_at = NOW()
WHERE first_name IS NULL 
   OR last_name IS NULL 
   OR phone_number IS NULL 
   OR role IS NULL 
   OR status IS NULL 
   OR is_verified IS NULL;

-- 3. Vérifier qu'il n'y a plus de NULL
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN first_name IS NULL THEN 1 END) as first_name_null,
    COUNT(CASE WHEN last_name IS NULL THEN 1 END) as last_name_null,
    COUNT(CASE WHEN phone_number IS NULL THEN 1 END) as phone_number_null,
    COUNT(CASE WHEN role IS NULL THEN 1 END) as role_null,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as status_null,
    COUNT(CASE WHEN is_verified IS NULL THEN 1 END) as is_verified_null
FROM users;

-- 4. Afficher tous les utilisateurs pour vérification
SELECT 
    id,
    email,
    first_name,
    last_name,
    phone_number,
    role,
    status,
    is_verified,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- RÉSULTAT ATTENDU :
-- ============================================================================
-- Tous les compteurs de NULL doivent être à 0
-- Tous les utilisateurs doivent avoir des valeurs dans tous les champs
-- ============================================================================
