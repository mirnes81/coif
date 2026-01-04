# Sabina Coiffure & Ongles - Site Web

Site web professionnel pour Sabina Coiffure & Ongles, salon de coiffure et stylisme d'ongles situé à Mont-la-Ville (VD).

## Informations du salon

- **Nom :** Sabina Coiffure & Ongles
- **Adresse :** Rue du Four 7, 1148 Mont-la-Ville (VD)
- **Téléphone :** 076 376 15 14
- **Email :** sabinavelagic82@gmail.com
- **WhatsApp :** +41 76 376 15 14

### Horaires
- Mardi - Vendredi : 9h00 - 18h00
- Samedi : 8h00 - 16h00
- Lundi et Dimanche : Fermé

### Réseaux sociaux
- Instagram : [@sabinavelAGIC](https://www.instagram.com/sabinavelAGIC/)
- Facebook : [SabinaCoiffureNail](https://www.facebook.com/SabinaCoiffureNail/)

## Fonctionnalités du site

### Pour les clients
- **Page d'accueil** avec présentation des services
- **Boutique en ligne** de produits Keune
- **Système de réservation** via WhatsApp
- **Galerie photos** des réalisations
- **Cartes cadeaux** personnalisables
- **Formulaire de contact** fonctionnel
- **Tarifs détaillés** pour tous les services
- **Avis clients** et témoignages

### Pour l'administration
- **Panneau d'administration** complet
- **Gestion des clients** avec historique
- **Point de vente (POS)** avec TWINT
- **Gestion des produits** Keune
- **Gestion des services** et tarifs
- **Statistiques détaillées** des ventes
- **Gestion des enfants** et familles
- **Système de tags** pour les clients

## Technologies utilisées

- **Frontend :** React avec TypeScript
- **Styling :** Tailwind CSS
- **Backend :** Supabase (PostgreSQL)
- **Authentification :** Supabase Auth
- **Edge Functions :** Deno
- **Build :** Vite

## Installation et développement

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation

```bash
# Cloner le repository
git clone [URL_DU_REPO]
cd project

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Copier .env.example vers .env et remplir les valeurs
cp .env.example .env
```

### Variables d'environnement

Créer un fichier `.env` avec :

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

### Lancer le projet en développement

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5173`

### Build pour production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`

## Base de données

La base de données Supabase contient :
- Tables pour les clients, services, produits, commandes
- Système de transactions POS
- Historique des visites
- Cartes cadeaux
- Paramètres du site

Voir `STRUCTURE.md` pour plus de détails sur la structure.

## Configuration des emails

Le site utilise des edge functions Supabase pour l'envoi d'emails :
- Formulaire de contact
- Cartes cadeaux
- Confirmations

Voir `README-EMAIL-CONFIG.md` pour la configuration détaillée.

## Administration

Pour accéder au panneau d'administration :
1. Cliquer sur l'icône paramètres dans le header
2. Se connecter avec un compte administrateur
3. Accéder aux différentes sections de gestion

Voir `README-ADMIN.md` pour plus de détails.

## Réservations

Les réservations se font via WhatsApp pour un contact direct et personnalisé avec Sabina. Le bouton "Prendre rendez-vous" ouvre automatiquement WhatsApp avec un message pré-rempli.

## Support

Pour toute question ou problème :
- Email : sabinavelagic82@gmail.com
- Téléphone : 076 376 15 14
- WhatsApp : https://wa.me/41763761514

## Licence

© 2025 Sabina Coiffure & Ongles. Tous droits réservés.
