 -- ============================================================================
-- CONFIGURATION DES PACKAGES DE BOOST POUR LYGOS
-- ============================================================================
-- Ce script crée les packages de boost pour le système de paiement Lygos

-- Supprimer les anciens packages si nécessaire
-- DELETE FROM boost_packages;

-- Créer les packages de boost
INSERT INTO boost_packages (
  name, 
  description, 
  price, 
  duration_days, 
  features, 
  is_active,
  created_at,
  updated_at
) VALUES
  -- Package Standard (7 jours)
  (
    'Standard',
    'Boost standard pour 7 jours - Idéal pour une visibilité rapide',
    5000,
    7,
    '["Mise en avant pendant 7 jours", "Apparition en haut des résultats de recherche", "Badge Boost visible sur l''annonce", "Augmentation de la visibilité de 300%"]'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  
  -- Package Premium (14 jours)
  (
    'Premium',
    'Boost premium pour 14 jours - Le plus populaire',
    8000,
    14,
    '["Mise en avant pendant 14 jours", "Apparition en haut des résultats de recherche", "Badge Premium visible sur l''annonce", "Statistiques détaillées de performance", "Augmentation de la visibilité de 500%", "Support prioritaire"]'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  
  -- Package Ultimate (30 jours)
  (
    'Ultimate',
    'Boost ultimate pour 30 jours - Maximum de visibilité',
    15000,
    30,
    '["Mise en avant pendant 30 jours", "Apparition en haut des résultats de recherche", "Badge Ultimate visible sur l''annonce", "Statistiques détaillées de performance", "Augmentation de la visibilité de 800%", "Support prioritaire 24/7", "Mise en avant sur la page d''accueil", "Partage automatique sur les réseaux sociaux"]'::jsonb,
    true,
    NOW(),
    NOW()
  ),
  
  -- Package Express (3 jours) - Pour tests rapides
  (
    'Express',
    'Boost express pour 3 jours - Test rapide',
    2500,
    3,
    '["Mise en avant pendant 3 jours", "Apparition en haut des résultats", "Badge Boost visible"]'::jsonb,
    true,
    NOW(),
    NOW()
  );

-- Vérifier les packages créés
SELECT 
  id,
  name,
  price,
  duration_days,
  is_active,
  created_at
FROM boost_packages
WHERE is_active = true
ORDER BY price ASC;

-- Statistiques des packages
SELECT 
  COUNT(*) as total_packages,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_packages,
  MIN(price) as min_price,
  MAX(price) as max_price,
  AVG(price) as avg_price
FROM boost_packages;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================
-- 
-- 1. Les prix sont en XOF (Franc CFA)
-- 2. Les features sont stockées en JSONB pour flexibilité
-- 3. Les packages peuvent être activés/désactivés avec is_active
-- 4. Pour modifier un package :
--    UPDATE boost_packages SET price = 6000 WHERE name = 'Standard';
-- 
-- 5. Pour désactiver un package :
--    UPDATE boost_packages SET is_active = false WHERE name = 'Express';
-- 
-- 6. Pour ajouter un nouveau package :
--    INSERT INTO boost_packages (name, description, price, duration_days, features, is_active)
--    VALUES ('Custom', 'Description', 10000, 21, '["Feature 1", "Feature 2"]'::jsonb, true);
-- 
-- ============================================================================
