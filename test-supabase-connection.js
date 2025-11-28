// Test de connexion Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvlpgviacinsbggfsexs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bHBndmlhY2luc2JnZ2ZzZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjMzNjUsImV4cCI6MjA3MDA5OTM2NX0.YsZUDyYfgGHD7jNDKAVaR4Y0yzulwLo2NGo85ohHefY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Test de connexion à Supabase...\n');
  
  try {
    // Test 1: Vérifier la connexion
    console.log('1️⃣ Test de connexion basique...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('listings')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Erreur de connexion:', healthError);
      console.error('   Message:', healthError.message);
      console.error('   Details:', healthError.details);
      console.error('   Hint:', healthError.hint);
      console.error('   Code:', healthError.code);
      return;
    }
    
    console.log('✅ Connexion réussie!\n');
    
    // Test 2: Compter les listings
    console.log('2️⃣ Comptage des listings...');
    const { count, error: countError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur comptage:', countError.message);
    } else {
      console.log(`✅ Nombre total de listings: ${count}\n`);
    }
    
    // Test 3: Récupérer quelques listings
    console.log('3️⃣ Récupération de 5 listings...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, price, category, status')
      .limit(5);
    
    if (listingsError) {
      console.error('❌ Erreur récupération:', listingsError.message);
    } else {
      console.log(`✅ ${listings?.length || 0} listings récupérés:`);
      listings?.forEach((listing, i) => {
        console.log(`   ${i + 1}. ${listing.title} (${listing.category}) - ${listing.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testConnection();
