/*
  # Amélioration du système de transactions POS et ajout de statistiques

  1. Modifications
    - Modifier payment_method pour permettre 'cash' et 'twint' uniquement
    - Ajouter des index pour améliorer les performances des requêtes statistiques
    - Créer des vues pour les statistiques par période (1j, 7j, 30j)
    - Créer une vue pour les statistiques par client

  2. Sécurité
    - Maintenir les politiques RLS existantes
    - Permettre UPDATE sur payment_method et payment_status
*/

-- Modifier la contrainte payment_method pour n'accepter que 'cash' et 'twint'
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  ALTER TABLE pos_transactions DROP CONSTRAINT IF EXISTS pos_transactions_payment_method_check;
  
  -- Ajouter la nouvelle contrainte
  ALTER TABLE pos_transactions ADD CONSTRAINT pos_transactions_payment_method_check 
    CHECK (payment_method IN ('cash', 'twint'));
END $$;

-- Modifier payment_status pour accepter 'paid' et 'pending'
DO $$
BEGIN
  ALTER TABLE pos_transactions DROP CONSTRAINT IF EXISTS pos_transactions_payment_status_check;
  ALTER TABLE pos_transactions ADD CONSTRAINT pos_transactions_payment_status_check 
    CHECK (payment_status IN ('paid', 'pending'));
END $$;

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON pos_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_client_id ON pos_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_payment_method ON pos_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_payment_status ON pos_transactions(payment_status);

-- Vue pour les statistiques quotidiennes (1 jour, 7 jours, 30 jours)
CREATE OR REPLACE VIEW pos_daily_stats AS
SELECT 
  DATE(created_at) as transaction_date,
  payment_method,
  payment_status,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_transaction
FROM pos_transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), payment_method, payment_status
ORDER BY transaction_date DESC, payment_method;

-- Vue pour les statistiques par client
CREATE OR REPLACE VIEW client_pos_statistics AS
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
  COUNT(CASE WHEN pt.payment_method = 'cash' AND pt.payment_status = 'paid' THEN 1 END) as cash_payments,
  COUNT(CASE WHEN pt.payment_method = 'twint' AND pt.payment_status = 'paid' THEN 1 END) as twint_payments,
  SUM(CASE WHEN pt.payment_method = 'cash' AND pt.payment_status = 'paid' THEN pt.total_amount ELSE 0 END) as cash_total,
  SUM(CASE WHEN pt.payment_method = 'twint' AND pt.payment_status = 'paid' THEN pt.total_amount ELSE 0 END) as twint_total
FROM clients c
LEFT JOIN pos_transactions pt ON c.id = pt.client_id
GROUP BY c.id, c.first_name, c.last_name, c.phone, c.email;

-- Vue pour les statistiques globales par période
CREATE OR REPLACE VIEW pos_period_stats AS
SELECT 
  CASE 
    WHEN created_at >= CURRENT_DATE THEN '1_day'
    WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN '7_days'
    WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN '30_days'
    ELSE 'older'
  END as period,
  payment_method,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
  AVG(CASE WHEN payment_status = 'paid' THEN total_amount ELSE NULL END) as average_transaction,
  COUNT(DISTINCT client_id) as unique_clients
FROM pos_transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 
  CASE 
    WHEN created_at >= CURRENT_DATE THEN '1_day'
    WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN '7_days'
    WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN '30_days'
    ELSE 'older'
  END,
  payment_method;

-- Autoriser la modification du payment_method et payment_status
CREATE POLICY "Authenticated users can update payment info" ON pos_transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
