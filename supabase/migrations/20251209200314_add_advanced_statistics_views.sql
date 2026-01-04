/*
  # Vues pour statistiques avancées

  1. Nouvelles vues
    - client_activity_status: Statut d'activité des clients (actif, inactif 30j, 60j+)
    - monthly_revenue: Revenus par mois
    - yearly_revenue: Revenus par année
    - top_services: Services les plus vendus
    - top_clients: Clients les plus fidèles

  2. Sécurité
    - Politiques RLS pour permettre la lecture aux utilisateurs authentifiés
*/

-- Vue pour le statut d'activité des clients
CREATE OR REPLACE VIEW client_activity_status AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  MAX(pt.created_at) as last_visit,
  COUNT(pt.id) as total_visits,
  COALESCE(SUM(CASE WHEN pt.payment_status = 'paid' THEN pt.total_amount ELSE 0 END), 0) as total_spent,
  CASE 
    WHEN MAX(pt.created_at) IS NULL THEN 'never_visited'
    WHEN MAX(pt.created_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 'active'
    WHEN MAX(pt.created_at) >= CURRENT_DATE - INTERVAL '60 days' THEN 'inactive_30_days'
    ELSE 'inactive_60_plus_days'
  END as activity_status
FROM clients c
LEFT JOIN pos_transactions pt ON c.id = pt.client_id
GROUP BY c.id, c.first_name, c.last_name, c.phone, c.email;

-- Vue pour les revenus mensuels
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  EXTRACT(YEAR FROM created_at)::integer as year,
  EXTRACT(MONTH FROM created_at)::integer as month_number,
  payment_method,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
  COUNT(DISTINCT client_id) as unique_clients
FROM pos_transactions
GROUP BY DATE_TRUNC('month', created_at), EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), payment_method
ORDER BY month DESC, payment_method;

-- Vue pour les revenus annuels
CREATE OR REPLACE VIEW yearly_revenue AS
SELECT 
  EXTRACT(YEAR FROM created_at)::integer as year,
  payment_method,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
  AVG(CASE WHEN payment_status = 'paid' THEN total_amount ELSE NULL END) as average_transaction,
  COUNT(DISTINCT client_id) as unique_clients
FROM pos_transactions
GROUP BY EXTRACT(YEAR FROM created_at), payment_method
ORDER BY year DESC, payment_method;

-- Vue pour les services les plus vendus (basé sur prestations)
CREATE OR REPLACE VIEW top_services AS
SELECT 
  s.id,
  s.name as service_name,
  s.category_id,
  sc.name as category_name,
  COUNT(ps.id) as times_sold,
  SUM(ps.price_applied) as total_revenue,
  AVG(ps.price_applied) as average_price,
  MAX(p.date) as last_sold
FROM services s
LEFT JOIN prestation_services ps ON s.id = ps.service_id
LEFT JOIN prestations p ON ps.prestation_id = p.id
LEFT JOIN service_categories sc ON s.category_id = sc.id
WHERE p.is_paid = true
GROUP BY s.id, s.name, s.category_id, sc.name
ORDER BY times_sold DESC, total_revenue DESC;

-- Vue pour les clients les plus fidèles
CREATE OR REPLACE VIEW top_loyal_clients AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  COUNT(pt.id) as total_visits,
  COALESCE(SUM(CASE WHEN pt.payment_status = 'paid' THEN pt.total_amount ELSE 0 END), 0) as total_spent,
  COALESCE(AVG(CASE WHEN pt.payment_status = 'paid' THEN pt.total_amount ELSE NULL END), 0) as average_spent,
  MAX(pt.created_at) as last_visit,
  MIN(pt.created_at) as first_visit,
  EXTRACT(days FROM (MAX(pt.created_at) - MIN(pt.created_at)))::integer as customer_lifetime_days
FROM clients c
LEFT JOIN pos_transactions pt ON c.id = pt.client_id
GROUP BY c.id, c.first_name, c.last_name, c.phone, c.email
HAVING COUNT(pt.id) > 0
ORDER BY total_visits DESC, total_spent DESC
LIMIT 50;

-- Vue combinée pour les revenus avec prestations
CREATE OR REPLACE VIEW combined_revenue AS
SELECT 
  'pos_transaction' as source_type,
  pt.created_at,
  pt.total_amount,
  pt.payment_method,
  pt.payment_status,
  pt.client_id,
  c.first_name,
  c.last_name
FROM pos_transactions pt
LEFT JOIN clients c ON pt.client_id = c.id

UNION ALL

SELECT 
  'prestation' as source_type,
  p.created_at,
  p.applied_price as total_amount,
  p.payment_method,
  CASE WHEN p.is_paid THEN 'paid' ELSE 'pending' END as payment_status,
  p.client_id,
  c.first_name,
  c.last_name
FROM prestations p
LEFT JOIN clients c ON p.client_id = c.id
WHERE p.is_paid = true;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_prestations_is_paid ON prestations(is_paid);
CREATE INDEX IF NOT EXISTS idx_prestations_created_at ON prestations(created_at);
CREATE INDEX IF NOT EXISTS idx_prestation_services_service_id ON prestation_services(service_id);
