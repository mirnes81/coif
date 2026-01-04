# 📋 Cahier des Charges - Site Web Sabina Coiffure & Ongles

## 🎯 Objectifs du Projet

### **Objectif Principal**
Créer un site web moderne et professionnel pour le salon de coiffure et d'ongles Sabina, situé à Mont-la-Ville (VD), permettant de présenter les services, vendre des produits Keune et faciliter les réservations.

### **Objectifs Spécifiques**
- ✅ Présenter les services de coiffure et d'ongles
- ✅ Vendre les produits Keune en ligne
- ✅ Permettre la réservation de rendez-vous
- ✅ Proposer des cartes cadeaux personnalisables
- ✅ Afficher les avis clients et réalisations
- ✅ Optimiser pour mobile (responsive design)

## 🏢 Informations Salon

### **Identité**
- **Nom** : Sabina Coiffure & Ongles
- **Adresse** : Rue du Four 7, 1148 Mont-la-Ville (VD)
- **Téléphone** : 076 376 15 14
- **Email** : bonjour@sabina-coiffure.ch

### **Horaires**
- **Lundi** : Fermé
- **Mardi - Vendredi** : 9h00 - 18h00
- **Samedi** : 8h00 - 16h00
- **Dimanche** : Fermé

### **Spécialités**
- Coiffure femme, homme, enfant
- Coloration et balayage
- **Ongles fumés** (spécialité exclusive)
- Manucure et soins des ongles
- Produits Keune professionnels

### **Réseaux Sociaux**
- **Instagram** : @sabinavelAGIC
- **Facebook** : SabinaCoiffureNail

## 🎨 Spécifications Design

