---
inclusion: always
---

# Patterns Supabase

## Configuration
- Client Supabase initialisé dans `/src/lib/supabase.js`
- Variables d'env: `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

## Authentification
```javascript
// Utiliser le hook useAuth
const { user, session, signIn, signOut } = useAuth();

// Vérifier l'authentification
if (!user) {
  // Rediriger vers /connexion
}
```

## Requêtes
```javascript
// SELECT
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

// INSERT
const { data, error } = await supabase
  .from('table_name')
  .insert({ column: value });

// UPDATE
const { data, error } = await supabase
  .from('table_name')
  .update({ column: value })
  .eq('id', id);

// DELETE
const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id);
```

## Realtime
```javascript
// S'abonner aux changements
const channel = supabase
  .channel('table_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'table_name' },
    (payload) => {
      // Gérer le changement
    }
  )
  .subscribe();

// Se désabonner
return () => {
  supabase.removeChannel(channel);
};
```

## Storage
```javascript
// Upload
const { data, error } = await supabase.storage
  .from('bucket_name')
  .upload('path/file.jpg', file);

// Get URL
const { data } = supabase.storage
  .from('bucket_name')
  .getPublicUrl('path/file.jpg');
```

## Gestion d'erreurs
- Toujours vérifier `error` après chaque requête
- Afficher un toast en cas d'erreur
- Logger l'erreur complète en dev
