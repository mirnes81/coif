# Système d'Administration - Guide d'utilisation

## Accès au panneau d'administration

Pour accéder au panneau d'administration, visitez : `https://votre-site.com/admin`

## Première connexion

### Créer un compte administrateur

1. Créez d'abord un compte utilisateur via Supabase Auth (email/password)
2. Ensuite, ajoutez l'utilisateur à la table `admins` :

```sql
INSERT INTO admins (id, email, name)
VALUES (
  'USER_ID_FROM_AUTH_USERS',
  'admin@example.com',
  'Nom de l\'administrateur'
);
```

3. Vous pouvez maintenant vous connecter avec cet email et mot de passe

## Fonctionnalités du panneau d'administration

### 1. Tableau de bord
Vue d'ensemble avec statistiques sur :
- Nombre de clients
- Transactions du jour
- Produits actifs
- Revenus

### 2. Caisse (POS)
Système de point de vente complet :
- Sélection du client (optionnel)
- Ajout de produits au panier
- Calcul automatique du total
- Génération de QR code Twint pour le paiement
- Enregistrement de la transaction dans l'historique du client

**Comment utiliser :**
1. Recherchez et sélectionnez un client (ou continuez sans client)
2. Recherchez et ajoutez des produits au panier
3. Ajustez les quantités si nécessaire
4. Cliquez sur "Payer avec Twint"
5. Un QR code s'affiche pour le paiement
6. Confirmez le paiement une fois effectué

### 3. Gestion des clients
Module complet de gestion de la relation client :

**Fonctionnalités :**
- Créer, modifier et supprimer des clients
- Rechercher des clients par nom, email ou téléphone
- Ajouter des photos directement depuis un smartphone
- Ajouter des notes sur chaque client
- Consulter l'historique complet des interactions

**Historique automatique :**
- Création du client
- Achats effectués
- Photos ajoutées
- Notes ajoutées
- Toutes les interactions sont horodatées

### 4. Gestion des produits
Gérer le catalogue de produits :
- Ajouter de nouveaux produits
- Modifier les informations (nom, description, prix)
- Ajouter des images
- Catégoriser les produits
- Activer/désactiver des produits
- Supprimer des produits

### 5. Gestion des tarifs
Gérer les prix des services :
- Utilise le composant PricingManager existant
- Permet de modifier tous les tarifs
- Organisation par catégories

### 6. Paramètres de la galerie
Configuration de la galerie d'images :
- Activer/désactiver l'intégration Instagram
- Configurer l'access token Instagram
- Définir le nombre maximum d'images
- Configurer l'intervalle de rafraîchissement
- Ajouter des URLs d'images personnalisées

## Sécurité

### Row Level Security (RLS)
Toutes les tables sont protégées par RLS :
- Seuls les utilisateurs authentifiés enregistrés dans la table `admins` peuvent accéder aux données
- Les clients ne peuvent pas accéder aux données administratives
- Chaque action est enregistrée avec l'ID de l'administrateur qui l'a effectuée

### Photos des clients
- Les photos sont stockées dans Supabase Storage (bucket `photos`)
- Seuls les admins peuvent uploader des photos
- Les photos sont publiquement accessibles (pour affichage)
- Seuls les admins peuvent supprimer des photos

## Configuration Twint

Le système POS génère un QR code Twint pour les paiements. Pour configurer votre numéro Twint :

1. Ouvrez le fichier `src/components/POSSystem.tsx`
2. Modifiez la ligne avec `setTwintNumber` :
```typescript
const [twintNumber, setTwintNumber] = useState('VOTRE_NUMERO_TWINT');
```

## Support technique

Pour toute question ou problème :
- Vérifiez que votre compte est bien enregistré dans la table `admins`
- Vérifiez les variables d'environnement Supabase dans le fichier `.env`
- Consultez les logs dans la console du navigateur pour les erreurs
