/*
  # Corriger l'historique et les statistiques pour inclure les enfants

  ## Problème
  - Les enfants ont des enregistrements dans `client_history` mais n'apparaissent pas dans leurs statistiques
  - Les vues utilisent uniquement `pos_transactions.client_id` (parent payeur)
  - Les enfants ne voient pas les visites où ils étaient présents

  ## Solution
  1. Modifier `client_service_history` pour inclure TOUS les clients depuis `client_history`
  2. Mettre à jour `client_detailed_stats` pour compter toutes les visites (parent + enfants)
  3. Mettre à jour `client_monthly_stats` et `client_yearly_stats`
  4. Mettre à jour `client_service_frequency` pour les services des enfants

  ## Structure de client_history
  - `client_id` : ID du client (parent ou enfant)
  - `metadata->transaction_id` : ID de la transaction
  - `metadata->items` : Articles achetés
  - Jointure avec `pos_transactions` pour obtenir montant, méthode de paiement, etc.
*/

-- Recréer la vue client_service_history pour inclure TOUS les clients depuis client_history
DROP VIEW IF EXISTS client_service_history CASCADE;
CREATE OR REPLACE VIEW client_service_history AS
SELECT 
  ch.client_id,
  c.first_name,
  c.last_name,
  (ch.metadata->>'transaction_id')::uuid as transaction_id,
  ch.created_at as visit_date,
  t.total_amount,
  t.payment_method,
  COALESCE(ch.metadata->'items', t.items) as items,
  t.photo_url,
  t.notes,
  CASE 
    WHEN t.client_id = ch.client_id THEN true 
    ELSE false 
  END as is_primary_client,
  jsonb_array_length(COALESCE(ch.metadata->'items', t.items, '[]'::jsonb)) as items_count,
  (
    SELECT COUNT(DISTINCT (ch2.metadata->>'transaction_id')::uuid)
    FROM client_history ch2
    WHERE ch2.client_id = ch.client_id
    AND ch2.action_type = 'purchase'
    AND ch2.metadata->>'transaction_id' IS NOT NULL
  ) as total_visits,
  (
    SELECT SUM(t2.total_amount)
    FROM client_history ch2
    JOIN pos_transactions t2 ON (ch2.metadata->>'transaction_id')::uuid = t2.id
    WHERE ch2.client_id = ch.client_id
    AND ch2.action_type = 'purchase'
  ) as total_spent
FROM client_history ch
JOIN clients c ON c.id = ch.client_id
LEFT JOIN pos_transactions t ON (ch.metadata->>'transaction_id')::uuid = t.id
WHERE ch.action_type = 'purchase'
AND ch.metadata->>'transaction_id' IS NOT NULL
ORDER BY ch.client_id, ch.created_at DESC;

-- Recréer client_detailed_stats pour inclure tous les clients depuis client_history
DROP VIEW IF EXISTS client_detailed_stats CASCADE;
CREATE OR REPLACE VIEW client_detailed_stats AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.address,
  c.notes,
  c.created_at as client_since,
  COALESCE(stats.total_visits, 0) as total_visits,
  COALESCE(stats.total_spent, 0) as total_spent,
  COALESCE(stats.avg_spent, 0) as avg_spent,
  stats.last_visit_date,
  stats.first_visit_date,
  COALESCE(stats.visits_this_month, 0) as visits_this_month,
  COALESCE(stats.spent_this_month, 0) as spent_this_month,
  COALESCE(stats.visits_this_year, 0) as visits_this_year,
  COALESCE(stats.spent_this_year, 0) as spent_this_year,
  COALESCE(
    EXTRACT(DAY FROM (NOW() - stats.last_visit_date))::INTEGER,
    999
  ) as days_since_last_visit,
  stats.favorite_payment_method,
  stats.all_services
