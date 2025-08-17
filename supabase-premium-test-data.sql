-- ============================================================================
-- DONNÉES DE TEST PREMIUM - MAXIMARKET (TEMPORAIRE)
-- ============================================================================
-- Ce script insère 6 annonces premium de test pour tester l'affichage
-- À SUPPRIMER après les tests en production

-- Annonce Premium 1: Villa de luxe
INSERT INTO listings (
  id,
  title,
  description,
  price,
  category,
  status,
  is_featured,
  is_boosted,
  is_premium,
  boost_expires_at,
  premium_metadata,
  user_id,
  created_at,
  location,
  real_estate_details,
  contact_info,
  views_count,
  favorites_count
) VALUES (
  gen_random_uuid(),
  'Villa de luxe avec vue mer - Premium',
  'Magnifique villa 5 pièces avec vue panoramique sur l''océan. Piscine privée, jardin paysager, garage 2 voitures. Finitions haut de gamme, domotique intégrée.',
  15000000,
  'real_estate',
  'approved',
  true,
  true,
  true,
  NOW() + INTERVAL '30 days',
  '{"priority": "highest", "badge": "premium", "analytics": "detailed", "support": "priority"}',
  (SELECT id FROM users LIMIT 1),
  NOW() - INTERVAL '5 days',
  '{"city": "Saly", "country": "Sénégal", "address": "Route de la Corniche"}',
  '{"type": "Villa", "rooms": "5 pièces", "surface": "200m²", "amenities": ["Piscine", "Jardin", "Garage", "Domotique", "Sécurité"]}',
  '{"phone": "+221 77 999 8888", "email": "villa-premium@test.com", "whatsapp": "+221 77 999 8888"}',
  1250,
  89
);

-- Annonce Premium 2: Mercedes Classe S
INSERT INTO listings (
  id,
  title,
  description,
  price,
  category,
  status,
  is_featured,
  is_boosted,
  is_premium,
  boost_expires_at,
  premium_metadata,
  user_id,
  created_at,
  location,
  automobile_details,
  contact_info,
  views_count,
  favorites_count
) VALUES (
  gen_random_uuid(),
  'Mercedes Classe S 2023 - Premium',
  'Berline de luxe Mercedes Classe S en parfait état, toutes options, entretien constructeur, garantie étendue. Intérieur cuir, système audio premium, assistance à la conduite.',
  45000000,
  'automobile',
  'approved',
  true,
  true,
  true,
  NOW() + INTERVAL '21 days',
  '{"priority": "high", "badge": "premium", "analytics": "detailed", "featured": true}',
  (SELECT id FROM users LIMIT 1),
  NOW() - INTERVAL '3 days',
  '{"city": "Dakar", "country": "Sénégal", "address": "Zone Almadies"}',
  '{"brand": "Mercedes", "model": "Classe S", "year": "2023", "condition": "Parfait", "fuel": "Diesel", "transmission": "Automatique"}',
  '{"phone": "+221 76 777 6666", "email": "mercedes-premium@test.com", "whatsapp": "+221 76 777 6666"}',
  890,
  67
);

-- Annonce Premium 3: Service Design d'Intérieur
INSERT INTO listings (
  id,
  title,
  description,
  price,
  category,
  status,
  is_featured,
  is_boosted,
  is_premium,
  boost_expires_at,
  premium_metadata,
  user_id,
  created_at,
  location,
  service_details,
  contact_info,
  views_count,
  favorites_count
) VALUES (
  gen_random_uuid(),
  'Service de Design d''Intérieur Premium',
  'Designer d''intérieur certifié avec 15 ans d''expérience. Projets résidentiels et commerciaux, suivi complet. Consultation gratuite, 3D, suivi chantier.',
  250000,
  'services',
  'approved',
  true,
  false,
  true,
  NOW() + INTERVAL '14 days',
  '{"priority": "medium", "badge": "featured", "analytics": "basic", "verified": true}',
  (SELECT id FROM users LIMIT 1),
  NOW() - INTERVAL '7 days',
  '{"city": "Dakar", "country": "Sénégal", "address": "Plateau"}',
  '{"expertise": "Design d''Intérieur", "experience": "15 ans", "availability": "Sur rendez-vous", "verified": true, "certifications": ["Certification internationale", "Membre de l''ordre des designers"]}',
  '{"phone": "+221 78 444 3333", "email": "design-premium@test.com", "website": "www.design-interieur-premium.com", "whatsapp": "+221 78 444 3333"}',
  567,
  34
);

