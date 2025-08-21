-- =====================================================
-- CORRECTION DE LA FOREIGN KEY - SYSTÈME DE COMMENTAIRES
-- =====================================================

-- 1. Supprimer la contrainte incorrecte
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- 2. Ajouter la bonne contrainte vers auth.users
ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Vérifier que la contrainte est correcte
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'comments'
AND kcu.column_name = 'user_id';

-- 4. Test d'insertion avec un utilisateur existant
-- Remplacez 'USER_ID_EXISTANT' par un vrai user_id de votre base
-- SELECT id FROM auth.users LIMIT 1;
