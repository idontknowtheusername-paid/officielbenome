-- =====================================================
-- CORRECTION DE LA CLÉ ÉTRANGÈRE DES COMMENTAIRES
-- =====================================================
-- Ce script corrige la référence user_id pour pointer vers la table users
-- au lieu de auth.users, permettant ainsi de récupérer les vrais noms

-- 1. Supprimer l'ancienne contrainte de clé étrangère
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- 2. Ajouter la nouvelle contrainte pointant vers users(id)
ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Faire de même pour comment_reports
ALTER TABLE comment_reports DROP CONSTRAINT IF EXISTS comment_reports_reporter_id_fkey;

ALTER TABLE comment_reports 
ADD CONSTRAINT comment_reports_reporter_id_fkey 
FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Vérifier que les données sont cohérentes
-- (Les user_id dans comments doivent exister dans la table users)
SELECT 'Vérification des données cohérentes...' as message;

-- Compter les commentaires avec des user_id valides
SELECT 
  COUNT(*) as total_comments,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as valid_user_comments,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as orphaned_comments
FROM comments c
LEFT JOIN users u ON c.user_id = u.id;

-- Message de confirmation
SELECT 'Correction terminée ! Les commentaires peuvent maintenant récupérer les vrais noms d''utilisateurs.' as message;
