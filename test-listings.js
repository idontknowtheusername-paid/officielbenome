import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testListings() {
  try {
    console.log('🔍 Test des annonces dans la base de données...');
    
    // Récupérer quelques annonces
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, category, status, created_at')
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      return;
    }
    
    console.log('✅ Annonces trouvées:', data.length);
    console.log('📋 Détails des annonces:');
    
    data.forEach((listing, index) => {
      console.log(`\n${index + 1}. ID: ${listing.id} (Type: ${typeof listing.id})`);
      console.log(`   Titre: ${listing.title}`);
      console.log(`   Catégorie: ${listing.category}`);
      console.log(`   Statut: ${listing.status}`);
      console.log(`   Créé le: ${listing.created_at}`);
    });
    
    // Tester la récupération d'une annonce spécifique
    if (data.length > 0) {
      const testId = data[0].id;
      console.log(`\n🔍 Test de récupération de l'annonce ID: ${testId}`);
      
      const { data: singleListing, error: singleError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', testId)
        .single();
      
      if (singleError) {
        console.error('❌ Erreur lors de la récupération d\'une annonce:', singleError);
      } else {
        console.log('✅ Annonce récupérée avec succès:', {
          id: singleListing.id,
          title: singleListing.title,
          category: singleListing.category
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testListings(); 