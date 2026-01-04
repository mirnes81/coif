/*
  # Ajouter image_url à la table services

  1. Modifications de Tables
    - Ajouter `image_url` (URL de l'image du service) à services

  Note: Les colonnes duration, description, is_visible et preparation_time ont déjà été ajoutées
*/

-- Ajouter colonne image_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE services ADD COLUMN image_url text;
  END IF;
END $$;
