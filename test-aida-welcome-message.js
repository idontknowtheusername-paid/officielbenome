// Test Message de Bienvenue AIDA
import { messageService, addWelcomeMessage } from './src/services/message.service.js';
import { supabase } from './src/lib/supabase.js';

const testAIDAWelcomeMessage = async () => {
  console.log('🧪 TEST MESSAGE DE BIENVENUE AIDA');
  console.log('=====================================');

  try {
    // 1. Vérifier l'authentification
    console.log('\n1️⃣ Vérification de l\'authentification...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Utilisateur non connecté');
      console.log('💡 Connectez-vous d\'abord à l\'application');
      return false;
    }
    
    console.log('✅ Utilisateur connecté:', user.email);

    // 2. Tester la création directe du message de bienvenue
    console.log('\n2️⃣ Test création directe message de bienvenue...');
    const conversation = await addWelcomeMessage(user.id);
    
    if (!conversation) {
      console.error('❌ Échec création conversation de bienvenue');
      return false;
    }
    
    console.log('✅ Conversation créée:', conversation.id);

    // 3. Vérifier que le message existe
    console.log('\n3️⃣ Vérification du message de bienvenue...');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .eq('sender_id', '00000000-0000-0000-0000-000000000000');

    if (msgError) {
      console.error('❌ Erreur récupération messages:', msgError);
      return false;
    }

    if (!messages || messages.length === 0) {
      console.error('❌ Aucun message de bienvenue trouvé');
      return false;
    }

    console.log('✅ Message de bienvenue trouvé');
    console.log('📝 Contenu:', messages[0].content.substring(0, 100) + '...');

    // 4. Tester getUserConversations
    console.log('\n4️⃣ Test getUserConversations...');
    const conversations = await messageService.getUserConversations();
    
    if (!conversations || conversations.length === 0) {
      console.error('❌ Aucune conversation récupérée');
      return false;
    }

    const assistantConv = conversations.find(c => 
      c.participant1?.id === '00000000-0000-0000-0000-000000000000' ||
      c.participant2?.id === '00000000-0000-0000-0000-000000000000'
    );

    if (!assistantConv) {
      console.error('❌ Conversation assistant non trouvée dans la liste');
      return false;
    }

    console.log('✅ Conversation assistant trouvée dans getUserConversations');
    console.log('👤 Participant 1:', assistantConv.participant1?.first_name || 'N/A');
    console.log('👤 Participant 2:', assistantConv.participant2?.first_name || 'N/A');
    console.log('📝 Messages:', assistantConv.messages?.length || 0);

    // 5. Vérifier l'utilisateur assistant
    console.log('\n5️⃣ Vérification utilisateur assistant...');
    const { data: assistant, error: assistantError } = await supabase
      .from('users')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (assistantError) {
      console.error('❌ Erreur récupération utilisateur assistant:', assistantError);
      return false;
    }

    if (!assistant) {
      console.error('❌ Utilisateur assistant non trouvé');
      return false;
    }

    console.log('✅ Utilisateur assistant trouvé:', assistant.first_name, assistant.last_name);

    console.log('\n🎉 TOUS LES TESTS PASSÉS !');
    console.log('✅ Le message de bienvenue AIDA est correctement configuré');
    
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
};

// Fonction pour nettoyer les données de test
const cleanupTestData = async () => {
  console.log('\n🧹 Nettoyage des données de test...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Supprimer les conversations de test avec l'assistant
    const { error: convError } = await supabase
      .from('conversations')
      .delete()
      .or(`participant1_id.eq.00000000-0000-0000-0000-000000000000,participant2_id.eq.${user.id}`)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.00000000-0000-0000-0000-000000000000`);

    if (convError) {
      console.error('❌ Erreur nettoyage conversations:', convError);
    } else {
      console.log('✅ Conversations de test supprimées');
    }

  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
};

export { testAIDAWelcomeMessage, cleanupTestData };

// Si exécuté directement
if (typeof window !== 'undefined') {
  window.testAIDAWelcomeMessage = testAIDAWelcomeMessage;
  window.cleanupTestData = cleanupTestData;
  
  console.log('🧪 Script de test AIDA chargé');
  console.log('💡 Utilisez testAIDAWelcomeMessage() dans la console pour tester');
}
