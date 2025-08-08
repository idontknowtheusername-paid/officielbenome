-- ============================================================================
-- SCRIPT POUR ADAPTER LES TABLES EXISTANTES
-- ============================================================================

-- 1. AJOUTER LES COLONNES MANQUANTES À LA TABLE MESSAGES
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS attachments JSONB,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ajouter la contrainte pour message_type (avec vérification)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valid_message_type' 
        AND conrelid = 'messages'::regclass
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT check_valid_message_type 
        CHECK (message_type IN ('text', 'image', 'file', 'offer'));
    END IF;
END $$;

-- 2. AJOUTER LES COLONNES MANQUANTES À LA TABLE NOTIFICATIONS
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. AJOUTER LES COLONNES MANQUANTES À LA TABLE FAVORITES
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 4. AJOUTER LES COLONNES MANQUANTES À LA TABLE TRANSACTIONS (EXISTANTE)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS reference VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Ajouter les contraintes pour transactions (adaptées à la structure existante)
DO $$
BEGIN
    -- Contrainte pour montant positif
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_amount_positive'
    ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT check_amount_positive 
        CHECK (amount > 0);
    END IF;
    
    -- Contrainte pour statut valide
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valid_status'
    ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT check_valid_status 
        CHECK (status IN ('pending', 'completed', 'cancelled', 'failed'));
    END IF;
    
    -- Contrainte pour transaction_type valide (nom correct de la colonne)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valid_transaction_type'
    ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT check_valid_transaction_type 
        CHECK (transaction_type IN ('purchase', 'rental', 'service', 'transfer'));
    END IF;
END $$;

-- 5. CRÉER LA TABLE CONVERSATIONS (MANQUANTE)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  
  -- Participants
  participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- État
  is_active BOOLEAN DEFAULT true,
  starred BOOLEAN DEFAULT false,
  last_message_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la contrainte unique pour conversations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_conversation_participants'
    ) THEN
        ALTER TABLE conversations 
        ADD CONSTRAINT unique_conversation_participants 
        UNIQUE(participant1_id, participant2_id, listing_id);
    END IF;
END $$;

-- 6. CRÉER LA TABLE USER_ACTIVITIES (MANQUANTE)
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Détails de l'activité
  type VARCHAR(50) NOT NULL, -- 'listing', 'auth', 'transaction', 'message', 'profile'
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'viewed', etc.
  description TEXT NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- Relations
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Métadonnées
  metadata JSONB, -- IP, user agent, etc.
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la contrainte pour user_activities
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valid_activity_type'
    ) THEN
        ALTER TABLE user_activities 
        ADD CONSTRAINT check_valid_activity_type 
        CHECK (type IN ('listing', 'auth', 'transaction', 'message', 'profile'));
    END IF;
END $$;

-- 7. CRÉER LA TABLE USER_PREFERENCES (MANQUANTE)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Préférences générales
  theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'
  language VARCHAR(10) DEFAULT 'fr',
  currency VARCHAR(3) DEFAULT 'XOF',
  timezone VARCHAR(50) DEFAULT 'Africa/Abidjan',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  time_format VARCHAR(10) DEFAULT '24h',
  
  -- Notifications
  email_notifications JSONB DEFAULT '{
    "new_messages": true,
    "listing_updates": true,
    "transaction_updates": true,
    "marketing": false,
    "weekly_digest": true
  }',
  
  push_notifications JSONB DEFAULT '{
    "new_messages": true,
    "listing_updates": true,
    "transaction_updates": true,
    "marketing": false
  }',
  
  -- Affichage
  display_preferences JSONB DEFAULT '{
    "listings_per_page": 12,
    "show_prices": true,
    "show_location": true,
    "show_contact_info": true,
    "compact_view": false
  }',
  
  -- Confidentialité
  privacy_settings JSONB DEFAULT '{
    "profile_visibility": "public",
    "show_online_status": true,
    "allow_messages": true,
    "show_last_seen": true
  }',
  
  -- Sécurité
  security_settings JSONB DEFAULT '{
    "two_factor_auth": false,
    "login_notifications": true,
    "session_timeout": 30,
    "require_password_change": false
  }',
  
  -- Personnalisation
  customization JSONB DEFAULT '{
    "primary_color": "#3B82F6",
    "accent_color": "#10B981",
    "font_size": "medium",
    "animations_enabled": true
  }',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les contraintes pour user_preferences
