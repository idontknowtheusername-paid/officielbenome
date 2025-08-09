// Script pour configurer la variable d'environnement MISTRAL_API_KEY dans Vercel
// Usage: node setup-vercel-env.js

import fetch from 'node-fetch';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const MISTRAL_API_KEY = 'rJHJdTtKsu58p2k1j5jkBmUwyc56z5tP';

async function setupVercelEnv() {
  console.log('🔧 Configuration de la variable d\'environnement MISTRAL_API_KEY dans Vercel...\n');

  if (!VERCEL_TOKEN) {
    console.log('❌ VERCEL_TOKEN n\'est pas défini');
    console.log('💡 Pour obtenir un token Vercel:');
    console.log('1. Allez sur https://vercel.com/account/tokens');
    console.log('2. Créez un nouveau token');
    console.log('3. Exécutez: VERCEL_TOKEN=votre_token node setup-vercel-env.js');
    return;
  }

  if (!PROJECT_ID) {
    console.log('❌ VERCEL_PROJECT_ID n\'est pas défini');
    console.log('💡 Pour obtenir l\'ID du projet:');
    console.log('1. Allez sur https://vercel.com/dashboard');
    console.log('2. Sélectionnez votre projet officielbenome');
    console.log('3. Settings > General > Project ID');
    console.log('4. Exécutez: VERCEL_PROJECT_ID=votre_id VERCEL_TOKEN=votre_token node setup-vercel-env.js');
    return;
  }

  try {
    // Vérifier les variables d'environnement existantes
    console.log('1. Vérification des variables d\'environnement existantes...');
    const envResponse = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!envResponse.ok) {
      throw new Error(`Erreur API Vercel: ${envResponse.status} ${envResponse.statusText}`);
    }

    const envVars = await envResponse.json();
    const existingMistralKey = envVars.envs?.find(env => env.key === 'MISTRAL_API_KEY');

    if (existingMistralKey) {
      console.log('✅ MISTRAL_API_KEY existe déjà');
      console.log(`   ID: ${existingMistralKey.id}`);
      console.log(`   Environnements: ${existingMistralKey.target.join(', ')}`);
      
      // Mettre à jour si nécessaire
      if (existingMistralKey.value !== MISTRAL_API_KEY) {
        console.log('🔄 Mise à jour de la valeur...');
        const updateResponse = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env/${existingMistralKey.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: MISTRAL_API_KEY
          })
        });

        if (updateResponse.ok) {
          console.log('✅ MISTRAL_API_KEY mise à jour avec succès');
        } else {
          throw new Error(`Erreur mise à jour: ${updateResponse.status}`);
        }
      } else {
        console.log('✅ Valeur déjà correcte');
      }
    } else {
      console.log('📝 Création de MISTRAL_API_KEY...');
      
      // Créer la nouvelle variable
      const createResponse = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'MISTRAL_API_KEY',
          value: MISTRAL_API_KEY,
          target: ['production', 'preview']
        })
      });

      if (createResponse.ok) {
        console.log('✅ MISTRAL_API_KEY créée avec succès');
      } else {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(`Erreur création: ${createResponse.status} - ${errorData.error || 'Erreur inconnue'}`);
      }
    }

    console.log('\n2. Déclenchement du redéploiement...');
    const deployResponse = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'officielbenome',
        projectId: PROJECT_ID
      })
    });

    if (deployResponse.ok) {
      const deployData = await deployResponse.json();
      console.log('✅ Redéploiement déclenché');
      console.log(`   URL: https://vercel.com/dashboard/project/${PROJECT_ID}/deployments/${deployData.id}`);
    } else {
      console.log('⚠️ Impossible de déclencher le redéploiement automatique');
      console.log('💡 Redéployez manuellement depuis le dashboard Vercel');
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('📋 Prochaines étapes:');
    console.log('1. Attendez que le déploiement se termine (2-3 minutes)');
    console.log('2. Testez le chatbot sur https://officielbenome.vercel.app');
    console.log('3. Vérifiez avec: node debug-vercel.js');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Configuration manuelle:');
    console.log('1. Allez sur https://vercel.com/dashboard');
    console.log('2. Sélectionnez officielbenome');
    console.log('3. Settings > Environment Variables');
    console.log('4. Ajoutez MISTRAL_API_KEY = rJHJdTtKsu58p2k1j5jkBmUwyc56z5tP');
    console.log('5. Redéployez');
  }
}

// Instructions d'utilisation
if (!VERCEL_TOKEN || !PROJECT_ID) {
  console.log('🔧 Configuration automatique de MISTRAL_API_KEY dans Vercel\n');
  console.log('📋 Prérequis:');
  console.log('1. Token Vercel: https://vercel.com/account/tokens');
  console.log('2. ID du projet: https://vercel.com/dashboard > officielbenome > Settings > General > Project ID\n');
  console.log('💻 Usage:');
  console.log('VERCEL_TOKEN=votre_token VERCEL_PROJECT_ID=votre_id node setup-vercel-env.js\n');
  console.log('🔍 Ou configurez manuellement:');
  console.log('1. https://vercel.com/dashboard > officielbenome > Settings > Environment Variables');
  console.log('2. Ajoutez: MISTRAL_API_KEY = rJHJdTtKsu58p2k1j5jkBmUwyc56z5tP');
  console.log('3. Redéployez');
} else {
  setupVercelEnv();
} 