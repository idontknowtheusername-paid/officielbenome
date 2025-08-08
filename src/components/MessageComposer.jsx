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
  Camera
} from 'lucide-react';
import { messageService } from '../services/supabase.service';

const MessageComposer = ({ 
  conversationId, 
  onMessageSent, 
  onTyping,
  disabled = false,
  placeholder = "Tapez votre message..."
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Gérer la saisie
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Notifier que l'utilisateur tape
    if (onTyping && value.length > 0) {
      onTyping(true);
    }
  };

  // Gérer l'envoi du message
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (!conversationId) return;

    setIsSending(true);
    
    try {
      // Envoyer le message texte
      if (message.trim()) {
        await messageService.sendMessage(conversationId, message.trim());
      }

      // Envoyer les pièces jointes
      for (const attachment of attachments) {
        await messageService.sendMessage(conversationId, attachment.url, 'file');
      }

      // Réinitialiser le formulaire
      setMessage('');
      setAttachments([]);
      
      // Notifier le parent
      if (onMessageSent) {
        onMessageSent();
      }

      // Notifier que l'utilisateur ne tape plus
      if (onTyping) {
        onTyping(false);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Ici vous pourriez afficher une notification d'erreur
    } finally {
      setIsSending(false);
    }
  };

  // Gérer l'envoi avec Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gérer les pièces jointes
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Fichier trop volumineux. Taille maximum : 10MB');
        return;
      }

      // Créer un objet URL pour prévisualisation
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

    // Réinitialiser l'input
    e.target.value = '';
  };

  // Supprimer une pièce jointe
  const removeAttachment = (attachmentId) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === attachmentId);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== attachmentId);
    });
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image size={16} />;
    if (type.startsWith('video/')) return <Video size={16} />;
    if (type.startsWith('audio/')) return <Mic size={16} />;
    return <File size={16} />;
  };

  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Nettoyer les URLs des objets lors du démontage
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        URL.revokeObjectURL(attachment.url);
      });
    };
  }, []);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-gray-200 bg-white/95 backdrop-blur-sm p-4"
    >
      {/* Pièces jointes */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2 border border-blue-200"
              >
                {getFileIcon(attachment.type)}
                <span className="text-sm text-gray-700 truncate max-w-32">
                  {attachment.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de saisie */}
      <div className="flex items-end space-x-2">
        {/* Boutons d'action */}
        <div className="flex items-center space-x-1">
          {/* Menu des pièces jointes */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              disabled={disabled || isSending}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Joindre un fichier"
            >
              <Paperclip size={20} />
            </motion.button>

            <AnimatePresence>
              {showAttachmentMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className="p-3 text-center hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <File size={20} className="mx-auto mb-1 text-blue-500" />
                      <span className="text-xs text-gray-600">Fichier</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Ouvrir la caméra
                        setShowAttachmentMenu(false);
                      }}
                      className="p-3 text-center hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Camera size={20} className="mx-auto mb-1 text-green-500" />
                      <span className="text-xs text-gray-600">Photo</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled || isSending}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
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
            className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white/80 backdrop-blur-sm"
            rows={1}
            maxLength={1000}
          />
          
          {/* Compteur de caractères */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: message.length > 0 ? 1 : 0 }}
            className="absolute bottom-2 right-3 text-xs text-gray-400"
          >
            {message.length}/1000
          </motion.div>
        </div>

        {/* Bouton d'envoi */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={disabled || isSending || (!message.trim() && attachments.length === 0)}
          className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          title="Envoyer le message"
        >
          {isSending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </motion.button>
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Picker d'emojis amélioré */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mt-3 p-4 bg-white rounded-xl border border-gray-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Emojis</h4>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </motion.button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {[
                '😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '👏', 
                '🙏', '😍', '🤔', '😭', '😱', '🤯', '💪', '👀',
                '😎', '🥳', '🤩', '😇', '🤗', '😴', '🤤', '😵',
                '🥺', '😤', '😡', '🤬', '😈', '👻', '🤖', '👽'
              ].map((emoji, index) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-lg transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de frappe */}
      <AnimatePresence>
        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 text-xs text-gray-500 flex items-center space-x-2"
          >
            <Loader2 size={12} className="animate-spin" />
            <span>Envoi en cours...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MessageComposer; 