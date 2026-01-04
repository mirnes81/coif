/*
  # Application de la Grille Tarifaire Officielle Sabina Coiffure & Nails
  
  ## Contexte
  Mise à jour des prix et services pour refléter la grille tarifaire officielle du salon.
  Positionnement: Qualité accessible (5-15% moins cher que la moyenne locale, Canton de Vaud)
  
  ## 1. Services Mis à Jour (Prix Corrigés)
  
  ### COIFFURE FEMME
  - Coupe femme: 70 CHF (45 min) - unifié
  - Coupe + brushing: 85 CHF (60 min)
  - Brushing: 50 CHF (45 min)
  - Coloration complète: 95 CHF (120 min)
  - Balayage: 130-180 CHF selon longueur (150-180 min)
  
  ### COIFFURE HOMME
  - Coupe homme: 40 CHF (30 min)
  - Coupe + barbe: 60 CHF (45 min)
  
  ### ONGLES
  - Semi-permanent: 60 CHF (60 min)
  - Nail art simple: +10 CHF (20 min)
  
  ## 2. Nouveaux Services Créés
  
  ### COIFFURE FEMME
  - Coloration racines: 80 CHF (90 min)
  - Soin cheveux: 25 CHF (15 min)
  
  ### COIFFURE HOMME
  - Barbe seule: 28 CHF (20 min)
  
  ### ONGLES
  - Pose gel complète: 95 CHF (120 min)
  - Remplissage gel: 75 CHF (90 min)
  - Dépose gel: 25 CHF (30 min)
  - Nail art avancé: +20 CHF (30 min)
  
  ## 3. Intégration
  - Tous les services actifs apparaissent dans v_sellable_items
  - Utilisables dans le POS
  - Visibles sur le site public
  - Réservables via booking
  
  ## 4. Sécurité
  - Aucune modification des politiques RLS
  - Aucune suppression de services (historique préservé)
*/

-- ============================================
-- MISE À JOUR DES SERVICES EXISTANTS
-- ============================================

-- COIFFURE FEMME: Coupe seule → Coupe femme (70 CHF unifié)
UPDATE services
SET 
  name = 'Coupe femme',
  description = 'Coupe de cheveux femme (sans brushing)',
  price_short = 70.00,
  price_medium = 70.00,
  price_long = 70.00,
  price_base = 70.00,
  duration_minutes = 45
WHERE name = 'Coupe seule';

-- COIFFURE FEMME: Coupe + Brushing (85 CHF unifié)
UPDATE services
SET 
  name = 'Coupe + Brushing',
  description = 'Coupe de cheveux femme avec brushing',
  price_short = 85.00,
  price_medium = 85.00,
  price_long = 85.00,
  price_base = 85.00,
  duration_minutes = 60
WHERE name = 'Coupe + Brushing';

-- COIFFURE FEMME: Brushing (50 CHF unifié)
UPDATE services
SET 
  name = 'Brushing',
  description = 'Brushing professionnel',
  price_short = 50.00,
  price_medium = 50.00,
  price_long = 50.00,
  price_base = 50.00,
  duration_minutes = 45
WHERE name = 'Brushing';

-- COIFFURE FEMME: Coloration complète (95 CHF unifié)
UPDATE services
SET 
  name = 'Coloration complète',
  description = 'Coloration totale des cheveux',
  price_short = 95.00,
  price_medium = 95.00,
  price_long = 95.00,
  price_base = 95.00,
  duration_minutes = 120
WHERE name = 'Coloration complète';

-- COIFFURE FEMME: Balayage (130-180 CHF selon longueur)
UPDATE services
SET 
  name = 'Balayage',
  description = 'Balayage technique complet selon longueur',
  price_short = 130.00,
  price_medium = 155.00,
  price_long = 180.00,
  price_base = 155.00,
  duration_minutes = 165
WHERE name = 'Balayage complet';

