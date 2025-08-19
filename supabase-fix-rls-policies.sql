-- ============================================================================
-- CORRECTION DES POLITIQUES RLS POUR LA SUPPRESSION DES CONVERSATIONS
-- ============================================================================

-- Vérifier les politiques existantes sur la table conversations
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
WHERE tablename = 'conversations';

-- Supprimer les anciennes politiques restrictives si elles existent
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;

-- Créer des politiques RLS appropriées pour les conversations
-- 1. Politique de lecture : Les utilisateurs peuvent voir leurs propres conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- 2. Politique de création : Les utilisateurs peuvent créer des conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- 3. Politique de mise à jour : Les utilisateurs peuvent modifier leurs propres conversations
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- 4. Politique de suppression : Les utilisateurs peuvent supprimer leurs propres conversations
CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- Créer des politiques RLS appropriées pour les messages
-- 1. Politique de lecture : Les utilisateurs peuvent voir les messages de leurs conversations
CREATE POLICY "Users can view messages from own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- 2. Politique de création : Les utilisateurs peuvent créer des messages dans leurs conversations
CREATE POLICY "Users can create messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- 3. Politique de mise à jour : Les utilisateurs peuvent modifier leurs propres messages
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid()
  );

-- 4. Politique de suppression : Les utilisateurs peuvent supprimer leurs propres messages
CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (
    sender_id = auth.uid()
  );

-- 5. Politique de suppression : Les utilisateurs peuvent supprimer tous les messages de leurs conversations
CREATE POLICY "Users can delete messages from own conversations" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- Vérifier que les politiques ont été créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, cmd;

-- Tester la suppression d'une conversation (remplacer par un vrai ID)
-- SELECT * FROM conversations LIMIT 1;
-- DELETE FROM conversations WHERE id = 'test-id';

