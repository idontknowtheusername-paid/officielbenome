# ✅ CHECKLIST - Tests de Validation des Sessions

**Date**: 2 Octobre 2025  
**Correctif**: Gestion des sessions persistantes  
**À effectuer par**: Développeur / QA

---

## 🎯 Objectif

Valider que la gestion des sessions fonctionne correctement après les corrections appliquées.

**Temps estimé**: 15-20 minutes

---

## 📋 TESTS CRITIQUES (OBLIGATOIRES)

### ✅ Test 1: Persistance Basique au Refresh

**Priorité**: 🔴 CRITIQUE

**Étapes**:
1. [ ] Ouvrir le site dans un navigateur
2. [ ] Se connecter avec un compte valide
3. [ ] Vérifier que la connexion est réussie (nom utilisateur affiché)
4. [ ] Actualiser la page (F5 ou Ctrl+R)
5. [ ] **Vérifier**: L'utilisateur reste connecté ✅

**Résultat Attendu**:
- ✅ Pas de redirection vers la page de connexion
- ✅ Nom d'utilisateur toujours affiché
- ✅ Données de session maintenues
- ✅ Pas de message d'erreur

**En cas d'échec**:
- Vérifier `src/lib/supabase.js` → `persistSession: true`
- Vider le cache et réessayer
- Vérifier la console (F12) pour erreurs

---

### ✅ Test 2: Navigation entre Pages

**Priorité**: 🔴 CRITIQUE

**Étapes**:
1. [ ] Se connecter au site
2. [ ] Naviguer vers différentes pages:
   - [ ] Page d'accueil
   - [ ] Marketplace
   - [ ] Profil utilisateur
   - [ ] Messages
   - [ ] Mes Annonces
3. [ ] **Vérifier**: Session maintenue sur toutes les pages ✅

**Résultat Attendu**:
- ✅ Pas de déconnexion pendant la navigation
- ✅ Données utilisateur disponibles partout
- ✅ Navigation fluide sans rechargements

---

### ✅ Test 3: Déconnexion Propre

**Priorité**: 🔴 CRITIQUE

**Étapes**:
1. [ ] Se connecter au site
2. [ ] Cliquer sur le bouton "Déconnexion"
3. [ ] **Vérifier**: 
   - [ ] Pas de rechargement forcé de la page ✅
   - [ ] Navigation fluide vers page d'accueil ✅
   - [ ] Message de confirmation (optionnel)
   - [ ] Session complètement supprimée ✅

**Résultat Attendu**:
- ✅ Redirection vers `/` ou `/connexion`
- ✅ Pas de `window.location.reload()`
- ✅ Navigation React Router fluide
- ✅ Impossible d'accéder aux pages protégées

**Test de Validation**:
4. [ ] Après déconnexion, cliquer sur "Retour" du navigateur
5. [ ] **Vérifier**: L'utilisateur reste déconnecté ✅

---

## 📋 TESTS SECONDAIRES (RECOMMANDÉS)

### ✅ Test 4: Remember Me (Se Souvenir de Moi)

**Priorité**: 🟡 IMPORTANT

