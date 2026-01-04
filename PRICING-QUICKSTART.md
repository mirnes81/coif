# ⚡ QUICKSTART PRIX - Sabina Coiffure & Nails

## ✅ CE QUI A ÉTÉ FAIT

Grille tarifaire officielle appliquée dans tout le système.

**16 services actifs** avec prix corrects partout (site, booking, POS, admin).

---

## 📊 PRIX OFFICIELS APPLIQUÉS

### COIFFURE FEMME
- Coupe femme: **70 CHF** (45 min)
- Coupe + Brushing: **85 CHF** (60 min)
- Brushing: **50 CHF** (45 min)
- Soin cheveux: **25 CHF** (15 min)

### COLORATION
- Coloration racines: **80 CHF** (90 min)
- Coloration complète: **95 CHF** (120 min)
- Balayage: **130-180 CHF** (165 min)

### HOMME
- Coupe homme: **40 CHF** (30 min)
- Barbe: **28 CHF** (20 min)
- Coupe + Barbe: **60 CHF** (45 min)

### ONGLES
- Pose gel complète: **95 CHF** (120 min)
- Remplissage gel: **75 CHF** (90 min)
- Semi-permanent: **60 CHF** (60 min)
- Dépose gel: **25 CHF** (30 min)
- Nail art simple: **+10 CHF** (20 min)
- Nail art avancé: **+20-30 CHF** (30 min)

---

## 🔍 VÉRIFICATION RAPIDE

### Voir tous les services actifs:
```sql
SELECT name, price_base, duration_minutes
FROM services
WHERE active = true
ORDER BY service_type, name;
```

### Vérifier POS (v_sellable_items):
```sql
SELECT name, base_price, duration_minutes
FROM v_sellable_items
WHERE item_type = 'service'
ORDER BY name;
```

**Résultat attendu:** 16 services

---

## 🚀 UTILISATION

### Site Public
✅ Tous les prix affichés sont corrects

### Réservation
✅ Total calculé automatiquement avec bons prix

### POS
✅ Tous les services vendables
✅ Snapshot automatique préserve historique

### Admin
✅ Modification prix possible
✅ Historique non affecté

---

## 📚 DOCUMENTATION COMPLÈTE

- **GRILLE-TARIFAIRE-OFFICIELLE.md** - Liste complète + comparaison marché
- **PRICING-IMPLEMENTATION-REPORT.md** - Rapport technique détaillé

---

## ✅ STATUS

**PRODUCTION READY**

Tous les prix sont cohérents dans tout le système.

---

**Version:** 1.0 | **Date:** Janvier 2026
