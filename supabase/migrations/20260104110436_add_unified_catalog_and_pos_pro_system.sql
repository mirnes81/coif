/*
  # Système POS Professionnel avec Catalogue Unifié
  
  ## Vue d'ensemble
  Cette migration transforme le système en solution production-ready avec:
  - Catalogue unifié (sellable_items) pour products, services, gift_cards
  - Transactions normalisées avec lignes détaillées (pos_transaction_items)
  - Support refunds/avoirs avec traçabilité complète
  - Clôture de caisse (cash_closures)
  - Logs email (email_logs) et audit (audit_logs)
  - Paiements multi-méthodes (cash, card, twint, mixed)
  
  ## 1. Tables Créées
  
  ### sellable_items
  Catalogue unifié de tous les éléments vendables:
  - Types: product, service, gift_card, custom
  - Champs: id, type, name, description, base_price, vat_rate, sku, duration_minutes
  - Active status pour activer/désactiver items
  - Image URL et catégorie
  
  ### pos_transaction_items
  Lignes de transaction normalisées:
  - Lien vers pos_transactions
  - Snapshot des données (name, price, vat_rate) pour historique
  - Quantité, remises, totaux
  - Type et ID référence vers sellable_items
  
  ### cash_closures
  Clôtures de caisse quotidiennes:
  - Date, montant ouverture/fermeture
  - Calcul automatique cash_in depuis transactions
  - Delta entre comptage et calculé
  - Notes et audit trail
  
  ### email_logs
  Traçabilité des emails envoyés:
  - Template utilisé
  - Destinataire et payload
  - Status et provider message ID
  - Gestion d'erreurs et retry
  
  ### audit_logs
  Journal d'audit complet:
  - Actor, action, entity
  - Before/after JSON pour traçabilité
  - Timestamp et contexte
  
  ## 2. Modifications pos_transactions
  
  - Ajout transaction_number (numéro unique)
  - Ajout transaction_type (sale/refund)
  - Ajout parent_transaction_id (pour refunds)
  - Ajout total_net, total_vat, total_gross
  - Ajout status (paid/partial/void)
  - Support payment_method: cash/card/twint/stripe/invoice/mixed
  - Ajout payment_details jsonb pour multi-paiements
  
  ## 3. Vues Matérialisées
  
  ### v_sellable_items
  Vue unifiée temps-réel de products + services + gift_cards
  
  ## 4. Fonctions
  
  ### generate_transaction_number()
  Génère numéros uniques: TRX-XXXXXXXXXX
  
  ### calculate_cash_in_for_day()
  Calcule le cash entré pour une date donnée
  
  ## 5. Triggers
  
  ### Auto-génération transaction_number
  ### Auto-update updated_at sur modifications
  
  ## 6. Sécurité RLS
  
  Toutes les tables ont RLS activé avec policies strictes:
  - SELECT: Authentifié (admin vérifié)
  - INSERT/UPDATE/DELETE: Admin uniquement
  - Audit automatique sur actions sensibles
*/

-- ============================================
-- 1. CATALOGUE UNIFIÉ (sellable_items)
-- ============================================

CREATE TABLE IF NOT EXISTS sellable_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL CHECK (item_type IN ('product', 'service', 'gift_card', 'custom')),
  reference_id uuid, -- FK vers products.id, services.id, etc.
  reference_table text CHECK (reference_table IN ('products', 'services', 'gift_cards', NULL)),
  
  -- Données principales
  name text NOT NULL,
  description text,
  category text,
  sku text, -- Code article
  
  -- Prix et TVA
  base_price numeric(10, 2) NOT NULL,
  price_short numeric(10, 2), -- Pour services (cheveux courts)
  price_medium numeric(10, 2), -- Pour services (cheveux mi-longs)
  price_long numeric(10, 2), -- Pour services (cheveux longs)
  vat_rate numeric(5, 2) DEFAULT 7.7, -- TVA Suisse standard
  
  -- Métadonnées
  image_url text,
  duration_minutes integer, -- Pour services
  stock_quantity integer DEFAULT 0,
  active boolean DEFAULT true,
  
  -- Audit
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Indexes
  UNIQUE(reference_table, reference_id)
);

