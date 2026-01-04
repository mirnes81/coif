/*
  # Système d'Avis Google pour Sabina Coiffure & Nails
  
  ## 1. Nouvelle Table
    - `google_reviews`
      - `id` (uuid, primary key)
      - `google_review_id` (text, unique) - ID unique Google
      - `place_id` (text) - Google Place ID
      - `author_name` (text) - Nom de l'auteur
      - `author_photo_url` (text) - Photo de profil Google
      - `rating` (integer) - Note 1-5
      - `text` (text) - Texte de l'avis
      - `relative_time_description` (text) - "il y a 2 jours"
      - `published_at` (timestamptz) - Date publication
      - `language` (text) - Code langue
      - `source` (text) - Toujours 'google'
      - `visible` (boolean) - Afficher ou masquer l'avis
      - `last_synced_at` (timestamptz) - Dernière sync
      - `created_at` (timestamptz) - Date création locale
      - `updated_at` (timestamptz) - Date mise à jour locale
  
  ## 2. Nouvelle Table
    - `google_reviews_settings`
      - Stocke le place_id, la config, les stats
      - Note moyenne
      - Nombre total d'avis
      - Dernière synchronisation
  
  ## 3. Sécurité
    - Enable RLS sur google_reviews
    - Policy: Public peut lire les avis visibles
    - Policy: Admins peuvent tout gérer
    - Enable RLS sur google_reviews_settings
    - Policy: Public peut lire
    - Policy: Admins peuvent modifier
  
  ## 4. Index
    - Index sur visible + published_at pour requêtes optimisées
*/

-- ============================================
-- TABLE: google_reviews
-- ============================================

CREATE TABLE IF NOT EXISTS google_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_review_id text UNIQUE NOT NULL,
  place_id text NOT NULL,
  author_name text NOT NULL,
  author_photo_url text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text text,
  relative_time_description text,
  published_at timestamptz NOT NULL,
  language text DEFAULT 'fr',
  source text DEFAULT 'google',
  visible boolean DEFAULT true,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_google_reviews_visible_published 
ON google_reviews(visible, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_google_reviews_place_id 
ON google_reviews(place_id);

-- ============================================
-- TABLE: google_reviews_settings
-- ============================================

CREATE TABLE IF NOT EXISTS google_reviews_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text NOT NULL,
  place_name text DEFAULT 'Sabina Coiffure & Nails',
  google_maps_url text,
  average_rating numeric(2, 1),
  total_reviews integer DEFAULT 0,
  last_sync_at timestamptz,
  sync_enabled boolean DEFAULT true,
  display_on_site boolean DEFAULT true,
  max_reviews_displayed integer DEFAULT 6,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Une seule ligne de config
CREATE UNIQUE INDEX IF NOT EXISTS idx_google_reviews_settings_single 
ON google_reviews_settings((true));

-- Insérer config par défaut
INSERT INTO google_reviews_settings (
  place_id,
  place_name,
  google_maps_url,
  average_rating,
  total_reviews,
  sync_enabled,
  display_on_site,
  max_reviews_displayed
) VALUES (
  'YOUR_GOOGLE_PLACE_ID_HERE',
  'Sabina Coiffure & Nails',
  'https://g.page/sabina-coiffure',
  4.8,
  0,
  true,
  true,
  6
)
ON CONFLICT DO NOTHING;

-- ============================================
-- TRIGGER: updated_at automatique
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_google_reviews_updated_at ON google_reviews;
CREATE TRIGGER update_google_reviews_updated_at
  BEFORE UPDATE ON google_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_reviews_settings_updated_at ON google_reviews_settings;
CREATE TRIGGER update_google_reviews_settings_updated_at
  BEFORE UPDATE ON google_reviews_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SÉCURITÉ: Row Level Security
-- ============================================

-- RLS pour google_reviews
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les avis visibles
CREATE POLICY "Public can read visible reviews"
  ON google_reviews
  FOR SELECT
  TO public
  USING (visible = true);

-- Policy: Admins peuvent tout lire
CREATE POLICY "Admins can read all reviews"
  ON google_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Policy: Admins peuvent insérer
CREATE POLICY "Admins can insert reviews"
  ON google_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Policy: Admins peuvent mettre à jour
CREATE POLICY "Admins can update reviews"
  ON google_reviews
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

-- Policy: Admins peuvent supprimer (rare, mais possible)
CREATE POLICY "Admins can delete reviews"
  ON google_reviews
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- RLS pour google_reviews_settings
ALTER TABLE google_reviews_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les settings
CREATE POLICY "Public can read reviews settings"
  ON google_reviews_settings
  FOR SELECT
  TO public
  USING (true);

-- Policy: Admins peuvent tout faire
CREATE POLICY "Admins can manage reviews settings"
  ON google_reviews_settings
  FOR ALL
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

-- ============================================
-- FONCTION: Mettre à jour les stats
-- ============================================

CREATE OR REPLACE FUNCTION update_google_reviews_stats()
RETURNS void AS $$
BEGIN
  UPDATE google_reviews_settings
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM google_reviews
      WHERE visible = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM google_reviews
      WHERE visible = true
    ),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour les stats automatiquement
CREATE OR REPLACE FUNCTION trigger_update_google_reviews_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_google_reviews_stats();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_after_google_reviews_change ON google_reviews;
CREATE TRIGGER update_stats_after_google_reviews_change
  AFTER INSERT OR UPDATE OR DELETE ON google_reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_google_reviews_stats();

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON TABLE google_reviews IS 'Avis Google récupérés via Google Places API pour Sabina Coiffure & Nails';
COMMENT ON TABLE google_reviews_settings IS 'Configuration et statistiques pour l''affichage des avis Google';
COMMENT ON COLUMN google_reviews.google_review_id IS 'ID unique de l''avis sur Google (évite les doublons)';
COMMENT ON COLUMN google_reviews.visible IS 'false = masqué sur le site (sans supprimer l''avis)';
COMMENT ON COLUMN google_reviews_settings.place_id IS 'Google Place ID du salon (obtenu via Google Places API)';
