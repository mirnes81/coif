/*
  # Add Twint Number to Settings

  1. Changes
    - Add `twint_number` column to `settings` table
    - Set default value for existing row
  
  2. Purpose
    - Store the Twint phone number for QR code generation
    - Allow configuration from admin panel
*/

-- Add twint_number column to settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'twint_number'
  ) THEN
    ALTER TABLE settings ADD COLUMN twint_number text DEFAULT '0791234567';
  END IF;
END $$;

-- Update existing row with default value if needed
UPDATE settings 
SET twint_number = '0791234567' 
WHERE twint_number IS NULL OR twint_number = '';
