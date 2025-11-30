# 🔒 Déconnexion Automatique après Inactivité

## 📋 Vue d'ensemble

Le système de déconnexion automatique protège les comptes utilisateurs en les déconnectant après **1 heure d'inactivité**.

## ⚙️ Configuration

### Paramètres (dans `src/lib/supabase.js`)

```javascript
SECURITY_CONFIG = {
  idleTimeout: 60 * 60 * 1000,        // 1 heure d'inactivité
  idleWarningTime: 2 * 60 * 1000,     // Avertissement 2 minutes avant
  sessionTimeout: 24 * 60 * 60 * 1000, // Session max: 24 heures
  rememberMeDays: 30                   // "Se souvenir": 30 jours
}
```

## 🎯 Fonctionnement

### 1. Détection d'activité

Le système surveille ces événements utilisateur :
- Mouvements de souris
- Clics
- Touches clavier
- Scroll
- Touch (mobile)
- Molette

### 2. Timeline de déconnexion

```
0 min ──────────────────────────────────────────────────────── 60 min
  │                                                                │
  │                                                                │
  └─ Activité détectée                                            │
                                                                   │
                                                    58 min ────────┘
                                                      │
                                                      └─ ⚠️ Modal d'avertissement
                                                         (2 minutes pour réagir)
                                                                   │
                                                    60 min ────────┘
                                                      │
                                                      └─ 🚪 Déconnexion automatique
```

### 3. Modal d'avertissement

À **58 minutes** d'inactivité :
- ⚠️ Modal s'affiche automatiquement
- ⏱️ Compte à rebours de 2 minutes
- 🔵 Bouton "Rester connecté" pour continuer
- ❌ Si aucune action : déconnexion automatique

### 4. Exceptions

La déconnexion automatique **ne s'applique PAS** si :
- ✅ L'utilisateur a coché "Se souvenir de moi" à la connexion
- ✅ La session "Se souvenir" est active (30 jours max)

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers

1. **`src/hooks/useIdleTimer.js`**
   - Hook React pour détecter l'inactivité
   - Gestion des timers et événements
   - Throttling des événements (1 seconde)

2. **`src/components/IdleWarningModal.jsx`**
   - Modal d'avertissement avant déconnexion
   - Compte à rebours visuel
   - Bouton pour continuer la session

### Fichiers modifiés

1. **`src/contexts/AuthContext.jsx`**
   - Intégration du hook `useIdleTimer`
   - Gestion de la déconnexion automatique
   - Affichage du modal d'avertissement

2. **`src/lib/supabase.js`**
   - Ajout des paramètres `idleTimeout` et `idleWarningTime`
   - Configuration centralisée

## 🧪 Test du système

### Test manuel

1. **Connexion normale** (sans "Se souvenir")
   ```
   - Se connecter à l'application
   - Ne pas toucher souris/clavier pendant 58 minutes
   - ✅ Modal d'avertissement apparaît
   - ✅ Compte à rebours de 2 minutes
   - ✅ Déconnexion automatique après 60 minutes
   ```

2. **Test avec "Se souvenir de moi"**
   ```
   - Se connecter avec "Se souvenir de moi" coché
   - Ne pas toucher souris/clavier pendant 60+ minutes
   - ✅ Aucune déconnexion automatique
   - ✅ Session reste active
   ```

3. **Test de continuation**
   ```
   - Attendre le modal d'avertissement (58 min)
   - Cliquer sur "Rester connecté"
   - ✅ Modal se ferme
   - ✅ Timer se réinitialise
   - ✅ Session continue normalement
   ```

### Test rapide (développement)

Pour tester rapidement, modifier temporairement dans `src/lib/supabase.js` :

```javascript
SECURITY_CONFIG = {
  idleTimeout: 2 * 60 * 1000,      // 2 minutes au lieu de 1 heure
  idleWarningTime: 30 * 1000,      // 30 secondes au lieu de 2 minutes
}
```

## 🔐 Sécurité

### Avantages

✅ **Protection contre les accès non autorisés**
   - Déconnexion automatique si l'utilisateur quitte son poste

✅ **Conformité RGPD**
   - Limitation de la durée d'exposition des données

✅ **Expérience utilisateur optimale**
   - Avertissement avant déconnexion
   - Option "Se souvenir" pour les appareils personnels

### Bonnes pratiques

- ⚠️ Ne pas réduire le délai en dessous de 15 minutes (UX)
- ⚠️ Toujours avertir avant déconnexion (2-5 minutes)
- ✅ Respecter le choix "Se souvenir de moi"
- ✅ Logger les déconnexions automatiques (audit)

## 🎨 Personnalisation

### Modifier le délai d'inactivité

Dans `src/lib/supabase.js` :

```javascript
idleTimeout: 30 * 60 * 1000,  // 30 minutes
idleTimeout: 45 * 60 * 1000,  // 45 minutes
idleTimeout: 90 * 60 * 1000,  // 1h30
```

### Modifier le temps d'avertissement

```javascript
idleWarningTime: 1 * 60 * 1000,  // 1 minute
idleWarningTime: 5 * 60 * 1000,  // 5 minutes
```

### Personnaliser le modal

Modifier `src/components/IdleWarningModal.jsx` :
- Couleurs
- Textes
- Icônes
- Animations

## 📊 Monitoring

### Logs console

```javascript
⚠️ Avertissement d'inactivité
💤 Utilisateur inactif - Déconnexion automatique
🚪 Déconnexion en cours... { reason: 'idle' }
✅ Déconnexion réussie
```

### Toast notification

Après déconnexion automatique :
```
"Session expirée"
"Vous avez été déconnecté pour inactivité."
```

## 🚀 Déploiement

Le système est **automatiquement actif** après déploiement :
- ✅ Aucune configuration supplémentaire requise
- ✅ Fonctionne en production et développement
- ✅ Compatible mobile et desktop

## 📝 Notes importantes

1. **Performance** : Le throttling (1 seconde) évite les calculs excessifs
2. **Mémoire** : Les timers sont nettoyés automatiquement
3. **Mobile** : Détection des événements tactiles incluse
4. **Onglets multiples** : Chaque onglet a son propre timer
5. **Background** : Le timer continue même si l'onglet est en arrière-plan

## 🆘 Dépannage

### Le modal n'apparaît pas

- Vérifier que l'utilisateur est connecté
- Vérifier que "Se souvenir de moi" n'est pas actif
- Vérifier les logs console

### Déconnexion trop rapide

- Vérifier `idleTimeout` dans `SECURITY_CONFIG`
- Vérifier que les événements sont bien détectés

### Modal reste bloqué

- Vérifier que `continueSession` est bien appelé
- Vérifier les erreurs dans la console

---

**Implémenté le** : 30 novembre 2025  
**Version** : 1.0.0  
**Statut** : ✅ Production Ready
