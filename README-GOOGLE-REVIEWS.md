# 📋 Configuration des Avis Google - Sabina Coiffure & Nails

## Vue d'ensemble

Le système récupère automatiquement les avis Google de votre salon via l'API Google Places et les affiche sur le site public. Les avis sont stockés en base de données pour garantir la performance et la disponibilité même si l'API Google est temporairement indisponible.

---

## ✅ Fonctionnalités

- ✅ Récupération automatique des avis Google
- ✅ Affichage des avis sur le site public
- ✅ Cache en base de données
- ✅ Gestion admin (masquer/afficher, synchronisation manuelle)
- ✅ Sécurité: clé API jamais exposée côté client
- ✅ Note moyenne et nombre total d'avis
- ✅ Photos de profil des auteurs
- ✅ Dates et textes des avis

---

## 🔧 Configuration (Étape par Étape)

### Étape 1: Obtenir une clé API Google Places

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)

2. Créez un nouveau projet ou sélectionnez un projet existant:
   - Cliquez sur le sélecteur de projet en haut
   - Cliquez sur "Nouveau projet"
   - Nommez-le "Sabina Coiffure Reviews"
   - Cliquez sur "Créer"

3. Activez l'API Google Places:
   - Dans le menu, allez dans "APIs & Services" > "Library"
   - Recherchez "Places API"
   - Cliquez sur "Places API"
   - Cliquez sur "Activer"

4. Créez une clé API:
   - Dans "APIs & Services" > "Credentials"
   - Cliquez sur "Créer des identifiants" > "Clé API"
   - Copiez la clé générée (elle ressemble à: `AIzaSyC...`)

5. **Important: Sécurisez votre clé API**:
   - Cliquez sur votre clé nouvellement créée
   - Dans "Restrictions relatives aux applications":
     - Sélectionnez "Adresses IP" (serveurs)
     - Ajoutez les IP de Supabase (contactez le support Supabase pour les IPs)
   - Dans "Restrictions d'API":
     - Sélectionnez "Limiter la clé"
     - Cochez uniquement "Places API"
   - Cliquez sur "Enregistrer"

### Étape 2: Trouver votre Google Place ID

**Option A: Utiliser Place ID Finder (recommandé)**

1. Allez sur [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Recherchez "Sabina Coiffure & Nails, Mont-la-Ville"
3. Cliquez sur le résultat
4. Copiez le Place ID (format: `ChIJ...`)

**Option B: Via l'URL Google Maps**

1. Recherchez votre salon sur Google Maps
2. Dans l'URL, cherchez le paramètre après `!1s` (c'est votre Place ID)
   - Exemple: `https://www.google.com/maps/place/...!1sChIJ1234567890...`

**Option C: Via l'API Google Places (si vous avez déjà une adresse)**

```bash
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Sabina%20Coiffure%20Mont-la-Ville&inputtype=textquery&fields=place_id&key=VOTRE_CLE_API"
```

### Étape 3: Configurer Supabase

1. Allez sur votre Dashboard Supabase
2. Cliquez sur votre projet "Sabina Coiffure"
3. Dans le menu de gauche, cliquez sur "Settings" (roue dentée)
4. Cliquez sur "Secrets" (ou "Edge Function Secrets")
5. Ajoutez un nouveau secret:
   - **Nom**: `GOOGLE_PLACES_API_KEY`
   - **Valeur**: Votre clé API Google (ex: `AIzaSyC...`)
   - Cliquez sur "Add Secret"

### Étape 4: Configurer la base de données

1. Allez dans l'admin panel de votre site
2. Connectez-vous avec vos identifiants admin
3. Cliquez sur "Avis Google" dans le menu
4. Cliquez sur "Modifier" dans la section Configuration
5. Mettez à jour:
   - **Place ID Google**: Collez votre Place ID (ex: `ChIJ...`)
   - **Lien Google Maps**: L'URL complète de votre page Google (ex: `https://g.page/sabina-coiffure`)
   - Cochez "Afficher sur le site public"
   - Cochez "Synchronisation activée"
6. Cliquez sur "Enregistrer les modifications"

### Étape 5: Première synchronisation

1. Dans l'admin panel > Avis Google
2. Cliquez sur le bouton "Synchroniser"
3. Attendez quelques secondes
4. Vous devriez voir vos avis Google apparaître

---

