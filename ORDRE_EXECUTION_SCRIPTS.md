# 📋 Ordre d'exécution des scripts Supabase pour Lygos

## ✅ Étape 1: Fix du type enum (DÉJÀ FAIT)

```sql
-- Fichier: supabase-fix-boost-status-enum.sql
-- Statut: ✅ EXÉCUTÉ AVEC SUCCÈS
-- Résultat: Type boost_status contient maintenant 'failed' et 'refunded'
```

---

## 🔄 Étape 2: Mise à jour des tables pour Lygos (À FAIRE MAINTENANT)

**Fichier à exécuter:** `supabase-update-boost-for-lygos.sql`

Ce script va :
- ✅ Ajouter les colonnes de paiement Lygos à `listing_boosts`
- ✅ Créer des vues pour les statistiques
- ✅ Créer des fonctions utilitaires
- ✅ Créer des triggers pour l'historique

**Instructions:**
1. Ouvrir Supabase SQL Editor
2. Copier le contenu de `supabase-update-boost-for-lygos.sql`
3. Exécuter le script
4. Vérifier qu'il n'y a pas d'erreurs

---

## 📦 Étape 3: Créer/Vérifier les packages de boost (OPTIONNEL)

**Fichier à exécuter:** `supabase-boost-packages-lygos.sql`

⚠️ **ATTENTION:** N'exécutez ce script QUE si vous n'avez pas encore de packages de boost ou si vous voulez les remplacer.

Pour vérifier si vous avez déjà des packages :

```sql
SELECT * FROM boost_packages WHERE is_active = true;
```

Si vous avez déjà des packages, vous pouvez :
- Les garder tels quels
- Les modifier manuellement
- Les supprimer et exécuter le script pour créer les nouveaux

---

## 🧪 Étape 4: Vérification finale

Après avoir exécuté les scripts, vérifiez que tout fonctionne :

### 1. Vérifier les colonnes ajoutées

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'listing_boosts'
  AND column_name IN (
    'payment_reference',
    'payment_amount',
    'payment_currency',
    'payment_method',
    'payment_status',
    'refund_reference',
    'refunded_at',
    'metadata'
  )
ORDER BY ordinal_position;
```

**Résultat attendu:** 8 colonnes affichées

### 2. Vérifier les fonctions créées

```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'log_boost_payment_event',
  'cleanup_expired_boosts',
  'get_lygos_payment_stats'
)
ORDER BY routine_name;
```

**Résultat attendu:** 3 fonctions affichées

### 3. Vérifier la vue créée

```sql
SELECT * FROM boost_payment_stats LIMIT 5;
```

**Résultat attendu:** Statistiques des paiements (peut être vide si aucun boost)

### 4. Tester la fonction de statistiques

```sql
SELECT * FROM get_lygos_payment_stats();
```

**Résultat attendu:** Une ligne avec les statistiques

---

## ✅ Checklist finale

- [x] Étape 1: Type enum mis à jour (failed, refunded ajoutés)
- [ ] Étape 2: Script de mise à jour Lygos exécuté
- [ ] Étape 3: Packages de boost vérifiés/créés
- [ ] Étape 4: Vérifications effectuées

---

## 🚀 Après l'exécution

Une fois tous les scripts exécutés avec succès, vous pouvez :

1. **Tester l'intégration localement**
   ```bash
   node verify-lygos-setup.js
   ```

2. **Démarrer l'application**
   ```bash
   npm run dev
   ```

3. **Tester le flux de paiement**
   - Aller sur http://localhost:5173/boost
   - Sélectionner une annonce
   - Choisir un package
   - Tester le paiement

---

## 📞 En cas de problème

Si vous rencontrez une erreur lors de l'exécution :

1. **Copier le message d'erreur complet**
2. **Vérifier quelle ligne cause l'erreur**
3. **Consulter les commentaires dans le script SQL**
4. **Me partager l'erreur pour que je puisse corriger**

---

**Note:** Les scripts sont conçus pour être idempotents (peuvent être exécutés plusieurs fois sans problème).
