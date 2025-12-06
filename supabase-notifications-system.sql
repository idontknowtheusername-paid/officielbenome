-- Ajouter colonne is_global pour les notifications globales (boost d'annonce)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Index pour les notifications globales
CREATE INDEX IF NOT EXISTS idx_notifications_is_global ON notifications(is_global) WHERE is_global = true;

-- Modifier la politique RLS pour permettre de voir les notifications globales
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view own and global notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id OR is_global = true);

-- Politique pour permettre aux admins de créer des notifications pour tous
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Le service backend gère la logique
