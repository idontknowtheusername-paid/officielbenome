-- ============================================================================
-- CORRECTION TABLE CONVERSATIONS - Ajout des champs manquants
-- ============================================================================

-- Ajouter les champs manquants pour les fonctionnalités d'archivage et de favoris
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false;

-- Mettre à jour les conversations existantes avec des valeurs par défaut
UPDATE conversations 
SET 
  is_archived = COALESCE(is_archived, false),
  starred = COALESCE(starred, false)
WHERE is_archived IS NULL OR starred IS NULL;

-- Créer des index pour optimiser les requêtes sur ces nouveaux champs
CREATE INDEX IF NOT EXISTS idx_conversations_is_archived ON conversations(is_archived);
CREATE INDEX IF NOT EXISTS idx_conversations_starred ON conversations(starred);

-- Vérifier que les champs ont été ajoutés
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
  AND column_name IN ('is_archived', 'starred')
ORDER BY column_name;

-- Afficher un résumé des conversations
SELECT 
  COUNT(*) as total_conversations,
  COUNT(*) FILTER (WHERE is_archived = true) as conversations_archivees,
  COUNT(*) FILTER (WHERE starred = true) as conversations_favorites
FROM conversations;
