-- ============================================================================
-- AJOUTER DES DONNÉES DE TEST POUR L'UTILISATEUR
-- ============================================================================
-- User ID: 1b49077e-e6d1-409d-beae-3f1137b1cf84

-- 1. CRÉER 3 ANNONCES ACTIVES
-- ============================================================================

INSERT INTO listings (id, user_id, title, description, price, category, status, views_count, created_at)
VALUES 
  (gen_random_uuid(), '1b49077e-e6d1-409d-beae-3f1137b1cf84', 'Appartement F3 à Dakar', 'Bel appartement meublé', 150000, 'real_estate', 'approved', 2500, NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), '1b49077e-e6d1-409d-beae-3f1137b1cf84', 'Toyota Corolla 2020', 'Voiture en excellent état', 8500000, 'automobile', 'approved', 3200, NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '1b49077e-e6d1-409d-beae-3f1137b1cf84', 'Services de plomberie', 'Plombier professionnel disponible', 25000, 'services', 'approved', 1300, NOW() - INTERVAL '2 days');

-- 2. CRÉER 56 MESSAGES (CONVERSATIONS)
-- ============================================================================
-- On utilise des utilisateurs existants comme expéditeurs

DO $$
DECLARE
  target_user_id UUID := '1b49077e-e6d1-409d-beae-3f1137b1cf84';
  sender_ids UUID[];
  sender_id UUID;
  i INTEGER;
BEGIN
  -- Récupérer les IDs des utilisateurs existants (sauf le target)
  SELECT ARRAY_AGG(id) INTO sender_ids 
  FROM users 
  WHERE id != target_user_id 
  LIMIT 20;
  
  -- Si pas assez d'utilisateurs, créer des utilisateurs de test
  IF array_length(sender_ids, 1) IS NULL OR array_length(sender_ids, 1) < 5 THEN
    -- Créer 10 utilisateurs de test
    FOR i IN 1..10 LOOP
      INSERT INTO users (id, email, first_name, last_name, phone_number, role, status)
      VALUES (
        gen_random_uuid(),
        'testuser' || i || '@example.com',
        'Test',
        'User ' || i,
        '+221700000' || LPAD(i::text, 3, '0'),
        'user',
        'active'
      )
      RETURNING id INTO sender_id;
      
      sender_ids := array_append(sender_ids, sender_id);
    END LOOP;
  END IF;
  
  -- Créer 56 messages en utilisant les expéditeurs disponibles
  FOR i IN 1..56 LOOP
    -- Utiliser un expéditeur aléatoire parmi ceux disponibles
    sender_id := sender_ids[1 + (i % array_length(sender_ids, 1))];
    
    INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at)
    VALUES (
      sender_id,
      target_user_id,
      'Message de test numéro ' || i || ' - Bonjour, je suis intéressé par votre annonce.',
      CASE WHEN i <= 36 THEN true ELSE false END, -- 20 non lus (56-36=20)
      NOW() - (i || ' hours')::INTERVAL
    );
  END LOOP;
  
  RAISE NOTICE 'Messages créés avec succès';
END $$;

-- 3. VÉRIFIER LES STATISTIQUES
-- ============================================================================

SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  -- Annonces actives
  (SELECT COUNT(*) FROM listings WHERE user_id = u.id AND status = 'approved') as annonces_actives,
  -- Total des vues
  (SELECT COALESCE(SUM(views_count), 0) FROM listings WHERE user_id = u.id) as total_vues,
  -- Messages reçus
  (SELECT COUNT(*) FROM messages WHERE receiver_id = u.id) as messages_recus,
  -- Messages non lus
  (SELECT COUNT(*) FROM messages WHERE receiver_id = u.id AND is_read = false) as messages_non_lus
FROM users u
WHERE u.id = '1b49077e-e6d1-409d-beae-3f1137b1cf84';

-- 4. AFFICHER LES ANNONCES CRÉÉES
-- ============================================================================

SELECT 
  id,
  title,
  category,
  status,
  views_count,
  created_at
FROM listings
WHERE user_id = '1b49077e-e6d1-409d-beae-3f1137b1cf84'
ORDER BY created_at DESC;

-- 5. AFFICHER UN ÉCHANTILLON DES MESSAGES
-- ============================================================================

SELECT 
  m.id,
  u.first_name || ' ' || u.last_name as expediteur,
  m.content,
  m.is_read,
  m.created_at
FROM messages m
JOIN users u ON u.id = m.sender_id
WHERE m.receiver_id = '1b49077e-e6d1-409d-beae-3f1137b1cf84'
ORDER BY m.created_at DESC
LIMIT 10;

-- ============================================================================
-- RÉSULTAT ATTENDU :
-- ============================================================================
-- - annonces_actives: 3
-- - total_vues: 7000 (2500 + 3200 + 1300)
-- - messages_recus: 56
-- - messages_non_lus: 20
-- ============================================================================
