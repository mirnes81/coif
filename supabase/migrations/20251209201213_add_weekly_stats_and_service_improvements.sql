/*
  # Ajouter statistiques hebdomadaires et améliorer services

  1. Nouvelles Vues
    - `weekly_revenue` - Revenus par semaine avec détails par méthode de paiement
    - Vue incluant numéro de semaine, année, revenus, nombre de transactions

  2. Modifications de Tables
    - Ajouter `duration` (durée en minutes) à services
    - Ajouter `description` (description détaillée) à services
    - Ajouter `is_visible` (visibilité sur le site) à services
    - Ajouter `preparation_time` (temps de préparation) à services

  3. Sécurité
    - Accorder permissions de lecture aux utilisateurs authentifiés
*/

-- Ajouter de nouvelles colonnes à la table services
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'duration'
  ) THEN
    ALTER TABLE services ADD COLUMN duration integer DEFAULT 30;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'description'
  ) THEN
    ALTER TABLE services ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'is_visible'
  ) THEN
    ALTER TABLE services ADD COLUMN is_visible boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'preparation_time'
  ) THEN
    ALTER TABLE services ADD COLUMN preparation_time integer DEFAULT 0;
  END IF;
END $$;

-- Créer une vue pour les revenus hebdomadaires
CREATE OR REPLACE VIEW weekly_revenue AS
SELECT
  DATE_PART('week', t.created_at) AS week_number,
  DATE_PART('year', t.created_at) AS year,
  TO_CHAR(DATE_TRUNC('week', t.created_at), 'DD/MM/YYYY') AS week_start,
  t.payment_method,
  COUNT(*) AS transaction_count,
  SUM(t.total_amount) AS total_revenue,
  COUNT(DISTINCT t.client_id) AS unique_clients
FROM pos_transactions t
WHERE t.payment_status = 'paid'
GROUP BY DATE_PART('week', t.created_at), DATE_PART('year', t.created_at), DATE_TRUNC('week', t.created_at), t.payment_method
ORDER BY year DESC, week_number DESC;

-- Accorder les permissions
GRANT SELECT ON weekly_revenue TO authenticated;
