-- ============================================================================
-- MISE À JOUR DES PRIX DES PACKAGES DE BOOST
-- ============================================================================

-- Nouveau système de prix plus abordable : 500 à 5000 FCFA

UPDATE boost_packages SET price = 500.00 WHERE name = 'Boost Flash';     -- 3 jours - Le moins cher
UPDATE boost_packages SET price = 1500.00 WHERE name = 'Boost Basique';   -- 7 jours - Entrée de gamme  
UPDATE boost_packages SET price = 3000.00 WHERE name = 'Boost Premium';   -- 14 jours - Milieu de gamme
UPDATE boost_packages SET price = 5000.00 WHERE name = 'Boost VIP';       -- 30 jours - Le plus cher

-- Vérifier les nouveaux prix
SELECT 
  name as "Package",
  duration_days as "Durée (jours)",
  price as "Prix (FCFA)",
  ROUND(price / duration_days, 0) as "Prix/jour"
FROM boost_packages 
WHERE is_active = true 
ORDER BY price ASC;