### **Identité Visuelle**
- **Couleurs principales** : Rose (#ec4899) et Pink (#f97316)
- **Style** : Moderne, élégant, féminin
- **Typographie** : Sans-serif, lisible
- **Images** : Professionnelles, haute qualité

### **Responsive Design**
- **Mobile First** : Optimisé pour smartphone
- **Breakpoints** : Mobile (< 640px), Tablet (640-1024px), Desktop (> 1024px)
- **Navigation mobile** : Menu hamburger avec overlay

### **Accessibilité**
- **Contraste** : Conforme WCAG 2.1 AA
- **Navigation clavier** : Supportée
- **Screen readers** : Compatible
- **Alt text** : Sur toutes les images

## 📱 Fonctionnalités Détaillées

### **1. Page d'Accueil (Hero)**
- **Hero Section** avec image de fond
- **Titre accrocheur** et description salon
- **Boutons CTA** : Réserver, Cartes Cadeaux, Produits
- **Informations contact** visibles

### **2. Services & Tarifs**
- **Catégories** : Coiffure Femme/Homme/Enfant, Coloration, Ongles
- **Tarifs détaillés** : Court/Mi-long/Long selon service
- **Durée** des prestations
- **Descriptions** des services
- **Bouton réservation** pour chaque service

### **3. Boutique Produits Keune**
- **Catalogue produits** avec images
- **Catégories** : Shampoings, Soins, Coiffage, Coloration
- **Fiches produits** détaillées (bénéfices, utilisation, ingrédients)
- **Système de favoris**
- **Panier d'achat** avec quantités
- **Click & Collect** au salon

### **4. Système de Réservation**
**Processus en 4 étapes :**
1. **Sélection service** avec tarifs selon longueur cheveux
2. **Date et heure** avec créneaux disponibles
3. **Informations client** (nom, email, téléphone, notes)
4. **Paiement** (sur place ou TWINT)

**Fonctionnalités :**
- ✅ Validation des créneaux
- ✅ Confirmation par email/SMS
- ✅ Politique d'annulation
- ✅ Interface mobile optimisée

### **5. Cartes Cadeaux**
**Types de cartes :**
- **Services prédéfinis** : Coupe+Brushing, Balayage, Ongles fumés
- **Montants fixes** : 50 CHF, 100 CHF
- **Montant personnalisé** : 20-500 CHF

**Processus en 3 étapes :**
1. **Sélection** carte ou montant
2. **Personnalisation** (destinataire, message, livraison)
3. **Paiement** et génération code unique

**Fonctionnalités :**
- ✅ Codes uniques générés automatiquement
- ✅ Envoi par email avec template professionnel
- ✅ Validité 6-12 mois selon service
- ✅ Livraison email gratuite ou courrier (+5 CHF)

### **6. Avis et Témoignages**
- **Avis Google** avec étoiles et commentaires
- **Galerie Instagram/Facebook** avec réalisations
- **Témoignages clients** authentiques
- **Liens vers réseaux sociaux**

### **7. Contact**
- **Formulaire de contact** avec validation
- **Informations complètes** : adresse, téléphone, horaires
- **Carte/localisation** (optionnelle)
- **WhatsApp** pour contact rapide

### **8. Administration (Mode Développeur)**
- **Gestion produits** : ajouter, modifier, supprimer
- **Gestion tarifs** : mise à jour prix et services
- **Galerie d'images** pour produits
- **Interface intuitive** pour non-techniques

## 🛠️ Spécifications Techniques

### **Frontend**
- **Framework** : React 18 avec TypeScript
- **Build Tool** : Vite (rapide, moderne)
- **Styling** : Tailwind CSS (utility-first)
- **Icons** : Lucide React (cohérentes)
- **Images** : Pexels CDN (optimisées)

### **Responsive**
- **Mobile First** : Design prioritaire smartphone
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation** : Menu hamburger sur mobile
- **Modales** : Adaptées aux petits écrans

### **Performance**
- **Lazy Loading** : Images chargées à la demande
- **Code Splitting** : Chargement optimisé
- **Compression** : Assets minifiés
- **CDN** : Images externes optimisées

### **SEO**
- **Meta tags** : Title, description, keywords
- **Structure HTML** : Sémantique correcte
- **Alt text** : Toutes les images décrites
- **URLs** : Propres et descriptives

## 📧 Système d'Email

### **Configuration Actuelle**
- **Mode simulation** : Emails loggés en console
- **Templates HTML** : Professionnels avec design salon
- **Service prêt** : SendGrid, Mailgun, SMTP

### **Emails Automatiques**
1. **Confirmation réservation** : Détails RDV + rappel 24h
2. **Carte cadeau destinataire** : Code unique + instructions
3. **Confirmation expéditeur** : Récapitulatif achat
4. **Contact** : Accusé réception formulaire

### **Templates Inclus**
- ✅ Design aux couleurs salon
- ✅ Responsive mobile
- ✅ Informations complètes salon
- ✅ Instructions d'utilisation
- ✅ Conditions générales

## 💳 Paiements

### **Modes Acceptés**
- **Sur place** : Espèces, carte bancaire
- **TWINT** : Paiement mobile suisse
- **Réservation** : Gratuite (paiement au salon)

### **Cartes Cadeaux**
- **Paiement immédiat** requis
- **Frais de port** : +5 CHF si envoi courrier
- **Conditions** : Non remboursables, non échangeables

## 📊 Analytics & Suivi

### **Métriques Importantes**
- **Réservations** : Nombre et taux de conversion
- **Ventes produits** : Panier moyen, produits populaires
- **Cartes cadeaux** : Montants et fréquence
- **Trafic mobile** : Pourcentage et comportement

### **Outils Recommandés**
- **Google Analytics** : Trafic et comportement
- **Google Search Console** : SEO et indexation
- **Facebook Pixel** : Retargeting réseaux sociaux

## 🔐 Sécurité & Confidentialité

### **Données Personnelles**
- **RGPD** : Conformité requise
- **Consentement** : Explicite pour emails
- **Stockage** : Minimal et sécurisé
- **Suppression** : Sur demande client

### **Sécurité Technique**
- **HTTPS** : Obligatoire en production
- **Validation** : Côté client et serveur
- **Sanitisation** : Données utilisateur
- **CSP** : Content Security Policy

## 🚀 Déploiement & Maintenance

### **Hébergement**
- **Bolt Hosting** : Actuel
- **Domaine personnalisé** : Recommandé
- **SSL** : Certificat automatique
- **CDN** : Distribution mondiale

### **Maintenance**
- **Mises à jour** : Sécurité et fonctionnalités
- **Sauvegardes** : Automatiques
- **Monitoring** : Disponibilité et performance
- **Support** : Technique et utilisateur

## 📈 Évolutions Futures

### **Phase 2 - Améliorations**
- **Paiement en ligne** : Stripe, PayPal
- **Système de fidélité** : Points et récompenses
- **Notifications push** : Rappels RDV
- **Chat en ligne** : Support client

### **Phase 3 - Avancé**
- **Application mobile** : iOS/Android
- **Réalité augmentée** : Essai coiffures virtuelles
- **IA** : Recommandations personnalisées
- **Multi-langues** : Français, allemand, anglais

## ✅ Critères d'Acceptation

### **Fonctionnel**
- ✅ Toutes les fonctionnalités implémentées
- ✅ Responsive parfait sur tous appareils
- ✅ Navigation intuitive et fluide
- ✅ Formulaires fonctionnels avec validation

### **Technique**
- ✅ Performance optimale (< 3s chargement)
- ✅ SEO optimisé (meta tags, structure)
- ✅ Accessibilité conforme WCAG 2.1
- ✅ Code propre et documenté

### **Design**
- ✅ Identité visuelle respectée
- ✅ UX/UI professionnelle
- ✅ Images haute qualité
- ✅ Cohérence graphique

### **Business**
- ✅ Objectifs métier atteints
- ✅ Facilite réservations et ventes
- ✅ Améliore visibilité en ligne
- ✅ Fidélise la clientèle

## 📞 Support & Formation

### **Documentation**
- ✅ Guide utilisateur complet
- ✅ FAQ pour clients
- ✅ Manuel administration
- ✅ Guide configuration email

### **Formation**
- **Utilisation** : Interface client
- **Administration** : Gestion produits/tarifs
- **Maintenance** : Mises à jour contenu
- **Analytics** : Lecture statistiques

---

**Date de création** : Janvier 2024  
**Version** : 1.0  
**Statut** : ✅ Implémenté et déployé  
**URL** : https://site-web-sabina-coif-19id.bolt.host