# 🏗️ Structure du Projet - Site Web Sabina Coiffure & Ongles

## 📁 Architecture des Fichiers

```
sabina-coiffure-website/
├── 📄 index.html                    # Page principale HTML
├── 📄 package.json                  # Dépendances et scripts
├── 📄 vite.config.ts               # Configuration Vite
├── 📄 tailwind.config.js           # Configuration Tailwind CSS
├── 📄 tsconfig.json                # Configuration TypeScript
├── 📄 README-EMAIL-SETUP.md        # Guide configuration email
├── 📄 STRUCTURE.md                 # Ce fichier
├── 📄 CAHIER-DES-CHARGES.md        # Spécifications détaillées
│
├── 📂 src/
│   ├── 📄 main.tsx                 # Point d'entrée React
│   ├── 📄 App.tsx                  # Composant principal
│   ├── 📄 index.css                # Styles Tailwind
│   │
│   ├── 📂 components/              # Composants React
│   │   ├── 📄 AdminPanel.tsx       # Gestion produits (admin)
│   │   ├── 📄 BookingSystem.tsx    # Système de réservation
│   │   ├── 📄 Cart.tsx             # Panier d'achat
│   │   ├── 📄 ContactForm.tsx      # Formulaire de contact
│   │   ├── 📄 GiftCardSystem.tsx   # Système cartes cadeaux
│   │   ├── 📄 GoogleReviews.tsx    # Avis Google
│   │   ├── 📄 ImageGallery.tsx     # Galerie d'images
│   │   ├── 📄 InstagramGallery.tsx # Galerie Instagram/Facebook
│   │   ├── 📄 PricingManager.tsx   # Gestion tarifs (admin)
│   │   ├── 📄 ProductCard.tsx      # Carte produit
│   │   └── 📄 ProductModal.tsx     # Détails produit
│   │
│   └── 📂 services/                # Services externes
│       └── 📄 emailService.ts      # Service d'envoi d'emails
│
└── 📂 public/                      # Fichiers statiques
    └── 📄 vite.svg                 # Logo Vite
```

## 🎯 Composants Principaux

### **App.tsx** - Composant Principal
- Navigation responsive avec menu hamburger mobile
- Gestion des états globaux (panier, favoris, modales)
- Sections : Hero, Services, Produits, Tarifs, Avis, Contact
- Administration (mode développeur)

### **BookingSystem.tsx** - Réservation
- Processus en 4 étapes
- Sélection service, date/heure, informations, paiement
- Responsive mobile optimisé
- Validation des données

### **GiftCardSystem.tsx** - Cartes Cadeaux
- Processus en 3 étapes
- Cartes prédéfinies + montant personnalisé
- Génération codes uniques
- Envoi d'emails automatique

### **ProductCard.tsx** - Produits Keune
- Affichage produits avec images
- Gestion favoris et panier
- Badges (nouveau, bestseller, rupture)
- Actions (ajouter, réserver)

### **ContactForm.tsx** - Contact
- Formulaire complet avec validation
- Informations salon (adresse, horaires, téléphone)
- Envoi simulé avec confirmation

## 🛠️ Technologies Utilisées

### **Frontend**
- **React 18** avec TypeScript
- **Vite** pour le build et développement
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes

### **Fonctionnalités**
- **Responsive Design** (mobile-first)
- **PWA Ready** (Progressive Web App)
- **SEO Optimized** (meta tags, structure)
- **Accessibility** (ARIA labels, contraste)

### **Services Externes**
- **Email Service** (SendGrid/SMTP ready)
- **Images** (Pexels CDN)
- **Réseaux Sociaux** (Instagram, Facebook)

## 📊 Données et État

### **Produits Keune**
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  benefits: string[];
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
}
```

### **Services Salon**
```typescript
interface Service {
  id: string;
  name: string;
  category: string;
  priceShort?: number;
  priceMedium?: number;
  priceLong?: number;
  duration: string;
  description?: string;
}
```

### **Cartes Cadeaux**
```typescript
interface GiftCard {
  id: string;
  type: 'service' | 'amount' | 'custom';
  title: string;
  description: string;
  value: number;
  validityMonths: number;
}
```

## 🔧 Configuration

### **Vite** (vite.config.ts)
- Plugin React
- Optimisation des dépendances
- Configuration build

### **Tailwind** (tailwind.config.js)
- Purge CSS pour optimisation
- Couleurs personnalisées salon
- Breakpoints responsive

### **TypeScript** (tsconfig.json)
- Configuration stricte
- Support JSX
- Optimisations build

## 🚀 Scripts Disponibles

```bash
npm run dev      # Développement local
npm run build    # Build production
npm run preview  # Aperçu build
npm run lint     # Vérification code
```

## 📱 Responsive Breakpoints

- **Mobile** : < 640px
- **Tablet** : 640px - 1024px  
- **Desktop** : > 1024px

## 🎨 Design System

### **Couleurs Principales**
- **Rose** : #ec4899 (rose-500)
- **Pink** : #f97316 (pink-600)
- **Gris** : #6b7280 (gray-500)
- **Blanc** : #ffffff

### **Typographie**
- **Titres** : font-bold, text-2xl à text-4xl
- **Corps** : font-normal, text-base
- **Petits** : text-sm, text-xs

### **Espacements**
- **Système 8px** : p-2, p-4, p-6, p-8
- **Marges** : mb-4, mb-6, mb-8
- **Gaps** : gap-3, gap-4, gap-6

## 🔐 Sécurité

- **Validation** des formulaires côté client
- **Sanitisation** des données utilisateur
- **HTTPS** requis en production
- **CSP** (Content Security Policy) recommandé

## 📈 Performance

- **Lazy Loading** des images
- **Code Splitting** automatique (Vite)
- **Tree Shaking** des dépendances
- **Compression** des assets

## 🌐 SEO & Accessibilité

- **Meta tags** optimisés
- **Alt text** sur toutes les images
- **ARIA labels** sur les éléments interactifs
- **Contraste** conforme WCAG 2.1
- **Navigation clavier** supportée