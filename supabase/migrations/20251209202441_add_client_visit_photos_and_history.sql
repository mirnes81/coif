/*
  # Add Client Visit Photos and Enhanced History Tracking

  1. Changes to Tables
    - Add `photo_url` column to `pos_transactions` to store client photos for each visit
    - Add `notes` column to `pos_transactions` for visit notes

  2. New Views
    - Create `client_last_visit` view showing the most recent visit for each client
    - Create `client_service_history` view showing detailed service history with colors

  3. Security
    - Update RLS policies to allow photo uploads
*/

-- Add photo_url and notes to pos_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pos_transactions' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE pos_transactions ADD COLUMN photo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pos_transactions' AND column_name = 'notes'
  ) THEN
    ALTER TABLE pos_transactions ADD COLUMN notes text;
  END IF;
END $$;

-- Create view for client's last visit information
CREATE OR REPLACE VIEW client_last_visit AS
SELECT DISTINCT ON (c.id)
  c.id as client_id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  t.id as last_transaction_id,
  t.created_at as last_visit_date,
  t.total_amount as last_visit_amount,
  t.payment_method as last_payment_method,
  t.items as last_items,
  t.photo_url as last_photo_url,
  t.notes as last_notes
FROM clients c
LEFT JOIN pos_transactions t ON c.id = t.client_id
ORDER BY c.id, t.created_at DESC NULLS LAST;

-- Create view for detailed service history with statistics
CREATE OR REPLACE VIEW client_service_history AS
SELECT 
  c.id as client_id,
  c.first_name,
  c.last_name,
  t.id as transaction_id,
  t.created_at as visit_date,
  t.total_amount,
  t.payment_method,
  t.items,
  t.photo_url,
  t.notes,
  jsonb_array_length(t.items) as items_count,
  (
    SELECT COUNT(*)
    FROM pos_transactions t2
    WHERE t2.client_id = c.id
  ) as total_visits,
  (
    SELECT SUM(total_amount)
    FROM pos_transactions t2
    WHERE t2.client_id = c.id
  ) as total_spent
FROM clients c
LEFT JOIN pos_transactions t ON c.id = t.client_id
ORDER BY c.id, t.created_at DESC NULLS LAST;

-- Grant access to views
GRANT SELECT ON client_last_visit TO authenticated;
GRANT SELECT ON client_service_history TO authenticated;

-- Update RLS policy for pos_transactions to allow photo updates
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON pos_transactions;
CREATE POLICY "Authenticated users can update transactions"
  ON pos_transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
