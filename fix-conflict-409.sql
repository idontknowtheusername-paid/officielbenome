-- SCRIPT DE CORRECTION DES CONFLITS 409
-- Ce script résout les conflits de données dans Supabase

-- ============================================================================
-- 1. NETTOYAGE DES DONNÉES ORPHELINES
-- ============================================================================

-- Supprimer les messages orphelins (sans conversation valide)
DELETE FROM messages 
WHERE conversation_id NOT IN (
    SELECT id FROM conversations
);

-- Supprimer les conversations orphelines (sans participants valides)
DELETE FROM conversations 
WHERE participant1_id NOT IN (SELECT id FROM users)
   OR participant2_id NOT IN (SELECT id FROM users);

-- ============================================================================
-- 2. CORRECTION DES CONFLITS DE CONVERSATIONS
-- ============================================================================

-- Supprimer les conversations dupliquées
WITH duplicate_conversations AS (
    SELECT 
        participant1_id,
        participant2_id,
        listing_id,
        MIN(created_at) as first_created,
        COUNT(*) as count
    FROM conversations
    GROUP BY participant1_id, participant2_id, listing_id
    HAVING COUNT(*) > 1
)
DELETE FROM conversations 
WHERE (participant1_id, participant2_id, listing_id) IN (
    SELECT participant1_id, participant2_id, listing_id 
    FROM duplicate_conversations
)
AND created_at > (
    SELECT first_created 
    FROM duplicate_conversations 
    WHERE duplicate_conversations.participant1_id = conversations.participant1_id
    AND duplicate_conversations.participant2_id = conversations.participant2_id
    AND duplicate_conversations.listing_id = conversations.listing_id
);

-- ============================================================================
-- 3. CORRECTION DES CONFLITS DE MESSAGES
-- ============================================================================

-- Supprimer les messages dupliqués
WITH duplicate_messages AS (
    SELECT 
        conversation_id,
        sender_id,
        content,
        created_at,
        MIN(id) as first_id,
        COUNT(*) as count
    FROM messages
    GROUP BY conversation_id, sender_id, content, created_at
    HAVING COUNT(*) > 1
)
DELETE FROM messages 
WHERE (conversation_id, sender_id, content, created_at) IN (
    SELECT conversation_id, sender_id, content, created_at 
    FROM duplicate_messages
)
AND id > (
    SELECT first_id 
    FROM duplicate_messages 
    WHERE duplicate_messages.conversation_id = messages.conversation_id
    AND duplicate_messages.sender_id = messages.sender_id
    AND duplicate_messages.content = messages.content
    AND duplicate_messages.created_at = messages.created_at
);

-- ============================================================================
-- 4. MISE À JOUR DES TIMESTAMPS
-- ============================================================================

-- Mettre à jour les timestamps des conversations
UPDATE conversations 
SET 
    last_message_at = (
        SELECT MAX(created_at) 
        FROM messages 
        WHERE messages.conversation_id = conversations.id
    ),
    updated_at = NOW()
WHERE last_message_at IS NULL 
   OR last_message_at < (
       SELECT MAX(created_at) 
       FROM messages 
       WHERE messages.conversation_id = conversations.id
   );

-- ============================================================================
-- 5. VÉRIFICATION FINALE
-- ============================================================================

-- Compter les données après nettoyage
SELECT 
    'conversations' as table_name,
    COUNT(*) as count
FROM conversations
UNION ALL
SELECT 
    'messages' as table_name,
    COUNT(*) as count
FROM messages
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as count
FROM users;

-- Vérifier les conversations sans messages
SELECT 
    c.id,
    c.participant1_id,
    c.participant2_id,
    c.created_at
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE m.id IS NULL;

-- Message de fin
DO $$
BEGIN
    RAISE NOTICE '🧹 NETTOYAGE DES CONFLITS TERMINÉ !';
    RAISE NOTICE '✅ Données orphelines supprimées';
    RAISE NOTICE '✅ Conflits de conversations résolus';
    RAISE NOTICE '✅ Conflits de messages résolus';
    RAISE NOTICE '✅ Timestamps mis à jour';
    RAISE NOTICE '🔍 Testez maintenant la messagerie !';
END $$;
