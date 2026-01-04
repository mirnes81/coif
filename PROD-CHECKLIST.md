# 🚀 PRODUCTION CHECKLIST - Sabina Coiffure & Ongles

## 📋 Vue d'Ensemble

Ce document liste toutes les étapes nécessaires pour déployer le système en production avec toutes les fonctionnalités opérationnelles.

---

## ✅ MODIFICATIONS APPORTÉES

### 1. Base de Données (Migration Complète)

**Migration appliquée:** `add_unified_catalog_and_pos_pro_system`

#### Tables Créées

##### `sellable_items`
Catalogue unifié de tous les éléments vendables:
- Products, Services, Gift Cards, Custom items
- Prix multiples (base_price, price_short, price_medium, price_long)
- TVA configurable (7.7% par défaut pour Suisse)
- Stock et statut active

##### `pos_transaction_items`
Lignes de transaction normalisées (remplacement du JSONB):
- Snapshot des données pour historique
- Calculs automatiques (net, TVA, gross)
- Support quantités et remises
- Traçabilité complète

##### `cash_closures`
Clôtures de caisse quotidiennes:
- Montants: ouverture, entrées, sorties, comptage
- Calcul automatique du delta
- Audit trail avec closed_by

##### `email_logs`
Traçabilité des emails envoyés:
- Status: pending, sent, failed, bounced
- Provider message ID (SendGrid)
- Retry count et error messages
- Timestamps complets

