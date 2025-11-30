-- ============================================================================
-- FIX RAPIDE: Ajouter 'failed' et 'refunded' au type enum boost_status
-- ============================================================================
-- Ce script corrige le type enum pour supporter les nouveaux statuts Lygos

-- Vérifier le type enum actuel
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'boost_status')
ORDER BY enumsortorder;

-- Ajouter 'failed' si pas déjà présent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'failed' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'boost_status')
  ) THEN
    ALTER TYPE boost_status ADD VALUE 'failed';
    RAISE NOTICE 'Valeur "failed" ajoutée au type boost_status';
  ELSE
    RAISE NOTICE 'Valeur "failed" existe déjà';
  END IF;
END $$;

-- Ajouter 'refunded' si pas déjà présent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'refunded' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'boost_status')
  ) THEN
    ALTER TYPE boost_status ADD VALUE 'refunded';
    RAISE NOTICE 'Valeur "refunded" ajoutée au type boost_status';
  ELSE
    RAISE NOTICE 'Valeur "refunded" existe déjà';
  END IF;
END $$;

-- Vérifier le résultat
SELECT 
  'boost_status' as type_name,
  enumlabel as value,
  enumsortorder as order
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'boost_status')
ORDER BY enumsortorder;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Le type boost_status devrait maintenant contenir:
-- - active
-- - expired
-- - cancelled
-- - pending
-- - failed (nouveau)
-- - refunded (nouveau)
-- ============================================================================
