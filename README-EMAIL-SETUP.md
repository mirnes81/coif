# 📧 Configuration du Service d'Email

## 📍 Où se trouve la gestion des emails

Le système d'email pour les bons cadeaux se trouve dans :
- **Fichier principal** : `src/services/emailService.ts`
- **Utilisation** : `src/components/GiftCardSystem.tsx`

## 🔧 Comment configurer un vrai service d'email

### Option 1: SendGrid (Recommandé)

1. **Créer un compte** sur [SendGrid](https://sendgrid.com)
2. **Obtenir votre clé API** dans les paramètres
3. **Modifier le fichier** `src/services/emailService.ts` :

```typescript
// Remplacer cette ligne :
return await sendEmailSimulation(emailData);

// Par celle-ci :
return await sendEmailWithSendGrid(emailData);
```

4. **Ajouter votre clé** :
```typescript
const SENDGRID_API_KEY = 'SG.votre_vraie_clé_ici';
```

### Option 2: Serveur personnalisé

Si vous avez un serveur PHP/Node.js :

1. **Créer un endpoint** `/api/send-email` sur votre serveur
2. **Modifier le fichier** `src/services/emailService.ts` :

```typescript
// Utiliser cette ligne :
return await sendEmailWithCustomServer(emailData);
```

### Option 3: Autres services

- **Mailgun** : API similaire à SendGrid
- **Amazon SES** : Service AWS
- **SMTP personnalisé** : Via votre hébergeur

## 📋 Templates d'email inclus

✅ **Email destinataire** avec :
- Design aux couleurs du salon
- Code unique de la carte cadeau
- Instructions d'utilisation
- Coordonnées du salon

✅ **Email confirmation expéditeur** avec :
- Récapitulatif de l'achat
- Détails du destinataire

## 🚀 Activation

Pour activer l'envoi réel d'emails :

1. Choisir votre service (SendGrid recommandé)
2. Modifier `src/services/emailService.ts`
3. Remplacer la simulation par le vrai service
4. Tester avec une vraie adresse email

## 📞 Support

Pour l'implémentation technique, contactez votre développeur avec ce fichier README.