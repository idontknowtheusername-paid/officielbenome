-- ============================================================================
-- AUTOMATISATION NEWSLETTERS AVEC PG_CRON
-- ============================================================================

-- 1. Activer l'extension pg_cron (à faire dans Supabase Dashboard)
-- Dashboard → Database → Extensions → Activer "pg_cron"

-- 2. Créer une fonction pour envoyer la newsletter hebdomadaire
CREATE OR REPLACE FUNCTION send_weekly_newsletter()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT := 'https://votre-domaine.com/api/cron/weekly-newsletter';
  response TEXT;
BEGIN
  -- Appeler votre API via HTTP
  SELECT content INTO response
  FROM http_post(
    webhook_url,
    '{"secret": "votre-secret-key"}',
    'application/json'
  );
  
  -- Logger le résultat
  INSERT INTO cron_logs (job_name, status, response, executed_at)
  VALUES ('weekly_newsletter', 'success', response, NOW());
  
EXCEPTION WHEN OTHERS THEN
  -- Logger l'erreur
  INSERT INTO cron_logs (job_name, status, error, executed_at)
  VALUES ('weekly_newsletter', 'error', SQLERRM, NOW());
END;
$$;

-- 3. Créer une fonction pour la newsletter mensuelle
CREATE OR REPLACE FUNCTION send_monthly_newsletter()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT := 'https://votre-domaine.com/api/cron/monthly-newsletter';
  response TEXT;
BEGIN
  SELECT content INTO response
  FROM http_post(
    webhook_url,
    '{"secret": "votre-secret-key"}',
    'application/json'
  );
  
  INSERT INTO cron_logs (job_name, status, response, executed_at)
  VALUES ('monthly_newsletter', 'success', response, NOW());
  
EXCEPTION WHEN OTHERS THEN
  INSERT INTO cron_logs (job_name, status, error, executed_at)
  VALUES ('monthly_newsletter', 'error', SQLERRM, NOW());
END;
$$;

-- 4. Table pour logger les exécutions
CREATE TABLE IF NOT EXISTS cron_logs (
  id BIGSERIAL PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  response TEXT,
  error TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Programmer les cron jobs
-- Newsletter hebdomadaire: Tous les lundis à 10h00 UTC
SELECT cron.schedule(
  'weekly-newsletter',
  '0 10 * * 1', -- Cron expression: minute heure jour mois jour_semaine
  $$SELECT send_weekly_newsletter()$$
);

-- Newsletter mensuelle: Le 1er de chaque mois à 10h00 UTC
SELECT cron.schedule(
  'monthly-newsletter',
  '0 10 1 * *',
  $$SELECT send_monthly_newsletter()$$
);

-- 6. Vérifier les jobs programmés
SELECT * FROM cron.job;

-- 7. Désactiver un job (si besoin)
-- SELECT cron.unschedule('weekly-newsletter');
-- SELECT cron.unschedule('monthly-newsletter');

-- 8. Voir l'historique des exécutions
-- SELECT * FROM cron_logs ORDER BY executed_at DESC LIMIT 10;
