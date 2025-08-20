import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Clock, 
  User, 
  Eye, 
  Reply,
  Archive,
  Trash2,
  Star,
  MoreVertical,
  Home,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const ConversationCard = ({ 
  conversation, 
  onReply, 
  onArchive, 
  onDelete, 
  onMarkAsRead,
  onStar,
  showActions = true 
}) => {
  const { user: currentUser } = useAuth();

  // DEBUG: Afficher les données reçues en détail
  console.log('🔍 ConversationCard - Données reçues:', {
    id: conversation.id,
    participant1_id: conversation.participant1_id,
    participant2_id: conversation.participant2_id,
    participant1: conversation.participant1,
    participant2: conversation.participant2,
    messages: conversation.messages?.length || 0,
    currentUserId: currentUser?.id,
    // Détails des participants
    p1_details: conversation.participant1 ? {
      id: conversation.participant1.id,
      first_name: conversation.participant1.first_name,
      last_name: conversation.participant1.last_name,
      profile_image: conversation.participant1.profile_image,
      avatar_url: conversation.participant1.avatar_url
    } : null,
    p2_details: conversation.participant2 ? {
      id: conversation.participant2.id,
      first_name: conversation.participant2.first_name,
      last_name: conversation.participant2.last_name,
      profile_image: conversation.participant2.profile_image,
      avatar_url: conversation.participant2.avatar_url
    } : null
  });

  // Vérifier si c'est une conversation système (message de bienvenue)
  const isSystemConversation = conversation.id === 'welcome-message' || 
                              conversation.type === 'system' ||
                              conversation.is_system;

  // Si c'est une conversation système, afficher un style spécial
  if (isSystemConversation) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Avatar Assistant */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🤖</span>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-blue-800">Assistant MaxiMarket</h3>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  Système
                </Badge>
              </div>
              
              <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                {conversation.content || 'Bienvenue sur MaxiMarket !'}
              </p>
              
              <div className="flex items-center space-x-1 mt-2">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  À l'instant
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'À l\'instant';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInHours < 1) return 'À l\'instant';
      if (diffInHours < 24) return `Il y a ${diffInHours}h`;
      if (diffInDays < 7) return `Il y a ${diffInDays}j`;
      
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return 'À l\'instant';
    }
  };

  // Obtenir le dernier message de la conversation
  const lastMessage = conversation.messages && conversation.messages.length > 0 
    ? conversation.messages[conversation.messages.length - 1] 
    : null;

  // Déterminer l'autre participant (pas l'utilisateur actuel)
  let otherParticipant = null;
  let participantSource = 'unknown';
  
  if (currentUser && conversation.participant1 && conversation.participant2) {
    // Si l'utilisateur actuel est participant1, l'autre est participant2
    if (conversation.participant1_id === currentUser.id) {
      otherParticipant = conversation.participant2;
      participantSource = 'participant2';
    } else if (conversation.participant2_id === currentUser.id) {
      otherParticipant = conversation.participant1;
      participantSource = 'participant1';
    } else {
      // Si l'utilisateur actuel n'est ni participant1 ni participant2, 
      // c'est peut-être une conversation de l'assistant
      if (conversation.participant1_id === '00000000-0000-0000-0000-000000000000') {
        otherParticipant = conversation.participant2;
        participantSource = 'assistant_participant2';
      } else if (conversation.participant2_id === '00000000-0000-0000-0000-000000000000') {
        otherParticipant = conversation.participant1;
        participantSource = 'assistant_participant1';
      } else {
        // Fallback : prendre le premier participant
        otherParticipant = conversation.participant1;
        participantSource = 'fallback_participant1';
      }
    }
  } else if (conversation.participant1) {
    otherParticipant = conversation.participant1;
    participantSource = 'only_participant1';
  } else if (conversation.participant2) {
    otherParticipant = conversation.participant2;
    participantSource = 'only_participant2';
  }

  // DEBUG: Afficher la logique de sélection du participant
  console.log('🔍 ConversationCard - Logique de sélection du participant:', {
    conversationId: conversation.id,
    currentUserId: currentUser?.id,
    participant1_id: conversation.participant1_id,
    participant2_id: conversation.participant2_id,
    participantSource,
    otherParticipant: otherParticipant ? {
      id: otherParticipant.id,
      first_name: otherParticipant.first_name,
      last_name: otherParticipant.last_name,
      profile_image: otherParticipant.profile_image,
      avatar_url: otherParticipant.avatar_url
    } : null
  });

  // Fonction pour obtenir le nom d'affichage du participant
  const getParticipantDisplayName = (participant) => {
    if (!participant) {
      console.warn('⚠️ ConversationCard - Participant null/undefined');
      return 'Utilisateur inconnu';
    }

    // Vérifier si on a first_name et last_name
    if (participant.first_name && participant.last_name) {
      return `${participant.first_name} ${participant.last_name}`;
    }
    
    // Vérifier si on a juste first_name
    if (participant.first_name) {
      return participant.first_name;
    }
    
    // Vérifier si on a juste last_name
    if (participant.last_name) {
      return participant.last_name;
    }
    
    // Vérifier si on a un nom dans une autre propriété
    if (participant.name) {
      return participant.name;
    }
    
    // Vérifier si on a un email (utiliser la partie avant @)
    if (participant.email) {
      const emailName = participant.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    // Dernier fallback
    console.warn('⚠️ ConversationCard - Aucun nom trouvé pour le participant:', participant);
    return 'Utilisateur';
  };

  // Obtenir le nom d'affichage
  const displayName = getParticipantDisplayName(otherParticipant);
  
  // DEBUG: Afficher le nom d'affichage final
  console.log('🔍 ConversationCard - Nom d\'affichage final:', {
    conversationId: conversation.id,
    displayName,
    participant: otherParticipant
  });

  // Vérifier si la conversation a des messages non lus
  const hasUnreadMessages = conversation.messages && 
    conversation.messages.some(msg => !msg.is_read && msg.sender_id !== currentUser?.id);

  // Afficher un avertissement si les données semblent corrompues
  const showDataWarning = !otherParticipant || 
                         (!otherParticipant.first_name && !otherParticipant.last_name && !otherParticipant.name);

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      hasUnreadMessages && "bg-blue-50 border-blue-200",
      conversation.starred && "bg-yellow-50 border-yellow-200",
      showDataWarning && "bg-orange-50 border-orange-200"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <UserAvatar 
              user={otherParticipant}
              size="lg"
              className="flex-shrink-0"
            />
            {hasUnreadMessages && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Conversation Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">
                  {displayName}
                </h3>
                {showDataWarning && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Données manquantes
                  </Badge>
                )}
                {hasUnreadMessages && (
                  <Badge variant="destructive" className="text-xs">
                    Nouveau
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {conversation.starred && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(conversation.last_message_at)}
                </span>
              </div>
            </div>

            {/* Dernier message */}
            {lastMessage && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {lastMessage.content || 'Aucun contenu'}
              </p>
            )}

            {/* Détails de la conversation */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                {conversation.listing && (
                  <span className="flex items-center">
                    <Home className="h-3 w-3 mr-1" />
                    {conversation.listing.title || 'Annonce'}
                  </span>
                )}
                {conversation.messages && (
                  <span className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {conversation.messages.length} message{conversation.messages.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onReply?.(conversation)}
                  className="flex-1"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Répondre
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onMarkAsRead?.(conversation)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Marquer lu
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onArchive?.(conversation)}
                >
                  <Archive className="h-3 w-3" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStar?.(conversation)}
                >
                  <Star className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationCard;
