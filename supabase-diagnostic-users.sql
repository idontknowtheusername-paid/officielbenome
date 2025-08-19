-- ============================================================================
-- DIAGNOSTIC ET CORRECTION DES PROBLÈMES UTILISATEURS
-- ============================================================================

-- 1. VÉRIFIER LA STRUCTURE DE LA TABLE USERS
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. VÉRIFIER LES DONNÉES EXISTANTES
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE first_name IS NOT NULL) as users_with_first_name,
  COUNT(*) FILTER (WHERE last_name IS NOT NULL) as users_with_last_name,
  COUNT(*) FILTER (WHERE first_name IS NOT NULL AND last_name IS NOT NULL) as users_with_full_name
FROM users;

-- 3. AFFICHER QUELQUES UTILISATEURS POUR VÉRIFIER
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  status,
  created_at
FROM users 
LIMIT 10;

-- 4. VÉRIFIER LES POLITIQUES RLS SUR LA TABLE USERS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users';

-- 5. VÉRIFIER LES CONVERSATIONS ET LEURS PARTICIPANTS
SELECT 
  c.id as conversation_id,
  c.participant1_id,
  c.participant2_id,
  u1.first_name as p1_first_name,
  u1.last_name as p1_last_name,
  u2.first_name as p2_first_name,
  u2.last_name as p2_last_name,
  c.created_at
FROM conversations c
LEFT JOIN users u1 ON c.participant1_id = u1.id
LEFT JOIN users u2 ON c.participant2_id = u2.id
LIMIT 10;

-- 6. CRÉER DES POLITIQUES RLS APPROPRIÉES POUR LA TABLE USERS
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view other users basic info" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Politique pour voir son propre profil complet
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Politique pour voir les informations de base des autres utilisateurs (nécessaire pour les conversations)
CREATE POLICY "Users can view other users basic info" ON users
  FOR SELECT USING (
    -- Permettre de voir les informations de base des autres utilisateurs
    -- (nécessaire pour afficher les noms dans les conversations)
    true
  );

-- Politique pour mettre à jour son propre profil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 7. VÉRIFIER QUE LES POLITIQUES ONT ÉTÉ CRÉÉES
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

-- 8. TESTER LA RÉCUPÉRATION DES UTILISATEURS
-- Simuler une requête similaire à celle du service
SELECT 
  id,
  first_name,
  last_name,
  profile_image
FROM users 
WHERE id IN (
  SELECT DISTINCT participant1_id FROM conversations 
  UNION 
  SELECT DISTINCT participant2_id FROM conversations
)
LIMIT 5;

-- 9. VÉRIFIER LES MESSAGES ET LEURS EXPÉDITEURS
SELECT 
  m.id as message_id,
  m.content,
  m.sender_id,
  u.first_name as sender_first_name,
  u.last_name as sender_last_name,
  m.created_at
FROM messages m
LEFT JOIN users u ON m.sender_id = u.id
LIMIT 10;
