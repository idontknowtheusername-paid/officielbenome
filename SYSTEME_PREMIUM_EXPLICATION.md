# 🌟 Système Premium/Boost - Explication Complète

## Comment ça fonctionne ?

### 1. Identification des Annonces Premium

Une annonce est considérée **PREMIUM** si :
- `is_featured = true` OU
- `is_boosted = true`

```sql
SELECT * FROM listings 
WHERE (is_featured = true OR is_boosted = true) 
AND status = 'approved';
```

### 2. Affichage Visuel (ListingCard)

Les annonces premium ont un style spécial :

**Fond doré :**
```css
bg-gradient-to-br from-amber-50/50 to-yellow-100/50
```

**Bordure dorée :**
```css
border-2 border-amber-300/50 shadow-amber-200/50
```

**Badge Premium :**
```jsx
⭐ Premium
```

### 3. Flux de Boost avec Lygos

#### Étape 1 : Achat du Boost
1. Utilisateur clique sur "Booster cette annonce"
2. Sélectionne un package (Basic, Standard, Premium)
3. Redirigé vers `/paiement/boost/:listingId`
4. Choisit le package et paie via Lygos

#### Étape 2 : Création du Boost
```javascript
// Dans boostService.purchaseBoost()
INSERT INTO listing_boosts (
  listing_id,
  user_id,
  package_id,
  status: 'pending',  // ← En attente du paiement
  ...
)
```

#### Étape 3 : Activation après Paiement
```javascript
// Dans boostService.activateBoost()
// 1. Mettre à jour le boost
UPDATE listing_boosts 
SET status = 'active', activated_at = NOW(), expires_at = ...
WHERE id = boostId;

// 2. Mettre à jour l'annonce
UPDATE listings 
SET is_boosted = true, boost_expires_at = ...  // ← ICI l'annonce devient premium
WHERE id = listing_id;

// 3. Créer une transaction
INSERT INTO transactions (...)
```

### 4. Différence entre is_featured et is_boosted

| Champ | Utilisation | Comment l'obtenir |
|-------|-------------|-------------------|
| `is_featured` | Annonces mises en avant manuellement par l'admin | Modification manuelle en base de données |
| `is_boosted` | Annonces boostées par paiement | Paiement d'un package boost via Lygos |

**Les deux donnent le même style visuel premium !**

### 5. Problème Potentiel

Si vous voyez des annonces différentes dans la section Premium :

**Cas 1 : Données de test**
- Certaines annonces ont `is_featured = true` (données de test)
- Vos nouvelles annonces ont `is_boosted = true` (vraies données)
- **Solution** : Nettoyer les données de test

**Cas 2 : Boosts expirés**
- Une annonce avec `is_boosted = true` mais `boost_expires_at` dans le passé
- **Solution** : Nettoyer automatiquement les boosts expirés

**Cas 3 : Synchronisation**
- Le boost est actif dans `listing_boosts` mais `is_boosted = false` dans `listings`
- **Solution** : Vérifier la synchronisation

## 🔧 Scripts de Vérification

### Vérifier les annonces premium
```bash
node verify-premium-listings.js
```

Ce script affiche :
- Toutes les annonces premium
- Leur statut (featured/boosted/les deux)
- Les boosts actifs
- Les annonces expirées à nettoyer

### Nettoyer les boosts expirés
```sql
-- Désactiver les annonces dont le boost a expiré
UPDATE listings 
SET is_boosted = false, boost_expires_at = NULL
WHERE boost_expires_at < NOW() AND is_boosted = true;

-- Mettre à jour le statut des boosts expirés
UPDATE listing_boosts 
SET status = 'expired'
WHERE end_date < NOW() AND status = 'active';
```

### Nettoyer les données de test
```sql
-- Supprimer le flag is_featured des données de test
UPDATE listings 
SET is_featured = false
WHERE is_featured = true 
AND id NOT IN (SELECT listing_id FROM listing_boosts WHERE status = 'active');
```

## 📊 Page Premium

La page `/premium` affiche :
1. **Toutes** les annonces avec `is_featured = true` OU `is_boosted = true`
2. Triées par **score premium** (priorité du package, temps restant, etc.)
3. Avec rotation intelligente pour équité

## ✅ Checklist de Vérification

- [ ] Exécuter `node verify-premium-listings.js`
- [ ] Vérifier que vos annonces boostées ont `is_boosted = true`
- [ ] Vérifier que `boost_expires_at` est dans le futur
- [ ] Nettoyer les données de test avec `is_featured = true`
- [ ] Nettoyer les boosts expirés
- [ ] Vérifier que les transactions sont créées
- [ ] Tester le flux complet : Boost → Paiement → Activation

## 🎯 Résultat Attendu

Après paiement d'un boost :
1. ✅ `listing_boosts.status = 'active'`
2. ✅ `listings.is_boosted = true`
3. ✅ `listings.boost_expires_at` = date future
4. ✅ Transaction créée dans `transactions`
5. ✅ Annonce visible dans `/premium` avec style doré
6. ✅ Badge "⭐ Premium" affiché

## 🐛 Debugging

Si une annonce n'apparaît pas comme premium :

```sql
-- Vérifier l'annonce
SELECT id, title, is_featured, is_boosted, boost_expires_at, status
FROM listings 
WHERE id = 'VOTRE_ID_ANNONCE';

-- Vérifier le boost
SELECT * FROM listing_boosts 
WHERE listing_id = 'VOTRE_ID_ANNONCE' 
ORDER BY created_at DESC LIMIT 1;

-- Vérifier la transaction
SELECT * FROM transactions 
WHERE listing_id = 'VOTRE_ID_ANNONCE' 
ORDER BY created_at DESC LIMIT 1;
```

---

**Note** : Le système est conçu pour que `is_featured` et `is_boosted` donnent le même résultat visuel. La différence est uniquement dans la façon dont l'annonce est devenue premium (manuelle vs paiement).
