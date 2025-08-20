# 🔍 GUIDE DE RÉSOLUTION DU BUG "UTILISATEUR INCONNU" DANS LA MESSAGERIE

## 📋 RÉSUMÉ DU PROBLÈME

**Symptôme :** Les utilisateurs voient "utilisateur inconnu" au lieu du nom de l'expéditeur dans la messagerie.

**Cause probable :** Problème de politiques RLS (Row Level Security) sur la table `users` empêchant la lecture des profils des autres utilisateurs.

## 🚀 ÉTAPES DE RÉSOLUTION

### ÉTAPE 1 : DIAGNOSTIC IMMÉDIAT

1. **Ouvrir la console du navigateur** (F12 → Console)
2. **Aller sur la page de messagerie**
3. **Vérifier les logs** - vous devriez voir des messages comme :
   ```
   🔍 ConversationCard - Données reçues: {...}
   🔍 ConversationCard - Logique de sélection du participant: {...}
   🔍 ConversationCard - Nom d'affichage final: {...}
   ```

### ÉTAPE 2 : EXÉCUTION DU SCRIPT SQL DE CORRECTION

1. **Aller dans Supabase Dashboard** → SQL Editor
2. **Exécuter le script** `fix-messaging-rls.sql`
3. **Vérifier que les politiques sont créées** :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

### ÉTAPE 3 : VÉRIFICATION DES DONNÉES

1. **Vérifier la structure de la table users** :
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users';
   ```

2. **Vérifier que les utilisateurs ont des noms** :
   ```sql
   SELECT id, email, first_name, last_name 
   FROM users 
   LIMIT 5;
   ```

3. **Vérifier les conversations et participants** :
   ```sql
   SELECT 
     c.id,
     c.participant1_id,
     c.participant2_id,
     u1.first_name as p1_first_name,
     u2.first_name as p2_first_name
   FROM conversations c
   LEFT JOIN users u1 ON c.participant1_id = u1.id
   LEFT JOIN users u2 ON c.participant2_id = u2.id
   LIMIT 5;
   ```

### ÉTAPE 4 : TEST DES REQUÊTES

1. **Tester la lecture des utilisateurs** :
   ```sql
   SELECT id, first_name, last_name 
   FROM users 
   LIMIT 1;
   ```

2. **Si erreur 400/403** → Problème de politiques RLS
3. **Si succès** → Vérifier les données

### ÉTAPE 5 : CORRECTION DES DONNÉES MANQUANTES

Si des utilisateurs n'ont pas de noms :

```sql
-- Mettre à jour les utilisateurs avec des noms manquants
UPDATE users 
SET 
    first_name = COALESCE(first_name, SPLIT_PART(email, '@', 1)),
    last_name = COALESCE(last_name, 'Utilisateur')
WHERE 
    (first_name IS NULL OR first_name = '') 
    OR (last_name IS NULL OR last_name = '');
```

## 🔧 CORRECTIONS APPLIQUÉES

### 1. Amélioration du Composant ConversationCard

- ✅ Ajout de logs de debug détaillés
- ✅ Gestion des cas d'erreur avec fallbacks
- ✅ Vérification des données manquantes
- ✅ Affichage d'avertissements visuels

### 2. Amélioration du Service de Messages

- ✅ Logs détaillés pour chaque étape
- ✅ Gestion des erreurs de récupération des utilisateurs
- ✅ Fallbacks pour les utilisateurs non trouvés
- ✅ Vérification des colonnes `avatar_url` et `profile_image`

### 3. Script SQL de Correction

- ✅ Suppression des anciennes politiques RLS
- ✅ Création de nouvelles politiques permissives
- ✅ Vérification de la structure des données
- ✅ Correction automatique des noms manquants

## 📊 VÉRIFICATION POST-CORRECTION

### 1. Dans la Console du Navigateur

Vous devriez voir :
```
✅ Participant 1 récupéré pour la conversation [ID]: {id: "...", name: "Prénom Nom", avatar: "..."}
✅ Participant 2 récupéré pour la conversation [ID]: {id: "...", name: "Prénom Nom", avatar: "..."}
✅ Conversation [ID] traitée avec succès: {participant1: "Prénom Nom", participant2: "Prénom Nom", messages: X}
```

### 2. Dans l'Interface

- ✅ Les noms des expéditeurs s'affichent correctement
- ✅ Plus de "utilisateur inconnu"
- ✅ Badge "Données manquantes" si problème persiste

### 3. Dans Supabase

```sql
-- Vérifier les politiques créées
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Vérifier les utilisateurs avec noms complets
SELECT COUNT(*) FROM users 
WHERE first_name IS NOT NULL AND first_name != '' 
  AND last_name IS NOT NULL AND last_name != '';
```

## 🚨 PROBLÈMES COURANTS ET SOLUTIONS

### Problème 1 : Erreur 400/403 sur la table users

**Solution :** Exécuter le script SQL de correction des politiques RLS

### Problème 2 : Colonnes first_name/last_name manquantes

**Solution :** Vérifier la structure de la table et ajouter les colonnes si nécessaire

### Problème 3 : Utilisateurs sans noms

**Solution :** Exécuter la requête de correction des noms manquants

### Problème 4 : Logs vides dans la console

**Solution :** Vérifier que le composant ConversationCard est bien rendu

## 🔍 DIAGNOSTIC AVANCÉ

### Utilisation du Script de Diagnostic

1. **Installer les dépendances** :
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Configurer les variables d'environnement** :
   ```bash
   export VITE_SUPABASE_URL="votre_url_supabase"
   export VITE_SUPABASE_ANON_KEY="votre_cle_anon"
   ```

3. **Exécuter le diagnostic** :
   ```bash
   node debug-messaging-users.js
   ```

### Interprétation des Résultats

- ✅ **Connexion Supabase** : Vérifier les variables d'environnement
- ✅ **Structure de la table users** : Vérifier les colonnes
- ✅ **Politiques RLS** : Vérifier les permissions
- ✅ **Données utilisateurs** : Vérifier la qualité des données
- ✅ **Conversations et messages** : Vérifier les relations

## 📝 NOTES IMPORTANTES

1. **Les politiques RLS sont critiques** - elles doivent permettre la lecture des profils des autres utilisateurs
2. **Les logs de debug sont essentiels** - ils montrent exactement où le problème se situe
3. **Les fallbacks sont importants** - ils évitent les crashs même si les données sont manquantes
4. **La vérification des données est obligatoire** - les noms manquants causent le problème

## 🎯 OBJECTIF FINAL

Après application de toutes les corrections :

- ✅ Plus de "utilisateur inconnu"
- ✅ Noms des expéditeurs correctement affichés
- ✅ Logs de debug clairs et informatifs
- ✅ Gestion gracieuse des erreurs
- ✅ Interface utilisateur informative

## 📞 SUPPORT

Si le problème persiste après application de toutes les corrections :

1. **Vérifier les logs de la console**
2. **Exécuter le script de diagnostic**
3. **Vérifier les politiques RLS dans Supabase**
4. **Contrôler la qualité des données utilisateurs**

---

**Dernière mise à jour :** $(date)
**Version :** 1.0
**Statut :** ✅ Corrigé