## 📊 Utilisation

### Affichage sur le Site Public

Les avis s'affichent automatiquement sur la page d'accueil si:
- ✅ La configuration est correcte
- ✅ "Afficher sur le site public" est activé
- ✅ Au moins un avis a été synchronisé

### Gestion Admin

**Synchroniser manuellement:**
- Admin > Avis Google > Bouton "Synchroniser"
- Récupère les nouveaux avis depuis Google
- Met à jour les avis existants

**Masquer un avis:**
- Admin > Avis Google > Cliquez sur "Visible" à côté de l'avis
- L'avis devient "Masqué" et n'apparaît plus sur le site
- L'avis reste dans la base de données (historique préservé)

**Réafficher un avis masqué:**
- Cliquez sur "Masqué" pour le repasser en "Visible"

**Désactiver l'affichage:**
- Admin > Avis Google > Modifier > Décocher "Afficher sur le site public"
- Les avis ne s'affichent plus sur le site, mais restent en base

---

## 🔄 Synchronisation Automatique

**Note importante:** La synchronisation manuelle est actuellement disponible. Pour une synchronisation automatique quotidienne, vous pouvez configurer un cron job.

### Configuration d'un Cron Job (optionnel)

**Option A: Via Supabase (recommandé)**

1. Allez dans Dashboard Supabase > Database > Extensions
2. Activez l'extension `pg_cron`
3. Exécutez cette requête SQL:

```sql
SELECT cron.schedule(
  'sync-google-reviews-daily',
  '0 2 * * *', -- Tous les jours à 2h du matin
  $$
  SELECT
    net.http_post(
      url := 'https://[VOTRE-PROJET].supabase.co/functions/v1/get-google-reviews',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer [VOTRE-SERVICE-ROLE-KEY]'
      )
    )
  $$
);
```

Remplacez:
- `[VOTRE-PROJET]` par l'ID de votre projet Supabase
- `[VOTRE-SERVICE-ROLE-KEY]` par votre service role key (dans Settings > API)

**Option B: Via un service externe (EasyCron, Cron-Job.org)**