-- COIFFURE HOMME: Coupe homme (40 CHF)
UPDATE services
SET 
  name = 'Coupe homme',
  description = 'Coupe de cheveux homme',
  price_short = 40.00,
  price_medium = 40.00,
  price_long = 40.00,
  price_base = 40.00,
  duration_minutes = 30
WHERE name = 'Coupe homme';

-- COIFFURE HOMME: Coupe + Barbe (60 CHF)
UPDATE services
SET 
  name = 'Coupe + Barbe',
  description = 'Coupe de cheveux homme avec taille de barbe',
  price_short = 60.00,
  price_medium = 60.00,
  price_long = 60.00,
  price_base = 60.00,
  duration_minutes = 45
WHERE name = 'Coupe + Barbe';

-- ONGLES: Semi-permanent (60 CHF)
UPDATE services
SET 
  name = 'Semi-permanent',
  description = 'Pose vernis semi-permanent',
  price_short = 60.00,
  price_medium = 60.00,
  price_long = 60.00,
  price_base = 60.00,
  duration_minutes = 60
WHERE name = 'Semi-permanent';

-- ONGLES: Nail art simple (10 CHF supplément)
UPDATE services
SET 
  name = 'Nail art simple',
  description = 'Décoration simple (supplément)',
  price_short = 10.00,
  price_medium = 10.00,
  price_long = 10.00,
  price_base = 10.00,
  duration_minutes = 20
WHERE name = 'Nail art';

-- Désactiver les services obsolètes (Mèches, Manucure complète, Ongles fumés)
UPDATE services
SET active = false
WHERE name IN ('Mèches', 'Manucure complète', 'Ongles fumés');

-- ============================================
-- CRÉATION DES NOUVEAUX SERVICES
-- ============================================

-- Récupération des IDs de catégories
DO $$
DECLARE
  cat_coiffure_femme uuid;
  cat_coiffure_homme uuid;
  cat_coloration uuid;
  cat_ongles uuid;
  cat_soins uuid;
BEGIN
  -- Récupérer les IDs des catégories
  SELECT id INTO cat_coiffure_femme FROM service_categories WHERE name = 'Coiffure Femme';
  SELECT id INTO cat_coiffure_homme FROM service_categories WHERE name = 'Coiffure Homme';
  SELECT id INTO cat_coloration FROM service_categories WHERE name = 'Coloration';
  SELECT id INTO cat_ongles FROM service_categories WHERE name = 'Ongles';
  SELECT id INTO cat_soins FROM service_categories WHERE name = 'Soins';

  -- COIFFURE FEMME: Coloration racines
  INSERT INTO services (category_id, name, description, price_short, price_medium, price_long, price_base, duration_minutes, service_type, active)
  VALUES (cat_coloration, 'Coloration racines', 'Coloration des racines uniquement', 80.00, 80.00, 80.00, 80.00, 90, 'coiffure', true)
  ON CONFLICT DO NOTHING;

  -- COIFFURE FEMME: Soin cheveux
  INSERT INTO services (category_id, name, description, price_short, price_medium, price_long, price_base, duration_minutes, service_type, active)
  VALUES (cat_soins, 'Soin cheveux', 'Soin capillaire professionnel', 25.00, 25.00, 25.00, 25.00, 15, 'coiffure', true)
  ON CONFLICT DO NOTHING;

  -- COIFFURE HOMME: Barbe seule
  INSERT INTO services (category_id, name, description, price_short, price_medium, price_long, price_base, duration_minutes, service_type, active)
  VALUES (cat_coiffure_homme, 'Barbe', 'Taille et entretien de barbe', 28.00, 28.00, 28.00, 28.00, 20, 'coiffure', true)
  ON CONFLICT DO NOTHING;

  -- ONGLES: Pose gel complète
  INSERT INTO services (category_id, name, description, price_short, price_medium, price_long, price_base, duration_minutes, service_type, active)
  VALUES (cat_ongles, 'Pose gel complète', 'Pose complète de gel sur ongles naturels', 95.00, 95.00, 95.00, 95.00, 120, 'ongles', true)
  ON CONFLICT DO NOTHING;

  -- ONGLES: Remplissage gel
  INSERT INTO services (category_id, name, description, price_short, price_medium, price_long, price_base, duration_minutes, service_type, active)
  VALUES (cat_ongles, 'Remplissage gel', 'Remplissage et entretien des ongles gel', 75.00, 75.00, 75.00, 75.00, 90, 'ongles', true)
  ON CONFLICT DO NOTHING;

  -- ONGLES: Dépose gel
  INSERT INTO services (category_id, name, description, price_short, price_medium, price_long, price_base, duration_minutes, service_type, active)
  VALUES (cat_ongles, 'Dépose gel', 'Retrait complet du gel', 25.00, 25.00, 25.00, 25.00, 30, 'ongles', true)
  ON CONFLICT DO NOTHING;

  -- ONGLES: Nail art avancé
  INSERT INTO services (category_id, name, description, price_short, price_medium, price_long, price_base, duration_minutes, service_type, active)
  VALUES (cat_ongles, 'Nail art avancé', 'Décoration complexe (supplément)', 20.00, 25.00, 30.00, 25.00, 30, 'ongles', true)
  ON CONFLICT DO NOTHING;

