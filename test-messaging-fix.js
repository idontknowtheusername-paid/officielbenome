// Script de test rapide pour vérifier les corrections du bug "utilisateur inconnu"
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'VOTRE_URL_SUPABASE';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'VOTRE_CLE_ANON';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'VOTRE_URL_SUPABASE') {
  console.error('❌ Variables d\'environnement Supabase non configurées');
  console.log('💡 Configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 TEST DES CORRECTIONS DU BUG "UTILISATEUR INCONNU"');
console.log('===================================================\n');

async function testCorrections() {
  try {
    // 1. TEST DE CONNEXION
    console.log('1️⃣ TEST DE CONNEXION SUPABASE');
    console.log('-------------------------------');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️ Mode anonyme (normal si pas connecté)');
    } else if (user) {
      console.log('✅ Utilisateur connecté:', user.email);
    }
    
    // 2. TEST DE LECTURE DE LA TABLE USERS
    console.log('\n2️⃣ TEST DE LECTURE DE LA TABLE USERS');
    console.log('-------------------------------------');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .limit(3);
    
    if (usersError) {
      console.error('❌ ERREUR RLS - La table users n\'est pas accessible:', usersError.message);
      console.log('🔧 SOLUTION: Exécuter le script fix-messaging-rls.sql dans Supabase');
      return false;
    } else {
      console.log('✅ SUCCÈS - La table users est accessible');
      console.log('📊 Utilisateurs trouvés:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('📝 Exemple d\'utilisateur:', {
          id: users[0].id,
          name: `${users[0].first_name || 'N/A'} ${users[0].last_name || 'N/A'}`,
          email: users[0].email
        });
      }
    }
    
    // 3. TEST DE RÉCUPÉRATION DES CONVERSATIONS
    console.log('\n3️⃣ TEST DE RÉCUPÉRATION DES CONVERSATIONS');
    console.log('------------------------------------------');
    
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        created_at
      `)
      .limit(3);
    
    if (convError) {
      console.error('❌ ERREUR - Impossible de récupérer les conversations:', convError.message);
      return false;
    } else {
      console.log('✅ SUCCÈS - Conversations récupérées:', conversations?.length || 0);
    }
    
    // 4. TEST DE RÉCUPÉRATION DES PARTICIPANTS
    console.log('\n4️⃣ TEST DE RÉCUPÉRATION DES PARTICIPANTS');
    console.log('------------------------------------------');
    
    if (conversations && conversations.length > 0) {
      const testConv = conversations[0];
      console.log(`🔍 Test avec la conversation: ${testConv.id}`);
      
      // Récupérer participant1
      if (testConv.participant1_id) {
        const { data: p1, error: p1Error } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .eq('id', testConv.participant1_id)
          .single();
        
        if (p1Error) {
          console.error(`❌ ERREUR participant1:`, p1Error.message);
        } else {
          console.log(`✅ Participant1 récupéré: ${p1.first_name || 'N/A'} ${p1.last_name || 'N/A'}`);
        }
      }
      
      // Récupérer participant2
      if (testConv.participant2_id) {
        const { data: p2, error: p2Error } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .eq('id', testConv.participant2_id)
          .single();
        
        if (p2Error) {
          console.error(`❌ ERREUR participant2:`, p2Error.message);
        } else {
          console.log(`✅ Participant2 récupéré: ${p2.first_name || 'N/A'} ${p2.last_name || 'N/A'}`);
        }
      }
    }
    
    // 5. TEST DE RÉCUPÉRATION DES MESSAGES
    console.log('\n5️⃣ TEST DE RÉCUPÉRATION DES MESSAGES');
    console.log('--------------------------------------');
    
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        conversation_id,
        created_at
      `)
      .limit(3);
    
    if (msgError) {
      console.error('❌ ERREUR - Impossible de récupérer les messages:', msgError.message);
      return false;
    } else {
      console.log('✅ SUCCÈS - Messages récupérés:', messages?.length || 0);
    }
    
    // 6. TEST DE RÉCUPÉRATION DES EXPÉDITEURS
    console.log('\n6️⃣ TEST DE RÉCUPÉRATION DES EXPÉDITEURS');
    console.log('------------------------------------------');
    
    if (messages && messages.length > 0) {
      const testMsg = messages[0];
      console.log(`🔍 Test avec le message: ${testMsg.id}`);
      
      if (testMsg.sender_id) {
        const { data: sender, error: senderError } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .eq('id', testMsg.sender_id)
          .single();
        
        if (senderError) {
          console.error(`❌ ERREUR expéditeur:`, senderError.message);
        } else {
          console.log(`✅ Expéditeur récupéré: ${sender.first_name || 'N/A'} ${sender.last_name || 'N/A'}`);
        }
      }
    }
    
    // 7. VÉRIFICATION DES POLITIQUES RLS
    console.log('\n7️⃣ VÉRIFICATION DES POLITIQUES RLS');
    console.log('-----------------------------------');
    
    try {
      // Test de lecture directe
      const { data: testRead, error: testReadError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .limit(1);
      
      if (testReadError) {
        console.error('❌ POLITIQUES RLS - Lecture bloquée:', testReadError.message);
        console.log('🔧 SOLUTION: Vérifier les politiques RLS sur la table users');
      } else {
        console.log('✅ POLITIQUES RLS - Lecture autorisée');
      }
    } catch (error) {
      console.error('❌ ERREUR lors du test RLS:', error.message);
    }
    
    // 8. RÉSUMÉ DES TESTS
    console.log('\n8️⃣ RÉSUMÉ DES TESTS');
    console.log('---------------------');
    
    const tests = [
      { name: 'Connexion Supabase', status: !authError },
      { name: 'Lecture table users', status: !usersError },
      { name: 'Lecture conversations', status: !convError },
      { name: 'Lecture messages', status: !msgError }
    ];
    
    const passedTests = tests.filter(t => t.status).length;
    const totalTests = tests.length;
    
    tests.forEach(test => {
      const icon = test.status ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${test.status ? 'SUCCÈS' : 'ÉCHEC'}`);
    });
    
    console.log(`\n📊 Résultat: ${passedTests}/${totalTests} tests réussis`);
    
    if (passedTests === totalTests) {
      console.log('🎉 TOUS LES TESTS SONT RÉUSSIS !');
      console.log('✅ Le bug "utilisateur inconnu" devrait être résolu');
      console.log('🔍 Vérifiez maintenant l\'interface utilisateur');
    } else {
      console.log('⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('🔧 Consultez le guide de résolution pour les étapes suivantes');
    }
    
    return passedTests === totalTests;
    
  } catch (error) {
    console.error('❌ ERREUR FATALE DANS LES TESTS:', error);
    return false;
  }
}

// Exécuter les tests
testCorrections().then((success) => {
  if (success) {
    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('1. Vérifier l\'interface utilisateur');
    console.log('2. Tester la messagerie');
    console.log('3. Vérifier les logs dans la console du navigateur');
  } else {
    console.log('\n🔧 PROCHAINES ÉTAPES:');
    console.log('1. Exécuter fix-messaging-rls.sql dans Supabase');
    console.log('2. Vérifier les politiques RLS');
    console.log('3. Relancer ce script de test');
  }
  
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('❌ ERREUR FATALE:', error);
  process.exit(1);
});