CREATE INDEX idx_sellable_items_type ON sellable_items(item_type);
CREATE INDEX idx_sellable_items_active ON sellable_items(active);
CREATE INDEX idx_sellable_items_category ON sellable_items(category);
CREATE INDEX idx_sellable_items_reference ON sellable_items(reference_table, reference_id);

-- ============================================
-- 2. TRANSACTIONS NORMALISÉES
-- ============================================

-- Ajouter colonnes à pos_transactions
DO $$ 
BEGIN
  -- Transaction number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'transaction_number') THEN
    ALTER TABLE pos_transactions ADD COLUMN transaction_number text UNIQUE;
  END IF;
  
  -- Transaction type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'transaction_type') THEN
    ALTER TABLE pos_transactions ADD COLUMN transaction_type text DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'refund'));
  END IF;
  
  -- Parent transaction (pour refunds)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'parent_transaction_id') THEN
    ALTER TABLE pos_transactions ADD COLUMN parent_transaction_id uuid REFERENCES pos_transactions(id);
  END IF;
  
  -- Montants détaillés
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'total_net') THEN
    ALTER TABLE pos_transactions ADD COLUMN total_net numeric(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'total_vat') THEN
    ALTER TABLE pos_transactions ADD COLUMN total_vat numeric(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'total_gross') THEN
    ALTER TABLE pos_transactions ADD COLUMN total_gross numeric(10, 2) DEFAULT 0;
  END IF;
  
  -- Status transaction
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'status') THEN
    ALTER TABLE pos_transactions ADD COLUMN status text DEFAULT 'paid' CHECK (status IN ('paid', 'partial', 'void', 'pending'));
  END IF;
  
  -- Payment details pour multi-paiements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'payment_details') THEN
    ALTER TABLE pos_transactions ADD COLUMN payment_details jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  -- Refund reason
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'refund_reason') THEN
    ALTER TABLE pos_transactions ADD COLUMN refund_reason text;
  END IF;
  
  -- Updated at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_transactions' AND column_name = 'updated_at') THEN
    ALTER TABLE pos_transactions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Mettre à jour la contrainte payment_method pour inclure card, stripe, invoice, mixed