END $$;

-- ============================================
-- VÉRIFICATION ET INDEX
-- ============================================

-- S'assurer que tous les services actifs ont une durée
UPDATE services
SET duration_minutes = 30
WHERE duration_minutes IS NULL OR duration_minutes = 0;

-- S'assurer que tous les services actifs ont un prix de base
UPDATE services
SET price_base = COALESCE(price_short, price_medium, price_long, 0)
WHERE price_base IS NULL AND active = true;

-- Recalculer le display_order pour un affichage cohérent
UPDATE services SET display_order = 10 WHERE service_type = 'coiffure' AND name LIKE '%Coupe femme%';
UPDATE services SET display_order = 20 WHERE service_type = 'coiffure' AND name LIKE '%Coupe + Brushing%';
UPDATE services SET display_order = 30 WHERE service_type = 'coiffure' AND name LIKE '%Brushing%';
UPDATE services SET display_order = 40 WHERE service_type = 'coiffure' AND name LIKE '%Coloration racines%';
UPDATE services SET display_order = 50 WHERE service_type = 'coiffure' AND name LIKE '%Coloration complète%';
UPDATE services SET display_order = 60 WHERE service_type = 'coiffure' AND name LIKE '%Balayage%';
UPDATE services SET display_order = 70 WHERE service_type = 'coiffure' AND name LIKE '%Soin cheveux%';
UPDATE services SET display_order = 80 WHERE service_type = 'coiffure' AND name LIKE '%Coupe homme%';
UPDATE services SET display_order = 90 WHERE service_type = 'coiffure' AND name LIKE '%Barbe%' AND name NOT LIKE '%Coupe%';
UPDATE services SET display_order = 100 WHERE service_type = 'coiffure' AND name LIKE '%Coupe + Barbe%';
UPDATE services SET display_order = 110 WHERE service_type = 'ongles' AND name LIKE '%Pose gel%';
UPDATE services SET display_order = 120 WHERE service_type = 'ongles' AND name LIKE '%Remplissage%';
UPDATE services SET display_order = 130 WHERE service_type = 'ongles' AND name LIKE '%Semi-permanent%';
UPDATE services SET display_order = 140 WHERE service_type = 'ongles' AND name LIKE '%Dépose%';
UPDATE services SET display_order = 150 WHERE service_type = 'ongles' AND name LIKE '%Nail art simple%';
UPDATE services SET display_order = 160 WHERE service_type = 'ongles' AND name LIKE '%Nail art avancé%';

-- ============================================
-- COMMENTAIRE FINAL
-- ============================================

COMMENT ON TABLE services IS 'Services du salon avec grille tarifaire officielle Sabina Coiffure & Nails (Canton de Vaud). Prix positionnement qualité accessible (5-15% moins cher que moyenne locale).';
