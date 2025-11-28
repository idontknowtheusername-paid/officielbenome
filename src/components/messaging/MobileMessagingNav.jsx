import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ChevronLeft, 
  Menu, 
  Search, 
  Filter, 
  MoreVertical,
  Phone,
  Video,
  User,
  Star,
  Archive,
  Trash2,
  Settings,
  Home,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

const MobileMessagingNav = ({
  selectedConversation,
  onBack,
  onMenuToggle,
  onSearch,
  onFilter,
  onMore,
  onCall,
  onVideo,
  unreadCount = 0,
  isStarred = false,
  isArchived = false
}) => {
  if (selectedConversation) {
    // Navigation dans une conversation
    return (
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 -ml-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {selectedConversation.participant1?.first_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.listing?.title || 'Conversation'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {onCall && (
            <Button variant="ghost" size="sm" onClick={onCall} className="p-2">
              <Phone className="h-4 w-4" />
            </Button>
          )}
          
          {onVideo && (
            <Button variant="ghost" size="sm" onClick={onVideo} className="p-2">
              <Video className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={onMore} className="p-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Navigation principale des messages (mobile uniquement)
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="md:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/'}
          className="p-2 -ml-2"
          title="Retour à l'accueil"
        >
          <Home className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Messages</h1>
      </div>

      <div className="flex items-center space-x-2">
        {/* Bouton de thème */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2"
          title="Changer de thème"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        
        {/* Icône de notifications avec badge */}
        <div className="relative">
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>

        {/* Menu hamburger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="p-2"
          title="Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileMessagingNav;
