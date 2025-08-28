#!/usr/bin/env node

/**
 * 🎨 Script de Démonstration - Générateur de Mockups MaxiMarket
 * 
 * Ce script démontre toutes les fonctionnalités du générateur de mockups
 * en créant des exemples pour chaque plateforme et template.
 */

import MockupGenerator from './create-mockups.js';
import fs from 'fs';

async function runDemo() {
  console.log('🎨 DÉMONSTRATION - Générateur de Mockups MaxiMarket\n');
  
  const generator = new MockupGenerator();
  
  // 1. Générer un mockup unique pour Instagram
  console.log('📱 1. Création d\'un mockup Instagram...');
  try {
    const instagramMockup = generator.generateMockup('instagram', 'product_showcase');
    console.log(`   ✅ Mockup Instagram créé: ${instagramMockup}`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  
  // 2. Générer un batch complet pour les témoignages
  console.log('\n💬 2. Création d\'un batch de témoignages...');
  try {
    const testimonialResults = generator.generateBatch('testimonial');
    console.log(`   ✅ ${testimonialResults.filter(r => r.success).length} mockups de témoignages créés`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  
  // 3. Générer un batch pour les insights business
  console.log('\n💼 3. Création d\'un batch d\'insights business...');
  try {
    const businessResults = generator.generateBatch('business_insights');
    console.log(`   ✅ ${businessResults.filter(r => r.success).length} mockups business créés`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  
  // 4. Générer un calendrier de contenu
  console.log('\n📅 4. Création d\'un calendrier de contenu...');
  try {
    const calendar = generator.generateContentCalendar(1); // 1 semaine
    console.log(`   ✅ Calendrier de 1 semaine créé avec ${calendar[0].posts.length} posts`);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  
  // 5. Générer un rapport final
  console.log('\n📊 5. Génération du rapport final...');
  try {
    const report = generator.generateReport();
    console.log(`   ✅ Rapport généré avec ${report.total} mockups au total`);
    console.log(`   📈 Répartition par plateforme:`);
    Object.entries(report.byPlatform).forEach(([platform, count]) => {
      console.log(`      - ${platform}: ${count} mockups`);
    });
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
  
  // 6. Afficher les instructions pour utiliser les mockups
  console.log('\n🎯 6. Instructions d\'utilisation:');
  console.log('   📁 Tous les mockups sont dans le dossier: ./mockups/');
  console.log('   🎨 Chaque fichier .json contient:');
  console.log('      - Les dimensions exactes pour chaque réseau');
  console.log('      - Le contenu à utiliser (titre, sous-titre, CTA)');
  console.log('      - Les couleurs de marque MaxiMarket');
  console.log('      - Les hashtags recommandés');
  console.log('      - Les instructions étape par étape');
  console.log('   🛠️  Outils recommandés: Canva, Figma, Photoshop');
  console.log('   📱 Mockups d\'appareils: iPhone 14, MacBook Pro, etc.');
  
  // 7. Exemple de contenu généré
  console.log('\n📝 7. Exemple de contenu généré:');
  const exampleMockup = generator.generateMockup('instagram', 'feature_highlight');
  const mockupContent = JSON.parse(fs.readFileSync(exampleMockup, 'utf8'));
  
  console.log(`   Titre: ${mockupContent.design.content.title}`);
  console.log(`   Sous-titre: ${mockupContent.design.content.subtitle}`);
  console.log(`   CTA: ${mockupContent.design.content.cta}`);
  console.log(`   Hashtags: ${mockupContent.design.hashtags.join(' ')}`);
  console.log(`   Dimensions: ${mockupContent.metadata.dimensions.width}x${mockupContent.metadata.dimensions.height}px`);
  
  console.log('\n🎉 DÉMONSTRATION TERMINÉE !');
  console.log('\n💡 Prochaines étapes:');
  console.log('   1. Ouvrir les fichiers .json dans ./mockups/');
  console.log('   2. Suivre les instructions pour créer les visuels');
  console.log('   3. Utiliser Canva ou Figma avec les dimensions exactes');
  console.log('   4. Appliquer les couleurs et typographies de marque');
  console.log('   5. Exporter et publier sur les réseaux sociaux');
  
  console.log('\n🚀 Commandes disponibles:');
  console.log('   node scripts/create-mockups.js single <platform> <template>');
  console.log('   node scripts/create-mockups.js batch <template>');
  console.log('   node scripts/create-mockups.js calendar [weeks]');
  console.log('   node scripts/create-mockups.js report');
}

// Exécuter la démonstration
runDemo().catch(console.error);
