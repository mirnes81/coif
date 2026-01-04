/*
  # Add Family Tags System for Clients
  
  1. New Tables
    - `client_tags`
      - `id` (uuid, primary key)
      - `name` (text) - Tag name (e.g., "Famille Dupont")
      - `color` (text) - Color for UI display
      - `created_at` (timestamptz)
      
    - `client_tag_assignments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `tag_id` (uuid, foreign key to client_tags)
      - `created_at` (timestamptz)
      
  2. Views
    - `clients_with_tags` - Clients with their tags aggregated
    - `family_members` - View to see all members of a family tag
    
  3. Security
    - Enable RLS on both new tables
    - Add policies for authenticated admin users
    
  4. Usage
    - Tags can represent families (e.g., "Famille Dupont")
    - Multiple clients can share the same tag
    - POS system can show all family members
    - Transaction history can filter by family tag
*/

-- Create client_tags table
CREATE TABLE IF NOT EXISTS client_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all tags"
  ON client_tags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert tags"
  ON client_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update tags"
  ON client_tags
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete tags"
  ON client_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Create client_tag_assignments table
CREATE TABLE IF NOT EXISTS client_tag_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES client_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, tag_id)
);

ALTER TABLE client_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all tag assignments"
  ON client_tag_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert tag assignments"
  ON client_tag_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete tag assignments"
  ON client_tag_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Create view for clients with their tags
CREATE OR REPLACE VIEW clients_with_tags AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  c.address,
  c.notes,
  c.last_visit,
  c.created_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ct.id,
        'name', ct.name,
        'color', ct.color
      ) ORDER BY ct.name
    ) FILTER (WHERE ct.id IS NOT NULL),
    '[]'::json
  ) as tags
FROM clients c
LEFT JOIN client_tag_assignments cta ON c.id = cta.client_id
LEFT JOIN client_tags ct ON cta.tag_id = ct.id
GROUP BY c.id, c.first_name, c.last_name, c.phone, c.email, c.address, c.notes, c.last_visit, c.created_at;

-- Create view for family members (all clients sharing the same tag)
CREATE OR REPLACE VIEW family_members AS
SELECT 
  ct.id as tag_id,
  ct.name as family_name,
  ct.color as family_color,
  c.id as client_id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.notes
FROM client_tags ct
JOIN client_tag_assignments cta ON ct.id = cta.tag_id
JOIN clients c ON cta.client_id = c.id
ORDER BY ct.name, c.last_name, c.first_name;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_tag_assignments_client_id ON client_tag_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tag_assignments_tag_id ON client_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_client_tags_name ON client_tags(name);
