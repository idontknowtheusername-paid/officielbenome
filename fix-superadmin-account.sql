-- ============================================================================
-- CORRECTION DU COMPTE SUPER ADMIN
-- ============================================================================
-- Ce script supprime l'entrée existante pour permettre la création propre
-- du compte via l'API Supabase Auth

-- 1. Supprimer l'entrée existante dans users
DELETE FROM users WHERE email = 'superadmin@maxiimarket.com';

-- 2. Vérifier que c'est bien supprimé
SELECT COUNT(*) as compte FROM users WHERE email = 'superadmin@maxiimarket.com';
-- Devrait retourner 0

-- ============================================================================
-- APRÈS AVOIR EXÉCUTÉ CE SCRIPT :
-- ============================================================================
-- Exécutez: node create-superadmin-simple.js
-- 
-- Cela va créer le compte correctement dans auth.users ET users
-- ============================================================================
