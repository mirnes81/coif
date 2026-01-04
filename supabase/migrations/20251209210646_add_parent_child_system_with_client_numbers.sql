/*
  # Système Parent/Enfant avec Numéros de Client

  1. Modifications de la table clients
    - `client_number` (text, unique) - Numéro unique du client (ex: C-00001)
    - `date_of_birth` (date) - Date de naissance pour calculer l'âge
    - `parent_id` (uuid, nullable) - Référence au parent si c'est un enfant
    - `is_independent` (boolean) - true si client indépendant (≥16 ans ou parent)
    - `became_independent_at` (timestamptz) - Date où l'enfant est devenu indépendant
    
  2. Fonction pour générer le numéro de client
    - Format: C-00001, C-00002, etc.
    
  3. Fonction pour vérifier l'âge et rendre indépendant
    - Calcule l'âge
    - Si ≥16 ans, marque comme indépendant automatiquement
    
  4. Vue pour voir les enfants d'un parent
    - Liste tous les enfants avec leur âge actuel
    
  5. Mise à jour des transactions
    - Affiche qui a fait la transaction (parent ou enfant)
    
  6. Sécurité
    - RLS policies mises à jour
*/

-- Ajouter les nouvelles colonnes à la table clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'client_number'
  ) THEN
    ALTER TABLE clients ADD COLUMN client_number text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE clients ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN parent_id uuid REFERENCES clients(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'is_independent'
  ) THEN
    ALTER TABLE clients ADD COLUMN is_independent boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'became_independent_at'
  ) THEN
    ALTER TABLE clients ADD COLUMN became_independent_at timestamptz;
  END IF;
END $$;

-- Fonction pour générer le prochain numéro de client
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number int;
  new_client_number text;
BEGIN
  -- Trouver le numéro le plus élevé
  SELECT COALESCE(MAX(CAST(SUBSTRING(client_number FROM 3) AS int)), 0) + 1
  INTO next_number
  FROM clients
  WHERE client_number ~ '^C-[0-9]+$';
  
  -- Formater avec des zéros au début (C-00001)
  new_client_number := 'C-' || LPAD(next_number::text, 5, '0');
  
  RETURN new_client_number;
END;
$$;

-- Fonction pour calculer l'âge d'un client
CREATE OR REPLACE FUNCTION calculate_age(birth_date date)
RETURNS int
LANGUAGE plpgsql
AS $$
BEGIN
  IF birth_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$;

-- Trigger pour assigner automatiquement un numéro de client à la création
CREATE OR REPLACE FUNCTION assign_client_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.client_number IS NULL THEN
    NEW.client_number := generate_client_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_client_number_trigger ON clients;
CREATE TRIGGER assign_client_number_trigger
  BEFORE INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION assign_client_number();

-- Trigger pour vérifier l'âge et rendre indépendant si nécessaire
CREATE OR REPLACE FUNCTION check_independence()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  client_age int;
BEGIN
  -- Calculer l'âge si date de naissance existe
  IF NEW.date_of_birth IS NOT NULL THEN
    client_age := calculate_age(NEW.date_of_birth);
    
    -- Si l'enfant a 16 ans ou plus et n'est pas encore indépendant
    IF client_age >= 16 AND NEW.is_independent = false THEN
      NEW.is_independent := true;
      NEW.became_independent_at := NOW();
      NEW.parent_id := NULL; -- Retirer le lien parent
    END IF;
    
    -- Si c'est un enfant (moins de 16 ans) avec un parent
    IF client_age < 16 AND NEW.parent_id IS NOT NULL THEN
      NEW.is_independent := false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_independence_trigger ON clients;
CREATE TRIGGER check_independence_trigger
  BEFORE INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION check_independence();

-- Mettre à jour les clients existants avec un numéro
UPDATE clients 
SET client_number = generate_client_number()
WHERE client_number IS NULL;

-- Vue pour voir tous les enfants avec leur âge
CREATE OR REPLACE VIEW client_children AS
SELECT 
  c.id,
  c.client_number,
  c.first_name,
  c.last_name,
  c.date_of_birth,
  calculate_age(c.date_of_birth) as age,
  c.parent_id,
  p.client_number as parent_client_number,
  p.first_name as parent_first_name,
  p.last_name as parent_last_name,
  c.is_independent,
  c.became_independent_at,
  c.created_at
FROM clients c
LEFT JOIN clients p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL OR c.is_independent = false;

-- Vue enrichie des clients avec informations familiales
CREATE OR REPLACE VIEW clients_with_family AS
SELECT 
  c.*,
  calculate_age(c.date_of_birth) as age,
  CASE 
    WHEN c.parent_id IS NOT NULL THEN 'child'
    WHEN EXISTS (SELECT 1 FROM clients WHERE parent_id = c.id) THEN 'parent'
    ELSE 'independent'
  END as family_role,
  (SELECT COUNT(*) FROM clients WHERE parent_id = c.id) as children_count
FROM clients c;

-- Vue des transactions avec informations sur qui a fait la transaction
CREATE OR REPLACE VIEW transactions_with_client_info AS
SELECT 
  t.*,
  c.client_number,
  c.first_name,
  c.last_name,
  c.parent_id,
  c.is_independent,
  calculate_age(c.date_of_birth) as client_age,
  CASE 
    WHEN c.parent_id IS NOT NULL THEN 'child'
    WHEN EXISTS (SELECT 1 FROM clients WHERE parent_id = c.id) THEN 'parent'
    ELSE 'independent'
  END as client_role,
  p.client_number as parent_client_number,
  p.first_name as parent_first_name,
  p.last_name as parent_last_name
FROM pos_transactions t
LEFT JOIN clients c ON t.client_id = c.id
LEFT JOIN clients p ON c.parent_id = p.id;

-- Fonction pour transférer l'historique d'un enfant devenu indépendant
-- (L'historique reste lié au même client_id, donc pas besoin de transfert)
-- Mais on peut créer une fonction pour voir l'historique avant/après indépendance
CREATE OR REPLACE FUNCTION get_client_history_timeline(p_client_id uuid)
RETURNS TABLE (
  transaction_id uuid,
  transaction_date timestamptz,
  total_amount numeric,
  was_child boolean,
  age_at_transaction int
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.created_at,
    t.total_amount,
    t.created_at < COALESCE(c.became_independent_at, NOW()) as was_child,
    calculate_age(c.date_of_birth) - EXTRACT(YEAR FROM AGE(NOW(), t.created_at))::int as age_at_transaction
  FROM pos_transactions t
  JOIN clients c ON t.client_id = c.id
  WHERE t.client_id = p_client_id
  ORDER BY t.created_at DESC;
END;
$$;

-- RLS Policies pour les nouvelles vues
ALTER VIEW client_children OWNER TO postgres;
ALTER VIEW clients_with_family OWNER TO postgres;
ALTER VIEW transactions_with_client_info OWNER TO postgres;

-- Grant access aux vues
GRANT SELECT ON client_children TO authenticated;
GRANT SELECT ON clients_with_family TO authenticated;
GRANT SELECT ON transactions_with_client_info TO authenticated;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_parent_id ON clients(parent_id);
CREATE INDEX IF NOT EXISTS idx_clients_date_of_birth ON clients(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_clients_is_independent ON clients(is_independent);
CREATE INDEX IF NOT EXISTS idx_clients_client_number ON clients(client_number);