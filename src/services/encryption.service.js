/**
 * Service d'Encryption End-to-End (E2E) pour les messages
 * Utilise Web Crypto API (natif navigateur)
 */

class EncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12; // Pour AES-GCM
  }

  /**
   * Générer une clé de chiffrement pour une conversation
   * @returns {Promise<CryptoKey>}
   */
  async generateKey() {
    try {
      const key = await window.crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      return key;
    } catch (error) {
      console.error('Erreur génération clé:', error);
      throw error;
    }
  }

  /**
   * Exporter une clé en format base64 pour stockage
   * @param {CryptoKey} key
   * @returns {Promise<string>}
   */
  async exportKey(key) {
    try {
      const exported = await window.crypto.subtle.exportKey('raw', key);
      const exportedKeyBuffer = new Uint8Array(exported);
      return this.arrayBufferToBase64(exportedKeyBuffer);
    } catch (error) {
      console.error('Erreur export clé:', error);
      throw error;
    }
  }

  /**
   * Importer une clé depuis base64
   * @param {string} base64Key
   * @returns {Promise<CryptoKey>}
   */
  async importKey(base64Key) {
    try {
      const keyBuffer = this.base64ToArrayBuffer(base64Key);
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true,
        ['encrypt', 'decrypt']
      );
      return key;
    } catch (error) {
      console.error('Erreur import clé:', error);
      throw error;
    }
  }

  /**
   * Chiffrer un message
   * @param {string} message - Message en clair
   * @param {CryptoKey} key - Clé de chiffrement
   * @returns {Promise<{encrypted: string, iv: string}>}
   */
  async encrypt(message, key) {
    try {
      // Générer un IV aléatoire
      const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
      
      // Encoder le message
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      // Chiffrer
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      );
      
      // Convertir en base64 pour stockage
      return {
        encrypted: this.arrayBufferToBase64(new Uint8Array(encrypted)),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('Erreur chiffrement:', error);
      throw error;
    }
  }

  /**
   * Déchiffrer un message
   * @param {string} encryptedMessage - Message chiffré (base64)
   * @param {string} ivBase64 - IV (base64)
   * @param {CryptoKey} key - Clé de déchiffrement
   * @returns {Promise<string>} Message en clair
   */
  async decrypt(encryptedMessage, ivBase64, key) {
    try {
      // Convertir depuis base64
      const encryptedData = this.base64ToArrayBuffer(encryptedMessage);
      const iv = this.base64ToArrayBuffer(ivBase64);
      
      // Déchiffrer
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encryptedData
      );
      
      // Décoder le message
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Erreur déchiffrement:', error);
      throw error;
    }
  }

  /**
   * Générer et stocker une clé de conversation
   * @param {string} conversationId
   * @returns {Promise<CryptoKey>}
   */
  async getOrCreateConversationKey(conversationId) {
    try {
      // Vérifier si clé existe dans localStorage
      const storedKey = localStorage.getItem(`conv_key_${conversationId}`);
      
      if (storedKey) {
        return await this.importKey(storedKey);
      }
      
      // Générer nouvelle clé
      const key = await this.generateKey();
      const exportedKey = await this.exportKey(key);
      
      // Stocker dans localStorage
      localStorage.setItem(`conv_key_${conversationId}`, exportedKey);
      
      return key;
    } catch (error) {
      console.error('Erreur clé conversation:', error);
      throw error;
    }
  }

  /**
   * Supprimer la clé d'une conversation
   * @param {string} conversationId
   */
  deleteConversationKey(conversationId) {
    localStorage.removeItem(`conv_key_${conversationId}`);
  }

  /**
   * Vérifier si l'encryption est supportée
   * @returns {boolean}
   */
  isSupported() {
    return !!(window.crypto && window.crypto.subtle);
  }

  // Utilitaires
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;
