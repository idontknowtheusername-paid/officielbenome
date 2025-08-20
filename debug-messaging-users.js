// Script de diagnostic pour le bug "utilisateur inconnu" dans la messagerie
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (à adapter selon votre environnement)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'VOTRE_URL_SUPABASE';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'VOTRE_CLE_ANON';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'VOTRE_URL_SUPABASE') {
  console.error('❌ Variables d\'environnement Supabase non configurées');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNOSTIC DU BUG "UTILISATEUR INCONNU"');
console.log('===========================================\n');

async function diagnosticComplet() {
  try {
    // 1. VÉRIFIER LA CONNEXION SUPABASE
    console.log('1️⃣ VÉRIFICATION DE LA CONNEXION SUPABASE');
    console.log('----------------------------------------');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Erreur d\'authentification:', authError);
      return;
    }
    
    if (!user) {
      console.log('⚠️ Aucun utilisateur connecté, test en mode anonyme');
    } else {
      console.log('✅ Utilisateur connecté:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });
    }
    
    // 2. VÉRIFIER LA STRUCTURE DE LA TABLE USERS
    console.log('\n2️⃣ VÉRIFICATION DE LA STRUCTURE DE LA TABLE USERS');
    console.log('------------------------------------------------');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, profile_image')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erreur récupération users:', usersError);
    } else {
      console.log('✅ Structure de la table users:');
      console.log('Colonnes disponibles:', Object.keys(users[0] || {}));
      console.log('Exemple d\'utilisateur:', users[0]);
    }
    
    // 3. VÉRIFIER LES CONVERSATIONS
    console.log('\n3️⃣ VÉRIFICATION DES CONVERSATIONS');
    console.log('----------------------------------');
    
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        participant1_id,
        participant2_id,
        created_at
      `)
      .limit(5);
    
    if (convError) {
      console.error('❌ Erreur récupération conversations:', convError);
    } else {
      console.log('✅ Conversations trouvées:', conversations?.length || 0);
      if (conversations && conversations.length > 0) {
        console.log('Exemple de conversation:', conversations[0]);
      }
    }
    
    // 4. VÉRIFIER LES MESSAGES
    console.log('\n4️⃣ VÉRIFICATION DES MESSAGES');
    console.log('-----------------------------');
    
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        receiver_id,
        conversation_id,
        created_at
      `)
      .limit(5);
    
    if (msgError) {
      console.error('❌ Erreur récupération messages:', msgError);
    } else {
      console.log('✅ Messages trouvés:', messages?.length || 0);
      if (messages && messages.length > 0) {
        console.log('Exemple de message:', messages[0]);
      }
    }
    
    // 5. TESTER LA RÉCUPÉRATION DES PARTICIPANTS
    console.log('\n5️⃣ TEST DE RÉCUPÉRATION DES PARTICIPANTS');
    console.log('------------------------------------------');
    
    if (conversations && conversations.length > 0) {
      const testConversation = conversations[0];
      console.log('🔍 Test avec la conversation:', testConversation.id);
      
      // Récupérer participant1
      if (testConversation.participant1_id) {
        console.log('🔍 Récupération participant1:', testConversation.participant1_id);
        const { data: p1, error: p1Error } = await supabase
          .from('users')
          .select('id, first_name, last_name, profile_image')
          .eq('id', testConversation.participant1_id)
          .single();
        
        if (p1Error) {
          console.error('❌ Erreur participant1:', p1Error);
        } else {
          console.log('✅ Participant1 récupéré:', p1);
        }
      }
      
      // Récupérer participant2
      if (testConversation.participant2_id) {
        console.log('🔍 Récupération participant2:', testConversation.participant2_id);
        const { data: p2, error: p2Error } = await supabase
          .from('users')
          .select('id, first_name, last_name, profile_image')
          .eq('id', testConversation.participant2_id)
          .single();
        
        if (p2Error) {
          console.error('❌ Erreur participant2:', p2Error);
        } else {
          console.log('✅ Participant2 récupéré:', p2);
        }
      }
    }
    
    // 6. TESTER LA RÉCUPÉRATION DES EXPÉDITEURS DE MESSAGES
    console.log('\n6️⃣ TEST DE RÉCUPÉRATION DES EXPÉDITEURS');
    console.log('------------------------------------------');
    
    if (messages && messages.length > 0) {
      const testMessage = messages[0];
      console.log('🔍 Test avec le message:', testMessage.id);
      
      if (testMessage.sender_id) {
        console.log('🔍 Récupération expéditeur:', testMessage.sender_id);
        const { data: sender, error: senderError } = await supabase
          .from('users')
          .select('id, first_name, last_name, profile_image')
          .eq('id', testMessage.sender_id)
          .single();
        
        if (senderError) {
          console.error('❌ Erreur expéditeur:', senderError);
        } else {
          console.log('✅ Expéditeur récupéré:', sender);
        }
      }
    }
    
    // 7. VÉRIFIER LES POLITIQUES RLS
    console.log('\n7️⃣ VÉRIFICATION DES POLITIQUES RLS');
    console.log('-----------------------------------');
    
    // Test direct des requêtes pour voir si les politiques bloquent
    console.log('🔍 Test de lecture directe de la table users...');
    
    try {
      const { data: testUsers, error: testError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .limit(1);
      
      if (testError) {
        console.error('❌ Politique RLS bloque la lecture:', testError);
      } else {
        console.log('✅ Politique RLS permet la lecture');
      }
    } catch (error) {
      console.error('❌ Erreur lors du test RLS:', error);
    }
    
    // 8. RÉSUMÉ ET RECOMMANDATIONS
    console.log('\n8️⃣ RÉSUMÉ ET RECOMMANDATIONS');
    console.log('--------------------------------');
    
    console.log('🔍 Points à vérifier :');
    console.log('- Les colonnes first_name et last_name existent-elles dans la table users ?');
    console.log('- Les politiques RLS permettent-elles de lire les profils des autres utilisateurs ?');
    console.log('- Les IDs des participants correspondent-ils à des utilisateurs valides ?');
    console.log('- Y a-t-il des erreurs 400/403 dans la console du navigateur ?');
    
    console.log('\n🔧 Actions recommandées :');
    console.log('1. Vérifier la structure de la table users dans Supabase');
    console.log('2. Créer des politiques RLS appropriées pour la table users');
    console.log('3. Vérifier que les utilisateurs ont bien first_name et last_name');
    console.log('4. Ajouter des logs dans ConversationCard pour voir les données reçues');
    
  } catch (error) {
    console.error('❌ Erreur générale dans le diagnostic:', error);
  }
}

// Exécuter le diagnostic
diagnosticComplet().then(() => {
  console.log('\n✅ Diagnostic terminé');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
