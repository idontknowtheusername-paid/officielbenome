-- Ajouter la colonne currency à la table listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'XOF';

-- Ajouter la colonne subCategory si elle n'existe pas
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS subCategory VARCHAR(100);

-- Ajouter la colonne specific_data si elle n'existe pas
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS specific_data JSONB;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name IN ('currency', 'subCategory', 'specific_data'); 