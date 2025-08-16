import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image, 
  File, 
  Smile,
  X,
  Loader2,
  Mic,
  Video,
  Camera,
  MessageSquare
} from 'lucide-react';
import { messageService } from '../services';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MessageTemplates from './MessageTemplates';
import AttachmentPreview from './AttachmentPreview';

const MessageComposer = ({ 
  conversationId, 
  onMessageSent, 
  onTyping,
  disabled = false,
  placeholder = "Tapez votre message...",
  initialMessage = "",
  listingInfo = null
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState(initialMessage);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingChannelRef = useRef(null);

  // Pre-remplir le message avec des informations sur l'annonce
  useEffect(() => {
    if (listingInfo && !message.trim()) {
      const defaultMessage = `Bonjour ! Je suis intéressé(e) par votre annonce "${listingInfo.title}".\n\nPouvez-vous me donner plus d'informations ?`;
      setMessage(defaultMessage);
    }
  }, [listingInfo, message]);

  // Gérer la synchronisation temps réel de frappe
  useEffect(() => {
    if (!conversationId || !user) return;

    // Créer le canal pour la frappe
    typingChannelRef.current = supabase.channel(`typing:${conversationId}`);

    // Écouter les changements de frappe des autres utilisateurs
    typingChannelRef.current
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== user.id) {
          onTyping?.(payload.payload.isTyping);
        }
      })
      .subscribe();

    return () => {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
    };
  }, [conversationId, user, onTyping]);

  // Fonction pour envoyer l'état de frappe
  const sendTypingStatus = (isTyping) => {
    if (typingChannelRef.current && conversationId) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { 
          userId: user?.id, 
          isTyping,
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  // Gérer la saisie avec debounce pour l'indicateur de frappe
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Gérer l'indicateur de frappe avec debounce
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.length > 0) {
      if (!isTyping) {
        setIsTyping(true);
        sendTypingStatus(true);
      }
      
      // Arrêter la frappe après 2 secondes d'inactivité
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingStatus(false);
      }, 2000);
    } else {
      setIsTyping(false);
      sendTypingStatus(false);
    }
  };

  // Sélectionner un template
  const handleSelectTemplate = (templateContent) => {
    setMessage(templateContent);
    setShowTemplates(false);
    
    // Focus sur le textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(templateContent.length, templateContent.length);
    }
  };

  // Gerer l'envoi du message
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (!conversationId) return;

    setIsSending(true);
    
    // Arrêter l'indicateur de frappe immédiatement
    setIsTyping(false);
    sendTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    try {
      // Envoyer le message texte
      if (message.trim()) {
        await messageService.sendMessage(conversationId, message.trim());
      }

      // Envoyer les pieces jointes
      for (const attachment of attachments) {
        await messageService.sendMessage(conversationId, attachment.url, 'file');
      }

      // Reinitialiser le formulaire
      setMessage('');
      setAttachments([]);
      
      // Notifier le parent
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Ici vous pourriez afficher une notification d'erreur
    } finally {
      setIsSending(false);
    }
  };

  // Gerer l'envoi avec Entree
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gerer les pieces jointes
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Verifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Fichier trop volumineux. Taille maximum : 10MB');
        return;
      }

      // Creer un objet URL pour previsualisation
      const url = URL.createObjectURL(file);
      
      setAttachments(prev => [...prev, {
        id: Date.now() + Math.random(),
        file,
        url,
        name: file.name,
        type: file.type,
        size: file.size
      }]);
    });

    // Reinitialiser l'input
    e.target.value = '';
  };

  // Supprimer une piece jointe
  const removeAttachment = (attachmentId) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === attachmentId);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== attachmentId);
    });
  };

  // Télécharger une pièce jointe
  const handleDownloadAttachment = async (attachment) => {
    try {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Nettoyer les URLs des objets lors du demontage
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        URL.revokeObjectURL(attachment.url);
      });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Templates de messages */}
      <div className="mb-3">
        <MessageTemplates
          onSelectTemplate={handleSelectTemplate}
          listingInfo={listingInfo}
          className="inline-block"
        />
      </div>

      {/* Pieces jointes */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 space-y-2"
          >
            {attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                onRemove={removeAttachment}
                onDownload={handleDownloadAttachment}
                showActions={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de saisie */}
      <div className="flex items-end space-x-3">
        {/* Boutons d'action */}
        <div className="flex items-center space-x-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Joindre un fichier"
          >
            <Paperclip size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Ajouter un emoji"
          >
            <Smile size={20} />
          </motion.button>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Indicateur de frappe */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-8 left-0 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md"
            >
              Vous tapez...
            </motion.div>
          )}
        </div>

        {/* Bouton d'envoi */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={(!message.trim() && attachments.length === 0) || disabled || isSending}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          title="Envoyer le message"
        >
          {isSending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </motion.button>
      </div>

      {/* Emoji picker (placeholder pour l'instant) */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <p className="text-sm text-gray-500 text-center">
              Sélecteur d'emojis à implémenter
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageComposer; 