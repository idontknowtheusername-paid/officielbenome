// Script pour configurer les variables d'environnement Supabase dans Vercel
// Usage: node setup-supabase-env.js

import fetch from 'node-fetch';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

// Variables Supabase à configurer
const SUPABASE_VARS = {
  'VITE_SUPABASE_URL': 'https://vvlpgviacinsbggfsexs.supabase.co',
  'VITE_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bHBndmlhY2luc2JnZ2ZzZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjMzNjUsImV4cCI6MjA3MDA5OTM2NX0.YsZUDyYfgGHD7jNDKAVaR4Y0yzulwLo2NGo85ohHefY'
};

async function setupSupabaseEnv() {
  console.log('🔧 Configuration des variables d\'environnement Supabase dans Vercel...\n');

  if (!VERCEL_TOKEN) {
    console.log('❌ VERCEL_TOKEN n\'est pas défini');
    console.log('💡 Pour obtenir un token Vercel:');
    console.log('1. Allez sur https://vercel.com/account/tokens');
    console.log('2. Créez un nouveau token');
    console.log('3. Exécutez: VERCEL_TOKEN=votre_token node setup-supabase-env.js');
    return;
  }

  if (!PROJECT_ID) {
    console.log('❌ VERCEL_PROJECT_ID n\'est pas défini');
    console.log('💡 Pour obtenir l\'ID du projet:');
    console.log('1. Allez sur https://vercel.com/dashboard');
    console.log('2. Sélectionnez votre projet officielbenome');
    console.log('3. Settings > General > Project ID');
    console.log('4. Exécutez: VERCEL_PROJECT_ID=votre_id VERCEL_TOKEN=votre_token node setup-supabase-env.js');
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
    const existingVars = envVars.envs || [];

    // Configurer chaque variable Supabase
    for (const [key, value] of Object.entries(SUPABASE_VARS)) {
      const existingVar = existingVars.find(env => env.key === key);
      
      if (existingVar) {
        console.log(`✅ ${key} existe déjà`);
        
        // Mettre à jour si nécessaire
        if (existingVar.value !== value) {
          console.log(`🔄 Mise à jour de ${key}...`);
          const updateResponse = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env/${existingVar.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${VERCEL_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              value: value
            })
          });

          if (updateResponse.ok) {
            console.log(`✅ ${key} mise à jour avec succès`);
          } else {
            throw new Error(`Erreur mise à jour ${key}: ${updateResponse.status}`);
          }
        } else {
          console.log(`✅ ${key} déjà à jour`);
        }
      } else {
        console.log(`📝 Création de ${key}...`);
        
        // Créer la nouvelle variable
        const createResponse = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_ID}/env`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: key,
            value: value,
            target: ['production', 'preview']
          })
        });

        if (createResponse.ok) {
          console.log(`✅ ${key} créée avec succès`);
        } else {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new Error(`Erreur création ${key}: ${createResponse.status} - ${errorData.error || 'Erreur inconnue'}`);
        }
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

    console.log('\n🎉 Configuration Supabase terminée !');
    console.log('📋 Prochaines étapes:');
    console.log('1. Attendez que le déploiement se termine (2-3 minutes)');
    console.log('2. Testez les annonces sur https://officielbenome.vercel.app');
    console.log('3. Vérifiez que les annonces s\'affichent correctement');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Configuration manuelle:');
    console.log('1. Allez sur https://vercel.com/dashboard');
    console.log('2. Sélectionnez officielbenome');
    console.log('3. Settings > Environment Variables');
    console.log('4. Ajoutez:');
    console.log('   VITE_SUPABASE_URL = https://vvlpgviacinsbggfsexs.supabase.co');
    console.log('   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bHBndmlhY2luc2JnZ2ZzZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjMzNjUsImV4cCI6MjA3MDA5OTM2NX0.YsZUDyYfgGHD7jNDKAVaR4Y0yzulwLo2NGo85ohHefY');
    console.log('5. Redéployez');
  }
}

// Instructions d'utilisation
if (!VERCEL_TOKEN || !PROJECT_ID) {
  console.log('🔧 Configuration automatique des variables Supabase dans Vercel\n');
  console.log('📋 Prérequis:');
  console.log('1. Token Vercel: https://vercel.com/account/tokens');
  console.log('2. ID du projet: https://vercel.com/dashboard > officielbenome > Settings > General > Project ID\n');
  console.log('💻 Usage:');
  console.log('VERCEL_TOKEN=votre_token VERCEL_PROJECT_ID=votre_id node setup-supabase-env.js\n');
  console.log('🔍 Ou configurez manuellement:');
  console.log('1. https://vercel.com/dashboard > officielbenome > Settings > Environment Variables');
  console.log('2. Ajoutez:');
  console.log('   VITE_SUPABASE_URL = https://vvlpgviacinsbggfsexs.supabase.co');
  console.log('   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bHBndmlhY2luc2JnZ2ZzZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjMzNjUsImV4cCI6MjA3MDA5OTM2NX0.YsZUDyYfgGHD7jNDKAVaR4Y0yzulwLo2NGo85ohHefY');
  console.log('3. Redéployez');
} else {
  setupSupabaseEnv();
} 