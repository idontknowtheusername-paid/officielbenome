/**
 * Service de Messages avec Encryption E2E
 * Wrapper autour de message.service avec chiffrement automatique
 */

import { messageService } from './message.service';
import { encryptionService } from './encryption.service';
import { MESSAGING_CONFIG } from '@/config/messaging';
import { logger } from '@/utils/logger';

class EncryptedMessageService {
  constructor() {
    this.encryptionEnabled = MESSAGING_CONFIG.SECURITY.ENABLE_ENCRYPTION;
  }

  /**
   * Envoyer un message chiffré
   */
  async sendMessage(conversationId, senderId, content, metadata = {}) {
    try {
      let finalContent = content;
      let encryptionMeta = {};

      // Chiffrer si activé
      if (this.encryptionEnabled && encryptionService.isSupported()) {
        // Obtenir ou créer clé de conversation
        const key = await encryptionService.getOrCreateConversationKey(conversationId);
        
        // Chiffrer le contenu
        const { encrypted, iv } = await encryptionService.encrypt(content, key);
        
        finalContent = encrypted;
        encryptionMeta = {
          encrypted: true,
          iv: iv,
          algorithm: 'AES-GCM'
        };
        
        logger.log('🔐 Message chiffré E2E');
      }

      // Envoyer via service normal
      return await messageService.sendMessage(
        conversationId,
        senderId,
        finalContent,
        {
          ...metadata,
          ...encryptionMeta
        }
      );
    } catch (error) {
      logger.error('Erreur envoi message chiffré:', error);
      throw error;
    }
  }

  /**
   * Récupérer et déchiffrer les messages d'une conversation
   */
  async getMessages(conversationId, options = {}) {
    try {
      // Récupérer messages via service normal
      const messages = await messageService.getMessages(conversationId, options);
      
      // Déchiffrer si nécessaire
      if (this.encryptionEnabled && encryptionService.isSupported()) {
        const key = await encryptionService.getOrCreateConversationKey(conversationId);
        
        const decryptedMessages = await Promise.all(
          messages.map(async (msg) => {
            // Si le message est chiffré
            if (msg.metadata?.encrypted && msg.metadata?.iv) {
              try {
                const decrypted = await encryptionService.decrypt(
                  msg.content,
                  msg.metadata.iv,
                  key
                );
                
                return {
                  ...msg,
                  content: decrypted,
                  metadata: {
                    ...msg.metadata,
                    decrypted: true
                  }
                };
              } catch (error) {
                logger.error('Erreur déchiffrement message:', error);
                // Retourner message avec indication d'erreur
                return {
                  ...msg,
                  content: '[Message chiffré - Erreur de déchiffrement]',
                  metadata: {
                    ...msg.metadata,
                    decryptError: true
                  }
                };
              }
            }
            
            // Message non chiffré, retourner tel quel
            return msg;
          })
        );
        
        return decryptedMessages;
      }
      
      return messages;
    } catch (error) {
      logger.error('Erreur récupération messages:', error);
      throw error;
    }
  }

  /**
   * Supprimer la clé de conversation (logout, suppression conversation)
   */
  deleteConversationKey(conversationId) {
    if (this.encryptionEnabled) {
      encryptionService.deleteConversationKey(conversationId);
      logger.log('🔐 Clé de conversation supprimée');
    }
  }

  /**
   * Vérifier si l'encryption est active et supportée
   */
  isEncryptionActive() {
    return this.encryptionEnabled && encryptionService.isSupported();
  }

  /**
   * Wrapper pour les autres méthodes de messageService
   */
  async getConversations(userId, options) {
    return messageService.getConversations(userId, options);
  }

  async getConversation(conversationId) {
    return messageService.getConversation(conversationId);
  }

  async createConversation(participant1Id, participant2Id, listingId = null) {
    return messageService.createConversation(participant1Id, participant2Id, listingId);
  }

  async markAsRead(conversationId, userId) {
    return messageService.markAsRead(conversationId, userId);
  }

  async deleteMessage(messageId, userId) {
    return messageService.deleteMessage(messageId, userId);
  }

  async deleteConversation(conversationId, userId) {
    // Supprimer aussi la clé
    this.deleteConversationKey(conversationId);
    return messageService.deleteConversation(conversationId, userId);
  }

  subscribeToConversation(conversationId, callback) {
    return messageService.subscribeToConversation(conversationId, callback);
  }

  subscribeToNewConversations(userId, callback) {
    return messageService.subscribeToNewConversations(userId, callback);
  }
}

export const encryptedMessageService = new EncryptedMessageService();
export default encryptedMessageService;
