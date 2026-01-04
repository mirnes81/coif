/*
  # Fix Settings RLS Policy

  1. Problem
    - Settings table uses profiles table for admin check
    - This can cause recursion issues
  
  2. Solution
    - Drop old policy that references profiles
    - Add new policy that references admins table directly
  
  3. Security
    - Everyone can read settings (public info)
    - Only admins can update settings
*/

-- Drop old policy that references profiles
DROP POLICY IF EXISTS "Admins can update settings" ON settings;

-- Add new policy that references admins table
CREATE POLICY "Admins can update settings"
  ON settings
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