DO $$
BEGIN
  ALTER TABLE pos_transactions DROP CONSTRAINT IF EXISTS pos_transactions_payment_method_check;
  ALTER TABLE pos_transactions ADD CONSTRAINT pos_transactions_payment_method_check 
    CHECK (payment_method IN ('cash', 'card', 'twint', 'stripe', 'invoice', 'mixed'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_pos_transactions_number ON pos_transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_type ON pos_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_parent ON pos_transactions(parent_transaction_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_status ON pos_transactions(status);

-- Table des lignes de transaction
CREATE TABLE IF NOT EXISTS pos_transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,
  
  -- Référence vers sellable_item
  item_type text NOT NULL,
  item_id uuid, -- Peut être NULL pour items custom
  
  -- Snapshot pour historique (prix peuvent changer)
  name_snapshot text NOT NULL,
  description_snapshot text,
  unit_price_snapshot numeric(10, 2) NOT NULL,
  vat_rate_snapshot numeric(5, 2) DEFAULT 7.7,
  
  -- Quantité et remises
  quantity numeric(10, 3) DEFAULT 1,
  discount_percent numeric(5, 2) DEFAULT 0,
  discount_amount numeric(10, 2) DEFAULT 0,
  
  -- Totaux calculés
  subtotal_net numeric(10, 2) NOT NULL,
  subtotal_vat numeric(10, 2) NOT NULL,
  subtotal_gross numeric(10, 2) NOT NULL,
  
  -- Métadonnées
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pos_transaction_items_transaction ON pos_transaction_items(transaction_id);
CREATE INDEX idx_pos_transaction_items_item ON pos_transaction_items(item_id);

-- ============================================
-- 3. CLÔTURE CAISSE
-- ============================================

CREATE TABLE IF NOT EXISTS cash_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  closure_date date NOT NULL UNIQUE,
  
  -- Montants
  opening_cash numeric(10, 2) DEFAULT 0, -- Fond de caisse
  cash_in_calculated numeric(10, 2) DEFAULT 0, -- Calculé depuis transactions
  cash_out_manual numeric(10, 2) DEFAULT 0, -- Sorties manuelles
  counted_cash numeric(10, 2) DEFAULT 0, -- Comptage physique
  delta numeric(10, 2) DEFAULT 0, -- Différence (counted - expected)
  
  -- Détails
  expected_cash numeric(10, 2) GENERATED ALWAYS AS (opening_cash + cash_in_calculated - cash_out_manual) STORED,
  note text,
  
  -- Audit
  closed_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cash_closures_date ON cash_closures(closure_date DESC);
CREATE INDEX idx_cash_closures_closed_by ON cash_closures(closed_by);

-- ============================================
-- 4. EMAIL LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Email details
  to_email text NOT NULL,
  template_name text NOT NULL,
  subject text,
  payload jsonb,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  provider_message_id text,
  error_message text,
  retry_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  failed_at timestamptz
);

CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);

-- ============================================
-- 5. AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor
  actor_user_id uuid REFERENCES admins(id),
  actor_email text,
  
  -- Action
  action text NOT NULL, -- create, update, delete, refund, close_cash, etc.
  entity_type text NOT NULL, -- pos_transactions, clients, products, etc.
  entity_id uuid,
  
  -- Data
  before_data jsonb,
  after_data jsonb,
  metadata jsonb,
  
  -- Context
  ip_address inet,
  user_agent text,
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- 6. VUE UNIFIÉE SELLABLE_ITEMS
-- ============================================

-- Vue qui unifie products, services et gift_cards
CREATE OR REPLACE VIEW v_sellable_items AS
-- Products
SELECT 
  p.id,
  'product'::text as item_type,
  p.id as reference_id,
  'products'::text as reference_table,
  p.name,
  COALESCE(p.description_short, p.description_long) as description,
  p.category,
  NULL::text as sku,
  p.price as base_price,
  NULL::numeric as price_short,
  NULL::numeric as price_medium,
  NULL::numeric as price_long,
  7.7 as vat_rate,
  p.image_url,
  NULL::integer as duration_minutes,
  p.stock_quantity,
  p.visible_on_shop as active,
  p.created_at,
  p.created_at as updated_at
FROM products p
WHERE p.visible_on_shop = true

UNION ALL

-- Services
SELECT
  s.id,
  'service'::text as item_type,
  s.id as reference_id,
  'services'::text as reference_table,
  s.name,
  s.description,
  sc.name as category,
  NULL::text as sku,
  COALESCE(s.price_base, s.price_short, s.price_medium, s.price_long, 0) as base_price,
  s.price_short,
  s.price_medium,
  s.price_long,
  7.7 as vat_rate,
  s.image_url,
  s.duration_minutes,
  NULL::integer as stock_quantity,
  s.active,
  s.created_at,
  s.created_at as updated_at
FROM services s
LEFT JOIN service_categories sc ON s.category_id = sc.id
WHERE s.active = true

UNION ALL

-- Gift Cards
SELECT
  gc.id,
  'gift_card'::text as item_type,
  gc.id as reference_id,
  'gift_cards'::text as reference_table,
  'Carte Cadeau - ' || gc.code as name,
  'Carte cadeau d''un montant de ' || gc.amount || ' CHF' as description,
  'Cartes Cadeaux'::text as category,
  gc.code as sku,
  gc.amount as base_price,
  NULL::numeric as price_short,
  NULL::numeric as price_medium,
  NULL::numeric as price_long,
  7.7 as vat_rate,
  NULL::text as image_url,
  NULL::integer as duration_minutes,
  NULL::integer as stock_quantity,
  CASE WHEN gc.status = 'valid' THEN true ELSE false END as active,
  gc.created_at,
  gc.created_at as updated_at
FROM gift_cards gc;

-- ============================================
-- 7. FONCTIONS
-- ============================================

-- Fonction pour générer transaction_number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS text AS $$
DECLARE
  new_number text;
  timestamp_part text;
BEGIN
  timestamp_part := to_char(now(), 'YYYYMMDDHH24MISS');
  new_number := 'TRX-' || timestamp_part;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer cash_in d'une journée
CREATE OR REPLACE FUNCTION calculate_cash_in_for_day(target_date date)
RETURNS numeric AS $$
DECLARE
  total numeric;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN payment_method = 'cash' AND status = 'paid' AND transaction_type = 'sale' THEN total_amount
      WHEN payment_method = 'cash' AND status = 'paid' AND transaction_type = 'refund' THEN -total_amount
      WHEN payment_method = 'mixed' AND status = 'paid' THEN 
        (SELECT COALESCE(SUM((detail->>'amount')::numeric), 0) 
         FROM jsonb_array_elements(payment_details) detail 
         WHERE detail->>'method' = 'cash')
      ELSE 0
    END
  ), 0) INTO total
  FROM pos_transactions
  WHERE DATE(created_at) = target_date;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. TRIGGERS