DO $$
BEGIN
    -- Contrainte pour thème valide
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valid_theme'
    ) THEN
        ALTER TABLE user_preferences 
        ADD CONSTRAINT check_valid_theme 
        CHECK (theme IN ('light', 'dark', 'auto'));
    END IF;
    
    -- Contrainte pour langue valide
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_valid_language'
    ) THEN
        ALTER TABLE user_preferences 
        ADD CONSTRAINT check_valid_language 
        CHECK (language IN ('fr', 'en', 'es', 'pt'));
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- ============================================================================

-- Index pour messages (nouvelles colonnes)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);
CREATE INDEX IF NOT EXISTS idx_messages_updated_at ON messages(updated_at DESC);

-- Index pour conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_id ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_starred ON conversations(starred);

-- Index pour transactions (nouvelles colonnes)
CREATE INDEX IF NOT EXISTS idx_transactions_sender_id ON transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_id ON transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);

-- Index pour activités utilisateur
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_listing_id ON user_activities(listing_id);

-- Index pour préférences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- ACTIVATION RLS (ROW LEVEL SECURITY)
-- ============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUES RLS
-- ============================================================================

-- Politiques pour conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Politiques pour transactions (adaptées à la structure existante)
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Politiques pour activités utilisateur
DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own activities" ON user_activities;
CREATE POLICY "Users can create own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour préférences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ============================================================================

-- Fonction pour updated_at (si elle n'existe pas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at sur conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur messages
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour incrémenter le compteur de favoris
CREATE OR REPLACE FUNCTION increment_listing_favorites(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET favorites_count = favorites_count + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour décrémenter le compteur de favoris
CREATE OR REPLACE FUNCTION decrement_listing_favorites(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET favorites_count = GREATEST(favorites_count - 1, 0)
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour incrémenter les favoris
CREATE OR REPLACE FUNCTION handle_favorite_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_listing_favorites(NEW.listing_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS favorite_insert_trigger ON favorites;
CREATE TRIGGER favorite_insert_trigger
  AFTER INSERT ON favorites
  FOR EACH ROW EXECUTE FUNCTION handle_favorite_insert();

-- Trigger pour décrémenter les favoris
CREATE OR REPLACE FUNCTION handle_favorite_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM decrement_listing_favorites(OLD.listing_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS favorite_delete_trigger ON favorites;
CREATE TRIGGER favorite_delete_trigger
  AFTER DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION handle_favorite_delete();

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que toutes les colonnes ont été ajoutées
SELECT 
  table_name,
  column_name,
  data_type,
  CASE 
    WHEN column_name IN ('conversation_id', 'message_type', 'attachments', 'read_at', 'updated_at') 
    AND table_name = 'messages' THEN '✅ Ajoutée'
    WHEN column_name IN ('icon', 'color', 'read_at', 'updated_at') 
    AND table_name = 'notifications' THEN '✅ Ajoutée'
    WHEN column_name IN ('notes', 'tags') 
    AND table_name = 'favorites' THEN '✅ Ajoutée'
    WHEN column_name IN ('reference', 'sender_id', 'receiver_id', 'expires_at', 'completed_at') 
    AND table_name = 'transactions' THEN '✅ Ajoutée'
    ELSE '✅ Existante'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('messages', 'notifications', 'favorites', 'transactions')
AND column_name IN ('conversation_id', 'message_type', 'attachments', 'read_at', 'updated_at', 'icon', 'color', 'notes', 'tags', 'reference', 'sender_id', 'receiver_id', 'expires_at', 'completed_at')
ORDER BY table_name, column_name;

-- Vérifier que toutes les nouvelles tables ont été créées
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('conversations', 'user_activities', 'user_preferences') 
    THEN '✅ Créée'
    ELSE '❌ Manquante'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'user_activities', 'user_preferences')
ORDER BY table_name; 