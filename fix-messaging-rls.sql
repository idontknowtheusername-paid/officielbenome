-- ============================================================================
-- CORRECTION DES POLITIQUES RLS POUR LA MESSAGERIE
-- ============================================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase pour corriger le problème
-- "Utilisateur Inconnu" dans la messagerie

-- 1. Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;

-- 2. Créer de nouvelles politiques plus permissives pour la messagerie
-- Permettre de voir les profils des autres utilisateurs (nécessaire pour la messagerie)
CREATE POLICY "Users can view profiles for messaging" ON users
  FOR SELECT USING (true);

-- Permettre de mettre à jour son propre profil
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Permettre de créer son propre profil
CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Vérifier et corriger les politiques des conversations
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Créer les bonnes politiques pour les conversations
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (
    participant1_id = auth.uid() OR participant2_id = auth.uid()
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    participant1_id = auth.uid() OR participant2_id = auth.uid()
  );

CREATE POLICY "Users can update their conversations" ON conversations
  FOR UPDATE USING (
    participant1_id = auth.uid() OR participant2_id = auth.uid()
  );

-- 4. Vérifier et corriger les politiques des messages
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON messages;

-- Créer les bonnes politiques pour les messages
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
  );

CREATE POLICY "Users can update their sent messages" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid()
  );

-- 5. Vérifier que RLS est activé sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 6. Test : Vérifier que les politiques sont créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('users', 'conversations', 'messages')
ORDER BY tablename, policyname;

-- 7. Test : Vérifier l'accès aux utilisateurs
-- Cette requête devrait maintenant fonctionner pour un utilisateur connecté
-- SELECT id, first_name, last_name, email FROM users LIMIT 5;