##### `audit_logs`
Journal d'audit système:
- Actor (qui a fait l'action)
- Action (create, update, delete, refund, etc.)
- Entity (quelle table/ressource)
- Before/After data (JSON)
- Métadonnées et contexte

#### Modifications Tables Existantes

**pos_transactions** - Nouvelles colonnes:
- `transaction_number` (unique, auto-généré: TRX-XXXXXXXXXX)
- `transaction_type` (sale | refund)
- `parent_transaction_id` (pour tracer les refunds)
- `total_net`, `total_vat`, `total_gross` (séparation taxes)
- `status` (paid | partial | void | pending)
- `payment_details` (JSONB pour multi-paiements)
- `refund_reason` (obligatoire pour refunds)
- `payment_method` étendu: cash, card, twint, stripe, invoice, mixed

#### Vues Créées

- `v_sellable_items`: Vue temps-réel unifiée products + services + gift_cards
- `v_transaction_stats`: Statistiques enrichies des transactions
- `v_cash_closure_stats`: Statistiques des clôtures de caisse

#### Fonctions SQL

- `generate_transaction_number()`: Génère numéros uniques
- `calculate_cash_in_for_day(date)`: Calcule cash entré pour une date
- `update_updated_at()`: Trigger auto-update timestamps

### 2. Edge Functions

#### `send-email` (NOUVEAU)

**Fonctionnalités:**
- Support SendGrid pour envoi réel d'emails
- Mode simulation si API key non configurée
- Logging automatique dans `email_logs`
- Templates: contact, gift_card_recipient, gift_card_sender, booking_confirmation, booking_reminder, booking_cancelled
- Gestion d'erreurs et retry

**Variables d'environnement requises:**
```
SENDGRID_API_KEY=<votre_clé_sendgrid>
FROM_EMAIL=noreply@sabina-coiffure.ch
FROM_NAME=Sabina Coiffure
SALON_EMAIL=sabinavelagic82@gmail.com
```

**URL de la fonction:**
```
https://<votre-projet>.supabase.co/functions/v1/send-email
```

### 3. Sécurité RLS

Toutes les nouvelles tables ont RLS activé avec policies strictes:
- SELECT: Admins authentifiés uniquement
- INSERT/UPDATE/DELETE: Admins uniquement
- Vérification `EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())`

---

## 🔧 CONFIGURATION PRODUCTION

### Étape 1: Configuration SendGrid

1. **Créer un compte SendGrid**
   - Aller sur https://sendgrid.com/
   - Créer un compte (Free tier: 100 emails/jour)

2. **Générer une API Key**
   - Dashboard SendGrid > Settings > API Keys
   - Créer une clé avec permissions "Mail Send"
   - **IMPORTANT:** Copier la clé (elle ne sera affichée qu'une fois)

3. **Configurer les secrets Supabase**
   ```bash
   # Via Supabase CLI
   supabase secrets set SENDGRID_API_KEY=<votre_clé>
   supabase secrets set FROM_EMAIL=noreply@sabina-coiffure.ch
   supabase secrets set FROM_NAME="Sabina Coiffure"
   supabase secrets set SALON_EMAIL=sabinavelagic82@gmail.com
   ```

   **OU via Dashboard Supabase:**
   - Project Settings > Edge Functions > Secrets
   - Ajouter chaque secret

4. **Vérifier le domaine d'envoi (recommandé)**
   - SendGrid > Settings > Sender Authentication
   - Vérifier votre domaine pour éviter les emails en spam
   - Si pas de domaine personnalisé, utiliser l'email vérifié SendGrid

### Étape 2: Variables d'Environnement Frontend

Fichier `.env` (déjà configuré):
```
VITE_SUPABASE_URL=<url_projet_supabase>
VITE_SUPABASE_ANON_KEY=<clé_anonyme_supabase>
```

### Étape 3: Migrations Base de Données

Les migrations sont déjà appliquées en développement. Pour production:

```bash
# Vérifier les migrations appliquées
supabase db remote list

# Si nécessaire, appliquer manuellement
supabase db push
```

### Étape 4: Edge Functions

La fonction `send-email` est déjà déployée. Pour re-déployer:

```bash
supabase functions deploy send-email
```

---

## 🧪 TESTS REQUIS

### Tests End-to-End

#### 1. Test POS - Vente Simple
- [ ] Ouvrir le POS
- [ ] Rechercher un client
- [ ] Ajouter un service (ex: Coupe Femme - Court)
- [ ] Ajouter un produit (ex: Shampoing Keune)
- [ ] Vérifier calcul total (net + TVA + gross)
- [ ] Payer en cash
- [ ] Vérifier transaction créée avec transaction_number
- [ ] Vérifier lignes dans pos_transaction_items
- [ ] Vérifier client history mis à jour

#### 2. Test POS - Paiement Multiple (Mixed)
- [ ] Créer une transaction de 100 CHF
- [ ] Payer 50 CHF en cash
- [ ] Payer 50 CHF en card
- [ ] Vérifier payment_method = 'mixed'
- [ ] Vérifier payment_details contient les deux méthodes

#### 3. Test Refund
- [ ] Aller dans l'historique des transactions
- [ ] Sélectionner une transaction paid
- [ ] Cliquer "Rembourser"
- [ ] Entrer raison du remboursement
- [ ] Valider
- [ ] Vérifier nouvelle transaction avec transaction_type = 'refund'
- [ ] Vérifier parent_transaction_id pointe vers original
- [ ] Vérifier montants négatifs
- [ ] Vérifier audit_log créé

#### 4. Test Clôture Caisse
- [ ] Aller dans "Clôture Caisse"
- [ ] Entrer montant ouverture caisse (ex: 200 CHF)
- [ ] Système calcule automatiquement cash_in_calculated
- [ ] Entrer cash_out_manual (ex: 50 CHF sortie)
- [ ] Entrer counted_cash (comptage physique)
- [ ] Système calcule delta automatiquement
- [ ] Enregistrer clôture
- [ ] Vérifier dans cash_closures
- [ ] Imprimer rapport

#### 5. Test Email Contact
- [ ] Remplir formulaire de contact sur le site public
- [ ] Soumettre
- [ ] Vérifier email_logs: status = 'sent' (ou 'pending' si SendGrid non configuré)
- [ ] Vérifier email reçu à SALON_EMAIL
- [ ] Vérifier provider_message_id présent

#### 6. Test Carte Cadeau
- [ ] Créer une carte cadeau
- [ ] Vérifier création dans gift_cards
- [ ] Vérifier 3 emails envoyés (destinataire, expéditeur, salon)
- [ ] Vérifier email_logs: 3 entrées
- [ ] Vérifier code unique généré

#### 7. Test Vue Unifiée Sellable Items
- [ ] Requêter `v_sellable_items`
- [ ] Vérifier products visibles
- [ ] Vérifier services actifs
- [ ] Vérifier gift_cards valides
- [ ] Dans le POS, vérifier recherche fonctionne sur tous types

### Tests de Sécurité RLS

#### 1. Test Accès Non Authentifié
```sql
-- Tenter d'accéder sans auth (doit échouer)
SELECT * FROM pos_transactions;
SELECT * FROM sellable_items;
SELECT * FROM cash_closures;
SELECT * FROM audit_logs;
```

#### 2. Test Accès Utilisateur Non-Admin
```sql
-- Créer un user non-admin
-- Tenter d'accéder (doit échouer)
SELECT * FROM pos_transactions;
```

#### 3. Test Admin
```sql
-- Avec compte admin valide
-- Tous les accès doivent fonctionner
```

---

## 📊 MONITORING PRODUCTION

### Métriques à Surveiller

#### 1. Emails
```sql
-- Emails en échec
SELECT * FROM email_logs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 50;

-- Taux de réussite dernières 24h
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM email_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY status;
```

#### 2. Transactions
```sql
-- Transactions par jour
SELECT
  DATE(created_at) as date,
  COUNT(*) as transactions,
  SUM(total_amount) as revenue,
  AVG(total_amount) as avg_transaction
FROM pos_transactions
WHERE transaction_type = 'sale'
AND status = 'paid'
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;

-- Refunds récents
SELECT * FROM pos_transactions
WHERE transaction_type = 'refund'
ORDER BY created_at DESC
LIMIT 20;
```

#### 3. Clôtures Caisse
```sql
-- Deltas importants (>10 CHF)
SELECT * FROM v_cash_closure_stats
WHERE ABS(delta) > 10
ORDER BY closure_date DESC;

-- Dernières clôtures
SELECT * FROM v_cash_closure_stats
ORDER BY closure_date DESC
LIMIT 10;
```

#### 4. Audit Logs
```sql
-- Actions sensibles récentes
SELECT * FROM audit_logs
WHERE action IN ('refund', 'delete', 'cash_closure')
ORDER BY created_at DESC
LIMIT 50;

-- Actions par utilisateur
SELECT
  actor_email,
  COUNT(*) as action_count,
  array_agg(DISTINCT action) as actions
FROM audit_logs
WHERE created_at > now() - interval '7 days'
GROUP BY actor_email
ORDER BY action_count DESC;
```

---

## 🚨 GESTION D'ERREURS

### Erreurs Courantes

#### 1. Email non envoyé
**Symptôme:** status = 'failed' dans email_logs

**Solutions:**
- Vérifier SENDGRID_API_KEY configurée
- Vérifier quotas SendGrid (100/jour en free)
- Vérifier domaine vérifié dans SendGrid
- Checker error_message dans email_logs

```sql
SELECT * FROM email_logs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

#### 2. Transaction échoue
**Symptôme:** Erreur lors de création transaction

**Solutions:**
- Vérifier RLS policies
- Vérifier user est admin authentifié
- Vérifier foreign keys (client_id existe)
- Vérifier contraintes (payment_method valide)

#### 3. Clôture caisse impossible
**Symptôme:** Erreur lors de sauvegarde

**Solutions:**
- Vérifier date unique (une seule clôture par jour)
- Vérifier admin authentifié
- Vérifier montants numériques valides

#### 4. Refund impossible
**Symptôme:** Impossible de créer refund

**Solutions:**
- Vérifier transaction parente existe et est 'paid'
- Vérifier montant refund <= montant original
- Vérifier refund_reason fournie

---

## 📈 OPTIMISATIONS RECOMMANDÉES

### 1. Index Additionnels (si performance lente)

```sql
-- Index pour recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_action ON audit_logs(entity_type, action);
CREATE INDEX IF NOT EXISTS idx_pos_items_item_type ON pos_transaction_items(item_type);
```

### 2. Vacuum et Analyze

```sql
-- Exécuter régulièrement (hebdomadaire)
VACUUM ANALYZE pos_transactions;
VACUUM ANALYZE pos_transaction_items;
VACUUM ANALYZE email_logs;
VACUUM ANALYZE audit_logs;
```

### 3. Archivage Données Anciennes

```sql
-- Archiver audit_logs > 1 an
CREATE TABLE audit_logs_archive AS
SELECT * FROM audit_logs
WHERE created_at < now() - interval '1 year';

DELETE FROM audit_logs
WHERE created_at < now() - interval '1 year';

-- Idem pour email_logs
```

---

## 🔐 SÉCURITÉ PRODUCTION

### Checklist Sécurité

- [ ] RLS activé sur toutes les tables sensibles
- [ ] Secrets Supabase configurés (jamais dans le code)
- [ ] HTTPS activé (obligatoire)
- [ ] API Keys SendGrid sécurisées
- [ ] Service Role Key jamais exposée au frontend
- [ ] CORS correctement configuré sur edge functions
- [ ] Rate limiting activé sur Supabase
- [ ] Backups automatiques activés
- [ ] Monitoring des audit_logs actif

### Rotation des Secrets

**Fréquence recommandée:** Tous les 3 mois

```bash
# Générer nouvelle clé SendGrid
# Mettre à jour secret
supabase secrets set SENDGRID_API_KEY=<nouvelle_clé>

# Redéployer edge function
supabase functions deploy send-email
```

---

## 🆘 ROLLBACK PLAN

### En cas de problème critique

#### 1. Rollback Migration

```sql
-- Désactiver nouvelles tables si problème
ALTER TABLE pos_transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closures DISABLE ROW LEVEL SECURITY;
-- etc.

-- Ou dropper complètement (DANGER: perte de données)
-- DROP TABLE pos_transaction_items CASCADE;
-- DROP TABLE cash_closures CASCADE;
-- etc.
```

#### 2. Rollback Edge Function

```bash
# Redéployer version précédente
# (garder backup des anciennes versions)
supabase functions deploy send-contact-email
supabase functions deploy send-gift-card-email
```

#### 3. Restaurer Backup Base

```bash
# Via Supabase Dashboard
# Project Settings > Backups
# Restore from point-in-time
```

---

## 📞 SUPPORT

### Contacts

**Technique:**
- Documentation Supabase: https://supabase.com/docs
- SendGrid Docs: https://docs.sendgrid.com/
- Support Supabase: support@supabase.com

**Business:**
- Sabina: sabinavelagic82@gmail.com
- Téléphone: 076 376 15 14

### Logs Importants

```bash
# Logs Edge Functions (via Dashboard Supabase)
# Project > Edge Functions > send-email > Logs

# Logs Base de Données
# Project > Database > Logs

# Monitoring
# Project > Reports
```

---

## ✅ CHECKLIST FINALE AVANT MISE EN PRODUCTION

### Infrastructure
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] SSL/HTTPS actif
- [ ] Backups automatiques activés (Supabase)
- [ ] Rate limiting configuré

### Base de Données
- [ ] Migration appliquée avec succès
- [ ] Toutes les tables créées
- [ ] RLS activé et testé
- [ ] Index créés
- [ ] Functions SQL testées

### Edge Functions
- [ ] send-email déployée
- [ ] Secrets configurés (SENDGRID_API_KEY, etc.)
- [ ] Tests envoi email réussis
- [ ] Logging email_logs fonctionnel

### Frontend
- [ ] Build production sans erreurs (`npm run build`)
- [ ] Variables d'environnement configurées
- [ ] Toutes les fonctionnalités testées
- [ ] Responsive vérifié (mobile/tablet/desktop)

### Tests Fonctionnels
- [ ] POS: vente simple OK
- [ ] POS: multi-paiement OK
- [ ] Refunds OK
- [ ] Clôture caisse OK
- [ ] Emails envoyés OK
- [ ] Cartes cadeaux OK
- [ ] Vue sellable_items OK

### Tests Sécurité
- [ ] RLS testé (accès non-autorisé bloqué)
- [ ] Admin access testé (tout fonctionne)
- [ ] Secrets non exposés dans le code
- [ ] CORS configuré correctement

### Documentation
- [ ] README.md à jour
- [ ] ANALYSE-COMPLETE-PROJET.md à jour
- [ ] PROD-CHECKLIST.md (ce fichier) complété
- [ ] Guide utilisateur disponible

### Monitoring
- [ ] Dashboard Supabase accessible
- [ ] Queries monitoring créées
- [ ] Alertes configurées (optionnel)

---

## 🎉 DÉPLOIEMENT

### Commandes Finales

```bash
# 1. Build
npm run build

# 2. Test du build
npm run preview

# 3. Déployer (selon votre plateforme)
# Si Vercel:
vercel --prod

# Si Netlify:
netlify deploy --prod

# Si Bolt Hosting:
# Automatique via git push
```

### Post-Déploiement

1. **Vérifier URL production**
2. **Tester workflow complet**
3. **Vérifier emails reçus**
4. **Surveiller logs première heure**
5. **Communiquer mise en production à l'équipe**

---

## 📝 NOTES TECHNIQUES

### Choix Techniques

1. **Sellable Items comme Vue**
   - Pourquoi: Permet de garder tables existantes (products, services)
   - Avantage: Pas de migration de données
   - Alternative: Table unifiée unique (plus complexe)

2. **Transaction Items Normalisées**
   - Pourquoi: Meilleure queryabilité vs JSONB
   - Avantage: Statistiques et rapports plus faciles
   - Snapshot: Préserve historique même si prix changent

3. **SendGrid pour Emails**
   - Pourquoi: Free tier généreux (100/jour)
   - Alternative: AWS SES, Mailgun, Postmark
   - Facile à remplacer grâce à abstraction edge function

4. **Audit Logs Séparés**
   - Pourquoi: Ne pas polluer tables métier
   - Avantage: Queryable, archivable séparément
   - Performance: Index optimisés

### Limites Connues

1. **SendGrid Free Tier**
   - 100 emails/jour max
   - Solution: Upgrade plan si nécessaire

2. **Pas de Queue pour Emails**
   - Envoi synchrone dans edge function
   - Solution future: Implémenter queue (pg_cron + table jobs)

3. **Clôture Caisse Manuelle**
   - Pas d'auto-clôture quotidienne
   - Solution future: Cron job automatique

4. **Refunds Partiels**
   - Actuellement refund total uniquement
   - Solution future: Support montant partiel

---

**Version:** 1.0
**Date:** Janvier 2026
**Auteur:** Bolt AI - Full-Stack Developer