-- Annonce Premium 4: Terrain constructible
INSERT INTO listings (
  id,
  title,
  description,
  price,
  category,
  status,
  is_featured,
  is_boosted,
  is_premium,
  boost_expires_at,
  premium_metadata,
  user_id,
  created_at,
  location,
  real_estate_details,
  contact_info,
  views_count,
  favorites_count
) VALUES (
  gen_random_uuid(),
  'Terrain constructible 500m² - Premium',
  'Terrain constructible de 500m² dans zone résidentielle calme. Viabilisé, permis de construire inclus, vue dégagée. Idéal pour villa ou immeuble.',
  35000000,
  'real_estate',
  'approved',
  true,
  true,
  true,
  NOW() + INTERVAL '45 days',
  '{"priority": "high", "badge": "premium", "analytics": "detailed", "featured": true}',
  (SELECT id FROM users LIMIT 1),
  NOW() - INTERVAL '2 days',
  '{"city": "Thiès", "country": "Sénégal", "address": "Zone résidentielle"}',
  '{"type": "Terrain", "surface": "500m²", "viabilisé": true, "permis": "Inclus", "zone": "Résidentielle"}',
  '{"phone": "+221 77 555 4444", "email": "terrain-premium@test.com", "whatsapp": "+221 77 555 4444"}',
  432,
  23
);

-- Annonce Premium 5: iPhone 15 Pro Max
INSERT INTO listings (
  id,
  title,
  description,
  price,
  category,
  status,
  is_featured,
  is_boosted,
  is_premium,
  boost_expires_at,
  premium_metadata,
  user_id,
  created_at,
  location,
  product_details,
  contact_info,
  views_count,
  favorites_count
) VALUES (
  gen_random_uuid(),
  'iPhone 15 Pro Max 256GB - Premium',
  'iPhone 15 Pro Max 256GB en parfait état, acheté il y a 2 mois. Boîtier titane, écran 6.7", appareil photo 48MP. Garantie Apple, accessoires inclus.',
  850000,
  'electronics',
  'approved',
  false,
  true,
  true,
  NOW() + INTERVAL '10 days',
  '{"priority": "medium", "badge": "boosted", "analytics": "basic", "verified": true}',
  (SELECT id FROM users LIMIT 1),
  NOW() - INTERVAL '1 day',
  '{"city": "Dakar", "country": "Sénégal", "address": "Mermoz"}',
  '{"brand": "Apple", "model": "iPhone 15 Pro Max", "storage": "256GB", "condition": "Parfait", "warranty": "Apple", "accessories": "Complets"}',
  '{"phone": "+221 76 888 9999", "email": "iphone-premium@test.com", "whatsapp": "+221 76 888 9999"}',
  789,
  45
);

-- Annonce Premium 6: Service de Marketing Digital
INSERT INTO listings (
  id,
  title,
  description,
  price,
  category,
  status,
  is_featured,
  is_boosted,
  is_premium,
  boost_expires_at,
  premium_metadata,
  user_id,
  created_at,
  location,
  service_details,
  contact_info,
  views_count,
  favorites_count
) VALUES (
  gen_random_uuid(),
  'Service Marketing Digital Premium',
  'Agence de marketing digital certifiée Google et Meta. Gestion des réseaux sociaux, publicités en ligne, SEO, création de contenu. Résultats garantis, reporting mensuel.',
  180000,
  'services',
  'approved',
  true,
  true,
  true,
  NOW() + INTERVAL '60 days',
  '{"priority": "highest", "badge": "premium", "analytics": "premium", "support": "dedicated"}',
  (SELECT id FROM users LIMIT 1),
  NOW() - INTERVAL '4 days',
  '{"city": "Dakar", "country": "Sénégal", "address": "Point E"}',
  '{"expertise": "Marketing Digital", "experience": "8 ans", "availability": "24/7", "verified": true, "certifications": ["Google Ads", "Meta Business", "HubSpot"], "results": "Garantis"}',
  '{"phone": "+221 77 111 2222", "email": "marketing-premium@test.com", "website": "www.marketing-digital-premium.com", "whatsapp": "+221 77 111 2222"}',
  654,
  28
);

-- ============================================================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================================================
-- Vérifier que les annonces premium sont bien créées
SELECT 
  id,
  title,
  is_featured,
  is_boosted,
  is_premium,
  boost_expires_at,
  created_at
FROM listings 
WHERE is_featured = true OR is_boosted = true OR is_premium = true
ORDER BY created_at DESC;

-- ============================================================================
-- SCRIPT TERMINÉ - SUPPRIMER APRÈS TESTS
-- ============================================================================