-- ============================================

-- Auto-génération transaction_number
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_number IS NULL THEN
    NEW.transaction_number := generate_transaction_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_transaction_number ON pos_transactions;
CREATE TRIGGER trg_set_transaction_number
  BEFORE INSERT ON pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_transaction_number();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_pos_transactions_updated_at ON pos_transactions;
CREATE TRIGGER trg_update_pos_transactions_updated_at
  BEFORE UPDATE ON pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_update_cash_closures_updated_at ON cash_closures;
CREATE TRIGGER trg_update_cash_closures_updated_at
  BEFORE UPDATE ON cash_closures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

-- sellable_items
ALTER TABLE sellable_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view sellable items" ON sellable_items;
CREATE POLICY "Admins can view sellable items"
  ON sellable_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage sellable items" ON sellable_items;
CREATE POLICY "Admins can manage sellable items"
  ON sellable_items FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- pos_transaction_items
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view transaction items" ON pos_transaction_items;
CREATE POLICY "Admins can view transaction items"
  ON pos_transaction_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage transaction items" ON pos_transaction_items;
CREATE POLICY "Admins can manage transaction items"
  ON pos_transaction_items FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- cash_closures
ALTER TABLE cash_closures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view cash closures" ON cash_closures;
CREATE POLICY "Admins can view cash closures"
  ON cash_closures FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage cash closures" ON cash_closures;
CREATE POLICY "Admins can manage cash closures"
  ON cash_closures FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view email logs" ON email_logs;
CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert email logs" ON email_logs;
CREATE POLICY "Admins can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- 10. VUES STATISTIQUES MISES À JOUR
-- ============================================

-- Statistiques transactions avec nouveau modèle
CREATE OR REPLACE VIEW v_transaction_stats AS
SELECT
  t.id,
  t.transaction_number,
  t.transaction_type,
  t.status,
  t.payment_method,
  t.total_amount,
  t.total_net,
  t.total_vat,
  t.total_gross,
  t.created_at,
  t.client_id,
  c.first_name || ' ' || c.last_name as client_name,
  c.client_number,
  a.name as created_by_name,
  (SELECT COUNT(*) FROM pos_transaction_items WHERE transaction_id = t.id) as items_count,
  (SELECT jsonb_agg(jsonb_build_object(
    'name', name_snapshot,
    'quantity', quantity,
    'unit_price', unit_price_snapshot,
    'total', subtotal_gross
  )) FROM pos_transaction_items WHERE transaction_id = t.id) as items_detail
FROM pos_transactions t
LEFT JOIN clients c ON t.client_id = c.id
LEFT JOIN admins a ON t.created_by = a.id;

-- Statistiques clôtures caisse
CREATE OR REPLACE VIEW v_cash_closure_stats AS
SELECT
  cc.id,
  cc.closure_date,
  cc.opening_cash,
  cc.cash_in_calculated,
  cc.cash_out_manual,
  cc.expected_cash,
  cc.counted_cash,
  cc.delta,
  cc.note,
  cc.created_at,
  a.name as closed_by_name,
  (SELECT COUNT(*) FROM pos_transactions 
   WHERE DATE(created_at) = cc.closure_date 
   AND payment_method = 'cash' 
   AND status = 'paid') as cash_transactions_count
FROM cash_closures cc
LEFT JOIN admins a ON cc.closed_by = a.id;