FROM clients c
LEFT JOIN (
  SELECT 
    ch.client_id,
    COUNT(DISTINCT (ch.metadata->>'transaction_id')::uuid) as total_visits,
    SUM(t.total_amount) as total_spent,
    AVG(t.total_amount) as avg_spent,
    MAX(ch.created_at) as last_visit_date,
    MIN(ch.created_at) as first_visit_date,
    COUNT(DISTINCT (ch.metadata->>'transaction_id')::uuid) FILTER (
      WHERE DATE_TRUNC('month', ch.created_at) = DATE_TRUNC('month', NOW())
    ) as visits_this_month,
    SUM(t.total_amount) FILTER (
      WHERE DATE_TRUNC('month', ch.created_at) = DATE_TRUNC('month', NOW())
    ) as spent_this_month,
    COUNT(DISTINCT (ch.metadata->>'transaction_id')::uuid) FILTER (
      WHERE DATE_TRUNC('year', ch.created_at) = DATE_TRUNC('year', NOW())
    ) as visits_this_year,
    SUM(t.total_amount) FILTER (
      WHERE DATE_TRUNC('year', ch.created_at) = DATE_TRUNC('year', NOW())
    ) as spent_this_year,
    MODE() WITHIN GROUP (ORDER BY t.payment_method) as favorite_payment_method,
    jsonb_agg(DISTINCT item) FILTER (WHERE item IS NOT NULL) as all_services
  FROM client_history ch
  JOIN pos_transactions t ON (ch.metadata->>'transaction_id')::uuid = t.id
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ch.metadata->'items', t.items)) as item
  WHERE ch.action_type = 'purchase'
  AND ch.metadata->>'transaction_id' IS NOT NULL
  GROUP BY ch.client_id
) stats ON stats.client_id = c.id;

-- Recréer client_monthly_stats pour inclure tous les clients
DROP VIEW IF EXISTS client_monthly_stats CASCADE;
CREATE OR REPLACE VIEW client_monthly_stats AS
SELECT 
  ch.client_id,
  TO_CHAR(ch.created_at, 'YYYY-MM') as month,
  COUNT(DISTINCT (ch.metadata->>'transaction_id')::uuid) as visits_count,
  SUM(t.total_amount) as total_spent,
  AVG(t.total_amount) as avg_spent,
  jsonb_agg(
    jsonb_build_object(
      'transaction_id', ch.metadata->>'transaction_id',
      'date', ch.created_at,
      'amount', t.total_amount,
      'payment_method', t.payment_method,
      'items', COALESCE(ch.metadata->'items', t.items)
    ) ORDER BY ch.created_at DESC
  ) as transactions
FROM client_history ch
JOIN pos_transactions t ON (ch.metadata->>'transaction_id')::uuid = t.id
WHERE ch.action_type = 'purchase'
AND ch.metadata->>'transaction_id' IS NOT NULL
GROUP BY ch.client_id, TO_CHAR(ch.created_at, 'YYYY-MM')
ORDER BY ch.client_id, month DESC;

-- Recréer client_yearly_stats pour inclure tous les clients
DROP VIEW IF EXISTS client_yearly_stats CASCADE;
CREATE OR REPLACE VIEW client_yearly_stats AS
SELECT 
  ch.client_id,
  EXTRACT(YEAR FROM ch.created_at)::INTEGER as year,
  COUNT(DISTINCT (ch.metadata->>'transaction_id')::uuid) as visits_count,
  SUM(t.total_amount) as total_spent,
  AVG(t.total_amount) as avg_spent,
  COUNT(DISTINCT TO_CHAR(ch.created_at, 'YYYY-MM')) as active_months
FROM client_history ch
JOIN pos_transactions t ON (ch.metadata->>'transaction_id')::uuid = t.id
WHERE ch.action_type = 'purchase'
AND ch.metadata->>'transaction_id' IS NOT NULL
GROUP BY ch.client_id, EXTRACT(YEAR FROM ch.created_at)
ORDER BY ch.client_id, year DESC;

-- Recréer client_service_frequency pour inclure tous les clients
DROP VIEW IF EXISTS client_service_frequency CASCADE;
CREATE OR REPLACE VIEW client_service_frequency AS
SELECT 
  ch.client_id,
  item->>'name' as service_name,
  item->>'category' as service_category,
  COUNT(*) as times_ordered,
  SUM((item->>'quantity')::INTEGER) as total_quantity,
  SUM((item->>'price')::NUMERIC * (item->>'quantity')::INTEGER) as total_spent_on_service,
  MAX(ch.created_at) as last_ordered_date,
  MIN(ch.created_at) as first_ordered_date
FROM client_history ch
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ch.metadata->'items', '[]'::jsonb)) as item
WHERE ch.action_type = 'purchase'
AND ch.metadata->>'transaction_id' IS NOT NULL
GROUP BY ch.client_id, item->>'name', item->>'category'
ORDER BY ch.client_id, times_ordered DESC;

-- Accorder les permissions
GRANT SELECT ON client_service_history TO authenticated;
GRANT SELECT ON client_detailed_stats TO authenticated;
GRANT SELECT ON client_monthly_stats TO authenticated;
GRANT SELECT ON client_yearly_stats TO authenticated;
GRANT SELECT ON client_service_frequency TO authenticated;