**Étapes**:
1. [ ] Aller sur la page de connexion
2. [ ] Cocher la case "Se souvenir de moi"
3. [ ] Se connecter avec identifiants valides
4. [ ] Fermer complètement le navigateur (pas seulement l'onglet)
5. [ ] Attendre 10 secondes
6. [ ] Rouvrir le navigateur
7. [ ] Retourner sur le site
8. [ ] **Vérifier**: Reconnexion automatique ✅

**Résultat Attendu**:
- ✅ L'utilisateur est automatiquement connecté
- ✅ Pas besoin de saisir à nouveau les identifiants
- ✅ Session active pendant 30 jours

**Note**: La session devrait persister pendant 30 jours (au lieu de 1 jour avant).

---

### ✅ Test 5: Multi-onglets

**Priorité**: 🟡 IMPORTANT

**Étapes**:
1. [ ] Ouvrir le site dans un onglet
2. [ ] Se connecter
3. [ ] Ouvrir un nouvel onglet dans le même navigateur
4. [ ] Aller sur le site
5. [ ] **Vérifier**: Automatiquement connecté dans le 2ème onglet ✅

**Test de Synchronisation**:
6. [ ] Dans un onglet, se déconnecter
7. [ ] Actualiser l'autre onglet
8. [ ] **Vérifier**: Déconnecté dans tous les onglets ✅

**Résultat Attendu**:
- ✅ Sessions synchronisées entre onglets
- ✅ Déconnexion propagée partout

---

### ✅ Test 6: Session sans Remember Me

**Priorité**: 🟡 IMPORTANT

**Étapes**:
1. [ ] Se connecter SANS cocher "Se souvenir de moi"
2. [ ] Naviguer sur le site normalement
3. [ ] Fermer l'onglet (pas tout le navigateur)
4. [ ] Rouvrir un nouvel onglet
5. [ ] Retourner sur le site
6. [ ] **Vérifier**: Toujours connecté ✅

**Résultat Attendu**:
- ✅ Session active pendant 24h même sans "Remember Me"
- ✅ Pas besoin de se reconnecter à chaque visite

---

### ✅ Test 7: Session après Inactivité

**Priorité**: 🟢 OPTIONNEL

**Étapes**:
1. [ ] Se connecter au site
2. [ ] Laisser le navigateur inactif pendant 30 minutes
3. [ ] Revenir et actualiser la page
4. [ ] **Vérifier**: Toujours connecté ✅

**Note**: Les tokens sont renouvelés automatiquement.

---

## 🧪 TESTS TECHNIQUES (DÉVELOPPEURS)

### ✅ Test 8: Vérification LocalStorage

**Outils**: Console du navigateur (F12)

**Étapes**:
1. [ ] Se connecter au site
2. [ ] Ouvrir DevTools (F12)
3. [ ] Aller dans Application > Local Storage > Votre domaine
4. [ ] **Vérifier**: Clés commençant par `sb-` présentes ✅
5. [ ] Se déconnecter
6. [ ] **Vérifier**: Clés `sb-` supprimées ✅

**Résultat Attendu**:
```
✅ Connecté:
- sb-xxxxxxx-auth-token (présent)
- maximarket-remember-me (si Remember Me activé)

❌ Déconnecté:
- sb-xxxxxxx-auth-token (absent)
```

---

### ✅ Test 9: Logs Console

**Outils**: Console du navigateur (F12)

**Étapes**:
1. [ ] Ouvrir DevTools (F12) > Console
2. [ ] Se connecter
3. [ ] **Vérifier**: Logs de confirmation ✅
   - `🚪 Déconnexion en cours...` (si déco)
   - `✅ Déconnexion réussie` (si déco)
   - `Auth state changed: SIGNED_IN`

**Résultat Attendu**:
- ✅ Pas d'erreurs dans la console
- ✅ Logs informatifs présents (en dev)
- ✅ Pas de warnings Supabase

---

### ✅ Test 10: Network Requests

**Outils**: DevTools (F12) > Network

**Étapes**:
1. [ ] Ouvrir DevTools > Network
2. [ ] Actualiser la page connecté
3. [ ] **Vérifier**: Requêtes Supabase réussies ✅
4. [ ] Chercher requêtes vers `/auth/v1/token?grant_type=refresh_token`

**Résultat Attendu**:
- ✅ Status 200 OK pour refresh token
- ✅ Pas d'erreurs 401 Unauthorized
- ✅ Auto-refresh fonctionne

---

## 📱 TESTS COMPATIBILITÉ NAVIGATEURS

### ✅ Test 11: Navigateurs Desktop

**À tester sur**:
- [ ] Chrome/Chromium (Windows/Mac/Linux)
- [ ] Firefox (Windows/Mac/Linux)
- [ ] Safari (Mac)
- [ ] Edge (Windows)

**Pour chaque navigateur**:
1. [ ] Test 1: Persistance au refresh ✅
2. [ ] Test 3: Déconnexion propre ✅
3. [ ] Test 5: Multi-onglets ✅

---

### ✅ Test 12: Navigateurs Mobile

**À tester sur**:
- [ ] Safari iOS (iPhone/iPad)
- [ ] Chrome Android

**Pour chaque navigateur**:
1. [ ] Connexion
2. [ ] Navigation
3. [ ] Actualisation
4. [ ] Déconnexion

---

### ✅ Test 13: Mode Navigation Privée

**Étapes**:
1. [ ] Ouvrir fenêtre privée/incognito
2. [ ] Se connecter au site
3. [ ] Actualiser la page
4. [ ] **Vérifier**: Session maintenue dans la fenêtre ✅
5. [ ] Fermer la fenêtre privée
6. [ ] Rouvrir une nouvelle fenêtre privée
7. [ ] **Vérifier**: Déconnecté (normal) ✅

**Note**: En mode privé, les sessions ne persistent pas après fermeture (comportement attendu).

---

## 🔍 POINTS DE VIGILANCE

### À Vérifier Particulièrement

- [ ] **Pas de rechargement forcé** lors de la déconnexion
- [ ] **Pas de `sessionStorage.clear()`** agressif
- [ ] **Pas de suppressions manuelles** de tokens (sauf Remember Me)
- [ ] **LocalStorage contient** les tokens Supabase quand connecté
- [ ] **Durée de session**: 24h minimum (30 jours si Remember Me)

### Indicateurs de Problème

❌ **ALERTE si**:
- La page se recharge complètement lors de la déconnexion
- L'utilisateur est déconnecté après un simple F5
- Des erreurs 401 apparaissent dans la console
- Les tokens ne sont pas dans localStorage
- `persistSession: false` dans `src/lib/supabase.js`

---

## 📊 RÉSUMÉ DES TESTS

### Tests Critiques (Obligatoires)

| Test | Priorité | Statut |
|------|----------|--------|
| 1. Persistance au refresh | 🔴 CRITIQUE | [ ] |
| 2. Navigation entre pages | 🔴 CRITIQUE | [ ] |
| 3. Déconnexion propre | 🔴 CRITIQUE | [ ] |

### Tests Recommandés

| Test | Priorité | Statut |
|------|----------|--------|
| 4. Remember Me | 🟡 IMPORTANT | [ ] |
| 5. Multi-onglets | 🟡 IMPORTANT | [ ] |
| 6. Session sans Remember Me | 🟡 IMPORTANT | [ ] |
| 7. Session après inactivité | 🟢 OPTIONNEL | [ ] |

### Tests Techniques

| Test | Priorité | Statut |
|------|----------|--------|
| 8. LocalStorage | 🟡 IMPORTANT | [ ] |
| 9. Logs console | 🟢 OPTIONNEL | [ ] |
| 10. Network requests | 🟢 OPTIONNEL | [ ] |

### Tests Compatibilité

| Test | Priorité | Statut |
|------|----------|--------|
| 11. Navigateurs desktop | 🟡 IMPORTANT | [ ] |
| 12. Navigateurs mobile | 🟡 IMPORTANT | [ ] |
| 13. Mode privé | 🟢 OPTIONNEL | [ ] |

---

## ✅ VALIDATION FINALE

Cochez UNIQUEMENT si tous les tests critiques passent:

- [ ] ✅ **Test 1**: Persistance au refresh - PASSÉ
- [ ] ✅ **Test 2**: Navigation entre pages - PASSÉ
- [ ] ✅ **Test 3**: Déconnexion propre - PASSÉ
- [ ] ✅ **Aucune erreur** dans la console
- [ ] ✅ **Comportement fluide** et professionnel
- [ ] ✅ **Conforme aux standards** e-commerce

**Si tous cochés**: 🎉 **VALIDATION COMPLÈTE - PRÊT POUR PRODUCTION**

---

## 📝 RAPPORT DE TEST

**Date du test**: _______________  
**Testé par**: _______________  
**Navigateur**: _______________  
**OS**: _______________

**Résultat Global**:
- [ ] ✅ TOUS LES TESTS PASSENT
- [ ] ⚠️ TESTS PARTIELS (préciser lesquels)
- [ ] ❌ ÉCHEC (préciser le problème)

**Notes**:
```
_______________________________________________
_______________________________________________
_______________________________________________
```

**Problèmes identifiés**:
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🚀 PROCHAINES ÉTAPES

Après validation complète:

1. [ ] Déployer en production
2. [ ] Monitorer les métriques utilisateur
3. [ ] Suivre les taux de déconnexion
4. [ ] Optionnel: Intégrer SessionIndicator
5. [ ] Optionnel: Ajouter analytics de session

---

*Checklist créée le 2 Octobre 2025*  
*Version 1.0*
