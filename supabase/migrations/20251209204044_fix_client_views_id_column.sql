/*
  # Fix Client Views ID Column

  1. Changes
    - Update `client_last_visit` view to use `id` instead of `client_id`
    - This ensures compatibility with the Client interface and frontend component

  2. Security
    - No changes to RLS policies
*/

-- Recreate client_last_visit view with correct column naming
DROP VIEW IF EXISTS client_last_visit;

CREATE OR REPLACE VIEW client_last_visit AS
SELECT DISTINCT ON (c.id)
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.address,
  c.notes,
  c.created_at,
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

-- Grant access to view
GRANT SELECT ON client_last_visit TO authenticated;