1. Créez un compte sur [Cron-Job.org](https://cron-job.org) (gratuit)
2. Créez un nouveau cron job:
   - **URL**: `https://[VOTRE-PROJET].supabase.co/functions/v1/get-google-reviews`
   - **Méthode**: POST
   - **Headers**:
     - `Authorization: Bearer [VOTRE-ANON-KEY]`
     - `Content-Type: application/json`
   - **Fréquence**: Une fois par jour (ex: 02:00)
3. Activez le cron job

---

## 🛠️ Dépannage

### Problème: "Google Places API Key not configured"

**Solution:**
1. Vérifiez que le secret `GOOGLE_PLACES_API_KEY` existe dans Supabase
2. Allez dans Settings > Edge Function Secrets
3. Ajoutez ou mettez à jour la clé
4. Redéployez la fonction edge si nécessaire

### Problème: "Google Place ID not configured"

**Solution:**
1. Admin > Avis Google > Modifier
2. Vérifiez que le Place ID est correct (format: `ChIJ...`)
3. Testez votre Place ID avec ce lien:
   ```
   https://maps.googleapis.com/maps/api/place/details/json?place_id=VOTRE_PLACE_ID&key=VOTRE_CLE_API
   ```

### Problème: "No reviews found"

**Causes possibles:**
1. Le salon n'a pas encore d'avis Google
2. Le Place ID est incorrect
3. Les avis ne sont pas publics

**Solution:**
1. Vérifiez que votre salon a des avis sur Google Maps
2. Vérifiez le Place ID
3. Assurez-vous que les avis sont publics (non privés)

### Problème: "Google API error: 403"

**Cause:** Restrictions de clé API trop strictes

**Solution:**
1. Google Cloud Console > Credentials
2. Cliquez sur votre clé API
3. Dans "Restrictions d'API", vérifiez que "Places API" est bien autorisée
4. Dans "Restrictions relatives aux applications", essayez de passer temporairement à "Aucune" pour tester

### Problème: Les avis ne s'affichent pas sur le site

**Checklist:**
- [ ] Au moins un avis synchronisé (Admin > Avis Google)
- [ ] "Afficher sur le site public" est activé
- [ ] Au moins un avis est "Visible" (non masqué)
- [ ] La page a été rechargée (Ctrl+F5 / Cmd+Shift+R)

---

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais exposer la clé API côté client**
   - ✅ La clé est stockée dans Supabase Secrets
   - ✅ Accessible uniquement par l'Edge Function
   - ✅ Jamais envoyée au navigateur

2. **Restreindre la clé API**
   - Limitez aux IP des serveurs Supabase
   - Limitez à l'API "Places API" uniquement
   - Surveillez l'utilisation dans Google Cloud Console

3. **Quota API Google**
   - Google offre 200 CHF de crédit gratuit par mois
   - Une requête Place Details = environ 0.017 USD
   - 1 sync/jour = ~30 requêtes/mois = ~0.50 USD/mois
   - Largement dans le quota gratuit

---

## 📊 Structure des Données

### Table: google_reviews

```sql
id                          uuid (PK)
google_review_id            text (unique) -- ID Google unique
place_id                    text          -- Google Place ID
author_name                 text          -- Nom de l'auteur
author_photo_url            text          -- Photo profil
rating                      integer       -- Note 1-5
text                        text          -- Texte de l'avis
relative_time_description   text          -- "il y a 2 jours"
published_at                timestamptz   -- Date publication
language                    text          -- Code langue (fr, en, etc.)
source                      text          -- Toujours 'google'
visible                     boolean       -- Afficher ou masquer
last_synced_at              timestamptz   -- Dernière sync
created_at                  timestamptz   -- Date création locale
updated_at                  timestamptz   -- Date màj locale
```

### Table: google_reviews_settings

```sql
id                      uuid (PK)
place_id                text          -- Google Place ID
place_name              text          -- Nom du salon
google_maps_url         text          -- URL Google Maps
average_rating          numeric(2,1)  -- Note moyenne
total_reviews           integer       -- Nombre total d'avis
last_sync_at            timestamptz   -- Dernière synchronisation
sync_enabled            boolean       -- Synchronisation activée
display_on_site         boolean       -- Afficher sur le site
max_reviews_displayed   integer       -- Nombre max d'avis affichés
created_at              timestamptz
updated_at              timestamptz
```

---

## 🎨 Personnalisation

### Modifier le nombre d'avis affichés

1. Admin > Avis Google > Modifier
2. Changez "max_reviews_displayed" (actuellement 6)
3. Sauvegardez

### Modifier le design

Éditez le fichier `src/components/GoogleReviews.tsx`:
- Couleurs Tailwind
- Disposition (grid)
- Animations
- Textes

---

## 📞 Support

### Problèmes courants résolus

✅ Clé API configurée mais erreur 403 → Vérifier restrictions IP
✅ Place ID valide mais pas d'avis → Salon sans avis Google
✅ Avis synchronisés mais pas visibles → Vérifier "display_on_site"
✅ Erreur lors de la sync → Vérifier quota API Google

### Ressources utiles

- [Documentation Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

---

## ✅ Checklist de Validation

Avant de considérer la configuration terminée, vérifiez:

- [ ] Clé API Google Places créée et restreinte
- [ ] Secret `GOOGLE_PLACES_API_KEY` ajouté dans Supabase
- [ ] Place ID trouvé et configuré
- [ ] Première synchronisation réussie (Admin > Avis Google > Synchroniser)
- [ ] Avis visibles dans l'admin
- [ ] Avis affichés sur le site public
- [ ] Note moyenne et nombre d'avis corrects
- [ ] Photos des auteurs s'affichent
- [ ] Liens Google Maps fonctionnels
- [ ] Bouton "Laisser un avis" redirige vers Google

---

## 🚀 Prochaines Étapes (Optionnel)

### Améliorations futures possibles:

1. **Réponses aux avis**
   - Ajouter la possibilité de répondre aux avis depuis l'admin
   - Utilise Google My Business API

2. **Notifications**
   - Email admin lors d'un nouvel avis
   - Alerte si note < 4 étoiles

3. **Statistiques avancées**
   - Évolution de la note moyenne dans le temps
   - Mots-clés les plus mentionnés
   - Graphiques de satisfaction

4. **Widgets**
   - Badge Google sur toutes les pages
   - Mini widget dans footer

---

**Document créé par:** Bolt AI - Senior Full-Stack Developer
**Date:** Janvier 2026
**Version:** 1.0
**Dernière mise à jour:** Janvier 2026
