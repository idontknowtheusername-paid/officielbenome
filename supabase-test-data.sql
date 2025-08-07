-- ============================================================================
-- DONNÉES DE TEST POUR SUPABASE
-- ============================================================================

-- Insérer des utilisateurs de test
INSERT INTO users (id, first_name, last_name, email, phone_number, role, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Jean', 'Dupont', 'jean.dupont@test.com', '+221701234567', 'user', 'active'),
('22222222-2222-2222-2222-222222222222', 'Marie', 'Martin', 'marie.martin@test.com', '+221702345678', 'user', 'active'),
('33333333-3333-3333-3333-333333333333', 'Pierre', 'Bernard', 'pierre.bernard@test.com', '+221703456789', 'user', 'active'),
('44444444-4444-4444-4444-444444444444', 'Sophie', 'Petit', 'sophie.petit@test.com', '+221704567890', 'user', 'active'),
('55555555-5555-5555-5555-555555555555', 'Admin', 'User', 'admin@test.com', '+221705678901', 'admin', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insérer des annonces immobilières de test
INSERT INTO listings (id, title, description, price, location, category, user_id, status, real_estate_details, images, created_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Superbe Villa avec Piscine à Saly',
  'Magnifique villa moderne avec 4 chambres, 3 salles de bain, grande cuisine équipée, salon spacieux, terrasse avec vue sur la mer et piscine privée. Jardin paysager de 500m². Idéal pour famille ou investissement.',
  150000000,
  '{"city": "Saly", "country": "Sénégal", "address": "Route de la Petite Côte"}',
  'real_estate',
  '11111111-1111-1111-1111-111111111111',
  'approved',
  '{"type": "villa", "rooms": 6, "surface": 250, "bedrooms": 4, "bathrooms": 3, "parking": true, "garden": true, "pool": true}',
  '["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '5 days'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Appartement 3 pièces au Centre-Ville',
  'Bel appartement rénové au cœur de Dakar, 3 pièces, 2 chambres, cuisine moderne, balcon avec vue sur la ville. Proche des commerces et transports.',
  45000000,
  '{"city": "Dakar", "country": "Sénégal", "address": "Centre-Ville"}',
  'real_estate',
  '22222222-2222-2222-2222-222222222222',
  'approved',
  '{"type": "appartement", "rooms": 3, "surface": 85, "bedrooms": 2, "bathrooms": 1, "parking": false, "elevator": true, "balcony": true}',
  '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '3 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Terrain constructible à Thiès',
  'Terrain de 500m² constructible dans un quartier résidentiel calme de Thiès. Viabilisé, permis de construire possible. Idéal pour construction maison individuelle.',
  25000000,
  '{"city": "Thiès", "country": "Sénégal", "address": "Quartier résidentiel"}',
  'real_estate',
  '33333333-3333-3333-3333-333333333333',
  'approved',
  '{"type": "terrain", "surface": 500, "viabilise": true, "constructible": true, "zone": "residentielle"}',
  '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '1 day'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Local Commercial à Mermoz',
  'Local commercial de 120m² dans zone commerciale dynamique de Mermoz. Vitrine, arrière-boutique, stockage. Idéal pour commerce ou bureau.',
  80000000,
  '{"city": "Dakar", "country": "Sénégal", "address": "Mermoz"}',
  'real_estate',
  '44444444-4444-4444-4444-444444444444',
  'approved',
  '{"type": "commercial", "surface": 120, "vitrine": true, "stockage": true, "parking": true, "zone": "commerciale"}',
  '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '2 days'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Maison traditionnelle à Saint-Louis',
  'Charmante maison traditionnelle de 180m² à Saint-Louis, 4 chambres, 2 salles de bain, cour intérieure, style colonial. Proche du centre historique.',
  65000000,
  '{"city": "Saint-Louis", "country": "Sénégal", "address": "Centre historique"}',
  'real_estate',
  '11111111-1111-1111-1111-111111111111',
  'approved',
  '{"type": "maison", "rooms": 5, "surface": 180, "bedrooms": 4, "bathrooms": 2, "style": "colonial", "cour": true}',
  '["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;

-- Insérer des annonces automobiles de test
INSERT INTO listings (id, title, description, price, location, category, user_id, status, automobile_details, images, created_at) VALUES
(
  '66666666-6666-6666-6666-666666666666',
  'Toyota Corolla 2020 - Excellent état',
  'Toyota Corolla 2020, 45 000 km, essence, boîte automatique, climatisation, GPS, caméra de recul. Entretien régulier chez Toyota. Premier propriétaire.',
  8500000,
  '{"city": "Dakar", "country": "Sénégal", "address": "Zone industrielle"}',
  'automobile',
  '22222222-2222-2222-2222-222222222222',
  'approved',
  '{"type": "voiture", "brand": "Toyota", "model": "Corolla", "year": 2020, "mileage": 45000, "fuel": "essence", "transmission": "automatique", "color": "blanc"}',
  '["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '2 days'
),
(
  '77777777-7777-7777-7777-777777777777',
  'Peugeot 208 2019 - Bonne affaire',
  'Peugeot 208 2019, 65 000 km, diesel, boîte manuelle, bien entretenue. Idéale pour ville. Prix négociable.',
  5500000,
  '{"city": "Thiès", "country": "Sénégal", "address": "Centre-ville"}',
  'automobile',
  '33333333-3333-3333-3333-333333333333',
  'approved',
  '{"type": "voiture", "brand": "Peugeot", "model": "208", "year": 2019, "mileage": 65000, "fuel": "diesel", "transmission": "manuelle", "color": "gris"}',
  '["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Insérer des annonces de services de test
INSERT INTO listings (id, title, description, price, location, category, user_id, status, service_details, images, created_at) VALUES
(
  '88888888-8888-8888-8888-888888888888',
  'Plomberie professionnelle - Dakar',
  'Service de plomberie professionnel, intervention rapide 24h/24, réparation, installation, maintenance. Tarifs compétitifs, garantie travail.',
  15000,
  '{"city": "Dakar", "country": "Sénégal", "address": "Toute la ville"}',
  'services',
  '44444444-4444-4444-4444-444444444444',
  'approved',
  '{"type": "plomberie", "duration": "variable", "availability": "24h/24", "guarantee": true, "professional": true}',
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '3 days'
),
(
  '99999999-9999-9999-9999-999999999999',
  'Cours particuliers Mathématiques',
  'Professeur expérimenté donne cours de mathématiques niveau collège/lycée. Méthode adaptée, suivi personnalisé. Disponible week-end et soirées.',
  8000,
  '{"city": "Dakar", "country": "Sénégal", "address": "À domicile"}',
  'services',
  '11111111-1111-1111-1111-111111111111',
  'approved',
  '{"type": "education", "duration": "2h", "availability": "weekend/soir", "level": "college/lycee", "subject": "mathematiques"}',
  '["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Insérer des annonces marketplace de test
INSERT INTO listings (id, title, description, price, location, category, user_id, status, product_details, images, created_at) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'iPhone 13 Pro - Comme neuf',
  'iPhone 13 Pro 128GB, acheté il y a 6 mois, parfait état, boîte et accessoires inclus. Changement pour iPhone 15.',
  450000,
  '{"city": "Dakar", "country": "Sénégal", "address": "Plateau"}',
  'marketplace',
  '22222222-2222-2222-2222-222222222222',
  'approved',
  '{"type": "telephone", "brand": "Apple", "model": "iPhone 13 Pro", "condition": "excellent", "warranty": true, "accessories": true}',
  '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '2 days'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Canapé cuir 3 places - Occasion',
  'Canapé cuir marron 3 places, 2 ans d''usage, très bon état. Dimensions: 200x85x75cm. Livraison possible.',
  120000,
  '{"city": "Thiès", "country": "Sénégal", "address": "Centre-ville"}',
  'marketplace',
  '33333333-3333-3333-3333-333333333333',
  'approved',
  '{"type": "mobilier", "category": "canape", "material": "cuir", "condition": "bon", "dimensions": "200x85x75cm", "delivery": true}',
  '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop"]',
  NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING; 