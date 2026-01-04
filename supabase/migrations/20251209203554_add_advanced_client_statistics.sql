/*
  # Add Advanced Client Statistics and Service Tracking

  1. New Views
    - `client_monthly_stats` - Statistics grouped by month for each client
    - `client_yearly_stats` - Statistics grouped by year for each client
    - `client_detailed_stats` - Complete statistics view with all metrics
    - `client_service_frequency` - Frequency of specific services per client

  2. Enhancements
    - Add computed columns for visit frequency metrics
    - Add service category tracking
    - Add spending patterns over time

  3. Security
    - Grant appropriate access to all authenticated users
*/

-- Create view for monthly statistics per client
CREATE OR REPLACE VIEW client_monthly_stats AS
SELECT 
  c.id as client_id,
  c.first_name,
  c.last_name,
  DATE_TRUNC('month', t.created_at) as month,
  COUNT(t.id) as visits_count,
  SUM(t.total_amount) as total_spent,
  AVG(t.total_amount) as avg_spent,
  jsonb_agg(
    jsonb_build_object(
      'date', t.created_at,
      'amount', t.total_amount,
      'items', t.items,
      'payment_method', t.payment_method
    ) ORDER BY t.created_at DESC
  ) as transactions
FROM clients c
LEFT JOIN pos_transactions t ON c.id = t.client_id
WHERE t.id IS NOT NULL
GROUP BY c.id, c.first_name, c.last_name, DATE_TRUNC('month', t.created_at)
ORDER BY c.id, month DESC;

-- Create view for yearly statistics per client
CREATE OR REPLACE VIEW client_yearly_stats AS
SELECT 
  c.id as client_id,
  c.first_name,
  c.last_name,
  EXTRACT(YEAR FROM t.created_at) as year,
  COUNT(t.id) as visits_count,
  SUM(t.total_amount) as total_spent,
  AVG(t.total_amount) as avg_spent,
  COUNT(DISTINCT DATE_TRUNC('month', t.created_at)) as active_months
FROM clients c
LEFT JOIN pos_transactions t ON c.id = t.client_id
WHERE t.id IS NOT NULL
GROUP BY c.id, c.first_name, c.last_name, EXTRACT(YEAR FROM t.created_at)
ORDER BY c.id, year DESC;

-- Create comprehensive client statistics view
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
  COALESCE(current_month.visits_this_month, 0) as visits_this_month,
  COALESCE(current_month.spent_this_month, 0) as spent_this_month,
  COALESCE(current_year.visits_this_year, 0) as visits_this_year,
  COALESCE(current_year.spent_this_year, 0) as spent_this_year,
  CASE 
    WHEN stats.last_visit_date IS NULL THEN 0
    ELSE EXTRACT(DAY FROM NOW() - stats.last_visit_date)::integer
  END as days_since_last_visit,
  stats.favorite_payment_method,
  stats.all_services
FROM clients c
LEFT JOIN (
  SELECT 
    client_id,
    COUNT(*) as total_visits,
    SUM(total_amount) as total_spent,
    AVG(total_amount) as avg_spent,
    MAX(created_at) as last_visit_date,
    MIN(created_at) as first_visit_date,
    MODE() WITHIN GROUP (ORDER BY payment_method) as favorite_payment_method,
    jsonb_agg(DISTINCT items) as all_services
  FROM pos_transactions
  GROUP BY client_id
) stats ON c.id = stats.client_id
LEFT JOIN (
  SELECT 
    client_id,
    COUNT(*) as visits_this_month,
    SUM(total_amount) as spent_this_month
  FROM pos_transactions
  WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
  GROUP BY client_id
) current_month ON c.id = current_month.client_id
LEFT JOIN (
  SELECT 
    client_id,
    COUNT(*) as visits_this_year,
    SUM(total_amount) as spent_this_year
  FROM pos_transactions
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
  GROUP BY client_id
) current_year ON c.id = current_year.client_id
ORDER BY stats.last_visit_date DESC NULLS LAST;

-- Create service frequency view to track which services clients use most
CREATE OR REPLACE VIEW client_service_frequency AS
SELECT 
  c.id as client_id,
  c.first_name,
  c.last_name,
  service_item->>'name' as service_name,
  service_item->>'category' as service_category,
  COUNT(*) as times_ordered,
  SUM((service_item->>'quantity')::integer) as total_quantity,
  SUM((service_item->>'price')::numeric * (service_item->>'quantity')::integer) as total_spent_on_service,
  MAX(t.created_at) as last_ordered_date,
  MIN(t.created_at) as first_ordered_date
FROM clients c
JOIN pos_transactions t ON c.id = t.client_id
CROSS JOIN jsonb_array_elements(t.items) as service_item
GROUP BY c.id, c.first_name, c.last_name, service_item->>'name', service_item->>'category'
ORDER BY c.id, times_ordered DESC;

-- Grant access to all new views
GRANT SELECT ON client_monthly_stats TO authenticated;
GRANT SELECT ON client_yearly_stats TO authenticated;
GRANT SELECT ON client_detailed_stats TO authenticated;
GRANT SELECT ON client_service_frequency TO authenticated;
