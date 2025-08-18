import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Play,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import AttachmentPreview from './AttachmentPreview';

const EnhancedMessageCard = ({ 
  message, 
  isOwnMessage, 
  showTimestamp = true,
  showStatus = true,
  className = ''
}) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [showFullVideo, setShowFullVideo] = useState(false);

  // Formater la date
  const formatMessageTime = (dateString) => {
    if (!dateString) {
      console.warn('EnhancedMessageCard: dateString manquant pour le message:', message.id);
      return 'À l\'instant';
    }
    
    try {
      const date = new Date(dateString);
      
      // Vérifier que la date est valide
      if (isNaN(date.getTime())) {
        console.warn('EnhancedMessageCard: date invalide:', dateString);
        return 'À l\'instant';
      }
      
      const now = new Date();
      const diffInMinutes = (now - date) / (1000 * 60);
      
      if (diffInMinutes < 1) {
        return 'À l\'instant';
      } else if (diffInMinutes < 60) {
        return `Il y a ${Math.floor(diffInMinutes)} min`;
      } else if (diffInMinutes < 1440) { // 24h
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `Il y a ${diffInHours}h`;
      } else if (diffInMinutes < 10080) { // 7 jours
        return date.toLocaleDateString('fr-FR', { 
          weekday: 'short',
          day: '2-digit',
          month: '2-digit'
        });
      } else {
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit',
          year: '2-digit'
        });
      }
    } catch (error) {
      console.error('EnhancedMessageCard: Erreur formatage date:', error, dateString);
      return 'À l\'instant';
    }
  };

  // Obtenir le statut de lecture
  const getReadStatus = () => {
    if (!showStatus || !isOwnMessage) return null;
    
    if (message.is_read) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center space-x-1 text-blue-600"
        >
          <CheckCheck size={14} />
          <span className="text-xs">Lu</span>
        </motion.div>
      );
    } else if (message.is_delivered) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center space-x-1 text-gray-500"
        >
          <CheckCheck size={14} />
          <span className="text-xs">Livré</span>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center space-x-1 text-gray-400"
        >
          <Check size={14} />
          <span className="text-xs">Envoyé</span>
        </motion.div>
      );
    }
  };

  // Déterminer le type de contenu
  const getContentType = () => {
    if (message.attachments && message.attachments.length > 0) {
      return 'with-attachments';
    }
    if (message.content_type === 'file') {
      return 'file';
    }
    return 'text';
  };

  // Rendu du contenu texte
  const renderTextContent = () => {
    if (!message.content || getContentType() !== 'text') return null;
    
    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {message.content}
      </div>
    );
  };

  // Rendu des pièces jointes
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="space-y-2 mt-2">
        {message.attachments.map((attachment, index) => (
          <div key={index} className="max-w-xs">
            <AttachmentPreview
              attachment={attachment}
              onRemove={() => {}} // Pas de suppression pour les messages reçus
              onDownload={() => {}} // Gérer le téléchargement
              showActions={false}
              className="bg-transparent border-0 p-0"
            />
          </div>
        ))}
      </div>
    );
  };

  // Rendu du fichier unique
  const renderFileContent = () => {
    if (getContentType() !== 'file') return null;
    
    // Créer un objet attachment à partir du contenu du message
    const fileAttachment = {
      id: `file-${message.id}`,
      name: message.content.split('/').pop() || 'Fichier',
      url: message.content,
      type: 'application/octet-stream',
      size: 0
    };
    
    return (
      <div className="mt-2">
        <AttachmentPreview
          attachment={fileAttachment}
          onRemove={() => {}}
          onDownload={() => {}}
          showActions={false}
          className="bg-transparent border-0 p-0"
        />
      </div>
    );
  };

  // Rendu de l'image plein écran
  const renderFullImageModal = () => {
    if (!showFullImage || !message.attachments) return null;
    
    const imageAttachment = message.attachments.find(a => a.type.startsWith('image/'));
    if (!imageAttachment) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
        onClick={() => setShowFullImage(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 z-10 h-10 w-10 p-0 bg-black bg-opacity-70 hover:bg-opacity-90 text-white"
          >
            <X size={20} />
          </Button>
          
          <img
            src={imageAttachment.url}
            alt={imageAttachment.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
            <h3 className="font-medium">{imageAttachment.name}</h3>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Rendu de la vidéo plein écran
  const renderFullVideoModal = () => {
    if (!showFullVideo || !message.attachments) return null;
    
    const videoAttachment = message.attachments.find(a => a.type.startsWith('video/'));
    if (!videoAttachment) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
        onClick={() => setShowFullVideo(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowFullVideo(false)}
            className="absolute top-4 right-4 z-10 h-10 w-10 p-0 bg-black bg-opacity-70 hover:bg-opacity-90 text-white"
          >
            <X size={20} />
          </Button>
          
          <video
            src={videoAttachment.url}
            controls
            className="max-w-full max-h-full rounded-lg"
            autoPlay
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
          
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
            <h3 className="font-medium">{videoAttachment.name}</h3>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 200
        }}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${className}`}
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
            isOwnMessage 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          {/* Contenu du message */}
          {renderTextContent()}
          {renderAttachments()}
          {renderFileContent()}

          {/* Footer du message */}
          <div className={`flex items-center justify-between mt-2 ${
            isOwnMessage ? 'text-blue-200' : 'text-gray-500'
          }`}>
            <div className="flex items-center space-x-2">
              {showTimestamp && (
                <span className="text-xs">
                  {formatMessageTime(message.created_at)}
                </span>
              )}
              {getReadStatus()}
            </div>
            
            {/* Actions rapides pour les pièces jointes */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                {message.attachments.some(a => a.type.startsWith('image/')) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFullImage(true)}
                    className={`h-6 w-6 p-0 ${
                      isOwnMessage 
                        ? 'text-blue-200 hover:bg-blue-500' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Voir en grand"
                  >
                    <Eye size={12} />
                  </Button>
                )}
                
                {message.attachments.some(a => a.type.startsWith('video/')) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFullVideo(true)}
                    className={`h-6 w-6 p-0 ${
                      isOwnMessage 
                        ? 'text-blue-200 hover:bg-blue-500' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Lire la vidéo"
                  >
                    <Play size={12} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Modals plein écran */}
      <AnimatePresence>
        {renderFullImageModal()}
        {renderFullVideoModal()}
      </AnimatePresence>
    </>
  );
};

export default EnhancedMessageCard; 