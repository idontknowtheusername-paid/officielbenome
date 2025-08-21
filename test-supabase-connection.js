// Script de test pour vérifier la connexion Supabase
// À exécuter dans la console du navigateur

console.log('🧪 Test de connexion Supabase...');

// Test 1: Vérifier les variables d'environnement
console.log('📋 Variables d\'environnement:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

// Test 2: Vérifier l'instance Supabase
console.log('🔗 Instance Supabase:');
console.log('supabase:', window.supabase || 'Non disponible');

// Test 3: Test de connexion
async function testSupabaseConnection() {
  try {
    console.log('🔍 Test de connexion...');
    
    // Test de lecture d'une table
    const { data, error } = await window.supabase
      .from('comments')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    }
    
    console.log('✅ Connexion réussie!');
    console.log('📊 Données reçues:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Erreur:', err);
    return false;
  }
}

// Test 4: Test du service de commentaires
async function testCommentService() {
  try {
    console.log('🔍 Test du service de commentaires...');
    
    // Importer le service
    const { commentService } = await import('./src/services/comment.service.js');
    
    // Test avec un listing ID fictif
    const testListingId = '00000000-0000-0000-0000-000000000000';
    const result = await commentService.getComments(testListingId, { limit: 1 });
    
    console.log('✅ Service de commentaires fonctionnel!');
    console.log('📊 Résultat:', result);
    return true;
    
  } catch (err) {
    console.error('❌ Erreur service:', err);
    return false;
  }
}

// Exécuter les tests
console.log('🚀 Lancement des tests...');
testSupabaseConnection().then(success => {
  if (success) {
    testCommentService();
  }
});

// Instructions pour l'utilisateur
console.log(`
📝 Instructions:
1. Ouvrez la console du navigateur (F12)
2. Copiez-collez ce script
3. Vérifiez les résultats des tests
4. Partagez les erreurs avec moi
`);
