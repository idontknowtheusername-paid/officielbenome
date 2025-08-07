-- ============================================================================
-- CORRECTION DES COLONNES MANQUANTES DANS LA TABLE LISTINGS
-- ============================================================================

-- Ajouter les colonnes JSONB manquantes à la table listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS real_estate_details JSONB,
ADD COLUMN IF NOT EXISTS automobile_details JSONB,
ADD COLUMN IF NOT EXISTS service_details JSONB,
ADD COLUMN IF NOT EXISTS product_details JSONB,
ADD COLUMN IF NOT EXISTS contact_info JSONB;

-- Vérifier que les colonnes existent
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name IN ('real_estate_details', 'automobile_details', 'service_details', 'product_details', 'contact_info'); 