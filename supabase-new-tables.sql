-- ============================================================================
-- NOUVELLES TABLES SUPABASE POUR FONCTIONNALITÉS AVANCÉES
-- ============================================================================

-- 1. TABLE TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  
  -- Détails de la transaction
  type VARCHAR(50) NOT NULL, -- 'purchase', 'rental', 'service', 'transfer'
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled', 'failed'
  
  -- Informations de paiement
  payment_method VARCHAR(50), -- 'mobile_money', 'bank_transfer', 'cash', 'card'
  payment_reference VARCHAR(100),
  
  -- Métadonnées
  description TEXT,
  metadata JSONB,
  
  -- Timestamps
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_amount_positive CHECK (amount > 0),
  CONSTRAINT check_valid_status CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  CONSTRAINT check_valid_type CHECK (type IN ('purchase', 'rental', 'service', 'transfer'))
);

-- 2. TABLE NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contenu de la notification
  type VARCHAR(50) NOT NULL, -- 'listing', 'transaction', 'message', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- État
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_valid_type CHECK (type IN ('listing', 'transaction', 'message', 'system'))
);

-- 3. TABLE USER_ACTIVITIES
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
  message_id UUID, -- Référence vers la table messages (à créer)
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Métadonnées
  metadata JSONB, -- IP, user agent, etc.
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_valid_activity_type CHECK (type IN ('listing', 'auth', 'transaction', 'message', 'profile'))
);

-- 4. TABLE USER_PREFERENCES
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_valid_theme CHECK (theme IN ('light', 'dark', 'auto')),
  CONSTRAINT check_valid_language CHECK (language IN ('fr', 'en', 'es', 'pt'))
);

-- 5. TABLE FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  
  -- Métadonnées
  notes TEXT,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT unique_user_listing_favorite UNIQUE(user_id, listing_id)
);

-- 6. TABLE MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  
  -- Contenu
  subject VARCHAR(255),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'offer'
  
  -- État
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  attachments JSONB, -- URLs des fichiers joints
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_valid_message_type CHECK (message_type IN ('text', 'image', 'file', 'offer'))
);

-- 7. TABLE CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  
  -- Participants
  participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- État
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT unique_conversation_participants UNIQUE(participant1_id, participant2_id, listing_id)
);

-- ============================================================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- ============================================================================

-- Index pour transactions
CREATE INDEX IF NOT EXISTS idx_transactions_sender_id ON transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_id ON transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);

-- Index pour notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Index pour activités utilisateur
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_listing_id ON user_activities(listing_id);

-- Index pour préférences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Index pour favoris
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Index pour messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Index pour conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_id ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- ============================================================================
-- ACTIVATION RLS (ROW LEVEL SECURITY)
-- ============================================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUES RLS
-- ============================================================================

-- Politiques pour transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Politiques pour notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour activités utilisateur
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour préférences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour favoris
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Politiques pour conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- ============================================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ============================================================================

-- Trigger pour updated_at sur transactions
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur notifications
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur messages
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
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

CREATE TRIGGER favorite_delete_trigger
  AFTER DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION handle_favorite_delete();

-- ============================================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ============================================================================

-- Insérer quelques catégories de transactions
-- (Les catégories principales sont déjà dans le fichier principal)

-- Insérer des préférences par défaut pour les utilisateurs existants
-- (Sera géré automatiquement par le service)

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que toutes les tables ont été créées
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('transactions', 'notifications', 'user_activities', 'user_preferences', 'favorites', 'messages', 'conversations') 
    THEN '✅ Créée'
    ELSE '❌ Manquante'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transactions', 'notifications', 'user_activities', 'user_preferences', 'favorites', 'messages', 'conversations')
ORDER BY table_name; 