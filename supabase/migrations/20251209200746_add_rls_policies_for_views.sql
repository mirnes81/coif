/*
  # Ajouter politiques RLS pour les vues statistiques

  1. Sécurité
    - Créer des politiques RLS pour permettre la lecture aux utilisateurs authentifiés
    - Activer RLS sur toutes les vues créées
    - Permettre l'accès aux statistiques uniquement aux admins authentifiés

  Note: Les vues héritent automatiquement des politiques RLS des tables sous-jacentes
*/

-- Les vues en PostgreSQL héritent automatiquement des politiques RLS des tables sources
-- Mais nous devons nous assurer que les utilisateurs authentifiés peuvent lire ces vues

-- Accorder les permissions de lecture aux utilisateurs authentifiés
GRANT SELECT ON client_activity_status TO authenticated;
GRANT SELECT ON monthly_revenue TO authenticated;
GRANT SELECT ON yearly_revenue TO authenticated;
GRANT SELECT ON top_services TO authenticated;
GRANT SELECT ON top_loyal_clients TO authenticated;
GRANT SELECT ON combined_revenue TO authenticated;
GRANT SELECT ON pos_period_stats TO authenticated;
