-- ============================================================================
-- CORRECTION RAPIDE DES NUMÉROS DE TÉLÉPHONE NULL
-- ============================================================================

-- Corriger tous les phone_number NULL
UPDATE users 
SET 
    phone_number = '+221000000000',
    updated_at = NOW()
WHERE phone_number IS NULL;

-- Vérifier la correction
SELECT 
    id,
    email,
    first_name,
    last_name,
    phone_number,
    role,
    status
FROM users
ORDER BY created_at DESC;

-- Compter les NULL restants (devrait être 0)
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN phone_number IS NULL THEN 1 END) as phone_null_count
FROM users;
