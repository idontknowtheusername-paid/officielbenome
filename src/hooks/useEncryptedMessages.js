import { useState, useEffect, useCallback } from 'react';
import { encryptedMessageService, encryptionService } from '@/services';
import { MESSAGING_CONFIG } from '@/config/messaging';

/**
 * Hook pour gérer les messages chiffrés E2E
 */
export const useEncryptedMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEncryptionActive, setIsEncryptionActive] = useState(false);

  // Vérifier si encryption est active
  useEffect(() => {
    const active = MESSAGING_CONFIG.SECURITY.ENABLE_ENCRYPTION && encryptionService.isSupported();
    setIsEncryptionActive(active);
    
    if (active) {
      console.log('🔐 Encryption E2E activée pour conversation:', conversationId);
    }
  }, [conversationId]);

  // Charger les messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser le service chiffré
      const data = await encryptedMessageService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Envoyer un message
  const sendMessage = useCallback(async (content, metadata = {}) => {
    if (!conversationId || !content.trim()) return;
    
    try {
      const senderId = (await import('@/contexts/AuthContext')).useAuth?.user?.id;
      
      // Envoyer via service chiffré
      const newMessage = await encryptedMessageService.sendMessage(
        conversationId,
        senderId,
        content,
        metadata
      );
      
      // Recharger messages
      await loadMessages();
      
      return newMessage;
    } catch (err) {
      console.error('Erreur envoi message:', err);
      throw err;
    }
  }, [conversationId, loadMessages]);

  // Initialisation
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // S'abonner aux nouveaux messages temps réel
  useEffect(() => {
    if (!conversationId) return;

    const subscription = encryptedMessageService.subscribeToConversation(
      conversationId,
      async (payload) => {
        console.log('🔔 Nouveau message temps réel:', payload);
        // Recharger pour déchiffrer
        await loadMessages();
      }
    );

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [conversationId, loadMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadMessages,
    isEncryptionActive
  };
};

export default useEncryptedMessages;
