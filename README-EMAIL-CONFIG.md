# Configuration des emails

Ce document explique comment configurer l'envoi d'emails pour le site Sabina Coiffure & Ongles.

## Informations de contact

- **Email de contact :** sabinavelagic82@gmail.com
- **Téléphone :** 076 376 15 14
- **WhatsApp :** +41 76 376 15 14

## Fonctionnalités email actuelles

### 1. Formulaire de contact
- **Fichier :** `src/components/ContactForm.tsx`
- **Edge Function :** `send-contact-email`
- **Destinataire :** sabinavelagic82@gmail.com
- Les messages sont envoyés à Sabina avec les détails du client

### 2. Cartes cadeaux
- **Fichier :** `src/components/GiftCardSystem.tsx`
- **Edge Function :** `send-gift-card-email`
- **Destinataires :**
  - L'acheteur reçoit une confirmation
  - Le bénéficiaire reçoit la carte cadeau avec le code
  - Sabina reçoit une copie pour suivi
- Les cartes sont enregistrées dans la base de données Supabase

### 3. Réservations
- **Fichier :** `src/components/BookingSystem.tsx`
- Les réservations redirigent vers WhatsApp pour un contact direct

## Configuration actuelle

Les edge functions sont déjà déployées et fonctionnelles. Elles enregistrent les demandes dans les logs et préparent le contenu des emails.

### Pour activer l'envoi réel d'emails

Vous avez plusieurs options :

#### Option 1: Resend (Recommandé - le plus simple)
1. Créer un compte sur [resend.com](https://resend.com)
2. Obtenir une clé API
3. Vérifier votre domaine (ou utiliser le domaine de test)
4. Modifier les edge functions pour utiliser l'API Resend

#### Option 2: SendGrid
1. Créer un compte sur [sendgrid.com](https://sendgrid.com)
2. Obtenir une clé API
3. Vérifier votre adresse email d'expéditeur
4. Modifier les edge functions pour utiliser l'API SendGrid

#### Option 3: Gmail SMTP (Pour tests uniquement)
1. Activer l'authentification à deux facteurs sur votre compte Gmail
2. Créer un mot de passe d'application
3. Utiliser les paramètres SMTP de Gmail
4. **Attention:** Gmail a des limites quotidiennes strictes (500 emails/jour)

## Structure de la base de données

### Table `gift_cards`
Stocke toutes les cartes cadeaux créées :
- `code` : Code unique de la carte
- `amount` : Montant de la carte
- `buyer_name` : Nom de l'acheteur
- `recipient_name` : Nom du bénéficiaire
- `status` : valid, used, expired
- `notes` : Message personnel
- `created_at` : Date de création
- `used_at` : Date d'utilisation

### Table `settings`
Contient les paramètres du site :
- `phone` : 076 376 15 14
- `email` : sabinavelagic82@gmail.com
- `whatsapp` : 41763761514
- `address` : Rue du Four 7, 1148 Mont-la-Ville (VD)

## Modification des edge functions

Pour activer l'envoi d'emails avec un service réel, vous devrez modifier les edge functions dans :
- `supabase/functions/send-contact-email/index.ts`
- `supabase/functions/send-gift-card-email/index.ts`

Ajoutez l'intégration avec votre service d'emailing choisi (Resend, SendGrid, etc.).

## Test des fonctionnalités

1. **Formulaire de contact :** Remplir et soumettre le formulaire sur la page Contact
2. **Cartes cadeaux :** Créer une carte cadeau via le bouton "Cartes Cadeaux"
3. **Réservations :** Cliquer sur "Prendre rendez-vous" (redirige vers WhatsApp)

## Support

Pour toute question ou assistance, contactez Sabina :
- Email : sabinavelagic82@gmail.com
- Téléphone : 076 376 15 14
- WhatsApp : https://wa.me/41763761514
