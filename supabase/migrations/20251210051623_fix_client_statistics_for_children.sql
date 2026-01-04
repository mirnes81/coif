/*
  # Correction des statistiques clients pour les enfants
  
  1. Problème résolu
    - Les enfants n'ont pas de statistiques car la vue utilise uniquement `pt.client_id` (payeur)
    - Les enfants ne sont jamais payeurs, donc leurs statistiques sont toujours à zéro
    
  2. Solution
    - Utiliser `pos_transaction_clients` au lieu de `pos_transactions.client_id`
    - Compter toutes les transactions où le client était présent (parent ou enfant)
    - Les montants sont toujours comptabilisés (même si c'est le parent qui a payé)
    
  3. Changements
    - Recréer la vue `client_pos_statistics` avec jointure sur `pos_transaction_clients`
    - Chaque client (parent ou enfant) voit maintenant ses propres visites
    - Les statistiques de fréquence et de services sont maintenant correctes pour tous
    
  4. Important
    - Pour les parents: incluent leurs propres transactions + celles de leurs enfants
    - Pour les enfants: incluent uniquement les transactions où ils étaient présents
    - Les montants restent attribués au parent payeur mais les visites sont comptées pour tous
*/

-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS client_pos_statistics;

-- Recréer la vue avec pos_transaction_clients
CREATE OR REPLACE VIEW client_pos_statistics AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  COUNT(DISTINCT ptc.transaction_id) as total_visits,
  COALESCE(SUM(CASE WHEN pt.payment_status = 'paid' THEN pt.total_amount ELSE 0 END), 0) as total_spent,
  COALESCE(AVG(CASE WHEN pt.payment_status = 'paid' THEN pt.total_amount ELSE NULL END), 0) as average_spent,
  MAX(pt.created_at) as last_visit,
  MIN(pt.created_at) as first_visit,
  COUNT(DISTINCT CASE WHEN pt.payment_method = 'cash' AND pt.payment_status = 'paid' THEN ptc.transaction_id END) as cash_payments,
  COUNT(DISTINCT CASE WHEN pt.payment_method = 'twint' AND pt.payment_status = 'paid' THEN ptc.transaction_id END) as twint_payments,
  SUM(CASE WHEN pt.payment_method = 'cash' AND pt.payment_status = 'paid' THEN pt.total_amount ELSE 0 END) as cash_total,
  SUM(CASE WHEN pt.payment_method = 'twint' AND pt.payment_status = 'paid' THEN pt.total_amount ELSE 0 END) as twint_total
FROM clients c
LEFT JOIN pos_transaction_clients ptc ON c.id = ptc.client_id
LEFT JOIN pos_transactions pt ON ptc.transaction_id = pt.id
GROUP BY c.id, c.first_name, c.last_name, c.phone, c.email;

-- Grant access
GRANT SELECT ON client_pos_statistics TO authenticated;