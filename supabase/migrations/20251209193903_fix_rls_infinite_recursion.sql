/*
  # Fix Infinite Recursion in RLS Policies

  1. Problem
    - Infinite recursion detected in policy for relation "profiles"
    - The `clients` table has a policy checking `profiles.role = 'admin'`
    - The `profiles` table has a policy checking `profiles.role = 'admin'`
    - This creates infinite recursion when trying to access clients

  2. Solution
    - Drop the problematic policy on `clients` that references `profiles`
    - Drop the problematic policy on `profiles` that creates recursion
    - Keep only policies that reference `admins` table (no recursion)
    - Add a simple policy for profiles that users can read their own profile
    - Add a policy for admins table access

  3. Security
    - All access control is now based on the `admins` table
    - Users can read their own profile
    - Admins can manage all clients, products, etc.
*/

-- Drop problematic policies on clients table
DROP POLICY IF EXISTS "Admins can manage clients" ON clients;

-- Drop problematic policy on profiles table
DROP POLICY IF EXISTS "Only admins can access profiles" ON profiles;

-- Add simple policies for profiles (no recursion)
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Add policies for admins table access
CREATE POLICY "Anyone authenticated can read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);
