/*
  # Correction des colonnes clients pour les rendre optionnelles
  
  1. Modifications
    - Rendre la colonne `phone` nullable (les enfants n'ont pas forcément de téléphone)
    - Rendre la colonne `email` nullable (les enfants n'ont pas forcément d'email)
    
  2. Pourquoi
    - Les enfants ajoutés au système n'ont pas besoin d'email ou téléphone
    - Seuls le prénom, nom et date de naissance sont nécessaires
*/

-- Rendre les colonnes phone et email nullables
ALTER TABLE clients 
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL;
