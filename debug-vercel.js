// Script de diagnostic pour Vercel
console.log('🔍 Diagnostic des variables d\'environnement Vercel...\n');

// Vérifier les variables d'environnement
const envVars = {
  'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'VITE_APP_URL': import.meta.env.VITE_APP_URL,
  'VITE_APP_NAME': import.meta.env.VITE_APP_NAME,
  'MODE': import.meta.env.MODE,
  'DEV': import.meta.env.DEV,
  'PROD': import.meta.env.PROD
};

console.log('📋 Variables d\'environnement :');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = key.includes('KEY') ? 
    (value ? `${value.substring(0, 20)}...` : 'MANQUANTE') : 
    (value || 'MANQUANTE');
  console.log(`${status} ${key}: ${displayValue}`);
});

// Vérifier si Supabase est configuré
const supabaseConfigured = envVars['VITE_SUPABASE_URL'] && envVars['VITE_SUPABASE_ANON_KEY'];
console.log(`\n🔧 Supabase configuré: ${supabaseConfigured ? '✅ OUI' : '❌ NON'}`);

// Vérifier l'environnement
console.log(`🌍 Environnement: ${envVars.MODE}`);
console.log(`📱 Mode développement: ${envVars.DEV ? 'OUI' : 'NON'}`);
console.log(`🚀 Mode production: ${envVars.PROD ? 'OUI' : 'NON'}`);

// Instructions
if (!supabaseConfigured) {
  console.log('\n⚠️  PROBLÈME DÉTECTÉ:');
  console.log('Les variables Supabase ne sont pas configurées dans Vercel.');
  console.log('\n🔧 SOLUTION:');
  console.log('1. Allez sur vercel.com');
  console.log('2. Sélectionnez votre projet officielbenome');
  console.log('3. Settings > Environment Variables');
  console.log('4. Ajoutez:');
  console.log('   VITE_SUPABASE_URL=https://vvlpgviacinsbggfsexs.supabase.co');
  console.log('   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bHBndmlhY2luc2JnZ2ZzZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjMzNjUsImV4cCI6MjA3MDA5OTM2NX0.YsZUDyYfgGHD7jNDKAVaR4Y0yzulwLo2NGo85ohHefY');
  console.log('5. Redeployez l\'application');
} else {
  console.log('\n✅ Configuration correcte détectée');
  console.log('Si le problème persiste, vérifiez les erreurs dans la console du navigateur');
}

export default envVars; 