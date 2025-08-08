# Migration : Ajouter la colonne currency à la table listings

## 🚨 Problème
L'erreur "Could not find the 'currency' column of 'listings' in the schema cache" indique que la colonne `currency` n'existe pas dans la table `listings` de votre base de données Supabase.

## ✅ Solution

### Étape 1 : Accéder à l'interface Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet "officielbenome"

### Étape 2 : Ouvrir l'éditeur SQL
1. Dans le menu de gauche, cliquez sur "SQL Editor"
2. Cliquez sur "New query"

### Étape 3 : Exécuter le script
1. Copiez le contenu du fichier `add-currency-column.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur "Run" (ou appuyez sur Ctrl+Enter)

### Étape 4 : Vérifier le résultat
Le script devrait afficher un tableau avec les colonnes ajoutées :
- `currency` (VARCHAR(3), DEFAULT 'XOF')
- `subCategory` (VARCHAR(100))
- `videos` (TEXT[])
- `specific_data` (JSONB)

## 🔧 Script SQL à exécuter

```sql
-- Ajouter la colonne currency à la table listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'XOF';

-- Ajouter la colonne subCategory si elle n'existe pas
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS subCategory VARCHAR(100);

-- Ajouter la colonne videos si elle n'existe pas
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS videos TEXT[];

-- Ajouter la colonne specific_data si elle n'existe pas
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS specific_data JSONB;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name IN ('currency', 'subCategory', 'videos', 'specific_data');
```

## 🎯 Après la migration

Une fois le script exécuté avec succès :

1. **Décommentez le code** dans `src/services/supabase.service.js` :
   - Lignes 268-270 : `insertData.currency = currency;`
   - Lignes 275-277 : `insertData.specific_data = specificData;`
   - Lignes 280-282 : `insertData.subCategory = subCategory;`
   - Lignes 285-287 : `insertData.videos = videos;`

2. **Testez la publication** d'une nouvelle annonce

3. **Vérifiez** que l'erreur ne se reproduit plus

## 📝 Notes
- Le script utilise `IF NOT EXISTS` pour éviter les erreurs si les colonnes existent déjà
- La colonne `currency` a une valeur par défaut 'XOF' (Franc CFA)
- La colonne `subCategory` permet de stocker les sous-catégories (optionnel)
- La colonne `videos` stocke un tableau de liens vidéo (optionnel)
- La colonne `specific_data` est de type JSONB pour stocker les données spécifiques par catégorie 