# ⚡ QUICKSTART - Avis Google pour Sabina Coiffure

## 🎯 Configuration en 5 Minutes

### 1️⃣ Créer la clé Google API (2 min)

1. [Google Cloud Console](https://console.cloud.google.com/) > Nouveau projet
2. "APIs & Services" > "Library" > Rechercher "Places API" > Activer
3. "Credentials" > "Créer des identifiants" > "Clé API"
4. **Copier la clé** (ex: `AIzaSyC...`)

### 2️⃣ Trouver votre Place ID (1 min)

**Méthode rapide:**
1. [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Rechercher "Sabina Coiffure & Nails Mont-la-Ville"
3. **Copier le Place ID** (ex: `ChIJ...`)

### 3️⃣ Configurer Supabase (1 min)

1. Dashboard Supabase > Settings > Secrets
2. Ajouter:
   - **Nom**: `GOOGLE_PLACES_API_KEY`
   - **Valeur**: Votre clé API

### 4️⃣ Configurer dans l'Admin (1 min)

1. Admin Panel > Avis Google > Modifier
2. Coller:
   - **Place ID**: `ChIJ...`
   - **Lien Google Maps**: `https://g.page/sabina-coiffure`
3. Cocher:
   - ☑️ Afficher sur le site public
   - ☑️ Synchronisation activée
4. Enregistrer

### 5️⃣ Synchroniser (10 sec)

1. Admin Panel > Avis Google
2. Cliquer "Synchroniser"
3. ✅ **C'est fait !**

---

## ✅ Vérification Rapide

- [ ] Avis visibles dans Admin > Avis Google
- [ ] Avis affichés sur le site public
- [ ] Note moyenne et nombre d'avis corrects
- [ ] Bouton "Voir tous les avis" fonctionne

---

## 🆘 Problème?

**Erreur "API Key not configured"**
→ Vérifier secret `GOOGLE_PLACES_API_KEY` dans Supabase

**Erreur "Place ID not configured"**
→ Vérifier Place ID dans Admin > Avis Google > Modifier

**Pas d'avis récupérés**
→ Vérifier que le salon a des avis sur Google Maps

---

## 📚 Documentation Complète

Pour plus de détails: **README-GOOGLE-REVIEWS.md**

---

**Setup en moins de 5 minutes ⚡**
