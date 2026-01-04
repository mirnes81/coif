/*
  # Support pour plusieurs clients par transaction POS
  
  1. Nouvelle table
    - `pos_transaction_clients` - Table de liaison entre transactions et clients
      - `transaction_id` (uuid) - Référence à la transaction
      - `client_id` (uuid) - Référence au client
      - `is_primary` (boolean) - Indique si c'est le client principal (payeur)
      
  2. Pourquoi
    - Permet d'enregistrer qu'un parent a payé pour plusieurs enfants
    - Garde l'historique de qui était présent lors de la transaction
    - Le champ `client_id` dans `pos_transactions` reste pour compatibilité (client payeur)
    
  3. Sécurité
    - RLS activé avec politiques pour authentifiés
*/

-- Créer la table de liaison
CREATE TABLE IF NOT EXISTS pos_transaction_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_pos_transaction_clients_transaction_id ON pos_transaction_clients(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_clients_client_id ON pos_transaction_clients(client_id);

-- Éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_transaction_clients_unique ON pos_transaction_clients(transaction_id, client_id);

-- RLS
ALTER TABLE pos_transaction_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins authentifiés peuvent tout voir sur pos_transaction_clients"
  ON pos_transaction_clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins authentifiés peuvent insérer pos_transaction_clients"
  ON pos_transaction_clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins authentifiés peuvent mettre à jour pos_transaction_clients"
  ON pos_transaction_clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins authentifiés peuvent supprimer pos_transaction_clients"
  ON pos_transaction_clients FOR DELETE
  TO authenticated
  USING (true);

-- Vue enrichie des transactions avec tous les clients
CREATE OR REPLACE VIEW pos_transactions_with_all_clients AS
SELECT 
  t.id as transaction_id,
  t.client_id as primary_client_id,
  t.total_amount,
  t.payment_method,
  t.payment_status,
  t.items,
  t.created_at,
  t.created_by,
  jsonb_agg(
    jsonb_build_object(
      'client_id', c.id,
      'client_number', c.client_number,
      'first_name', c.first_name,
      'last_name', c.last_name,
      'is_primary', COALESCE(tc.is_primary, false)
    )
  ) as clients
FROM pos_transactions t
LEFT JOIN pos_transaction_clients tc ON t.id = tc.transaction_id
LEFT JOIN clients c ON tc.client_id = c.id
GROUP BY t.id, t.client_id, t.total_amount, t.payment_method, t.payment_status, t.items, t.created_at, t.created_by;

-- Grant access
GRANT SELECT ON pos_transactions_with_all_clients TO authenticated;
