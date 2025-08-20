import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshButton } from '@/components/ui';
import { messageService } from '@/services/message.service';
import { supabase } from '@/lib/supabase';

const RealTimeTester = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fonction pour synchroniser la conversation
  const syncConversation = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      console.log('🧪 TEST - Synchronisation de la conversation:', conversationId);
      
      const updatedMessages = await messageService.syncConversation(conversationId);
      setMessages(updatedMessages);
      setLastUpdate(new Date().toLocaleTimeString());
      
      console.log('✅ TEST - Conversation synchronisée:', updatedMessages.length, 'messages');
    } catch (error) {
      console.error('❌ TEST - Erreur de synchronisation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour actualiser toutes les conversations
  const refreshAll = async () => {
    try {
      setLoading(true);
      console.log('🧪 TEST - Actualisation de toutes les conversations...');
      
      const conversations = await messageService.refreshConversations();
      console.log('✅ TEST - Conversations actualisées:', conversations.length);
      
      // Synchroniser aussi la conversation actuelle
      if (conversationId) {
        await syncConversation();
      }
    } catch (error) {
      console.error('❌ TEST - Erreur d\'actualisation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration de l'écoute en temps réel
  useEffect(() => {
    if (!conversationId) return;

    console.log('🔌 TEST - Configuration de l\'écoute en temps réel...');

    // Écouter les nouveaux messages
    const messagesSubscription = supabase
      .channel(`test-messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        console.log('🆕 TEST - Nouveau message reçu en temps réel:', payload.new);
        
        // Mettre à jour immédiatement l'interface
        setMessages(prev => [...prev, payload.new]);
        setLastUpdate(new Date().toLocaleTimeString());
        
        console.log('✅ TEST - Interface mise à jour automatiquement !');
      })
      .subscribe();

    return () => {
      console.log('🔌 TEST - Désabonnement de l\'écoute en temps réel');
      supabase.removeChannel(messagesSubscription);
    };
  }, [conversationId]);

  // Synchronisation initiale
  useEffect(() => {
    if (conversationId) {
      syncConversation();
    }
  }, [conversationId]);

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-4 text-blue-800">
        🧪 Testeur de Temps Réel
      </h3>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button 
            onClick={syncConversation} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            🔄 Synchroniser
          </Button>
          
          <RefreshButton 
            onRefresh={refreshAll} 
            loading={loading}
            size="sm"
            variant="outline"
          >
            Actualiser Tout
          </RefreshButton>
        </div>

        {lastUpdate && (
          <p className="text-sm text-gray-600">
            Dernière mise à jour : {lastUpdate}
          </p>
        )}

        <div className="text-sm">
          <p><strong>Messages dans la conversation :</strong> {messages.length}</p>
          <p><strong>Conversation ID :</strong> {conversationId || 'Aucune'}</p>
        </div>

        {messages.length > 0 && (
          <div className="max-h-40 overflow-y-auto border rounded p-2 bg-white">
            <p className="text-xs text-gray-500 mb-2">Derniers messages :</p>
            {messages.slice(-3).map((msg, index) => (
              <div key={msg.id} className="text-xs p-1 border-b last:border-b-0">
                <span className="font-medium">
                  {msg.sender?.first_name || 'Utilisateur'}:
                </span>
                <span className="ml-2">
                  {msg.content?.substring(0, 30)}...
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeTester;
