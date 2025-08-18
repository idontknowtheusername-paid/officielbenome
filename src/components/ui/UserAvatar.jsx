import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserAvatar = ({ 
  user, 
  size = 'default', 
  className,
  showFallbackIcon = false 
}) => {
  // Si pas d'utilisateur, afficher un avatar par défaut
  if (!user) {
    return (
      <Avatar className={cn(
        "bg-gray-200",
        size === 'sm' && "h-8 w-8",
        size === 'default' && "h-10 w-10",
        size === 'lg' && "h-12 w-12",
        size === 'xl' && "h-16 w-16",
        className
      )}>
        <AvatarFallback className="bg-gray-200 text-gray-600">
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    );
  }

  // Déterminer les initiales
  const getInitials = () => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  // Déterminer la couleur de fond basée sur le nom
  const getBackgroundColor = () => {
    const name = `${user.first_name || ''}${user.last_name || ''}`.toLowerCase();
    if (!name) return 'bg-gray-500';
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Déterminer la taille
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return "h-8 w-8";
      case 'lg':
        return "h-12 w-12";
      case 'xl':
        return "h-16 w-16";
      default:
        return "h-10 w-10";
    }
  };

  // Déterminer la taille du texte des initiales
  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return "text-xs";
      case 'lg':
        return "text-lg";
      case 'xl':
        return "text-2xl";
      default:
        return "text-sm";
    }
  };

  return (
    <Avatar className={cn(getSizeClasses(), className)}>
      {/* Image de profil si disponible */}
      {user.avatar_url && (
        <AvatarImage 
          src={user.avatar_url} 
          alt={`${user.first_name || ''} ${user.last_name || ''}`}
          onError={(e) => {
            // En cas d'erreur de chargement, masquer l'image
            e.target.style.display = 'none';
          }}
        />
      )}
      
      {/* Fallback avec initiales ou icône */}
      <AvatarFallback 
        className={cn(
          getBackgroundColor(),
          "text-white font-semibold",
          getTextSize()
        )}
      >
        {showFallbackIcon ? (
          <User className={cn(
            size === 'sm' && "h-3 w-3",
            size === 'default' && "h-4 w-4",
            size === 'lg' && "h-5 w-5",
            size === 'xl' && "h-6 w-6"
          )} />
        ) : (
          getInitials()
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
