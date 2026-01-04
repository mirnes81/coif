/*
  # Admin and Client Management System
  
  1. New Tables
    - `admins` - Admin user profiles
    - `clients` - Client information and records  
    - `client_photos` - Photos associated with clients
    - `client_history` - Complete history of client interactions
    - `pos_transactions` - Point of sale transactions
    - `gallery_settings` - Settings for gallery management
  
  2. Security
    - Enable RLS on all tables
    - Policies restricted to authenticated admins
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view own profile" ON admins;
CREATE POLICY "Admins can view own profile"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update own profile" ON admins;
CREATE POLICY "Admins can update own profile"
  ON admins FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert clients" ON clients;
CREATE POLICY "Admins can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update clients" ON clients;
CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Create client_photos table
CREATE TABLE IF NOT EXISTS client_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  description text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE client_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view client photos" ON client_photos;
CREATE POLICY "Admins can view client photos"
  ON client_photos FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert client photos" ON client_photos;
CREATE POLICY "Admins can insert client photos"
  ON client_photos FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete client photos" ON client_photos;
CREATE POLICY "Admins can delete client photos"
  ON client_photos FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Create client_history table
CREATE TABLE IF NOT EXISTS client_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view client history" ON client_history;
CREATE POLICY "Admins can view client history"
  ON client_history FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert client history" ON client_history;
CREATE POLICY "Admins can insert client history"
  ON client_history FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Create pos_transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  total_amount decimal(10, 2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'twint',
  payment_status text NOT NULL DEFAULT 'pending',
  items jsonb NOT NULL,
  twint_qr_code text,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view transactions" ON pos_transactions;
CREATE POLICY "Admins can view transactions"
  ON pos_transactions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert transactions" ON pos_transactions;
CREATE POLICY "Admins can insert transactions"
  ON pos_transactions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update transactions" ON pos_transactions;
CREATE POLICY "Admins can update transactions"
  ON pos_transactions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Create gallery_settings table
CREATE TABLE IF NOT EXISTS gallery_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage gallery settings" ON gallery_settings;
CREATE POLICY "Admins can manage gallery settings"
  ON gallery_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_client_photos_client_id ON client_photos(client_id);
CREATE INDEX IF NOT EXISTS idx_client_history_client_id ON client_history(client_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_client_id ON pos_transactions(client_id);