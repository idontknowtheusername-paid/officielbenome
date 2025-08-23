import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MapPin,
  Eye,
  Reply,
  Archive,
  Trash2,
  Star,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MessageCard = ({ 
  message, 
  onReply, 
  onArchive, 
  onDelete, 
  onMarkAsRead,
  onStar,
  showActions = true 
}) => {
      // Vérifier si c'est un message système (AIDA)
  const isSystemMessage = message.sender_id === '00000000-0000-0000-0000-000000000000' || 
                         message.message_type === 'system';

  // Si c'est un message système, afficher un style spécial
  if (isSystemMessage) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Avatar Assistant */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-lg">🤖</span>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-primary">AIDA</h3>
                <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                  Système
                </Badge>
              </div>
              
              <p className="text-card-foreground whitespace-pre-line text-sm leading-relaxed">
                {message.content}
              </p>
              
              <div className="flex items-center space-x-1 mt-2">
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(message.time || 'À l\'instant')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'inquiry':
        return '❓';
      case 'offer':
        return '💰';
      case 'question':
        return '❔';
      case 'complaint':
        return '⚠️';
      default:
        return '💬';
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'inquiry':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'question':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'complaint':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (time) => {
    // Vérifier que time existe et est une chaîne de caractères
    if (!time || typeof time !== 'string') {
      return 'À l\'instant';
    }
    
    if (time.includes('h')) {
      return time;
    }
    if (time.includes('j')) {
      return time;
    }
    return time;
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      message.unread && "bg-primary/10 border-primary/30",
              message.starred && "bg-yellow-500/10 border-yellow-500/30 dark:bg-yellow-400/10 dark:border-yellow-400/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <img
              src={message.sender?.avatar_url || message.avatar || '/default-avatar.png'}
              alt={getSenderName(message)}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            {message.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-600 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">{getSenderName(message)}</h3>
                {message.verified && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    ✓ Vérifié
                  </Badge>
                )}
                {message.type && (
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getMessageTypeColor(message.type))}
                  >
                    {getMessageTypeIcon(message.type)} {message.type}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {message.starred && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(message.time)}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {message.content || message.message || 'Aucun contenu'}
            </p>

            {/* Message Details */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                {message.listing && (
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {message.listing.title || message.listing}
                  </span>
                )}
                {message.location && (
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {message.location}
                  </span>
                )}
              </div>
              {message.unread && (
                <Badge variant="destructive" className="text-xs">
                  Nouveau
                </Badge>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onReply?.(message)}
                  className="flex-1"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Répondre
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onMarkAsRead?.(message)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Marquer lu
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStar?.(message)}
                  className="flex-1"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Étoiler
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onArchive?.(message)}
                  className="flex-1"
                >
                  <Archive className="h-3 w-3 mr-1" />
                  Archiver
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDelete?.(message)}
                  className="flex-1"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Fonction helper pour obtenir le nom de l'expéditeur
const getSenderName = (message) => {
  // Si c'est un message système (assistant)
  if (message.sender_id === '00000000-0000-0000-0000-000000000000' || 
      message.message_type === 'system') {
    return 'AIDA';
  }
  
  // Si on a les données de l'expéditeur avec first_name et last_name
  if (message.sender?.first_name && message.sender?.last_name) {
    return `${message.sender.first_name} ${message.sender.last_name}`;
  }
  
  // Si on a juste first_name
  if (message.sender?.first_name) {
    return message.sender.first_name;
  }
  
  // Fallback sur l'ancienne structure
  if (message.sender) {
    return message.sender;
  }
  
  // Dernier fallback
  return 'Utilisateur';
};

export default MessageCard; 