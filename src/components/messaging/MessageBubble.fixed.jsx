import React, { memo, useState } from 'react';
import { UserAvatar } from '@/components/ui';
import AssistantAvatar from '@/components/messaging/AssistantAvatar';

// Composant MessageBubble CORRIGÉ - Logique simplifiée
const MessageBubble = memo(({ 
  message, 
  isOwn, 
  participant1, 
  participant2, 
  currentUserId,
  onLongPress,
  onPress,
  isSelected = false,
  isSelectionMode = false
}) => {
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Détecter si c'est un message de l'assistant
  const isAssistantMessage = message.sender_id === '00000000-0000-0000-0000-000000000000';

  const formatTime = (dateString) => {
    if (!dateString) return 'À l\'instant';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'À l\'instant';
    }
  };

  // LOGIQUE SIMPLIFIÉE : Déterminer l'expéditeur
  const getMessageSender = () => {
    if (isOwn) return null; // Pas d'avatar pour ses propres messages
    
    if (isAssistantMessage) {
      return { isAssistant: true };
    }
    
    // Pour les messages des autres utilisateurs
    if (message.sender_id === participant1?.id) {
      return participant1;
    } else if (message.sender_id === participant2?.id) {
      return participant2;
    }
    
    // Fallback si on ne trouve pas l'expéditeur
    return { 
      first_name: 'Utilisateur', 
      last_name: 'Inconnu',
      id: message.sender_id 
    };
  };

  const messageSender = getMessageSender();

  // Gestion des événements tactiles
  const handleTouchStart = () => {
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, 500); // 500ms pour l'appui long
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-2 mb-4`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* Avatar de l'expéditeur (seulement pour les messages des autres) */}
      {!isOwn && (
        messageSender?.isAssistant ? (
          <AssistantAvatar size="sm" className="flex-shrink-0 mt-1" />
        ) : (
          <UserAvatar 
            user={messageSender} 
            size="sm"
            className="flex-shrink-0 mt-1"
          />
        )
      )}
      
      <div className={`
        relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg cursor-pointer
        transition-all duration-200
        ${isOwn 
          ? 'bg-primary text-primary-foreground' 
          : isAssistantMessage
            ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 border border-blue-200'
            : 'bg-muted text-muted-foreground'
        }
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isSelectionMode ? 'hover:ring-2 hover:ring-primary/50' : ''}
      `}>
        {/* Indicateur de sélection */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-xs">✓</span>
          </div>
        )}
        
        {/* En-tête du message */}
        <div className="flex items-center space-x-2 mb-1">
          {!isOwn && isAssistantMessage && (
            <span className="text-xs font-medium text-blue-600">
              🤖 AIDA
            </span>
          )}
          {!isOwn && !isAssistantMessage && messageSender && (
            <span className="text-xs font-medium">
              {messageSender.first_name || 'Utilisateur'} {messageSender.last_name || ''}
            </span>
          )}
          <span className="text-xs opacity-70">
            {formatTime(message.created_at)}
          </span>
        </div>
        
        {/* Contenu du message */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        {/* Indicateur de lecture */}
        {isOwn && (
          <div className="flex justify-end mt-1">
            <span className="text-xs opacity-70">
              {message.is_read ? '✓✓' : '✓'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;